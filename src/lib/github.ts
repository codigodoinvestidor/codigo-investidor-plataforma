export type CommitGithub = {
  sha: string;
  mensagem: string;
  autor: string;
  data: string;
  url: string;
};

const REPO = "codigodoinvestidor/codigo-investidor-plataforma";

// Histórico de implementações para a página /admin. Usa a API pública do GitHub
// (sem token — o repositório é público), então falhas de rede não devem derrubar
// a página: em caso de erro retorna lista vazia.
export async function getCommitsRecentes(limite = 15): Promise<CommitGithub[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/commits?per_page=${limite}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];

    const dados = await res.json();
    if (!Array.isArray(dados)) return [];

    return dados.map((c) => ({
      sha: c.sha.slice(0, 7),
      mensagem: (c.commit?.message as string)?.split("\n")[0] ?? "",
      autor: c.commit?.author?.name ?? c.author?.login ?? "—",
      data: c.commit?.author?.date ?? "",
      url: c.html_url,
    }));
  } catch {
    return [];
  }
}
