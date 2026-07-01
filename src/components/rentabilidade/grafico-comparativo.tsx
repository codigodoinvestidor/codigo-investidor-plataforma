"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { TooltipEscuro } from "@/components/tooltip-escuro";

type Ponto = {
  data: string;
  carteira: number;
  ibov: number | null;
  cdi: number;
  ipca: number;
};

const LINHAS = [
  { key: "carteira", nome: "Carteira", cor: "#d4af37" },
  { key: "ibov", nome: "IBOV", cor: "#3b82f6" },
  { key: "cdi", nome: "CDI", cor: "#10b981" },
  { key: "ipca", nome: "IPCA", cor: "#ef4444" },
] as const;

export function GraficoComparativo({ dados }: { dados: Ponto[] }) {
  const [ocultas, setOcultas] = useState<Set<string>>(new Set());

  function alternar(key: string) {
    setOcultas((atual) => {
      const novo = new Set(atual);
      if (novo.has(key)) novo.delete(key); else novo.add(key);
      return novo;
    });
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dados} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--borda)" vertical={false} />
        <XAxis dataKey="data" tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.6 }} />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.6 }}
          tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          width={48}
        />
        <Tooltip content={<TooltipEscuro formatter={(v) => `${Number(v).toFixed(2)}%`} />} />
        <Legend
          onClick={(item) => item.dataKey && alternar(String(item.dataKey))}
          formatter={(value, entry) => (
            <span
              style={{
                color: "var(--foreground)",
                opacity: ocultas.has(String((entry as { dataKey?: string }).dataKey)) ? 0.35 : 0.85,
                cursor: "pointer",
                textDecoration: ocultas.has(String((entry as { dataKey?: string }).dataKey)) ? "line-through" : "none",
              }}
            >
              {value}
            </span>
          )}
          wrapperStyle={{ fontSize: 13 }}
        />
        {LINHAS.map((linha) => (
          <Line
            key={linha.key}
            type="monotone"
            dataKey={linha.key}
            name={linha.nome}
            stroke={linha.cor}
            strokeWidth={linha.key === "carteira" ? 2.5 : 2}
            dot={false}
            hide={ocultas.has(linha.key)}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
