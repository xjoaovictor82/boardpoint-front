import { ServicoCrud } from "./ServicoCrud.js";
/** Produtos têm upload de imagem: por isso enviam multipart/form-data em vez de JSON. */
export class ServicoProdutos extends ServicoCrud {
    constructor(http) {
        super(http, "produtos.php");
    }
    criar(entrada) {
        return this.http.enviarFormulario(this.recurso, this.#paraFormulario(entrada));
    }
    /** PHP não preenche $_FILES em PUT: o servidor aceita POST com ?_method=PUT. */
    editar(id, entrada) {
        return this.http.enviarFormulario(`${this.recurso}?id=${id}&_method=PUT`, this.#paraFormulario(entrada));
    }
    #paraFormulario(entrada) {
        const formulario = new FormData();
        formulario.append("categoria_id", String(entrada.categoria_id ?? ""));
        formulario.append("nome", entrada.nome ?? "");
        formulario.append("preco", entrada.preco === null || entrada.preco === undefined ? "" : String(entrada.preco));
        formulario.append("estoque", String(entrada.estoque ?? 0));
        if (entrada.imagem)
            formulario.append("imagem", entrada.imagem);
        return formulario;
    }
}
