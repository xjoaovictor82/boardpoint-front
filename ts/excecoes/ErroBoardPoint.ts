/** Raiz de todos os erros do sistema: permite `catch` por `instanceof ErroBoardPoint`. */
export class ErroBoardPoint extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = new.target.name;
  }
}
