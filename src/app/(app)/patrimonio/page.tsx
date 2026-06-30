import { getUser } from "@/lib/auth";
import { getAtivos } from "@/lib/queries";
import { PatrimonioContent } from "@/components/patrimonio/patrimonio-content";

export default async function PatrimonioPage() {
  const user = await getUser();
  const ativos = await getAtivos(user!.id);
  const initialData = ativos.map((a) => ({
    ...a,
    quantidade: a.quantidade.toString(),
    valorCompraUnitario: a.valorCompraUnitario.toString(),
    dataCompra: a.dataCompra.toISOString(),
    percentualIdeal: a.percentualIdeal?.toString() ?? null,
  }));
  return <PatrimonioContent initialData={initialData} />;
}
