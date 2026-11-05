export type AoMudarPagina = (pagina: number) => void;

/** Controles "Anterior / Página X de Y / Próxima" reutilizáveis em qualquer listagem. */
export class Paginacao {
  readonly #container: HTMLElement;
  readonly #aoMudar: AoMudarPagina;

  constructor(container: HTMLElement, aoMudar: AoMudarPagina) {
    this.#container = container;
    this.#aoMudar = aoMudar;
  }

  atualizar(pagina: number, totalPaginas: number, totalRegistros: number): void {
    this.#container.replaceChildren();
    if (totalRegistros === 0) return;

    const anterior = this.#botao("← Anterior", pagina - 1, pagina <= 1);
    const proxima = this.#botao("Próxima →", pagina + 1, pagina >= totalPaginas);

    const info = document.createElement("span");
    info.className = "paginacao-info";
    info.textContent = `Página ${pagina} de ${totalPaginas} · ${totalRegistros} registro(s)`;

    this.#container.append(anterior, info, proxima);
  }

  #botao(texto: string, destino: number, desabilitado: boolean): HTMLButtonElement {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-secundario";
    botao.textContent = texto;
    botao.disabled = desabilitado;
    botao.addEventListener("click", () => this.#aoMudar(destino));
    return botao;
  }
}
