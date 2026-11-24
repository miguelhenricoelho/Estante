const { ValidationError } = require('sequelize');
const Livro = require('../models/livro');

// Converte texto vazio em null (evita erro no campo DATE, por exemplo)
function limpar(valor) {
    if (valor === undefined || valor === null) return null;
    const texto = String(valor).trim();
    return texto === '' ? null : texto;
}

// LISTAR TODOS OS LIVROS
async function listar(req, res) {
    try {
        const livros = await Livro.findAll({ order: [['createdAt', 'DESC'], ['id', 'DESC']] });

        return res.status(200).json(livros);

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao listar livros',
            erro: error.message
        });
    }
}


// CADASTRAR LIVRO
async function cadastrar(req, res) {
    try {
        const dados = {
            nome: limpar(req.body.nome),
            descricao: limpar(req.body.descricao),
            autor: limpar(req.body.autor),
            categoria: limpar(req.body.categoria),
            imagem: limpar(req.body.imagem),
            data_publicacao: limpar(req.body.data_publicacao),
            editora: limpar(req.body.editora)
        };

        if (!dados.nome || !dados.autor) {
            return res.status(400).json({ mensagem: 'Título e autor são obrigatórios' });
        }

        const livro = await Livro.create(dados);

        return res.status(201).json({
            mensagem: 'Livro cadastrado com sucesso',
            livro
        });

    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ mensagem: error.errors[0]?.message || 'Dados inválidos' });
        }

        return res.status(500).json({
            mensagem: 'Erro ao cadastrar livro',
            erro: error.message
        });
    }
}


module.exports = {
    listar,
    cadastrar
};
