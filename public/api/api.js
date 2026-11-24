const LIVROS = '/api/livros';
const USUARIOS = '/api/usuarios';

async function lerResposta(resposta) {
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(corpo.mensagem || `Erro ${resposta.status} ao falar com a API`);
  }
  return corpo;
}

async function enviarJSON(url, dados) {
  const resposta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(dados)
  });
  return lerResposta(resposta);
}

// ---------- Livros ----------
export async function listarLivros() {
  const resposta = await fetch(LIVROS, { headers: { Accept: 'application/json' } });
  return lerResposta(resposta);
}

export async function cadastrarLivro(dados) {
  const corpo = await enviarJSON(LIVROS, dados);
  return corpo.livro;
}

// ---------- Usuários ----------
export async function criarConta(dados) {
  const corpo = await enviarJSON(USUARIOS, dados);
  return corpo.usuario;
}

export async function entrar(dados) {
  const corpo = await enviarJSON(`${USUARIOS}/login`, dados);
  return corpo.usuario;
}
