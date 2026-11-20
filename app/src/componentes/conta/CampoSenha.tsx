import type { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange' | 'value' | 'name' | 'type'> {
  nome: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  visivel: boolean;
  aoAlternar: () => void;
  erro?: string | undefined;
}

const PROPS_ICONE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

/** Campo de senha com o botão "olho" para mostrar/ocultar o que foi digitado. */
export function CampoSenha({ nome, rotulo, valor, aoMudar, visivel, aoAlternar, erro, ...resto }: Props) {
  const id = `campo-${nome}`;
  const comErro = erro !== undefined && erro !== '';
  const textoBotao = visivel ? 'Ocultar senha' : 'Mostrar senha';

  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <div className="campo__senha">
        <input
          {...resto}
          id={id}
          type={visivel ? 'text' : 'password'}
          className={comErro ? 'campo__entrada campo__entrada--erro' : 'campo__entrada'}
          value={valor}
          onChange={(evento) => aoMudar(evento.target.value)}
          aria-invalid={comErro}
          aria-describedby={comErro ? `erro-${nome}` : undefined}
        />
        <button
          type="button"
          className="campo__olho"
          aria-pressed={visivel}
          aria-label={`${textoBotao} (${rotulo})`}
          title={textoBotao}
          onClick={aoAlternar}
        >
          {visivel ? (
            <svg {...PROPS_ICONE}>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg {...PROPS_ICONE}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      <small id={`erro-${nome}`} className="campo__erro">
        {erro}
      </small>
    </div>
  );
}
