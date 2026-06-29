const BACEN_BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

export const SERIE_CDI = 12;
export const SERIE_IPCA = 433;

type PontoBacen = { data: string; valor: string };

function parseDataBr(data: string): Date {
  const [dia, mes, ano] = data.split("/").map(Number);
  return new Date(ano, mes - 1, dia);
}

// CDI: série diária (% ao dia). IPCA: série mensal (% no mês).
// API pública do Banco Central, sem necessidade de token.
export async function buscarSerieBacen(codigo: number, ultimosN: number) {
  try {
    const resposta = await fetch(
      `${BACEN_BASE_URL}.${codigo}/dados/ultimos/${ultimosN}?formato=json`
    );
    if (!resposta.ok) return [];

    const dados: PontoBacen[] = await resposta.json();
    return dados.map((p) => ({ data: parseDataBr(p.data), valorPct: Number(p.valor) }));
  } catch {
    return [];
  }
}

export function acumularRetorno(pontos: { valorPct: number }[]) {
  return pontos.reduce((acumulado, p) => acumulado * (1 + p.valorPct / 100), 1);
}
