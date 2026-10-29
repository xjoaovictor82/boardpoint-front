import type {
  ClienteHttp,
  ConsultaProdutosCompleta,
  ConsultaProdutosFiltrada,
  FiltroProdutos,
  ProdutoDto,
  RespostaProdutos,
} from "../tipos/Tipos.js";
import { Produto } from "../entidades/Produto.js";
import { RepositorioApi } from "./RepositorioApi.js";

// 200 cobre o catálogo inteiro numa única chamada.
const POR_PAGINA = "200";

export class RepositorioProdutos
  extends RepositorioApi<ProdutoDto, Produto>
  implements ConsultaProdutosFiltrada, ConsultaProdutosCompleta
{
  constructor(cliente: ClienteHttp) {
    super(cliente);
  }

  protected override converter(dto: ProdutoDto): Produto {
    return Produto.deDto(dto);
  }

  async buscar(filtro: FiltroProdutos): Promise<Produto[]> {
    const params = new URLSearchParams({
      busca: filtro.busca,
      categoria: filtro.categoria,
      por_pagina: POR_PAGINA,
    });
    return this.#listar(params);
  }

  async buscarTodos(): Promise<Produto[]> {
    const params = new URLSearchParams({ por_pagina: POR_PAGINA, categoria: "todos" });
    return this.#listar(params);
  }

  async #listar(params: URLSearchParams): Promise<Produto[]> {
    const dados = await this.cliente.obter<RespostaProdutos>("produtos.php?" + params.toString());
    return this.converterLista(dados.produtos);
  }
}
