import { redirect } from "next/navigation";
import {
  ShieldCheck,
  Landmark,
  ScrollText,
  Target,
  Coins,
  Users,
  LogIn,
  History,
  GitCommitHorizontal,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import {
  getEstatisticasAdmin,
  getAcessosRecentes,
  getUsuariosAdmin,
  getModificacoesRecentes,
  getAcessosPorDia,
  getCadastrosPorDia,
} from "@/lib/queries";
import { getCommitsRecentes } from "@/lib/github";
import { GraficoSerie } from "@/components/admin/grafico-serie";
import { GraficoDistribuicao } from "@/components/admin/grafico-distribuicao";

const formatarData = (data: Date | string | null) =>
  data
    ? new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : "—";

const formatarDataCurta = (data: string) =>
  data ? new Date(data).toLocaleDateString("pt-BR", { dateStyle: "short" }) : "—";

export default async function AdminPage() {
  const user = await getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/dashboard");
  }

  const [stats, usuarios, acessos, modificacoes, commits, acessosPorDia, cadastrosPorDia] =
    await Promise.all([
      getEstatisticasAdmin(),
      getUsuariosAdmin(),
      getAcessosRecentes(),
      getModificacoesRecentes(),
      getCommitsRecentes(),
      getAcessosPorDia(),
      getCadastrosPorDia(),
    ]);

  const distribuicaoDados = [
    { nome: "Ativos", total: stats.ativos },
    { nome: "Lançamentos financeiros", total: stats.lancamentosFinanceiros },
    { nome: "Lançamentos de ativos", total: stats.lancamentosAtivos },
    { nome: "Metas", total: stats.metas },
    { nome: "Proventos", total: stats.proventos },
  ];

  const cartoes = [
    { titulo: "Usuários cadastrados", valor: stats.usuarios, icone: Users },
    { titulo: "Ativos cadastrados", valor: stats.ativos, icone: Landmark },
    { titulo: "Lançamentos financeiros", valor: stats.lancamentosFinanceiros, icone: ScrollText },
    { titulo: "Lançamentos de ativos", valor: stats.lancamentosAtivos, icone: ScrollText },
    { titulo: "Metas cadastradas", valor: stats.metas, icone: Target },
    { titulo: "Proventos registrados", valor: stats.proventos, icone: Coins },
    { titulo: "Total de acessos", valor: stats.acessos, icone: LogIn },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dourado/10 text-dourado">
          <ShieldCheck size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl text-foreground">Admin</h1>
          <p className="text-sm text-foreground/55">
            Dashboards, usuários, acessos e atividade da plataforma.
          </p>
        </div>
      </div>

      {/* Dashboard */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cartoes.map(({ titulo, valor, icone: Icone }) => (
          <div key={titulo} className="card flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dourado/10 text-dourado">
              <Icone size={20} />
            </span>
            <div>
              <p className="text-sm text-foreground/55">{titulo}</p>
              <p className="font-display text-xl text-foreground">{valor}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <h2 className="mb-1 font-display text-lg text-foreground">Acessos por dia</h2>
          <p className="mb-4 text-sm text-foreground/55">Logins registrados nos últimos 14 dias.</p>
          <GraficoSerie dados={acessosPorDia} nome="Acessos" cor="#3b82f6" />
        </section>

        <section className="card p-6">
          <h2 className="mb-1 font-display text-lg text-foreground">Distribuição de dados</h2>
          <p className="mb-4 text-sm text-foreground/55">Registros por tipo na plataforma.</p>
          <GraficoDistribuicao dados={distribuicaoDados} />
        </section>
      </div>

      <section className="card p-6">
        <h2 className="mb-1 font-display text-lg text-foreground">Novos cadastros por dia</h2>
        <p className="mb-4 text-sm text-foreground/55">Contas criadas nos últimos 30 dias.</p>
        <GraficoSerie dados={cadastrosPorDia} nome="Cadastros" cor="#d4af37" />
      </section>

      {/* Usuários */}
      <section className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-dourado" />
          <h2 className="font-display text-lg text-foreground">Usuários cadastrados</h2>
        </div>

        {usuarios.length === 0 ? (
          <p className="text-sm text-foreground/55">Nenhum usuário cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-borda text-foreground/55">
                  <th className="pb-2 font-medium">Nome</th>
                  <th className="pb-2 font-medium">E-mail</th>
                  <th className="pb-2 font-medium">Cadastrado em</th>
                  <th className="pb-2 font-medium">Último acesso</th>
                  <th className="pb-2 font-medium">Perfil</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-borda/60 last:border-0">
                    <td className="py-2 text-foreground">{u.nome ?? "—"}</td>
                    <td className="py-2 text-foreground/70">{u.email}</td>
                    <td className="py-2 text-foreground/55">{formatarData(u.criadoEm)}</td>
                    <td className="py-2 text-foreground/55">{formatarData(u.ultimoAcesso)}</td>
                    <td className="py-2">
                      {u.role === "admin" ? (
                        <span className="rounded-full bg-dourado/10 px-2.5 py-0.5 text-xs font-medium text-dourado">
                          admin
                        </span>
                      ) : (
                        <span className="text-xs text-foreground/40">usuário</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Modificações recentes */}
        <section className="card p-6">
          <div className="mb-1 flex items-center gap-2">
            <History size={18} className="text-dourado" />
            <h2 className="font-display text-lg text-foreground">Modificações recentes</h2>
          </div>
          <p className="mb-4 text-sm text-foreground/55">
            Últimos registros criados ou editados em todas as contas.
          </p>

          {modificacoes.length === 0 ? (
            <p className="text-sm text-foreground/55">Nenhuma modificação registrada ainda.</p>
          ) : (
            <ul className="flex max-h-96 flex-col gap-3 overflow-y-auto scrollbar-fina pr-1">
              {modificacoes.map((m, i) => (
                <li key={i} className="border-b border-borda/60 pb-3 text-sm last:border-0">
                  <p className="text-foreground">
                    <span className="font-medium text-dourado">{m.tipo}</span> — {m.descricao}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {m.email ?? m.userId.slice(0, 8)} · {formatarData(m.data)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Acessos recentes */}
        <section className="card p-6">
          <div className="mb-1 flex items-center gap-2">
            <LogIn size={18} className="text-dourado" />
            <h2 className="font-display text-lg text-foreground">Acessos recentes</h2>
          </div>
          <p className="mb-4 text-sm text-foreground/55">Últimos logins registrados.</p>

          {acessos.length === 0 ? (
            <p className="text-sm text-foreground/55">Nenhum acesso registrado ainda.</p>
          ) : (
            <ul className="flex max-h-96 flex-col gap-3 overflow-y-auto scrollbar-fina pr-1">
              {acessos.map((a) => (
                <li key={a.id} className="border-b border-borda/60 pb-3 text-sm last:border-0">
                  <p className="text-foreground">{a.email ?? a.userId.slice(0, 8)}</p>
                  <p className="text-xs text-foreground/50">
                    {formatarData(a.criadoEm)}
                    {a.userAgent ? ` · ${a.userAgent.slice(0, 48)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Implementações */}
      <section className="card p-6">
        <div className="mb-1 flex items-center gap-2">
          <GitCommitHorizontal size={18} className="text-dourado" />
          <h2 className="font-display text-lg text-foreground">Histórico de implementações</h2>
        </div>
        <p className="mb-4 text-sm text-foreground/55">Últimos commits enviados ao repositório.</p>

        {commits.length === 0 ? (
          <p className="text-sm text-foreground/55">
            Não foi possível carregar o histórico do GitHub agora.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {commits.map((c) => (
              <li key={c.sha} className="flex items-start justify-between gap-4 border-b border-borda/60 pb-3 text-sm last:border-0">
                <div>
                  <p className="text-foreground">{c.mensagem}</p>
                  <p className="text-xs text-foreground/50">
                    {c.autor} · {formatarDataCurta(c.data)} ·{" "}
                    <code className="text-foreground/40">{c.sha}</code>
                  </p>
                </div>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-medium text-dourado hover:underline"
                >
                  Ver
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
