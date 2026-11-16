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
    
    if (usuario.valorInicialCarteira === null) {
      const valorInicial =
        Number(quantidade) * Number(bolsa.valor);

      await usuario.update({
        valorInicialCarteira: valorInicial
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


async function comprarMinhaCota(req, res) {
  try {
    const { quantidade, bolsaId } = req.body;
    const usuario = await Usuario.findByPk(req.usuarioId);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (
      !Number.isInteger(Number(quantidade)) ||
      Number(quantidade) < 1 ||
      !Number.isInteger(Number(bolsaId)) ||
      Number(bolsaId) < 1
    ) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    const bolsa = await Bolsa.findByPk(Number(bolsaId));
    if (!bolsa) {
      return res.status(404).json({ erro: "Bolsa não encontrada" });
    }

    const quantidadeCompra = Number(quantidade);
    const valorCompra = quantidadeCompra * Number(bolsa.valor);

    const cotaExistente = await Cota.findOne({
      where: { usuarioId: usuario.id, bolsaId: bolsa.id },
    });

    let cota;
    if (cotaExistente) {
      await cotaExistente.update({
        quantidade: Number(cotaExistente.quantidade) + quantidadeCompra,
      });
      cota = cotaExistente;
    } else {
      cota = await Cota.create({
        quantidade: quantidadeCompra,
        usuarioId: usuario.id,
        bolsaId: bolsa.id,
      });
    }

    // O valor inicial é registrado somente na primeira compra da carteira.
    if (usuario.valorInicialCarteira === null) {
      await usuario.update({ valorInicialCarteira: valorCompra });
    } else {
      await usuario.update({
        valorInicialCarteira:
          Number(usuario.valorInicialCarteira) + valorCompra,
      });
    }

    const cotaAtualizada = await Cota.findByPk(cota.id, {
      include: [{ model: Bolsa, as: "bolsa" }],
    });

    return res.status(201).json({
      mensagem: "Compra realizada com sucesso",
      cota: cotaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao comprar cotas:", error);
    return res.status(500).json({ erro: "Não foi possível realizar a compra" });
  }
}

async function venderMinhaCota(req, res) {
  try {
    const quantidade = Number(req.body.quantidade);

    if (!Number.isInteger(quantidade) || quantidade < 1) {
      return res.status(400).json({ erro: "Quantidade inválida" });
    }

    const cota = await Cota.findOne({
      where: {
        id: req.params.cotaId,
        usuarioId: req.usuarioId,
      },
    });

    if (!cota) {
      return res.status(404).json({ erro: "Cota não encontrada na sua carteira" });
    }

    if (quantidade > Number(cota.quantidade)) {
      return res.status(400).json({ erro: "Quantidade maior que o saldo disponível" });
    }

    const saldoRestante = Number(cota.quantidade) - quantidade;

    if (saldoRestante === 0) {
      await cota.destroy();
      return res.status(200).json({
        mensagem: "Venda realizada com sucesso",
        removida: true,
      });
    }

    await cota.update({ quantidade: saldoRestante });
    return res.status(200).json({
      mensagem: "Venda realizada com sucesso",
      removida: false,
      cota,
    });
  } catch (error) {
    console.error("Erro ao vender cotas:", error);
    return res.status(500).json({ erro: "Não foi possível realizar a venda" });
  }
}

module.exports = {
  listar,
  buscarPorId,
  criarPorBolsa,
  atualizar,
  excluir,
  buscarBolsa,
  criarPorUsuario,
  comprarMinhaCota,
  venderMinhaCota
};
