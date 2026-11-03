"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TooltipEscuro } from "@/components/tooltip-escuro";

type Ponto = { dia: string; total: number };

export function GraficoSerie({
  dados,
  nome,
  cor = "#d4af37",
}: {
  dados: Ponto[];
  nome: string;
  cor?: string;
}) {
  const temValor = dados.some((d) => d.total > 0);

  if (!temValor) {
    return (
      <p className="flex h-56 items-center justify-center text-sm text-foreground/60">
        Nenhum registro no período.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={224}>
      <AreaChart data={dados} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${nome}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={cor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--borda)" vertical={false} />
        <XAxis
          dataKey="dia"
          tick={{ fontSize: 11, fill: "var(--foreground)", opacity: 0.55 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--foreground)", opacity: 0.55 }}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ stroke: "var(--borda)" }}
          content={<TooltipEscuro formatter={(v) => String(v)} />}
        />
        <Area
          type="monotone"
          dataKey="total"
          name={nome}
          stroke={cor}
          strokeWidth={2}
          fill={`url(#grad-${nome})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
