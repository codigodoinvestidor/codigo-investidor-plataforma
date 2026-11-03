"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);

    if (error) {
      setErro("Não foi possível redefinir a senha. Peça um novo link de recuperação.");
      return;
    }

    setSucesso(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--dourado)_12%,transparent),transparent_45%),radial-gradient(circle_at_85%_75%,color-mix(in_srgb,var(--dourado)_8%,transparent),transparent_40%)]" />

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-dourado">
            Codigo do Investidor
          </p>
          <h2 className="mt-3 font-display text-2xl text-foreground">Nova senha</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Escolha uma nova senha para acessar sua conta.
          </p>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6">
          {sucesso ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
              <p className="text-sm text-foreground">Senha redefinida! Entrando...</p>
            </div>
          ) : (
            <form onSubmit={salvar} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                  Nova senha
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="input-base"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="input-base"
                  placeholder="••••••••"
                />
              </div>

              {erro && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="btn-dourado flex w-full items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound size={16} />
                {carregando ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
