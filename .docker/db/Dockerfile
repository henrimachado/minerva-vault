FROM postgres:17.4-alpine

# Instalar dependências necessárias
RUN apk add --no-cache \
  musl \
  musl-utils \
  musl-locales \
  tzdata

# Configurar locale
ENV LANG=en_US.UTF-8 \
  LC_ALL=en_US.UTF-8 \
  LANGUAGE=en_US.UTF-8

# Configurar timezone
ENV TZ=America/Sao_Paulo