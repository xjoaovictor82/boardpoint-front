import type { CategoriaDto, ClienteHttp, ConsultaCategorias } from "../tipos/Tipos.js";
import { Categoria } from "../entidades/Categoria.js";
import { RepositorioApi } from "./RepositorioApi.js";

export class RepositorioCategorias
  extends RepositorioApi<CategoriaDto, Categoria>
  implements ConsultaCategorias
{
  constructor(cliente: ClienteHttp) {
    super(cliente);
  }

  protected override converter(dto: CategoriaDto): Categoria {
    return Categoria.deDto(dto);
  }

  async listar(): Promise<Categoria[]> {
    const dtos = await this.cliente.obter<CategoriaDto[]>("publico/categorias.php");
    return this.converterLista(dtos);
  }
}
