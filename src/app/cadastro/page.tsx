"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, MailCheck, TrendingUp, ShieldCheck, PieChart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const BENEFICIOS = [
  { icone: TrendingUp, texto: "Renda, despesas e patrimônio" },
  { icone: PieChart, texto: "Alocação e gastos por categoria" },
  { icone: ShieldCheck, texto: "Seus dados, protegidos e só seus" },
];

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setCarregando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setSucesso(true);
  }

  if (sucesso) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
        <div className="card max-w-sm p-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-dourado/15 text-dourado">
            <MailCheck size={22} />
          </span>
          <h1 className="mb-2 font-display text-xl text-foreground">Quase lá!</h1>
          <p className="text-sm leading-relaxed text-foreground/70">
            Enviamos um e-mail de confirmação para <strong>{email}</strong>. Confirme para
            poder entrar na plataforma.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-dourado">
            Código do Investidor
          </p>
          <h2 className="mt-3 font-display text-2xl text-foreground">Criar conta</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Comece a organizar sua vida financeira em minutos.
          </p>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6">
          <form onSubmit={cadastrar} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">Nome</label>
              <input
                type="text"
                required
                autoFocus
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-base"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                E-mail
              </label>
              <input
                type="email"
                required
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
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-base"
                placeholder="Mínimo 6 caracteres"
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
              <UserPlus size={16} />
              {carregando ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/60">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-dourado hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {BENEFICIOS.map(({ icone: Icone, texto }) => (
            <li
              key={texto}
              className="flex items-center gap-2 text-xs text-foreground/50 sm:flex-col sm:text-center"
            >
              <Icone size={14} className="shrink-0 text-dourado" />
              <span>{texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
