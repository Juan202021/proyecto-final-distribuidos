import express from "express";
import { v4 as uuidv4 } from "uuid";
import { nuevaSolicitud, mostrarResultados, mostrarSolicitudes } from "../libs/db.js";
import { enviarTrabajo } from "../libs/cola.js";
import e from "express";

const app = express();
const port = 3001;

// Middleware para parsear JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Microservicio 1!");
});

app.post("/nuevo", async (req, res) => {
  try {
    const { cantidad, digitos } = req.body;

    if (!cantidad || !digitos) {
      return res.status(400).json({
        error: "Los campos cantidad y digitos son obligatorios.",
      });
    }

    // Crear ID único para la solicitud
    const idSolicitud = uuidv4();

    // Insertar en la BD
    await nuevaSolicitud(idSolicitud, cantidad, digitos);

    // 3. Enviar a la cola
    const idTrabajo = await enviarTrabajo({
      solicitudId: idSolicitud,
      cantidad,
      digitos
    });

    const resultados = await mostrarResultados();
    const solicitudes = await mostrarSolicitudes();

    return res.json({
      idSolicitud: idSolicitud,
      resultados: resultados,
      solicitudes: solicitudes
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({
      error: "Error interno del servidor.",
      errorDetalle: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Microservice 1 listening at http://localhost:${port}`);
});
