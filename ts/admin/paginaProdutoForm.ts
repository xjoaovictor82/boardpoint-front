import { obterElemento } from "../utilitarios/dom.js";
import { iniciarPaginaAdmin } from "./nucleo/iniciarPaginaAdmin.js";
import { ServicoCrud } from "./nucleo/ServicoCrud.js";
import { ServicoProdutos } from "./nucleo/ServicoProdutos.js";
import { mostrarToast } from "./nucleo/Toast.js";
import { criar, irPara, lerIdDaUrl, mensagemDeErro } from "./nucleo/elementos.js";
import type { CategoriaAdmin, EntradaCategoria } from "./nucleo/tipos.js";
import { erroProduto, paraEntradaProduto, type CamposProduto } from "./nucleo/validacoesProduto.js";

async function iniciar(): Promise<void> {
  const contexto = await iniciarPaginaAdmin();
  if (contexto === null) return;

  const servico = new ServicoProdutos(contexto.api);
  const categorias = new ServicoCrud<CategoriaAdmin, EntradaCategoria>(contexto.api, "categorias.php");
  const id = lerIdDaUrl();

  const campoNome = obterElemento<HTMLInputElement>("produtoNome");
  const campoCategoria = obterElemento<HTMLSelectElement>("produtoCategoria");
  const campoPreco = obterElemento<HTMLInputElement>("produtoPreco");
  const campoEstoque = obterElemento<HTMLInputElement>("produtoEstoque");
  const campoImagem = obterElemento<HTMLInputElement>("produtoImagem");
  const preview = obterElemento<HTMLImageElement>("previewImagem");
  const botao = obterElemento<HTMLButtonElement>("botaoSalvarProduto");

  obterElemento("tituloFormulario").textContent = id === null ? "Novo produto" : "Editar produto";
  obterElemento("imagemObrigatoria").style.display = id === null ? "inline" : "none";

  try {
    for (const categoria of await categorias.listarTodos()) {
      const opcao = criar("option", undefined, categoria.nome);
      opcao.value = String(categoria.id);
      campoCategoria.appendChild(opcao);
    }
    if (id !== null) {
      const produto = await servico.obter(id);
      campoNome.value = produto.nome;
      campoCategoria.value = String(produto.categoria_id);
      campoPreco.value = produto.preco === null ? "" : String(produto.preco);
      campoEstoque.value = String(produto.estoque);
      preview.src = `../../${produto.imagem}`;
      preview.classList.add("ativo");
    }
  } catch (erro) {
    mostrarToast(mensagemDeErro(erro), "erro");
    if (id !== null) irPara("produtos.html", 1500);
    return;
  }

  campoImagem.addEventListener("change", () => {
    const arquivo = campoImagem.files?.[0];
    if (arquivo === undefined) {
      preview.classList.remove("ativo");
      return;
    }
    preview.src = URL.createObjectURL(arquivo);
    preview.classList.add("ativo");
  });

  obterElemento<HTMLFormElement>("formProduto").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const campos: CamposProduto = {
      categoria: campoCategoria.value,
      nome: campoNome.value.trim(),
      preco: campoPreco.value,
      estoque: campoEstoque.value,
      imagem: campoImagem.files?.[0] ?? null,
    };

    const erro = erroProduto(campos, id !== null);
    if (erro !== null) {
      mostrarToast(erro, "erro");
      return;
    }

    botao.disabled = true;
    void (async () => {
      try {
        const entrada = paraEntradaProduto(campos);
        if (id === null) await servico.criar(entrada);
        else await servico.editar(id, entrada);
        mostrarToast(id === null ? "Produto criado com sucesso." : "Produto atualizado com sucesso.");
        irPara("produtos.html", 800);
      } catch (e) {
        mostrarToast(mensagemDeErro(e), "erro");
        botao.disabled = false;
      }
    })();
  });

  obterElemento("botaoCancelarProduto").addEventListener("click", () => irPara("produtos.html"));
}

void iniciar();
