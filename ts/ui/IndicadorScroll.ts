// Tolerância (px) para considerar "chegou no fim" apesar de arredondamentos.
const TOLERANCIA_FIM_SCROLL = 4;

/** Setinha "tem mais produtos pro lado": some quando não há o que rolar ou já chegou no fim. */
export class IndicadorScroll {
  readonly #carrossel: HTMLElement;
  readonly #grupo: HTMLElement;

  constructor(carrossel: HTMLElement, grupo: HTMLElement) {
    this.#carrossel = carrossel;
    this.#grupo = grupo;

    const seta = document.createElement("div");
    seta.className = "grade__seta";
    seta.setAttribute("aria-hidden", "true");
    seta.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>';
    grupo.appendChild(seta);

    carrossel.addEventListener("scroll", () => this.#atualizar(), { passive: true });
    window.addEventListener("resize", () => this.#atualizar());

    // Estado inicial: espera o layout assentar (imagens carregando).
    this.#atualizar();
    setTimeout(() => this.#atualizar(), 300);
  }

  #atualizar(): void {
    const c = this.#carrossel;
    const rolavel = c.scrollWidth - c.clientWidth > TOLERANCIA_FIM_SCROLL;
    const chegouNoFim = c.scrollLeft + c.clientWidth >= c.scrollWidth - TOLERANCIA_FIM_SCROLL;
    this.#grupo.classList.toggle("sem-mais-conteudo", !rolavel || chegouNoFim);
  }
}
