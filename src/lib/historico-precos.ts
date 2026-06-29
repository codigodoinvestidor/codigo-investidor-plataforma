import { prisma } from "@/lib/prisma";
import { buscarHistoricoTicker, type PontoHistorico } from "@/lib/brapi";
import { buscarHistoricoIndiceYahoo } from "@/lib/yahoo-finance";

const CACHE_VALIDO_MS = 6 * 60 * 60 * 1000; // séries diárias não precisam atualizar com frequência

// Índices (^BVSP etc.) usam o Yahoo Finance, que não tem o limite de 3 meses
// que a brapi.dev impõe no plano gratuito. Tickers normais continuam na brapi.dev.
function ehIndice(ticker: string) {
  return ticker.startsWith("^");
}

export async function obterHistoricoComCache(
  ticker: string,
  range: string,
  interval: string
): Promise<PontoHistorico[]> {
  const chave = `${ticker}:${range}:${interval}`;

  const emCache = await prisma.historicoSerie.findUnique({ where: { chave } });
  const agora = Date.now();

  if (emCache && agora - emCache.atualizadoEm.getTime() < CACHE_VALIDO_MS) {
    return emCache.dados as PontoHistorico[];
  }

  const dados = ehIndice(ticker)
    ? await buscarHistoricoIndiceYahoo(ticker, range, interval)
    : await buscarHistoricoTicker(ticker, range, interval);

  if (dados.length === 0) {
    return (emCache?.dados as PontoHistorico[]) ?? [];
  }

  await prisma.historicoSerie.upsert({
    where: { chave },
    create: { chave, dados },
    update: { dados },
  });

  return dados;
}
