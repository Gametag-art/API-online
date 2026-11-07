const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const autenticar = require('../middlewares/auth.middleware');
const { configurarPassport } = require('../config/passport');


const router = express.Router();

router.post('/auth/cadastro', authController.registrar);
router.post('/auth/login', authController.login);

router.get('/auth/perfil', autenticar, authController.perfil);

function exigirOAuthConfigurado(req, res, next) {
  if (!configurarPassport()) {
    return res.status(503).json({
      erro: 'OAuth do GitHub não configurado. Defina GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET.',
    });
  }
  return next();
}

router.get(
  '/auth/github',
  exigirOAuthConfigurado,
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get(
  '/auth/github/callback',
  exigirOAuthConfigurado,
  (req, res, next) => {
    passport.authenticate('github', { session: false }, (erro, usuario, info) => {
      if (erro) return next(erro);
      if (!usuario) {
        return res.status(401).json({
          erro: info && info.message
            ? info.message
            : 'Não foi possível autenticar com o GitHub.',
        });
      }

      req.user = usuario;
      return authController.loginGitHub(req, res, next);
    })(req, res, next);
  }
);

module.exports = router;
