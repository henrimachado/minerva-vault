FROM python:3.12.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
  git \
  netcat-traditional \
  postgresql-client \
  libpq-dev \
  gcc \
  python3-dev \
  && rm -rf /var/lib/apt/lists/*

COPY ./minerva-vault-api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar script de inicialização
COPY .docker/scripts/init-api.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/init-api.sh

CMD ["init-api.sh"]