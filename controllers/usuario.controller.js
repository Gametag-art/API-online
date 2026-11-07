const { Usuario, Cota } = require("../models");
const { ValidationError, UniqueConstraintError } = require("sequelize");

async function listar(req, res) {
  try {
    const usuarios = await Usuario.findAll({ order: [["id", "ASC"]] });
    return res.status(200).json(usuarios);
  } catch (error) {
    return res
      .status(500)
      .json({ erro: "Não foi possível listar os usuários" });
  }
}

async function buscarPorId(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario)
      return res.status(404).json({ erro: "Dados inválidos" });
    return res.status(200).json(usuario);
  } catch (error) {
    return res
      .status(500)
      .json({ erro: "Não foi possível consultar o usuário" });
  }
}

async function criar(req, res) {
  try {
    const { nome, email } = req.body;
    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res
        .status(400)
        .json({ erro: "Dados inválidos" });
    }
    const usuario = await Usuario.create({
      nome: nome.trim(),
      email: email.trim(),
    });
    return res.status(201).json(usuario);
  } catch (error) {
    if (error instanceof UniqueConstraintError)
      return res.status(409).json({ erro: "Dados inválidos" });
    if (error instanceof ValidationError)
      return res
        .status(400)
        .json({ erro: "Dados inválidos" });
    return res
      .status(500)
      .json({ erro: "Não foi possível cadastrar o usuário" });
  }
}

async function atualizar(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario)
      return res.status(404).json({ erro: "Dados inválidos" });
    const { nome, email } = req.body;
    if (nome === undefined && email === undefined)
      return res
        .status(400)
        .json({ erro: "Dados inválidos" });
    if (nome !== undefined && (typeof nome !== "string" || !nome.trim()))
      return res.status(400).json({ erro: "Dados inválidos" });
    if (email !== undefined && (typeof email !== "string" || !email.trim()))
      return res.status(400).json({ erro: "Dados inválidos" });
    const dados = {};
    if (nome !== undefined) dados.nome = nome.trim();
    if (email !== undefined) dados.email = email.trim();
    await usuario.update(dados);
    return res.status(200).json(usuario);
  } catch (error) {
    if (error instanceof UniqueConstraintError)
      return res.status(409).json({ erro: "Dados inválidos" });
    if (error instanceof ValidationError)
      return res
        .status(400)
        .json({ erro: "Dados inválidos" });
    return res
      .status(500)
      .json({ erro: "Não foi possível atualizar o usuário" });
  }
}

async function excluir(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario)
      return res.status(404).json({ erro: "Dados inválidos" });
    const quantidadeCotas = await Cota.count({
      where: { usuarioId: usuario.id },
    });
    if (quantidadeCotas > 0)
      return res.status(409).json({
        erro: "Não foi possível processar a solicitação",
      });
    await usuario.destroy();
    return res.status(200).json({ mensagem: "Usuário excluído com sucesso" });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível excluir o usuário" });
  }
}

async function listarCotas(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Cota, as: "cotas" }],
    });

    if (!usuario)
      return res.status(404).json({ erro: "Dados inválidos" });

    return res.status(200).json(usuario);
  } catch (error) {
    return res
      .status(500)
      .json({ erro: "Não foi possível listar as cotas do usuário" });
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
  listarCotas,
};
