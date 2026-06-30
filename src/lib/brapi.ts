const BRAPI_BASE_URL = "https://brapi.dev/api";

type CotacaoBrapi = {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
};

// O plano gratuito da brapi.dev permite só 1 ticker por requisição,
// então buscamos cada um separadamente (em paralelo) e ignoramos falhas individuais.
export async function buscarCotacoes(tickers: string[]): Promise<CotacaoBrapi[]> {
  if (tickers.length === 0) return [];

  const token = process.env.BRAPI_TOKEN;
  if (!token) {
    throw new Error("BRAPI_TOKEN não configurado em .env.local");
  }

  const resultados = await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const resposta = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?token=${token}`);
        if (!resposta.ok) return null;

        const dados = await resposta.json();
        const cotacao = dados.results?.[0];
        return cotacao ?? null;
      } catch {
        return null;
      }
    })
  );

  return resultados.filter((c): c is CotacaoBrapi => c !== null);
}

// A brapi.dev retorna nomes em inglês/abreviado (ex: "Banco Bradesco SA Pfd").
// Aqui traduzimos para o padrão brasileiro: "Pfd" -> "PN", "SA" -> "S.A.".
function normalizarNomeAtivo(nome: string): string {
  return nome
    .replace(/\bPfd\b/gi, "PN")
    .replace(/\bSA\b/g, "S.A.")
    .trim();
}

export type PontoHistorico = { data: string; preco: number };

export async function buscarNomeAtivo(ticker: string): Promise<string | null> {
  const token = process.env.BRAPI_TOKEN;
  if (!token) return null;

  try {
    const resposta = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?token=${token}`);
    if (!resposta.ok) return null;

    const dados = await resposta.json();
    const cotacao = dados.results?.[0];
    const nome = cotacao?.longName ?? cotacao?.shortName ?? null;
    return nome ? normalizarNomeAtivo(nome) : null;
  } catch {
    return null;
  }
}
