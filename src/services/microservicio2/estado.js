import express from "express";
import { contarNumerosGenerados, obtenerCantidadSolicitada } from "../../libs/db.js";

const app = express();
const port = 3002;

// Middleware para parsear JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Microservicio 2!");
});

app.post("/estado", async (req, res) => {
  try {
    const { idSolicitud } = req.body;

    if (idSolicitud === undefined || idSolicitud === null) {
      return res.status(400).json({
        error: "El campo idSolicitud es obligatorios.",
      });
    }

    const total = await obtenerCantidadSolicitada(idSolicitud);
    const generados = await contarNumerosGenerados(idSolicitud);

    res.json({
      total: total,
      generados: generados
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
  console.log(`Microservice 2 listening at http://localhost:${port}`);
});
