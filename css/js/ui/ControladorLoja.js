import { CampoBusca } from "./CampoBusca.js";
import { FiltrosCategoria } from "./FiltrosCategoria.js";
/** Liga busca + filtros + vitrine: guarda o filtro atual e recarrega os produtos quando ele muda. */
export class ControladorLoja {
    #categorias;
    #produtos;
    #vitrine;
    #filtros;
    #categoria = "todos";
    #busca = "";
    constructor(categorias, produtos, vitrine) {
        this.#categorias = categorias;
        this.#produtos = produtos;
        this.#vitrine = vitrine;
        this.#filtros = new FiltrosCategoria((categoria) => {
            this.#categoria = categoria;
            void this.carregarProdutos();
        });
        new CampoBusca((termo) => {
            this.#busca = termo;
            void this.carregarProdutos();
        });
    }
    async iniciar() {
        await Promise.all([this.#carregarCategorias(), this.carregarProdutos()]);
    }
    async #carregarCategorias() {
        try {
            this.#filtros.montar(await this.#categorias.listar());
        }
        catch {
            // O site continua funcionando sem filtros se a API estiver fora do ar.
            this.#filtros.montar([]);
        }
    }
    async carregarProdutos() {
        this.#vitrine.ocupada(true);
        try {
            const lista = await this.#produtos.buscar({ busca: this.#busca, categoria: this.#categoria });
            this.#vitrine.exibir(lista, this.#categoria);
        }
        catch (erro) {
            this.#vitrine.exibirErro(erro instanceof Error ? erro.message : "Tente recarregar a página em instantes.");
        }
        finally {
            this.#vitrine.ocupada(false);
        }
    }
}
