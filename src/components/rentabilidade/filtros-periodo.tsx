"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPCOES = [
  { label: "1M", meses: 1 },
  { label: "3M", meses: 3 },
  { label: "6M", meses: 6 },
  { label: "1A", meses: 12 },
  { label: "2A", meses: 24 },
  { label: "5A", meses: 60 },
];

export function FiltrosPeriodo({ periodoAtual }: { periodoAtual: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function selecionar(meses: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", String(meses));
    router.push(`/rentabilidade?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {OPCOES.map((op) => (
        <button
          key={op.meses}
          onClick={() => selecionar(op.meses)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            periodoAtual === op.meses
              ? "bg-dourado text-navy"
              : "border border-borda text-foreground/60 hover:border-dourado hover:text-dourado"
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
