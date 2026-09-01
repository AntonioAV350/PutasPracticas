const historial = require("../models/historialModel");

exports.getHistorial = async (req, res) => {
  try {
    const historialData = await historial.getHistorial();
    res.send(historialData);
  } catch (error) {
    res.status(500).send("Error del servidor");
  }
};

exports.setHistorial = async (req, res) => {
  const data = req.body;
  try {
    const historialData = await historial.setHistorial(data);
    res.send(historialData);
  } catch (error) {
    res.status(500).send("Error del servidor");
  }
};
