import { useSyncExternalStore } from 'react';
import { sessaoAdmin } from '../infra/servicosAdmin';

const assinar = (aoMudar: () => void): (() => void) => sessaoAdmin.observar(aoMudar);
const lerVersao = (): number => sessaoAdmin.versao;

/** Faz o componente redesenhar quando o administrador entra ou sai. */
export function useSessaoAdmin() {
  useSyncExternalStore(assinar, lerVersao);
  return { logado: sessaoAdmin.estaLogado(), nome: sessaoAdmin.nome };
}
