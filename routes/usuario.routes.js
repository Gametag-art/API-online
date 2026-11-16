const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const cotaController = require('../controllers/cota.controller');
const autenticar = require("../middlewares/auth.middleware")

router.get("/minhas-cotas", autenticar, usuarioController.listarCotas);
router.post("/minhas-cotas", autenticar, cotaController.comprarMinhaCota);
router.patch("/minhas-cotas/:cotaId/vender", autenticar, cotaController.venderMinhaCota);
router.get('/', usuarioController.listar);
router.get('/:id/cotas', usuarioController.listarCotas);
router.post('/:id/cotas', cotaController.criarPorUsuario);
router.get('/:id', usuarioController.buscarPorId);
router.post('/', usuarioController.criar);
router.patch('/:id', usuarioController.atualizar);
router.delete('/:id', usuarioController.excluir);
module.exports = router;
