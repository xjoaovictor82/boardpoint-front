import type { ClienteHttp } from "../tipos/Tipos.js";

/**
 * Base genérica dos repositórios: sabe falar com a API e converter DTO -> entidade.
 * TDto = formato JSON da API; TEntidade = objeto de domínio.
 */
export abstract class RepositorioApi<TDto, TEntidade> {
  protected readonly cliente: ClienteHttp;

  protected constructor(cliente: ClienteHttp) {
    this.cliente = cliente;
  }

  protected abstract converter(dto: TDto): TEntidade;

  protected converterLista(dtos: readonly TDto[]): TEntidade[] {
    return dtos.map((dto) => this.converter(dto));
  }
}
