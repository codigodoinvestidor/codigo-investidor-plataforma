import { Coins, Target, Wallet } from "lucide-react";
import { getUser } from "@/lib/auth";
import { CartaoResumo } from "@/components/dashboard/cartao-resumo";
import { BotaoExportarCsv } from "@/components/botao-exportar-csv";
import { NovoProventoForm } from "@/components/proventos/novo-provento-form";
import { ListaProventos } from "@/components/proventos/lista-proventos";
import { GraficoEvolucaoProventos } from "@/components/proventos/grafico-evolucao-proventos";
import { GraficoAlocacao } from "@/components/patrimonio/grafico-alocacao";
import { HistoricoMensalProventos } from "@/components/proventos/historico-mensal-proventos";
import { evolucaoProventos, distribuicaoPorTicker } from "@/lib/calculo-proventos";
import { getProventos, getTickersAtivos } from "@/lib/queries";

export default async function ProventosPage() {
  const user = await getUser();

  const [proventos, ativosComTicker] = await Promise.all([
    getProventos(user!.id),
    getTickersAtivos(user!.id),
  ]);
  const ativos = ativosComTicker;

  const tickers = ativos.map((a) => a.ticker).filter((t): t is string => Boolean(t));

  const proventosCalculo = proventos.map((p) => ({
    ticker: p.ticker,
    valorTotal: Number(p.valorTotal),
    dataPagamento: p.dataPagamento,
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

  const proventosSerializados = proventos.map((p) => ({
    id: p.id,
    ticker: p.ticker,
    tipoPagamento: p.tipoPagamento,
    valorTotal: p.valorTotal.toString(),
    dataCom: p.dataCom ? p.dataCom.toISOString() : null,
    dataPagamento: p.dataPagamento.toISOString(),
  }));

  return (
    <>
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CartaoResumo titulo="Média mensal (12m)" valor={formatar(mediaMensal12Meses)} icone={Target} tom="neutro" />
        <CartaoResumo titulo="Total últimos 12 meses" valor={formatar(total12Meses)} icone={Coins} tom="positivo" />
        <CartaoResumo titulo="Total recebido (geral)" valor={formatar(totalGeral)} icone={Wallet} tom="neutro" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <NovoProventoForm tickers={tickers} />
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
            <ListaProventos proventos={proventosSerializados} />
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
