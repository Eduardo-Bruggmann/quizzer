# Quizzer

Plataforma de quizzes com **Next.js 16 + TypeScript**, autenticação por **JWT**, banco **SQLite** e organização em camadas (routes, services, repositories).

## Funcionalidades

- Cadastro e login de usuários
- Perfis com papéis `student` e `teacher`
- Dashboard com matérias e contagem de questões
- Modo estudo por matéria com correção de respostas
- Painel do professor para:
  - criar/editar/excluir matérias
  - criar questões e alternativas
  - gerenciar usuários e papel (aluno/professor)
- API REST em `src/app/api/*`

## Tecnologias

- Next.js 16 (App Router)
- React 19
- TypeScript
- SQLite (`better-sqlite3`)
- Drizzle ORM
- Zod (validação)
- JOSE (JWT)
- bcrypt (hash de senha)

## Pré-requisitos

- Node.js 20+
- npm 10+

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env.local` na raiz do projeto:

```env
JWT_SECRET=coloque_uma_chave_bem_grande_com_32_caracteres_ou_mais
JWT_ISSUER=quizzer-api
JWT_AUDIENCE=quizzer-client
JWT_ACCESS_EXPIRATION=15m
```

> `JWT_SECRET` é obrigatório e deve ter **pelo menos 32 caracteres**.

3. Inicialize e popule o banco:

```bash
npm run db:setup
```

4. Inicie o projeto:

```bash
npm run dev
```

Aplicação: `http://localhost:3000`

## Scripts

- `npm run dev` — inicia em modo desenvolvimento
- `npm run build` — gera build de produção
- `npm run start` — inicia build de produção
- `npm run lint` — roda lint
- `npm run db:init` — cria tabelas no `sqlite.db`
- `npm run db:seed` — popula com dados mock
- `npm run db:setup` — executa init + seed

## Usuários de teste (seed)

Após `npm run db:setup`, você pode entrar com:

- **Professores**
  - `mariana.costa@escola.com`
  - `ricardo.almeida@escola.com`
  - senha: `prof123456`

- **Alunos**
  - `ana.souza@aluno.com`
  - `joao.pereira@aluno.com`
  - `larissa.mendes@aluno.com`
  - senha: `aluno123456`

## Estrutura principal

- `src/app` — páginas e rotas API
- `src/services` — regras de negócio
- `src/repositories` — acesso a dados
- `src/db` — conexão e schema
- `scripts` — inicialização e seed do banco

## Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/subjects`
- `POST /api/subjects` (teacher)
- `GET /api/questions?subjectId=...`
- `POST /api/questions` (teacher)
- `GET /api/alternatives?questionId=...`
- `POST /api/alternatives` (teacher)
- `GET /api/users` (teacher)
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
- `PATCH /api/users/:id/role` (teacher)

## Observações

- O token JWT deve ser enviado no header:

  `Authorization: Bearer <token>`

- O banco local padrão é o arquivo `sqlite.db` na raiz do projeto.
