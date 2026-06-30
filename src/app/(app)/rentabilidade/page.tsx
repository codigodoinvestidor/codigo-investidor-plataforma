import { getUser } from "@/lib/auth";
import { getAtivosComTicker } from "@/lib/queries";
import { calcularTodosPeriodos } from "@/lib/rentabilidade";
import { RentabilidadeContent } from "@/components/rentabilidade/rentabilidade-content";

export default async function RentabilidadePage() {
  const t0 = Date.now();
  const user = await getUser();
  console.log(`[rentabilidade] getUser: ${Date.now() - t0}ms`);

  const t1 = Date.now();
  const ativos = await getAtivosComTicker(user!.id);
  console.log(`[rentabilidade] getAtivosComTicker: ${Date.now() - t1}ms (${ativos.length} ativos)`);

  if (ativos.length === 0) {
    return <RentabilidadeContent initialData={{ vazio: true }} />;
  }

  const ativosParaCalculo = ativos.map((a) => ({
    ticker: a.ticker as string,
    quantidade: Number(a.quantidade),
  }));

  const t2 = Date.now();
  const todos = await calcularTodosPeriodos(ativosParaCalculo);
  console.log(`[rentabilidade] calcularTodosPeriodos: ${Date.now() - t2}ms`);
  console.log(`[rentabilidade] TOTAL: ${Date.now() - t0}ms`);
  return <RentabilidadeContent initialData={{ vazio: false, todos }} />;
}
