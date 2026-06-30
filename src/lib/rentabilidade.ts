import { unstable_cache } from "next/cache";
import { obterHistoricoComCache } from "@/lib/historico-precos";
import { buscarCdi, buscarIpca } from "@/lib/bacen";

type AtivoParaRentabilidade = { ticker: string; quantidade: number };
type PontoSerie = { data: string; preco: number };

const TICKER_IBOV = "^BVSP";
const TOLERANCIA_DIAS_IBOV = 7;
// Sempre busca 5y — um único cache por ticker, todos os períodos reusam
const RANGE_MAXIMO = "5y";

function dataIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function diferencaDias(dataA: string, dataB: string) {
  return Math.abs(new Date(dataA).getTime() - new Date(dataB).getTime()) / 86_400_000;
}

function maisRecenteAteData(serie: PontoSerie[], dataLimite: string, toleranciaDias?: number): PontoSerie | null {
  let escolhido: PontoSerie | null = null;
  for (const ponto of serie) {
    if (ponto.data <= dataLimite) {
      if (!escolhido || ponto.data > escolhido.data) escolhido = ponto;
    }
  }
  if (escolhido && toleranciaDias != null && diferencaDias(escolhido.data, dataLimite) > toleranciaDias) return null;
  return escolhido;
}

function gerarSnapshots(meses: number): Date[] {
  const hoje = new Date();
  const pontos = Math.min(meses, 12);
  const passo = meses / pontos;
  return Array.from({ length: pontos + 1 }, (_, i) => {
    const mesesAtras = meses - Math.round(i * passo);
    return new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, hoje.getDate());
  });
}

async function _calcular(ativos: AtivoParaRentabilidade[], periodoMeses: number) {
  const snapshots = gerarSnapshots(periodoMeses);
  const tickersUnicos = Array.from(new Set(ativos.map((a) => a.ticker)));

  // Todos os históricos em paralelo, sempre range 5y (um cache por ticker)
  const [resultadosTickers, historicoIbov, cdiDiario, ipcaMensal] = await Promise.all([
    Promise.all(tickersUnicos.map((t) =>
      obterHistoricoComCache(t, RANGE_MAXIMO, "1d").then((h) => [t, h] as const)
    )),
    obterHistoricoComCache(TICKER_IBOV, RANGE_MAXIMO, "1d"),
    buscarCdi(),
    buscarIpca(),
  ]);
  const historicos = new Map<string, PontoSerie[]>(resultadosTickers);

  const valoresCarteira = snapshots.map((data) => {
    const dataLimite = dataIso(data);
    return ativos.reduce((soma, a) => {
      const ponto = maisRecenteAteData(historicos.get(a.ticker) ?? [], dataLimite);
      return soma + (ponto ? ponto.preco * a.quantidade : 0);
    }, 0);
  });

  const valoresIbov = snapshots.map((data) =>
    maisRecenteAteData(historicoIbov, dataIso(data), TOLERANCIA_DIAS_IBOV)?.preco ?? null
  );

  const baseCarteira = valoresCarteira.find((v) => v > 0) ?? 0;
  const baseIbov = valoresIbov.find((v) => v != null) ?? null;

  const dataInicioStr = dataIso(snapshots[0]);

  return snapshots.map((data, i) => {
    const limiteStr = dataIso(data);
    const v = valoresCarteira[i];
    const ibovV = valoresIbov[i];

    const cdiPontos = cdiDiario.filter((p) => p.data >= dataInicioStr && p.data <= limiteStr);
    const cdi = (cdiPontos.reduce((acc, p) => acc * (1 + p.valorPct / 100), 1) - 1) * 100;

    const ipcaPontos = ipcaMensal.filter((p) => p.data >= dataInicioStr && p.data <= limiteStr);
    const ipca = (ipcaPontos.reduce((acc, p) => acc * (1 + p.valorPct / 100), 1) - 1) * 100;

    return {
      data: data.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      carteira: baseCarteira > 0 ? (v / baseCarteira - 1) * 100 : 0,
      ibov: baseIbov != null && ibovV != null ? (ibovV / baseIbov - 1) * 100 : null,
      cdi,
      ipca,
    };
  });
}

// Cache por 1h por (userId+tickers+periodo) — troca de período é instantânea após primeira carga
export function calcularRentabilidadeComparada(
  ativos: AtivoParaRentabilidade[],
  periodoMeses = 12
) {
  const chave = ativos.map((a) => `${a.ticker}:${a.quantidade}`).sort().join(",");
  return unstable_cache(
    () => _calcular(ativos, periodoMeses),
    [`rentabilidade-${chave}-${periodoMeses}`],
    { revalidate: 3600, tags: ["rentabilidade"] }
  )();
}
