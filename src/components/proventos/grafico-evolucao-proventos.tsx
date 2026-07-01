"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TooltipEscuro } from "@/components/tooltip-escuro";

type Ponto = { mes: string; total: number };

export function GraficoEvolucaoProventos({ dados }: { dados: Ponto[] }) {
  const temValor = dados.some((d) => d.total > 0);

  if (!temValor) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-foreground/60">
        Nenhum provento registrado ainda.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--borda)" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.6 }} />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.6 }}
          tickFormatter={(v: number) => `R$${v}`}
          width={56}
        />
        <Tooltip
          cursor={{ fill: "var(--foreground)", opacity: 0.06 }}
          content={<TooltipEscuro formatter={(v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />}
        />
        <Bar dataKey="total" name="Proventos" fill="#d4af37" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
