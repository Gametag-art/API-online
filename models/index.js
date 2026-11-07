const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = require('./Usuarios.model')(sequelize, DataTypes);
const Bolsa = require('./Bolsa.model')(sequelize, DataTypes);
const Cota = require('./Cota.model')(sequelize, DataTypes);

const models = { Usuario, Bolsa, Cota };

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') { // Verifica se o modelo possui associações
    model.associate(models); // Define os relacionamentos entre os modelos
  }
});

module.exports = { sequelize, ...models }; // Exporta a conexão e os modelos