"use client";

import { useCallback, useState } from "react";
import { Target } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { calcularAtivosComValor, type AtivoApi, type CotacoesApi } from "@/lib/calculo-patrimonio";
import { mediaMensal12Meses, type ProventoCalculo } from "@/lib/calculo-proventos";

type ProventoApi = { id: string; ticker: string; valorTotal: string; dataPagamento: string };
type MetaApi = { tipo: "PATRIMONIO" | "DIVIDENDOS"; valorAlvo: string; dataAlvo: string | null };

const formatar = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Skeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-64 rounded-2xl bg-foreground/5" />
      <div className="h-64 rounded-2xl bg-foreground/5" />
    </div>
  );
}

function CartaoMeta({
  titulo,
  descricao,
  valorAtual,
  meta,
  mostrarData,
  extra,
  onSalvar,
}: {
  titulo: string;
  descricao: string;
  valorAtual: number;
  meta: MetaApi | undefined;
  mostrarData?: boolean;
  extra?: string;
  onSalvar: (valorAlvo: number, dataAlvo: string | null) => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);
  const [valorAlvo, setValorAlvo] = useState(meta?.valorAlvo ?? "");
  const [dataAlvo, setDataAlvo] = useState(meta?.dataAlvo?.slice(0, 10) ?? "");
  const [salvando, setSalvando] = useState(false);

  const alvoNum = meta ? Number(meta.valorAlvo) : null;
  const pct = alvoNum && alvoNum > 0 ? Math.min(100, (valorAtual / alvoNum) * 100) : 0;
  const atingida = alvoNum != null && valorAtual >= alvoNum;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(valorAlvo.replace(",", "."));
    if (isNaN(num) || num <= 0) return;
    setSalvando(true);
    await onSalvar(num, mostrarData && dataAlvo ? dataAlvo : null);
    setSalvando(false);
    setEditando(false);
  }

  return (
    <div className="card p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-lg text-foreground">{titulo}</h2>
        <button
          type="button"
          onClick={() => setEditando((v) => !v)}
          className="text-xs font-medium text-dourado hover:underline"
        >
          {meta ? "Editar meta" : "Definir meta"}
        </button>
      </div>
      <p className="mb-4 text-sm text-foreground/55">{descricao}</p>

      {editando && (
        <form onSubmit={salvar} className="mb-4 space-y-3 rounded-xl border border-borda p-4">
          <div>
            <label className="mb-1 block text-xs text-foreground/50">Valor alvo (R$)</label>
            <input
              required
              value={valorAlvo}
              onChange={(e) => setValorAlvo(e.target.value)}
              placeholder="0,00"
              className="input-base"
            />
          </div>
          {mostrarData && (
            <div>
              <label className="mb-1 block text-xs text-foreground/50">Data alvo (opcional)</label>
              <input
                type="date"
                value={dataAlvo}
                onChange={(e) => setDataAlvo(e.target.value)}
                className="input-base"
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="flex-1 rounded-lg border border-borda py-2 text-sm text-foreground/60 hover:bg-foreground/5"
            >
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="btn-primary flex-1">
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      <p className="mb-1 font-display text-2xl text-foreground">{formatar(valorAtual)}</p>

      {meta ? (
        <>
          <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              className={`h-full rounded-full transition-all ${atingida ? "bg-emerald-500" : "bg-dourado"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-foreground/50">
            {atingida ? "Meta atingida" : `${pct.toFixed(1)}% de ${formatar(alvoNum!)}`}
            {meta.dataAlvo && ` · até ${new Date(meta.dataAlvo).toLocaleDateString("pt-BR")}`}
          </p>
        </>
      ) : (
        <p className="text-xs text-foreground/40">Nenhuma meta definida ainda.</p>
      )}

      {extra && <p className="mt-2 text-xs text-foreground/50">{extra}</p>}
    </div>
  );
}

export function MetasContent({
  initialAtivos,
  initialProventos,
  initialMetas,
}: {
  initialAtivos?: AtivoApi[];
  initialProventos?: ProventoApi[];
  initialMetas?: MetaApi[];
}) {
  const { data: ativos, loading: carregandoAtivos } = useCachedFetch<AtivoApi[]>(
    "ativos",
    async () => { const r = await fetch("/api/ativos"); return r.json(); },
    initialAtivos
  );
  const { data: cotacoesData } = useCachedFetch<CotacoesApi>(
    "cotacoes",
    async () => { const r = await fetch("/api/cotacoes"); return r.json(); }
  );
  const { data: proventos, loading: carregandoProventos } = useCachedFetch<ProventoApi[]>(
    "proventos",
    async () => { const r = await fetch("/api/proventos"); return r.json(); },
    initialProventos
  );
  const { data: metas, loading: carregandoMetas, refresh: recarregarMetas } = useCachedFetch<MetaApi[]>(
    "metas",
    async () => { const r = await fetch("/api/metas"); return r.json(); },
    initialMetas
  );

  const salvarMeta = useCallback(async (tipo: "PATRIMONIO" | "DIVIDENDOS", valorAlvo: number, dataAlvo: string | null) => {
    await fetch("/api/metas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, valorAlvo, dataAlvo }),
    });
    await recarregarMetas();
  }, [recarregarMetas]);

  if (carregandoAtivos || carregandoProventos || carregandoMetas || !ativos || !proventos || !metas) {
    return <Skeleton />;
  }

  const cotacoes = cotacoesData ?? {};
  const ativosComValor = calcularAtivosComValor(ativos, cotacoes);
  const valorTotalPatrimonio = ativosComValor.reduce((s, a) => s + a.valorAtual, 0);

  const proventosCalculo: ProventoCalculo[] = proventos.map((p) => ({
    ticker: p.ticker,
    valorTotal: Number(p.valorTotal),
    dataPagamento: new Date(p.dataPagamento),
  }));
  const { mediaMensal, recebidoMesAtual } = mediaMensal12Meses(proventosCalculo);

  const metaPatrimonio = metas.find((m) => m.tipo === "PATRIMONIO");
  const metaDividendos = metas.find((m) => m.tipo === "DIVIDENDOS");

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Metas</h1>
        <p className="text-sm text-foreground/50">Acompanhe suas metas com base nos dados reais do Patrimônio e dos Proventos.</p>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CartaoMeta
          titulo="Meta de Patrimônio"
          descricao="Valor atual da carteira, com cotação em tempo real."
          valorAtual={valorTotalPatrimonio}
          meta={metaPatrimonio}
          mostrarData
          onSalvar={(valorAlvo, dataAlvo) => salvarMeta("PATRIMONIO", valorAlvo, dataAlvo)}
        />
        <CartaoMeta
          titulo="Meta de Dividendos (mensal)"
          descricao="Média mensal recebida nos últimos 12 meses."
          valorAtual={mediaMensal}
          meta={metaDividendos}
          extra={`Recebido este mês: ${formatar(recebidoMesAtual)}`}
          onSalvar={(valorAlvo) => salvarMeta("DIVIDENDOS", valorAlvo, null)}
        />
      </section>

      {!metaPatrimonio && !metaDividendos && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-dourado/20 bg-dourado/5 p-4 text-sm text-foreground/70">
          <Target size={18} className="shrink-0 text-dourado" />
          Defina uma meta em cada cartão acima pra acompanhar seu progresso.
        </div>
      )}
    </>
  );
}
