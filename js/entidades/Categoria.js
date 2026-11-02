import { Entidade } from "./Entidade.js";
export class Categoria extends Entidade {
    #slug;
    #nome;
    constructor(id, slug, nome) {
        super(id);
        this.#slug = slug;
        this.#nome = nome;
    }
    static deDto(dto) {
        return new Categoria(dto.id, dto.slug, dto.nome);
    }
    get slug() {
        return this.#slug;
    }
    get rotulo() {
        return this.#nome;
    }
}
