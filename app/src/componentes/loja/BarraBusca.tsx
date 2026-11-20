import { useRef } from 'react';
import type { Categoria } from '../../dominio/entidades/Categoria';
import type { FiltroCategoria } from '../../dominio/tipos/Tipos';

interface Props {
  termo: string;
  aoMudarTermo: (termo: string) => void;
  categorias: readonly Categoria[];
  categoriaAtiva: FiltroCategoria;
  aoSelecionarCategoria: (categoria: FiltroCategoria) => void;
}

/** Busca por texto + pílulas de categoria. Clicar na pílula ativa volta para "todos". */
export function BarraBusca({ termo, aoMudarTermo, categorias, categoriaAtiva, aoSelecionarCategoria }: Props) {
  const campo = useRef<HTMLInputElement | null>(null);

  return (
    <nav className="barra" aria-label="Busca e filtro de produtos">
      <div className="barra__wrap">
        <div className="busca">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            ref={campo}
            type="text"
            id="campoBusca"
            placeholder="Buscar produto (ex: tênis, mochila, casio...)"
            autoComplete="off"
            value={termo}
            onChange={(evento) => aoMudarTermo(evento.target.value)}
          />
          <button
            type="button"
            className={termo.length > 0 ? 'busca__limpar ativo' : 'busca__limpar'}
            onClick={() => {
              aoMudarTermo('');
              campo.current?.focus();
            }}
          >
            limpar
          </button>
        </div>
      </div>

      <div className="filtros" role="tablist" aria-label="Categorias">
        {categorias.map((categoria) => {
          const ativa = categoriaAtiva === categoria.slug;
          return (
            <button
              key={categoria.id}
              type="button"
              role="tab"
              aria-selected={ativa}
              className={ativa ? 'pilula ativa' : 'pilula'}
              onClick={() => aoSelecionarCategoria(ativa ? 'todos' : categoria.slug)}
            >
              {categoria.rotulo}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
