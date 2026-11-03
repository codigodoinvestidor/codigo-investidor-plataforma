"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogIn,
  TrendingUp,
  ShieldCheck,
  PieChart,
  LayoutDashboard,
  Mail,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { IlustracaoLogin } from "@/components/login/ilustracao-login";

const BENEFICIOS = [
  { icone: TrendingUp, texto: "Renda, despesas e patrimônio" },
  { icone: PieChart, texto: "Alocação e gastos por categoria" },
  { icone: ShieldCheck, texto: "Seus dados, protegidos e só seus" },
];

function FormularioLogin({ onEsqueciSenha }: { onEsqueciSenha: () => void }) {
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

    fetch("/api/acessos", { method: "POST" }).catch(() => {});

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={entrar} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">E-mail</label>
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
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground/80">Senha</label>
          <button
            type="button"
            onClick={onEsqueciSenha}
            className="text-xs font-medium text-dourado hover:underline"
          >
            Esqueci minha senha
          </button>
        </div>
        <input
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input-base"
          placeholder="••••••••"
        />
      </div>

      {erro && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={carregando}
        className="btn-dourado flex w-full items-center justify-center gap-2 disabled:opacity-50"
      >
        <LogIn size={16} />
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

function FormularioRecuperarSenha({ onVoltar }: { onVoltar: () => void }) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });

    setCarregando(false);

    if (error) {
      setErro("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 size={32} className="text-emerald-500" />
        <p className="text-sm text-foreground">
          Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.
        </p>
        <button
          type="button"
          onClick={onVoltar}
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-dourado hover:underline"
        >
          <ArrowLeft size={14} /> Voltar para o login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <p className="text-sm text-foreground/60">
        Informe seu e-mail e enviaremos um link para você criar uma nova senha.
      </p>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/80">E-mail</label>
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

      {erro && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={carregando}
        className="btn-dourado flex w-full items-center justify-center gap-2 disabled:opacity-50"
      >
        <Mail size={16} />
        {carregando ? "Enviando..." : "Enviar link de recuperação"}
      </button>

      <button
        type="button"
        onClick={onVoltar}
        className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft size={14} /> Voltar para o login
      </button>
    </form>
  );
}

export default function LoginPage() {
  const [recuperarSenha, setRecuperarSenha] = useState(false);

  return (
    <main className="flex min-h-screen bg-background">
      {/* Painel ilustrativo: visível a partir de telas médias, reforça a identidade da marca */}
      <div className="relative hidden w-[46%] overflow-hidden lg:block">
        <IlustracaoLogin />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dourado-claro to-dourado text-navy">
              <LayoutDashboard size={20} />
            </span>
            <p className="font-display text-sm uppercase tracking-[0.2em] text-dourado-claro">
              Codigo do Investidor
            </p>
          </div>

          <div>
            <h1 className="font-display text-3xl leading-tight text-white">
              Seu patrimônio,
              <br />
              organizado e sob controle.
            </h1>
            <ul className="mt-8 flex flex-col gap-4">
              {BENEFICIOS.map(({ icone: Icone, texto }) => (
                <li key={texto} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-dourado-claro">
                    <Icone size={15} />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Codigo do Investidor
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden px-6 py-16 lg:w-[54%]">
        <div className="pointer-events-none absolute inset-0 -z-10 lg:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,color-mix(in_srgb,var(--dourado)_16%,transparent),transparent_42%),radial-gradient(circle_at_85%_80%,color-mix(in_srgb,var(--dourado)_10%,transparent),transparent_40%),radial-gradient(circle_at_50%_100%,color-mix(in_srgb,var(--navy)_30%,transparent),transparent_60%)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-dourado-claro to-dourado text-navy shadow-lg shadow-dourado/20 lg:hidden">
              <LayoutDashboard size={22} />
            </span>
            <p className="font-display text-sm uppercase tracking-[0.2em] text-dourado lg:hidden">
              Codigo do Investidor
            </p>
            <h2 className="mt-3 font-display text-2xl text-foreground">
              {recuperarSenha ? "Recuperar senha" : "Bem-vindo de volta"}
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              {recuperarSenha
                ? "Vamos te ajudar a voltar a acessar sua conta."
                : "Entre para acessar seu painel financeiro."}
            </p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-superficie/70 p-6 shadow-xl shadow-black/5 backdrop-blur-sm">
            {recuperarSenha ? (
              <FormularioRecuperarSenha onVoltar={() => setRecuperarSenha(false)} />
            ) : (
              <>
                <FormularioLogin onEsqueciSenha={() => setRecuperarSenha(true)} />
                <p className="mt-6 text-center text-sm text-foreground/60">
                  Ainda não tem conta?{" "}
                  <Link href="/cadastro" className="font-medium text-dourado hover:underline">
                    Cadastre-se
                  </Link>
                </p>
              </>
            )}
          </div>

          <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between lg:hidden">
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
      </div>
    </main>
  );
}
