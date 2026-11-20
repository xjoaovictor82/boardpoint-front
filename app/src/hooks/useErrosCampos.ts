import { useCallback, useState } from 'react';
import type { ErrosCampos } from '../dominio/utilitarios/validacoesConta';

/** Mensagens de erro por campo. `limpar` tira o erro de um campo (usado ao digitar). */
export function useErrosCampos() {
  const [erros, setErros] = useState<ErrosCampos>({});

  const limpar = useCallback((campo: string) => {
    setErros((atual) => {
      if (atual[campo] === undefined) return atual;
      const copia = { ...atual };
      delete copia[campo];
      return copia;
    });
  }, []);

  const definir = useCallback((campo: string, mensagem: string) => {
    setErros((atual) => {
      const copia = { ...atual };
      if (mensagem === '') delete copia[campo];
      else copia[campo] = mensagem;
      return copia;
    });
  }, []);

  return { erros, substituir: setErros, limpar, definir };
}
