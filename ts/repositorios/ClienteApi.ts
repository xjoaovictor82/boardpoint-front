import type { ClienteHttp, RespostaApi } from "../tipos/Tipos.js";
import { ErroApi } from "../excecoes/ErroApi.js";
import { ErroNaoAutenticado } from "../excecoes/ErroNaoAutenticado.js";
import { ErroRede } from "../excecoes/ErroRede.js";

/** Chave do localStorage onde fica o JWT do CLIENTE da loja. */
export const CHAVE_TOKEN_CLIENTE = "bp_jwt_token";

/** Fala com a API PHP. Transforma qualquer falha em um erro tipado (ErroRede, ErroApi...). */
export class ClienteApi implements ClienteHttp {
  readonly #base: string;
  readonly #aoNaoAutenticado: (() => void) | undefined;
  readonly #chaveToken: string;

  constructor(
    base: string,
    aoNaoAutenticado?: () => void,
    chaveToken: string = CHAVE_TOKEN_CLIENTE,
  ) {
    this.#base = base;
    this.#aoNaoAutenticado = aoNaoAutenticado;
    this.#chaveToken = chaveToken;
  }

  obter<T>(caminho: string): Promise<T> {
    return this.#requisitar<T>(caminho, {});
  }

  enviarJson<T>(caminho: string, corpo: unknown): Promise<T> {
    return this.#requisitar<T>(caminho, this.#comCorpoJson("POST", corpo));
  }

  atualizarJson<T>(caminho: string, corpo: unknown): Promise<T> {
    return this.#requisitar<T>(caminho, this.#comCorpoJson("PUT", corpo));
  }

  excluir<T>(caminho: string): Promise<T> {
    return this.#requisitar<T>(caminho, { method: "DELETE" });
  }

  /** Upload de arquivo (multipart). Sem Content-Type: o navegador monta o limite sozinho. */
  enviarFormulario<T>(caminho: string, formulario: FormData): Promise<T> {
    return this.#requisitar<T>(caminho, { method: "POST", body: formulario });
  }

  #comCorpoJson(metodo: string, corpo: unknown): RequestInit {
    return {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    };
  }

  #lerToken(): string | null {
    try {
      return localStorage.getItem(this.#chaveToken);
    } catch {
      return null; // armazenamento bloqueado (modo privado)
    }
  }

  async #requisitar<T>(caminho: string, opcoes: RequestInit): Promise<T> {
    let resposta: Response;

    // Envia o JWT (se houver) no cabeçalho Authorization: Bearer ...
    const headers = new Headers(opcoes.headers || {});
    const token = this.#lerToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      resposta = await fetch(this.#base + caminho, {
        credentials: "same-origin",
        ...opcoes,
        headers,
      });
    } catch {
      throw new ErroRede();
    }

    let corpo: RespostaApi<T>;
    try {
      corpo = (await resposta.json()) as RespostaApi<T>;
    } catch {
      throw new ErroApi(
        "O servidor devolveu uma resposta inesperada.",
        resposta.status,
      );
    }

    if (resposta.status === 401) {
      this.#aoNaoAutenticado?.();
      throw new ErroNaoAutenticado(corpo.erro || undefined);
    }
    if (!resposta.ok || !corpo.sucesso) {
      throw new ErroApi(corpo.erro || "A requisição falhou.", resposta.status);
    }
    return corpo.dados;
  }
}
