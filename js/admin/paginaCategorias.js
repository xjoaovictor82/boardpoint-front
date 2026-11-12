import { ErroBoardPoint } from "../excecoes/ErroBoardPoint.js";
import { obterElemento } from "../utilitarios/dom.js";
import { iniciarPaginaAdmin } from "./nucleo/iniciarPaginaAdmin.js";
import { Paginacao } from "./nucleo/Paginacao.js";
import { ServicoCrud } from "./nucleo/ServicoCrud.js";
import { mostrarToast } from "./nucleo/Toast.js";
const POR_PAGINA = 10;
function celula(texto, comoCodigo = false) {
    const td = document.createElement("td");
    if (comoCodigo) {
        const code = document.createElement("code");
        code.textContent = texto;
        td.appendChild(code);
    }
    else {
        td.textContent = texto;
    }
    return td;
}
function botaoIcone(texto, titulo, classe, aoClicar) {
    const botao = document.createElement("button");
    botao.className = classe;
    botao.textContent = texto;
    botao.title = titulo;
    botao.addEventListener("click", aoClicar);
    return botao;
}
async function iniciar() {
    const contexto = await iniciarPaginaAdmin();
    if (contexto === null)
        return;
    const servico = new ServicoCrud(contexto.api, "categorias.php");
    const corpo = obterElemento("corpoCategorias");
    let paginaAtual = 1;
    const paginacao = new Paginacao(obterElemento("paginacaoCategorias"), (pagina) => {
        paginaAtual = pagina;
        void carregar();
    });
    function linhaVazia(texto) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 3;
        td.className = "estado-vazio";
        td.textContent = texto;
        tr.appendChild(td);
        corpo.replaceChildren(tr);
    }
    async function excluir(categoria) {
        if (!window.confirm(`Excluir a categoria "${categoria.nome}"?`))
            return;
        try {
            await servico.excluir(categoria.id);
            mostrarToast("Categoria excluída com sucesso.");
            await carregar();
        }
        catch (erro) {
            mostrarToast(erro instanceof ErroBoardPoint ? erro.message : "Não foi possível excluir.", "erro");
        }
    }
    async function carregar() {
        try {
            const resultado = await servico.listar(paginaAtual, POR_PAGINA);
            // Apagou o último item da última página: volta uma página.
            if (resultado.itens.length === 0 && paginaAtual > 1) {
                paginaAtual -= 1;
                await carregar();
                return;
            }
            if (resultado.itens.length === 0) {
                linhaVazia("Nenhuma categoria cadastrada.");
            }
            else {
                corpo.replaceChildren(...resultado.itens.map((categoria) => {
                    const tr = document.createElement("tr");
                    const acoes = document.createElement("div");
                    acoes.className = "acoes-linha";
                    acoes.append(botaoIcone("✎", "Editar", "botao-icone", () => {
                        window.location.href = `categoria-form.html?id=${categoria.id}`;
                    }), botaoIcone("✕", "Excluir", "botao-icone excluir", () => void excluir(categoria)));
                    const tdAcoes = document.createElement("td");
                    tdAcoes.appendChild(acoes);
                    tr.append(celula(categoria.nome), celula(categoria.slug, true), tdAcoes);
                    return tr;
                }));
            }
            paginacao.atualizar(resultado.pagina, resultado.total_paginas, resultado.total);
        }
        catch (erro) {
            linhaVazia("Não foi possível carregar as categorias.");
            mostrarToast(erro instanceof ErroBoardPoint ? erro.message : "Erro inesperado.", "erro");
        }
    }
    obterElemento("botaoNovaCategoria").addEventListener("click", () => {
        window.location.href = "categoria-form.html";
    });
    await carregar();
}
void iniciar();
