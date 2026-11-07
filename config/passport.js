const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const https = require('https');
const { Usuario } = require('../models');

let estrategiaConfigurada = false;

/**
 * Busca os e-mails da conta autenticada diretamente na API do GitHub.
 * O endpoint /user/emails retorna também e-mails privados, desde que o
 * usuário tenha autorizado o escopo OAuth user:email.
 */
function buscarEmailsGitHub(accessToken) {
  return new Promise((resolve, reject) => {
    const requisicao = https.get(
      'https://api.github.com/user/emails?per_page=100',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'api-dam',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
      (resposta) => {
        let corpo = '';
        resposta.setEncoding('utf8');
        resposta.on('data', (parte) => {
          corpo += parte;
        });

        resposta.on('end', () => {
          if (resposta.statusCode !== 200) {
            return reject(
              new Error(`GitHub /user/emails respondeu HTTP ${resposta.statusCode}.`)
            );
          }

          try {
            const emails = JSON.parse(corpo);
            if (!Array.isArray(emails)) {
              return reject(new Error('Resposta inesperada do GitHub ao consultar e-mails.'));
            }
            return resolve(emails);
          } catch (erro) {
            return reject(new Error('Não foi possível interpretar os e-mails retornados pelo GitHub.'));
          }
        });

        resposta.on('error', reject);
      }
    );

    requisicao.setTimeout(10000, () => {
      requisicao.destroy(new Error('Tempo esgotado ao consultar os e-mails do GitHub.'));
    });
    requisicao.on('error', reject);
  });
}

function selecionarEmailVerificado(emails) {
  if (!Array.isArray(emails)) return null;

  const verificados = emails.filter((item) =>
    item && item.verified === true && (item.email || item.value)
  );

  // Prefere o e-mail principal; se não houver, usa outro e-mail verificado.
  return verificados.find((item) => item.primary === true) || verificados[0] || null;
}

function configurarPassport() {
  const clientID = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    return false;
  }

  if (estrategiaConfigurada) {
    return true;
  }

  const porta = process.env.PORT || 4567;
  const callbackURL = process.env.GITHUB_CALLBACK_URL
    || `http://localhost:${porta}/auth/github/callback`;

  passport.use('github', new GitHubStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Primeiro consulta /user/emails para funcionar também com e-mail privado.
        let emailsGitHub = [];
        try {
          emailsGitHub = await buscarEmailsGitHub(accessToken);
        } catch (erroConsulta) {
          // Algumas versões/perfis da estratégia já trazem os e-mails no profile.
          // Esse fallback só aceita endereços explicitamente marcados como verificados.
          emailsGitHub = Array.isArray(profile.emails) ? profile.emails : [];
        }

        const emailVerificado = selecionarEmailVerificado(emailsGitHub)
          || selecionarEmailVerificado(profile.emails);

        if (!emailVerificado) {
          return done(null, false, {
            message: 'O GitHub não retornou um e-mail verificado. Confira seu e-mail em https://github.com/settings/emails e autorize novamente o acesso a user:email.',
          });
        }

        const email = (emailVerificado.email || emailVerificado.value)
          .trim()
          .toLowerCase();

        let usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
          const nome = profile.displayName || profile.username || email.split('@')[0];
          // Contas OAuth não usam senha local; um hash aleatório atende ao campo
          // obrigatório do modelo antigo sem armazenar senha em texto puro.
          const senhaAleatoria = crypto.randomBytes(32).toString('hex');
          const senhaHash = await bcrypt.hash(senhaAleatoria, 10);

          usuario = await Usuario.create({
            nome,
            email,
            senha: senhaHash,
          });
        }

        return done(null, usuario);
      } catch (erro) {
        return done(erro);
      }
    }
  ));

  estrategiaConfigurada = true;
  return true;
}

module.exports = { configurarPassport };
