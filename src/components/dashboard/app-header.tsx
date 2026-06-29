import Link from "next/link";
import { LayoutDashboard, Wallet2, Landmark, Coins, LineChart } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SairButton } from "@/components/dashboard/sair-button";

const NAV = [
  { href: "/dashboard", rotulo: "Orçamento", chave: "orcamento" as const, icone: Wallet2 },
  { href: "/patrimonio", rotulo: "Patrimônio", chave: "patrimonio" as const, icone: Landmark },
  { href: "/proventos", rotulo: "Proventos", chave: "proventos" as const, icone: Coins },
  { href: "/rentabilidade", rotulo: "Rentabilidade", chave: "rentabilidade" as const, icone: LineChart },
];

export function AppHeader({
  nome,
  paginaAtiva,
}: {
  nome?: string | null;
  paginaAtiva: "orcamento" | "patrimonio" | "proventos" | "rentabilidade";
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-borda bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-dourado-claro to-dourado text-navy">
            <LayoutDashboard size={18} />
          </span>
          <div>
            <p className="font-display text-base leading-tight text-foreground">
              Código do Investidor
            </p>
            <p className="text-xs leading-tight text-foreground/50">
              {nome ? `Olá, ${nome}` : "Painel financeiro"}
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-borda p-1 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.chave}
              href={item.href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                paginaAtiva === item.chave
                  ? "bg-dourado text-navy"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SairButton />
        </div>
      </div>

      <nav className="flex items-center gap-1 border-t border-borda px-4 py-2 sm:hidden">
        {NAV.map((item) => (
          <Link
            key={item.chave}
            href={item.href}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              paginaAtiva === item.chave
                ? "bg-dourado text-navy"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <item.icone size={14} />
            {item.rotulo}
          </Link>
        ))}
      </nav>
    </header>
  );
}
