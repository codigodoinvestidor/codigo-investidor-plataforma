import { getUser } from "@/lib/auth";
import { getAtivosComTicker } from "@/lib/queries";
import { calcularTodosPeriodos } from "@/lib/rentabilidade";
import { RentabilidadeContent } from "@/components/rentabilidade/rentabilidade-content";

export default async function RentabilidadePage() {
  const user = await getUser();
  const ativos = await getAtivosComTicker(user!.id);

  if (ativos.length === 0) {
    return <RentabilidadeContent initialData={{ vazio: true }} />;
  }

  const ativosParaCalculo = ativos.map((a) => ({
    ticker: a.ticker as string,
    quantidade: Number(a.quantidade),
  }));

  const todos = await calcularTodosPeriodos(ativosParaCalculo);
  return <RentabilidadeContent initialData={{ vazio: false, todos }} />;
}
