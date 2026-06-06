-- Univap Fichas — Schema PostgreSQL
-- Execute: psql -U postgres -d univap_fichas -f schema.sql

CREATE TABLE IF NOT EXISTS usuarios (
  id       SERIAL PRIMARY KEY,
  email    TEXT UNIQUE NOT NULL,
  senha    TEXT NOT NULL,
  nome     TEXT NOT NULL,
  role     TEXT NOT NULL CHECK (role IN ('coordenador', 'professor', 'aluno')),
  materias  TEXT[] DEFAULT '{}',
  matricula TEXT
);

CREATE TABLE IF NOT EXISTS disciplinas (
  id    SERIAL PRIMARY KEY,
  nome  TEXT NOT NULL,
  curso TEXT NOT NULL,
  UNIQUE (nome, curso)
);

CREATE TABLE IF NOT EXISTS grupos (
  id            TEXT PRIMARY KEY,
  nome          TEXT NOT NULL,
  curso         TEXT NOT NULL,
  ano           TEXT NOT NULL,
  turma         TEXT NOT NULL,
  materia       TEXT,
  criador_email TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrantes (
  id        SERIAL PRIMARY KEY,
  grupo_id  TEXT REFERENCES grupos(id) ON DELETE CASCADE,
  nome      TEXT NOT NULL,
  matricula TEXT NOT NULL,
  lider     BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS avaliacoes (
  id              TEXT PRIMARY KEY,
  grupo_nome      TEXT NOT NULL,
  criador_email   TEXT,
  professor_email TEXT NOT NULL,
  professor_nome  TEXT NOT NULL,
  disciplina      TEXT NOT NULL,
  nota            NUMERIC(4,1),
  anotacoes       TEXT,
  positivos       TEXT,
  melhorar        TEXT,
  data            DATE NOT NULL,
  status          TEXT DEFAULT 'Publicada',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrantes_aval (
  id           SERIAL PRIMARY KEY,
  avaliacao_id TEXT REFERENCES avaliacoes(id) ON DELETE CASCADE,
  nome         TEXT NOT NULL,
  matricula    TEXT NOT NULL,
  nota         NUMERIC(4,1),
  obs          TEXT DEFAULT ''
);
