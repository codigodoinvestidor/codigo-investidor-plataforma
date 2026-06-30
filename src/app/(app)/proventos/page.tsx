import { getUser } from "@/lib/auth";
import { getProventos, getTickersAtivos } from "@/lib/queries";
import { ProventosContent } from "@/components/proventos/proventos-content";

export default async function ProventosPage() {
  const user = await getUser();
  const [proventos, ativos] = await Promise.all([
    getProventos(user!.id),
    getTickersAtivos(user!.id),
  ]);

  const initialProventos = proventos.map((p) => ({
    id: p.id,
    ticker: p.ticker,
    tipoPagamento: p.tipoPagamento,
    valorTotal: p.valorTotal.toString(),
    dataCom: p.dataCom ? new Date(p.dataCom).toISOString() : null,
    dataPagamento: new Date(p.dataPagamento).toISOString(),
  }));

  const initialTickers = ativos.map((a) => a.ticker).filter(Boolean) as string[];

  return <ProventosContent initialProventos={initialProventos} initialTickers={initialTickers} />;
}
