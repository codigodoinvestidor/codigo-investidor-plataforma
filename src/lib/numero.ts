// Inputs numéricos usam type="text" (não "number") pra aceitar vírgula como
// separador decimal — <input type="number"> rejeita vírgula em navegadores
// com locale en-US, mesmo com o app inteiro em português.
export function normalizarDecimal(valor: string): string {
  return valor.replace(",", ".");
}

export function apenasNumerico(valor: string): string {
  return valor.replace(/[^0-9.,]/g, "");
}
