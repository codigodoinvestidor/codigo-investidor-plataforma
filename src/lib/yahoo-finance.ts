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

export type EventoDividendo = { data: string; valorPorCota: number };

// Histórico de proventos pagos (dividendo/JCP/rendimento, sem distinção de tipo)
// vindo do mesmo endpoint não-oficial do Yahoo — não inclui anúncios futuros,
// só o que já foi pago (nenhuma fonte gratuita expõe isso pra B3).
export async function buscarDividendosYahoo(ticker: string, range = "2y"): Promise<EventoDividendo[]> {
  try {
    const resposta = await fetch(
      `${YAHOO_BASE_URL}/${encodeURIComponent(ticker)}?range=${range}&interval=1d&events=div`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!resposta.ok) return [];

    const dados = await resposta.json();
    const eventos = dados.chart?.result?.[0]?.events?.dividends ?? {};
    return Object.values(eventos as Record<string, { date: number; amount: number }>).map((e) => ({
      data: new Date(e.date * 1000).toISOString().slice(0, 10),
      valorPorCota: e.amount,
    }));
  } catch {
    return [];
  }
}
