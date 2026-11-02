/**
 * Comportamento comum a todos os modais: abrir, fechar, travar a rolagem da página e
 * (opcionalmente) fechar com Esc. As subclasses sobrescrevem só o que muda.
 */
export class ModalBase {
    elemento;
    constructor(elemento) {
        this.elemento = elemento;
        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && this.fechaComEsc && this.aberto)
                this.fechar();
        });
    }
    /** Por padrão o modal NÃO fecha com Esc; as subclasses ligam isso quando fizer sentido. */
    get fechaComEsc() {
        return false;
    }
    get aberto() {
        return this.elemento.classList.contains("aberto");
    }
    abrir() {
        this.aoAbrir();
        this.elemento.classList.add("aberto");
        this.elemento.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
    fechar() {
        this.elemento.classList.remove("aberto");
        this.elemento.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        this.aoFechar();
    }
    /** Gancho: roda antes de o modal aparecer. */
    aoAbrir() { }
    /** Gancho: roda depois de o modal fechar. */
    aoFechar() { }
}
