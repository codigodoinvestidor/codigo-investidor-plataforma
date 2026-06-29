import { TrendingUp, ShieldCheck, PieChart } from "lucide-react";

const ITENS = [
  { icone: TrendingUp, texto: "Acompanhe renda, despesas e patrimônio em um só lugar" },
  { icone: PieChart, texto: "Visualize sua alocação e seus gastos por categoria" },
  { icone: ShieldCheck, texto: "Seus dados financeiros, protegidos e só seus" },
];

export function AuthBrandingPanel() {
  return (
    <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(212,175,55,0.25), transparent 50%), radial-gradient(circle at 80% 80%, rgba(212,175,55,0.15), transparent 50%)",
        }}
      />
      <div className="relative z-10">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-dourado-claro">
          Código do Investidor
        </p>
        <h1 className="mt-6 max-w-md font-display text-4xl leading-tight text-white">
          Sua gestora de recursos pessoal, em um único painel.
        </h1>
      </div>

      <ul className="relative z-10 space-y-5">
        {ITENS.map(({ icone: Icone, texto }) => (
          <li key={texto} className="flex items-start gap-3 text-white/80">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dourado/15 text-dourado-claro">
              <Icone size={16} />
            </span>
            <span className="text-sm leading-relaxed">{texto}</span>
          </li>
        ))}
      </ul>

      <p className="relative z-10 text-xs text-white/40">
        © {new Date().getFullYear()} Código do Investidor
      </p>
    </div>
  );
}
