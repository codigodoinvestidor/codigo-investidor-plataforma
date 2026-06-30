import { Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CartaoResumo } from "@/components/dashboard/cartao-resumo";
import { NovoLancamentoForm } from "@/components/dashboard/novo-lancamento-form";
import { GraficoCategorias } from "@/components/dashboard/grafico-categorias";
import { ListaLancamentos } from "@/components/dashboard/lista-lancamentos";
import { ResumoAnual } from "@/components/dashboard/resumo-anual";
import { BotaoExportarCsv } from "@/components/botao-exportar-csv";
import { gerarResumoAnual } from "@/lib/calculo-mensal";
import { NOMES_MESES } from "@/lib/categorias";
import { getLancamentos } from "@/lib/queries";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const lancamentos = await getLancamentos(user!.id);

  const lancamentosCalculo = lancamentos.map((l) => ({
    tipo: l.tipo,
    categoria: l.categoria,
    valor: Number(l.valor),
    mesInicio: l.mesInicio,
    anoInicio: l.anoInicio,
    mesFim: l.mesFim,
    anoFim: l.anoFim,
  }));

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  const { meses } = gerarResumoAnual(lancamentosCalculo, anoAtual);
  const resumoMesAtual = meses[mesAtual - 1];

  const despesasPorCategoriaMesAtual = Object.entries(resumoMesAtual.porCategoria)
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
          <NovoLancamentoForm />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-1 font-display text-lg text-foreground">Despesas por categoria</h2>
            <p className="mb-4 text-sm text-foreground/55">No mês atual.</p>
            <GraficoCategorias dados={despesasPorCategoriaMesAtual} />
          </div>

          <div className="card p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-display text-lg text-foreground">Lançamentos</h2>
              <BotaoExportarCsv href="/api/lancamentos/exportar" />
            </div>
            <p className="mb-1 text-sm text-foreground/55">Seu histórico mais recente.</p>
            <ListaLancamentos
              lancamentos={lancamentos.map((l) => ({
                ...l,
                valor: l.valor.toString(),
              }))}
            />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <ResumoAnual lancamentos={lancamentosCalculo} ano={anoAtual} />
      </section>
    </>
  );
}
