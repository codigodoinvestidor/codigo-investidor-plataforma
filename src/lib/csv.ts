function escaparCampoCsv(valor: unknown): string {
  const texto = String(valor ?? "");
  if (/[",\n;]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export function gerarCsv(cabecalho: string[], linhas: unknown[][]): string {
  const todasLinhas = [cabecalho, ...linhas];
  const corpo = todasLinhas.map((linha) => linha.map(escaparCampoCsv).join(";")).join("\n");
  return `﻿${corpo}`;
}
