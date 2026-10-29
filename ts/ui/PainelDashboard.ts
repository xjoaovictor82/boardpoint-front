import type { MetricasDashboard } from "../tipos/Tipos.js";
import { escaparHtml, formatarMoeda } from "../utilitarios/formatacao.js";

/** Preenche a tela do dashboard do admin com os números já calculados. */
export class PainelDashboard {
  exibir(m: MetricasDashboard): void {
    const cards = document.querySelectorAll<HTMLElement>("#gradeStats .card-stat .valor");
    const valores = [m.totalProdutos, m.totalCategorias, m.produtosComPreco, m.produtosSemEstoque];
    valores.forEach((valor, i) => {
      const card = cards[i];
      if (card) card.textContent = String(valor);
    });

    this.#texto("faturamentoPotencial", formatarMoeda(m.faturamentoPotencial));
    this.#texto("precoMedio", formatarMoeda(m.precoMedio));
    this.#texto(
      "produtoDestaque",
      m.produtoDestaque
        ? `${m.produtoDestaque.nome} (${m.produtoDestaque.valor} un.)`
        : "Nenhum produto cadastrado"
    );
    this.#texto(
      "categoriaDestaque",
      m.categoriaDestaque
        ? `${m.categoriaDestaque.nome} (${m.categoriaDestaque.valor} produtos)`
        : "Nenhuma categoria cadastrada"
    );

    // Bancos vazios mostram mensagem no lugar de tabela/lista vazia.
    this.#html(
      "corpoCategorias",
      m.porCategoria.length === 0
        ? '<tr><td colspan="2" class="estado-vazio">Nenhuma categoria cadastrada.</td></tr>'
        : m.porCategoria
            .map((c) => `<tr><td>${escaparHtml(c.nome)}</td><td>${c.total_produtos}</td></tr>`)
            .join("")
    );

    this.#html(
      "listaEstoqueCritico",
      m.produtosEstoqueCritico.length === 0
        ? '<li class="estado-vazio">Nenhum produto com estoque crítico.</li>'
        : m.produtosEstoqueCritico
            .map((p) => `<li>${escaparHtml(p.rotulo)} — ${p.estoque} un.</li>`)
            .join("")
    );
  }

  exibirVazio(): void {
    this.#html(
      "corpoCategorias",
      '<tr><td colspan="2" class="estado-vazio">Nenhum dado registrado.</td></tr>'
    );
  }

  #texto(id: string, texto: string): void {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = texto;
  }

  #html(id: string, html: string): void {
    const elemento = document.getElementById(id);
    if (elemento) elemento.innerHTML = html;
  }
}
