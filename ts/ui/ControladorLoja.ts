import type { ConsultaCategorias, ConsultaProdutosFiltrada, FiltroCategoria } from "../tipos/Tipos.js";
import { CampoBusca } from "./CampoBusca.js";
import { FiltrosCategoria } from "./FiltrosCategoria.js";
import { VitrineProdutos } from "./VitrineProdutos.js";

/** Liga busca + filtros + vitrine: guarda o filtro atual e recarrega os produtos quando ele muda. */
export class ControladorLoja {
  readonly #categorias: ConsultaCategorias;
  readonly #produtos: ConsultaProdutosFiltrada;
  readonly #vitrine: VitrineProdutos;
  readonly #filtros: FiltrosCategoria;
  #categoria: FiltroCategoria = "todos";
  #busca = "";

  constructor(
    categorias: ConsultaCategorias,
    produtos: ConsultaProdutosFiltrada,
    vitrine: VitrineProdutos
  ) {
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

  async iniciar(): Promise<void> {
    await Promise.all([this.#carregarCategorias(), this.carregarProdutos()]);
  }

  async #carregarCategorias(): Promise<void> {
    try {
      this.#filtros.montar(await this.#categorias.listar());
    } catch {
      // O site continua funcionando sem filtros se a API estiver fora do ar.
      this.#filtros.montar([]);
    }
  }

  async carregarProdutos(): Promise<void> {
    this.#vitrine.ocupada(true);
    try {
      const lista = await this.#produtos.buscar({ busca: this.#busca, categoria: this.#categoria });
      this.#vitrine.exibir(lista, this.#categoria);
    } catch (erro) {
      this.#vitrine.exibirErro(erro instanceof Error ? erro.message : "Tente recarregar a página em instantes.");
    } finally {
      this.#vitrine.ocupada(false);
    }
  }
}
