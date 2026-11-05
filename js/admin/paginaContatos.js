import { obterElemento } from "../utilitarios/dom.js";
import { iniciarPaginaAdmin } from "./nucleo/iniciarPaginaAdmin.js";
import { ListagemPaginada } from "./nucleo/ListagemPaginada.js";
import { ServicoCrud } from "./nucleo/ServicoCrud.js";
import { mostrarToast } from "./nucleo/Toast.js";
import { botaoIcone, celula, criar, formatarData, irPara, mensagemDeErro } from "./nucleo/elementos.js";
const POR_PAGINA = 10;
function celulaEmail(email) {
    const link = criar("a", undefined, email);
    link.href = `mailto:${email}`;
    link.style.color = "var(--amarelo)";
    return celula(link);
}
async function iniciar() {
    const contexto = await iniciarPaginaAdmin();
    if (contexto === null)
        return;
    const servico = new ServicoCrud(contexto.api, "contato.php");
    const filtroLida = obterElemento("filtroLida");
    const contagem = obterElemento("contagemContatos");
    async function alternarLida(contato) {
        try {
            await servico.editar(contato.id, { lida: !contato.lida });
            await listagem.carregar();
        }
        catch (erro) {
            mostrarToast(mensagemDeErro(erro), "erro");
        }
    }
    async function excluir(contato) {
        if (!window.confirm("Tem certeza que deseja excluir essa mensagem?"))
            return;
        try {
            await servico.excluir(contato.id);
            mostrarToast("Mensagem removida.");
            await listagem.carregar();
        }
        catch (erro) {
            mostrarToast(mensagemDeErro(erro), "erro");
        }
    }
    const listagem = new ListagemPaginada({
        corpo: obterElemento("corpoContatos"),
        containerPaginacao: obterElemento("paginacaoContatos"),
        colunas: 5,
        porPagina: POR_PAGINA,
        textoVazio: "Nenhuma mensagem encontrada.",
        buscar: (pagina, porPagina) => servico.listar(pagina, porPagina, { lida: filtroLida.value }),
        aoCarregar: (resultado) => {
            contagem.textContent = resultado.total === 1 ? "1 mensagem" : `${resultado.total} mensagens`;
        },
        linhas: (contato) => {
            const tr = criar("tr");
            if (!contato.lida)
                tr.style.fontWeight = "600";
            const data = celula(formatarData(contato.criado_em));
            data.style.whiteSpace = "nowrap";
            data.style.fontSize = "0.8rem";
            const mensagem = celula(contato.mensagem);
            mensagem.style.maxWidth = "360px";
            mensagem.style.whiteSpace = "pre-wrap";
            const acoes = criar("div", "acoes-linha");
            acoes.append(botaoIcone(contato.lida ? "↺" : "✓", contato.lida ? "Marcar como não lida" : "Marcar como lida", "botao-icone", () => void alternarLida(contato)), botaoIcone("✎", "Editar", "botao-icone", () => irPara(`contato-form.html?id=${contato.id}`)), botaoIcone("✕", "Excluir", "botao-icone excluir", () => void excluir(contato)));
            tr.append(data, celula(contato.nome), celulaEmail(contato.email), mensagem, celula(acoes));
            return [tr];
        },
    });
    filtroLida.addEventListener("change", () => void listagem.recomecar());
    obterElemento("botaoNovoContato").addEventListener("click", () => irPara("contato-form.html"));
    await listagem.carregar();
}
void iniciar();
