"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { TIPOS_PAGAMENTO_PROVENTO } from "@/lib/validacao-provento";
import { normalizarDecimal, apenasNumerico } from "@/lib/numero";

const HOJE = new Date().toISOString().slice(0, 10);

export function NovoProventoForm({ tickers, onSuccess }: { tickers: string[]; onSuccess?: () => void }) {
  const router = useRouter();
  const [ticker, setTicker] = useState(tickers[0] ?? "");
  const [tipoPagamento, setTipoPagamento] = useState<string>(TIPOS_PAGAMENTO_PROVENTO[0]);
  const [valorTotal, setValorTotal] = useState("");
  const [dataCom, setDataCom] = useState("");
  const [dataPagamento, setDataPagamento] = useState(HOJE);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (tickers.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="font-display text-lg text-foreground">Novo provento</h2>
        <p className="mt-2 text-sm text-foreground/55">
          Cadastre primeiro uma ação, FII ou ETF no Patrimônio para registrar proventos.
        </p>
      </div>
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch("/api/proventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker,
        tipoPagamento,
        valorTotal: normalizarDecimal(valorTotal),
        dataCom: dataCom || null,
        dataPagamento,
      }),
    });

    setEnviando(false);

    if (!resposta.ok) {
      setErro("Não foi possível salvar o provento.");
      return;
    }

    setValorTotal("");
    setDataCom("");
    if (onSuccess) onSuccess(); else router.refresh();
  }

  return (
    <form onSubmit={enviar} className="card space-y-4 p-6">
      <div>
        <h2 className="font-display text-lg text-foreground">Novo provento</h2>
        <p className="text-sm text-foreground/55">Registre um dividendo, JSCP ou rendimento.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">Ativo</label>
        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="input-base"
        >
          {tickers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">
          Tipo de pagamento
        </label>
        <select
          value={tipoPagamento}
          onChange={(e) => setTipoPagamento(e.target.value)}
          className="input-base"
        >
          {TIPOS_PAGAMENTO_PROVENTO.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">Valor total (R$)</label>
        <input
          type="text"
          inputMode="decimal"
          required
          value={valorTotal}
          onChange={(e) => setValorTotal(apenasNumerico(e.target.value))}
          className="input-base"
          placeholder="0,00"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/80">
            Data-com <span className="text-foreground/40">(opcional)</span>
          </label>
          <input
            type="date"
            value={dataCom}
            onChange={(e) => setDataCom(e.target.value)}
            className="input-base"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/80">
            Data de pagamento
          </label>
          <input
            type="date"
            required
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            className="input-base"
          />
        </div>
      </div>

      {erro && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="btn-dourado flex w-full items-center justify-center gap-2 disabled:opacity-50"
      >
        <Plus size={16} />
        {enviando ? "Salvando..." : "Adicionar provento"}
      </button>
    </form>
  );
}
