module.exports = (sequelize, DataTypes) => {
  const Bolsa = sequelize.define('Bolsa', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  });

  Bolsa.associate = (models) => {
    Bolsa.hasMany(models.Cota, {
      foreignKey: 'bolsaId',
      as: 'cotas'
    });
  };

  return Bolsa;
};