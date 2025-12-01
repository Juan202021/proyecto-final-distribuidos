# Usar una imagen oficial de Node.js
FROM node:18-alpine

# Crear directorio de la app
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar el código de la aplicación
COPY . .

# Exponer el puerto
EXPOSE 3001

# Comando para ejecutar la app
CMD ["node", "nuevo.js"]