import { useSyncExternalStore } from 'react';
import { servicoCarrinho } from '../infra/servicos';

const assinar = (aoMudar: () => void): (() => void) => servicoCarrinho.aoMudar(aoMudar);
const lerVersao = (): number => servicoCarrinho.versao;

/** Faz o componente redesenhar sempre que o carrinho mudar. */
export function useCarrinho() {
  useSyncExternalStore(assinar, lerVersao);
  return {
    servico: servicoCarrinho,
    carrinho: servicoCarrinho.carrinho,
    totalUnidades: servicoCarrinho.carrinho.totalUnidades,
  };
}
