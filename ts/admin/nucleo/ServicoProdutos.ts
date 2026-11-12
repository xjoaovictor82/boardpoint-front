import type { ClienteHttp, ProdutoDto } from "../../tipos/Tipos.js";
import { ServicoCrud } from "./ServicoCrud.js";
import type { EntradaProduto, ResultadoProduto } from "./tipos.js";

/** Produtos têm upload de imagem: por isso enviam multipart/form-data em vez de JSON. */
export class ServicoProdutos extends ServicoCrud<ProdutoDto, EntradaProduto, ResultadoProduto> {
  constructor(http: ClienteHttp) {
    super(http, "produtos.php");
  }

  override criar(entrada: EntradaProduto): Promise<ResultadoProduto> {
    return this.http.enviarFormulario<ResultadoProduto>(this.recurso, this.#paraFormulario(entrada));
  }

  /** PHP não preenche $_FILES em PUT: o servidor aceita POST com ?_method=PUT. */
  override editar(id: number, entrada: Partial<EntradaProduto>): Promise<ResultadoProduto> {
    return this.http.enviarFormulario<ResultadoProduto>(
      `${this.recurso}?id=${id}&_method=PUT`,
      this.#paraFormulario(entrada),
    );
  }

  #paraFormulario(entrada: Partial<EntradaProduto>): FormData {
    const formulario = new FormData();
    formulario.append("categoria_id", String(entrada.categoria_id ?? ""));
    formulario.append("nome", entrada.nome ?? "");
    formulario.append("preco", entrada.preco === null || entrada.preco === undefined ? "" : String(entrada.preco));
    formulario.append("estoque", String(entrada.estoque ?? 0));
    if (entrada.imagem) formulario.append("imagem", entrada.imagem);
    return formulario;
  }
}
