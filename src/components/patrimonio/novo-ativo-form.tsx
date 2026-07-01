"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Banknote } from "lucide-react";
import { TIPOS_ATIVO, tipoExigeTicker, type TipoAtivo } from "@/lib/ativos";
import type { AtivoComValor } from "@/lib/tipos-patrimonio";
import { normalizarDecimal, apenasNumerico } from "@/lib/numero";

const HOJE = new Date().toISOString().slice(0, 10);

function FormAdicionar({ onSuccess }: { onSuccess?: () => void }) {
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
        quantidade: normalizarDecimal(quantidade),
        valorCompraUnitario: normalizarDecimal(valorCompraUnitario),
        dataCompra,
        percentualIdeal: percentualIdeal === "" ? null : normalizarDecimal(percentualIdeal),
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
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoAtivo)}
          className="input-base"
        >
          {TIPOS_ATIVO.map((t) => (
            <option key={t.valor} value={t.valor}>
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
            type="text"
            inputMode="decimal"
            required
            value={quantidade}
            onChange={(e) => setQuantidade(apenasNumerico(e.target.value))}
            className="input-base"
            placeholder={exigeTicker ? "100" : "1"}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/80">
            Valor unit. (R$)
          </label>
          <input
            type="text"
            inputMode="decimal"
            required
            value={valorCompraUnitario}
            onChange={(e) => setValorCompraUnitario(apenasNumerico(e.target.value))}
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
            type="text"
            inputMode="decimal"
            value={percentualIdeal}
            onChange={(e) => setPercentualIdeal(apenasNumerico(e.target.value))}
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

function FormRetirar({ ativos, onSuccess }: { ativos: AtivoComValor[]; onSuccess?: () => void }) {
  const router = useRouter();
  const [ativoId, setAtivoId] = useState(ativos[0]?.id ?? "");
  const ativoSelecionado = ativos.find((a) => a.id === ativoId);
  const [quantidade, setQuantidade] = useState(ativoSelecionado ? String(Number(ativoSelecionado.quantidade)) : "");
  const [precoUnitario, setPrecoUnitario] = useState(ativoSelecionado ? String(ativoSelecionado.precoAtual) : "");
  const [dataOperacao, setDataOperacao] = useState(HOJE);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function selecionarAtivo(id: string) {
    setAtivoId(id);
    const a = ativos.find((x) => x.id === id);
    if (a) {
      setQuantidade(String(Number(a.quantidade)));
      setPrecoUnitario(String(a.precoAtual));
    }
  }

  if (ativos.length === 0) {
    return <p className="py-4 text-sm text-foreground/50">Nenhum ativo cadastrado ainda.</p>;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!ativoSelecionado) return;

    const qtd = parseFloat(quantidade.replace(",", "."));
    const preco = parseFloat(precoUnitario.replace(",", "."));

    if (qtd > Number(ativoSelecionado.quantidade)) {
      setErro(`Quantidade maior que a possuída (${Number(ativoSelecionado.quantidade).toLocaleString("pt-BR")}).`);
      return;
    }

    setEnviando(true);
    const resposta = await fetch(`/api/ativos/${ativoId}/vender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade: qtd, precoUnitario: preco, dataOperacao }),
    });
    setEnviando(false);

    if (!resposta.ok) {
      setErro("Não foi possível registrar a retirada. Confira os campos.");
      return;
    }

    if (onSuccess) onSuccess(); else router.refresh();
  }

  const total = ativoSelecionado
    ? (parseFloat(quantidade.replace(",", ".")) || 0) * (parseFloat(precoUnitario.replace(",", ".")) || 0)
    : 0;

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">Ativo</label>
        <select value={ativoId} onChange={(e) => selecionarAtivo(e.target.value)} className="input-base">
          {ativos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.ticker ?? a.nome} · {Number(a.quantidade).toLocaleString("pt-BR")}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/80">Quantidade</label>
          <input
            type="text"
            inputMode="decimal"
            required
            value={quantidade}
            onChange={(e) => setQuantidade(apenasNumerico(e.target.value))}
            className="input-base"
          />
          {ativoSelecionado && (
            <p className="mt-1 text-xs text-foreground/40">
              Possui {Number(ativoSelecionado.quantidade).toLocaleString("pt-BR")}
            </p>
          )}
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
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">Data da venda</label>
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
        </p>
      )}

      {erro && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="btn-dourado flex w-full items-center justify-center gap-2 disabled:opacity-50"
      >
        <Banknote size={16} />
        {enviando ? "Registrando..." : "Retirar ativo"}
      </button>
    </form>
  );
}

export function NovoAtivoForm({ ativos, onSuccess }: { ativos?: AtivoComValor[]; onSuccess?: () => void } = {}) {
  const [modo, setModo] = useState<"ADICIONAR" | "RETIRAR">("ADICIONAR");

  return (
    <div className="card space-y-4 p-6">
      <div>
        <h2 className="font-display text-lg text-foreground">
          {modo === "ADICIONAR" ? "Novo ativo" : "Retirar ativo"}
        </h2>
        <p className="text-sm text-foreground/55">
          {modo === "ADICIONAR" ? "Adicione ao seu patrimônio." : "Registre uma venda ou retirada de um ativo já cadastrado."}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setModo("ADICIONAR")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            modo === "ADICIONAR"
              ? "bg-dourado/20 text-dourado ring-1 ring-dourado/40"
              : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
          }`}
        >
          + Adicionar
        </button>
        <button
          type="button"
          onClick={() => setModo("RETIRAR")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            modo === "RETIRAR"
              ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40"
              : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
          }`}
        >
          − Retirar
        </button>
      </div>

      {modo === "ADICIONAR" ? (
        <FormAdicionar onSuccess={onSuccess} />
      ) : (
        <FormRetirar ativos={ativos ?? []} onSuccess={onSuccess} />
      )}
    </div>
  );
}
