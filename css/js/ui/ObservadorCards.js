/** Animação: os cards aparecem conforme entram na tela. */
export class ObservadorCards {
    #raiz;
    #observador;
    constructor(raiz) {
        this.#raiz = raiz;
    }
    observar() {
        const cards = this.#raiz.querySelectorAll(".card");
        if (!("IntersectionObserver" in window)) {
            cards.forEach((card) => card.classList.add("em-vista"));
            return;
        }
        this.#observador?.disconnect();
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("em-vista");
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        this.#observador = observador;
        cards.forEach((card) => observador.observe(card));
    }
}
