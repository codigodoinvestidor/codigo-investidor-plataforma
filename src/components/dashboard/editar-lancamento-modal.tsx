"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Save } from "lucide-react";
import { CATEGORIAS_RENDA, CATEGORIAS_DESPESA, NOMES_MESES } from "@/lib/categorias";

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 6 }, (_, i) => ANO_ATUAL - 1 + i);

export type LancamentoEditavel = {
  id: string;
  tipo: "RENDA" | "DESPESA";
  categoria: string;
  descricao: string;
  valor: string;
  mesInicio: number;
  anoInicio: number;
  mesFim: number | null;
  anoFim: number | null;
};

export function EditarLancamentoModal({
  lancamento,
  onFechar,
}: {
  lancamento: LancamentoEditavel;
  onFechar: () => void;
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"RENDA" | "DESPESA">(lancamento.tipo);
  const [categoria, setCategoria] = useState(lancamento.categoria);
  const [descricao, setDescricao] = useState(lancamento.descricao);
  const [valor, setValor] = useState(lancamento.valor);
  const [mesInicio, setMesInicio] = useState(lancamento.mesInicio);
  const [anoInicio, setAnoInicio] = useState(lancamento.anoInicio);
  const [semTermino, setSemTermino] = useState(lancamento.mesFim == null);
  const [mesFim, setMesFim] = useState(lancamento.mesFim ?? lancamento.mesInicio);
  const [anoFim, setAnoFim] = useState(lancamento.anoFim ?? lancamento.anoInicio);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const categorias = tipo === "RENDA" ? CATEGORIAS_RENDA : CATEGORIAS_DESPESA;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch(`/api/lancamentos/${lancamento.id}`, {
      method: "PUT",
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

        <h2 className="mb-4 font-display text-lg text-foreground">Editar lançamento</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["DESPESA", "RENDA"] as const).map((opcao) => (
              <button
                type="button"
                key={opcao}
                onClick={() => {
                  setTipo(opcao);
                  setCategoria(opcao === "RENDA" ? CATEGORIAS_RENDA[0] : CATEGORIAS_DESPESA[0]);
                }}
                className={`rounded-lg py-2 text-sm font-medium transition ${
                  tipo === opcao
                    ? "btn-dourado"
                    : "border border-borda text-foreground/70 hover:border-dourado/30"
                }`}
              >
                {opcao === "RENDA" ? "Renda" : "Despesa"}
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
