import { ErroBoardPoint } from "../excecoes/ErroBoardPoint.js";
import { obterElemento } from "../utilitarios/dom.js";
import { iniciarPaginaAdmin } from "./nucleo/iniciarPaginaAdmin.js";
import { Paginacao } from "./nucleo/Paginacao.js";
import { ServicoCrud } from "./nucleo/ServicoCrud.js";
import { mostrarToast } from "./nucleo/Toast.js";
import type { CategoriaAdmin, EntradaCategoria } from "./nucleo/tipos.js";

const POR_PAGINA = 10;

function celula(texto: string, comoCodigo = false): HTMLTableCellElement {
  const td = document.createElement("td");
  if (comoCodigo) {
    const code = document.createElement("code");
    code.textContent = texto;
    td.appendChild(code);
  } else {
    td.textContent = texto;
  }
  return td;
}

function botaoIcone(texto: string, titulo: string, classe: string, aoClicar: () => void): HTMLButtonElement {
  const botao = document.createElement("button");
  botao.className = classe;
  botao.textContent = texto;
  botao.title = titulo;
  botao.addEventListener("click", aoClicar);
  return botao;
}

async function iniciar(): Promise<void> {
  const contexto = await iniciarPaginaAdmin();
  if (contexto === null) return;

  const servico = new ServicoCrud<CategoriaAdmin, EntradaCategoria>(contexto.api, "categorias.php");
  const corpo = obterElemento<HTMLTableSectionElement>("corpoCategorias");
  let paginaAtual = 1;

  const paginacao = new Paginacao(obterElemento("paginacaoCategorias"), (pagina) => {
    paginaAtual = pagina;
    void carregar();
  });

  function linhaVazia(texto: string): void {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.className = "estado-vazio";
    td.textContent = texto;
    tr.appendChild(td);
    corpo.replaceChildren(tr);
  }

  async function excluir(categoria: CategoriaAdmin): Promise<void> {
    if (!window.confirm(`Excluir a categoria "${categoria.nome}"?`)) return;
    try {
      await servico.excluir(categoria.id);
      mostrarToast("Categoria excluída com sucesso.");
      await carregar();
    } catch (erro) {
      mostrarToast(erro instanceof ErroBoardPoint ? erro.message : "Não foi possível excluir.", "erro");
    }
  }

  async function carregar(): Promise<void> {
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
      } else {
        corpo.replaceChildren(
          ...resultado.itens.map((categoria) => {
            const tr = document.createElement("tr");
            const acoes = document.createElement("div");
            acoes.className = "acoes-linha";
            acoes.append(
              botaoIcone("✎", "Editar", "botao-icone", () => {
                window.location.href = `categoria-form.html?id=${categoria.id}`;
              }),
              botaoIcone("✕", "Excluir", "botao-icone excluir", () => void excluir(categoria)),
            );
            const tdAcoes = document.createElement("td");
            tdAcoes.appendChild(acoes);
            tr.append(celula(categoria.nome), celula(categoria.slug, true), tdAcoes);
            return tr;
          }),
        );
      }
      paginacao.atualizar(resultado.pagina, resultado.total_paginas, resultado.total);
    } catch (erro) {
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
