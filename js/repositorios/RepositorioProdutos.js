import { Produto } from "../entidades/Produto.js";
import { RepositorioApi } from "./RepositorioApi.js";
// 200 cobre o catálogo inteiro numa única chamada.
const POR_PAGINA = "200";
export class RepositorioProdutos extends RepositorioApi {
    constructor(cliente) {
        super(cliente);
    }
    converter(dto) {
        return Produto.deDto(dto);
    }
    async buscar(filtro) {
        const params = new URLSearchParams({
            busca: filtro.busca,
            categoria: filtro.categoria,
            por_pagina: POR_PAGINA,
        });
        return this.#listar(params);
    }
    async buscarTodos() {
        const params = new URLSearchParams({ por_pagina: POR_PAGINA, categoria: "todos" });
        return this.#listar(params);
    }
    async #listar(params) {
        const dados = await this.cliente.obter("publico/produtos.php?" + params.toString());
        return this.converterLista(dados.produtos);
    }
}
