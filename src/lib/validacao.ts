import { z } from "zod";

export const lancamentoSchema = z
  .object({
    tipo: z.enum(["RENDA", "DESPESA"]),
    categoria: z.string().min(1, "Categoria é obrigatória"),
    descricao: z.string().min(1, "Descrição é obrigatória"),
    valor: z.coerce.number().positive("Valor deve ser maior que zero"),
    mesInicio: z.coerce.number().int().min(1).max(12),
    anoInicio: z.coerce.number().int().min(2000).max(2100),
    mesFim: z.coerce.number().int().min(1).max(12).nullable().optional(),
    anoFim: z.coerce.number().int().min(2000).max(2100).nullable().optional(),
  })
  .refine(
    (dados) => {
      if (dados.mesFim == null || dados.anoFim == null) return true;
      return (
        dados.anoFim > dados.anoInicio ||
        (dados.anoFim === dados.anoInicio && dados.mesFim >= dados.mesInicio)
      );
    },
    { message: "O término não pode ser antes do início", path: ["mesFim"] }
  );

export type LancamentoInput = z.infer<typeof lancamentoSchema>;
