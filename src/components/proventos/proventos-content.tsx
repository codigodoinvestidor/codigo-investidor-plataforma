"use client";

import { useCallback, useEffect, useState } from "react";
import { Coins, Target, Wallet } from "lucide-react";
import { CartaoResumo } from "@/components/dashboard/cartao-resumo";
import { BotaoExportarCsv } from "@/components/botao-exportar-csv";
import { NovoProventoForm } from "@/components/proventos/novo-provento-form";
import { ListaProventos } from "@/components/proventos/lista-proventos";
import { GraficoEvolucaoProventos } from "@/components/proventos/grafico-evolucao-proventos";
import { GraficoAlocacao } from "@/components/patrimonio/grafico-alocacao";
import { HistoricoMensalProventos } from "@/components/proventos/historico-mensal-proventos";
import { evolucaoProventos, distribuicaoPorTicker } from "@/lib/calculo-proventos";

type ProventoApi = {
  id: string;
  ticker: string;
  tipoPagamento: string;
  valorTotal: string;
  dataCom: string | null;
  dataPagamento: string;
};

type AtivoApi = { ticker: string | null };

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

export function ProventosContent() {
  const [proventos, setProventos] = useState<ProventoApi[] | null>(null);
  const [tickers, setTickers] = useState<string[]>([]);

  const carregar = useCallback(async () => {
    const [resProventos, resAtivos] = await Promise.all([
      fetch("/api/proventos"),
      fetch("/api/ativos"),
    ]);
    if (resProventos.ok) setProventos(await resProventos.json());
    if (resAtivos.ok) {
      const ativos: AtivoApi[] = await resAtivos.json();
      setTickers(ativos.map((a) => a.ticker).filter(Boolean) as string[]);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  if (!proventos) return <Skeleton />;

  const proventosCalculo = proventos.map((p) => ({
    ticker: p.ticker,
    valorTotal: Number(p.valorTotal),
    dataPagamento: new Date(p.dataPagamento),
  }));

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  const proventosRecebidos12m = proventosCalculo.filter((p) => {
    const diffMeses =
      (anoAtual - p.dataPagamento.getFullYear()) * 12 + (mesAtual - p.dataPagamento.getMonth());
    return diffMeses >= 0 && diffMeses < 12;
  });
  const total12Meses = proventosRecebidos12m.reduce((s, p) => s + p.valorTotal, 0);
  const mediaMensal12Meses = total12Meses / 12;
  const totalGeral = proventosCalculo.reduce((s, p) => s + p.valorTotal, 0);

  const evolucao = evolucaoProventos(proventosCalculo);
  const distribuicao = distribuicaoPorTicker(proventosCalculo);

  const anosComDados = Array.from(
    new Set(proventosCalculo.map((p) => p.dataPagamento.getFullYear()))
  ).sort((a, b) => b - a);
  const anosExibidos = anosComDados.length > 0 ? anosComDados : [anoAtual];

  const formatar = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CartaoResumo titulo="Média mensal (12m)" valor={formatar(mediaMensal12Meses)} icone={Target} tom="neutro" />
        <CartaoResumo titulo="Total últimos 12 meses" valor={formatar(total12Meses)} icone={Coins} tom="positivo" />
        <CartaoResumo titulo="Total recebido (geral)" valor={formatar(totalGeral)} icone={Wallet} tom="neutro" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <NovoProventoForm tickers={tickers} onSuccess={carregar} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-1 font-display text-lg text-foreground">Evolução de proventos</h2>
            <p className="mb-4 text-sm text-foreground/55">Últimos 12 meses.</p>
            <GraficoEvolucaoProventos dados={evolucao} />
          </div>

          <div className="card p-6">
            <h2 className="mb-1 font-display text-lg text-foreground">Distribuição por ativo</h2>
            <p className="mb-4 text-sm text-foreground/55">De onde vêm seus proventos.</p>
            <GraficoAlocacao dados={distribuicao} />
          </div>

          <div className="card p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-display text-lg text-foreground">Meus proventos</h2>
              <BotaoExportarCsv href="/api/proventos/exportar" />
            </div>
            <p className="mb-4 text-sm text-foreground/55">Histórico de pagamentos.</p>
            <ListaProventos proventos={proventos} onRefresh={carregar} />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="card overflow-hidden p-6">
          <div className="mb-4">
            <h2 className="font-display text-lg text-foreground">Histórico mensal</h2>
            <p className="text-sm text-foreground/55">Proventos recebidos por mês, ano a ano.</p>
          </div>
          <HistoricoMensalProventos proventos={proventosCalculo} anos={anosExibidos} />
        </div>
      </section>
    </>
  );
}
