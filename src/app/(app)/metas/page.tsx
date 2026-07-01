import { getUser } from "@/lib/auth";
import { getAtivos, getProventos, getMetas } from "@/lib/queries";
import { MetasContent } from "@/components/metas/metas-content";

export default async function MetasPage() {
  const user = await getUser();
  const [ativos, proventos, metas] = await Promise.all([
    getAtivos(user!.id),
    getProventos(user!.id),
    getMetas(user!.id),
  ]);

  const initialAtivos = ativos.map((a) => ({
    id: a.id,
    tipo: a.tipo,
    ticker: a.ticker,
    nome: a.nome,
    quantidade: a.quantidade.toString(),
    valorCompraUnitario: a.valorCompraUnitario.toString(),
    dataCompra: new Date(a.dataCompra).toISOString(),
    percentualIdeal: a.percentualIdeal?.toString() ?? null,
  }));

  const initialProventos = proventos.map((p) => ({
    id: p.id,
    ticker: p.ticker,
    valorTotal: p.valorTotal.toString(),
    dataPagamento: new Date(p.dataPagamento).toISOString(),
  }));

  const initialMetas = metas.map((m) => ({
    id: m.id,
    tipo: m.tipo,
    nome: m.nome,
    valorAlvo: m.valorAlvo.toString(),
    dataAlvo: m.dataAlvo ? new Date(m.dataAlvo).toISOString() : null,
  }));

  return (
    <MetasContent
      initialAtivos={initialAtivos}
      initialProventos={initialProventos}
      initialMetas={initialMetas}
    />
  );
}
