import { getUser } from "@/lib/auth";
import { AppHeader } from "@/components/dashboard/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const nome = (user?.user_metadata?.nome as string | undefined)?.split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader nome={nome} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
