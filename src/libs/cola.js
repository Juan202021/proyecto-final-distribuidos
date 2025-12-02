const { Queue } = require("bullmq");

const colaPrimos = new Queue("cola-primos", {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

async function enviarTrabajo(datos) {
  const job = await colaPrimos.add("calcular", datos);
  return job.id;
}

module.exports = { colaPrimos, enviarTrabajo };
