const base64Url = (objeto: object): string =>
  btoa(JSON.stringify(objeto)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

/** JWT de mentira (sem assinatura válida): o front só lê o campo `exp`. */
export function criarToken(expiraEmSegundos = 3600): string {
  const exp = Math.floor(Date.now() / 1000) + expiraEmSegundos;
  return `${base64Url({ alg: 'HS256' })}.${base64Url({ sub: 1, tipo: 'cliente', exp })}.assinatura`;
}
