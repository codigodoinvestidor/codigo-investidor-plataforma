import { obterHistoricoComCache } from "@/lib/historico-precos";
import { buscarSerieBacen, SERIE_CDI, SERIE_IPCA } from "@/lib/bacen";

type AtivoParaRentabilidade = { ticker: string; quantidade: number };
type PontoSerie = { data: string; preco: number };

const TICKER_IBOV = "^BVSP";
const TOLERANCIA_DIAS_IBOV = 7;

function dataIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function diferencaDias(dataA: string, dataB: string) {
  return Math.abs(new Date(dataA).getTime() - new Date(dataB).getTime()) / 86_400_000;
}

function maisRecenteAteData(
  serie: PontoSerie[],
  dataLimite: string,
  toleranciaDias?: number
): PontoSerie | null {
  let escolhido: PontoSerie | null = null;
  for (const ponto of serie) {
    if (ponto.data <= dataLimite) {
      if (!escolhido || ponto.data > escolhido.data) escolhido = ponto;
    }
  }
  if (escolhido && toleranciaDias != null && diferencaDias(escolhido.data, dataLimite) > toleranciaDias) {
    return null;
  }
  return escolhido;
}

function rangeParaMeses(meses: number) {
  if (meses <= 1) return "1mo";
  if (meses <= 3) return "3mo";
  if (meses <= 6) return "6mo";
  if (meses <= 12) return "1y";
  if (meses <= 24) return "2y";
  return "5y";
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

export async function calcularRentabilidadeComparada(
  ativos: AtivoParaRentabilidade[],
  periodoMeses = 12
) {
  const snapshots = gerarSnapshots(periodoMeses);
  const tickersUnicos = Array.from(new Set(ativos.map((a) => a.ticker)));
  const rangeTickers = rangeParaMeses(periodoMeses);

  const historicos = new Map<string, PontoSerie[]>();
  for (const ticker of tickersUnicos) {
    historicos.set(ticker, await obterHistoricoComCache(ticker, rangeTickers, "1d"));
  }
  const historicoIbov = await obterHistoricoComCache(TICKER_IBOV, rangeTickers, "1d");

  const valoresCarteira = snapshots.map((data) => {
    const dataLimite = dataIso(data);
    return ativos.reduce((soma, a) => {
      const serie = historicos.get(a.ticker) ?? [];
      const ponto = maisRecenteAteData(serie, dataLimite);
      return soma + (ponto ? ponto.preco * a.quantidade : 0);
    }, 0);
  });

  const valoresIbov = snapshots.map((data) => {
    const ponto = maisRecenteAteData(historicoIbov, dataIso(data), TOLERANCIA_DIAS_IBOV);
    return ponto?.preco ?? null;
  });

  const baseCarteira = valoresCarteira.find((v) => v > 0) ?? 0;
  const baseIbov = valoresIbov.find((v) => v != null) ?? null;

  const rentabilidadeCarteira = valoresCarteira.map((v) =>
    baseCarteira > 0 ? (v / baseCarteira - 1) * 100 : 0
  );
  const rentabilidadeIbov = valoresIbov.map((v) =>
    baseIbov != null && v != null ? (v / baseIbov - 1) * 100 : null
  );

  const diasTotais = Math.round(
    (snapshots[snapshots.length - 1].getTime() - snapshots[0].getTime()) / 86_400_000
  );
  const cdiDiario = await buscarSerieBacen(SERIE_CDI, diasTotais + 10);
  const ipcaMensal = await buscarSerieBacen(SERIE_IPCA, periodoMeses + 2);

  const dataInicioStr = dataIso(snapshots[0]);
  const rentabilidadeCdi = snapshots.map((data) => {
    const limiteStr = dataIso(data);
    const pontosAteData = cdiDiario.filter((p) => p.data <= limiteStr && p.data >= dataInicioStr);
    const fator = pontosAteData.reduce((acc, p) => acc * (1 + p.valorPct / 100), 1);
    return (fator - 1) * 100;
  });

  const rentabilidadeIpca = snapshots.map((data) => {
    const limiteStr = dataIso(data);
    const pontosAteData = ipcaMensal.filter((p) => p.data <= limiteStr && p.data >= dataInicioStr);
    const fator = pontosAteData.reduce((acc, p) => acc * (1 + p.valorPct / 100), 1);
    return (fator - 1) * 100;
  });

  return snapshots.map((data, i) => ({
    data: data.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    carteira: rentabilidadeCarteira[i],
    ibov: rentabilidadeIbov[i],
    cdi: rentabilidadeCdi[i],
    ipca: rentabilidadeIpca[i],
  }));
}
