import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutAdmin } from '../../componentes/admin/LayoutAdmin';
import { Paginacao } from '../../componentes/admin/Paginacao';
import { useToast } from '../../componentes/admin/ToastAdmin';
import type { CategoriaAdmin } from '../../dominio/admin/tipos';
import { ErroBoardPoint } from '../../dominio/excecoes/ErroBoardPoint';
import type { ProdutoDto } from '../../dominio/tipos/Tipos';
import { formatarPreco } from '../../dominio/utilitarios/formatacao';
import { urlPublica } from '../../dominio/utilitarios/url';
import { useListagemPaginada } from '../../hooks/useListagemPaginada';
import { servicoCategorias, servicoProdutosAdmin } from '../../infra/servicosAdmin';

const POR_PAGINA = 10;
const ATRASO_BUSCA_MS = 300;

/** Listagem de produtos do painel (porta de paginaProdutos.ts + produtos.html). */
export function PaginaProdutosAdmin() {
  const navegar = useNavigate();
  const mostrarToast = useToast();
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);

  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const temporizador = useRef<number | undefined>(undefined);

  // Busca pelo nome só depois de uma pausa na digitação (debounce), como no original.
  const aoDigitarBusca = (valor: string): void => {
    setBusca(valor);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setBuscaAplicada(valor.trim()), ATRASO_BUSCA_MS);
  };
  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  // O filtro de categorias busca todas as páginas (não só as 10 primeiras).
  useEffect(() => {
    let ativo = true;
    servicoCategorias
      .listarTodos()
      .then((lista) => {
        if (ativo) setCategorias(lista);
      })
      .catch((erro: unknown) => {
        if (ativo) mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Erro inesperado.', 'erro');
      });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscar = useCallback(
    (pagina: number, porPagina: number) =>
      servicoProdutosAdmin.listar(pagina, porPagina, { busca: buscaAplicada, categoria: categoriaFiltro }),
    [buscaAplicada, categoriaFiltro],
  );
  const listagem = useListagemPaginada<ProdutoDto>({ porPagina: POR_PAGINA, buscar });

  const excluir = async (produto: ProdutoDto): Promise<void> => {
    if (!window.confirm(`Excluir o produto "${produto.nome}"?`)) return;
    setExcluindoId(produto.id);
    try {
      await servicoProdutosAdmin.excluir(produto.id);
      mostrarToast('Produto excluído com sucesso.');
      listagem.recarregar();
    } catch (erro) {
      mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Não foi possível excluir.', 'erro');
    } finally {
      setExcluindoId(null);
    }
  };

  return (
    <LayoutAdmin titulo="Produtos">
      <div className="painel">
        <div className="painel-cabecalho">
          <h2>Todos os produtos</h2>
          <div className="controles-tabela">
            <input
              type="search"
              className="form-control"
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(evento) => aoDigitarBusca(evento.target.value)}
            />
            <select
              className="form-select"
              value={categoriaFiltro}
              onChange={(evento) => setCategoriaFiltro(evento.target.value)}
            >
              <option value="todos">Todas as categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.slug}>
                  {categoria.nome}
                </option>
              ))}
            </select>
            <button className="botao-novo" onClick={() => navegar('/admin/produtos/novo')}>
              + Novo produto
            </button>
          </div>
        </div>
        <table className="tabela-admin table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th></th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th style={{ width: 100 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listagem.carregando ? (
              <tr>
                <td colSpan={6} className="estado-vazio">
                  Carregando...
                </td>
              </tr>
            ) : listagem.erro ? (
              <tr>
                <td colSpan={6} className="estado-vazio">
                  Não foi possível carregar os produtos.
                </td>
              </tr>
            ) : listagem.itens.length === 0 ? (
              <tr>
                <td colSpan={6} className="estado-vazio">
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              listagem.itens.map((produto) => {
                const preco = formatarPreco(produto.preco);
                return (
                  <tr key={produto.id}>
                    <td>
                      <img
                        className="miniatura"
                        src={urlPublica(produto.imagem)}
                        alt={produto.nome}
                        onError={(evento) => {
                          evento.currentTarget.style.opacity = '0.2';
                        }}
                      />
                    </td>
                    <td>{produto.nome}</td>
                    <td>{produto.categoria_nome}</td>
                    <td>
                      {preco ? <span className="tag-preco">{preco}</span> : <span className="tag-consulta">Consulte o valor</span>}
                    </td>
                    <td>
                      <span className={produto.estoque === 0 ? 'badge-estoque zero' : 'badge-estoque'}>
                        {produto.estoque}
                      </span>
                    </td>
                    <td>
                      <div className="acoes-linha">
                        <button
                          type="button"
                          className="botao-icone"
                          title="Editar"
                          onClick={() => navegar(`/admin/produtos/${produto.id}/editar`)}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="botao-icone excluir"
                          title="Excluir"
                          disabled={excluindoId === produto.id}
                          onClick={() => void excluir(produto)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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
