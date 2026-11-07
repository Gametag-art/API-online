const { Bolsa, Cota } = require("../models");

async function listar(req, res) {
  try {
    const bolsas = await Bolsa.findAll({
      order: [["id", "ASC"]], // Ordena as bolsas pelo ID
    });

    return res.status(200).json(bolsas);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
}

async function buscarPorId(req, res) {
  try {
    const bolsa = await Bolsa.findByPk(req.params.id); // Busca uma bolsa pelo ID

    if (!bolsa) {
      return res.status(404).json({
        erro: "Recurso não encontrado",
      });
    }

    return res.status(200).json(bolsa);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
}

async function criar(req, res) {
  try {
    const { nome, valor } = req.body; // Obtém os dados enviados na requisição

    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      valor === undefined ||
      valor === null ||
      valor === "" ||
      !Number.isFinite(Number(valor)) ||
      Number(valor) < 0
    ) {
      return res.status(400).json({
        erro: "Dados inválidos",
      });
    }

    const bolsa = await Bolsa.create({
      nome: nome.trim(),
      valor: Number(valor),
    }); // Cadastra a nova bolsa no banco

    return res.status(201).json(bolsa);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
}

async function atualizar(req, res) {
  try {
    const bolsa = await Bolsa.findByPk(req.params.id); // Busca a bolsa que será atualizada

    if (!bolsa) {
      return res.status(404).json({
        erro: "Recurso não encontrado",
      });
    }

    const { nome, valor } = req.body; // Obtém os novos dados

    if (nome === undefined && valor === undefined) {
      return res.status(400).json({
        erro: "Dados inválidos",
      });
    }

    if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
      return res.status(400).json({
        erro: "Dados inválidos",
      });
    }

    if (
      valor !== undefined &&
      (valor === "" || !Number.isFinite(Number(valor)) || Number(valor) < 0)
    ) {
      return res.status(400).json({
        erro: "Dados inválidos",
      });
    }

    const dados = {}; // Armazena somente os campos que serão alterados

    if (nome !== undefined) {
      dados.nome = nome.trim();
    }

    if (valor !== undefined) {
      dados.valor = Number(valor);
    }

    await bolsa.update(dados); // Atualiza os dados da bolsa no banco

    return res.status(200).json(bolsa);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
}

async function excluir(req, res) {
  try {
    const bolsa = await Bolsa.findByPk(req.params.id); // Busca a bolsa que será excluída

    if (!bolsa) {
      return res.status(404).json({
        erro: "Recurso não encontrado",
      });
    }

    const quantidadeCotas = await Cota.count({
      where: {
        bolsaId: bolsa.id,
      },
    }); // Conta as cotas vinculadas à bolsa

    if (quantidadeCotas > 0) {
      return res.status(409).json({
        erro: "Não foi possível processar a solicitação",
      });
    }

    await bolsa.destroy(); // Exclui a bolsa do banco

    return res.status(200).json({
      mensagem: "Bolsa excluída com sucesso",
    });
  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
}

async function listarCotas(req, res) {
  try {
    const bolsa = await Bolsa.findByPk(req.params.id);

    if (!bolsa) {
      return res.status(404).json({
        erro: "Recurso não encontrado",
      });
    }

    const cotas = await Cota.findAll({
      where: {
        bolsaId: bolsa.id,
      },
    });

    return res.status(200).json(cotas);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
}
module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
  listarCotas,
}; // Exporta as funções para serem usadas nas rotas
