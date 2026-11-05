import { validarEmail } from "../cliente/validacoes.js";
import { formatarMoeda } from "../utilitarios/formatacao.js";
import { obterElemento } from "../utilitarios/dom.js";
import { iniciarPaginaAdmin } from "./nucleo/iniciarPaginaAdmin.js";
import { ServicoCrud } from "./nucleo/ServicoCrud.js";
import { ServicoProdutos } from "./nucleo/ServicoProdutos.js";
import { mostrarToast } from "./nucleo/Toast.js";
import { celula, criar, irPara, lerIdDaUrl, mensagemDeErro } from "./nucleo/elementos.js";
/** Regras do cliente (iguais às de pedidos.php). */
function erroCliente(nome, telefone, email) {
    if (nome === "" || telefone === "")
        return "Nome e telefone do cliente são obrigatórios.";
    if (nome.length > 150 || telefone.length > 30)
        return "Nome ou telefone muito longos.";
    if (email !== "" && !validarEmail(email))
        return "E-mail inválido. Exemplo: nome@exemplo.com";
    return null;
}
async function iniciar() {
    const contexto = await iniciarPaginaAdmin();
    if (contexto === null)
        return;
    const servico = new ServicoCrud(contexto.api, "pedidos.php");
    const id = lerIdDaUrl();
    const edicao = id !== null;
    const campoNome = obterElemento("pedidoNome");
    const campoTelefone = obterElemento("pedidoTelefone");
    const campoEmail = obterElemento("pedidoEmail");
    const campoStatus = obterElemento("pedidoStatus");
    const botao = obterElemento("botaoSalvarPedido");
    const blocoNovo = obterElemento("blocoItensNovo");
    const blocoLeitura = obterElemento("blocoItensLeitura");
    const listaItens = obterElemento("listaItens");
    const totalPedido = obterElemento("totalPedido");
    obterElemento("tituloFormulario").textContent = edicao ? "Editar pedido" : "Novo pedido";
    obterElemento("grupoStatus").style.display = edicao ? "block" : "none";
    blocoNovo.style.display = edicao ? "none" : "block";
    blocoLeitura.style.display = edicao ? "block" : "none";
    let produtos = [];
    // ---------- Itens do pedido novo ----------
    const linhasItens = [];
    function lerItens() {
        return linhasItens.map((l) => ({ produto_id: Number(l.select.value), quantidade: Number(l.quantidade.value) }));
    }
    function atualizarTotal() {
        let total = 0;
        for (const item of lerItens()) {
            const produto = produtos.find((p) => p.id === item.produto_id);
            if (produto?.preco != null && Number.isInteger(item.quantidade) && item.quantidade > 0) {
                total += produto.preco * item.quantidade;
            }
        }
        totalPedido.textContent = formatarMoeda(total);
    }
    function adicionarLinhaItem() {
        const select = criar("select", "form-select");
        for (const produto of produtos) {
            const opcao = criar("option", undefined, `${produto.nome} — ${formatarMoeda(produto.preco ?? 0)} (estoque ${produto.estoque})`);
            opcao.value = String(produto.id);
            select.appendChild(opcao);
        }
        const quantidade = criar("input", "form-control");
        quantidade.type = "number";
        quantidade.min = "1";
        quantidade.value = "1";
        quantidade.style.maxWidth = "100px";
        const registro = { select, quantidade };
        const remover = criar("button", "botao-icone excluir", "✕");
        remover.type = "button";
        remover.title = "Remover item";
        remover.addEventListener("click", () => {
            linhasItens.splice(linhasItens.indexOf(registro), 1);
            linha.remove();
            atualizarTotal();
        });
        select.addEventListener("change", atualizarTotal);
        quantidade.addEventListener("input", atualizarTotal);
        const linha = criar("div", "item-pedido-linha");
        linha.append(select, quantidade, remover);
        listaItens.appendChild(linha);
        linhasItens.push(registro);
        atualizarTotal();
    }
    try {
        if (edicao) {
            const pedido = await servico.obter(id);
            campoNome.value = pedido.cliente_nome;
            campoTelefone.value = pedido.cliente_telefone;
            campoEmail.value = pedido.cliente_email ?? "";
            campoStatus.value = pedido.status;
            const tabela = obterElemento("itensLeitura");
            for (const item of pedido.itens) {
                const tr = criar("tr");
                tr.append(celula(`${item.quantidade}× ${item.produto_nome}`), celula(formatarMoeda(item.preco_unitario * item.quantidade)));
                tabela.appendChild(tr);
            }
            obterElemento("totalLeitura").textContent = formatarMoeda(pedido.total);
        }
        else {
            const todos = await new ServicoProdutos(contexto.api).listarTodos();
            produtos = todos.filter((p) => p.ativo && p.preco !== null && p.estoque > 0);
            if (produtos.length === 0) {
                mostrarToast("Não há produtos com preço e estoque para vender.", "erro");
                botao.disabled = true;
            }
            else {
                adicionarLinhaItem();
            }
        }
    }
    catch (erro) {
        mostrarToast(mensagemDeErro(erro), "erro");
        if (edicao)
            irPara("pedidos.html", 1500);
        return;
    }
    obterElemento("botaoAdicionarItem").addEventListener("click", () => {
        if (produtos.length > 0)
            adicionarLinhaItem();
    });
    obterElemento("formPedido").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const nome = campoNome.value.trim();
        const telefone = campoTelefone.value.trim();
        const email = campoEmail.value.trim().toLowerCase();
        const erro = erroCliente(nome, telefone, email);
        if (erro !== null) {
            mostrarToast(erro, "erro");
            return;
        }
        const itens = lerItens();
        if (!edicao) {
            if (itens.length === 0) {
                mostrarToast("Adicione pelo menos um item ao pedido.", "erro");
                return;
            }
            if (itens.some((i) => !Number.isInteger(i.quantidade) || i.quantidade < 1 || i.quantidade > 1000)) {
                mostrarToast("Informe quantidades inteiras entre 1 e 1000.", "erro");
                return;
            }
            // Confere o estoque somando linhas do mesmo produto.
            const somas = new Map();
            for (const item of itens)
                somas.set(item.produto_id, (somas.get(item.produto_id) ?? 0) + item.quantidade);
            for (const [produtoId, soma] of somas) {
                const produto = produtos.find((p) => p.id === produtoId);
                if (produto !== undefined && soma > produto.estoque) {
                    mostrarToast(`Estoque insuficiente para "${produto.nome}" (disponível: ${produto.estoque}).`, "erro");
                    return;
                }
            }
        }
        const dados = {
            cliente_nome: nome,
            cliente_telefone: telefone,
            cliente_email: email,
            status: campoStatus.value,
            itens,
        };
        botao.disabled = true;
        void (async () => {
            try {
                if (!edicao) {
                    await servico.criar(dados);
                    mostrarToast("Pedido criado com sucesso.");
                }
                else {
                    await servico.editar(id, {
                        cliente_nome: dados.cliente_nome,
                        cliente_telefone: dados.cliente_telefone,
                        cliente_email: dados.cliente_email,
                        status: dados.status,
                    });
                    mostrarToast("Pedido atualizado com sucesso.");
                }
                irPara("pedidos.html", 800);
            }
            catch (e) {
                mostrarToast(mensagemDeErro(e), "erro");
                botao.disabled = false;
            }
        })();
    });
    obterElemento("botaoCancelarPedido").addEventListener("click", () => irPara("pedidos.html"));
}
void iniciar();
