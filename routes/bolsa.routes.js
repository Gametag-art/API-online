
const express = require('express');
const router = express.Router();
const cotaController = require('../controllers/cota.controller');
const bolsaController = require('../controllers/bolsa.controller');

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

router.get('/', bolsaController.listar);
router.get('/:id', bolsaController.buscarPorId);
router.get('/:id/cotas', bolsaController.listarCotas);
router.post('/', bolsaController.criar);
router.post("/:id/cotas", cotaController.criarPorBolsa);
router.patch('/:id', bolsaController.atualizar);
router.delete('/:id', bolsaController.excluir);

module.exports = router;
