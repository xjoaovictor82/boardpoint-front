import { Categoria } from "../entidades/Categoria.js";
import { RepositorioApi } from "./RepositorioApi.js";
export class RepositorioCategorias extends RepositorioApi {
    constructor(cliente) {
        super(cliente);
    }
    converter(dto) {
        return Categoria.deDto(dto);
    }
    async listar() {
        const dtos = await this.cliente.obter("publico/categorias.php");
        return this.converterLista(dtos);
    }
}
