import { ErroApi } from "../excecoes/ErroApi.js";
import { ErroNaoAutenticado } from "../excecoes/ErroNaoAutenticado.js";
import { ErroRede } from "../excecoes/ErroRede.js";
/** Chave do localStorage onde fica o JWT do CLIENTE da loja. */
export const CHAVE_TOKEN_CLIENTE = "bp_jwt_token";
/** Fala com a API PHP. Transforma qualquer falha em um erro tipado (ErroRede, ErroApi...). */
export class ClienteApi {
    #base;
    #aoNaoAutenticado;
    #chaveToken;
    constructor(base, aoNaoAutenticado, chaveToken = CHAVE_TOKEN_CLIENTE) {
        this.#base = base;
        this.#aoNaoAutenticado = aoNaoAutenticado;
        this.#chaveToken = chaveToken;
    }
    obter(caminho) {
        return this.#requisitar(caminho, {});
    }
    enviarJson(caminho, corpo) {
        return this.#requisitar(caminho, this.#comCorpoJson("POST", corpo));
    }
    atualizarJson(caminho, corpo) {
        return this.#requisitar(caminho, this.#comCorpoJson("PUT", corpo));
    }
    #comCorpoJson(metodo, corpo) {
        return {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo),
        };
    }
    #lerToken() {
        try {
            return localStorage.getItem(this.#chaveToken);
        }
        catch {
            return null; // armazenamento bloqueado (modo privado)
        }
    }
    async #requisitar(caminho, opcoes) {
        let resposta;
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
        }
        catch {
            throw new ErroRede();
        }
        let corpo;
        try {
            corpo = (await resposta.json());
        }
        catch {
            throw new ErroApi("O servidor devolveu uma resposta inesperada.", resposta.status);
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
