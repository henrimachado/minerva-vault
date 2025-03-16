#!/bin/bash

echo "Iniciando configuração da API..."

# Esperar o banco de dados
echo "Aguardando banco de dados..."
while ! nc -z db 5432; do
sleep 0.1
done
echo "Banco de dados conectado!"

# Remover SQLite se existir
rm -f /app/db.sqlite3

# Aplicar migrações
echo "Aplicando migrações..."
python manage.py migrate

# Criar usuários padrão
echo "Configurando usuários..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()

# Criar admin
if not User.objects.filter(username='admin').exists():
  User.objects.create_superuser(
      username='admin',
      email='admin@minerva.com',
      password='admin123'
  )

# Criar professor
if not User.objects.filter(username='professor').exists():
  User.objects.create_user(
      username='professor',
      email='professor@minerva.com',
      password='prof123',
      is_staff=True
  )

# Criar aluno
if not User.objects.filter(username='aluno').exists():
  User.objects.create_user(
      username='aluno',
      email='aluno@minerva.com',
      password='aluno123'
  )
EOF

echo "Configuração inicial concluída!"
echo "Iniciando servidor Django..."

# Iniciar servidor com hot reload
python manage.py runserver 0.0.0.0:8000