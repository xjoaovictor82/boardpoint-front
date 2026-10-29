import { obterElemento } from "../utilitarios/dom.js";
const ATRASO_MS = 300;
/** Campo de busca com debounce (cada busca é uma chamada à API). */
export class CampoBusca {
    #campo = obterElemento("campoBusca");
    #limpar = obterElemento("botaoLimpar");
    #temporizador;
    constructor(aoMudar) {
        this.#campo.addEventListener("input", () => {
            const termo = this.#campo.value;
            this.#limpar.classList.toggle("ativo", termo.length > 0);
            clearTimeout(this.#temporizador);
            this.#temporizador = setTimeout(() => aoMudar(termo), ATRASO_MS);
        });
        this.#limpar.addEventListener("click", () => {
            this.#campo.value = "";
            this.#limpar.classList.remove("ativo");
            this.#campo.focus();
            aoMudar("");
        });
    }
}
