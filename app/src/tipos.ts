/** Resposta padrão de toda rota da API: { sucesso, dados?, erro?, mensagem? } */
export interface RespostaApi<T> {
  sucesso: boolean;
  erro?: string;
  mensagem?: string;
  dados: T;
}

export interface CategoriaDto {
  id: number;
  slug: string;
  nome: string;
}

export interface ProdutoDto {
  id: number;
  nome: string;
  preco: number | null;
  estoque: number;
  imagem: string;
  ativo: boolean;
  categoria_id: number;
  categoria_slug: string;
  categoria_nome: string;
}

export interface RespostaProdutos {
  produtos: ProdutoDto[];
  total: number;
  pagina: number;
  por_pagina: number;
}