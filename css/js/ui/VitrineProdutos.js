import { escaparHtml } from "../utilitarios/formatacao.js";
import { obterElemento } from "../utilitarios/dom.js";
import { IndicadorScroll } from "./IndicadorScroll.js";
import { ObservadorCards } from "./ObservadorCards.js";
import { PreviewCarrossel } from "./PreviewCarrossel.js";
/** Desenha a grade de produtos (por categoria, em carrosséis). Não busca dados: só exibe. */
export class VitrineProdutos {
    #grade = obterElemento("grade");
    #contagem = obterElemento("contagem");
    #observador = new ObservadorCards(this.#grade);
    #aoSelecionar;
    constructor(aoSelecionar) {
        this.#aoSelecionar = aoSelecionar;
    }
    ocupada(ocupada) {
        if (ocupada)
            this.#grade.setAttribute("aria-busy", "true");
        else
            this.#grade.removeAttribute("aria-busy");
    }
    exibirErro(mensagem) {
        this.#grade.innerHTML = `
      <div class="vazio">
        <strong>Não foi possível carregar os produtos</strong>
        ${escaparHtml(mensagem)}
      </div>`;
        this.#contagem.textContent = "";
    }
    exibir(produtos, categoria) {
        this.#grade.innerHTML = "";
        this.#contagem.textContent = produtos.length === 1 ? "1 produto" : produtos.length + " produtos";
        if (produtos.length === 0) {
            this.#grade.innerHTML = `
        <div class="vazio">
          <strong>Nenhum produto encontrado</strong>
          Tente outro termo de busca ou escolha outra categoria.
        </div>`;
            return;
        }
        if (categoria !== "todos") {
            // Com filtro ativo mantém o carrossel, sem título de grupo.
            const grupo = document.createElement("div");
            grupo.className = "grade__grupo";
            const linha = this.#criarLinha(produtos, 0);
            grupo.appendChild(linha);
            this.#grade.appendChild(grupo);
            this.#ativarEfeitos(linha, grupo);
        }
        else {
            this.#exibirAgrupado(produtos);
        }
        this.#observador.observar();
    }
    /** Sem filtro: um carrossel por categoria, na ordem em que os produtos chegam. */
    #exibirAgrupado(produtos) {
        const porCategoria = new Map();
        produtos.forEach((produto) => {
            const lista = porCategoria.get(produto.rotuloCategoria) ?? [];
            lista.push(produto);
            porCategoria.set(produto.rotuloCategoria, lista);
        });
        let indiceGlobal = 0;
        porCategoria.forEach((doGrupo, nome) => {
            const secao = document.createElement("section");
            secao.className = "grade__grupo";
            const titulo = document.createElement("h3");
            titulo.className = "grade__grupo-titulo";
            titulo.textContent = nome;
            secao.appendChild(titulo);
            const linha = this.#criarLinha(doGrupo, indiceGlobal);
            indiceGlobal += doGrupo.length;
            secao.appendChild(linha);
            this.#grade.appendChild(secao);
            this.#ativarEfeitos(linha, secao);
        });
    }
    #criarLinha(produtos, indiceInicial) {
        const linha = document.createElement("div");
        linha.className = "grade__linha";
        produtos.forEach((produto, i) => linha.appendChild(this.#criarCard(produto, indiceInicial + i)));
        return linha;
    }
    #ativarEfeitos(linha, grupo) {
        new PreviewCarrossel(linha);
        new IndicadorScroll(linha, grupo);
    }
    #criarCard(produto, indice) {
        const card = document.createElement("article");
        card.className = "card";
        card.style.transitionDelay = (indice % 8) * 40 + "ms";
        const preco = produto.precoFormatado;
        const esgotado = produto.temPreco && produto.estaEsgotado;
        card.innerHTML = `
      <div class="card__imagem">
        ${esgotado ? '<span class="card__esgotado">Esgotado</span>' : ""}
        <img src="${escaparHtml(produto.imagem)}" alt="${escaparHtml(produto.rotulo)}" loading="lazy">
      </div>
      <div class="card__info">
        <p class="card__nome">${escaparHtml(produto.rotulo)}</p>
        <p class="card__preco ${preco ? "" : "consulta"}">${preco ?? "Consulte o valor"}</p>
      </div>
    `;
        card.addEventListener("click", () => this.#aoSelecionar(produto));
        return card;
    }
}
