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
from django.utils import timezone
from django.core.files import File
from django.contrib.auth import get_user_model
from modules.users.models import Role, UserRole
from modules.thesis.models import Thesis
import os
from io import BytesIO

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

# Criar professores
prof_joao, created = User.objects.get_or_create(
username='joao.pereira',
defaults={
  'email': 'joao.pereira@minerva.com',
  'first_name': 'João Carlos',
  'last_name': 'Pereira',
  'is_staff': True
}
)
if created:
  prof_joao.set_password('prof123')
  prof_joao.save()
  UserRole.objects.get_or_create(user=prof_joao, role=professor_role)

prof_mariana, created = User.objects.get_or_create(
username='mariana.lima',
defaults={
  'email': 'mariana.lima@minerva.com',
  'first_name': 'Mariana',
  'last_name': 'Costa Lima',
  'is_staff': True
}
)
if created:
  prof_mariana.set_password('prof123')
  prof_mariana.save()
  UserRole.objects.get_or_create(user=prof_mariana, role=professor_role)

# Criar estudantes
aluno_lucas, created = User.objects.get_or_create(
username='lucas.silva',
defaults={
  'email': 'lucas.silva@minerva.com',
  'first_name': 'Lucas Andrade',
  'last_name': 'Silva'
}
)
if created:
  aluno_lucas.set_password('aluno123')
  aluno_lucas.save()
  UserRole.objects.get_or_create(user=aluno_lucas, role=student_role)

aluno_gabriel, created = User.objects.get_or_create(
username='gabriel.santos',
defaults={
  'email': 'gabriel.santos@minerva.com',
  'first_name': 'Gabriel Henrique',
  'last_name': 'Santos'
}
)
if created:
  aluno_gabriel.set_password('aluno123')
  aluno_gabriel.save()
  UserRole.objects.get_or_create(user=aluno_gabriel, role=student_role)

aluno_ana, created = User.objects.get_or_create(
username='ana.oliveira',
defaults={
  'email': 'ana.oliveira@minerva.com',
  'first_name': 'Ana Beatriz',
  'last_name': 'Oliveira'
}
)
if created:
  aluno_ana.set_password('aluno123')
  aluno_ana.save()
  UserRole.objects.get_or_create(user=aluno_ana, role=student_role)


def create_pdf_in_memory(title, content):
  try:
      from reportlab.pdfgen import canvas
      from reportlab.lib.pagesizes import letter
      
      buffer = BytesIO()
      c = canvas.Canvas(buffer, pagesize=letter)
      c.drawString(100, 750, f"Tese: {title}")
      c.drawString(100, 700, content[:500] + "...") 
      c.showPage()
      c.save()
      buffer.seek(0)
      return buffer
  except ImportError:
      text_content = f"Tese: {title}\n\n{content}"
      return BytesIO(text_content.encode('utf-8'))

def add_pdf_to_thesis(thesis, filename, title, content):
  pdf_path = f"/app/initial_data/theses_pdfs/{filename}"
  
  if os.path.exists(pdf_path):
      with open(pdf_path, 'rb') as f:
          thesis.pdf_file.save(filename, File(f), save=True)
  else:
      pdf_buffer = create_pdf_in_memory(title, content)
      thesis.pdf_file.save(filename, File(pdf_buffer), save=True)

# Criar teses
# Tese 1
tese1, created = Thesis.objects.get_or_create(
  title="A Influência dos Algoritmos Quânticos na Otimização de Redes Virtuais",
  defaults={
      'author': aluno_lucas,
      'advisor': prof_joao,
      'co_advisor': prof_mariana,
      'abstract': "Este trabalho analisa a aplicação de algoritmos quânticos no contexto das redes virtuais, destacando seu impacto na eficiência e escalabilidade. A pesquisa foca em modelos teóricos que demonstram como a computação quântica pode redefinir paradigmas tradicionais da tecnologia da informação.",
      'keywords': "Computação quântica, redes virtuais, otimização, algoritmos avançados",
      'defense_date': timezone.now().date(),
      'pdf_metadata': {"pages": 30, "type": "application/pdf"},
      'pdf_size': 1024000,  # ~1MB
      'pdf_pages': 30,
      'status': 'APPROVED',
      'created_by': admin_user
  }
)

if created:
  add_pdf_to_thesis(
      tese1, 
      "tese_algoritmos_quanticos.pdf",
      "A Influência dos Algoritmos Quânticos na Otimização de Redes Virtuais",
      "Este trabalho analisa a aplicação de algoritmos quânticos no contexto das redes virtuais, destacando seu impacto na eficiência e escalabilidade."
  )

# Tese 2
tese2, created = Thesis.objects.get_or_create(
  title="Blockchain Aplicado à Gestão de Dados em Sistemas de Informação Corporativos",
  defaults={
      'author': aluno_gabriel,
      'advisor': prof_joao,
      'abstract': "Este trabalho apresenta uma abordagem inovadora para a gestão de dados corporativos utilizando blockchain. A pesquisa discute as vantagens do uso dessa tecnologia em termos de segurança, transparência e descentralização.",
      'keywords': "Blockchain, gestão de dados, segurança, descentralização",
      'defense_date': timezone.now().date(),
      'pdf_metadata': {"pages": 25, "type": "application/pdf"},
      'pdf_size': 896000,  # ~896KB
      'pdf_pages': 25,
      'status': 'APPROVED',
      'created_by': admin_user
  }
)

if created:
  add_pdf_to_thesis(
      tese2,
      "tese_blockchain.pdf",
      "Blockchain Aplicado à Gestão de Dados em Sistemas de Informação Corporativos",
      "Este trabalho apresenta uma abordagem inovadora para a gestão de dados corporativos utilizando blockchain."
  )

# Tese 3
tese3, created = Thesis.objects.get_or_create(
  title="Modelagem de Sistemas de Informação Baseada em Inteligência Artificial Emocional",
  defaults={
      'author': aluno_ana,
      'advisor': prof_mariana,
      'co_advisor': prof_joao,
      'abstract': "Este estudo investiga a integração de inteligência artificial emocional na modelagem de sistemas de informação, visando melhorar a interação humano-computador. A pesquisa explora conceitos de aprendizado profundo e redes neurais emocionais.",
      'keywords': "Inteligência artificial, emoção, sistemas de informação, aprendizado profundo",
      'defense_date': timezone.now().date(),
      'pdf_metadata': {"pages": 28, "type": "application/pdf"},
      'pdf_size': 965000,  # ~965KB
      'pdf_pages': 28,
      'status': 'PENDING',
      'created_by': admin_user
  }
)

if created:
  add_pdf_to_thesis(
      tese3,
      "tese_ia_emocional.pdf",
      "Modelagem de Sistemas de Informação Baseada em Inteligência Artificial Emocional",
      "Este estudo investiga a integração de inteligência artificial emocional na modelagem de sistemas de informação."
  )

print("Usuários, roles e teses configurados com sucesso!")
EOF

echo "Configuração inicial concluída!"
echo "Iniciando servidor Django..."

# Iniciar servidor com hot reload
python manage.py runserver 0.0.0.0:8000