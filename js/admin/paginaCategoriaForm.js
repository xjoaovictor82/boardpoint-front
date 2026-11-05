import { ErroApi } from "../excecoes/ErroApi.js";
import { ErroBoardPoint } from "../excecoes/ErroBoardPoint.js";
import { obterElemento } from "../utilitarios/dom.js";
import { iniciarPaginaAdmin } from "./nucleo/iniciarPaginaAdmin.js";
import { ServicoCrud } from "./nucleo/ServicoCrud.js";
import { mostrarToast } from "./nucleo/Toast.js";
import { erroCategoria, slugificar } from "./nucleo/validacoesCategoria.js";
/** Lê ?id=N da URL. null = cadastro novo; NaN/inválido também cai em cadastro novo. */
function lerIdDaUrl() {
    const bruto = new URLSearchParams(window.location.search).get("id");
    if (bruto === null)
        return null;
    const id = Number(bruto);
    return Number.isInteger(id) && id > 0 ? id : null;
}
async function iniciar() {
    const contexto = await iniciarPaginaAdmin();
    if (contexto === null)
        return;
    const servico = new ServicoCrud(contexto.api, "categorias.php");
    const id = lerIdDaUrl();
    const campoNome = obterElemento("categoriaNome");
    const campoSlug = obterElemento("categoriaSlug");
    const botao = obterElemento("botaoSalvarCategoria");
    const formulario = obterElemento("formCategoria");
    obterElemento("tituloFormulario").textContent = id === null ? "Nova categoria" : "Editar categoria";
    if (id !== null) {
        try {
            const categoria = await servico.obter(id);
            campoNome.value = categoria.nome;
            campoSlug.value = categoria.slug;
        }
        catch (erro) {
            mostrarToast(erro instanceof ErroBoardPoint ? erro.message : "Erro ao carregar.", "erro");
            window.setTimeout(() => {
                window.location.href = "categorias.html";
            }, 1500);
            return;
        }
    }
    else {
        // No cadastro, o slug acompanha o nome enquanto a pessoa digita.
        campoNome.addEventListener("input", () => {
            campoSlug.value = slugificar(campoNome.value);
        });
    }
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const dados = {
            nome: campoNome.value.trim(),
            slug: campoSlug.value.trim().toLowerCase(),
        };
        const erro = erroCategoria(dados);
        if (erro !== null) {
            mostrarToast(erro, "erro");
            return;
        }
        botao.disabled = true;
        void (async () => {
            try {
                if (id === null)
                    await servico.criar(dados);
                else
                    await servico.editar(id, dados);
                mostrarToast(id === null ? "Categoria criada com sucesso." : "Categoria atualizada com sucesso.");
                window.setTimeout(() => {
                    window.location.href = "categorias.html";
                }, 800);
            }
            catch (e) {
                const mensagem = e instanceof ErroApi || e instanceof ErroBoardPoint ? e.message : "Erro inesperado.";
                mostrarToast(mensagem, "erro");
                botao.disabled = false;
            }
        })();
    });
    obterElemento("botaoCancelarCategoria").addEventListener("click", () => {
        window.location.href = "categorias.html";
    });
}
void iniciar();
