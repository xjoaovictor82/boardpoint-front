import type { FiltroCategoria } from "../tipos/Tipos.js";
import { Categoria } from "../entidades/Categoria.js";
import { obterElemento } from "../utilitarios/dom.js";

/** Pílulas de categoria. Clicar na pílula ativa volta para "todos". */
export class FiltrosCategoria {
  readonly #elemento = obterElemento("filtros");
  readonly #aoMudar: (categoria: FiltroCategoria) => void;

  constructor(aoMudar: (categoria: FiltroCategoria) => void) {
    this.#aoMudar = aoMudar;
  }

  montar(categorias: readonly Categoria[]): void {
    this.#elemento.innerHTML = "";

    categorias.forEach((categoria) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "pilula";
      botao.textContent = categoria.rotulo;
      botao.dataset.categoria = categoria.slug;
      botao.setAttribute("role", "tab");
      botao.setAttribute("aria-selected", "false");

      botao.addEventListener("click", () => {
        const jaEstavaAtiva = botao.classList.contains("ativa");
        this.#elemento.querySelectorAll(".pilula").forEach((pilula) => {
          pilula.classList.remove("ativa");
          pilula.setAttribute("aria-selected", "false");
        });

        if (jaEstavaAtiva) {
          this.#aoMudar("todos");
        } else {
          botao.classList.add("ativa");
          botao.setAttribute("aria-selected", "true");
          this.#aoMudar(categoria.slug);
        }
      });

      this.#elemento.appendChild(botao);
    });
  }
}
