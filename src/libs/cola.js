const redis = require("redis");

// Crear cliente de Redis
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Conectar al iniciar
redisClient.connect().catch(console.error);

redisClient.on('error', (err) => {
  console.error('Error en conexión Redis:', err);
});

/**
 * Envía un trabajo a la cola usando RPUSH
 * @param {Object} datos - Datos del trabajo (solicitudId, cantidad, digitos)
 * @returns {Promise<string>} ID de la solicitud
 */
async function enviarTrabajo(datos) {
  // Convertir datos a JSON para enviar a la cola
  const trabajo = JSON.stringify({
    id: datos.solicitudId,
    cantidad: datos.cantidad,
    num_digitos: datos.digitos
  });
  
  // RPUSH agrega al final de la lista 'solicitudes'
  await redisClient.rPush('solicitudes', trabajo);
  
  console.log(`✓ Trabajo enviado a cola: ${datos.solicitudId}`);
  return datos.solicitudId;
}

module.exports = { redisClient, enviarTrabajo };
