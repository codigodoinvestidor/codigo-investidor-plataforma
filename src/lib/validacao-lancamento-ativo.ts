import { z } from "zod";

export const lancamentoAtivoSchema = z.object({
  tipo: z.enum(["COMPRA", "VENDA"]),
  ticker: z.string().min(1).max(10).toUpperCase().optional().nullable(),
  nome: z.string().max(100).optional().nullable(),
  quantidade: z.coerce.number().positive(),
  precoUnitario: z.coerce.number().positive(),
  valorTotal: z.coerce.number().positive(),
  dataOperacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  corretora: z.string().max(100).optional().nullable(),
});

export type LancamentoAtivoInput = z.infer<typeof lancamentoAtivoSchema>;
