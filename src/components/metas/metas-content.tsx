"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { calcularAtivosComValor, type AtivoApi, type CotacoesApi } from "@/lib/calculo-patrimonio";
import { mediaMensal12Meses, type ProventoCalculo } from "@/lib/calculo-proventos";
import { normalizarDecimal, apenasNumerico } from "@/lib/numero";

type ProventoApi = { id: string; ticker: string; valorTotal: string; dataPagamento: string };
type TipoMeta = "PATRIMONIO" | "DIVIDENDOS";
type MetaApi = { id: string; tipo: TipoMeta; nome: string | null; valorAlvo: string; dataAlvo: string | null };

const formatar = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Skeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-64 rounded-2xl bg-foreground/5" />
      <div className="h-64 rounded-2xl bg-foreground/5" />
    </div>
  );
}

function LinhaMeta({
  meta,
  valorAtual,
  mostrarData,
  onSalvar,
  onExcluir,
}: {
  meta: MetaApi;
  valorAtual: number;
  mostrarData: boolean;
  onSalvar: (id: string, nome: string | null, valorAlvo: number, dataAlvo: string | null) => Promise<void>;
  onExcluir: (id: string) => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(meta.nome ?? "");
  const [valorAlvo, setValorAlvo] = useState(meta.valorAlvo);
  const [dataAlvo, setDataAlvo] = useState(meta.dataAlvo?.slice(0, 10) ?? "");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const alvoNum = Number(meta.valorAlvo);
  const pct = alvoNum > 0 ? Math.min(100, (valorAtual / alvoNum) * 100) : 0;
  const atingida = alvoNum > 0 && valorAtual >= alvoNum;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(normalizarDecimal(valorAlvo));
    if (isNaN(num) || num <= 0) return;
    setSalvando(true);
    await onSalvar(meta.id, nome.trim() || null, num, mostrarData && dataAlvo ? dataAlvo : null);
    setSalvando(false);
    setEditando(false);
  }

  async function excluir() {
    setExcluindo(true);
    await onExcluir(meta.id);
  }

  if (editando) {
    return (
      <form onSubmit={salvar} className="space-y-3 rounded-xl border border-borda p-4">
        <div>
          <label className="mb-1 block text-xs text-foreground/50">Nome (opcional)</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Aposentadoria" className="input-base" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-foreground/50">Valor alvo (R$)</label>
          <input
            value={valorAlvo}
            onChange={(e) => setValorAlvo(apenasNumerico(e.target.value))}
            inputMode="decimal"
            required
            className="input-base"
          />
        </div>
        {mostrarData && (
          <div>
            <label className="mb-1 block text-xs text-foreground/50">Data alvo (opcional)</label>
            <input type="date" value={dataAlvo} onChange={(e) => setDataAlvo(e.target.value)} className="input-base" />
          </div>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditando(false)} className="flex-1 rounded-lg border border-borda py-2 text-sm text-foreground/60 hover:bg-foreground/5">
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className="btn-primary flex-1">
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-borda p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate font-medium text-foreground">{meta.nome || "Meta"}</span>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => setEditando(true)} className="text-foreground/40 hover:text-dourado" aria-label="Editar meta">
            <Pencil size={14} />
          </button>
          <button onClick={excluir} disabled={excluindo} className="text-foreground/40 hover:text-red-500" aria-label="Excluir meta">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className={`h-full rounded-full transition-all ${atingida ? "bg-emerald-500" : "bg-dourado"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-foreground/50">
        {atingida ? "Meta atingida" : `${pct.toFixed(1)}% de ${formatar(alvoNum)}`}
        {meta.dataAlvo && ` · até ${new Date(meta.dataAlvo).toLocaleDateString("pt-BR")}`}
      </p>
    </div>
  );
}

function NovaMetaForm({
  mostrarData,
  onCriar,
  onFechar,
}: {
  mostrarData: boolean;
  onCriar: (nome: string | null, valorAlvo: number, dataAlvo: string | null) => Promise<void>;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [valorAlvo, setValorAlvo] = useState("");
  const [dataAlvo, setDataAlvo] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(normalizarDecimal(valorAlvo));
    if (isNaN(num) || num <= 0) return;
    setSalvando(true);
    await onCriar(nome.trim() || null, num, mostrarData && dataAlvo ? dataAlvo : null);
    setSalvando(false);
  }

  return (
    <form onSubmit={salvar} className="space-y-3 rounded-xl border border-dourado/30 bg-dourado/5 p-4">
      <div>
        <label className="mb-1 block text-xs text-foreground/50">Nome (opcional)</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Aposentadoria" className="input-base" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">Valor alvo (R$)</label>
        <input
          value={valorAlvo}
          onChange={(e) => setValorAlvo(apenasNumerico(e.target.value))}
          inputMode="decimal"
          placeholder="0,00"
          required
          className="input-base"
        />
      </div>
      {mostrarData && (
        <div>
          <label className="mb-1 block text-xs text-foreground/50">Data alvo (opcional)</label>
          <input type="date" value={dataAlvo} onChange={(e) => setDataAlvo(e.target.value)} className="input-base" />
        </div>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={onFechar} className="flex-1 rounded-lg border border-borda py-2 text-sm text-foreground/60 hover:bg-foreground/5">
          Cancelar
        </button>
        <button type="submit" disabled={salvando} className="btn-dourado flex-1">
          {salvando ? "Salvando..." : "Criar meta"}
        </button>
      </div>
    </form>
  );
}

function SecaoMetas({
  titulo,
  descricao,
  valorAtual,
  metas,
  mostrarData,
  onCriar,
  onSalvar,
  onExcluir,
}: {
  titulo: string;
  descricao: string;
  valorAtual: number;
  metas: MetaApi[];
  mostrarData: boolean;
  onCriar: (nome: string | null, valorAlvo: number, dataAlvo: string | null) => Promise<void>;
  onSalvar: (id: string, nome: string | null, valorAlvo: number, dataAlvo: string | null) => Promise<void>;
  onExcluir: (id: string) => Promise<void>;
}) {
  const [criando, setCriando] = useState(false);

  return (
    <div className="card p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-lg text-foreground">{titulo}</h2>
        <button
          type="button"
          onClick={() => setCriando((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-dourado hover:underline"
        >
          <Plus size={13} /> Nova meta
        </button>
      </div>
      <p className="mb-1 text-sm text-foreground/55">{descricao}</p>
      <p className="mb-4 font-display text-2xl text-foreground">{formatar(valorAtual)}</p>

      <div className="space-y-3">
        {criando && (
          <NovaMetaForm
            mostrarData={mostrarData}
            onFechar={() => setCriando(false)}
            onCriar={async (nome, valorAlvo, dataAlvo) => {
              await onCriar(nome, valorAlvo, dataAlvo);
              setCriando(false);
            }}
          />
        )}
        {metas.length === 0 && !criando && (
          <p className="text-xs text-foreground/40">Nenhuma meta definida ainda.</p>
        )}
        {metas.map((meta) => (
          <LinhaMeta
            key={meta.id}
            meta={meta}
            valorAtual={valorAtual}
            mostrarData={mostrarData}
            onSalvar={onSalvar}
            onExcluir={onExcluir}
          />
        ))}
      </div>
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

  const criarMeta = useCallback(async (tipo: TipoMeta, nome: string | null, valorAlvo: number, dataAlvo: string | null) => {
    await fetch("/api/metas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, nome, valorAlvo, dataAlvo }),
    });
    await recarregarMetas();
  }, [recarregarMetas]);

  const salvarMeta = useCallback(async (id: string, nome: string | null, valorAlvo: number, dataAlvo: string | null) => {
    await fetch(`/api/metas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, valorAlvo, dataAlvo }),
    });
    await recarregarMetas();
  }, [recarregarMetas]);

  const excluirMeta = useCallback(async (id: string) => {
    await fetch(`/api/metas/${id}`, { method: "DELETE" });
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

  const metasPatrimonio = metas.filter((m) => m.tipo === "PATRIMONIO");
  const metasDividendos = metas.filter((m) => m.tipo === "DIVIDENDOS");

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Metas</h1>
        <p className="text-sm text-foreground/50">Acompanhe suas metas com base nos dados reais do Patrimônio e dos Proventos.</p>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SecaoMetas
          titulo="Metas de Patrimônio"
          descricao="Valor atual da carteira, com cotação em tempo real."
          valorAtual={valorTotalPatrimonio}
          metas={metasPatrimonio}
          mostrarData
          onCriar={(nome, valorAlvo, dataAlvo) => criarMeta("PATRIMONIO", nome, valorAlvo, dataAlvo)}
          onSalvar={salvarMeta}
          onExcluir={excluirMeta}
        />
        <SecaoMetas
          titulo="Metas de Dividendos (mensal)"
          descricao={`Média mensal (12m). Recebido este mês: ${formatar(recebidoMesAtual)}`}
          valorAtual={mediaMensal}
          metas={metasDividendos}
          mostrarData={false}
          onCriar={(nome, valorAlvo) => criarMeta("DIVIDENDOS", nome, valorAlvo, null)}
          onSalvar={(id, nome, valorAlvo) => salvarMeta(id, nome, valorAlvo, null)}
          onExcluir={excluirMeta}
        />
      </section>

      {metas.length === 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-dourado/20 bg-dourado/5 p-4 text-sm text-foreground/70">
          <Target size={18} className="shrink-0 text-dourado" />
          Clique em &quot;Nova meta&quot; em qualquer um dos cartões acima pra começar.
        </div>
      )}
    </>
  );
}
