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
var _EstoqueCritico_limite, _CategoriaDestaque_porCategoria;
/* Cada classe abaixo é UMA métrica (princípio S) e todas cumprem o mesmo contrato
   Metrica<T> (princípios O e L): criar uma métrica nova não exige mexer nas existentes. */
export class TotalProdutos {
    constructor() {
        this.nome = "Total de produtos";
    }
    calcular(produtos) {
        return produtos.length;
    }
}
export class ProdutosComPreco {
    constructor() {
        this.nome = "Produtos com preço";
    }
    calcular(produtos) {
        // FILTER — só os que têm preço definido.
        return produtos.filter((p) => p.temPreco).length;
    }
}
export class ProdutosSemEstoque {
    constructor() {
        this.nome = "Produtos sem estoque";
    }
    calcular(produtos) {
        // FILTER — os que estão zerados.
        return produtos.filter((p) => p.estaEsgotado).length;
    }
}
export class EstoqueCritico {
    constructor(limite) {
        this.nome = "Estoque crítico";
        _EstoqueCritico_limite.set(this, void 0);
        __classPrivateFieldSet(this, _EstoqueCritico_limite, limite, "f");
    }
    calcular(produtos) {
        // FILTER — estoque baixo (mas não zerado) = alerta de reposição.
        return produtos.filter((p) => p.temEstoqueCritico(__classPrivateFieldGet(this, _EstoqueCritico_limite, "f")));
    }
}
_EstoqueCritico_limite = new WeakMap();
export class FaturamentoPotencial {
    constructor() {
        this.nome = "Faturamento potencial";
    }
    calcular(produtos) {
        // REDUCE — soma preço × estoque: quanto vale o estoque se tudo for vendido.
        return produtos.reduce((soma, p) => (p.preco === null ? soma : soma + p.preco * p.estoque), 0);
    }
}
export class PrecoMedio {
    constructor() {
        this.nome = "Preço médio";
    }
    calcular(produtos) {
        const precos = produtos.flatMap((p) => (p.preco === null ? [] : [p.preco]));
        if (precos.length === 0)
            return 0;
        return precos.reduce((soma, preco) => soma + preco, 0) / precos.length;
    }
}
export class ProdutoDestaque {
    constructor() {
        this.nome = "Produto com maior estoque";
    }
    calcular(produtos) {
        // RANKING — reduce como acumulador do "maior visto até agora".
        const maior = produtos.reduce((atual, p) => (atual === null || p.estoque > atual.estoque ? p : atual), null);
        return maior ? { nome: maior.rotulo, valor: maior.estoque } : null;
    }
}
/** Conta produtos por categoria, do maior para o menor (empates mantêm a ordem de chegada). */
export class ProdutosPorCategoria {
    constructor() {
        this.nome = "Produtos por categoria";
    }
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
    constructor() {
        this.nome = "Categoria com mais produtos";
        _CategoriaDestaque_porCategoria.set(this, new ProdutosPorCategoria());
    }
    calcular(produtos) {
        const linhas = __classPrivateFieldGet(this, _CategoriaDestaque_porCategoria, "f").calcular(produtos);
        const primeira = linhas[0];
        return primeira ? { nome: primeira.nome, valor: primeira.total_produtos } : null;
    }
}
_CategoriaDestaque_porCategoria = new WeakMap();
