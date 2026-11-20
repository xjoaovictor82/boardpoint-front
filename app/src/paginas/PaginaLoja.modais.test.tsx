import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { servicoCarrinho } from '../infra/servicos';
import { PEDIDO_CRIADO, simularApi } from '../testes/apiFalsa';
import { PaginaLoja } from './PaginaLoja';

type Usuario = ReturnType<typeof userEvent.setup>;

function abrirLoja() {
  return render(
    <MemoryRouter>
      <PaginaLoja />
    </MemoryRouter>,
  );
}

/** Abre o tênis de R$ 399,90 (estoque 3), compra `quantidade` unidades e fecha o aviso. */
async function comprarTenis(usuario: Usuario, quantidade: number) {
  await usuario.click(await screen.findByRole('button', { name: /Tênis Nike SB Azul/ }));
  const janela = await screen.findByRole('dialog');
  for (let i = 1; i < quantidade; i++) {
    await usuario.click(within(janela).getByRole('button', { name: 'Aumentar quantidade' }));
  }
  await usuario.click(within(janela).getByRole('button', { name: 'Adicionar ao carrinho' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}

beforeEach(() => {
  localStorage.clear();
  servicoCarrinho.limpar();
});

describe('Carrinho', () => {
  it('lista os itens com total, remove um item e mostra o carrinho vazio', async () => {
    simularApi();
    const usuario = userEvent.setup();
    abrirLoja();
    await comprarTenis(usuario, 2);

    await usuario.click(screen.getByRole('button', { name: 'Ver carrinho' }));
    const carrinho = await screen.findByRole('dialog', { name: 'Seu carrinho' });
    expect(within(carrinho).getByText(/2 × R\$\s?399,90/)).toBeInTheDocument();
    expect(within(carrinho).getByText(/799,80/)).toBeInTheDocument();

    await usuario.click(within(carrinho).getByRole('button', { name: /Remover Tênis Nike SB Azul/ }));
    expect(within(carrinho).getByText('Seu carrinho está vazio.')).toBeInTheDocument();
    expect(within(carrinho).queryByRole('button', { name: 'Finalizar pedido' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver carrinho' })).not.toHaveTextContent(/\d/);
  });
});

describe('Checkout com PIX', () => {
  it('envia os itens e os dados do cliente, mostra o QR code e esvazia o carrinho', async () => {
    const { requisicoes } = simularApi();
    const usuario = userEvent.setup();
    abrirLoja();
    await comprarTenis(usuario, 2);

    await usuario.click(screen.getByRole('button', { name: 'Ver carrinho' }));
    await usuario.click(await screen.findByRole('button', { name: 'Finalizar pedido' }));

    const checkout = await screen.findByRole('dialog', { name: 'Finalizar pedido' });
    await usuario.type(within(checkout).getByLabelText('Nome completo'), '  Maria Souza ');
    await usuario.type(within(checkout).getByLabelText('Telefone / WhatsApp'), '(44) 99999-0000');
    await usuario.click(within(checkout).getByRole('button', { name: 'Gerar PIX' }));

    expect(await within(checkout).findByText('BP-0007')).toBeInTheDocument();
    expect(within(checkout).getByLabelText('Código Pix copia e cola')).toHaveValue(PEDIDO_CRIADO.pix_payload);
    expect(within(checkout).getByText(/799,80/)).toBeInTheDocument();
    expect(checkout.querySelector('.checkout-pix__qr svg')).not.toBeNull();

    const envio = requisicoes.find((r) => r.url.includes('publico/checkout.php'));
    expect(envio?.metodo).toBe('POST');
    expect(envio?.corpo).toEqual({
      nome: 'Maria Souza',
      telefone: '(44) 99999-0000',
      email: '',
      itens: [{ produto_id: 1, quantidade: 2 }],
    });

    // pedido registrado: o carrinho foi esvaziado
    expect(servicoCarrinho.carrinho.estaVazio).toBe(true);
    expect(screen.getByRole('button', { name: 'Ver carrinho' })).not.toHaveTextContent(/\d/);

    await usuario.click(within(checkout).getByRole('button', { name: 'Concluir' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('mostra o erro da API dentro do modal e mantém o carrinho', async () => {
    simularApi({ checkout: 'erro' });
    const usuario = userEvent.setup();
    abrirLoja();
    await comprarTenis(usuario, 1);

    await usuario.click(screen.getByRole('button', { name: 'Ver carrinho' }));
    await usuario.click(await screen.findByRole('button', { name: 'Finalizar pedido' }));
    const checkout = await screen.findByRole('dialog', { name: 'Finalizar pedido' });
    await usuario.type(within(checkout).getByLabelText('Nome completo'), 'Maria');
    await usuario.type(within(checkout).getByLabelText('Telefone / WhatsApp'), '44999990000');
    await usuario.click(within(checkout).getByRole('button', { name: 'Gerar PIX' }));

    expect(await within(checkout).findByRole('alert')).toHaveTextContent('Estoque insuficiente');
    expect(within(checkout).getByRole('button', { name: 'Gerar PIX' })).toBeEnabled();
    expect(servicoCarrinho.carrinho.totalUnidades).toBe(1);
  });

  it('recomeça do passo 1 com o formulário limpo ao abrir de novo', async () => {
    simularApi();
    const usuario = userEvent.setup();
    abrirLoja();
    await comprarTenis(usuario, 1);

    await usuario.click(screen.getByRole('button', { name: 'Ver carrinho' }));
    await usuario.click(await screen.findByRole('button', { name: 'Finalizar pedido' }));
    const checkout = await screen.findByRole('dialog', { name: 'Finalizar pedido' });
    await usuario.type(within(checkout).getByLabelText('Nome completo'), 'Maria');
    await usuario.click(within(checkout).getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await usuario.click(screen.getByRole('button', { name: 'Ver carrinho' }));
    await usuario.click(await screen.findByRole('button', { name: 'Finalizar pedido' }));
    const novo = await screen.findByRole('dialog', { name: 'Finalizar pedido' });
    expect(within(novo).getByLabelText('Nome completo')).toHaveValue('');
  });
});

describe('Fale conosco', () => {
  it('envia a mensagem, fecha o modal e avisa o cliente', async () => {
    const { requisicoes } = simularApi();
    const usuario = userEvent.setup();
    abrirLoja();

    await usuario.click(screen.getByRole('button', { name: 'Fale conosco' }));
    const janela = await screen.findByRole('dialog', { name: 'Fale com a Board Point' });
    await usuario.type(within(janela).getByLabelText('Nome'), 'João');
    await usuario.type(within(janela).getByLabelText('Seu e-mail'), 'joao@exemplo.com');
    await usuario.type(within(janela).getByLabelText('Mensagem'), 'Vocês têm o tênis no 42?');
    await usuario.click(within(janela).getByRole('button', { name: 'Enviar mensagem' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('Mensagem enviada!');
    const envio = requisicoes.find((r) => r.url.includes('publico/contato.php'));
    expect(envio?.corpo).toEqual({ nome: 'João', email: 'joao@exemplo.com', mensagem: 'Vocês têm o tênis no 42?' });
  });

  it('fecha com Esc', async () => {
    simularApi();
    const usuario = userEvent.setup();
    abrirLoja();
    await usuario.click(screen.getByRole('button', { name: 'Fale conosco' }));
    await screen.findByRole('dialog', { name: 'Fale com a Board Point' });
    await usuario.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
