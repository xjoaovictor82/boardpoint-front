import { ErroBoardPoint } from "../../excecoes/ErroBoardPoint.js";

/** Cria um elemento com classe e texto (textContent: nunca interpreta HTML). */
export function criar<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classe?: string,
  texto?: string,
): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

export function celula(conteudo: string | Node, classe?: string): HTMLTableCellElement {
  const td = criar("td", classe);
  if (typeof conteudo === "string") td.textContent = conteudo;
  else td.appendChild(conteudo);
  return td;
}

export function botaoIcone(texto: string, titulo: string, classe: string, aoClicar: () => void): HTMLButtonElement {
  const botao = criar("button", classe, texto);
  botao.type = "button";
  botao.title = titulo;
  botao.addEventListener("click", (evento) => {
    evento.stopPropagation(); // não dispara o clique da linha
    aoClicar();
  });
  return botao;
}

/** "2026-08-05 20:59:21" -> "05/08/2026 20:59" */
export function formatarData(iso: string): string {
  const data = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(data.getTime())) return iso;
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${data.toLocaleDateString("pt-BR")} ${hora}`;
}

/** Mensagem pronta para o toast a partir de qualquer erro. */
export function mensagemDeErro(erro: unknown): string {
  return erro instanceof ErroBoardPoint ? erro.message : "Erro inesperado. Tente novamente.";
}

/** Lê ?id=N da URL. null = cadastro novo (ausente ou inválido). */
export function lerIdDaUrl(): number | null {
  const bruto = new URLSearchParams(window.location.search).get("id");
  if (bruto === null) return null;
  const id = Number(bruto);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function irPara(url: string, atrasoMs = 0): void {
  if (atrasoMs <= 0) window.location.href = url;
  else window.setTimeout(() => (window.location.href = url), atrasoMs);
}
