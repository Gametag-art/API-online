
const express = require('express');
const router = express.Router();
const cotaController = require('../controllers/cota.controller');
const bolsaController = require('../controllers/bolsa.controller');

router.get('/', bolsaController.listar);
router.get('/:id', bolsaController.buscarPorId);
router.get('/:id/cotas', bolsaController.listarCotas);
router.post('/', bolsaController.criar);
router.post("/:id/cotas", cotaController.criarPorBolsa);
router.patch('/:id', bolsaController.atualizar);
router.delete('/:id', bolsaController.excluir);

module.exports = router;
