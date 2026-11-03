import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
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

// ===== Painel /admin =====
// auth.users pertence ao schema interno do Supabase e não está no schema.prisma
// (userId nas outras tabelas é só uma referência solta, sem FK gerenciada pelo
// Prisma). Por isso as consultas de usuário usam $queryRaw.

export type UsuarioAdmin = {
  id: string;
  email: string;
  nome: string | null;
  criadoEm: Date;
  ultimoAcesso: Date | null;
  role: string | null;
};

export const getUsuariosAdmin = () =>
  unstable_cache(
    () =>
      prisma.$queryRaw<UsuarioAdmin[]>`
        select
          id,
          email,
          raw_user_meta_data ->> 'nome' as "nome",
          created_at as "criadoEm",
          last_sign_in_at as "ultimoAcesso",
          raw_app_meta_data ->> 'role' as "role"
        from auth.users
        order by created_at desc
      `,
    ["admin-usuarios"],
    { revalidate: 30, tags: ["admin-usuarios"] }
  )();

// Estatísticas agregadas para a página /admin. Sem filtro de userId de propósito:
// mostra o total cadastrado por todos os usuários da plataforma.
export const getEstatisticasAdmin = () =>
  unstable_cache(
    async () => {
      const [ativos, lancamentosFinanceiros, lancamentosAtivos, metas, proventos, acessos, usuarios] =
        await Promise.all([
          prisma.ativo.count(),
          prisma.lancamentoFinanceiro.count(),
          prisma.lancamentoAtivo.count(),
          prisma.meta.count(),
          prisma.provento.count(),
          prisma.acessoLog.count(),
          prisma.$queryRaw<[{ total: bigint }]>`select count(*)::bigint as total from auth.users`,
        ]);

      return {
        ativos,
        lancamentosFinanceiros,
        lancamentosAtivos,
        metas,
        proventos,
        acessos,
        usuarios: Number(usuarios[0]?.total ?? 0),
      };
    },
    ["admin-estatisticas"],
    { revalidate: 60, tags: ["admin-estatisticas"] }
  )();

export type AcessoAdmin = {
  id: string;
  userId: string;
  email: string | null;
  criadoEm: Date;
  userAgent: string | null;
};

export const getAcessosRecentes = (limite = 30) =>
  unstable_cache(
    () =>
      prisma.$queryRaw<AcessoAdmin[]>`
        select a.id, a."userId", u.email, a."criadoEm", a."userAgent"
        from acessos_log a
        left join auth.users u on u.id::text = a."userId"
        order by a."criadoEm" desc
        limit ${limite}
      `,
    [`admin-acessos-recentes-${limite}`],
    { revalidate: 30, tags: ["admin-acessos-recentes"] }
  )();

export type ModificacaoAdmin = {
  tipo: "Ativo" | "Lançamento financeiro" | "Lançamento de ativo" | "Meta" | "Provento";
  descricao: string;
  userId: string;
  email: string | null;
  data: Date;
};

// "Modificações recentes": une os registros mais recentemente criados/editados
// (criadoEm = atualizadoEm → criação; diferentes → edição) em todas as tabelas
// de dados do usuário, já que ainda não existe uma tabela de auditoria dedicada.
export const getModificacoesRecentes = (limite = 30) =>
  unstable_cache(
    async () => {
      const [ativos, lancamentos, lancamentosAtivos, metas, proventos] = await Promise.all([
        prisma.ativo.findMany({ orderBy: { atualizadoEm: "desc" }, take: limite }),
        prisma.lancamentoFinanceiro.findMany({ orderBy: { atualizadoEm: "desc" }, take: limite }),
        prisma.lancamentoAtivo.findMany({ orderBy: { atualizadoEm: "desc" }, take: limite }),
        prisma.meta.findMany({ orderBy: { atualizadoEm: "desc" }, take: limite }),
        prisma.provento.findMany({ orderBy: { atualizadoEm: "desc" }, take: limite }),
      ]);

      const userIds = Array.from(
        new Set([...ativos, ...lancamentos, ...lancamentosAtivos, ...metas, ...proventos].map((r) => r.userId))
      );
      const emailsPorId = userIds.length
        ? await prisma.$queryRaw<{ id: string; email: string }[]>`
            select id::text as id, email from auth.users where id::text in (${Prisma.join(userIds)})
          `
        : [];
      const emailDe = (userId: string) => emailsPorId.find((u) => u.id === userId)?.email ?? null;

      const itens: ModificacaoAdmin[] = [
        ...ativos.map((a) => ({
          tipo: "Ativo" as const,
          descricao: a.nome,
          userId: a.userId,
          email: emailDe(a.userId),
          data: a.atualizadoEm,
        })),
        ...lancamentos.map((l) => ({
          tipo: "Lançamento financeiro" as const,
          descricao: l.descricao,
          userId: l.userId,
          email: emailDe(l.userId),
          data: l.atualizadoEm,
        })),
        ...lancamentosAtivos.map((l) => ({
          tipo: "Lançamento de ativo" as const,
          descricao: l.nome ?? l.ticker ?? "—",
          userId: l.userId,
          email: emailDe(l.userId),
          data: l.atualizadoEm,
        })),
        ...metas.map((m) => ({
          tipo: "Meta" as const,
          descricao: m.nome ?? m.tipo,
          userId: m.userId,
          email: emailDe(m.userId),
          data: m.atualizadoEm,
        })),
        ...proventos.map((p) => ({
          tipo: "Provento" as const,
          descricao: p.ticker,
          userId: p.userId,
          email: emailDe(p.userId),
          data: p.atualizadoEm,
        })),
      ];

      return itens.sort((a, b) => b.data.getTime() - a.data.getTime()).slice(0, limite);
    },
    [`admin-modificacoes-${limite}`],
    { revalidate: 30, tags: ["admin-modificacoes"] }
  )();

export type PontoSerie = { dia: string; total: number };

export const getAcessosPorDia = (dias = 14) =>
  unstable_cache(
    () =>
      prisma.$queryRaw<PontoSerie[]>`
        select to_char(d.dia, 'DD/MM') as dia, count(a.id)::int as total
        from generate_series(
          (current_date - make_interval(days => ${dias - 1}::int))::timestamp,
          current_date::timestamp,
          interval '1 day'
        ) as d(dia)
        left join acessos_log a on a."criadoEm"::date = d.dia::date
        group by d.dia
        order by d.dia
      `,
    [`admin-acessos-dia-${dias}`],
    { revalidate: 60, tags: ["admin-acessos-recentes"] }
  )();

export const getCadastrosPorDia = (dias = 30) =>
  unstable_cache(
    () =>
      prisma.$queryRaw<PontoSerie[]>`
        select to_char(d.dia, 'DD/MM') as dia, count(u.id)::int as total
        from generate_series(
          (current_date - make_interval(days => ${dias - 1}::int))::timestamp,
          current_date::timestamp,
          interval '1 day'
        ) as d(dia)
        left join auth.users u on u.created_at::date = d.dia::date
        group by d.dia
        order by d.dia
      `,
    [`admin-cadastros-dia-${dias}`],
    { revalidate: 60, tags: ["admin-usuarios"] }
  )();
