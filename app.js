
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { configurarPassport } = require('./config/passport');
const authRoutes = require('./routes/auth.routes');
const cotaRoutes = require('./routes/cota.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const bolsaRoutes = require('./routes/bolsa.routes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://127.0.0.1:8081'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Permite receber dados no formato JSON

// A sessão é usada somente para proteger a etapa de retorno do OAuth (state).
// O acesso à API continua usando JWT, sem sessão de login do Passport.
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dam-session-secret-development-only',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}));

app.use(passport.initialize());
configurarPassport();

app.get('/', (req, res) => {
  res.json({ mensagem: 'API DAM ativa', status: 'ok' });
});

// Novas rotas de autenticação; os endpoints legados permanecem inalterados.
app.use(authRoutes);
app.use('/bolsas', bolsaRoutes);
app.use('/bolsa', bolsaRoutes);
app.use('/cotas', cotaRoutes);
app.use('/usuarios', usuarioRoutes);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ erro: 'O corpo da requisição contém JSON inválido' });
  }
  return res.status(500).json({ erro: 'Ocorreu um erro interno no servidor' });
});

app.use((req, res) => { // Trata requisições para rotas inexistentes
  res.status(404).json({ erro: 'Rota não encontrada' });
});

module.exports = app;
