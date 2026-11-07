const express = require('express');
const router = express.Router();
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

router.get('/', cotaController.listar);
router.get('/:id', cotaController.buscarPorId);
router.get('/:id/bolsa', cotaController.buscarBolsa);
router.patch('/:id', cotaController.atualizar);
router.delete('/:id', cotaController.excluir);


module.exports = router;
