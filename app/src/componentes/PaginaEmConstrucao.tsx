interface Props {
  titulo: string;
}

export function PaginaEmConstrucao({ titulo }: Props) {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>{titulo}</h1>
      <p>Tela ainda não migrada para React.</p>
    </main>
  );
}
