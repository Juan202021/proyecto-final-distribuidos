CREATE TABLE IF NOT EXISTS solicitudes (
    id VARCHAR(50) PRIMARY KEY,
    cantidad INT NOT NULL,
    num_digitos INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resultados (
    id SERIAL PRIMARY KEY,
    solicitud_id VARCHAR(50) REFERENCES solicitudes(id),
    numero BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_prime_per_request UNIQUE (solicitud_id, numero)
);

CREATE INDEX idx_solicitud ON resultados(solicitud_id);