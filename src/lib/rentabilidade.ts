import { unstable_cache } from "next/cache";
import { obterHistoricoComCache } from "@/lib/historico-precos";
import { buscarCdi, buscarIpca } from "@/lib/bacen";

type AtivoParaRentabilidade = { ticker: string; quantidade: number };
type PontoSerie = { data: string; preco: number };
export type PontoRentabilidade = { data: string; carteira: number; ibov: number | null; cdi: number; ipca: number };
export type TodosPeriodos = Record<number, PontoRentabilidade[]>;

const TICKER_IBOV = "^BVSP";
const TOLERANCIA_DIAS_IBOV = 7;
const RANGE_MAXIMO = "5y";
const PERIODOS = [1, 3, 6, 12, 24, 60];

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

function calcularPeriodo(
  ativos: AtivoParaRentabilidade[],
  historicos: Map<string, PontoSerie[]>,
  historicoIbov: PontoSerie[],
  cdiDiario: { data: string; valorPct: number }[],
  ipcaMensal: { data: string; valorPct: number }[],
  periodoMeses: number
): PontoRentabilidade[] {
  const snapshots = gerarSnapshots(periodoMeses);

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

async function _calcularTodos(ativos: AtivoParaRentabilidade[]): Promise<TodosPeriodos> {
  const tickersUnicos = Array.from(new Set(ativos.map((a) => a.ticker)));

  // Uma única chamada para todos os dados externos
  const [resultadosTickers, historicoIbov, cdiDiario, ipcaMensal] = await Promise.all([
    Promise.all(tickersUnicos.map((t) =>
      obterHistoricoComCache(t, RANGE_MAXIMO, "1d").then((h) => [t, h] as const)
    )),
    obterHistoricoComCache(TICKER_IBOV, RANGE_MAXIMO, "1d"),
    buscarCdi(),
    buscarIpca(),
  ]);
  const historicos = new Map<string, PontoSerie[]>(resultadosTickers);

  // Calcula todos os períodos com os dados já em memória (sem I/O adicional)
  const resultado: TodosPeriodos = {};
  for (const meses of PERIODOS) {
    resultado[meses] = calcularPeriodo(ativos, historicos, historicoIbov, cdiDiario, ipcaMensal, meses);
  }
  return resultado;
}

// Cache 1h por conjunto de ativos — todos os períodos num único cache entry
export function calcularTodosPeriodos(ativos: AtivoParaRentabilidade[]) {
  const chave = ativos.map((a) => `${a.ticker}:${a.quantidade}`).sort().join(",");
  return unstable_cache(
    () => _calcularTodos(ativos),
    [`rentabilidade-todos-v2-${chave}`],
    { revalidate: 3600, tags: ["rentabilidade"] }
  )();
}
