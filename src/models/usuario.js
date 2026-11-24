const { DataTypes } = require('sequelize');
const crypto = require('crypto');
const sequelize = require('../config/database');

// Gera o hash da senha com scrypt (nativo do Node, sem dependências extras)
function gerarHash(senha) {
    const sal = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(senha, sal, 64).toString('hex');
    return `${sal}:${hash}`;
}

const Usuario = sequelize.define('Usuario', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nome: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'O nome é obrigatório' }
        }
    },

    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: { msg: 'Este e-mail já está cadastrado' },
        validate: {
            isEmail: { msg: 'Informe um e-mail válido' }
        },
        set(valor) {
            this.setDataValue('email', String(valor || '').trim().toLowerCase());
        }
    },

    senha: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }

}, {
    tableName: 'usuarios',
    timestamps: true,

    // A senha nunca sai nas consultas padrão
    defaultScope: {
        attributes: { exclude: ['senha'] }
    },

    hooks: {
        beforeSave(usuario) {
            if (usuario.changed('senha')) {
                usuario.senha = gerarHash(usuario.senha);
            }
        }
    }
});

// Confere uma senha digitada com o hash salvo
Usuario.prototype.conferirSenha = function (senha) {
    const [sal, hashSalvo] = String(this.senha || '').split(':');
    if (!sal || !hashSalvo) return false;

    const hash = crypto.scryptSync(senha, sal, 64);
    return crypto.timingSafeEqual(hash, Buffer.from(hashSalvo, 'hex'));
};

// Remove a senha ao converter para JSON (ex.: logo após o create)
Usuario.prototype.toJSON = function () {
    const dados = { ...this.get() };
    delete dados.senha;
    return dados;
};

module.exports = Usuario;
