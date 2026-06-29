import type { PontoHistorico } from "@/lib/brapi";

const YAHOO_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

// API não-oficial do Yahoo Finance, gratuita e sem token — usada só para o
// histórico de índices (IBOV), já que a brapi.dev gratuita limita isso a 3 meses.
export async function buscarHistoricoIndiceYahoo(
  simbolo: string,
  range: string,
  interval: string
): Promise<PontoHistorico[]> {
  try {
    const resposta = await fetch(
      `${YAHOO_BASE_URL}/${encodeURIComponent(simbolo)}?range=${range}&interval=${interval}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!resposta.ok) return [];

    const dados = await resposta.json();
    const resultado = dados.chart?.result?.[0];
    const timestamps: number[] = resultado?.timestamp ?? [];
    const fechamentos: (number | null)[] = resultado?.indicators?.quote?.[0]?.close ?? [];

    return timestamps
      .map((ts, i) => ({ data: new Date(ts * 1000).toISOString().slice(0, 10), preco: fechamentos[i] }))
      .filter((p): p is PontoHistorico => p.preco != null);
  } catch {
    return [];
  }
}
