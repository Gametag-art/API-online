const jwt = require('jsonwebtoken');
const { obterChaveSecreta } = require('../utils/jwt');

function autenticar(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ erro: 'Acesso negado. Nenhum token informado.' });
  }

  const partes = authorization.trim().split(/\s+/);
  if (partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1]) {
    return res.status(401).json({ erro: 'Acesso negado. Formato do token inválido.' });
  }

  try {
    const payload = jwt.verify(partes[1], obterChaveSecreta());
    const usuarioId = payload.usuarioId || payload.id || payload.sub;

    if (usuarioId === undefined || usuarioId === null) {
      return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }

    req.usuarioId = usuarioId;
    req.usuario = { ...payload, id: usuarioId };

    return next();
  } catch (erro) {
    if (erro.message && erro.message.includes('não foi configurada')) {
      return res.status(500).json({ erro: 'A chave secreta do JWT não foi configurada.' });
    }

    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = autenticar;
