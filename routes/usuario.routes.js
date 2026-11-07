const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const cotaController = require('../controllers/cota.controller');
app.use(cors({
  origin: [
    "http://localhost:8081",
    "http://localhost:19006",
    "https://SEU-APP.expo.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

router.get('/', usuarioController.listar);
router.get('/:id/cotas', usuarioController.listarCotas);
router.post('/:id/cotas', cotaController.criarPorUsuario);
router.get('/:id', usuarioController.buscarPorId);
router.post('/', usuarioController.criar);
router.patch('/:id', usuarioController.atualizar);
router.delete('/:id', usuarioController.excluir);

module.exports = router;
