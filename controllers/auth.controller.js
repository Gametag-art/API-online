const bcrypt = require('bcryptjs');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { Usuario } = require('../models');
const { gerarToken } = require('../utils/jwt');

function dadosPublicos(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
  };
}

async function registrar(req, res) {
  try {
    const { nome, email, senha } = req.body || {};

    if (
      typeof nome !== 'string' || !nome.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof senha !== 'string' || !senha
    ) {
      return res.status(400).json({
        erro: 'Nome, e-mail e senha são obrigatórios.',
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const existente = await Usuario.findOne({ where: { email: emailNormalizado } });

    if (existente) {
      return res.status(409).json({ erro: 'Já existe um usuário com este e-mail.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await Usuario.create({
      nome: nome.trim(),
      email: emailNormalizado,
      senha: senhaHash,
    });

    return res.status(201).json(dadosPublicos(usuario));
  } catch (erro) {
    if (erro instanceof UniqueConstraintError) {
      return res.status(409).json({ erro: 'Já existe um usuário com este e-mail.' });
    }
    if (erro instanceof ValidationError) {
      return res.status(400).json({ erro: 'Dados de cadastro inválidos.' });
    }
    return res.status(500).json({ erro: 'Erro ao registrar usuário.' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body || {};

    if (typeof email !== 'string' || typeof senha !== 'string' || !email || !senha) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const usuario = await Usuario.unscoped().findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!usuario || !usuario.senha || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const token = gerarToken(usuario.id);
    return res.status(200).json({ token, usuario: dadosPublicos(usuario) });
  } catch (erro) {
    if (erro.message && erro.message.includes('JWT_SECRET')) {
      return res.status(500).json({ erro: 'A chave secreta do JWT não foi configurada.' });
    }
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

async function perfil(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.usuarioId, {
      attributes: ['id', 'nome', 'email'],
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.status(200).json(usuario);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
}

function loginGitHub(req, res) {
  if (!req.user) {
    return res.status(401).json({ erro: 'Não foi possível autenticar com o GitHub.' });
  }

  try {
    const token = gerarToken(req.user.id);
    return res.status(200).json({
      token,
      usuario: dadosPublicos(req.user),
    });
  } catch (erro) {
    return res.status(500).json({ erro: 'Não foi possível gerar o token de acesso.' });
  }
}

module.exports = {
  registrar,
  cadastro: registrar,
  login,
  perfil,
  loginGitHub,
};
