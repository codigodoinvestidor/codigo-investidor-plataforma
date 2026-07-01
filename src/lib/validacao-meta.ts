import { z } from "zod";

export const metaSchema = z.object({
  tipo: z.enum(["PATRIMONIO", "DIVIDENDOS"]),
  valorAlvo: z.coerce.number().positive(),
  dataAlvo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

export type MetaInput = z.infer<typeof metaSchema>;
