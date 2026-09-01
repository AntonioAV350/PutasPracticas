const adminModel = require("../models/adminModel");

const bcrypt = require("bcrypt");
const saltRounds = 10;

function getUsuarios(req, res) {
  adminModel.getUsuarios((error, usuarios) => {
    if (error) {
      res.status(500).send("Error al obtener usuarios");
    } else {
      res.json(usuarios);
    }
  });
} 

function insertUsuario(req, res) {
  const formData = async () => {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    return {
      rfc: req.body.rfc,
      password: hashedPassword,
      nombre_Doce: req.body.nombre_Doce,
      apellido_paterno: req.body.apellido_paterno,
      apellido_materno: req.body.apellido_materno,
      sexo: req.body.sexo,
      email: req.body.email,
      status: 1,
    };
  };
  formData()
    .then((data) => {
      adminModel.insertUsuario(data, (error, resultado) => {
        if (error) {
          console.log("Error al insertar en la base de datos:", error);
          res.status(500).json({ error: "Error al insertar la materia." });
        } else {
          res.json(resultado);
        }
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

function updateUsuario(req, res) {
  const id = req.params.rfc;
  let formData = {};
  if (req.body.status != null && req.body.status != undefined) {
    formData = {
      status: req.body.status,
    };
  } else {
    const hashedPassword = req.body.password
      ? bcrypt.hashSync(req.body.password, saltRounds)
      : null;
    formData = {
      rfc: req.body.rfc,
      nombre_Doce: req.body.nombre_Doce,
      apellido_paterno: req.body.apellido_paterno,
      apellido_materno: req.body.apellido_materno,
      sexo: req.body.sexo,
      email: req.body.email,
    };
    if (hashedPassword) {
      formData.password = hashedPassword;
    }
  }
  adminModel.updateUsuario(id, formData, (error, resultado) => {
    if (error) {
      console.log("Error al editar en la base de datos:", error);
      res.status(500).json({ error: "Error al editar." });
    } else {
      res.json(resultado);
    }
  });
}

function findPermisosByRFC(req, res) {
  const { rfc } = req.params;
  adminModel.findPermisosByRFC(rfc, (error, permisos) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error al obtener permisos");
    } else {
      res.json(permisos);
    }
  });
}

function givePermisos(req, res) {
  const { idPermisos, permisosBorrados, idUsuario } = req.body;

  const data = idPermisos.map((idPermiso) => ({ idPermiso, idUsuario }));

  if (permisosBorrados.length > 0) {
    adminModel.deletePermisos(
      permisosBorrados,
      idUsuario,
      (error, deleteResults) => {
        if (error) {
          console.error("Error al eliminar permisos:", error);
          return res.status(500).send("Error al eliminar permisos");
        } else if (idPermisos.length > 0) {
          assignPermisos(data, res);
        }else{
          res.json(deleteResults);
        }
      }
    );
  } else if (idPermisos.length > 0) {
    assignPermisos(data, res);
  }
}

function assignPermisos(data, res) {
  adminModel.givePermisos(data, (error, assignResults) => {
    if (error) {
      console.error("Error al dar permisos:", error);
      return res.status(500).send("Error al dar permisos");
    }

    res.json(assignResults);
  });
}

module.exports = {
  getUsuarios,
  insertUsuario,
  updateUsuario,
  findPermisosByRFC,
  givePermisos,
};
