# Usar una imagen oficial de Node.js
FROM node:18-alpine

# Crear directorio de la app
WORKDIR /app

# Copiar package.json y package-lock.json
COPY src/services/microservicio3/package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar el código de la aplicación
COPY src/services/microservicio3/ ./

COPY src/libs ../libs

# Exponer el puerto
EXPOSE 3003

# Comando para ejecutar la app
CMD ["node", "resultado.js"]