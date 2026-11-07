const { Cota, Usuario, Bolsa } = require("../models");
const { ValidationError } = require("sequelize");

function validarQuantidade(quantidade) {
  return (
    quantidade !== undefined &&
    Number.isInteger(Number(quantidade)) &&
    Number(quantidade) >= 1
  );
}

async function criarPorUsuario(req, res) {
  try {
    const { quantidade, bolsaId } = req.body;
    const usuarioId = req.params.id;

    if (
      !Number.isInteger(Number(quantidade)) ||
      quantidade === undefined ||
      Number(quantidade) < 1 ||
      !Number.isInteger(Number(bolsaId)) ||
      Number(bolsaId) < 1
    ) {
      return res.status(400).json({
        erro: "Dados inválidos",
      });
    }

    const usuario = await Usuario.findByPk(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        erro: "Recurso não encontrado",
      });
    }

    const bolsa = await Bolsa.findByPk(bolsaId);

    if (!bolsa) {
      return res.status(404).json({
        erro: "Recurso não encontrado",
      });
    }

    const cota = await Cota.create({
      quantidade: Number(quantidade),
      usuarioId: usuario.id,
      bolsaId: bolsa.id,
    });

    return res.status(201).json(cota);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
}
async function listar(__, res) {
  try {
    const cotas = await Cota.findAll({
      include: [
        { model: Usuario, as: "usuario" },
        { model: Bolsa, as: "bolsa" },
      ],
      order: [["id", "ASC"]],
    });
    return res.status(200).json(cotas);
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível listar as cotas" });
  }
}

async function buscarPorId(req, res) {
  try {
    const cota = await Cota.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: "usuario" },
        { model: Bolsa, as: "bolsa" },
      ],
    });
    if (!cota) return res.status(404).json({ erro: "Cota não encontrada" });
    return res.status(200).json(cota);
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível consultar a cota" });
  }
}

async function atualizar(req, res) {
  try {
    const cota = await Cota.findByPk(req.params.id);
    if (!cota) return res.status(404).json({ erro: "Cota não encontrada" });
    const { quantidade, usuarioId, bolsaId } = req.body;
    if (
      quantidade === undefined &&
      usuarioId === undefined &&
      bolsaId === undefined
    )
      return res
        .status(400)
        .json({ erro: "Dados inválidos" });
    const dados = {};
    if (quantidade !== undefined) {
      if (!validarQuantidade(quantidade))
        return res
          .status(400)
          .json({ erro: "Dados inválidos" });
      dados.quantidade = Number(quantidade);
    }
    if (usuarioId !== undefined) {
      if (!Number.isInteger(Number(usuarioId)) || Number(usuarioId) < 1)
        return res.status(400).json({ erro: "Dados inválidos" });
      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario)
        return res.status(404).json({ erro: "Dados inválidos" });
      dados.usuarioId = usuario.id;
    }
    if (bolsaId !== undefined) {
      if (!Number.isInteger(Number(bolsaId)) || Number(bolsaId) < 1)
        return res.status(400).json({ erro: "Dados inválidos" });
      const bolsa = await Bolsa.findByPk(bolsaId);
      if (!bolsa) return res.status(404).json({ erro: "Recurso não encontrado" });
      dados.bolsaId = bolsa.id;
    }
    await cota.update(dados);
    return res.status(200).json(cota);
  } catch (error) {
    if (error instanceof ValidationError)
      return res.status(400).json({ erro: "Dados inválidos" });
    return res.status(500).json({ erro: "Não foi possível atualizar a cota" });
  }
}

async function excluir(req, res) {
  try {
    const cota = await Cota.findByPk(req.params.id);
    if (!cota) return res.status(404).json({ erro: "Cota não encontrada" });
    await cota.destroy();
    return res.status(200).json({ mensagem: "Cota excluída com sucesso" });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível excluir a cota" });
  }
}

async function buscarBolsa(req, res) {
  try {
    const cota = await Cota.findByPk(req.params.id, {
      include: [{ model: Bolsa, as: "bolsa" }],
    });

    if (!cota) {
      return res.status(404).json({
        erro: "Cota não encontrada",
      });
    }

    return res.status(200).json(cota.bolsa);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
}

async function criarPorBolsa(req, res) {
  try {
    const { quantidade, usuarioId } = req.body;
    const bolsaId = req.params.id;

    if (
      !Number.isInteger(Number(quantidade)) ||
      Number(quantidade) < 1 ||
      !Number.isInteger(Number(usuarioId)) ||
      Number(usuarioId) < 1
    ) {
      return res.status(400).json({
        erro: "Dados inválidos",
      });
    }

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        erro: "Recurso não encontrado",
      });
    }

    const bolsa = await Bolsa.findByPk(bolsaId);
    if (!bolsa) {
      return res.status(404).json({
        erro: "Recurso não encontrado",
      });
    }

    const cota = await Cota.create({
      quantidade: Number(quantidade),
      usuarioId: usuario.id,
      bolsaId: bolsa.id,
    });

    return res.status(201).json(cota);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
}

module.exports = {
  listar,
  buscarPorId,
  criarPorBolsa,
  atualizar,
  excluir,
  buscarBolsa,
  criarPorUsuario
};
