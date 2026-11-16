module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    senha: {
      type: DataTypes.STRING,
      allowNull: true
    },
    valorInicialCarteira: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: null
    }
  }, {
    defaultScope: {
      attributes: { exclude: ['senha'] }
    }
  });

  Usuario.associate = (models) => {
    Usuario.hasMany(models.Cota, {
      foreignKey: 'usuarioId',
      as: 'cotas'
    });
  };

  return Usuario;
};
