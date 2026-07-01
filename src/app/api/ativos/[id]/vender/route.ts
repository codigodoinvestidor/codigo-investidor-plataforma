import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sincronizarAtivo, sincronizarAtivoPorId } from "@/lib/sincronizar-ativo";

const vendaSchema = z.object({
  quantidade: z.coerce.number().positive(),
  precoUnitario: z.coerce.number().positive(),
  dataOperacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const ativo = await prisma.ativo.findUnique({ where: { id } });
  if (!ativo || ativo.userId !== user.id) {
    return NextResponse.json({ erro: "Ativo não encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const resultado = vendaSchema.safeParse(body);
  if (!resultado.success) return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });

  const { quantidade, precoUnitario, dataOperacao } = resultado.data;
  if (quantidade > Number(ativo.quantidade)) {
    return NextResponse.json({ erro: "Quantidade maior que a possuída" }, { status: 400 });
  }

  await prisma.lancamentoAtivo.create({
    data: {
      userId: user.id,
      tipo: "VENDA",
      ticker: ativo.ticker,
      ativoId: ativo.ticker ? null : ativo.id,
      nome: ativo.nome,
      quantidade,
      precoUnitario,
      valorTotal: quantidade * precoUnitario,
      dataOperacao: new Date(dataOperacao),
      corretora: null,
    },
  });

  if (ativo.ticker) {
    await sincronizarAtivo(user.id, ativo.ticker);
  } else {
    await sincronizarAtivoPorId(user.id, ativo.id);
  }

  revalidateTag(`ativos-${user.id}`, {});
  return NextResponse.json({ ok: true });
}
