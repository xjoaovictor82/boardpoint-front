import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { servicoCarrinho } from '../infra/servicos';
import { simularApi } from '../testes/apiFalsa';
import { PaginaLoja } from './PaginaLoja';

function abrirLoja() {
  return render(
    <MemoryRouter>
      <PaginaLoja />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  servicoCarrinho.limpar();
});

describe('PaginaLoja — vitrine', () => {
  it('agrupa os produtos por categoria e mostra preço, "Consulte o valor" e esgotado', async () => {
    simularApi();
    abrirLoja();

    expect(await screen.findByRole('heading', { name: 'Tênis', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mochilas', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('3 produtos')).toBeInTheDocument();
    expect(screen.getByText(/399,90/)).toBeInTheDocument();
    expect(screen.getByText('Consulte o valor')).toBeInTheDocument();
    expect(screen.getByText('Esgotado', { selector: '.card__esgotado' })).toBeInTheDocument();
  });

  it('corrige o caminho relativo das imagens para a raiz do site', async () => {
    simularApi();
    abrirLoja();
    const imagem = await screen.findByAltText('Tênis Nike SB Azul');
    expect(imagem).toHaveAttribute('src', '/produtos/p1/1.jpg');
  });

  it('filtra por categoria e volta para "todos" ao clicar de novo na pílula ativa', async () => {
    const { chamadas } = simularApi();
    const usuario = userEvent.setup();
    abrirLoja();
    await screen.findByText('3 produtos');

    const pilula = await screen.findByRole('tab', { name: 'Mochilas' });
    await usuario.click(pilula);
    expect(await screen.findByText('1 produto')).toBeInTheDocument();
    expect(pilula).toHaveAttribute('aria-selected', 'true');
    expect(chamadas.some((url) => url.includes('categoria=mochilas'))).toBe(true);
    expect(screen.queryByRole('heading', { name: 'Mochilas', level: 3 })).not.toBeInTheDocument();

    await usuario.click(pilula);
    expect(await screen.findByText('3 produtos')).toBeInTheDocument();
    expect(pilula).toHaveAttribute('aria-selected', 'false');
  });

  it('busca depois de uma pausa na digitação e mostra aviso quando nada é encontrado', async () => {
    const { chamadas } = simularApi();
    const usuario = userEvent.setup();
    abrirLoja();
    await screen.findByText('3 produtos');
    const antes = chamadas.filter((url) => url.includes('produtos.php')).length;

    await usuario.type(screen.getByPlaceholderText(/Buscar produto/), 'zzz');
    // enquanto digita, ainda não chamou a API
    expect(chamadas.filter((url) => url.includes('produtos.php')).length).toBe(antes);

    expect(await screen.findByText('Nenhum produto encontrado', {}, { timeout: 2000 })).toBeInTheDocument();
    expect(chamadas.some((url) => url.includes('busca=zzz'))).toBe(true);

    await usuario.click(screen.getByRole('button', { name: 'limpar' }));
    expect(await screen.findByText('3 produtos')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro quando a API está fora do ar', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
    abrirLoja();
    expect(await screen.findByText('Não foi possível carregar os produtos')).toBeInTheDocument();
    expect(screen.getByText(/Não foi possível conectar ao servidor/)).toBeInTheDocument();
  });
});

describe('PaginaLoja — lightbox e carrinho', () => {
  it('abre o detalhe, respeita o estoque na quantidade e adiciona ao carrinho', async () => {
    simularApi();
    const usuario = userEvent.setup();
    abrirLoja();

    await usuario.click(await screen.findByRole('button', { name: /Tênis Nike SB Azul/ }));
    const janela = await screen.findByRole('dialog');
    expect(within(janela).getByRole('heading', { name: 'Tênis Nike SB Azul' })).toBeInTheDocument();
    expect(within(janela).getByText('3 em estoque')).toBeInTheDocument();

    const mais = within(janela).getByRole('button', { name: 'Aumentar quantidade' });
    await usuario.click(mais);
    await usuario.click(mais);
    expect(mais).toBeDisabled(); // chegou no estoque (3)
    expect(within(janela).getByText('3', { selector: '.qtd-seletor span' })).toBeInTheDocument();

    await usuario.click(within(janela).getByRole('button', { name: 'Adicionar ao carrinho' }));

    expect(servicoCarrinho.carrinho.totalUnidades).toBe(3);
    expect(JSON.parse(localStorage.getItem('bp_carrinho') ?? '[]')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Adicionado ao carrinho ✓');
    expect(screen.getByRole('button', { name: 'Ver carrinho' })).toHaveTextContent('3');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('fecha com Esc e recomeça a quantidade em 1 ao reabrir', async () => {
    simularApi();
    const usuario = userEvent.setup();
    abrirLoja();
    const card = await screen.findByRole('button', { name: /Tênis Nike SB Azul/ });

    await usuario.click(card);
    await usuario.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Aumentar quantidade' }));
    await usuario.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await usuario.click(card);
    expect(within(await screen.findByRole('dialog')).getByText('1', { selector: '.qtd-seletor span' })).toBeInTheDocument();
  });

  it('produto esgotado não pode ser comprado e produto sob consulta não mostra compra', async () => {
    simularApi();
    const usuario = userEvent.setup();
    abrirLoja();

    await usuario.click(await screen.findByRole('button', { name: /Mochila Grizzly/ }));
    const janela = await screen.findByRole('dialog');
    expect(within(janela).getByRole('button', { name: 'Esgotado' })).toBeDisabled();
    await usuario.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await usuario.click(screen.getByRole('button', { name: /Tênis OUS Preto/ }));
    const consulta = await screen.findByRole('dialog');
    expect(within(consulta).queryByRole('button', { name: 'Adicionar ao carrinho' })).not.toBeInTheDocument();
  });
});
