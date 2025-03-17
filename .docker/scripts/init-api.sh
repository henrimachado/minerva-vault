#!/bin/bash

echo "Iniciando configuração da API..."

# Esperar o banco de dados
echo "Aguardando banco de dados..."
while ! nc -z db 5432; do
sleep 0.1
done
echo "Banco de dados conectado!"

# Criar migrações especificando os apps
echo "Criando migrações..."
python manage.py makemigrations users
python manage.py makemigrations thesis
python manage.py makemigrations audit

# Aplicar migrações
echo "Aplicando migrações..."
python manage.py migrate users
python manage.py migrate

# Criar usuários e roles
echo "Configurando usuários e roles..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
from modules.users.models import Role, UserRole
User = get_user_model()

# Criar roles
admin_role, _ = Role.objects.get_or_create(
  name='ADMIN',
  defaults={'description': 'Administrador do sistema'}
)

professor_role, _ = Role.objects.get_or_create(
  name='PROFESSOR',
  defaults={'description': 'Professor orientador'}
)

student_role, _ = Role.objects.get_or_create(
  name='STUDENT',
  defaults={'description': 'Aluno'}
)

# Criar admin
admin_user, created = User.objects.get_or_create(
  username='admin',
  defaults={
      'email': 'admin@minerva.com',
      'first_name': 'Administrador',
      'last_name': 'do Sistema',
      'is_staff': True,
      'is_superuser': True
  }
)
if created:
  admin_user.set_password('admin123')
  admin_user.save()
  UserRole.objects.get_or_create(user=admin_user, role=admin_role)

# Criar professor
professor_user, created = User.objects.get_or_create(
  username='professor',
  defaults={
      'email': 'professor@minerva.com',
      'first_name': 'João',
      'last_name': 'Silva',
      'is_staff': True
  }
)
if created:
  professor_user.set_password('prof123')
  professor_user.save()
  UserRole.objects.get_or_create(user=professor_user, role=professor_role)

# Criar aluno
student_user, created = User.objects.get_or_create(
  username='aluno',
  defaults={
      'email': 'aluno@minerva.com',
      'first_name': 'Maria',
      'last_name': 'Santos'
  }
)
if created:
  student_user.set_password('aluno123')
  student_user.save()
  UserRole.objects.get_or_create(user=student_user, role=student_role)
EOF

echo "Configuração inicial concluída!"
echo "Iniciando servidor Django..."

# Iniciar servidor com hot reload
python manage.py runserver 0.0.0.0:8000