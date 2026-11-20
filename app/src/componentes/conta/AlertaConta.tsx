export interface DadosAlerta {
  texto: string;
  tipo: 'erro' | 'sucesso';
}

interface Props {
  alerta: DadosAlerta | null;
}

export function AlertaConta({ alerta }: Props) {
  if (alerta === null) return null;
  return (
    <div id="alerta" className={`alerta alerta--${alerta.tipo}`} role="alert">
      {alerta.texto}
    </div>
  );
}
