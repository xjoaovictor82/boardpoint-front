interface Props {
  totalUnidades: number;
  aoClicar?: () => void;
}

/** Botão flutuante do carrinho, com o número de itens (some quando o carrinho está vazio). */
export function BotaoCarrinho({ totalUnidades, aoClicar }: Props) {
  return (
    <button type="button" className="carrinho-flutuante" id="botaoCarrinho" aria-label="Ver carrinho" onClick={aoClicar}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {totalUnidades > 0 && <span className="carrinho-flutuante__contador">{totalUnidades}</span>}
    </button>
  );
}
