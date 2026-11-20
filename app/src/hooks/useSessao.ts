import { useSyncExternalStore } from 'react';
import { sessao } from '../infra/servicos';

const assinar = (aoMudar: () => void): (() => void) => sessao.observar(aoMudar);
const lerVersao = (): number => sessao.versao;

/** Faz o componente redesenhar quando o cliente entra ou sai. */
export function useSessao() {
  useSyncExternalStore(assinar, lerVersao);
  return { logado: sessao.estaLogado(), nome: sessao.nome };
}
