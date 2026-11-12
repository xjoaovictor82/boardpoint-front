const POR_PAGINA_MAXIMO = 100; // limite da API (paginacao() no PHP)
/**
 * CRUD genérico para qualquer recurso da API administrativa.
 *  - TEntidade  = o que a API devolve ao listar/consultar;
 *  - TEntrada   = o que o formulário envia ao criar/editar;
 *  - TResultado = o que a API devolve depois de criar/editar (por padrão, a própria entidade).
 * Subclasses podem sobrescrever `criar`/`editar` (ex.: produtos, que enviam arquivo).
 */
export class ServicoCrud {
    http;
    recurso;
    constructor(http, recurso) {
        this.http = http;
        this.recurso = recurso;
    }
    listar(pagina, porPagina, filtros = {}) {
        const params = new URLSearchParams({ pagina: String(pagina), por_pagina: String(porPagina) });
        for (const [chave, valor] of Object.entries(filtros)) {
            if (valor !== "")
                params.set(chave, valor);
        }
        return this.http.obter(`${this.recurso}?${params.toString()}`);
    }
    /** Percorre todas as páginas (útil para preencher <select>). */
    async listarTodos(filtros = {}) {
        const todos = [];
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
    obter(id) {
        return this.http.obter(`${this.recurso}?id=${id}`);
    }
    criar(entrada) {
        return this.http.enviarJson(this.recurso, entrada);
    }
    editar(id, entrada) {
        return this.http.atualizarJson(`${this.recurso}?id=${id}`, entrada);
    }
    excluir(id) {
        return this.http.excluir(`${this.recurso}?id=${id}`);
    }
}
