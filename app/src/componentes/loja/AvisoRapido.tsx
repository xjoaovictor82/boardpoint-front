interface Props {
  mensagem: string;
  visivel: boolean;
}

/** Mensagem rápida (ex.: "Adicionado ao carrinho ✓"). */
export function AvisoRapido({ mensagem, visivel }: Props) {
  return (
    <div id="toastCarrinho" className={visivel ? 'toast-carrinho visivel' : 'toast-carrinho'} role="status" aria-live="polite">
      {mensagem}
    </div>
  );
}
