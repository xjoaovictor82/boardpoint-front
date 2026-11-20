import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutAdmin } from '../../componentes/admin/LayoutAdmin';
import { useToast } from '../../componentes/admin/ToastAdmin';
import type { ItemEntradaPedido, PedidoAdmin, StatusDoPedido } from '../../dominio/admin/tipos';
import { erroCliente, erroItensNovoPedido } from '../../dominio/admin/validacoesPedido';
import { ErroBoardPoint } from '../../dominio/excecoes/ErroBoardPoint';
import type { ProdutoDto } from '../../dominio/tipos/Tipos';
import { formatarMoeda } from '../../dominio/utilitarios/formatacao';
import { servicoPedidosAdmin, servicoProdutosAdmin } from '../../infra/servicosAdmin';

interface LinhaItem {
  chave: number;
  produtoId: number;
  quantidade: string;
}

let proximaChave = 1;

/** Cadastro/edição de pedido, com itens dinâmicos no cadastro (porta de paginaPedidoForm.ts). */
export function PaginaPedidoFormAdmin() {
  const { id: idTexto } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const mostrarToast = useToast();

  const id = idTexto !== undefined ? Number(idTexto) : null;
  const ehEdicao = id !== null && Number.isInteger(id) && id > 0;

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<StatusDoPedido>('aguardando_pagamento');
  const [pedidoLeitura, setPedidoLeitura] = useState<PedidoAdmin | null>(null);

  const [produtosVendaveis, setProdutosVendaveis] = useState<ProdutoDto[]>([]);
  const [linhas, setLinhas] = useState<LinhaItem[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    if (ehEdicao) {
      servicoPedidosAdmin
        .obter(id)
        .then((pedido) => {
          if (!ativo) return;
          setNome(pedido.cliente_nome);
          setTelefone(pedido.cliente_telefone);
          setEmail(pedido.cliente_email ?? '');
          setStatus(pedido.status);
          setPedidoLeitura(pedido);
          setCarregando(false);
        })
        .catch((erro: unknown) => {
          if (!ativo) return;
          mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Erro ao carregar.', 'erro');
          window.setTimeout(() => navegar('/admin/pedidos'), 1500);
        });
    } else {
      servicoProdutosAdmin
        .listarTodos()
        .then((todos) => {
          if (!ativo) return;
          const vendaveis = todos.filter((p) => p.ativo && p.preco !== null && p.estoque > 0);
          setProdutosVendaveis(vendaveis);
          if (vendaveis.length === 0) {
            mostrarToast('Não há produtos com preço e estoque para vender.', 'erro');
          } else {
            setLinhas([{ chave: proximaChave++, produtoId: vendaveis[0]!.id, quantidade: '1' }]);
          }
          setCarregando(false);
        })
        .catch((erro: unknown) => {
          if (!ativo) return;
          mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Erro ao carregar.', 'erro');
          setCarregando(false);
        });
    }

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ehEdicao, id]);

  const adicionarLinha = (): void => {
    if (produtosVendaveis.length === 0) return;
    setLinhas((atual) => [...atual, { chave: proximaChave++, produtoId: produtosVendaveis[0]!.id, quantidade: '1' }]);
  };

  const removerLinha = (chave: number): void => {
    setLinhas((atual) => atual.filter((linha) => linha.chave !== chave));
  };

  const atualizarLinha = (chave: number, campo: 'produtoId' | 'quantidade', valor: string): void => {
    setLinhas((atual) =>
      atual.map((linha) =>
        linha.chave === chave
          ? { ...linha, [campo]: campo === 'produtoId' ? Number(valor) : valor }
          : linha,
      ),
    );
  };

  const total = useMemo(() => {
    let soma = 0;
    for (const linha of linhas) {
      const produto = produtosVendaveis.find((p) => p.id === linha.produtoId);
      const quantidade = Number(linha.quantidade);
      if (produto?.preco != null && Number.isInteger(quantidade) && quantidade > 0) {
        soma += produto.preco * quantidade;
      }
    }
    return soma;
  }, [linhas, produtosVendaveis]);

  const salvar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    const nomeLimpo = nome.trim();
    const telefoneLimpo = telefone.trim();
    const emailLimpo = email.trim().toLowerCase();

    const erroDoCliente = erroCliente(nomeLimpo, telefoneLimpo, emailLimpo);
    if (erroDoCliente !== null) {
      mostrarToast(erroDoCliente, 'erro');
      return;
    }

    const itens: ItemEntradaPedido[] = linhas.map((linha) => ({
      produto_id: linha.produtoId,
      quantidade: Number(linha.quantidade),
    }));

    if (!ehEdicao) {
      const erroDosItens = erroItensNovoPedido(itens, produtosVendaveis);
      if (erroDosItens !== null) {
        mostrarToast(erroDosItens, 'erro');
        return;
      }
    }

    setSalvando(true);
    try {
      if (!ehEdicao) {
        await servicoPedidosAdmin.criar({
          cliente_nome: nomeLimpo,
          cliente_telefone: telefoneLimpo,
          cliente_email: emailLimpo,
          status,
          itens,
        });
        mostrarToast('Pedido criado com sucesso.');
      } else {
        await servicoPedidosAdmin.editar(id, {
          cliente_nome: nomeLimpo,
          cliente_telefone: telefoneLimpo,
          cliente_email: emailLimpo,
          status,
        });
        mostrarToast('Pedido atualizado com sucesso.');
      }
      window.setTimeout(() => navegar('/admin/pedidos'), 800);
    } catch (erro) {
      mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Erro inesperado.', 'erro');
      setSalvando(false);
    }
  };

  return (
    <LayoutAdmin titulo={ehEdicao ? 'Editar pedido' : 'Novo pedido'}>
      <div className="painel">
        <form style={{ maxWidth: 620 }} noValidate onSubmit={(evento) => void salvar(evento)}>
          <div className="campo-grupo">
            <label htmlFor="pedidoNome">Nome do cliente</label>
            <input
              type="text"
              id="pedidoNome"
              className="form-control"
              maxLength={150}
              required
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              disabled={carregando}
            />
          </div>
          <div className="campo-grupo">
            <label htmlFor="pedidoTelefone">Telefone</label>
            <input
              type="text"
              id="pedidoTelefone"
              className="form-control"
              maxLength={30}
              required
              placeholder="(44) 99999-9999"
              value={telefone}
              onChange={(evento) => setTelefone(evento.target.value)}
              disabled={carregando}
            />
          </div>
          <div className="campo-grupo">
            <label htmlFor="pedidoEmail">E-mail (opcional)</label>
            <input
              type="email"
              id="pedidoEmail"
              className="form-control"
              maxLength={150}
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              disabled={carregando}
            />
          </div>

          {ehEdicao && (
            <div className="campo-grupo">
              <label htmlFor="pedidoStatus">Status</label>
              <select
                id="pedidoStatus"
                className="form-select"
                value={status}
                onChange={(evento) => setStatus(evento.target.value as StatusDoPedido)}
                disabled={carregando}
              >
                <option value="aguardando_pagamento">Aguardando PIX</option>
                <option value="pago">Pago (abate o estoque)</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          )}

          {!ehEdicao ? (
            <div>
              <label style={{ display: 'block', marginBottom: 8 }}>Itens do pedido</label>
              <div>
                {linhas.map((linha) => (
                  <div className="item-pedido-linha" key={linha.chave}>
                    <select
                      className="form-select"
                      value={linha.produtoId}
                      onChange={(evento) => atualizarLinha(linha.chave, 'produtoId', evento.target.value)}
                    >
                      {produtosVendaveis.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome} — {formatarMoeda(produto.preco ?? 0)} (estoque {produto.estoque})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="form-control"
                      min={1}
                      style={{ maxWidth: 100 }}
                      value={linha.quantidade}
                      onChange={(evento) => atualizarLinha(linha.chave, 'quantidade', evento.target.value)}
                    />
                    <button
                      type="button"
                      className="botao-icone excluir"
                      title="Remover item"
                      onClick={() => removerLinha(linha.chave)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="botao-secundario"
                onClick={adicionarLinha}
                disabled={produtosVendaveis.length === 0}
              >
                + Adicionar item
              </button>
              <div className="total-pedido">Total: {formatarMoeda(total)}</div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: 8 }}>Itens (não editáveis)</label>
              <table className="detalhe-itens">
                <tbody>
                  {pedidoLeitura?.itens.map((item, indice) => (
                    <tr key={indice}>
                      <td>
                        {item.quantidade}× {item.produto_nome}
                      </td>
                      <td>{formatarMoeda(item.preco_unitario * item.quantidade)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total-pedido">Total: {pedidoLeitura ? formatarMoeda(pedidoLeitura.total) : ''}</div>
            </div>
          )}

          <div className="modal-acoes" style={{ display: 'flex', gap: 12, marginTop: 22 }}>
            <button type="button" className="botao-secundario" onClick={() => navegar('/admin/pedidos')}>
              Cancelar
            </button>
            <button
              type="submit"
              className="botao-primario btn"
              disabled={carregando || salvando || (!ehEdicao && produtosVendaveis.length === 0)}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </LayoutAdmin>
  );
}
