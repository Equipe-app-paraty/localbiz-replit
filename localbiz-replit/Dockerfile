FROM node:23-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

# Não copie o arquivo .env
COPY src/ ./src/

EXPOSE 3000

CMD ["npm", "start"]