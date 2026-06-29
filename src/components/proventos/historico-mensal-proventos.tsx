import { NOMES_MESES_ABREV } from "@/lib/categorias";
import { resumoAnualProventos, type ProventoCalculo } from "@/lib/calculo-proventos";

const formatarMoeda = (v: number) =>
  v === 0 ? "–" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function HistoricoMensalProventos({
  proventos,
  anos,
}: {
  proventos: ProventoCalculo[];
  anos: number[];
}) {
  return (
    <div className="scrollbar-fina overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-foreground/50">
            <th className="sticky left-0 bg-superficie py-2 pr-4 font-medium">Ano</th>
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
          {anos.map((ano) => {
            const { meses, totalAno, mediaAno } = resumoAnualProventos(proventos, ano);
            return (
              <tr key={ano}>
                <td className="sticky left-0 bg-superficie py-2 pr-4 font-medium text-foreground">
                  {ano}
                </td>
                {meses.map((m) => (
                  <td key={m.mes} className="px-2 py-2 text-right text-foreground/75">
                    {formatarMoeda(m.total)}
                  </td>
                ))}
                <td className="px-2 py-2 text-right text-foreground/40">
                  {formatarMoeda(mediaAno)}
                </td>
                <td className="px-2 py-2 text-right font-semibold text-dourado">
                  {formatarMoeda(totalAno)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
