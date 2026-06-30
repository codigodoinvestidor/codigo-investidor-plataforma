"use client";

import { useCallback } from "react";
import { Landmark, Wallet, TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { CartaoResumo } from "@/components/dashboard/cartao-resumo";
import { NovoAtivoForm } from "@/components/patrimonio/novo-ativo-form";
import { GraficoAlocacao } from "@/components/patrimonio/grafico-alocacao";
import { GraficoEvolucao } from "@/components/patrimonio/grafico-evolucao";
import { AcordeaoAtivos } from "@/components/patrimonio/acordeao-ativos";
import { BotaoExportarCsv } from "@/components/botao-exportar-csv";
import { rotuloTipoAtivo } from "@/lib/ativos";
import { evolucaoValorAplicado } from "@/lib/calculo-patrimonio";
import type { AtivoComValor } from "@/lib/tipos-patrimonio";

type AtivoApi = {
  id: string;
  tipo: string;
  ticker: string | null;
  nome: string;
  quantidade: string;
  valorCompraUnitario: string;
  dataCompra: string;
  percentualIdeal: string | null;
};

type CotacoesApi = Record<string, { preco: number; variacaoDia: number | null }>;

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-foreground/5" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-96 rounded-2xl bg-foreground/5" />
        <div className="h-96 rounded-2xl bg-foreground/5 lg:col-span-2" />
      </div>
    </div>
  );
}

export function PatrimonioContent() {
  const { data: ativos, loading, refresh: recarregarAtivos } = useCachedFetch<AtivoApi[]>(
    "ativos",
    async () => { const r = await fetch("/api/ativos"); return r.json(); }
  );
  const { data: cotacoesData, refresh: recarregarCotacoes } = useCachedFetch<CotacoesApi>(
    "cotacoes",
    async () => { const r = await fetch("/api/cotacoes"); return r.json(); }
  );
  const cotacoes: CotacoesApi = cotacoesData ?? {};

  const carregar = useCallback(async () => {
    await Promise.all([recarregarAtivos(), recarregarCotacoes()]);
    // atualiza cotações externas em background
    fetch("/api/cotacoes/atualizar", { method: "POST" }).then(() => recarregarCotacoes());
  }, [recarregarAtivos, recarregarCotacoes]);

  if (loading || !ativos) return <Skeleton />;

  const ativosComValor: AtivoComValor[] = ativos.map((a) => {
    const quantidade = Number(a.quantidade);
    const valorCompraUnitario = Number(a.valorCompraUnitario);
    const valorCompra = quantidade * valorCompraUnitario;
    const cotacao = a.ticker ? cotacoes[a.ticker] : undefined;
    const temCotacao = cotacao !== undefined;
    const precoAtual = cotacao?.preco ?? valorCompraUnitario;
    const valorAtual = quantidade * precoAtual;
    const ganho = valorAtual - valorCompra;
    const rentabilidadePct = valorCompra > 0 ? (ganho / valorCompra) * 100 : 0;

    return {
      id: a.id,
      tipo: a.tipo as AtivoComValor["tipo"],
      ticker: a.ticker,
      nome: a.nome,
      quantidade: a.quantidade,
      valorCompraUnitario: a.valorCompraUnitario,
      dataCompra: a.dataCompra,
      percentualIdeal: a.percentualIdeal ? Number(a.percentualIdeal) : null,
      precoAtual,
      valorAtual,
      valorCompra,
      ganho,
      rentabilidadePct,
      temCotacao,
      variacaoDia: cotacao?.variacaoDia ?? null,
    };
  });

  const valorTotalPatrimonio = ativosComValor.reduce((s, a) => s + a.valorAtual, 0);
  const valorTotalAplicado = ativosComValor.reduce((s, a) => s + a.valorCompra, 0);
  const lucroTotal = valorTotalPatrimonio - valorTotalAplicado;

  const alocacaoPorTipo = Object.values(
    ativosComValor.reduce<Record<string, { categoria: string; total: number }>>((acc, a) => {
      const chave = rotuloTipoAtivo(a.tipo);
      acc[chave] ??= { categoria: chave, total: 0 };
      acc[chave].total += a.valorAtual;
      return acc;
    }, {})
  );

  const evolucaoBase = evolucaoValorAplicado(
    ativos.map((a) => ({
      quantidade: Number(a.quantidade),
      valorCompraUnitario: Number(a.valorCompraUnitario),
      dataCompra: new Date(a.dataCompra),
    }))
  );
  const evolucao = evolucaoBase.map((ponto, i) => ({
    ...ponto,
    ganhoCapital: i === evolucaoBase.length - 1 ? lucroTotal : 0,
  }));

  const maiorPosicao = [...ativosComValor].sort((a, b) => b.valorAtual - a.valorAtual)[0];
  const pctMaiorPosicao =
    maiorPosicao && valorTotalPatrimonio > 0
      ? (maiorPosicao.valorAtual / valorTotalPatrimonio) * 100
      : 0;

  const formatar = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoResumo titulo="Patrimônio total" valor={formatar(valorTotalPatrimonio)} icone={Landmark} tom="neutro" />
        <CartaoResumo titulo="Valor aplicado" valor={formatar(valorTotalAplicado)} icone={Wallet} tom="neutro" />
        <CartaoResumo
          titulo="Lucro total"
          valor={formatar(lucroTotal)}
          icone={lucroTotal >= 0 ? TrendingUp : TrendingDown}
          tom={lucroTotal >= 0 ? "positivo" : "negativo"}
        />
        <CartaoResumo
          titulo="Maior posição"
          valor={maiorPosicao ? `${maiorPosicao.ticker ?? maiorPosicao.nome} · ${pctMaiorPosicao.toFixed(1)}%` : "—"}
          icone={Trophy}
          tom="neutro"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <NovoAtivoForm onSuccess={carregar} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-1 font-display text-lg text-foreground">Evolução do patrimônio</h2>
            <p className="mb-4 text-sm text-foreground/55">Valor aplicado nos últimos 12 meses. Ganho de capital aparece no mês atual.</p>
            <GraficoEvolucao dados={evolucao} />
          </div>

          <div className="card p-6">
            <h2 className="mb-1 font-display text-lg text-foreground">Ativos na carteira</h2>
            <p className="mb-4 text-sm text-foreground/55">Como seu patrimônio está distribuído.</p>
            <GraficoAlocacao dados={alocacaoPorTipo} />
          </div>

          <div className="card p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-display text-lg text-foreground">Meus ativos</h2>
              <BotaoExportarCsv href="/api/ativos/exportar" />
            </div>
            <p className="mb-4 text-sm text-foreground/55">Agrupados por classe. Cotação em tempo real para ações, FIIs e ETFs.</p>
            <AcordeaoAtivos ativos={ativosComValor} valorTotalPatrimonio={valorTotalPatrimonio} onRefresh={carregar} />
          </div>
        </div>
      </section>
    </>
  );
}
