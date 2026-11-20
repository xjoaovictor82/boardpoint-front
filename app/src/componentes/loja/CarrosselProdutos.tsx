import { useEffect, useRef, useState } from 'react';
import type { Produto } from '../../dominio/entidades/Produto';
import { CardProduto } from './CardProduto';

// Tolerância (px) para considerar "chegou no fim" apesar de arredondamentos.
const TOLERANCIA_FIM_SCROLL = 4;

interface Props {
  produtos: readonly Produto[];
  indiceInicial: number;
  titulo?: string;
  aoSelecionar: (produto: Produto) => void;
}

interface Preview {
  imagem: string;
  esquerda: number;
  visivel: boolean;
}

/**
 * Uma fileira rolável de cards. Mostra a setinha "tem mais produtos pro lado" e uma
 * miniatura que acompanha o card sob o mouse.
 */
export function CarrosselProdutos({ produtos, indiceInicial, titulo, aoSelecionar }: Props) {
  const linha = useRef<HTMLDivElement | null>(null);
  const escondendo = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [semMaisConteudo, setSemMaisConteudo] = useState(true);
  const [preview, setPreview] = useState<Preview>({ imagem: '', esquerda: 0, visivel: false });

  const atualizarSeta = (): void => {
    const c = linha.current;
    if (!c) return;
    const rolavel = c.scrollWidth - c.clientWidth > TOLERANCIA_FIM_SCROLL;
    const chegouNoFim = c.scrollLeft + c.clientWidth >= c.scrollWidth - TOLERANCIA_FIM_SCROLL;
    setSemMaisConteudo(!rolavel || chegouNoFim);
  };

  useEffect(() => {
    // Espera o layout assentar (imagens carregando) antes de medir.
    const inicial = setTimeout(atualizarSeta, 0);
    const tardio = setTimeout(atualizarSeta, 300);
    window.addEventListener('resize', atualizarSeta);
    return () => {
      clearTimeout(inicial);
      clearTimeout(tardio);
      clearTimeout(escondendo.current);
      window.removeEventListener('resize', atualizarSeta);
    };
  }, []);

  const mostrarPreview = (card: HTMLElement, imagem: string): void => {
    const c = linha.current;
    if (!c) return;
    clearTimeout(escondendo.current);
    // Alinha a miniatura ao card, dentro da largura visível do carrossel.
    const esquerda = card.offsetLeft - c.scrollLeft + card.offsetWidth / 2;
    setPreview({ imagem, esquerda, visivel: true });
  };

  const esconderPreview = (): void => {
    escondendo.current = setTimeout(() => setPreview((atual) => ({ ...atual, visivel: false })), 80);
  };

  return (
    <section className={semMaisConteudo ? 'grade__grupo sem-mais-conteudo' : 'grade__grupo'}>
      {titulo && <h3 className="grade__grupo-titulo">{titulo}</h3>}

      <div
        ref={linha}
        className="grade__linha"
        onScroll={() => {
          atualizarSeta();
          setPreview((atual) => (atual.visivel ? { ...atual, visivel: false } : atual));
        }}
      >
        {produtos.map((produto, i) => (
          <CardProduto
            key={produto.id}
            produto={produto}
            indice={indiceInicial + i}
            aoSelecionar={aoSelecionar}
            aoEntrar={mostrarPreview}
            aoSair={esconderPreview}
          />
        ))}
        <div className={preview.visivel ? 'carrossel-preview visivel' : 'carrossel-preview'} style={{ left: preview.esquerda }}>
          <img alt="" src={preview.imagem || undefined} />
        </div>
      </div>

      <div className="grade__seta" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </div>
    </section>
  );
}
