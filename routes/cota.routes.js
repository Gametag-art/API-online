const express = require('express');
const router = express.Router();
const cotaController = require('../controllers/cota.controller');

router.get('/', cotaController.listar);
router.get('/:id', cotaController.buscarPorId);
router.get('/:id/bolsa', cotaController.buscarBolsa);
router.patch('/:id', cotaController.atualizar);
router.delete('/:id', cotaController.excluir);


module.exports = router;
