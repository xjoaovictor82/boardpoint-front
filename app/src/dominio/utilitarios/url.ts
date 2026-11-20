/** Caminhos vindos do banco são relativos ("produtos/x.jpg"): na SPA precisam começar com "/". */
export function urlPublica(caminho: string): string {
  if (/^(https?:)?\/\//.test(caminho) || caminho.startsWith("/") || caminho.startsWith("data:")) {
    return caminho;
  }
  return "/" + caminho;
}
