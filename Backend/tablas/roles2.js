module.exports = (sequelize, DataTypes) => {
  return sequelize.define("roles2", {
    idRol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreRol: DataTypes.TEXT,
    descripcion: DataTypes.TEXT,
  });
};
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("roles2", {
    idRol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreRol: DataTypes.TEXT,
    descripcion: DataTypes.TEXT,
  });
};
