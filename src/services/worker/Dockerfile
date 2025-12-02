FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias de Python
RUN pip install --no-cache-dir redis psycopg2-binary

# Copiar el código del worker
COPY src/services/worker/worker.py .

# Ejecutar el worker
CMD ["python", "worker.py"]
