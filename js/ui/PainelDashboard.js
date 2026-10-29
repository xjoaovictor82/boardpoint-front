var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PainelDashboard_instances, _PainelDashboard_texto, _PainelDashboard_html;
import { escaparHtml, formatarMoeda } from "../utilitarios/formatacao.js";
/** Preenche a tela do dashboard do admin com os números já calculados. */
export class PainelDashboard {
    constructor() {
        _PainelDashboard_instances.add(this);
    }
    exibir(m) {
        const cards = document.querySelectorAll("#gradeStats .card-stat .valor");
        const valores = [m.totalProdutos, m.totalCategorias, m.produtosComPreco, m.produtosSemEstoque];
        valores.forEach((valor, i) => {
            const card = cards[i];
            if (card)
                card.textContent = String(valor);
        });
        __classPrivateFieldGet(this, _PainelDashboard_instances, "m", _PainelDashboard_texto).call(this, "faturamentoPotencial", formatarMoeda(m.faturamentoPotencial));
        __classPrivateFieldGet(this, _PainelDashboard_instances, "m", _PainelDashboard_texto).call(this, "precoMedio", formatarMoeda(m.precoMedio));
        __classPrivateFieldGet(this, _PainelDashboard_instances, "m", _PainelDashboard_texto).call(this, "produtoDestaque", m.produtoDestaque
            ? `${m.produtoDestaque.nome} (${m.produtoDestaque.valor} un.)`
            : "Nenhum produto cadastrado");
        __classPrivateFieldGet(this, _PainelDashboard_instances, "m", _PainelDashboard_texto).call(this, "categoriaDestaque", m.categoriaDestaque
            ? `${m.categoriaDestaque.nome} (${m.categoriaDestaque.valor} produtos)`
            : "Nenhuma categoria cadastrada");
        // Bancos vazios mostram mensagem no lugar de tabela/lista vazia.
        __classPrivateFieldGet(this, _PainelDashboard_instances, "m", _PainelDashboard_html).call(this, "corpoCategorias", m.porCategoria.length === 0
            ? '<tr><td colspan="2" class="estado-vazio">Nenhuma categoria cadastrada.</td></tr>'
            : m.porCategoria
                .map((c) => `<tr><td>${escaparHtml(c.nome)}</td><td>${c.total_produtos}</td></tr>`)
                .join(""));
        __classPrivateFieldGet(this, _PainelDashboard_instances, "m", _PainelDashboard_html).call(this, "listaEstoqueCritico", m.produtosEstoqueCritico.length === 0
            ? '<li class="estado-vazio">Nenhum produto com estoque crítico.</li>'
            : m.produtosEstoqueCritico
                .map((p) => `<li>${escaparHtml(p.rotulo)} — ${p.estoque} un.</li>`)
                .join(""));
    }
    exibirVazio() {
        __classPrivateFieldGet(this, _PainelDashboard_instances, "m", _PainelDashboard_html).call(this, "corpoCategorias", '<tr><td colspan="2" class="estado-vazio">Nenhum dado registrado.</td></tr>');
    }
}
_PainelDashboard_instances = new WeakSet(), _PainelDashboard_texto = function _PainelDashboard_texto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento)
        elemento.textContent = texto;
}, _PainelDashboard_html = function _PainelDashboard_html(id, html) {
    const elemento = document.getElementById(id);
    if (elemento)
        elemento.innerHTML = html;
};
