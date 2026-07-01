"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Banknote } from "lucide-react";
import { apenasNumerico } from "@/lib/numero";

export type AtivoParaVenda = {
  id: string;
  ticker: string | null;
  nome: string;
  quantidade: number;
  precoAtual: number;
};

const HOJE = new Date().toISOString().slice(0, 10);

export function VenderAtivoModal({
  ativo,
  onFechar,
  onRefresh,
}: {
  ativo: AtivoParaVenda;
  onFechar: () => void;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [quantidade, setQuantidade] = useState(String(ativo.quantidade));
  const [precoUnitario, setPrecoUnitario] = useState(String(ativo.precoAtual));
  const [dataOperacao, setDataOperacao] = useState(HOJE);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const qtdNum = parseFloat(quantidade.replace(",", "."));
  const precoNum = parseFloat(precoUnitario.replace(",", "."));
  const total = !isNaN(qtdNum) && !isNaN(precoNum) ? qtdNum * precoNum : 0;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (qtdNum > ativo.quantidade) {
      setErro(`Quantidade maior que a possuída (${ativo.quantidade}).`);
      return;
    }

    setEnviando(true);
    const resposta = await fetch(`/api/ativos/${ativo.id}/vender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade: qtdNum, precoUnitario: precoNum, dataOperacao }),
    });
    setEnviando(false);

    if (!resposta.ok) {
      setErro("Não foi possível registrar a venda. Confira os campos.");
      return;
    }

    if (onRefresh) onRefresh(); else router.refresh();
    onFechar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
      <form onSubmit={enviar} className="card relative w-full max-w-sm p-6">
        <button
          type="button"
          onClick={onFechar}
          className="absolute right-4 top-4 text-foreground/40 hover:text-foreground"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <h2 className="mb-1 font-display text-lg text-foreground">Vender / retirar ativo</h2>
        <p className="mb-4 text-sm text-foreground/55">{ativo.ticker ?? ativo.nome}</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                Quantidade
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={quantidade}
                onChange={(e) => setQuantidade(apenasNumerico(e.target.value))}
                className="input-base"
              />
              <p className="mt-1 text-xs text-foreground/40">Possui {ativo.quantidade.toLocaleString("pt-BR")}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                Preço unit. (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={precoUnitario}
                onChange={(e) => setPrecoUnitario(apenasNumerico(e.target.value))}
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/80">
              Data da venda
            </label>
            <input
              type="date"
              required
              value={dataOperacao}
              onChange={(e) => setDataOperacao(e.target.value)}
              className="input-base"
            />
          </div>

          {total > 0 && (
            <p className="text-sm text-foreground/60">
              Total: <span className="font-medium text-foreground">
                {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              {qtdNum < ativo.quantidade && " · posição parcial"}
            </p>
          )}

          {erro && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="btn-dourado flex w-full items-center justify-center gap-2 disabled:opacity-50"
          >
            <Banknote size={16} />
            {enviando ? "Registrando..." : "Confirmar venda"}
          </button>
        </div>
      </form>
    </div>
  );
}
