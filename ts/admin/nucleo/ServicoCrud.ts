import type { ClienteHttp } from "../../tipos/Tipos.js";
import type { Pagina } from "./tipos.js";

/** Filtros de listagem (ex.: { busca: "nike", categoria: "tenis" }). Valores vazios são ignorados. */
export type Filtros = Readonly<Record<string, string>>;

const POR_PAGINA_MAXIMO = 100; // limite da API (paginacao() no PHP)

/**
 * CRUD genérico para qualquer recurso da API administrativa.
 *  - TEntidade  = o que a API devolve ao listar/consultar;
 *  - TEntrada   = o que o formulário envia ao criar/editar;
 *  - TResultado = o que a API devolve depois de criar/editar (por padrão, a própria entidade).
 * Subclasses podem sobrescrever `criar`/`editar` (ex.: produtos, que enviam arquivo).
 */
export class ServicoCrud<TEntidade, TEntrada, TResultado = TEntidade> {
  protected readonly http: ClienteHttp;
  protected readonly recurso: string;

  constructor(http: ClienteHttp, recurso: string) {
    this.http = http;
    this.recurso = recurso;
  }

  listar(pagina: number, porPagina: number, filtros: Filtros = {}): Promise<Pagina<TEntidade>> {
    const params = new URLSearchParams({ pagina: String(pagina), por_pagina: String(porPagina) });
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor !== "") params.set(chave, valor);
    }
    return this.http.obter<Pagina<TEntidade>>(`${this.recurso}?${params.toString()}`);
  }

  /** Percorre todas as páginas (útil para preencher <select>). */
  async listarTodos(filtros: Filtros = {}): Promise<TEntidade[]> {
    const todos: TEntidade[] = [];
    let pagina = 1;
    let totalPaginas = 1;
    do {
      const resultado = await this.listar(pagina, POR_PAGINA_MAXIMO, filtros);
      todos.push(...resultado.itens);
      totalPaginas = resultado.total_paginas;
      pagina += 1;
    } while (pagina <= totalPaginas);
    return todos;
  }

  obter(id: number): Promise<TEntidade> {
    return this.http.obter<TEntidade>(`${this.recurso}?id=${id}`);
  }

  criar(entrada: TEntrada): Promise<TResultado> {
    return this.http.enviarJson<TResultado>(this.recurso, entrada);
  }

  editar(id: number, entrada: Partial<TEntrada>): Promise<TResultado> {
    return this.http.atualizarJson<TResultado>(`${this.recurso}?id=${id}`, entrada);
  }

  excluir(id: number): Promise<null> {
    return this.http.excluir<null>(`${this.recurso}?id=${id}`);
  }
}
