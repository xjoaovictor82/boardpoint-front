import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  /** Título da aba do navegador. */
  tituloAba: string;
  titulo: string;
  subtitulo: string;
  children: ReactNode;
}

/** Moldura das telas de conta (login, cadastro, perfil): logo, caixa central e "voltar à loja". */
export function LayoutAuth({ tituloAba, titulo, subtitulo, children }: Props) {
  useEffect(() => {
   
  }, [tituloAba]);

  return (
    <main className="auth">
      <Link className="auth__marca" to="/">
        <img src="/assets/img/logo.jpg" alt="Logo Board Point" />
        <span>
          Board <b>Point</b>
        </span>
      </Link>

      <section className="auth__caixa">
        <h1>{titulo}</h1>
        <p className="auth__sub">{subtitulo}</p>
        {children}
      </section>

      <Link className="auth__voltar" to="/">
        &larr; Voltar à loja
      </Link>
    </main>
  );
}
