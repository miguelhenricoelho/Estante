import { estado, observar, livrosVisiveis, atualizar } from '../estado/estado.js';
import { criarCapa } from '../capas/capas.js';
import { abrirDetalhes } from '../detalhes/detalhes.js';
import { esc, ano } from '../util/util.js';

const grade = document.getElementById('grade');
const contagem = document.getElementById('contagem');

let recarregar = () => {};

function cartao(livro, indice) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'livro';
  botao.dataset.id = livro.id;
  botao.style.setProperty('--i', Math.min(indice, 14));
  if (estado.destaque != null && livro.id === estado.destaque) botao.classList.add('livro--novo');

  const meta = [ano(livro.data_publicacao), livro.categoria].filter(Boolean).map(esc).join('<i>·</i>');

  const moldura = document.createElement('div');
  moldura.className = 'livro-moldura';
  moldura.append(criarCapa(livro));

  const info = document.createElement('div');
  info.className = 'livro-info';
  info.innerHTML = `
    <h3 class="livro-titulo">${esc(livro.nome)}</h3>
    <p class="livro-autor">${esc(livro.autor)}</p>
    ${meta ? `<p class="livro-meta">${meta}</p>` : ''}
  `;

  botao.setAttribute('aria-label', `${livro.nome}, de ${livro.autor}. Ver detalhes`);
  botao.append(moldura, info);
  return botao;
}

function esqueletos(qtd = 10) {
  return Array.from({ length: qtd }, (_, i) => `
    <div class="livro livro--esqueleto" style="--i:${i}" aria-hidden="true">
      <div class="livro-moldura"><div class="capa capa--esqueleto"></div></div>
      <div class="livro-info"><span></span><span></span><span></span></div>
    </div>`).join('');
}

function vazio({ icone, titulo, texto, acao }) {
  return `
    <div class="vazio">
      <div class="vazio-icone" aria-hidden="true">${icone}</div>
      <h3>${titulo}</h3>
      <p>${texto}</p>
      ${acao ?? ''}
    </div>`;
}

const ICONES = {
  busca: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8.5 11h5"/></svg>',
  erro: '<svg viewBox="0 0 24 24"><path d="M12 8v5M12 16.5v.5"/><path d="M10.3 3.9 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  livro: '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/></svg>'
};

function render() {
  grade.removeAttribute('aria-busy');

  if (estado.carregando) {
    grade.setAttribute('aria-busy', 'true');
    contagem.textContent = 'Carregando…';
    grade.innerHTML = esqueletos();
    return;
  }

  if (estado.erro) {
    contagem.textContent = '';
    grade.innerHTML = vazio({
      icone: ICONES.erro,
      titulo: 'Não foi possível carregar o acervo',
      texto: `${esc(estado.erro)}. Verifique se o servidor está rodando e se o <code>.env</code> está configurado.`,
      acao: '<button type="button" class="btn btn-fantasma" data-acao="recarregar">Tentar de novo</button>'
    });
    return;
  }

  const lista = livrosVisiveis();
  const total = estado.livros.length;
  contagem.textContent = lista.length === total
    ? `${total} ${total === 1 ? 'livro' : 'livros'}`
    : `${lista.length} de ${total}`;

  if (!total) {
    grade.innerHTML = vazio({
      icone: ICONES.livro,
      titulo: 'A estante está vazia',
      texto: 'Cadastre o primeiro livro para começar o acervo.',
      acao: '<button type="button" class="btn btn-primario" data-acao="novo">Cadastrar livro</button>'
    });
    return;
  }

  if (!lista.length) {
    const termo = estado.busca.trim();
    grade.innerHTML = vazio({
      icone: ICONES.busca,
      titulo: 'Nada por aqui',
      texto: termo
        ? `Nenhum livro encontrado para “${esc(termo)}”${estado.categoria !== 'todas' ? ` em ${esc(estado.categoria)}` : ''}.`
        : 'Nenhum livro nessa categoria.',
      acao: '<button type="button" class="btn btn-fantasma" data-acao="limpar">Limpar filtros</button>'
    });
    return;
  }

  grade.replaceChildren(...lista.map(cartao));
}

export function iniciarCatalogo(funcaoRecarregar) {
  recarregar = funcaoRecarregar;

  grade.addEventListener('click', (e) => {
    const acao = e.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'recarregar') return recarregar();
    if (acao === 'limpar') return atualizar({ busca: '', categoria: 'todas' });
    if (acao === 'novo') return document.getElementById('btn-novo').click();

    const card = e.target.closest('.livro[data-id]');
    if (!card) return;
    const livro = estado.livros.find((l) => String(l.id) === card.dataset.id);
    if (livro) abrirDetalhes(livro, card);
  });

  observar(render);
  render();
}
