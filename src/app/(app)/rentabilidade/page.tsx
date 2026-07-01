import { getUser } from "@/lib/auth";
import { getAtivosComTicker, getProventos } from "@/lib/queries";
import { calcularTodosPeriodos } from "@/lib/rentabilidade";
import { RentabilidadeContent } from "@/components/rentabilidade/rentabilidade-content";

export default async function RentabilidadePage() {
  const user = await getUser();
  const [ativos, proventos] = await Promise.all([
    getAtivosComTicker(user!.id),
    getProventos(user!.id),
  ]);

  if (ativos.length === 0) {
    return <RentabilidadeContent initialData={{ vazio: true }} />;
  }

  const ativosParaCalculo = ativos.map((a) => ({
    ticker: a.ticker as string,
    quantidade: Number(a.quantidade),
  }));

  const proventosParaCalculo = proventos.map((p) => ({
    ticker: p.ticker,
    valorTotal: Number(p.valorTotal),
    dataPagamento: p.dataPagamento.toISOString().slice(0, 10),
  }));

  const todos = await calcularTodosPeriodos(ativosParaCalculo, proventosParaCalculo);
  return <RentabilidadeContent initialData={{ vazio: false, todos }} />;
}
