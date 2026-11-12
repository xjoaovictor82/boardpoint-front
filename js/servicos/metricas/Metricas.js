/* Cada classe abaixo é UMA métrica (princípio S) e todas cumprem o mesmo contrato
   Metrica<T> (princípios O e L): criar uma métrica nova não exige mexer nas existentes. */
export class TotalProdutos {
    nome = "Total de produtos";
    calcular(produtos) {
        return produtos.length;
    }
}
export class ProdutosComPreco {
    nome = "Produtos com preço";
    calcular(produtos) {
        // FILTER — só os que têm preço definido.
        return produtos.filter((p) => p.temPreco).length;
    }
}
export class ProdutosSemEstoque {
    nome = "Produtos sem estoque";
    calcular(produtos) {
        // FILTER — os que estão zerados.
        return produtos.filter((p) => p.estaEsgotado).length;
    }
}
export class EstoqueCritico {
    nome = "Estoque crítico";
    #limite;
    constructor(limite) {
        this.#limite = limite;
    }
    calcular(produtos) {
        // FILTER — estoque baixo (mas não zerado) = alerta de reposição.
        return produtos.filter((p) => p.temEstoqueCritico(this.#limite));
    }
}
export class FaturamentoPotencial {
    nome = "Faturamento potencial";
    calcular(produtos) {
        // REDUCE — soma preço × estoque: quanto vale o estoque se tudo for vendido.
        return produtos.reduce((soma, p) => (p.preco === null ? soma : soma + p.preco * p.estoque), 0);
    }
}
export class PrecoMedio {
    nome = "Preço médio";
    calcular(produtos) {
        const precos = produtos.flatMap((p) => (p.preco === null ? [] : [p.preco]));
        if (precos.length === 0)
            return 0;
        return precos.reduce((soma, preco) => soma + preco, 0) / precos.length;
    }
}
export class ProdutoDestaque {
    nome = "Produto com maior estoque";
    calcular(produtos) {
        // RANKING — reduce como acumulador do "maior visto até agora".
        const maior = produtos.reduce((atual, p) => (atual === null || p.estoque > atual.estoque ? p : atual), null);
        return maior ? { nome: maior.rotulo, valor: maior.estoque } : null;
    }
}
/** Conta produtos por categoria, do maior para o menor (empates mantêm a ordem de chegada). */
export class ProdutosPorCategoria {
    nome = "Produtos por categoria";
    calcular(produtos) {
        const contagem = new Map();
        produtos.forEach((p) => {
            contagem.set(p.rotuloCategoria, (contagem.get(p.rotuloCategoria) ?? 0) + 1);
        });
        // MAP — transforma a contagem em linhas de tabela.
        return [...contagem].map(([nome, total]) => ({ nome, total_produtos: total }))
            .sort((a, b) => b.total_produtos - a.total_produtos);
    }
}
/** Categoria com mais produtos (a primeira em caso de empate, como no código original). */
export class CategoriaDestaque {
    nome = "Categoria com mais produtos";
    #porCategoria = new ProdutosPorCategoria();
    calcular(produtos) {
        const linhas = this.#porCategoria.calcular(produtos);
        const primeira = linhas[0];
        return primeira ? { nome: primeira.nome, valor: primeira.total_produtos } : null;
    }
}
