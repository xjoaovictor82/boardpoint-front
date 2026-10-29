import type { Destaque, LinhaCategoria, Metrica, MetricasDashboard } from "../tipos/Tipos.js";
import { Produto } from "../entidades/Produto.js";

/** As métricas que o painel usa. O serviço depende só do contrato Metrica<T> (princípio D). */
export interface ConjuntoMetricas {
  total: Metrica<number>;
  comPreco: Metrica<number>;
  semEstoque: Metrica<number>;
  estoqueCritico: Metrica<readonly Produto[]>;
  faturamento: Metrica<number>;
  precoMedio: Metrica<number>;
  produtoDestaque: Metrica<Destaque | null>;
  categoriaDestaque: Metrica<Destaque | null>;
  porCategoria: Metrica<readonly LinhaCategoria[]>;
}

export class ServicoMetricas {
  readonly #metricas: ConjuntoMetricas;

  constructor(metricas: ConjuntoMetricas) {
    this.#metricas = metricas;
  }

  calcular(produtos: readonly Produto[]): MetricasDashboard {
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
