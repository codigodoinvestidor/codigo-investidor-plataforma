import { redirect } from "next/navigation";
import { ShieldCheck, Landmark, ScrollText, Target, Coins, Users, LogIn } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getEstatisticasAdmin, getAcessosRecentes } from "@/lib/queries";

const formatarData = (data: Date) =>
  new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export default async function AdminPage() {
  const user = await getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/dashboard");
  }

  const [stats, acessos] = await Promise.all([getEstatisticasAdmin(), getAcessosRecentes()]);

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
            Estatísticas de uso e dados cadastrados na plataforma.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg text-foreground">Acessos recentes</h2>
        <p className="mb-4 text-sm text-foreground/55">Últimos 30 logins registrados.</p>

        {acessos.length === 0 ? (
          <p className="text-sm text-foreground/55">Nenhum acesso registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-borda text-foreground/55">
                  <th className="pb-2 font-medium">Data</th>
                  <th className="pb-2 font-medium">Usuário</th>
                  <th className="pb-2 font-medium">Dispositivo</th>
                </tr>
              </thead>
              <tbody>
                {acessos.map((acesso) => (
                  <tr key={acesso.id} className="border-b border-borda/60 last:border-0">
                    <td className="py-2 text-foreground">{formatarData(acesso.criadoEm)}</td>
                    <td className="py-2 text-foreground/70">{acesso.userId.slice(0, 8)}…</td>
                    <td className="max-w-xs truncate py-2 text-foreground/55">
                      {acesso.userAgent ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
