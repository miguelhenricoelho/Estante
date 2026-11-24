const sequelize = require('../config/database');
const Livro = require('../models/livro');

const livros = [
  {
    nome: 'Dom Casmurro',
    descricao: 'Romance narrado por Bento Santiago, que revisita sua história e seu relacionamento com Capitu.',
    autor: 'Machado de Assis',
    categoria: 'Romance',
    imagem: '',
    data_publicacao: '1899-01-01',
    editora: 'H. Garnier'
  },
  {
    nome: 'O Alienista',
    descricao: 'Novela sobre o médico Simão Bacamarte e seus experimentos sobre a loucura.',
    autor: 'Machado de Assis',
    categoria: 'Novela',
    imagem: '',
    data_publicacao: '1882-01-01',
    editora: 'Tipografia Nacional'
  },
  {
    nome: 'A Hora da Estrela',
    descricao: 'Romance que acompanha a trajetória de Macabéa, uma jovem nordestina no Rio de Janeiro.',
    autor: 'Clarice Lispector',
    categoria: 'Romance',
    imagem: '',
    data_publicacao: '1977-01-01',
    editora: 'José Olympio'
  },
  {
    nome: 'O Cortiço',
    descricao: 'Romance naturalista que retrata a vida coletiva em uma habitação popular no Rio de Janeiro.',
    autor: 'Aluísio Azevedo',
    categoria: 'Romance',
    imagem: '',
    data_publicacao: '1890-01-01',
    editora: 'Tipografia e Lithographia a vapor de Lombaerts & C.'
  },
  {
    nome: 'Iracema',
    descricao: 'Romance indianista que narra o encontro entre Iracema e Martim.',
    autor: 'José de Alencar',
    categoria: 'Romance',
    imagem: '',
    data_publicacao: '1865-01-01',
    editora: 'Tipografia de Viana & Filho'
  },
  {
    nome: 'Memórias Póstumas de Brás Cubas',
    descricao: 'Romance narrado por um personagem que conta sua vida depois de morto.',
    autor: 'Machado de Assis',
    categoria: 'Romance',
    imagem: '',
    data_publicacao: '1881-01-01',
    editora: 'Tipografia Nacional'
  },
  {
    nome: 'O Pequeno Príncipe',
    descricao: 'Fábula filosófica sobre amizade, afeto e o olhar sobre o mundo.',
    autor: 'Antoine de Saint-Exupéry',
    categoria: 'Fábula',
    imagem: '',
    data_publicacao: '1943-04-06',
    editora: 'Reynal & Hitchcock'
  },
  {
    nome: '1984',
    descricao: 'Romance distópico sobre vigilância, manipulação da informação e autoritarismo.',
    autor: 'George Orwell',
    categoria: 'Ficção distópica',
    imagem: '',
    data_publicacao: '1949-06-08',
    editora: 'Secker & Warburg'
  },
  {
    nome: 'A Revolução dos Bichos',
    descricao: 'Fábula satírica sobre poder e corrupção política em uma fazenda.',
    autor: 'George Orwell',
    categoria: 'Sátira',
    imagem: '',
    data_publicacao: '1945-08-17',
    editora: 'Secker & Warburg'
  },
  {
    nome: 'O Hobbit',
    descricao: 'Fantasia sobre a jornada de Bilbo Bolseiro em busca de um tesouro guardado por um dragão.',
    autor: 'J. R. R. Tolkien',
    categoria: 'Fantasia',
    imagem: '',
    data_publicacao: '1937-09-21',
    editora: 'George Allen & Unwin'
  }
];

async function cadastrarLivrosIniciais() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    let cadastrados = 0;
    let jaExistiam = 0;

    for (const dados of livros) {
      const [livro, criado] = await Livro.findOrCreate({
        where: { nome: dados.nome, autor: dados.autor },
        defaults: dados
      });

      if (criado) cadastrados++;
      else jaExistiam++;
    }

    console.log(`Seed concluído: ${cadastrados} livros cadastrados; ${jaExistiam} já existiam.`);
    console.log(`Total de livros na tabela: ${await Livro.count()}`);
  } catch (erro) {
    console.error('Erro ao cadastrar livros iniciais:', erro.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

cadastrarLivrosIniciais();
