import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutAdmin } from '../../componentes/admin/LayoutAdmin';
import { Paginacao } from '../../componentes/admin/Paginacao';
import { useToast } from '../../componentes/admin/ToastAdmin';
import type { CategoriaAdmin } from '../../dominio/admin/tipos';
import { ErroBoardPoint } from '../../dominio/excecoes/ErroBoardPoint';
import { useListagemPaginada } from '../../hooks/useListagemPaginada';
import { servicoCategorias } from '../../infra/servicosAdmin';

const POR_PAGINA = 10;

/** Listagem de categorias do painel (porta de paginaCategorias.ts + categorias.html). */
export function PaginaCategoriasAdmin() {
  const navegar = useNavigate();
  const mostrarToast = useToast();
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const buscar = useCallback((pagina: number, porPagina: number) => servicoCategorias.listar(pagina, porPagina), []);
  const listagem = useListagemPaginada<CategoriaAdmin>({ porPagina: POR_PAGINA, buscar });

  const excluir = async (categoria: CategoriaAdmin): Promise<void> => {
    if (!window.confirm(`Excluir a categoria "${categoria.nome}"?`)) return;
    setExcluindoId(categoria.id);
    try {
      await servicoCategorias.excluir(categoria.id);
      mostrarToast('Categoria excluída com sucesso.');
      listagem.recarregar();
    } catch (erro) {
      mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Não foi possível excluir.', 'erro');
    } finally {
      setExcluindoId(null);
    }
  };

  return (
    <LayoutAdmin titulo="Categorias">
      <div className="painel">
        <div className="painel-cabecalho">
          <h2>Todas as categorias</h2>
          <div className="controles-tabela">
            <button className="botao-novo" onClick={() => navegar('/admin/categorias/novo')}>
              + Nova categoria
            </button>
          </div>
        </div>
        <table className="tabela-admin table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Slug</th>
              <th style={{ width: 100 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listagem.carregando ? (
              <tr>
                <td colSpan={3} className="estado-vazio">
                  Carregando...
                </td>
              </tr>
            ) : listagem.erro ? (
              <tr>
                <td colSpan={3} className="estado-vazio">
                  Não foi possível carregar as categorias.
                </td>
              </tr>
            ) : listagem.itens.length === 0 ? (
              <tr>
                <td colSpan={3} className="estado-vazio">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            ) : (
              listagem.itens.map((categoria) => (
                <tr key={categoria.id}>
                  <td>{categoria.nome}</td>
                  <td>
                    <code>{categoria.slug}</code>
                  </td>
                  <td>
                    <div className="acoes-linha">
                      <button
                        type="button"
                        className="botao-icone"
                        title="Editar"
                        onClick={() => navegar(`/admin/categorias/${categoria.id}/editar`)}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="botao-icone excluir"
                        title="Excluir"
                        disabled={excluindoId === categoria.id}
                        onClick={() => void excluir(categoria)}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Paginacao
          pagina={listagem.pagina}
          totalPaginas={listagem.totalPaginas}
          totalRegistros={listagem.totalRegistros}
          aoMudar={listagem.irPara}
        />
      </div>
    </LayoutAdmin>
  );
}
