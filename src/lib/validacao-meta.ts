import { z } from "zod";

export const metaSchema = z.object({
  tipo: z.enum(["PATRIMONIO", "DIVIDENDOS"]),
  nome: z.string().trim().max(60).optional().nullable(),
  valorAlvo: z.coerce.number().positive(),
  dataAlvo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

// Edição não permite trocar o tipo da meta (não faz sentido virar de
// Patrimônio pra Dividendos), então esse campo fica de fora do update.
export const metaAtualizarSchema = metaSchema.omit({ tipo: true });

export type MetaInput = z.infer<typeof metaSchema>;
