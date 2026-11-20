import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutAdmin } from '../../componentes/admin/LayoutAdmin';
import { Paginacao } from '../../componentes/admin/Paginacao';
import { useToast } from '../../componentes/admin/ToastAdmin';
import type { ContatoAdmin } from '../../dominio/admin/tipos';
import { ErroBoardPoint } from '../../dominio/excecoes/ErroBoardPoint';
import { formatarData } from '../../dominio/utilitarios/formatacao';
import { useListagemPaginada } from '../../hooks/useListagemPaginada';
import { servicoContatosAdmin } from '../../infra/servicosAdmin';

const POR_PAGINA = 10;

/** Listagem de mensagens de contato do painel (porta de paginaContatos.ts + contatos.html). */
export function PaginaContatosAdmin() {
  const navegar = useNavigate();
  const mostrarToast = useToast();
  const [filtroLida, setFiltroLida] = useState('');
  const [emAndamento, setEmAndamento] = useState<number | null>(null);

  const buscar = useCallback(
    (pagina: number, porPagina: number) => servicoContatosAdmin.listar(pagina, porPagina, { lida: filtroLida }),
    [filtroLida],
  );
  const listagem = useListagemPaginada<ContatoAdmin>({ porPagina: POR_PAGINA, buscar });

  const alternarLida = async (contato: ContatoAdmin): Promise<void> => {
    setEmAndamento(contato.id);
    try {
      await servicoContatosAdmin.editar(contato.id, { lida: !contato.lida });
      listagem.recarregar();
    } catch (erro) {
      mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Erro inesperado.', 'erro');
    } finally {
      setEmAndamento(null);
    }
  };

  const excluir = async (contato: ContatoAdmin): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja excluir essa mensagem?')) return;
    setEmAndamento(contato.id);
    try {
      await servicoContatosAdmin.excluir(contato.id);
      mostrarToast('Mensagem removida.');
      listagem.recarregar();
    } catch (erro) {
      mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Não foi possível excluir.', 'erro');
    } finally {
      setEmAndamento(null);
    }
  };

  return (
    <LayoutAdmin titulo="Mensagens">
      <div className="painel">
        <div className="painel-cabecalho">
          <h2>Contatos recebidos pelo site</h2>
          <div className="controles-tabela">
            <span style={{ color: 'var(--cinza)', fontSize: '0.85rem' }}>
              {listagem.totalRegistros === 1 ? '1 mensagem' : `${listagem.totalRegistros} mensagens`}
            </span>
            <select className="form-select" value={filtroLida} onChange={(evento) => setFiltroLida(evento.target.value)}>
              <option value="">Todas</option>
              <option value="0">Não lidas</option>
              <option value="1">Lidas</option>
            </select>
            <button className="botao-novo" onClick={() => navegar('/admin/contatos/novo')}>
              + Nova mensagem
            </button>
          </div>
        </div>
        <table className="tabela-admin table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th style={{ width: 130 }}>Recebido em</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Mensagem</th>
              <th style={{ width: 120 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listagem.carregando ? (
              <tr>
                <td colSpan={5} className="estado-vazio">
                  Carregando...
                </td>
              </tr>
            ) : listagem.erro ? (
              <tr>
                <td colSpan={5} className="estado-vazio">
                  Não foi possível carregar as mensagens.
                </td>
              </tr>
            ) : listagem.itens.length === 0 ? (
              <tr>
                <td colSpan={5} className="estado-vazio">
                  Nenhuma mensagem encontrada.
                </td>
              </tr>
            ) : (
              listagem.itens.map((contato) => (
                <tr key={contato.id} style={{ fontWeight: contato.lida ? undefined : 600 }}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{formatarData(contato.criado_em)}</td>
                  <td>{contato.nome}</td>
                  <td>
                    <a href={`mailto:${contato.email}`} style={{ color: 'var(--amarelo)' }}>
                      {contato.email}
                    </a>
                  </td>
                  <td style={{ maxWidth: 360, whiteSpace: 'pre-wrap' }}>{contato.mensagem}</td>
                  <td>
                    <div className="acoes-linha">
                      <button
                        type="button"
                        className="botao-icone"
                        title={contato.lida ? 'Marcar como não lida' : 'Marcar como lida'}
                        disabled={emAndamento === contato.id}
                        onClick={() => void alternarLida(contato)}
                      >
                        {contato.lida ? '↺' : '✓'}
                      </button>
                      <button
                        type="button"
                        className="botao-icone"
                        title="Editar"
                        onClick={() => navegar(`/admin/contatos/${contato.id}/editar`)}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="botao-icone excluir"
                        title="Excluir"
                        disabled={emAndamento === contato.id}
                        onClick={() => void excluir(contato)}
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
