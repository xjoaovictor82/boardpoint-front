var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RepositorioProdutos_instances, _RepositorioProdutos_listar;
import { Produto } from "../entidades/Produto.js";
import { RepositorioApi } from "./RepositorioApi.js";
// 200 cobre o catálogo inteiro numa única chamada.
const POR_PAGINA = "200";
export class RepositorioProdutos extends RepositorioApi {
    constructor(cliente) {
        super(cliente);
        _RepositorioProdutos_instances.add(this);
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
        return __classPrivateFieldGet(this, _RepositorioProdutos_instances, "m", _RepositorioProdutos_listar).call(this, params);
    }
    async buscarTodos() {
        const params = new URLSearchParams({ por_pagina: POR_PAGINA, categoria: "todos" });
        return __classPrivateFieldGet(this, _RepositorioProdutos_instances, "m", _RepositorioProdutos_listar).call(this, params);
    }
}
_RepositorioProdutos_instances = new WeakSet(), _RepositorioProdutos_listar = async function _RepositorioProdutos_listar(params) {
    const dados = await this.cliente.obter("produtos.php?" + params.toString());
    return this.converterLista(dados.produtos);
};
