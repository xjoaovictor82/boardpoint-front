import { useEffect, useState } from 'react';
import type { Categoria } from '../dominio/entidades/Categoria';
import { repositorioCategorias } from '../infra/servicos';

/** Carrega as categorias uma vez. Se a API cair, a loja segue sem filtros. */
export function useCategorias(): readonly Categoria[] {
  const [categorias, setCategorias] = useState<readonly Categoria[]>([]);

  useEffect(() => {
    let ativo = true;
    repositorioCategorias
      .listar()
      .then((lista) => {
        if (ativo) setCategorias(lista);
      })
      .catch(() => {
        // sem filtros, mas o site continua funcionando
      });
    return () => {
      ativo = false;
    };
  }, []);

  return categorias;
}
