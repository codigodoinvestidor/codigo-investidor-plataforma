"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { CATEGORIAS_RENDA, CATEGORIAS_DESPESA, NOMES_MESES } from "@/lib/categorias";

const HOJE = new Date();
const MES_ATUAL = HOJE.getMonth() + 1;
const ANO_ATUAL = HOJE.getFullYear();
const ANOS = Array.from({ length: 6 }, (_, i) => ANO_ATUAL - 1 + i);

export function NovoLancamentoForm() {
  const router = useRouter();
  const [tipo, setTipo] = useState<"RENDA" | "DESPESA">("DESPESA");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_DESPESA[0]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [mesInicio, setMesInicio] = useState(MES_ATUAL);
  const [anoInicio, setAnoInicio] = useState(ANO_ATUAL);
  const [semTermino, setSemTermino] = useState(true);
  const [mesFim, setMesFim] = useState(MES_ATUAL);
  const [anoFim, setAnoFim] = useState(ANO_ATUAL);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const categorias = tipo === "RENDA" ? CATEGORIAS_RENDA : CATEGORIAS_DESPESA;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch("/api/lancamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo,
        categoria,
        descricao,
        valor,
        mesInicio,
        anoInicio,
        mesFim: semTermino ? null : mesFim,
        anoFim: semTermino ? null : anoFim,
      }),
    });

    setEnviando(false);

    if (!resposta.ok) {
      setErro("Não foi possível salvar o lançamento.");
      return;
    }

    setDescricao("");
    setValor("");
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="card space-y-4 p-6">
      <div>
        <h2 className="font-display text-lg text-foreground">Novo lançamento</h2>
        <p className="text-sm text-foreground/55">Registre uma entrada ou saída.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { valor: "DESPESA", rotulo: "Despesa", icone: TrendingDown },
            { valor: "RENDA", rotulo: "Renda", icone: TrendingUp },
          ] as const
        ).map(({ valor: opcao, rotulo, icone: Icone }) => (
          <button
            type="button"
            key={opcao}
            onClick={() => {
              setTipo(opcao);
              setCategoria(opcao === "RENDA" ? CATEGORIAS_RENDA[0] : CATEGORIAS_DESPESA[0]);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
              tipo === opcao
                ? "btn-dourado"
                : "border border-borda text-foreground/70 hover:border-dourado/30"
            }`}
          >
            <Icone size={15} />
            {rotulo}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">Categoria</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="input-base"
        >
          {categorias.map((c) => (
            <option key={c} value={c} className="text-navy">
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">Descrição</label>
        <input
          type="text"
          required
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="input-base"
          placeholder="Ex: Aluguel"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">Valor (R$)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          required
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="input-base"
          placeholder="0,00"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/80">Mês início</label>
          <select
            value={mesInicio}
            onChange={(e) => setMesInicio(Number(e.target.value))}
            className="input-base"
          >
            {NOMES_MESES.map((m, i) => (
              <option key={m} value={i + 1} className="text-navy">
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/80">Ano início</label>
          <select
            value={anoInicio}
            onChange={(e) => setAnoInicio(Number(e.target.value))}
            className="input-base"
          >
            {ANOS.map((a) => (
              <option key={a} value={a} className="text-navy">
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground/70">
        <input
          type="checkbox"
          checked={semTermino}
          onChange={(e) => setSemTermino(e.target.checked)}
          className="accent-dourado"
        />
        Recorrente, sem data de término
      </label>

      {!semTermino && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/80">Mês término</label>
            <select
              value={mesFim}
              onChange={(e) => setMesFim(Number(e.target.value))}
              className="input-base"
            >
              {NOMES_MESES.map((m, i) => (
                <option key={m} value={i + 1} className="text-navy">
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/80">Ano término</label>
            <select
              value={anoFim}
              onChange={(e) => setAnoFim(Number(e.target.value))}
              className="input-base"
            >
              {ANOS.map((a) => (
                <option key={a} value={a} className="text-navy">
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {erro && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="btn-dourado flex w-full items-center justify-center gap-2 disabled:opacity-50"
      >
        <Plus size={16} />
        {enviando ? "Salvando..." : "Adicionar"}
      </button>
    </form>
  );
}
