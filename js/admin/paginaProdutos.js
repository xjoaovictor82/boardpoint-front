import { formatarPreco } from "../utilitarios/formatacao.js";
import { obterElemento } from "../utilitarios/dom.js";
import { iniciarPaginaAdmin } from "./nucleo/iniciarPaginaAdmin.js";
import { ListagemPaginada } from "./nucleo/ListagemPaginada.js";
import { ServicoCrud } from "./nucleo/ServicoCrud.js";
import { ServicoProdutos } from "./nucleo/ServicoProdutos.js";
import { mostrarToast } from "./nucleo/Toast.js";
import { botaoIcone, celula, criar, irPara, mensagemDeErro } from "./nucleo/elementos.js";
const POR_PAGINA = 10;
function celulaPreco(preco) {
    const texto = formatarPreco(preco);
    return celula(texto ? criar("span", "tag-preco", texto) : criar("span", "tag-consulta", "Consulte o valor"));
}
function celulaMiniatura(produto) {
    const imagem = criar("img", "miniatura");
    imagem.src = `../../${produto.imagem}`;
    imagem.alt = produto.nome;
    imagem.addEventListener("error", () => {
        imagem.style.opacity = "0.2";
    });
    return celula(imagem);
}
async function iniciar() {
    const contexto = await iniciarPaginaAdmin();
    if (contexto === null)
        return;
    const servico = new ServicoProdutos(contexto.api);
    const categorias = new ServicoCrud(contexto.api, "categorias.php");
    const campoBusca = obterElemento("campoBusca");
    const filtroCategoria = obterElemento("filtroCategoria");
    async function excluir(produto) {
        if (!window.confirm(`Excluir o produto "${produto.nome}"?`))
            return;
        try {
            await servico.excluir(produto.id);
            mostrarToast("Produto excluído com sucesso.");
            await listagem.carregar();
        }
        catch (erro) {
            mostrarToast(mensagemDeErro(erro), "erro");
        }
    }
    const listagem = new ListagemPaginada({
        corpo: obterElemento("corpoProdutos"),
        containerPaginacao: obterElemento("paginacaoProdutos"),
        colunas: 6,
        porPagina: POR_PAGINA,
        textoVazio: "Nenhum produto encontrado.",
        buscar: (pagina, porPagina) => servico.listar(pagina, porPagina, { busca: campoBusca.value.trim(), categoria: filtroCategoria.value }),
        linhas: (produto) => {
            const tr = criar("tr");
            const acoes = criar("div", "acoes-linha");
            acoes.append(botaoIcone("✎", "Editar", "botao-icone", () => irPara(`produto-form.html?id=${produto.id}`)), botaoIcone("✕", "Excluir", "botao-icone excluir", () => void excluir(produto)));
            tr.append(celulaMiniatura(produto), celula(produto.nome), celula(produto.categoria_nome), celulaPreco(produto.preco), celula(criar("span", produto.estoque === 0 ? "badge-estoque zero" : "badge-estoque", String(produto.estoque))), celula(acoes));
            return [tr];
        },
    });
    // Filtro de categorias (busca todas as páginas, não só as 10 primeiras).
    try {
        for (const categoria of await categorias.listarTodos()) {
            const opcao = criar("option", undefined, categoria.nome);
            opcao.value = categoria.slug;
            filtroCategoria.appendChild(opcao);
        }
    }
    catch (erro) {
        mostrarToast(mensagemDeErro(erro), "erro");
    }
    let temporizador;
    campoBusca.addEventListener("input", () => {
        window.clearTimeout(temporizador);
        temporizador = window.setTimeout(() => void listagem.recomecar(), 300);
    });
    filtroCategoria.addEventListener("change", () => void listagem.recomecar());
    obterElemento("botaoNovoProduto").addEventListener("click", () => irPara("produto-form.html"));
    await listagem.carregar();
}
void iniciar();
