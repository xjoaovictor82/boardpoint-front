import { describe, expect, it, vi } from 'vitest';
import { Produto } from '../entidades/Produto';
import { ErroValidacao } from '../excecoes/ErroValidacao';
import type { ItemCarrinhoDto } from '../tipos/Tipos';
import { urlPublica } from '../utilitarios/url';
import { ServicoCarrinho, converterItensSalvos } from './ServicoCarrinho';

function criarServico() {
  let salvo: ItemCarrinhoDto[] = [];
  return new ServicoCarrinho({ ler: () => salvo, gravar: (v) => { salvo = v; } });
}

const produto = (estoque: number, preco: number | null = 100) =>
  Produto.deDto({ id: 1, nome: 'Tênis', preco, estoque, imagem: 'a.jpg', ativo: true, categoria_id: 1, categoria_slug: 't', categoria_nome: 'T' });

describe('ServicoCarrinho', () => {
  it('soma quantidades sem passar do estoque e avisa os ouvintes', () => {
    const servico = criarServico();
    const ouvinte = vi.fn();
    servico.aoMudar(ouvinte);

    servico.adicionar(produto(3), 2);
    servico.adicionar(produto(3), 5);

    expect(servico.carrinho.totalUnidades).toBe(3);
    expect(servico.carrinho.valorTotal).toBe(300);
    expect(ouvinte).toHaveBeenCalledTimes(2);
    expect(servico.versao).toBe(2);
  });

  it('aoMudar devolve a função que cancela o ouvinte', () => {
    const servico = criarServico();
    const ouvinte = vi.fn();
    const cancelar = servico.aoMudar(ouvinte);
    cancelar();
    servico.adicionar(produto(3), 1);
    expect(ouvinte).not.toHaveBeenCalled();
  });

  it('recusa produto esgotado e produto sem preço', () => {
    const servico = criarServico();
    expect(() => servico.adicionar(produto(0), 1)).toThrow(ErroValidacao);
    expect(() => servico.adicionar(produto(5, null), 1)).toThrow(ErroValidacao);
  });

  it('descarta itens corrompidos vindos do localStorage', () => {
    expect(converterItensSalvos([{ lixo: true }, 7, null])).toEqual([]);
    expect(converterItensSalvos('x')).toEqual([]);
  });
});

describe('urlPublica', () => {
  it('prefixa caminhos relativos e preserva URLs absolutas', () => {
    expect(urlPublica('produtos/a.jpg')).toBe('/produtos/a.jpg');
    expect(urlPublica('/produtos/a.jpg')).toBe('/produtos/a.jpg');
    expect(urlPublica('https://x.com/a.jpg')).toBe('https://x.com/a.jpg');
  });
});
