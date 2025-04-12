# MinervaVault
Sistema de gerenciamento de monografias desenvolvido para o curso de Sistemas de Informação da UFVJM.

## Responsáveis
O sistema foi desenvolvido pelos alunos:
- Mateus Henrique Machado
- Raul Victor da Silva

## Pré-requisitos
Para executar o sistema, você precisa apenas ter instalado:
- Docker (app) `v. 4.38.0` ou mais 
- Docker (engine) `v 27.5.1` ou mais 
- Docker Compose `v2.32.4-desktop.1` ou mais 
- Git `v 2.45.1` ou mais (caso pretenda cloná-lo )


## Executando o Sistema
1. Clone o repositório a partir do comando a seguir. Caso tenha recebido um arquivo zipado com o código fonte, apenas o extraia em um local que consiga acessar novamente. 

```bash
git clone https://github.com/henrimachado/minerva-vault.git
cd minerva-vault
```

2. Navegue até a raiz do projeto 

3. Procure pelo arquivo `.env`. Caso não o encontre, crie-o e acrescente as informações abaixo:

```BASH
DJANGO_SETTINGS_MODULE=core.settings
DATABASE_URL=postgresql://postgres:postgres@db:5432/minervavault
DEBUG=1
PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1
POSTGRES_DB=minervavault
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432
VITE_API_URL=http://localhost:8000
```

3. Caso esteja iniciando o sistema pela primeira vez, execute:

    3.1. Se estiver utilizando Windows:
    ```bash
    docker-compose up --build
    ```

    3.2. Se estiver utilizando Unix: 
    ```bash
    docker compose up --build
    ```

4. Caso esta não seja sua primeira vez iniciando o sistema, execute:

    4.1. Se estiver utilizando Windows:
    ```bash
    docker-compose up
    ```

    4.2. Se estiver utilizando Unix
    ```bash
    docker compose up
    ```


Aguarde todos os serviços iniciarem. O sistema estará pronto quando você ver a mensagem indicando que todos os serviços estão disponíveis.

## Acessando o Sistema
### Interfaces do sistema

#### Portal principal 
O acesso ao sistema principal pode ser feito através da URL  `http://localhost:5173`. Aqui você terá acesso ao sistema acessível a usuários comuns (estudantes e professores), sendo possível:

1. Fazer busca das monografias cadastradas 
2. Cadastrar-se como um novo usuário 
3. Realizar o login com suas credenciais 
4. Cadastrar teses
5. Editar teses
6. Atualizar seu perfil

#### Painel admin
O acesso ao painel admin é feito utilizando as credenciais de administrador descritas na seção **Credenciais de acesso padrão**. Para isso, acesse a URL `http://localhost:8000/admin`


#### Documentação do sistema
A documentação da API do sistema pode ser acessada via swagger ou redoc. Para isso, com o sistema em execução, acesse uma das urls a seguir:

1. Swagger: `http://localhost:8000/swagger/`
2. Redoc: `http://localhost:8000/redoc/`


### Credenciais de acesso padrão 
O sistema já conta com alguns mocks de usuário que podem ser utilizados para testá-lo:

### Admin

| Usuário | Senha | Descrição |
| ------ | ------ | ------ |
| admin | admin123 | Administrador com acesso total ao sistema. Pode gerenciar usuários, teses e todas as configurações do sistema.|


### Professores
| Usuário | Senha | Descrição |
| ------ | ------ | ------ |
|joao.pereira | prof123 | Orientador das teses de Lucas (Algoritmos Quânticos) e Gabriel (Blockchain). Coorientador da monografia de Ana (IA Emocional). Tem acesso para aprovar/rejeitar teses e gerenciar trabalhos sob sua orientação. |
|mariana.lima | prof123 | Orientadora da monografia de Ana (IA Emocional). Coorientadora da monografia de Lucas (Algoritmos Quânticos). Tem acesso para aprovar/rejeitar teses e gerenciar trabalhos sob sua orientação. |

### Alunos
| Usuário | Senha | Status da monografia mock | Descrição |
| ------ | ------ | ------ | ------ |
| lucas.silva | aluno123 | Aprovada | Autor da monografia "A Influência dos Algoritmos Quânticos na Otimização de Redes Virtuais". |
| gabriel.santos| aluno123 | Aprovada | Autor da monografia "Blockchain Aplicado à Gestão de Dados em Sistemas de Informação Corporativos". |
| ana.oliveira| aluno123 | Pendente | Autora da monografia "Modelagem de Sistemas de Informação Baseada em Inteligência Artificial Emocional". |




## Parando o Sistema
Para encerrar o sistema:

 - se estiver utilizando Windows:
```bash
docker-compose down
```

- se estiver utilizando Unix:
```bash
docker compose down
```

## Regras de negócio
- Para visualizar monografias que já foram aprovadas, não é necessário que o usuário esteja logado 
- Teses que foram rejeitadas não podem ser encontradas pela listagem
- É possível utilizar filtros na busca de monografias
- Somente usuários logados podem cadastrar ou editar monografias:
    - Teses cadastradas por alunos são cadastradas com o status "Pendente" por padrão; 
    - Somente monografias que ainda estão pendentes podem ser editadas ou excluídas pelo aluno que fez o cadastro 
    - Teses cadastradas por professores são cadastradas com o status "Aprovado" por padrão; 
    - Professores podem editar ou excluir monografias independentemente do status, desde que sejam orientadores da monografia
    - Todas as monografias devem ter autor e orientador, mas o coorientador não é obrigatório 
- Os usuários podem trocar somente as informações de nome, sobrenome, avatar e senha em seu perfil 
- A cada 30 dias é exigido que o usuário altere sua senha, mas ele pode fazer antes do prazo através do seu perfil 
- Usuários com senha desatualizada não conseguem utilizar as funcionalidades autenticadas do sistema
- O usuário não pode repetir as últimas 5 senhas durante a alteração de senha 
- O sistema conta com autenticação via jwt, com armazenamento do token em local storage 
- Salvo os perfis mockados, as senhas são criptografadas e devem seguir padrões de senha segura, como não contem informações do email ou username, além de presença de caracteres especiais, letras maiúsculas ou minúsculas e presença de números.


## Observações Importantes
- O sistema já vem com um banco de dados populado com exemplos de monografias.
- Os dados são preservados entre execuções do sistema
- As senhas dos usuários são criptografadas e seguras
- O sistema realiza backup automático dos dados
- Caso alguma informação mockada seja excluída durante o seu teste, apague o container gerado e reinicie a aplicação com o comando ```docker-compose up --build``` se estiver usando Windows e ```docker compose up --build``` se estiver usando sistemas operacionais baseados em Unix.