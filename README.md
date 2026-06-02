# Univap Fichas

Sistema de avaliação acadêmica desenvolvido como projeto escolar para o Colégio Univap. Permite que professores avaliem grupos de alunos por disciplina, com painéis distintos para cada perfil de usuário.

---

## Tecnologias

- **React 18** (via CDN — sem bundler/build tool)
- **Babel Standalone** — transpila JSX diretamente no browser
- **LocalStorage** — persistência de dados no cliente
- **CSS puro** — estilização sem frameworks externos
- **Google Fonts** — Roboto, Figtree, Manrope, Plus Jakarta Sans

> Não precisa de Node.js, npm ou qualquer instalação. Basta abrir o `index.html` no browser.

---

## Como rodar

1. Clone ou baixe o repositório
2. Abra o arquivo `univap/index.html` diretamente no navegador

```
Projeto Escola/
└── univap/
    └── index.html   ← abra este arquivo
```

> **Dica:** Use a extensão **Live Server** no VS Code para evitar problemas com CORS ao carregar os arquivos `.jsx` via script.

---

## Contas de acesso

| Perfil       | E-mail                 | Senha       |
|--------------|------------------------|-------------|
| Coordenador  | coord@univap.com       | 123coord    |
| Aluno        | gui@univap.com         | 123aluno    |
| Professor    | criado pelo coordenador | definida no cadastro |

---

## Funcionalidades por perfil

### Coordenador
- Cadastrar e gerenciar **matérias**
- Cadastrar e gerenciar **professores**, atribuindo matérias a cada um
- Professores criados recebem e-mail e senha definidos no momento do cadastro

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
univap/
├── index.html                        # Entry point — carrega todos os scripts em ordem
├── assets/
│   └── images/                       # Imagens do projeto
├── styles/
│   └── main.css                      # Estilos globais
└── src/
    ├── App.jsx                       # Raiz da aplicação — autenticação e roteamento
    ├── components/
    │   ├── Icon.jsx                  # Ícones SVG
    │   ├── UI.jsx                    # Componentes reutilizáveis (Button, Card, Badge, Input…)
    │   ├── Layout.jsx                # AppShell, Sidebar e Header
    │   └── TweaksPanel.jsx           # Painel de personalização visual
    ├── data/
    │   ├── mock.js                   # Enums: cursos, anos, turmas, bimestres
    │   └── store.js                  # Funções de leitura/escrita no LocalStorage
    └── screens/
        ├── Login.jsx                 # Tela de login
        ├── Misc.jsx                  # Modal de visualização de ficha, ComingSoon
        ├── professor/
        │   ├── Inicio.jsx            # Home do professor
        │   ├── NovaAvaliacao.jsx     # Formulário de nova avaliação
        │   ├── GerenciarFichas.jsx   # Tabela de fichas com filtros
        │   └── Dashboard.jsx         # Dashboard com gráficos
        ├── aluno/
        │   ├── MeuGrupo.jsx          # Criação e gerenciamento de grupos
        │   └── HistoricoAvaliacoes.jsx # Histórico de avaliações do aluno
        └── coordenador/
            ├── Materias.jsx          # CRUD de matérias
            └── Professores.jsx       # CRUD de professores
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

O professor pode customizar a aparência do sistema pelo painel de tweaks:

- **Tema da sidebar**: Solid, Deep, Gradient ou Light
- **Cor de destaque**: escolha livre
- **Fonte da interface**: Roboto, Figtree, Manrope ou Plus Jakarta Sans
- **Arredondamento dos cards**: de quadrado a arredondado

As preferências são salvas automaticamente no LocalStorage.

---

## Autor

Projeto escolar — Colégio Univap  
Desenvolvido com React puro (sem build system) para fins de aprendizado e demonstração.
