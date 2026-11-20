import { vi } from 'vitest';
import type { CategoriaDto, ProdutoDto } from '../dominio/tipos/Tipos';

export const CATEGORIAS: CategoriaDto[] = [
  { id: 1, slug: 'tenis', nome: 'Tênis' },
  { id: 2, slug: 'mochilas', nome: 'Mochilas' },
];

function produto(id: number, nome: string, preco: number | null, estoque: number, categoria: CategoriaDto): ProdutoDto {
  return {
    id,
    nome,
    preco,
    estoque,
    imagem: `produtos/p${id}/1.jpg`,
    ativo: true,
    categoria_id: categoria.id,
    categoria_slug: categoria.slug,
    categoria_nome: categoria.nome,
  };
}

export const PRODUTOS: ProdutoDto[] = [
  produto(1, 'Tênis Nike SB Azul', 399.9, 3, CATEGORIAS[0]!),
  produto(2, 'Tênis OUS Preto', null, 5, CATEGORIAS[0]!),
  produto(3, 'Mochila Grizzly', 249.9, 0, CATEGORIAS[1]!),
];

function resposta(dados: unknown): Response {
  return new Response(JSON.stringify({ sucesso: true, dados }), { status: 200 });
}

/** Troca o fetch por uma API de mentira que filtra produtos como o PHP faz. */
export const PEDIDO_CRIADO = {
  pedido_id: 7,
  codigo: 'BP-0007',
  total: 799.8,
  pix_payload: '00020126580014br.gov.bcb.pix0136teste5204000053039865802BR',
};

export interface Requisicao {
  url: string;
  metodo: string;
  corpo: unknown;
}

export function respostaJson(status: number, corpo: unknown): Response {
  return new Response(JSON.stringify(corpo), { status });
}

export const sucessoJson = (dados: unknown): Response => respostaJson(200, { sucesso: true, dados });
export const erroJson = (status: number, erro: string): Response => respostaJson(status, { sucesso: false, erro });

interface OpcoesApi {
  /** Responde rotas extras (ex.: clientes.php). Devolva undefined para seguir a API padrão. */
  extra?: (requisicao: Requisicao) => Response | undefined;
  /** 'erro' faz o checkout responder 422 (ex.: estoque insuficiente). */
  checkout?: 'ok' | 'erro';
}

export function simularApi(opcoes: OpcoesApi = {}) {
  const chamadas: string[] = [];
  const requisicoes: Requisicao[] = [];
  const falso = vi.fn((entrada: RequestInfo | URL, init?: RequestInit) => {
    const url = String(entrada);
    chamadas.push(url);
    const metodo = init?.method ?? 'GET';
    const corpo: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
    const requisicao: Requisicao = { url, metodo, corpo };
    requisicoes.push(requisicao);

    const respostaExtra = opcoes.extra?.(requisicao);
    if (respostaExtra) return Promise.resolve(respostaExtra);

    if (url.includes('publico/checkout.php')) {
      if (opcoes.checkout === 'erro') {
        return Promise.resolve(
          new Response(JSON.stringify({ sucesso: false, erro: 'Estoque insuficiente para "Tênis Nike SB Azul".' }), { status: 422 }),
        );
      }
      return Promise.resolve(resposta(PEDIDO_CRIADO));
    }
    if (url.includes('publico/contato.php')) return Promise.resolve(resposta(null));

    if (url.includes('publico/categorias.php')) return Promise.resolve(resposta(CATEGORIAS));

    if (url.includes('publico/produtos.php')) {
      const params = new URL(url, 'http://teste').searchParams;
      const busca = (params.get('busca') ?? '').toLowerCase();
      const categoria = params.get('categoria') ?? 'todos';
      const lista = PRODUTOS.filter(
        (p) => p.nome.toLowerCase().includes(busca) && (categoria === 'todos' || p.categoria_slug === categoria),
      );
      return Promise.resolve(resposta({ produtos: lista, total: lista.length }));
    }
    return Promise.reject(new Error('rota não simulada: ' + url));
  });
  vi.stubGlobal('fetch', falso);
  return { chamadas, requisicoes };
}
