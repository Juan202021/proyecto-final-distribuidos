import express from "express";
import { contarNumerosGenerados, obtenerNumerosGenerados } from "../../libs/db.js";

const app = express();
const port = 3003;

// Middleware para parsear JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Microservicio 3!");
});

app.post("/resultado", async (req, res) => {
  try {
    const { idSolicitud } = req.body;

    if (idSolicitud === undefined || idSolicitud === null) {
      return res.status(400).json({
        error: "El campo idSolicitud es obligatorios.",
      });
    }

    const numerosPrimosGenerados = await obtenerNumerosGenerados(idSolicitud);
    const totalGenerados = await contarNumerosGenerados(idSolicitud);

    res.json({
      totalGenerados: totalGenerados,
      numerosPrimosGenerados: numerosPrimosGenerados,
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({
      error: "Error interno del servidor.",
      errorDetalle: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Microservice 3 listening at http://localhost:${port}`);
});
