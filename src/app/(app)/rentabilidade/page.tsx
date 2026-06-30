import { Suspense } from "react";
import { TrendingUp } from "lucide-react";
import { getUser } from "@/lib/auth";
import { CartaoResumo } from "@/components/dashboard/cartao-resumo";
import { GraficoComparativo } from "@/components/rentabilidade/grafico-comparativo";
import { TabelaComparativa } from "@/components/rentabilidade/tabela-comparativa";
import { FiltrosPeriodo } from "@/components/rentabilidade/filtros-periodo";
import { calcularRentabilidadeComparada } from "@/lib/rentabilidade";
import { getAtivosComTicker } from "@/lib/queries";

const PERIODOS_VALIDOS = [1, 3, 6, 12, 24, 60];

export default async function RentabilidadePage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo: periodoParam } = await searchParams;
  const periodoMeses = PERIODOS_VALIDOS.includes(Number(periodoParam))
    ? Number(periodoParam)
    : 12;

  const user = await getUser();
  const ativos = await getAtivosComTicker(user!.id);

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

  const comparativo = await calcularRentabilidadeComparada(ativosParaCalculo, periodoMeses);
  const ultimoPonto = comparativo[comparativo.length - 1];

  const formatarPct = (v: number | null) => {
    if (v == null) return "—";
    return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
  };

  const rotuloTempo = periodoMeses === 1 ? "1 mês" : periodoMeses < 12 ? `${periodoMeses} meses` : `${periodoMeses / 12} ano${periodoMeses > 12 ? "s" : ""}`;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Rentabilidade</h1>
          <p className="text-sm text-foreground/50">Sua carteira comparada com IBOV, CDI e IPCA.</p>
        </div>
        <Suspense>
          <FiltrosPeriodo periodoAtual={periodoMeses} />
        </Suspense>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoResumo titulo={`Carteira (${rotuloTempo})`} valor={formatarPct(ultimoPonto.carteira)} icone={TrendingUp} tom={ultimoPonto.carteira >= 0 ? "positivo" : "negativo"} />
        <CartaoResumo titulo={`IBOV (${rotuloTempo})`} valor={formatarPct(ultimoPonto.ibov)} icone={TrendingUp} tom="neutro" />
        <CartaoResumo titulo={`CDI (${rotuloTempo})`} valor={formatarPct(ultimoPonto.cdi)} icone={TrendingUp} tom="neutro" />
        <CartaoResumo titulo={`IPCA (${rotuloTempo})`} valor={formatarPct(ultimoPonto.ipca)} icone={TrendingUp} tom="neutro" />
      </section>

      <section className="space-y-6">
        <div className="card p-6">
          <h2 className="mb-1 font-display text-lg text-foreground">Rentabilidade comparada</h2>
          <p className="mb-4 text-sm text-foreground/55">Sua carteira contra IBOV, CDI e IPCA nos últimos {rotuloTempo}.</p>
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
