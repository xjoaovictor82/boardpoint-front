import { CHAVE_TOKEN_CLIENTE } from "../repositorios/ClienteApi.js";
const CHAVE_NOME = "bp_cliente_nome";
/** Lê o campo `exp` (segundos desde 1970) do payload de um JWT. Não valida a assinatura:
 *  quem valida é o servidor. Aqui só evitamos mostrar "logado" com um token já vencido. */
function lerValidade(token) {
    try {
        const payload = token.split(".")[1];
        if (payload === undefined)
            return null;
        const objeto = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        if (typeof objeto === "object" && objeto !== null && "exp" in objeto) {
            const exp = objeto.exp;
            return typeof exp === "number" ? exp : null;
        }
        return null;
    }
    catch {
        return null;
    }
}
/**
 * "Contexto" do usuário: guarda quem está logado (token + nome) e avisa quem estiver
 * ouvindo quando isso muda. Todas as telas usam a mesma instância (`sessao`), então
 * login, perfil e a barra da loja sempre enxergam os mesmos dados.
 */
export class SessaoUsuario {
    #ouvintes = new Set();
    #token = null;
    #nome = "";
    constructor() {
        this.#carregar();
        // Login/logout em outra aba atualiza esta também.
        window.addEventListener("storage", (evento) => {
            if (evento.key === CHAVE_TOKEN_CLIENTE || evento.key === CHAVE_NOME || evento.key === null) {
                this.#carregar();
                this.#avisar();
            }
        });
    }
    get token() {
        return this.estaLogado() ? this.#token : null;
    }
    get nome() {
        return this.#nome;
    }
    estaLogado() {
        if (this.#token === null)
            return false;
        const validade = lerValidade(this.#token);
        return validade === null || validade * 1000 > Date.now();
    }
    iniciar(token, nome) {
        this.#token = token;
        this.#nome = nome;
        this.#gravar();
        this.#avisar();
    }
    definirNome(nome) {
        this.#nome = nome;
        this.#gravar();
        this.#avisar();
    }
    encerrar() {
        this.#token = null;
        this.#nome = "";
        this.#gravar();
        this.#avisar();
    }
    /** Registra quem quer ser avisado. Devolve uma função para cancelar. */
    observar(ouvinte) {
        this.#ouvintes.add(ouvinte);
        return () => this.#ouvintes.delete(ouvinte);
    }
    #avisar() {
        this.#ouvintes.forEach((ouvinte) => ouvinte());
    }
    #carregar() {
        try {
            this.#token = localStorage.getItem(CHAVE_TOKEN_CLIENTE);
            this.#nome = localStorage.getItem(CHAVE_NOME) ?? "";
        }
        catch {
            this.#token = null;
            this.#nome = "";
        }
        if (this.#token !== null && !this.estaLogado()) {
            this.#token = null;
            this.#nome = "";
            this.#gravar();
        }
    }
    #gravar() {
        try {
            if (this.#token === null) {
                localStorage.removeItem(CHAVE_TOKEN_CLIENTE);
                localStorage.removeItem(CHAVE_NOME);
            }
            else {
                localStorage.setItem(CHAVE_TOKEN_CLIENTE, this.#token);
                localStorage.setItem(CHAVE_NOME, this.#nome);
            }
        }
        catch {
            // Armazenamento bloqueado: a sessão vale só até fechar a aba.
        }
    }
}
/** Instância única, compartilhada por todas as telas. */
export const sessao = new SessaoUsuario();
