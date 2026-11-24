const path = require('path');
const express = require('express');
const sequelize = require('./config/database');

// Models (importados para o sync criar as tabelas)
require('./models/livro');
require('./models/usuario');

const livroRoutes = require('./routes/livroRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();
const PORTA = process.env.PORT || 3000;

// Permite receber JSON no corpo das requisições
app.use(express.json());

// Rotas da API
app.use('/api/livros', livroRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Status da API
app.get('/api', (req, res) => {
    res.json({ mensagem: 'API de Livros funcionando!' });
});

// Interface (pasta public)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Inicialização do servidor
async function iniciarServidor() {
    try {

        // Testa a conexão com o banco
        await sequelize.authenticate();
        console.log('Conectado ao PostgreSQL com sucesso!');

        // Cria as tabelas que ainda não existem (não apaga os livros)
        await sequelize.sync();
        console.log('Tabelas sincronizadas! (livros, usuarios)');

        // Inicia o servidor
        app.listen(PORTA, () => {
            console.log(`Servidor rodando em http://localhost:${PORTA}`);
        });

    } catch (error) {
        console.error('Erro ao iniciar aplicação:', error);
    }
}

iniciarServidor();
