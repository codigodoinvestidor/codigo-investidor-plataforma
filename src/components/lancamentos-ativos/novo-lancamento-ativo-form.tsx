"use client";

import { useState } from "react";

type Props = { onSuccess?: () => void };

export function NovoLancamentoAtivoForm({ onSuccess }: Props) {
  const [tipo, setTipo] = useState<"COMPRA" | "VENDA">("COMPRA");
  const [ticker, setTicker] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [precoUnitario, setPrecoUnitario] = useState("");
  const [dataOperacao, setDataOperacao] = useState(new Date().toISOString().slice(0, 10));
  const [corretora, setCorretora] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const qtd = parseFloat(quantidade.replace(",", "."));
    const preco = parseFloat(precoUnitario.replace(",", "."));
    const res = await fetch("/api/lancamentos-ativos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo,
        ticker: ticker.toUpperCase(),
        quantidade: qtd,
        precoUnitario: preco,
        valorTotal: qtd * preco,
        dataOperacao,
        corretora: corretora || null,
      }),
    });
    setEnviando(false);
    if (!res.ok) { setErro("Erro ao salvar. Verifique os dados."); return; }
    setTicker(""); setQuantidade(""); setPrecoUnitario(""); setCorretora("");
    onSuccess?.();
  }

  return (
    <form onSubmit={enviar} className="card space-y-4 p-6">
      <h2 className="font-display text-lg text-foreground">Nova operação</h2>

      <div className="flex gap-2">
        {(["COMPRA", "VENDA"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tipo === t
                ? t === "COMPRA" ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/40" : "bg-red-500/20 text-red-400 ring-1 ring-red-500/40"
                : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
            }`}
          >
            {t === "COMPRA" ? "Compra" : "Venda"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-foreground/50">Ticker</label>
          <input
            value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="PETR4" required maxLength={10}
            className="input w-full uppercase"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-foreground/50">Quantidade</label>
          <input value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="100" required className="input w-full" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-foreground/50">Preço unitário (R$)</label>
          <input value={precoUnitario} onChange={(e) => setPrecoUnitario(e.target.value)} placeholder="32,50" required className="input w-full" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-foreground/50">Data</label>
          <input type="date" value={dataOperacao} onChange={(e) => setDataOperacao(e.target.value)} required className="input w-full" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-foreground/50">Corretora (opcional)</label>
          <input value={corretora} onChange={(e) => setCorretora(e.target.value)} placeholder="XP, Rico..." className="input w-full" />
        </div>
      </div>

      {quantidade && precoUnitario && (
        <p className="text-xs text-foreground/50">
          Total: <span className="font-medium text-foreground">
            {(parseFloat(quantidade.replace(",", ".")) * parseFloat(precoUnitario.replace(",", "."))).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </p>
      )}

      {erro && <p className="text-xs text-red-400">{erro}</p>}

      <button type="submit" disabled={enviando} className="btn-primary w-full">
        {enviando ? "Salvando..." : "Registrar operação"}
      </button>
    </form>
  );
}
