import { formatarMoeda } from '../../dominio/utilitarios/formatacao';
import { urlPublica } from '../../dominio/utilitarios/url';
import { useCarrinho } from '../../hooks/useCarrinho';
import { useJanelaModal } from '../../hooks/useJanelaModal';

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  aoFinalizar: () => void;
}

/** Janela do carrinho: lista os itens, permite remover e leva ao checkout. */
export function ModalCarrinho({ aberto, aoFechar, aoFinalizar }: Props) {
  const { servico, carrinho } = useCarrinho();
  useJanelaModal(aberto, aoFechar, false);

  return (
    <div className={aberto ? 'modal-carrinho aberto' : 'modal-carrinho'} id="modalCarrinho" aria-hidden={!aberto}>
      <div className="modal-carrinho__fundo" onClick={aoFechar} />
      <div className="modal-carrinho__caixa" role="dialog" aria-modal="true" aria-label="Seu carrinho">
        <div className="modal-carrinho__cabecalho">
          <h3>Seu carrinho</h3>
          <button type="button" className="modal-contato__fechar" aria-label="Fechar" onClick={aoFechar}>
            ×
          </button>
        </div>

        <div className="modal-carrinho__itens">
          {carrinho.estaVazio ? (
            <p className="carrinho-vazio">Seu carrinho está vazio.</p>
          ) : (
            carrinho.itens.map((item) => (
              <div className="item-carrinho" key={item.produtoId}>
                <img src={urlPublica(item.imagem)} alt={item.nome} />
                <div className="item-carrinho__info">
                  <p className="item-carrinho__nome">{item.nome}</p>
                  <p className="item-carrinho__preco">
                    {item.quantidade} × {formatarMoeda(item.preco)}
                  </p>
                </div>
                <button
                  type="button"
                  className="item-carrinho__remover"
                  aria-label={`Remover ${item.nome}`}
                  onClick={() => servico.remover(item.produtoId)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {!carrinho.estaVazio && (
          <div className="modal-carrinho__rodape">
            <div className="modal-carrinho__total">
              <span>Total</span>
              <strong>{formatarMoeda(carrinho.valorTotal)}</strong>
            </div>
            <button type="button" className="botao-adicionar-carrinho btn" onClick={aoFinalizar}>
              Finalizar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
