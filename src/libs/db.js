const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function nuevaSolicitud(id, cantidad, digitos) {
  await pool.query(
    `
    INSERT INTO solicitudes (id, cantidad, num_digitos)
    VALUES ($1, $2, $3)
    `,
    [id, cantidad, digitos]
  );
}

async function guardarResultado(solicitudId, numero) {
  await pool.query(
    `
    INSERT INTO resultados (solicitud_id, numero)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
    [solicitudId, numero]
  );
}

async function mostrarResultados() {
  const result = await pool.query(`
    SELECT * FROM resultados
  `);
  return result.rows;
}

async function mostrarSolicitudes() {
  const result = await pool.query(`
    SELECT * FROM solicitudes
  `);
  return result.rows;
}

async function contarNumerosGenerados(solicitudId) {
  const result = await pool.query(
    `
    SELECT COUNT(*) AS total_primos
    FROM resultados
    WHERE solicitud_id = $1
    `,
    [solicitudId]
  );

  return Number(result.rows[0].total_primos);
}

async function obtenerCantidadSolicitada(solicitudId) {
  const result = await pool.query(
    `
    SELECT cantidad
    FROM solicitudes
    WHERE id = $1
    `,
    [solicitudId]
  );

  // Si no existe la solicitud, retorna null
  if (result.rows.length === 0) return null;

  return Number(result.rows[0].cantidad);
}

async function obtenerNumerosGenerados(solicitudId) {
  const result = await pool.query(
    `
    SELECT numero
    FROM resultados
    WHERE solicitud_id = $1
    ORDER BY numero
    `,
    [solicitudId]
  );

  return result.rows.map(r => r.numero);
}


module.exports = {
  pool,
  nuevaSolicitud,
  guardarResultado,
  mostrarResultados,
  mostrarSolicitudes,
  contarNumerosGenerados,
  obtenerCantidadSolicitada,
  obtenerNumerosGenerados
};