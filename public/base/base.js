import { atualizar } from '../estado/estado.js';
import { listarLivros } from '../api/api.js';
import { iniciarHero } from '../hero/hero.js';
import { iniciarFiltros } from '../filtros/filtros.js';
import { iniciarCatalogo } from '../catalogo/catalogo.js';
import { iniciarDetalhes } from '../detalhes/detalhes.js';
import { iniciarCadastro } from '../cadastro/cadastro.js';
import { iniciarConta } from '../conta/conta.js';

const status = document.getElementById('status');
const topo = document.getElementById('topo');

function definirStatus(tipo, texto) {
  status.dataset.estado = tipo;
  status.querySelector('span').textContent = texto;
}

async function carregar() {
  atualizar({ carregando: true, erro: null });
  definirStatus('carregando', 'Conectando…');
  try {
    const livros = await listarLivros();
    atualizar({ livros, carregando: false });
    definirStatus('online', 'Banco conectado');
  } catch (erro) {
    atualizar({ carregando: false, erro: erro.message || 'Falha de conexão' });
    definirStatus('offline', 'Sem conexão');
  }
}

// Cabeçalho ganha fundo ao rolar
const aoRolar = () => topo.classList.toggle('topo--rolado', scrollY > 8);
addEventListener('scroll', aoRolar, { passive: true });
aoRolar();

iniciarHero();
iniciarFiltros();
iniciarCatalogo(carregar);
iniciarDetalhes();
iniciarConta();
iniciarCadastro();
carregar();
