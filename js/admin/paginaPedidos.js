import { formatarMoeda } from "../utilitarios/formatacao.js";
import { obterElemento } from "../utilitarios/dom.js";
import { iniciarPaginaAdmin } from "./nucleo/iniciarPaginaAdmin.js";
import { ListagemPaginada } from "./nucleo/ListagemPaginada.js";
import { ServicoCrud } from "./nucleo/ServicoCrud.js";
import { mostrarToast } from "./nucleo/Toast.js";
import { celula, criar, formatarData, irPara, mensagemDeErro } from "./nucleo/elementos.js";
const POR_PAGINA = 10;
const ROTULOS = {
    aguardando_pagamento: "Aguardando PIX",
    pago: "Pago",
    cancelado: "Cancelado",
};
function botaoAcao(texto, classe, aoClicar) {
    const botao = criar("button", classe, texto);
    botao.type = "button";
    botao.addEventListener("click", (evento) => {
        evento.stopPropagation();
        aoClicar();
    });
    return botao;
}
async function iniciar() {
    const contexto = await iniciarPaginaAdmin();
    if (contexto === null)
        return;
    const servico = new ServicoCrud(contexto.api, "pedidos.php");
    const filtroStatus = obterElemento("filtroStatus");
    const contagem = obterElemento("contagemPedidos");
    async function mudarStatus(pedido, status) {
        const pergunta = status === "pago"
            ? "Confirma que o PIX caiu na conta? Isso vai abater o estoque dos produtos."
            : "Cancelar este pedido?";
        if (!window.confirm(pergunta))
            return;
        try {
            await servico.editar(pedido.id, { status });
            mostrarToast("Pedido atualizado.");
            await listagem.carregar();
        }
        catch (erro) {
            mostrarToast(mensagemDeErro(erro), "erro");
        }
    }
    async function excluir(pedido) {
        if (!window.confirm(`Excluir o pedido ${pedido.codigo}? Se estava pago, o estoque será devolvido.`))
            return;
        try {
            await servico.excluir(pedido.id);
            mostrarToast("Pedido excluído com sucesso.");
            await listagem.carregar();
        }
        catch (erro) {
            mostrarToast(mensagemDeErro(erro), "erro");
        }
    }
    function detalhe(pedido) {
        const tr = criar("tr", "detalhe-pedido");
        const td = criar("td");
        td.colSpan = 5;
        const contato = criar("p", "detalhe-contato", `Telefone: ${pedido.cliente_telefone}` + (pedido.cliente_email ? ` · E-mail: ${pedido.cliente_email}` : ""));
        const tabela = criar("table", "detalhe-itens");
        for (const item of pedido.itens) {
            const linha = criar("tr");
            const valor = celula(formatarMoeda(item.preco_unitario * item.quantidade));
            valor.style.textAlign = "right";
            linha.append(celula(`${item.quantidade}× ${item.produto_nome}`), valor);
            tabela.appendChild(linha);
        }
        const acoes = criar("div", "acoes-pedido");
        if (pedido.status === "aguardando_pagamento") {
            acoes.append(botaoAcao("✓ Confirmar pagamento", "confirmar", () => void mudarStatus(pedido, "pago")), botaoAcao("✕ Cancelar pedido", "cancelar", () => void mudarStatus(pedido, "cancelado")));
        }
        acoes.append(botaoAcao("✎ Editar", "editar", () => irPara(`pedido-form.html?id=${pedido.id}`)), botaoAcao("🗑 Excluir", "cancelar", () => void excluir(pedido)));
        td.append(contato, tabela, acoes);
        tr.appendChild(td);
        return tr;
    }
    const listagem = new ListagemPaginada({
        corpo: obterElemento("corpoPedidos"),
        containerPaginacao: obterElemento("paginacaoPedidos"),
        colunas: 5,
        porPagina: POR_PAGINA,
        textoVazio: "Nenhum pedido encontrado.",
        buscar: (pagina, porPagina) => servico.listar(pagina, porPagina, { status: filtroStatus.value }),
        aoCarregar: (resultado) => {
            contagem.textContent = resultado.total === 1 ? "1 pedido" : `${resultado.total} pedidos`;
        },
        linhas: (pedido) => {
            const principal = criar("tr", "linha-pedido");
            const codigo = criar("code", undefined, pedido.codigo);
            const data = celula(formatarData(pedido.criado_em));
            data.style.fontSize = "0.8rem";
            principal.append(celula(codigo), data, celula(pedido.cliente_nome), celula(formatarMoeda(pedido.total)), celula(criar("span", `status-pill ${pedido.status}`, ROTULOS[pedido.status])));
            const linhaDetalhe = detalhe(pedido);
            principal.addEventListener("click", () => linhaDetalhe.classList.toggle("aberto"));
            return [principal, linhaDetalhe];
        },
    });
    filtroStatus.addEventListener("change", () => void listagem.recomecar());
    obterElemento("botaoNovoPedido").addEventListener("click", () => irPara("pedido-form.html"));
    await listagem.carregar();
}
void iniciar();
