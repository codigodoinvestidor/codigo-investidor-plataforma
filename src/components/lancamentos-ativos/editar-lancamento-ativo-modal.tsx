"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { LancamentoAtivoItem } from "./lista-lancamentos-ativos";

type Props = { lancamento: LancamentoAtivoItem; onFechar: () => void; onRefresh?: () => void };

export function EditarLancamentoAtivoModal({ lancamento, onFechar, onRefresh }: Props) {
  const [tipo, setTipo] = useState<"COMPRA" | "VENDA">(lancamento.tipo);
  const [ticker, setTicker] = useState(lancamento.ticker);
  const [quantidade, setQuantidade] = useState(lancamento.quantidade);
  const [precoUnitario, setPrecoUnitario] = useState(lancamento.precoUnitario);
  const [dataOperacao, setDataOperacao] = useState(lancamento.dataOperacao.slice(0, 10));
  const [corretora, setCorretora] = useState(lancamento.corretora ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setEnviando(true);
    const qtd = parseFloat(String(quantidade).replace(",", "."));
    const preco = parseFloat(String(precoUnitario).replace(",", "."));
    const res = await fetch(`/api/lancamentos-ativos/${lancamento.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo, ticker: ticker.toUpperCase(), quantidade: qtd,
        precoUnitario: preco, valorTotal: qtd * preco,
        dataOperacao, corretora: corretora || null,
      }),
    });
    setEnviando(false);
    if (!res.ok) { setErro("Erro ao salvar."); return; }
    onRefresh?.();
    onFechar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-borda bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">Editar operação</h2>
          <button onClick={onFechar} className="text-foreground/40 hover:text-foreground"><X size={20} /></button>
        </div>

        <form onSubmit={enviar} className="space-y-4">
          <div className="flex gap-2">
            {(["COMPRA", "VENDA"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTipo(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  tipo === t
                    ? t === "COMPRA" ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/40" : "bg-red-500/20 text-red-400 ring-1 ring-red-500/40"
                    : "bg-foreground/5 text-foreground/50"
                }`}>
                {t === "COMPRA" ? "Compra" : "Venda"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-foreground/50">Ticker</label>
              <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} required className="input w-full uppercase" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-foreground/50">Quantidade</label>
              <input value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required className="input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-foreground/50">Preço unitário (R$)</label>
              <input value={precoUnitario} onChange={(e) => setPrecoUnitario(e.target.value)} required className="input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-foreground/50">Data</label>
              <input type="date" value={dataOperacao} onChange={(e) => setDataOperacao(e.target.value)} required className="input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-foreground/50">Corretora</label>
              <input value={corretora} onChange={(e) => setCorretora(e.target.value)} className="input w-full" />
            </div>
          </div>

          {erro && <p className="text-xs text-red-400">{erro}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onFechar} className="flex-1 rounded-lg border border-borda py-2 text-sm text-foreground/60 hover:bg-foreground/5">Cancelar</button>
            <button type="submit" disabled={enviando} className="btn-primary flex-1">{enviando ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
