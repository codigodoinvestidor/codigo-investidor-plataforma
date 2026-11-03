"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AguardandoAprovacaoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [verificando, setVerificando] = useState(false);

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function verificarNovamente() {
    setVerificando(true);
    // A sessão guarda o app_metadata que valia no login; é preciso renovar o
    // token para refletir uma aprovação feita pelo admin depois disso.
    await supabase.auth.refreshSession();
    router.refresh();
    setVerificando(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dourado/10 text-dourado">
          <Clock3 size={26} />
        </span>
        <h1 className="font-display text-2xl text-foreground">Cadastro em análise</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Seu acesso foi recebido e está aguardando aprovação do administrador. Assim que for
          aprovado, você poderá entrar normalmente.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={verificarNovamente}
            disabled={verificando}
            className="btn-dourado flex w-full items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={verificando ? "animate-spin" : ""} />
            {verificando ? "Verificando..." : "Verificar novamente"}
          </button>

          <button
            onClick={sair}
            className="flex w-full items-center justify-center gap-1.5 rounded-full border border-borda px-3.5 py-2 text-sm text-foreground/70 transition hover:border-dourado/40 hover:text-dourado"
          >
            Sair
          </button>
        </div>
      </div>
    </main>
  );
}
