import { useEffect, useState } from 'react';
import type { Produto } from '../dominio/entidades/Produto';
import type { FiltroCategoria } from '../dominio/tipos/Tipos';
import { repositorioProdutos } from '../infra/servicos';

interface Resultado {
  chave: string;
  produtos: readonly Produto[];
  erro: string | null;
}

export interface EstadoProdutos {
  produtos: readonly Produto[];
  erro: string | null;
  carregando: boolean;
  /** Já houve pelo menos uma resposta (sucesso ou erro). */
  carregado: boolean;
}

/** Busca produtos pelo filtro atual. Respostas antigas (de um filtro já trocado) são ignoradas. */
export function useProdutos(busca: string, categoria: FiltroCategoria): EstadoProdutos {
  const chave = `${categoria}|${busca}`;
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    let ativo = true;
    repositorioProdutos
      .buscar({ busca, categoria })
      .then((produtos) => {
        if (ativo) setResultado({ chave, produtos, erro: null });
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        const mensagem = erro instanceof Error ? erro.message : 'Tente recarregar a página em instantes.';
        setResultado({ chave, produtos: [], erro: mensagem });
      });
    return () => {
      ativo = false;
    };
  }, [busca, categoria, chave]);

  return {
    produtos: resultado?.produtos ?? [],
    erro: resultado?.erro ?? null,
    carregando: resultado?.chave !== chave,
    carregado: resultado !== null,
  };
}
