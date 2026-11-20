import type { KeyboardEvent } from 'react';
import type { Produto } from '../../dominio/entidades/Produto';
import { urlPublica } from '../../dominio/utilitarios/url';
import { useEmVista } from '../../hooks/useEmVista';

interface Props {
  produto: Produto;
  indice: number;
  aoSelecionar: (produto: Produto) => void;
  aoEntrar: (card: HTMLElement, imagem: string) => void;
  aoSair: () => void;
}

export function CardProduto({ produto, indice, aoSelecionar, aoEntrar, aoSair }: Props) {
  const [ref, emVista] = useEmVista<HTMLElement>();
  const preco = produto.precoFormatado;
  const esgotado = produto.temPreco && produto.estaEsgotado;
  const imagem = urlPublica(produto.imagem);

  const aoTeclar = (evento: KeyboardEvent<HTMLElement>): void => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      aoSelecionar(produto);
    }
  };

  return (
    <article
      ref={ref}
      className={emVista ? 'card em-vista' : 'card'}
      style={{ transitionDelay: `${(indice % 8) * 40}ms` }}
      role="button"
      tabIndex={0}
      onClick={() => aoSelecionar(produto)}
      onKeyDown={aoTeclar}
      onMouseEnter={(evento) => aoEntrar(evento.currentTarget, imagem)}
      onMouseLeave={aoSair}
    >
      <div className="card__imagem">
        {esgotado && <span className="card__esgotado">Esgotado</span>}
        <img src={imagem} alt={produto.rotulo} loading="lazy" />
      </div>
      <div className="card__info">
        <p className="card__nome">{produto.rotulo}</p>
        <p className={preco ? 'card__preco' : 'card__preco consulta'}>{preco ?? 'Consulte o valor'}</p>
      </div>
    </article>
  );
}
