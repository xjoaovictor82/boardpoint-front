import type { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange' | 'value' | 'name'> {
  /** Vira o id `campo-<nome>` (o CSS e os testes contam com ele). */
  nome: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  erro?: string | undefined;
  /** Texto de apoio no lugar da mensagem de erro (ex.: "O e-mail não pode ser alterado."). */
  dica?: string;
}

export function CampoTexto({ nome, rotulo, valor, aoMudar, erro, dica, ...resto }: Props) {
  const id = `campo-${nome}`;
  const comErro = erro !== undefined && erro !== '';

  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input
        {...resto}
        id={id}
        className={comErro ? 'campo__entrada campo__entrada--erro' : 'campo__entrada'}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        aria-invalid={comErro}
        aria-describedby={comErro ? `erro-${nome}` : undefined}
      />
      {dica !== undefined ? (
        <small className="campo__dica">{dica}</small>
      ) : (
        <small id={`erro-${nome}`} className="campo__erro">
          {erro}
        </small>
      )}
    </div>
  );
}
