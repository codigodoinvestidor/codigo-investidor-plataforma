"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Save, Loader2 } from "lucide-react";
import { TIPOS_ATIVO, tipoExigeTicker, type TipoAtivo } from "@/lib/ativos";

export type AtivoEditavel = {
  id: string;
  tipo: TipoAtivo;
  ticker: string | null;
  nome: string;
  quantidade: string;
  valorCompraUnitario: string;
  dataCompra: string;
  percentualIdeal: string | null;
};

export function EditarAtivoModal({
  ativo,
  onFechar,
}: {
  ativo: AtivoEditavel;
  onFechar: () => void;
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoAtivo>(ativo.tipo);
  const [ticker, setTicker] = useState(ativo.ticker ?? "");
  const [nome, setNome] = useState(ativo.nome);
  const [quantidade, setQuantidade] = useState(ativo.quantidade);
  const [valorCompraUnitario, setValorCompraUnitario] = useState(ativo.valorCompraUnitario);
  const [dataCompra, setDataCompra] = useState(ativo.dataCompra.slice(0, 10));
  const [percentualIdeal, setPercentualIdeal] = useState(ativo.percentualIdeal ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [buscandoNome, setBuscandoNome] = useState(false);

  const exigeTicker = tipoExigeTicker(tipo);

  useEffect(() => {
    if (!exigeTicker || ticker.trim().length < 4 || ticker === ativo.ticker) return;

    const timer = setTimeout(async () => {
      setBuscandoNome(true);
      try {
        const resposta = await fetch(`/api/ativos/buscar-nome?ticker=${ticker}`);
        if (resposta.ok) {
          const dados = await resposta.json();
          if (dados.nome) setNome(dados.nome);
        }
      } finally {
        setBuscandoNome(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [ticker, exigeTicker, ativo.ticker]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch(`/api/ativos/${ativo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo,
        ticker: exigeTicker ? ticker : null,
        nome,
        quantidade,
        valorCompraUnitario,
        dataCompra,
        percentualIdeal: percentualIdeal === "" ? null : percentualIdeal,
      }),
    });

    setEnviando(false);

    if (!resposta.ok) {
      setErro("Não foi possível salvar as alterações.");
      return;
    }

    router.refresh();
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

        <h2 className="mb-4 font-display text-lg text-foreground">Editar ativo</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/80">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoAtivo)}
              className="input-base"
            >
              {TIPOS_ATIVO.map((t) => (
                <option key={t.valor} value={t.valor} className="text-navy">
                  {t.rotulo}
                </option>
              ))}
            </select>
          </div>

          {exigeTicker && (
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
          )}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground/80">
              Nome
              {buscandoNome && <Loader2 size={12} className="animate-spin text-foreground/40" />}
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                Quantidade
              </label>
              <input
                type="number"
                step="0.000001"
                min="0.000001"
                required
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                Valor unit. (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={valorCompraUnitario}
                onChange={(e) => setValorCompraUnitario(e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                Data da compra
              </label>
              <input
                type="date"
                required
                value={dataCompra}
                onChange={(e) => setDataCompra(e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                % ideal na carteira
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={percentualIdeal}
                onChange={(e) => setPercentualIdeal(e.target.value)}
                className="input-base"
                placeholder="Opcional"
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
