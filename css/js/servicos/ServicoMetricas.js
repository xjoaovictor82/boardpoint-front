export class ServicoMetricas {
    #metricas;
    constructor(metricas) {
        this.#metricas = metricas;
    }
    calcular(produtos) {
        const m = this.#metricas;
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
