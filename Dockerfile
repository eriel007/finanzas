
FROM node:22

# Carpeta de trabajo
WORKDIR /app

# Copiar package.json primero (mejor cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Exponer puerto
EXPOSE 3000

# Ejecutar Next.js en modo desarrollo
CMD ["npm", "run", "dev"]
