import express from "express";
import { v4 as uuidv4 } from "uuid";
import { nuevaSolicitud } from "../../libs/db.js";
import { enviarTrabajo } from "../../libs/cola.js";

const app = express();
const port = 3001;

// Middleware para parsear JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Microservicio 1: Crear nuevas solicitudes");
});

app.post("/nuevo", async (req, res) => {
  try {
    const { cantidad, digitos } = req.body;

    // Validar campos requeridos
    if (!cantidad || !digitos) {
      return res.status(400).json({
        error: "Los campos cantidad y digitos son obligatorios.",
      });
    }

    // Validar límites razonables
    if (cantidad > 1000 || cantidad < 1) {
      return res.status(400).json({
        error: "La cantidad debe estar entre 1 y 1000.",
      });
    }

    if (digitos > 20 || digitos < 1) {
      return res.status(400).json({
        error: "Los dígitos deben estar entre 1 y 20.",
      });
    }

    // Crear ID único para la solicitud
    const idSolicitud = uuidv4();

    // Insertar en la BD
    await nuevaSolicitud(idSolicitud, cantidad, digitos);

    // Enviar a la cola de Redis
    await enviarTrabajo({
      solicitudId: idSolicitud,
      cantidad,
      digitos
    });

    return res.json({
      success: true,
      idSolicitud: idSolicitud,
      mensaje: `Solicitud creada: ${cantidad} números primos de ${digitos} dígitos`
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
