import { prisma } from "@/lib/prisma";
import type { PontoHistorico } from "@/lib/brapi";
import { buscarHistoricoIndiceYahoo } from "@/lib/yahoo-finance";

const CACHE_VALIDO_MS = 6 * 60 * 60 * 1000; // séries diárias não precisam atualizar com frequência

// A brapi.dev no plano gratuito só libera 5 anos de histórico para um punhado
// de blue chips (PETR4, VALE3...) — qualquer outro ticker (FIIs, ações menores)
// cai pra range máximo de 3 meses. O Yahoo Finance serve qualquer papel da B3
// com sufixo .SA, sem essa limitação, então usamos ele pra todos os tickers.
function simboloYahoo(ticker: string) {
  return ticker.startsWith("^") ? ticker : `${ticker}.SA`;
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

  const dados = await buscarHistoricoIndiceYahoo(simboloYahoo(ticker), range, interval);

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
