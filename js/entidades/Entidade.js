/** Base abstrata de tudo o que tem identidade no banco (id). */
export class Entidade {
    #id;
    constructor(id) {
        this.#id = id;
    }
    get id() {
        return this.#id;
    }
}
