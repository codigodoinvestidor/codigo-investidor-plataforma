import type { LucideIcon } from "lucide-react";

type Tom = "positivo" | "negativo" | "neutro";

const TONS: Record<Tom, string> = {
  positivo: "text-emerald-500 bg-emerald-500/10",
  negativo: "text-red-500 bg-red-500/10",
  neutro: "text-dourado bg-dourado/10",
};

export function CartaoResumo({
  titulo,
  valor,
  icone: Icone,
  tom,
}: {
  titulo: string;
  valor: string;
  icone: LucideIcon;
  tom: Tom;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONS[tom]}`}>
        <Icone size={20} />
      </span>
      <div>
        <p className="text-sm text-foreground/55">{titulo}</p>
        <p className="font-display text-xl text-foreground">{valor}</p>
      </div>
    </div>
  );
}
