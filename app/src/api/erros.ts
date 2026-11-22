/** A API respondeu, mas com erro (ex.: 404, 409, 422). */
export class ErroApi extends Error {
  readonly status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

/** 401: sem login, ou token inválido/expirado. */
export class ErroNaoAutenticado extends Error {
  constructor(mensagem?: string) {
    super(mensagem ?? "Sessão expirada. Faça login novamente.");
    this.name = "ErroNaoAutenticado";
  }
}

/** Não conseguiu nem falar com o servidor (offline, servidor desligado). */
export class ErroRede extends Error {
  constructor() {
    super("Não foi possível conectar ao servidor. Verifique sua conexão.");
    this.name = "ErroRede";
  }
}