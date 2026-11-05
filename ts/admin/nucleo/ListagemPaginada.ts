import { Paginacao } from "./Paginacao.js";
import { celula, criar, mensagemDeErro } from "./elementos.js";
import { mostrarToast } from "./Toast.js";
import type { Pagina } from "./tipos.js";

export interface OpcoesListagem<T> {
  corpo: HTMLTableSectionElement;
  containerPaginacao: HTMLElement;
  colunas: number;
  porPagina: number;
  textoVazio: string;
  /** Busca uma página (já com os filtros atuais). */
  buscar: (pagina: number, porPagina: number) => Promise<Pagina<T>>;
  /** Monta as linhas <tr> de um item (pode devolver mais de uma, ex.: linha + detalhe). */
  linhas: (item: T) => HTMLTableRowElement[];
  aoCarregar?: (resultado: Pagina<T>) => void;
}

/** Tabela paginada reutilizável: busca, desenha as linhas e controla "Anterior/Próxima". */
export class ListagemPaginada<T> {
  readonly #opcoes: OpcoesListagem<T>;
  readonly #paginacao: Paginacao;
  #pagina = 1;
  #requisicao = 0;

  constructor(opcoes: OpcoesListagem<T>) {
    this.#opcoes = opcoes;
    this.#paginacao = new Paginacao(opcoes.containerPaginacao, (pagina) => {
      this.#pagina = pagina;
      void this.carregar();
    });
  }

  /** Volta para a página 1 (use ao mudar filtros ou busca). */
  recomecar(): Promise<void> {
    this.#pagina = 1;
    return this.carregar();
  }

  async carregar(): Promise<void> {
    const numero = ++this.#requisicao;
    try {
      const resultado = await this.#opcoes.buscar(this.#pagina, this.#opcoes.porPagina);
      if (numero !== this.#requisicao) return; // chegou uma resposta mais nova: descarta esta

      // Apagou o último item da última página: volta uma página.
      if (resultado.itens.length === 0 && this.#pagina > 1) {
        this.#pagina -= 1;
        await this.carregar();
        return;
      }

      if (resultado.itens.length === 0) this.#mostrarMensagem(this.#opcoes.textoVazio);
      else this.#opcoes.corpo.replaceChildren(...resultado.itens.flatMap((item) => this.#opcoes.linhas(item)));

      this.#paginacao.atualizar(resultado.pagina, resultado.total_paginas, resultado.total);
      this.#opcoes.aoCarregar?.(resultado);
    } catch (erro) {
      if (numero !== this.#requisicao) return;
      this.#mostrarMensagem("Não foi possível carregar os dados.");
      mostrarToast(mensagemDeErro(erro), "erro");
    }
  }

  #mostrarMensagem(texto: string): void {
    const td = celula(texto, "estado-vazio");
    td.colSpan = this.#opcoes.colunas;
    this.#opcoes.corpo.replaceChildren(criar("tr"));
    this.#opcoes.corpo.firstElementChild?.appendChild(td);
  }
}
