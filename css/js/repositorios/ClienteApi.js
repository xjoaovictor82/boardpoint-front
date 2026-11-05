import { ErroApi } from "../excecoes/ErroApi.js";
import { ErroNaoAutenticado } from "../excecoes/ErroNaoAutenticado.js";
import { ErroRede } from "../excecoes/ErroRede.js";
/** Fala com a API PHP. Transforma qualquer falha em um erro tipado (ErroRede, ErroApi...). */
export class ClienteApi {
    #base;
    #aoNaoAutenticado;
    constructor(base, aoNaoAutenticado) {
        this.#base = base;
        this.#aoNaoAutenticado = aoNaoAutenticado;
    }
    obter(caminho) {
        return this.#requisitar(caminho, {});
    }
    enviarJson(caminho, corpo) {
        return this.#requisitar(caminho, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo),
        });
    }
    async #requisitar(caminho, opcoes) {
        let resposta;
        // 1. Busca o Token do localStorage
        const token = localStorage.getItem("bp_jwt_token");
        // 2. Prepara os cabeçalhos incluindo a autenticação Bearer
        const headers = new Headers(opcoes.headers || {});
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        try {
            resposta = await fetch(this.#base + caminho, {
                credentials: "same-origin",
                ...opcoes,
                headers, // Adiciona os cabeçalhos com o JWT
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
            throw new ErroNaoAutenticado();
        }
        if (!resposta.ok || !corpo.sucesso) {
            throw new ErroApi(corpo.erro || "A requisição falhou.", resposta.status);
        }
        return corpo.dados;
    }
}
