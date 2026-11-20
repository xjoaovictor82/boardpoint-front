import { useCallback, useEffect, useState } from 'react';
import type { Pagina } from '../dominio/admin/tipos';
import { mensagemAmigavel } from '../dominio/utilitarios/mensagensErro';
import { useToast } from '../componentes/admin/ToastAdmin';

interface Opcoes<T> {
  porPagina: number;
  /** Busca uma página (já com os filtros atuais). Trocar essa função reinicia a listagem na página 1. */
  buscar: (pagina: number, porPagina: number) => Promise<Pagina<T>>;
}

interface ResultadoListagem<T> {
  itens: T[];
  pagina: number;
  totalPaginas: number;
  totalRegistros: number;
  carregando: boolean;
  erro: boolean;
  irPara: (pagina: number) => void;
  recarregar: () => void;
}

interface Resultado<T> {
  chave: string;
  dados: Pagina<T> | null;
  erro: boolean;
}

/**
 * Tabela paginada reutilizável: busca, guarda os itens da página atual e controla
 * "Anterior/Próxima". Porta de nucleo/ListagemPaginada.ts + Paginacao.ts para React:
 * em vez de desenhar <tr> no DOM, devolve o estado para o componente renderizar.
 * "Carregando" é derivado comparando a chave da busca atual com a do último resultado
 * recebido (mesmo padrão de useProdutos/useCategorias), sem setState síncrono no efeito.
 */
export function useListagemPaginada<T>({ porPagina, buscar }: Opcoes<T>): ResultadoListagem<T> {
  const [pagina, setPagina] = useState(1);
  const [pedidoRecarga, setPedidoRecarga] = useState(0);
  const chave = `${pagina}|${porPagina}|${pedidoRecarga}`;
  const [resultado, setResultado] = useState<Resultado<T> | null>(null);
  const mostrarToast = useToast();

  useEffect(() => {
    let ativo = true;

    buscar(pagina, porPagina)
      .then((resposta) => {
        if (!ativo) return;

        // Apagou o último item da última página: volta uma página.
        if (resposta.itens.length === 0 && pagina > 1) {
          setPagina(pagina - 1);
          return;
        }
        setResultado({ chave, dados: resposta, erro: false });
      })
      .catch((erroCapturado: unknown) => {
        if (!ativo) return;
        setResultado({ chave, dados: null, erro: true });
        mostrarToast(mensagemAmigavel(erroCapturado, 'admin'), 'erro');
      });

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, porPagina, buscar, pedidoRecarga, chave]);

  const recarregar = useCallback(() => setPedidoRecarga((n) => n + 1), []);
  const dados = resultado?.chave === chave ? resultado.dados : null;

  return {
    itens: dados?.itens ?? [],
    pagina: dados?.pagina ?? pagina,
    totalPaginas: dados?.total_paginas ?? 1,
    totalRegistros: dados?.total ?? 0,
    carregando: resultado?.chave !== chave,
    erro: resultado?.chave === chave && resultado.erro,
    irPara: setPagina,
    recarregar,
  };
}
