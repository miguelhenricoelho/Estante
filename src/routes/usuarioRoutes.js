const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

// GET - Listar todos
router.get('/', usuarioController.listar);

// POST - Cadastrar
router.post('/', usuarioController.cadastrar);

// POST - Entrar (login)
router.post('/login', usuarioController.entrar);


module.exports = router;
