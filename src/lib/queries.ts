import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getLancamentos = (userId: string) =>
  unstable_cache(
    () =>
      prisma.lancamentoFinanceiro.findMany({
        where: { userId },
        orderBy: [{ anoInicio: "desc" }, { mesInicio: "desc" }],
      }),
    [`lancamentos-${userId}`],
    { revalidate: 60, tags: [`lancamentos-${userId}`] }
  )();

export const getAtivos = (userId: string) =>
  unstable_cache(
    () =>
      prisma.ativo.findMany({
        where: { userId },
        orderBy: { criadoEm: "desc" },
      }),
    [`ativos-${userId}`],
    { revalidate: 60, tags: [`ativos-${userId}`] }
  )();

export const getProventos = (userId: string) =>
  unstable_cache(
    () =>
      prisma.provento.findMany({
        where: { userId },
        orderBy: { dataPagamento: "desc" },
      }),
    [`proventos-${userId}`],
    { revalidate: 60, tags: [`proventos-${userId}`] }
  )();

export const getTickersAtivos = (userId: string) =>
  unstable_cache(
    () =>
      prisma.ativo.findMany({
        where: { userId, ticker: { not: null } },
        select: { ticker: true },
        distinct: ["ticker"],
      }),
    [`tickers-${userId}`],
    { revalidate: 60, tags: [`ativos-${userId}`] }
  )();

export const getAtivosComTicker = (userId: string) =>
  unstable_cache(
    () =>
      prisma.ativo.findMany({
        where: { userId, ticker: { not: null } },
      }),
    [`ativos-ticker-${userId}`],
    { revalidate: 60, tags: [`ativos-${userId}`] }
  )();
