import type { ClienteHttp, ProdutoDto } from "../tipos/Tipos";
import { ServicoCrud } from "./ServicoCrud";
import type { EntradaProduto, ResultadoProduto } from "./tipos";

/** Produtos têm upload de imagem: por isso enviam multipart/form-data em vez de JSON. */
export class ServicoProdutos extends ServicoCrud<ProdutoDto, EntradaProduto, ResultadoProduto> {
  constructor(http: ClienteHttp) {
    super(http, "produtos");
  }

  override criar(entrada: EntradaProduto): Promise<ResultadoProduto> {
    return this.http.enviarFormulario<ResultadoProduto>(this.recurso, this.#paraFormulario(entrada));
  }

  /** PUT /api/produtos/:id com multipart (a imagem é opcional na edição). */
  override editar(id: number, entrada: Partial<EntradaProduto>): Promise<ResultadoProduto> {
    return this.http.atualizarFormulario<ResultadoProduto>(
      `${this.recurso}/${id}`,
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