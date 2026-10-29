/** Mensagem rápida "Adicionado ao carrinho ✓". */
export class AvisoCarrinho {
  #elemento: HTMLElement | null = null;
  #temporizador: ReturnType<typeof setTimeout> | undefined;

  mostrar(): void {
    const elemento = this.#obterElemento();
    elemento.textContent = "Adicionado ao carrinho ✓";
    elemento.classList.add("visivel");

    clearTimeout(this.#temporizador);
    this.#temporizador = setTimeout(() => elemento.classList.remove("visivel"), 2200);
  }

  #obterElemento(): HTMLElement {
    if (this.#elemento === null) {
      this.#elemento = document.createElement("div");
      this.#elemento.id = "toastCarrinho";
      this.#elemento.className = "toast-carrinho";
      document.body.appendChild(this.#elemento);
    }
    return this.#elemento;
  }
}
