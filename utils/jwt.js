const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config(); // Carrega as variáveis de ambiente

function obterChaveSecreta() {
  const segredo = process.env.JWT_SECRET
  if (!segredo) {
    throw new Error('JWT_SECRET (ou PRIVATE_KEY) não foi configurada.');
  }

  return segredo;
}

function gerarToken(usuarioId) {
  const id = typeof usuarioId === 'object' && usuarioId !== null
    ? usuarioId.id
    : usuarioId;

  if (id === undefined || id === null) {
    throw new Error('Não foi possível gerar o token sem o ID do usuário.');
  }

  return jwt.sign(
    { usuarioId: id},
    obterChaveSecreta(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

module.exports = { gerarToken, obterChaveSecreta };
