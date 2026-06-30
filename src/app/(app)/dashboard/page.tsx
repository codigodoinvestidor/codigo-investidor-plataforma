import { getUser } from "@/lib/auth";
import { getLancamentos } from "@/lib/queries";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const user = await getUser();
  const lancamentos = await getLancamentos(user!.id);
  const initialData = lancamentos.map((l) => ({
    id: l.id,
    tipo: l.tipo,
    categoria: l.categoria,
    descricao: l.descricao,
    valor: l.valor.toString(),
    mesInicio: l.mesInicio,
    anoInicio: l.anoInicio,
    mesFim: l.mesFim,
    anoFim: l.anoFim,
  }));
  return <DashboardContent initialData={initialData} />;
}
