import { obterElemento } from "../utilitarios/dom.js";
import type { ErrosCampos } from "./validacoes.js";

/** Mostra (ou limpa) a mensagem de erro embaixo de um campo. O <small> chama `erro-<campo>`. */
export function definirErroCampo(campo: string, mensagem: string): void {
  const aviso = obterElemento(`erro-${campo}`);
  const entrada = obterElemento<HTMLInputElement>(`campo-${campo}`);
  aviso.textContent = mensagem;
  entrada.classList.toggle("campo__entrada--erro", mensagem !== "");
  entrada.setAttribute("aria-invalid", mensagem !== "" ? "true" : "false");
}

export function mostrarErrosCampos(campos: string[], erros: ErrosCampos): void {
  for (const campo of campos) {
    definirErroCampo(campo, erros[campo] ?? "");
  }
}

export function limparErroAoDigitar(campos: string[]): void {
  for (const campo of campos) {
    obterElemento(`campo-${campo}`).addEventListener("input", () => definirErroCampo(campo, ""));
  }
}

export function mostrarAlerta(texto: string, tipo: "erro" | "sucesso"): void {
  const alerta = obterElemento("alerta");
  alerta.textContent = texto;
  alerta.className = `alerta alerta--${tipo}`;
  alerta.hidden = false;
}

export function esconderAlerta(): void {
  obterElemento("alerta").hidden = true;
}

/** Trava o botão enquanto a requisição está em andamento (evita clique duplo). */
export async function comBotaoOcupado(botao: HTMLButtonElement, textoOcupado: string, acao: () => Promise<void>): Promise<void> {
  const textoOriginal = botao.textContent ?? "";
  botao.disabled = true;
  botao.textContent = textoOcupado;
  try {
    await acao();
  } finally {
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}