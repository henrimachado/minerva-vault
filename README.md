# MinervaVault

Sistema de gerenciamento de monografias desenvolvido para o curso de Sistemas de Informação da UFVJM.

## Pré-requisitos

Para executar o sistema, você precisa apenas ter instalado:
- Docker
- Docker Compose

## Executando o Sistema

1. Clone o repositório
```bash
git clone https://github.com/henrimachado/minerva-vault.git
cd minerva-vault
```

2. Inicie o sistema
```bash
docker-compose up --build
```

Aguarde todos os serviços iniciarem. O sistema estará pronto quando você ver a mensagem indicando que todos os serviços estão disponíveis.

## Acessando o Sistema
### Interface Principal (Portal)
- URL: ```http://localhost:5173```
- Usuários disponíveis:
    - Administrador
        - Login: 
        - Senha: 

    - Professor
        - Login: 
        - Senha: 

    - Aluno
        - Login: 
        - Senha: 

    - Painel Administrativo
        - URL: 
        - Credenciais:
            - Usuário: 
            - Senha: 

## Funcionalidades Disponíveis
- Upload de monografias em PDF
- Busca por título, autor, orientador e palavras-chave
- Visualização de detalhes das monografias
- Gerenciamento de usuários e permissões
- Download de documentos
- Extração automática de metadados

## Parando o Sistema
Para encerrar o sistema:
```bash
docker-compose down
```
## Observações Importantes
- O sistema já vem com um banco de dados populado com exemplos de monografias.
- Todos os dados são preservados entre execuções do sistema
- As senhas dos usuários são criptografadas e seguras
- O sistema realiza backup automático dos dados