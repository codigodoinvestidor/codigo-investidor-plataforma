import { NextResponse } from "next/server";
import { atualizarCotacoesDesatualizadas } from "@/lib/cotacoes";

export async function POST() {
  await atualizarCotacoesDesatualizadas();
  return NextResponse.json({ ok: true });
}
