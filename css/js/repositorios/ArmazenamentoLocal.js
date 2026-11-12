/** Guarda um valor de tipo T no localStorage. Dado ausente ou corrompido vira `vazio`. */
export class ArmazenamentoLocal {
    #chave;
    #vazio;
    #converter;
    constructor(chave, vazio, converter) {
        this.#chave = chave;
        this.#vazio = vazio;
        this.#converter = converter;
    }
    ler() {
        try {
            const texto = localStorage.getItem(this.#chave);
            return texto === null ? this.#vazio : this.#converter(JSON.parse(texto));
        }
        catch {
            return this.#vazio;
        }
    }
    gravar(valor) {
        try {
            localStorage.setItem(this.#chave, JSON.stringify(valor));
        }
        catch {
            // Armazenamento cheio ou bloqueado (modo privado): o carrinho segue só em memória.
        }
    }
}
