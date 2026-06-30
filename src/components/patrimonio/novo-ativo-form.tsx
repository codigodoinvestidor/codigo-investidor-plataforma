"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { TIPOS_ATIVO, tipoExigeTicker, type TipoAtivo } from "@/lib/ativos";

const HOJE = new Date().toISOString().slice(0, 10);

export function NovoAtivoForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoAtivo>("ACAO");
  const [ticker, setTicker] = useState("");
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valorCompraUnitario, setValorCompraUnitario] = useState("");
  const [dataCompra, setDataCompra] = useState(HOJE);
  const [percentualIdeal, setPercentualIdeal] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [buscandoNome, setBuscandoNome] = useState(false);

  const exigeTicker = tipoExigeTicker(tipo);

  useEffect(() => {
    if (!exigeTicker || ticker.trim().length < 4) return;

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
  }, [ticker, exigeTicker]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch("/api/ativos", {
      method: "POST",
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
      setErro("Não foi possível salvar o ativo. Confira os campos.");
      return;
    }

    setTicker("");
    setNome("");
    setQuantidade("");
    setValorCompraUnitario("");
    setPercentualIdeal("");
    if (onSuccess) onSuccess(); else router.refresh();
  }

  return (
    <form onSubmit={enviar} className="card space-y-4 p-6">
      <div>
        <h2 className="font-display text-lg text-foreground">Novo ativo</h2>
        <p className="text-sm text-foreground/55">Adicione ao seu patrimônio.</p>
      </div>

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
            placeholder="Ex: PETR4"
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
          placeholder={exigeTicker ? "Ex: Petrobras PN" : "Ex: Apartamento Centro"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/80">Quantidade</label>
          <input
            type="number"
            step="0.000001"
            min="0.000001"
            required
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="input-base"
            placeholder={exigeTicker ? "100" : "1"}
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
            placeholder="0,00"
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

      {erro && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="btn-dourado flex w-full items-center justify-center gap-2 disabled:opacity-50"
      >
        <Plus size={16} />
        {enviando ? "Salvando..." : "Adicionar ativo"}
      </button>
    </form>
  );
}
