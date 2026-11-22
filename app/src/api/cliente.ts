import type { RespostaApi } from "../tipos";
import { ErroApi, ErroNaoAutenticado, ErroRede } from "./erros";

/** Chave do localStorage onde fica o JWT do CLIENTE da loja (a mesma do site antigo). */
export const CHAVE_TOKEN_CLIENTE = "bp_jwt_token";

const BASE = "/api";

function lerToken(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null; // armazenamento bloqueado (modo privado)
  }
}

async function requisitar<T>(
  caminho: string,
  opcoes: RequestInit = {},
  chaveToken: string = CHAVE_TOKEN_CLIENTE
): Promise<T> {
  // Envia o JWT (se houver) no cabeçalho Authorization: Bearer ...
  const headers = new Headers(opcoes.headers);
  const token = lerToken(chaveToken);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let resposta: Response;
  try {
    resposta = await fetch(BASE + caminho, { credentials: "same-origin", ...opcoes, headers });
  } catch {
    throw new ErroRede();
  }

  let corpo: RespostaApi<T>;
  try {
    corpo = (await resposta.json()) as RespostaApi<T>;
  } catch {
    throw new ErroApi("O servidor devolveu uma resposta inesperada.", resposta.status);
  }

  if (resposta.status === 401) {
    throw new ErroNaoAutenticado(corpo.erro);
  }
  if (!resposta.ok || !corpo.sucesso) {
    throw new ErroApi(corpo.erro ?? "A requisição falhou.", resposta.status);
  }
  return corpo.dados;
}

function comCorpoJson(metodo: string, corpo: unknown): RequestInit {
  return {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  };
}

/** Cliente da API. Os caminhos NÃO levam "/api": use api.obter("/publico/produtos"). */
export const api = {
  obter: <T>(caminho: string) => requisitar<T>(caminho),
  enviarJson: <T>(caminho: string, corpo: unknown) =>
    requisitar<T>(caminho, comCorpoJson("POST", corpo)),
  atualizarJson: <T>(caminho: string, corpo: unknown) =>
    requisitar<T>(caminho, comCorpoJson("PUT", corpo)),
  excluir: <T>(caminho: string) => requisitar<T>(caminho, { method: "DELETE" }),
  /** multipart/form-data (upload). O navegador define o Content-Type sozinho. */
  enviarFormulario: <T>(caminho: string, corpo: FormData) =>
    requisitar<T>(caminho, { method: "POST", body: corpo }),
};