"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";

type EventoMercado = {
  ticker: string;
  nome: string;
  data: string;
  valorPorCota: number;
  valorEstimado: number;
  jaRegistrado: boolean;
};

const formatarMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ProventosMercado({ onRegistrado }: { onRegistrado?: () => void }) {
  const { data: eventos, loading } = useCachedFetch<EventoMercado[]>(
    "proventos-mercado",
    async () => { const r = await fetch("/api/proventos/mercado"); return r.json(); }
  );
  const [registrando, setRegistrando] = useState<string | null>(null);
  const [confirmados, setConfirmados] = useState<Set<string>>(new Set());

  if (loading || !eventos) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-foreground/5" />)}
      </div>
    );
  }

  const naoRegistrados = eventos.filter((e) => !e.jaRegistrado && !confirmados.has(`${e.ticker}:${e.data}`));

  if (naoRegistrados.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-foreground/50">
        Nenhum provento pendente encontrado no histórico de mercado dos últimos 12 meses.
      </p>
    );
  }

  async function registrar(e: EventoMercado) {
    const chave = `${e.ticker}:${e.data}`;
    setRegistrando(chave);
    const resposta = await fetch("/api/proventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker: e.ticker,
        tipoPagamento: "Dividendos",
        valorTotal: e.valorEstimado.toFixed(2),
        dataPagamento: e.data,
      }),
    });
    setRegistrando(null);
    if (resposta.ok) {
      setConfirmados((atual) => new Set(atual).add(chave));
      onRegistrado?.();
    }
  }

  return (
    <div className="space-y-2">
      <p className="mb-2 text-xs text-foreground/45">
        Histórico de pagamentos de mercado (fonte: Yahoo Finance) que não batem com nenhum provento
        seu no mesmo mês — confira o valor estimado (cotas atuais × valor/cota) antes de registrar.
      </p>
      {naoRegistrados.map((e) => {
        const chave = `${e.ticker}:${e.data}`;
        return (
          <div
            key={chave}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borda bg-foreground/3 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-foreground">{e.ticker}</span>
              <span className="text-xs text-foreground/50">{new Date(e.data).toLocaleDateString("pt-BR")}</span>
              <span className="text-xs text-foreground/40">R$ {e.valorPorCota.toFixed(4)}/cota</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-dourado">{formatarMoeda(e.valorEstimado)}</span>
              <button
                onClick={() => registrar(e)}
                disabled={registrando === chave}
                className="flex items-center gap-1.5 rounded-full bg-dourado/10 px-3 py-1 text-xs font-medium text-dourado hover:bg-dourado/20 disabled:opacity-50"
              >
                {registrando === chave ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Registrar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
