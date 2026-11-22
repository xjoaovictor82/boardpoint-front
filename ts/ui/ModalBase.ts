/**
 * Comportamento comum a todos os modais: abrir, fechar, travar a rolagem da página e
 * (opcionalmente) fechar com Esc. As subclasses sobrescrevem só o que muda.
 */
export abstract class ModalBase {
  protected readonly elemento: HTMLElement;

  protected constructor(elemento: HTMLElement) {
    this.elemento = elemento;
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && this.fechaComEsc && this.aberto) this.fechar();
    });
  }

  /** Por padrão o modal NÃO fecha com Esc; as subclasses ligam isso quando fizer sentido. */
  protected get fechaComEsc(): boolean {
    return false;
  }

  get aberto(): boolean {
    return this.elemento.classList.contains("aberto");
  }

  abrir(): void {
    this.aoAbrir();
    this.elemento.classList.add("aberto");
    this.elemento.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  fechar(): void {
    this.elemento.classList.remove("aberto");
    this.elemento.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    this.aoFechar();
  }

  /** Gancho: roda antes de o modal aparecer. */
  protected aoAbrir(): void {}

  /** Gancho: roda depois de o modal fechar. */
  protected aoFechar(): void {}
}
