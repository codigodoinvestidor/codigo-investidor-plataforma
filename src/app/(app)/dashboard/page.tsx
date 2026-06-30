import { getUser } from "@/lib/auth";
import { getLancamentos } from "@/lib/queries";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const user = await getUser();
  const lancamentos = await getLancamentos(user!.id);
  const initialData = lancamentos.map((l) => ({
    ...l,
    valor: l.valor.toString(),
  }));
  return <DashboardContent initialData={initialData} />;
}
