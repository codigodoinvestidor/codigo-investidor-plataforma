"use client";

import { useState } from "react";
import { Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { CartaoResumo } from "@/components/dashboard/cartao-resumo";
import { NovoLancamentoForm } from "@/components/dashboard/novo-lancamento-form";
import { GraficoCategorias } from "@/components/dashboard/grafico-categorias";
import { ListaLancamentos } from "@/components/dashboard/lista-lancamentos";
import { ResumoAnual } from "@/components/dashboard/resumo-anual";
import { BotaoExportarCsv } from "@/components/botao-exportar-csv";
import { gerarResumoAnual } from "@/lib/calculo-mensal";
import { NOMES_MESES } from "@/lib/categorias";

const ANO_ATUAL_PADRAO = new Date().getFullYear();
const ANOS_FILTRO = Array.from({ length: 6 }, (_, i) => ANO_ATUAL_PADRAO - 1 + i);

type Lancamento = {
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

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-foreground/5" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-96 rounded-2xl bg-foreground/5" />
        <div className="h-96 rounded-2xl bg-foreground/5 lg:col-span-2" />
      </div>
    </div>
  );
}

export function DashboardContent({ initialData }: { initialData?: Lancamento[] }) {
  const { data: lancamentos, loading, refresh: carregar } = useCachedFetch<Lancamento[]>(
    "lancamentos",
    async () => { const r = await fetch("/api/lancamentos"); return r.json(); },
    initialData
  );

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  const [mesFiltro, setMesFiltro] = useState(mesAtual);
  const [anoFiltro, setAnoFiltro] = useState(anoAtual);

  if (loading || !lancamentos) return <Skeleton />;

  const lancamentosCalculo = lancamentos.map((l) => ({
    tipo: l.tipo,
    categoria: l.categoria,
    valor: Number(l.valor),
    mesInicio: l.mesInicio,
    anoInicio: l.anoInicio,
    mesFim: l.mesFim,
    anoFim: l.anoFim,
  }));

  const { meses } = gerarResumoAnual(lancamentosCalculo, anoAtual);
  const resumoMesAtual = meses[mesAtual - 1];

  const { meses: mesesFiltro } = anoFiltro === anoAtual
    ? { meses }
    : gerarResumoAnual(lancamentosCalculo, anoFiltro);
  const resumoMesFiltro = mesesFiltro[mesFiltro - 1];

  const despesasPorCategoriaFiltro = Object.entries(resumoMesFiltro.porCategoria)
    .filter(([, total]) => total > 0)
    .map(([categoria, total]) => ({ categoria, total }));

  const formatar = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground/40">
        {NOMES_MESES[mesAtual - 1]} de {anoAtual}
      </p>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CartaoResumo titulo="Renda do mês" valor={formatar(resumoMesAtual.renda)} icone={TrendingUp} tom="positivo" />
        <CartaoResumo titulo="Despesas do mês" valor={formatar(resumoMesAtual.despesa)} icone={TrendingDown} tom="negativo" />
        <CartaoResumo titulo="Saldo do mês" valor={formatar(resumoMesAtual.saldo)} icone={Wallet} tom="neutro" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <NovoLancamentoForm onSuccess={carregar} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg text-foreground">Despesas por categoria</h2>
              <div className="flex gap-2">
                <select
                  value={mesFiltro}
                  onChange={(e) => setMesFiltro(Number(e.target.value))}
                  className="input-base w-auto py-1 text-sm"
                >
                  {NOMES_MESES.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={anoFiltro}
                  onChange={(e) => setAnoFiltro(Number(e.target.value))}
                  className="input-base w-auto py-1 text-sm"
                >
                  {ANOS_FILTRO.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mb-4 text-sm text-foreground/55">
              {mesFiltro === mesAtual && anoFiltro === anoAtual ? "No mês atual." : `${NOMES_MESES[mesFiltro - 1]} de ${anoFiltro}.`}
            </p>
            <GraficoCategorias dados={despesasPorCategoriaFiltro} />
          </div>

          <div className="card p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-display text-lg text-foreground">Lançamentos</h2>
              <BotaoExportarCsv href="/api/lancamentos/exportar" />
            </div>
            <p className="mb-1 text-sm text-foreground/55">Seu histórico mais recente.</p>
            <ListaLancamentos lancamentos={lancamentos} onRefresh={carregar} />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <ResumoAnual lancamentos={lancamentosCalculo} ano={anoAtual} />
      </section>
    </>
  );
}
