import { Fragment, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutAdmin } from '../../componentes/admin/LayoutAdmin';
import { Paginacao } from '../../componentes/admin/Paginacao';
import { useToast } from '../../componentes/admin/ToastAdmin';
import type { PedidoAdmin, StatusDoPedido } from '../../dominio/admin/tipos';
import { ErroBoardPoint } from '../../dominio/excecoes/ErroBoardPoint';
import { formatarData, formatarMoeda } from '../../dominio/utilitarios/formatacao';
import { useListagemPaginada } from '../../hooks/useListagemPaginada';
import { servicoPedidosAdmin } from '../../infra/servicosAdmin';

const POR_PAGINA = 10;

const ROTULOS: Readonly<Record<StatusDoPedido, string>> = {
  aguardando_pagamento: 'Aguardando PIX',
  pago: 'Pago',
  cancelado: 'Cancelado',
};

/** Listagem de pedidos do painel: clique na linha expande os itens (porta de paginaPedidos.ts). */
export function PaginaPedidosAdmin() {
  const navegar = useNavigate();
  const mostrarToast = useToast();
  const [status, setStatus] = useState('');
  const [expandidos, setExpandidos] = useState<ReadonlySet<number>>(new Set());
  const [emAndamento, setEmAndamento] = useState<number | null>(null);

  const buscar = useCallback((pagina: number, porPagina: number) => servicoPedidosAdmin.listar(pagina, porPagina, { status }), [status]);
  const listagem = useListagemPaginada<PedidoAdmin>({ porPagina: POR_PAGINA, buscar });

  const alternarExpandido = (id: number): void => {
    setExpandidos((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  };

  const mudarStatus = async (pedido: PedidoAdmin, novoStatus: StatusDoPedido): Promise<void> => {
    const pergunta =
      novoStatus === 'pago'
        ? 'Confirma que o PIX caiu na conta? Isso vai abater o estoque dos produtos.'
        : 'Cancelar este pedido?';
    if (!window.confirm(pergunta)) return;
    setEmAndamento(pedido.id);
    try {
      await servicoPedidosAdmin.editar(pedido.id, { status: novoStatus });
      mostrarToast('Pedido atualizado.');
      listagem.recarregar();
    } catch (erro) {
      mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Erro inesperado.', 'erro');
    } finally {
      setEmAndamento(null);
    }
  };

  const excluir = async (pedido: PedidoAdmin): Promise<void> => {
    if (!window.confirm(`Excluir o pedido ${pedido.codigo}? Se estava pago, o estoque será devolvido.`)) return;
    setEmAndamento(pedido.id);
    try {
      await servicoPedidosAdmin.excluir(pedido.id);
      mostrarToast('Pedido excluído com sucesso.');
      listagem.recarregar();
    } catch (erro) {
      mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Não foi possível excluir.', 'erro');
    } finally {
      setEmAndamento(null);
    }
  };

  return (
    <LayoutAdmin titulo="Pedidos">
      <div className="painel">
        <div className="painel-cabecalho">
          <h2>Pedidos</h2>
          <div className="controles-tabela">
            <span style={{ color: 'var(--cinza)', fontSize: '0.85rem' }}>
              {listagem.totalRegistros === 1 ? '1 pedido' : `${listagem.totalRegistros} pedidos`}
            </span>
            <select className="form-select" value={status} onChange={(evento) => setStatus(evento.target.value)}>
              <option value="">Todos os status</option>
              <option value="aguardando_pagamento">Aguardando PIX</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <button className="botao-novo" onClick={() => navegar('/admin/pedidos/novo')}>
              + Novo pedido
            </button>
          </div>
        </div>
        <table className="tabela-admin table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Código</th>
              <th style={{ width: 130 }}>Data</th>
              <th>Cliente</th>
              <th style={{ width: 100 }}>Total</th>
              <th style={{ width: 130 }}>Status</th>
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
                  Não foi possível carregar os pedidos.
                </td>
              </tr>
            ) : listagem.itens.length === 0 ? (
              <tr>
                <td colSpan={5} className="estado-vazio">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              listagem.itens.map((pedido) => {
                const aberto = expandidos.has(pedido.id);
                return (
                  <Fragment key={pedido.id}>
                    <tr
                      className="linha-pedido"
                      onClick={() => alternarExpandido(pedido.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <code>{pedido.codigo}</code>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{formatarData(pedido.criado_em)}</td>
                      <td>{pedido.cliente_nome}</td>
                      <td>{formatarMoeda(pedido.total)}</td>
                      <td>
                        <span className={`status-pill ${pedido.status}`}>{ROTULOS[pedido.status]}</span>
                      </td>
                    </tr>
                    {aberto && (
                      <tr className="detalhe-pedido aberto">
                        <td colSpan={5}>
                          <p className="detalhe-contato">
                            Telefone: {pedido.cliente_telefone}
                            {pedido.cliente_email ? ` · E-mail: ${pedido.cliente_email}` : ''}
                          </p>
                          <table className="detalhe-itens">
                            <tbody>
                              {pedido.itens.map((item, indice) => (
                                <tr key={indice}>
                                  <td>
                                    {item.quantidade}× {item.produto_nome}
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    {formatarMoeda(item.preco_unitario * item.quantidade)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="acoes-pedido" onClick={(evento) => evento.stopPropagation()}>
                            {pedido.status === 'aguardando_pagamento' && (
                              <>
                                <button
                                  type="button"
                                  className="confirmar"
                                  disabled={emAndamento === pedido.id}
                                  onClick={() => void mudarStatus(pedido, 'pago')}
                                >
                                  ✓ Confirmar pagamento
                                </button>
                                <button
                                  type="button"
                                  className="cancelar"
                                  disabled={emAndamento === pedido.id}
                                  onClick={() => void mudarStatus(pedido, 'cancelado')}
                                >
                                  ✕ Cancelar pedido
                                </button>
                              </>
                            )}
                            <button type="button" className="editar" onClick={() => navegar(`/admin/pedidos/${pedido.id}/editar`)}>
                              ✎ Editar
                            </button>
                            <button
                              type="button"
                              className="cancelar"
                              disabled={emAndamento === pedido.id}
                              onClick={() => void excluir(pedido)}
                            >
                              🗑 Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
