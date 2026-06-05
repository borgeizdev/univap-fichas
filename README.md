# Univap Fichas

Sistema de avaliação acadêmica desenvolvido como projeto escolar para o Colégio Univap. Permite que professores avaliem grupos de alunos por disciplina, com painéis distintos para cada perfil de usuário.

---

## Tecnologias

**Frontend**
- **React 18** (via CDN — sem bundler/build tool)
- **Babel Standalone** — transpila JSX diretamente no browser
- **CSS puro** — estilização sem frameworks externos
- **Google Fonts** — Roboto, Figtree, Manrope, Plus Jakarta Sans

**Backend**
- **Node.js + Express** — API REST
- **PostgreSQL** — banco de dados relacional
- **bcrypt** — hash de senhas
- **pg** — driver PostgreSQL para Node.js

---

## Como rodar

### 1. Banco de dados

Crie o banco e rode o schema:

```bash
psql -U postgres -c "CREATE DATABASE univap_fichas;"
psql -U postgres -d univap_fichas -f backend/db/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
node db/seed.js   # cria os usuários padrão (só na primeira vez)
node server.js    # inicia a API em http://localhost:3001
```

Configure as variáveis de ambiente em `backend/.env` (baseie-se em `.env.example`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=univap_fichas
DB_USER=postgres
DB_PASS="sua_senha"
PORT=3001
```

### 3. Frontend

Com o servidor rodando, abra `univap/index.html` no navegador.

> **Dica:** Use a extensão **Live Server** no VS Code para evitar problemas com CORS ao carregar os arquivos `.jsx`.

---

## Contas de acesso

| Perfil       | E-mail                  | Senha                |
|--------------|-------------------------|----------------------|
| Coordenador  | coord@univap.com        | 123coord             |
| Aluno        | gui@univap.com          | 123aluno             |
| Professor    | criado pelo coordenador | definida no cadastro |

---

## Funcionalidades por perfil

### Coordenador
- Cadastrar e gerenciar **matérias**
- Cadastrar e gerenciar **professores**, atribuindo matérias a cada um

### Aluno
- Criar e gerenciar **grupos** (com nome, curso, ano, turma e matéria)
- Adicionar integrantes ao grupo (nome + matrícula, com opção de marcar o líder)
- Visualizar o **histórico de avaliações** recebidas pelo grupo

### Professor
- Visualizar painel inicial com estatísticas e grupos pendentes
- Criar **fichas de avaliação** para grupos: nota, pontos positivos, pontos a melhorar e anotações
- Gerenciar fichas criadas com filtros por disciplina e status
- Acessar **dashboard** com gráficos e resumo de avaliações

---

## Estrutura de pastas

```
univap-fichas/
├── backend/
│   ├── server.js                     # API REST (Express)
│   ├── .env.example                  # Modelo de configuração
│   ├── package.json
│   └── db/
│       ├── schema.sql                # Criação das tabelas
│       └── seed.js                   # Usuários iniciais
└── univap/
    ├── index.html                    # Entry point — carrega todos os scripts em ordem
    ├── assets/
    │   └── images/
    ├── styles/
    │   └── main.css                  # Estilos globais
    └── src/
        ├── App.jsx                   # Raiz da aplicação — autenticação e roteamento
        ├── components/
        │   ├── Icon.jsx
        │   ├── UI.jsx                # Componentes reutilizáveis (Button, Card, Badge…)
        │   ├── Layout.jsx            # AppShell, Sidebar e Header
        │   └── TweaksPanel.jsx       # Painel de personalização visual
        ├── data/
        │   ├── mock.js               # Enums: cursos, anos, turmas, bimestres
        │   ├── store.js              # Utilitários compartilhados (fmtDataBR)
        │   └── api.js                # Cliente de API (fetch para o backend)
        └── screens/
            ├── Login.jsx
            ├── Misc.jsx
            ├── professor/
            │   ├── Inicio.jsx
            │   ├── NovaAvaliacao.jsx
            │   ├── GerenciarFichas.jsx
            │   └── Dashboard.jsx
            ├── aluno/
            │   ├── MeuGrupo.jsx
            │   └── HistoricoAvaliacoes.jsx
            └── coordenador/
                ├── Materias.jsx
                └── Professores.jsx
```

---

## Fluxo de uso recomendado

```
1. Login como Coordenador
   → Cadastrar matérias
   → Cadastrar professores (atribuindo matérias)

2. Login como Aluno
   → Criar grupo → escolher matéria → adicionar integrantes

3. Login como Professor
   → Nova Ficha → selecionar grupo → preencher avaliação → publicar
```

---

## Personalização visual

Qualquer usuário pode customizar a aparência pelo painel de tweaks:

- **Cor de destaque**
- **Fonte da interface**: Roboto, Figtree, Manrope ou Plus Jakarta Sans
- **Arredondamento dos cards**

---

## Autor

Projeto escolar — Colégio Univap  
Desenvolvido com React puro (sem build system) para fins de aprendizado e demonstração.
