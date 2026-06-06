# Univap Fichas

Sistema de avaliação acadêmica desenvolvido como projeto escolar para o Colégio Univap. Permite que professores avaliem grupos de alunos por disciplina, com painéis distintos para cada perfil de usuário.

---

## Tecnologias

**Frontend**
- React 18 (via CDN — sem bundler)
- Babel Standalone — transpila JSX no browser
- CSS puro — sem frameworks externos

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL — banco de dados relacional
- JWT — autenticação com token de 1 dia
- Zod — validação de entrada em todas as rotas
- bcrypt — hash de senhas
- ts-node-dev — hot reload em desenvolvimento

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL instalado e rodando localmente

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/borgeizdev/univap-fichas.git
cd univap-fichas
```

### 2. Instale as dependências do backend

```bash
cd backend
npm install
```

### 3. Configure as variáveis de ambiente

Crie o arquivo `backend/.env` com o seguinte conteúdo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=univap_fichas
DB_USER=postgres
DB_PASS=sua_senha_do_postgres

JWT_SECRET=uma_chave_secreta_longa_e_aleatoria

PORT=3001

SEED_COORD_PASS=senha_do_coordenador
SEED_ALUNO_PASS=senha_do_aluno_gui
SEED_MATEUS_PASS=senha_do_aluno_mateus
```

### 4. Crie o banco de dados

Crie o banco e rode o schema via Node.js (não exige psql no PATH):

```bash
# Criar o banco
node -e "require('dotenv').config(); const {Pool}=require('pg'); const p=new Pool({host:process.env.DB_HOST,port:process.env.DB_PORT,user:process.env.DB_USER,password:process.env.DB_PASS}); p.query('CREATE DATABASE univap_fichas').then(()=>{console.log('Banco criado!');p.end()}).catch(e=>{console.error(e.message);p.end()})"

# Rodar o schema (criar as tabelas)
node -e "require('dotenv').config(); const {Pool}=require('pg'); const fs=require('fs'); const p=new Pool({host:process.env.DB_HOST,port:process.env.DB_PORT,database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASS}); p.query(fs.readFileSync('db/schema.sql','utf8')).then(()=>{console.log('Tabelas criadas!');p.end()}).catch(e=>{console.error(e.message);p.end()})"
```

> Se já tiver o `psql` no PATH, pode usar:
> ```bash
> psql -U postgres -c "CREATE DATABASE univap_fichas;"
> psql -U postgres -d univap_fichas -f backend/db/schema.sql
> ```

### 5. Popule o banco com os usuários iniciais

```bash
npm run seed
```

### 6. Inicie o backend

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3001`.

### 7. Inicie o frontend

Em outro terminal, a partir da raiz do projeto:

```bash
npx serve univap
```

O sistema ficará disponível em `http://localhost:3000`.

---

## Contas de acesso

As senhas são as que você definiu no `.env`.

| Perfil      | E-mail               | Matrícula |
|-------------|----------------------|-----------|
| Coordenador | coord@univap.com     | —         |
| Aluno       | gui@univap.com       | 50240001  |
| Aluno       | mateus@univap.com    | 50240609  |
| Professor   | criado pelo coordenador | —      |

---

## Fluxo de uso

```
1. Login como Coordenador
   → Cadastrar matérias
   → Cadastrar professores (atribuindo matérias)

2. Login como Aluno
   → Criar grupo → escolher matéria → adicionar integrantes

3. Login como Professor
   → Nova Ficha → selecionar grupo → preencher avaliação → publicar

4. Login como Aluno
   → Histórico de Avaliações → ver nota e feedback
```

---

## Funcionalidades por perfil

### Coordenador
- Cadastrar e gerenciar matérias por curso
- Cadastrar e gerenciar professores, atribuindo matérias a cada um

### Aluno
- Criar e gerenciar grupos (curso, ano, turma, matéria)
- Adicionar integrantes ao grupo com nome e matrícula
- Visualizar histórico de avaliações recebidas com nota individual

### Professor
- Painel inicial com estatísticas e grupos pendentes de avaliação
- Criar fichas de avaliação: nota por integrante, pontos positivos, pontos de melhoria e anotações
- Gerenciar fichas criadas com filtros
- Dashboard com gráficos de avaliações por mês e média por turma

---

## Estrutura de pastas

```
univap-fichas/
├── backend/
│   ├── src/
│   │   ├── server.ts          # API REST (Express + TypeScript)
│   │   ├── schemas.ts         # Validação Zod de todas as rotas
│   │   └── middleware/
│   │       └── auth.ts        # JWT: signToken, verifyToken, requireRole
│   ├── db/
│   │   ├── schema.sql         # Criação das tabelas
│   │   └── seed.js            # Usuários iniciais
│   ├── .env                   # Credenciais locais (não versionado)
│   └── package.json
└── univap/
    ├── index.html             # Entry point — carrega scripts em ordem
    ├── styles/
    │   └── main.css
    └── src/
        ├── App.jsx            # Raiz — autenticação e roteamento
        ├── data/
        │   ├── api.js         # Cliente HTTP (fetch + JWT)
        │   ├── mock.js        # Enums: cursos, anos, turmas
        │   └── store.js       # Utilitários compartilhados (fmtDataBR)
        ├── components/
        │   ├── UI.jsx         # Componentes reutilizáveis
        │   ├── Layout.jsx     # AppShell, Sidebar, Header
        │   ├── Icon.jsx
        │   └── TweaksPanel.jsx
        └── screens/
            ├── Login.jsx
            ├── Misc.jsx
            ├── professor/
            ├── aluno/
            └── coordenador/
```

---

## Segurança

- Senhas armazenadas com bcrypt (salt 10)
- Autenticação via JWT com expiração de 1 dia
- Todas as rotas protegidas por `verifyToken`
- Rotas de escrita verificam role e dono do recurso
- Credenciais nunca versionadas (`.env` no `.gitignore`)

---

## Autor

Projeto escolar — Colégio Univap
