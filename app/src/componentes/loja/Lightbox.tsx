import { useEffect, useState } from 'react';
import type { Produto } from '../../dominio/entidades/Produto';
import { urlPublica } from '../../dominio/utilitarios/url';

interface Props {
  produto: Produto | null;
  /** Muda a cada abertura: recomeça a quantidade em 1. */
  abertura: number;
  aberto: boolean;
  aoFechar: () => void;
  aoAdicionar: (produto: Produto, quantidade: number) => void;
}

/** Janela de detalhes do produto, com escolha de quantidade e botão de compra. */
export function Lightbox({ produto, abertura, aberto, aoFechar, aoAdicionar }: Props) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento: KeyboardEvent): void => {
      if (evento.key === 'Escape') aoFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
    };
  }, [aberto, aoFechar]);

  return (
    <div
      className={aberto ? 'lightbox aberto' : 'lightbox'}
      id="lightbox"
      role="dialog"
      aria-modal="true"
      aria-hidden={!aberto}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar();
      }}
    >
      <button className="lightbox__fechar" aria-label="Fechar" onClick={aoFechar}>
        ✕
      </button>
      <div className="lightbox__caixa">
        {produto && <DetalheProduto key={abertura} produto={produto} aoAdicionar={aoAdicionar} />}
      </div>
    </div>
  );
}

interface PropsDetalhe {
  produto: Produto;
  aoAdicionar: (produto: Produto, quantidade: number) => void;
}

function DetalheProduto({ produto, aoAdicionar }: PropsDetalhe) {
  const [quantidade, setQuantidade] = useState(1);
  const esgotado = produto.estaEsgotado;

  const alterar = (passo: 1 | -1): void => {
    const nova = quantidade + passo;
    if (nova < 1 || nova > produto.estoque) return;
    setQuantidade(nova);
  };

  return (
    <>
      <img className="lightbox__imagem" src={urlPublica(produto.imagem)} alt={produto.rotulo} />
      <div className="lightbox__corpo">
        <p className="lightbox__tag">{produto.categoriaNome}</p>
        <h3 className="lightbox__nome">{produto.rotulo}</h3>
        <p className="lightbox__preco">{produto.precoFormatado ?? 'Consulte o valor'}</p>
        <p className={esgotado && produto.temPreco ? 'lightbox__estoque esgotado' : 'lightbox__estoque'}>
          {!produto.temPreco ? '' : esgotado ? 'Esgotado' : `${produto.estoque} em estoque`}
        </p>

        {produto.temPreco && (
          <div className="lightbox__compra">
            <div className="qtd-seletor">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                disabled={esgotado}
                onClick={() => alterar(-1)}
              >
                −
              </button>
              <span>{quantidade}</span>
              <button
                type="button"
                aria-label="Aumentar quantidade"
                disabled={esgotado || quantidade >= produto.estoque}
                onClick={() => alterar(1)}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="botao-adicionar-carrinho btn"
              disabled={esgotado}
              onClick={() => aoAdicionar(produto, quantidade)}
            >
              {esgotado ? 'Esgotado' : 'Adicionar ao carrinho'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
