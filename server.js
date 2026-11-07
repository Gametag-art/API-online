require('dotenv').config(); // Carrega as variáveis de ambiente

const app = require('./app');
const { sequelize, Usuario } = require('./models');
const PORT = process.env.PORT || 4567; // Define a porta do servidor

async function iniciar() {
  await sequelize.authenticate(); // Verifica a conexão com o banco
  await sequelize.sync(); // Sincroniza os modelos com as tabelas

  const tabelaUsuarios = Usuario.getTableName();
  const colunasUsuarios = await sequelize.getQueryInterface().describeTable(tabelaUsuarios);
  if (!colunasUsuarios.senha) {
    await sequelize.getQueryInterface().addColumn(tabelaUsuarios, 'senha', {
      type: Usuario.rawAttributes.senha.type,
      allowNull: true,
    });
  }

  return app.listen(PORT, '0.0.0.0',() => { // Inicia o servidor
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

if (require.main === module) { // Verifica se o arquivo foi executado diretamente
  iniciar().catch((erro) => {
    console.error('Erro ao iniciar o servidor:', erro.message);
    process.exitCode = 1; // Indica que ocorreu um erro
  });
}

module.exports = { app, iniciar }; // Exporta a aplicação e a função de inicialização