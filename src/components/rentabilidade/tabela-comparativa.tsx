type Ponto = {
  data: string;
  carteira: number;
  ibov: number | null;
  cdi: number;
  ipca: number;
};

function formatarPct(v: number | null) {
  if (v == null) return "—";
  const sinal = v >= 0 ? "+" : "";
  return `${sinal}${v.toFixed(2)}%`;
}

function corPct(v: number | null) {
  if (v == null) return "text-foreground/40";
  return v >= 0 ? "text-emerald-500" : "text-red-500";
}

export function TabelaComparativa({ dados }: { dados: Ponto[] }) {
  return (
    <div className="scrollbar-fina overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-foreground/40">
            <th className="py-2 pr-2">Período</th>
            <th className="px-2 py-2 text-right">Carteira</th>
            <th className="px-2 py-2 text-right">IBOV</th>
            <th className="px-2 py-2 text-right">CDI</th>
            <th className="px-2 py-2 text-right">IPCA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borda">
          {dados.map((p) => (
            <tr key={p.data}>
              <td className="py-2.5 pr-2 font-medium text-foreground">{p.data}</td>
              <td className={`px-2 py-2.5 text-right font-semibold ${corPct(p.carteira)}`}>
                {formatarPct(p.carteira)}
              </td>
              <td className={`px-2 py-2.5 text-right ${corPct(p.ibov)}`}>{formatarPct(p.ibov)}</td>
              <td className={`px-2 py-2.5 text-right ${corPct(p.cdi)}`}>{formatarPct(p.cdi)}</td>
              <td className={`px-2 py-2.5 text-right ${corPct(p.ipca)}`}>{formatarPct(p.ipca)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
