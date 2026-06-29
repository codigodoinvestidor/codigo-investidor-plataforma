"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthBrandingPanel } from "@/components/auth-branding-panel";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen bg-background">
      <AuthBrandingPanel />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="font-display text-sm uppercase tracking-[0.2em] text-dourado">
              Codigo do Investidor
            </p>
          </div>

          <h2 className="font-display text-2xl text-foreground">Bem-vindo de volta</h2>
          <p className="mt-1 mb-8 text-sm text-foreground/60">
            Entre para acessar seu painel financeiro.
          </p>

          <form onSubmit={entrar} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                E-mail
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="voce@email.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                Senha
              </label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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
              <LogIn size={16} />
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-foreground/60">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-dourado hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
