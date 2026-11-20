import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { RespostaPedidoCriado } from '../../dominio/tipos/Tipos';
import { formatarMoeda } from '../../dominio/utilitarios/formatacao';
import { useJanelaModal } from '../../hooks/useJanelaModal';
import { servicoPedido } from '../../infra/servicos';

interface Props {
  aberto: boolean;
  aoFechar: () => void;
}

/**
 * Checkout em dois passos: dados do cliente e PIX (QR code + copia e cola).
 * O pai usa `key` para recomeçar do passo 1 a cada abertura.
 */
export function ModalCheckout({ aberto, aoFechar }: Props) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedido, setPedido] = useState<RespostaPedidoCriado | null>(null);
  const [copiado, setCopiado] = useState(false);
  const campoPix = useRef<HTMLInputElement | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useJanelaModal(aberto, aoFechar, false);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const enviar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const criado = await servicoPedido.criar({ nome: nome.trim(), telefone: telefone.trim(), email: email.trim() });
      setPedido(criado);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível criar o pedido. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const copiar = async (): Promise<void> => {
    if (!pedido) return;
    campoPix.current?.select();
    try {
      await navigator.clipboard.writeText(pedido.pix_payload);
    } catch {
      document.execCommand('copy'); // navegador sem permissão para a área de transferência
    }
    setCopiado(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className={aberto ? 'modal-carrinho aberto' : 'modal-carrinho'} id="modalCheckout" aria-hidden={!aberto}>
      <div className="modal-carrinho__fundo" onClick={aoFechar} />
      <div
        className="modal-carrinho__caixa modal-carrinho__caixa--estreita"
        role="dialog"
        aria-modal="true"
        aria-label="Finalizar pedido"
      >
        <div className="modal-carrinho__cabecalho">
          <h3>Finalizar pedido</h3>
          <button type="button" className="modal-contato__fechar" aria-label="Fechar" onClick={aoFechar}>
            ×
          </button>
        </div>

        {pedido === null ? (
          <form id="formCheckout" onSubmit={(evento) => void enviar(evento)}>
            <label htmlFor="checkoutNome">Nome completo</label>
            <input
              type="text"
              id="checkoutNome"
              className="form-control"
              required
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <label htmlFor="checkoutTelefone">Telefone / WhatsApp</label>
            <input
              type="tel"
              id="checkoutTelefone"
              className="form-control"
              required
              autoComplete="tel"
              placeholder="(44) 90000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />

            <label htmlFor="checkoutEmail">E-mail (opcional)</label>
            <input
              type="email"
              id="checkoutEmail"
              className="form-control"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {erro && (
              <p className="form-erro" role="alert">
                {erro}
              </p>
            )}

            <button type="submit" className="botao-adicionar-carrinho btn" disabled={enviando}>
              {enviando ? 'Gerando...' : 'Gerar PIX'}
            </button>
          </form>
        ) : (
          <div className="checkout-pix">
            <p className="checkout-pix__aviso">Escaneie o QR code no app do seu banco para pagar.</p>
            <div className="checkout-pix__qr">
              <QRCodeSVG value={pedido.pix_payload} size={220} marginSize={0} fgColor="#0b0b0b" bgColor="#ffffff" />
            </div>
            <p className="checkout-pix__valor">{formatarMoeda(pedido.total)}</p>
            <p className="checkout-pix__codigo-label">Ou copie o código Pix:</p>
            <div className="checkout-pix__copia">
              <input ref={campoPix} type="text" readOnly aria-label="Código Pix copia e cola" value={pedido.pix_payload} />
              <button type="button" onClick={() => void copiar()}>
                {copiado ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="checkout-pix__pedido">
              Pedido <strong>{pedido.codigo}</strong>
            </p>
            <p className="checkout-pix__instrucao">
              Depois de pagar, guarde o código do pedido acima. A loja vai confirmar o recebimento e entrar em
              contato pelo telefone informado.
            </p>
            <button type="button" className="botao-secundario-checkout" onClick={aoFechar}>
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
