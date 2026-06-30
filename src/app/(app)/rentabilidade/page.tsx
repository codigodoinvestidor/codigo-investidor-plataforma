import { TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CartaoResumo } from "@/components/dashboard/cartao-resumo";
import { GraficoComparativo } from "@/components/rentabilidade/grafico-comparativo";
import { TabelaComparativa } from "@/components/rentabilidade/tabela-comparativa";
import { calcularRentabilidadeComparada } from "@/lib/rentabilidade";

const PERIODO_MESES = 12;

export default async function RentabilidadePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const ativos = await prisma.ativo.findMany({
    where: { userId: user!.id, ticker: { not: null } },
  });

  const ativosParaCalculo = ativos
    .filter((a) => a.ticker)
    .map((a) => ({ ticker: a.ticker as string, quantidade: Number(a.quantidade) }));

  if (ativosParaCalculo.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-foreground/55">
        Cadastre ações, FIIs ou ETFs no Patrimônio para ver a rentabilidade comparada com índices.
      </div>
    );
  }

  const comparativo = await calcularRentabilidadeComparada(ativosParaCalculo, PERIODO_MESES);
  const ultimoPonto = comparativo[comparativo.length - 1];

  const formatarPct = (v: number | null) => {
    if (v == null) return "—";
    return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
  };

  return (
    <>
      <p className="mb-4 text-xs text-foreground/45">
        Comparação dos últimos {PERIODO_MESES} meses (carteira, IBOV, CDI e IPCA).
      </p>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoResumo titulo={`Carteira (${PERIODO_MESES}m)`} valor={formatarPct(ultimoPonto.carteira)} icone={TrendingUp} tom={ultimoPonto.carteira >= 0 ? "positivo" : "negativo"} />
        <CartaoResumo titulo={`IBOV (${PERIODO_MESES}m)`} valor={formatarPct(ultimoPonto.ibov)} icone={TrendingUp} tom="neutro" />
        <CartaoResumo titulo={`CDI (${PERIODO_MESES}m)`} valor={formatarPct(ultimoPonto.cdi)} icone={TrendingUp} tom="neutro" />
        <CartaoResumo titulo={`IPCA (${PERIODO_MESES}m)`} valor={formatarPct(ultimoPonto.ipca)} icone={TrendingUp} tom="neutro" />
      </section>

      <section className="space-y-6">
        <div className="card p-6">
          <h2 className="mb-1 font-display text-lg text-foreground">Rentabilidade comparada</h2>
          <p className="mb-4 text-sm text-foreground/55">Sua carteira contra IBOV, CDI e IPCA.</p>
          <GraficoComparativo dados={comparativo} />
        </div>

        <div className="card p-6">
          <h2 className="mb-1 font-display text-lg text-foreground">Detalhamento</h2>
          <p className="mb-4 text-sm text-foreground/55">Rentabilidade acumulada por período.</p>
          <TabelaComparativa dados={comparativo} />
        </div>
      </section>
    </>
  );
}
