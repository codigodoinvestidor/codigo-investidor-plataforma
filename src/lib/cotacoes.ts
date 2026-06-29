import { prisma } from "@/lib/prisma";
import { buscarCotacoes } from "@/lib/brapi";

const CACHE_VALIDO_MS = 15 * 60 * 1000;

export async function atualizarCotacoesDesatualizadas() {
  const ativos = await prisma.ativo.findMany({
    where: { ticker: { not: null } },
    select: { ticker: true },
    distinct: ["ticker"],
  });

  const tickers = ativos.map((a) => a.ticker).filter((t): t is string => Boolean(t));
  if (tickers.length === 0) return;

  const cacheExistente = await prisma.cotacaoAtivo.findMany({
    where: { ticker: { in: tickers } },
  });

  const agora = Date.now();
  const desatualizados = tickers.filter((ticker) => {
    const emCache = cacheExistente.find((c) => c.ticker === ticker);
    if (!emCache) return true;
    return agora - emCache.atualizadoEm.getTime() > CACHE_VALIDO_MS;
  });

  if (desatualizados.length === 0) return;

  try {
    const cotacoes = await buscarCotacoes(desatualizados);
    await Promise.all(
      cotacoes.map((c) =>
        prisma.cotacaoAtivo.upsert({
          where: { ticker: c.symbol },
          create: {
            ticker: c.symbol,
            preco: c.regularMarketPrice,
            variacaoDia: c.regularMarketChangePercent,
          },
          update: {
            preco: c.regularMarketPrice,
            variacaoDia: c.regularMarketChangePercent,
          },
        })
      )
    );
  } catch (erro) {
    console.error("Falha ao atualizar cotações:", erro);
  }
}

export type CotacaoCache = { preco: number; variacaoDia: number | null };

export async function obterCotacoesEmCache(tickers: string[]) {
  if (tickers.length === 0) return new Map<string, CotacaoCache>();

  const registros = await prisma.cotacaoAtivo.findMany({
    where: { ticker: { in: tickers } },
  });

  return new Map(
    registros.map((r) => [
      r.ticker,
      { preco: Number(r.preco), variacaoDia: r.variacaoDia ? Number(r.variacaoDia) : null },
    ])
  );
}
