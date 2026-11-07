const { Sequelize } = require('sequelize');
const path = require('path');

const storage = process.env.NODE_ENV === 'test' // Verifica se está executando os testes
  ? ':memory:' // Usa um banco temporário na memória
  : process.env.DB_STORAGE || path.resolve(__dirname, '..', './Database/database.sqlite'); // Define o caminho do banco

const sequelize = new Sequelize({
  dialect: 'sqlite', // Define o SQLite como banco de dados
  storage,
  logging: false // Desativa os logs SQL no terminal
});

module.exports = sequelize; // Exporta a conexão com o banco