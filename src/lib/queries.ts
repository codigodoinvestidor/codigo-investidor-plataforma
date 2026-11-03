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

export const getMetas = (userId: string) =>
  unstable_cache(
    () => prisma.meta.findMany({ where: { userId } }),
    [`metas-${userId}`],
    { revalidate: 60, tags: [`metas-${userId}`] }
  )();

// Estatísticas agregadas para a página /admin. Sem filtro de userId de propósito:
// mostra o total cadastrado por todos os usuários da plataforma.
export const getEstatisticasAdmin = () =>
  unstable_cache(
    async () => {
      const [ativos, lancamentosFinanceiros, lancamentosAtivos, metas, proventos, acessos] =
        await Promise.all([
          prisma.ativo.count(),
          prisma.lancamentoFinanceiro.count(),
          prisma.lancamentoAtivo.count(),
          prisma.meta.count(),
          prisma.provento.count(),
          prisma.acessoLog.count(),
        ]);

      const usuariosDistintos = await prisma.ativo.findMany({
        distinct: ["userId"],
        select: { userId: true },
      });

      return {
        ativos,
        lancamentosFinanceiros,
        lancamentosAtivos,
        metas,
        proventos,
        acessos,
        usuarios: usuariosDistintos.length,
      };
    },
    ["admin-estatisticas"],
    { revalidate: 60, tags: ["admin-estatisticas"] }
  )();

export const getAcessosRecentes = () =>
  unstable_cache(
    () =>
      prisma.acessoLog.findMany({
        orderBy: { criadoEm: "desc" },
        take: 30,
      }),
    ["admin-acessos-recentes"],
    { revalidate: 60, tags: ["admin-acessos-recentes"] }
  )();
