FROM node:20

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias (dev incluidas por defecto)
RUN npm install

# Copiamos todo el código
COPY . .

# Puerto por defecto
EXPOSE 3000

# Definimos una variable de entorno por defecto
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Ejecutamos nodemon o node según el entorno
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then npx nodemon index.js; else node index.js; fi"]
