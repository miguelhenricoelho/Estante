const { ValidationError, UniqueConstraintError } = require('sequelize');
const Usuario = require('../models/usuario');

// LISTAR TODOS OS USUÁRIOS (sem a senha)
async function listar(req, res) {
    try {
        const usuarios = await Usuario.findAll({ order: [['createdAt', 'DESC']] });
        return res.status(200).json(usuarios);

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao listar usuários',
            erro: error.message
        });
    }
}

// CADASTRAR USUÁRIO
async function cadastrar(req, res) {
    try {
        const nome = String(req.body.nome || '').trim();
        const email = String(req.body.email || '').trim();
        const senha = String(req.body.senha || '');

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'Nome, e-mail e senha são obrigatórios' });
        }

        if (senha.length < 6) {
            return res.status(400).json({ mensagem: 'A senha precisa ter pelo menos 6 caracteres' });
        }

        const usuario = await Usuario.create({ nome, email, senha });

        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso',
            usuario
        });

    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado' });
        }

        if (error instanceof ValidationError) {
            return res.status(400).json({ mensagem: error.errors[0]?.message || 'Dados inválidos' });
        }

        return res.status(500).json({
            mensagem: 'Erro ao cadastrar usuário',
            erro: error.message
        });
    }
}

// ENTRAR (LOGIN)
async function entrar(req, res) {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const senha = String(req.body.senha || '');

        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Informe e-mail e senha' });
        }

        // unscoped() traz a senha (hash) só para conferir aqui
        const usuario = await Usuario.unscoped().findOne({ where: { email } });

        if (!usuario || !usuario.conferirSenha(senha)) {
            return res.status(401).json({ mensagem: 'E-mail ou senha incorretos' });
        }

        if (!usuario.ativo) {
            return res.status(403).json({ mensagem: 'Esta conta está desativada' });
        }

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso',
            usuario
        });

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao entrar',
            erro: error.message
        });
    }
}

module.exports = {
    listar,
    cadastrar,
    entrar
};
