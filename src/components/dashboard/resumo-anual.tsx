"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NOMES_MESES_ABREV, CATEGORIAS_DESPESA } from "@/lib/categorias";
import { gerarResumoAnual, type LancamentoCalculo } from "@/lib/calculo-mensal";

function formatar(v: number) {
  if (v === 0) return "–";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function media(valores: number[]) {
  const comValor = valores.filter((v) => v !== 0);
  if (comValor.length === 0) return 0;
  return comValor.reduce((s, v) => s + v, 0) / comValor.length;
}

export function ResumoAnual({
  lancamentos,
  ano: anoInicial,
}: {
  lancamentos: LancamentoCalculo[];
  ano: number;
}) {
  const [ano, setAno] = useState(anoInicial);
  const { meses, totalAno } = gerarResumoAnual(lancamentos, ano);

  const mediaRenda = media(meses.map((m) => m.renda));
  const mediaDespesa = media(meses.map((m) => m.despesa));
  const mediaSaldo = media(meses.map((m) => m.saldo));

  return (
    <div className="card overflow-hidden p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-foreground">Resumo {ano}</h2>
          <p className="text-sm text-foreground/55">Renda, despesas e saldo mês a mês.</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setAno((a) => a - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-borda text-foreground/60 transition hover:border-dourado/40 hover:text-dourado"
            aria-label="Ano anterior"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setAno((a) => a + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-borda text-foreground/60 transition hover:border-dourado/40 hover:text-dourado"
            aria-label="Próximo ano"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="scrollbar-fina overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-foreground/50">
              <th className="sticky left-0 bg-superficie py-2 pr-4 font-medium">Categoria</th>
              {NOMES_MESES_ABREV.map((m) => (
                <th key={m} className="px-2 py-2 text-right font-medium">
                  {m}
                </th>
              ))}
              <th className="px-2 py-2 text-right font-medium text-foreground/40">Média</th>
              <th className="px-2 py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borda">
            <tr className="font-medium text-emerald-500">
              <td className="sticky left-0 bg-superficie py-2 pr-4">Renda total</td>
              {meses.map((m) => (
                <td key={m.mes} className="px-2 py-2 text-right">
                  {formatar(m.renda)}
                </td>
              ))}
              <td className="px-2 py-2 text-right text-foreground/40">{formatar(mediaRenda)}</td>
              <td className="px-2 py-2 text-right">{formatar(totalAno.renda)}</td>
            </tr>

            <tr className="font-medium text-red-500">
              <td className="sticky left-0 bg-superficie py-2 pr-4">Despesas totais</td>
              {meses.map((m) => (
                <td key={m.mes} className="px-2 py-2 text-right">
                  {formatar(m.despesa)}
                </td>
              ))}
              <td className="px-2 py-2 text-right text-foreground/40">{formatar(mediaDespesa)}</td>
              <td className="px-2 py-2 text-right">{formatar(totalAno.despesa)}</td>
            </tr>

            <tr className="font-semibold text-dourado">
              <td className="sticky left-0 bg-superficie py-2 pr-4">Saldo</td>
              {meses.map((m) => (
                <td key={m.mes} className="px-2 py-2 text-right">
                  {formatar(m.saldo)}
                </td>
              ))}
              <td className="px-2 py-2 text-right text-foreground/40">{formatar(mediaSaldo)}</td>
              <td className="px-2 py-2 text-right">{formatar(totalAno.saldo)}</td>
            </tr>

            <tr>
              <td colSpan={15} className="pt-4 pb-1 text-xs uppercase tracking-wide text-foreground/40">
                Despesas por categoria
              </td>
            </tr>

            {CATEGORIAS_DESPESA.map((categoria) => (
              <tr key={categoria} className="text-foreground/75">
                <td className="sticky left-0 bg-superficie py-2 pr-4">{categoria}</td>
                {meses.map((m) => (
                  <td key={m.mes} className="px-2 py-2 text-right">
                    {formatar(m.porCategoria[categoria])}
                  </td>
                ))}
                <td className="px-2 py-2 text-right text-foreground/40">
                  {formatar(media(meses.map((m) => m.porCategoria[categoria])))}
                </td>
                <td className="px-2 py-2 text-right font-medium">
                  {formatar(totalAno.porCategoria[categoria])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
