var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ServicoMetricas_metricas;
export class ServicoMetricas {
    constructor(metricas) {
        _ServicoMetricas_metricas.set(this, void 0);
        __classPrivateFieldSet(this, _ServicoMetricas_metricas, metricas, "f");
    }
    calcular(produtos) {
        const m = __classPrivateFieldGet(this, _ServicoMetricas_metricas, "f");
        const porCategoria = m.porCategoria.calcular(produtos);
        return {
            totalProdutos: m.total.calcular(produtos),
            totalCategorias: porCategoria.length,
            produtosComPreco: m.comPreco.calcular(produtos),
            produtosSemEstoque: m.semEstoque.calcular(produtos),
            faturamentoPotencial: m.faturamento.calcular(produtos),
            precoMedio: m.precoMedio.calcular(produtos),
            produtosEstoqueCritico: m.estoqueCritico.calcular(produtos),
            produtoDestaque: m.produtoDestaque.calcular(produtos),
            categoriaDestaque: m.categoriaDestaque.calcular(produtos),
            porCategoria,
        };
    }
}
_ServicoMetricas_metricas = new WeakMap();
