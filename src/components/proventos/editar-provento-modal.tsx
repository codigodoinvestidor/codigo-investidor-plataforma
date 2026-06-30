"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Save } from "lucide-react";
import { TIPOS_PAGAMENTO_PROVENTO } from "@/lib/validacao-provento";

export type ProventoEditavel = {
  id: string;
  ticker: string;
  tipoPagamento: string;
  valorTotal: string;
  dataCom: string | null;
  dataPagamento: string;
};

export function EditarProventoModal({
  provento,
  onFechar,
  onRefresh,
}: {
  provento: ProventoEditavel;
  onFechar: () => void;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [ticker, setTicker] = useState(provento.ticker);
  const [tipoPagamento, setTipoPagamento] = useState(provento.tipoPagamento);
  const [valorTotal, setValorTotal] = useState(provento.valorTotal);
  const [dataCom, setDataCom] = useState(provento.dataCom?.slice(0, 10) ?? "");
  const [dataPagamento, setDataPagamento] = useState(provento.dataPagamento.slice(0, 10));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch(`/api/proventos/${provento.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker,
        tipoPagamento,
        valorTotal,
        dataCom: dataCom || null,
        dataPagamento,
      }),
    });

    setEnviando(false);

    if (!resposta.ok) {
      setErro("Não foi possível salvar as alterações.");
      return;
    }

    if (onRefresh) onRefresh(); else router.refresh();
    onFechar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
      <form
        onSubmit={salvar}
        className="card relative max-h-[90vh] w-full max-w-sm overflow-y-auto p-6"
      >
        <button
          type="button"
          onClick={onFechar}
          className="absolute right-4 top-4 text-foreground/40 hover:text-foreground"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <h2 className="mb-4 font-display text-lg text-foreground">Editar provento</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/80">Ticker</label>
            <input
              type="text"
              required
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="input-base"
            />
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
                <option key={t} value={t} className="text-navy">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/80">
              Valor total (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              className="input-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                Data-com
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

          {erro && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="btn-dourado flex w-full items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {enviando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
