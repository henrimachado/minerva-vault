FROM node:22.14.0-alpine

WORKDIR /app

# Copiar arquivos do projeto
COPY ./minerva-vault-web/package*.json ./
COPY ./minerva-vault-web/vite.config.ts ./

# Instalar dependências
RUN npm install

# Copiar resto dos arquivos
COPY ./minerva-vault-web ./

# Comando para iniciar
CMD ["npm", "run", "dev", "--", "--host"]