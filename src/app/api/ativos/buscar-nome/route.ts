import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buscarNomeAtivo } from "@/lib/brapi";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const ticker = new URL(request.url).searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ erro: "Ticker é obrigatório" }, { status: 400 });
  }

  const nome = await buscarNomeAtivo(ticker.toUpperCase());

  if (!nome) {
    return NextResponse.json({ nome: null }, { status: 404 });
  }

  return NextResponse.json({ nome });
}
