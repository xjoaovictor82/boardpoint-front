import { Paginacao } from "./Paginacao.js";
import { celula, criar, mensagemDeErro } from "./elementos.js";
import { mostrarToast } from "./Toast.js";
/** Tabela paginada reutilizável: busca, desenha as linhas e controla "Anterior/Próxima". */
export class ListagemPaginada {
    #opcoes;
    #paginacao;
    #pagina = 1;
    #requisicao = 0;
    constructor(opcoes) {
        this.#opcoes = opcoes;
        this.#paginacao = new Paginacao(opcoes.containerPaginacao, (pagina) => {
            this.#pagina = pagina;
            void this.carregar();
        });
    }
    /** Volta para a página 1 (use ao mudar filtros ou busca). */
    recomecar() {
        this.#pagina = 1;
        return this.carregar();
    }
    async carregar() {
        const numero = ++this.#requisicao;
        try {
            const resultado = await this.#opcoes.buscar(this.#pagina, this.#opcoes.porPagina);
            if (numero !== this.#requisicao)
                return; // chegou uma resposta mais nova: descarta esta
            // Apagou o último item da última página: volta uma página.
            if (resultado.itens.length === 0 && this.#pagina > 1) {
                this.#pagina -= 1;
                await this.carregar();
                return;
            }
            if (resultado.itens.length === 0)
                this.#mostrarMensagem(this.#opcoes.textoVazio);
            else
                this.#opcoes.corpo.replaceChildren(...resultado.itens.flatMap((item) => this.#opcoes.linhas(item)));
            this.#paginacao.atualizar(resultado.pagina, resultado.total_paginas, resultado.total);
            this.#opcoes.aoCarregar?.(resultado);
        }
        catch (erro) {
            if (numero !== this.#requisicao)
                return;
            this.#mostrarMensagem("Não foi possível carregar os dados.");
            mostrarToast(mensagemDeErro(erro), "erro");
        }
    }
    #mostrarMensagem(texto) {
        const td = celula(texto, "estado-vazio");
        td.colSpan = this.#opcoes.colunas;
        this.#opcoes.corpo.replaceChildren(criar("tr"));
        this.#opcoes.corpo.firstElementChild?.appendChild(td);
    }
}
