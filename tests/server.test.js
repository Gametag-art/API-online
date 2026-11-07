const request = require('supertest');
const app = require('../app');
const { sequelize, Usuario, Bolsa, Cota } = require('../models');
const jwtSecretOriginal = process.env.JWT_SECRET;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-de-teste';
  await sequelize.authenticate();
});

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
  if (jwtSecretOriginal === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = jwtSecretOriginal;
  }
});

describe('API DAM', () => {
  test('permite cadastrar usuário e fazer login com a senha cadastrada', async () => {
    const email = 'login@example.com';
    const senha = 'RestClient@2026';

    const cadastro = await request(app)
      .post('/auth/cadastro')
      .send({ nome: 'Usuário de Login', email, senha });

    expect(cadastro.status).toBe(201);

    const login = await request(app)
      .post('/auth/login')
      .send({ email, senha });

    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));
    expect(login.body.usuario).toEqual({
      id: cadastro.body.id,
      nome: 'Usuário de Login',
      email,
    });
    expect(login.body.usuario.senha).toBeUndefined();
  });

  test('GET /health verifica o servidor e a conexão com o banco', async () => {
    const resposta = await request(app).get('/health');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ status: 'ok', banco: 'conectado' });
  });

  test('POST /cotas cria uma cota para um usuário e uma bolsa existentes', async () => {
    const usuario = await Usuario.create({
      nome: 'Usuário de Teste',
      email: 'teste@example.com'
    });
    const bolsa = await Bolsa.create({ nome: 'PETR4', valor: 32.5 });

    const resposta = await request(app)
      .post('/cotas')
      .send({ quantidade: 10, usuarioId: usuario.id, bolsaId: bolsa.id });

    expect(resposta.status).toBe(201);
    expect(resposta.body.quantidade).toBe(10);
    expect(resposta.body.usuarioId).toBe(usuario.id);
    expect(resposta.body.bolsaId).toBe(bolsa.id);
  });

  test('GET /usuarios/:id/cotas lista o usuário e suas cotas', async () => {
    const usuario = await Usuario.create({
      nome: 'Usuário de Teste',
      email: 'teste@example.com'
    });
    const bolsa = await Bolsa.create({ nome: 'VALE3', valor: 61.2 });

    await Cota.create({
      quantidade: 5,
      usuarioId: usuario.id,
      bolsaId: bolsa.id
    });

    const resposta = await request(app).get(`/usuarios/${usuario.id}/cotas`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.id).toBe(usuario.id);
    expect(resposta.body.cotas).toHaveLength(1);
    expect(resposta.body.cotas[0].quantidade).toBe(5);
  });

  test('retorna 404 quando o usuário da cota não existe', async () => {
    const bolsa = await Bolsa.create({ nome: 'PETR4', valor: 32.5 });

    const resposta = await request(app)
      .post('/cotas')
      .send({ quantidade: 10, usuarioId: 9999, bolsaId: bolsa.id });

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toBe('Usuário não encontrado');
  });

  test('retorna 404 quando a bolsa da cota não existe', async () => {
    const usuario = await Usuario.create({
      nome: 'Usuário de Teste',
      email: 'teste@example.com'
    });

    const resposta = await request(app)
      .post('/cotas')
      .send({ quantidade: 10, usuarioId: usuario.id, bolsaId: 9999 });

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toBe('Bolsa não encontrada');
  });

  test('retorna 400 quando a quantidade da cota é inválida', async () => {
    const usuario = await Usuario.create({
      nome: 'Usuário de Teste',
      email: 'teste@example.com'
    });
    const bolsa = await Bolsa.create({ nome: 'PETR4', valor: 32.5 });

    const resposta = await request(app)
      .post('/cotas')
      .send({ quantidade: 0, usuarioId: usuario.id, bolsaId: bolsa.id });

    expect(resposta.status).toBe(400);
  });

  test('permite listar, consultar, atualizar e excluir bolsas', async () => {
    const bolsa = await Bolsa.create({ nome: 'PETR4', valor: 32.5 });

    expect((await request(app).get('/bolsas')).status).toBe(200);
    expect((await request(app).get(`/bolsas/${bolsa.id}`)).status).toBe(200);

    const atualizacao = await request(app)
      .patch(`/bolsas/${bolsa.id}`)
      .send({ valor: 35 });

    expect(atualizacao.status).toBe(200);
    expect(Number(atualizacao.body.valor)).toBe(35);

    expect((await request(app).delete(`/bolsas/${bolsa.id}`)).status).toBe(200);
  });

  test('GET /bolsas/:id/cotas lista as cotas da bolsa', async () => {
    const usuario = await Usuario.create({
      nome: 'Usuário de Teste',
      email: 'teste@example.com'
    });
    const bolsa = await Bolsa.create({ nome: 'PETR4', valor: 32.5 });

    await Cota.create({
      quantidade: 4,
      usuarioId: usuario.id,
      bolsaId: bolsa.id
    });

    const resposta = await request(app).get(`/bolsas/${bolsa.id}/cotas`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(1);
    expect(resposta.body[0].quantidade).toBe(4);
  });

  test('GET /bolsas/:id/cotas retorna 404 para uma bolsa inexistente', async () => {
    const resposta = await request(app).get('/bolsas/9999/cotas');

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toBe('Bolsa não encontrada');
  });

  test('GET /cotas/:id/bolsa retorna a bolsa relacionada à cota', async () => {
    const usuario = await Usuario.create({
      nome: 'Usuário de Teste',
      email: 'teste@example.com'
    });
    const bolsa = await Bolsa.create({ nome: 'VALE3', valor: 61.2 });

    const cota = await Cota.create({
      quantidade: 5,
      usuarioId: usuario.id,
      bolsaId: bolsa.id
    });

    const resposta = await request(app).get(`/cotas/${cota.id}/bolsa`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.id).toBe(bolsa.id);
    expect(resposta.body.nome).toBe('VALE3');
  });

  test('GET /cotas/:id/bolsa retorna 404 para uma cota inexistente', async () => {
    const resposta = await request(app).get('/cotas/9999/bolsa');

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toBe('Cota não encontrada');
  });

  test('impede excluir uma bolsa que possui cotas cadastradas', async () => {
    const usuario = await Usuario.create({
      nome: 'Usuário de Teste',
      email: 'teste@example.com'
    });
    const bolsa = await Bolsa.create({ nome: 'PETR4', valor: 32.5 });

    await Cota.create({
      quantidade: 3,
      usuarioId: usuario.id,
      bolsaId: bolsa.id
    });

    const resposta = await request(app).delete(`/bolsas/${bolsa.id}`);

    expect(resposta.status).toBe(409);
  });

  test('impede excluir um usuário que possui cotas cadastradas', async () => {
    const usuario = await Usuario.create({
      nome: 'Usuário de Teste',
      email: 'teste@example.com'
    });
    const bolsa = await Bolsa.create({ nome: 'PETR4', valor: 32.5 });

    await Cota.create({
      quantidade: 3,
      usuarioId: usuario.id,
      bolsaId: bolsa.id
    });

    const resposta = await request(app).delete(`/usuarios/${usuario.id}`);

    expect(resposta.status).toBe(409);
  });

  test('permite cadastrar, listar, consultar, atualizar e excluir usuários', async () => {
    const cadastro = await request(app)
      .post('/usuarios')
      .send({ nome: 'Ana', email: 'ana@example.com' });

    expect(cadastro.status).toBe(201);
    const id = cadastro.body.id;

    expect((await request(app).get('/usuarios')).status).toBe(200);
    expect((await request(app).get(`/usuarios/${id}`)).status).toBe(200);

    const atualizacao = await request(app)
      .patch(`/usuarios/${id}`)
      .send({ nome: 'Ana Silva' });

    expect(atualizacao.body.nome).toBe('Ana Silva');
    expect((await request(app).delete(`/usuarios/${id}`)).status).toBe(200);
  });

  test('permite listar, consultar, atualizar e excluir cotas', async () => {
    const usuario = await Usuario.create({
      nome: 'Teste',
      email: 'cota@example.com'
    });
    const bolsa = await Bolsa.create({ nome: 'VALE3', valor: 60 });

    const criacao = await request(app)
      .post('/cotas')
      .send({ quantidade: 3, usuarioId: usuario.id, bolsaId: bolsa.id });

    expect(criacao.status).toBe(201);
    const id = criacao.body.id;

    expect((await request(app).get('/cotas')).status).toBe(200);
    expect((await request(app).get(`/cotas/${id}`)).status).toBe(200);

    const atualizacao = await request(app)
      .patch(`/cotas/${id}`)
      .send({ quantidade: 8 });

    expect(atualizacao.status).toBe(200);
    expect(atualizacao.body.quantidade).toBe(8);

    expect((await request(app).delete(`/cotas/${id}`)).status).toBe(200);
  });

  test('retorna 400 para dados inválidos e 409 para e-mail duplicado', async () => {
    const invalido = await request(app)
      .post('/usuarios')
      .send({ nome: '', email: 'email-invalido' });

    expect(invalido.status).toBe(400);

    await Usuario.create({ nome: 'Ana', email: 'ana@example.com' });

    const duplicado = await request(app)
      .post('/usuarios')
      .send({ nome: 'Outra Ana', email: 'ana@example.com' });

    expect(duplicado.status).toBe(409);
  });

  test('retorna 404 ao consultar uma bolsa, usuário ou cota inexistente', async () => {
    const bolsa = await request(app).get('/bolsas/9999');
    const usuario = await request(app).get('/usuarios/9999');
    const cota = await request(app).get('/cotas/9999');

    expect(bolsa.status).toBe(404);
    expect(usuario.status).toBe(404);
    expect(cota.status).toBe(404);
  });

  test('retorna 404 para uma rota que não existe', async () => {
    const resposta = await request(app).get('/rota-inexistente');

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toBe('Rota não encontrada');
  });
});