module.exports = (sequelize, DataTypes) => {
  const Cota = sequelize.define('Cota', {
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1
      }
    },

    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    bolsaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Cota.associate = (models) => {
    Cota.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario'
    });

    Cota.belongsTo(models.Bolsa, {
      foreignKey: 'bolsaId',
      as: 'bolsa'
    });
  };

  return Cota;
};