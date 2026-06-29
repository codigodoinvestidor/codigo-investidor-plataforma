"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SairButton() {
  const router = useRouter();
  const supabase = createClient();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={sair}
      className="flex items-center gap-1.5 rounded-full border border-borda px-3.5 py-1.5 text-sm text-foreground/70 transition hover:border-dourado/40 hover:text-dourado"
    >
      <LogOut size={14} />
      Sair
    </button>
  );
}
