"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { CartaoResumo } from "@/components/dashboard/cartao-resumo";
import { GraficoComparativo } from "@/components/rentabilidade/grafico-comparativo";
import { TabelaComparativa } from "@/components/rentabilidade/tabela-comparativa";
import { useCachedFetch } from "@/lib/use-cached-fetch";

type Ponto = { data: string; carteira: number; ibov: number | null; cdi: number; ipca: number };
type TodosPeriodos = Record<number, Ponto[]>;
type RespostaApi = { vazio: true } | { vazio: false; todos: TodosPeriodos };

const PERIODOS = [
  { label: "1M", meses: 1 },
  { label: "3M", meses: 3 },
  { label: "6M", meses: 6 },
  { label: "1A", meses: 12 },
  { label: "2A", meses: 24 },
  { label: "5A", meses: 60 },
];

function SkeletonCards() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0,1,2,3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-foreground/5" />)}
    </div>
  );
}

function SkeletonGrafico() {
  return <div className="h-72 animate-pulse rounded-xl bg-foreground/5" />;
}

async function buscarRentabilidade(): Promise<RespostaApi> {
  const res = await fetch("/api/rentabilidade");
  const json = await res.json();
  if (json.vazio) return { vazio: true };
  // API retorna chaves como strings → converte para número
  const normalizado: TodosPeriodos = {};
  for (const [k, v] of Object.entries(json)) {
    normalizado[Number(k)] = v as Ponto[];
  }
  return { vazio: false, todos: normalizado };
}

export function RentabilidadeContent({ initialData }: { initialData?: RespostaApi }) {
  const [periodo, setPeriodo] = useState(12);
  const { data: resposta, loading: carregando } = useCachedFetch("rentabilidade", buscarRentabilidade, initialData);

  const vazio = resposta?.vazio === true;
  const dados = resposta && !resposta.vazio ? resposta.todos[periodo] ?? null : null;
  const ultimoPonto = dados?.[dados.length - 1];

  const formatarPct = (v: number | null | undefined) => {
    if (v == null) return "—";
    return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
  };
  const rotuloTempo = periodo === 1 ? "1 mês" : periodo < 12 ? `${periodo} meses` : `${periodo / 12} ano${periodo > 12 ? "s" : ""}`;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Rentabilidade</h1>
          <p className="text-sm text-foreground/50">Sua carteira comparada com IBOV, CDI e IPCA.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PERIODOS.map((op) => (
            <button
              key={op.meses}
              onClick={() => setPeriodo(op.meses)}
              disabled={carregando}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                periodo === op.meses
                  ? "bg-dourado text-navy"
                  : "border border-borda text-foreground/60 hover:border-dourado hover:text-dourado disabled:opacity-40"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {vazio && (
        <div className="card p-6 text-center text-sm text-foreground/55">
          Cadastre ações, FIIs ou ETFs no Patrimônio para ver a rentabilidade comparada com índices.
        </div>
      )}

      {!vazio && (
        <>
          {carregando || !ultimoPonto ? (
            <SkeletonCards />
          ) : (
            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <CartaoResumo titulo={`Carteira (${rotuloTempo})`} valor={formatarPct(ultimoPonto.carteira)} icone={TrendingUp} tom={ultimoPonto.carteira >= 0 ? "positivo" : "negativo"} />
              <CartaoResumo titulo={`IBOV (${rotuloTempo})`} valor={formatarPct(ultimoPonto.ibov)} icone={TrendingUp} tom="neutro" />
              <CartaoResumo titulo={`CDI (${rotuloTempo})`} valor={formatarPct(ultimoPonto.cdi)} icone={TrendingUp} tom="neutro" />
              <CartaoResumo titulo={`IPCA (${rotuloTempo})`} valor={formatarPct(ultimoPonto.ipca)} icone={TrendingUp} tom="neutro" />
            </section>
          )}

          <section className="space-y-6">
            <div className="card p-6">
              <h2 className="mb-1 font-display text-lg text-foreground">Rentabilidade comparada</h2>
              <p className="mb-4 text-sm text-foreground/55">Sua carteira contra IBOV, CDI e IPCA nos últimos {rotuloTempo}.</p>
              {carregando || !dados ? <SkeletonGrafico /> : <GraficoComparativo dados={dados} />}
            </div>

            <div className="card p-6">
              <h2 className="mb-1 font-display text-lg text-foreground">Detalhamento</h2>
              <p className="mb-4 text-sm text-foreground/55">Rentabilidade acumulada por período.</p>
              {carregando || !dados ? (
                <div className="space-y-2">{[0,1,2,3,4].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-foreground/5" />)}</div>
              ) : (
                <TabelaComparativa dados={dados} />
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
