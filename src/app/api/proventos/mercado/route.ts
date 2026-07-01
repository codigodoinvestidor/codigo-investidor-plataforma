import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { buscarDividendosYahoo } from "@/lib/yahoo-finance";

// Histórico de proventos pagos por ticker (fonte: Yahoo Finance, gratuito) —
// cache de 24h já que é histórico, não muda de hora em hora.
const buscarHistoricoDividendos = (tickers: string[]) =>
  unstable_cache(
    async () => {
      const resultados = await Promise.all(
        tickers.map((t) => buscarDividendosYahoo(`${t}.SA`, "1y").then((eventos) => [t, eventos] as const))
      );
      return resultados;
    },
    [`dividendos-mercado-${[...tickers].sort().join(",")}`],
    { revalidate: 86400, tags: ["dividendos-mercado"] }
  )();

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const ativos = await prisma.ativo.findMany({
    where: { userId: user.id, ticker: { not: null } },
  });
  if (ativos.length === 0) return NextResponse.json([]);

  const tickers = Array.from(new Set(ativos.map((a) => a.ticker as string)));
  const quantidadePorTicker = new Map(ativos.map((a) => [a.ticker as string, Number(a.quantidade)]));
  const nomePorTicker = new Map(ativos.map((a) => [a.ticker as string, a.nome]));

  const [historico, proventosRegistrados] = await Promise.all([
    buscarHistoricoDividendos(tickers),
    prisma.provento.findMany({ where: { userId: user.id, ticker: { in: tickers } } }),
  ]);

  // "Já registrado" = existe provento do usuário pro mesmo ticker no mesmo mês/ano —
  // datas exatas raramente batem (ex-data vs. data de pagamento), então comparamos por ciclo.
  const registrados = new Set(
    proventosRegistrados.map((p) => `${p.ticker}:${p.dataPagamento.toISOString().slice(0, 7)}`)
  );

  const eventos = historico.flatMap(([ticker, dividendos]) =>
    dividendos.map((d) => ({
      ticker,
      nome: nomePorTicker.get(ticker) ?? ticker,
      data: d.data,
      valorPorCota: d.valorPorCota,
      valorEstimado: d.valorPorCota * (quantidadePorTicker.get(ticker) ?? 0),
      jaRegistrado: registrados.has(`${ticker}:${d.data.slice(0, 7)}`),
    }))
  );

  eventos.sort((a, b) => b.data.localeCompare(a.data));

  return NextResponse.json(eventos);
}
