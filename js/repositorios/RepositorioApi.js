/**
 * Base genérica dos repositórios: sabe falar com a API e converter DTO -> entidade.
 * TDto = formato JSON da API; TEntidade = objeto de domínio.
 */
export class RepositorioApi {
    cliente;
    constructor(cliente) {
        this.cliente = cliente;
    }
    converterLista(dtos) {
        return dtos.map((dto) => this.converter(dto));
    }
}
