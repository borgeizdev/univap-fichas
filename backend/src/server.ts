import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import { Pool, PoolClient } from 'pg';
import { signToken, verifyToken, requireRole } from './middleware/auth';
import {
  validate,
  LoginSchema,
  GrupoCreateSchema,
  GrupoUpdateSchema,
  DisciplinaSchema,
  AvaliacaoCreateSchema,
  AvaliacaoUpdateSchema,
  ProfessorCreateSchema,
  ProfessorUpdateSchema,
} from './schemas';

/* ── Env validation ──────────────────────────────────────────────────────── */
const REQUIRED_ENV = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER'] as const;
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Variáveis de ambiente ausentes: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();
app.use(cors({ origin: (origin, cb) => cb(null, !origin || origin.startsWith('http://localhost')) }));
app.use(express.json());

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS || '',
});

/* ── Types ───────────────────────────────────────────────────────────────── */
interface UsuarioRow {
  id:           number;
  email:        string;
  senha:        string;
  nome:         string;
  role:         'coordenador' | 'professor' | 'aluno';
  materias:     string[];
  matricula:    string | null;
  trocar_senha: boolean;
}

interface GrupoRow {
  id:            string;
  nome:          string;
  curso:         string;
  ano:           string;
  turma:         string;
  materia:       string | null;
  criador_email: string;
  integrantes:   { nome: string; matricula: string; lider: boolean }[];
}

interface AvaliacaoRow {
  id:               string;
  grupo_nome:       string;
  criador_email:    string | null;
  professor_email:  string;
  professor_nome:   string;
  disciplina:       string;
  nota:             string | null;
  anotacoes:        string;
  positivos:        string;
  melhorar:         string;
  data:             Date | string;
  status:           string;
  integrantes_aval: { nome: string; matricula: string; nota: string | null; obs: string }[];
}

type PgError = Error & { code?: string };

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmtUsuario = (row: UsuarioRow) => ({
  id:           row.id,
  email:        row.email,
  nome:         row.nome,
  role:         row.role,
  materias:     row.materias || [],
  matricula:    row.matricula || null,
  trocar_senha: row.trocar_senha ?? false,
});

/* ══════════════════════════════════════════════════════════════════════════
   PUBLIC ROUTES  (sem token)
══════════════════════════════════════════════════════════════════════════ */

/* ── Health ──────────────────────────────────────────────────────────────── */
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

/* ── Auth ────────────────────────────────────────────────────────────────── */
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

app.post('/api/auth/login', loginLimiter, async (req: Request, res: Response) => {
  const body = validate(LoginSchema, req.body, res);
  if (!body) return;
  try {
    const isEmail = body.login.includes('@');
    const { rows } = await pool.query<UsuarioRow>(
      isEmail
        ? 'SELECT * FROM usuarios WHERE email = $1'
        : 'SELECT * FROM usuarios WHERE matricula = $1',
      [isEmail ? body.login.toLowerCase() : body.login]
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciais inválidas.' });
    const u = rows[0];
    const ok = await bcrypt.compare(body.senha, u.senha);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas.' });
    const token = signToken({ id: u.id, email: u.email, role: u.role, nome: u.nome, matricula: u.matricula || null, trocar_senha: u.trocar_senha ?? false });
    res.json({ ...fmtUsuario(u), token });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.put('/api/auth/trocar-senha', verifyToken, async (req: Request, res: Response) => {
  const { novaSenha } = req.body;
  if (!novaSenha || typeof novaSenha !== 'string' || novaSenha.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }
  try {
    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query(
      'UPDATE usuarios SET senha = $1, trocar_senha = FALSE WHERE id = $2',
      [hash, req.user!.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   PROTECTED ROUTES  (verifyToken em todas abaixo)
══════════════════════════════════════════════════════════════════════════ */

/* ── Me ──────────────────────────────────────────────────────────────────── */
app.get('/api/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query<UsuarioRow>(
      'SELECT * FROM usuarios WHERE id = $1', [req.user!.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(fmtUsuario(rows[0]));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ── Grupos  (GET: qualquer role | POST/PUT/DELETE: aluno) ───────────────── */
app.get('/api/grupos', verifyToken, async (req: Request, res: Response) => {
  const { role, email, matricula } = req.user!;
  const isAluno = role === 'aluno';
  try {
    const { rows } = await pool.query<GrupoRow>(`
      SELECT g.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'nome',      i.nome,
              'matricula', i.matricula,
              'lider',     i.lider
            ) ORDER BY i.lider DESC, i.id
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::JSON
        ) AS integrantes
      FROM grupos g
      LEFT JOIN integrantes i ON i.grupo_id = g.id
      ${isAluno ? `WHERE g.criador_email = $1 OR EXISTS (
        SELECT 1 FROM integrantes im WHERE im.grupo_id = g.id AND im.matricula = $2
      )` : ''}
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `, isAluno ? [email, matricula ?? ''] : []);
    res.json(rows.map(g => ({
      id:           g.id,
      nome:         g.nome,
      curso:        g.curso,
      ano:          g.ano,
      turma:        g.turma,
      materia:      g.materia,
      criadorEmail: g.criador_email,
      integrantes:  g.integrantes,
    })));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/api/grupos', verifyToken, requireRole('aluno'), async (req: Request, res: Response) => {
  const body = validate(GrupoCreateSchema, req.body, res);
  if (!body) return;
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO grupos (id, nome, curso, ano, turma, materia, criador_email) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [body.id, body.nome, body.curso, body.ano, body.turma, body.materia ?? null, body.criadorEmail]
    );
    for (const m of body.integrantes) {
      await client.query(
        'INSERT INTO integrantes (grupo_id, nome, matricula, lider) VALUES ($1,$2,$3,$4)',
        [body.id, m.nome, m.matricula, !!m.lider]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ id: body.id });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: (e as Error).message });
  } finally {
    client.release();
  }
});

app.put('/api/grupos/:id', verifyToken, requireRole('aluno'), async (req: Request, res: Response) => {
  const body = validate(GrupoUpdateSchema, req.body, res);
  if (!body) return;
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: ownG } = await client.query<{ criador_email: string }>(
      'SELECT criador_email FROM grupos WHERE id=$1', [req.params.id]
    );
    if (!ownG.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Grupo não encontrado.' });
    }
    if (ownG[0].criador_email !== req.user!.email) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Sem permissão.' });
    }
    await client.query(
      'UPDATE grupos SET nome=$1, curso=$2, ano=$3, turma=$4, materia=$5 WHERE id=$6',
      [body.nome, body.curso, body.ano, body.turma, body.materia ?? null, req.params.id]
    );
    await client.query('DELETE FROM integrantes WHERE grupo_id=$1', [req.params.id]);
    for (const m of body.integrantes) {
      await client.query(
        'INSERT INTO integrantes (grupo_id, nome, matricula, lider) VALUES ($1,$2,$3,$4)',
        [req.params.id, m.nome, m.matricula, !!m.lider]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: (e as Error).message });
  } finally {
    client.release();
  }
});

app.delete('/api/grupos/:id', verifyToken, requireRole('aluno'), async (req: Request, res: Response) => {
  try {
    const { rows: own } = await pool.query<{ criador_email: string }>(
      'SELECT criador_email FROM grupos WHERE id=$1', [req.params.id]
    );
    if (!own.length) return res.status(404).json({ error: 'Grupo não encontrado.' });
    if (own[0].criador_email !== req.user!.email) return res.status(403).json({ error: 'Sem permissão.' });
    await pool.query('DELETE FROM grupos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ── Disciplinas  (GET: qualquer role | POST/PUT/DELETE: coordenador) ─────── */
app.get('/api/disciplinas', verifyToken, async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM disciplinas ORDER BY curso, nome');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/api/disciplinas', verifyToken, requireRole('coordenador'), async (req: Request, res: Response) => {
  const body = validate(DisciplinaSchema, req.body, res);
  if (!body) return;
  try {
    const { rows } = await pool.query(
      'INSERT INTO disciplinas (nome, curso) VALUES ($1,$2) RETURNING *',
      [body.nome, body.curso]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    const err = e as PgError;
    if (err.code === '23505') return res.status(409).json({ error: 'Matéria já cadastrada para este curso.' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/disciplinas/:id', verifyToken, requireRole('coordenador'), async (req: Request, res: Response) => {
  const body = validate(DisciplinaSchema, req.body, res);
  if (!body) return;
  try {
    await pool.query('UPDATE disciplinas SET nome=$1, curso=$2 WHERE id=$3', [body.nome, body.curso, req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    const err = e as PgError;
    if (err.code === '23505') return res.status(409).json({ error: 'Matéria já cadastrada para este curso.' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/disciplinas/:id', verifyToken, requireRole('coordenador'), async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM disciplinas WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ── Avaliações  (GET: qualquer role | POST: professor) ──────────────────── */
app.get('/api/avaliacoes', verifyToken, async (req: Request, res: Response) => {
  const { professor, disciplina, de, ate } = req.query as Record<string, string | undefined>;
  const params: (string)[] = [];
  const conditions: string[] = [];

  if (professor)   { params.push(professor);   conditions.push(`a.professor_email = $${params.length}`); }
  if (disciplina)  { params.push(disciplina);  conditions.push(`a.disciplina = $${params.length}`); }
  if (de)          { params.push(de);          conditions.push(`a.data >= $${params.length}`); }
  if (ate)         { params.push(ate);         conditions.push(`a.data <= $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const { rows } = await pool.query<AvaliacaoRow>(`
      SELECT a.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'nome',      ia.nome,
              'matricula', ia.matricula,
              'nota',      ia.nota,
              'obs',       COALESCE(ia.obs, '')
            ) ORDER BY ia.id
          ) FILTER (WHERE ia.id IS NOT NULL),
          '[]'::JSON
        ) AS integrantes_aval
      FROM avaliacoes a
      LEFT JOIN integrantes_aval ia ON ia.avaliacao_id = a.id
      ${where}
      GROUP BY a.id
      ORDER BY a.data DESC, a.created_at DESC
    `, params);
    res.json(rows.map(a => ({
      id:              a.id,
      grupoNome:       a.grupo_nome,
      criadorEmail:    a.criador_email || '',
      professorEmail:  a.professor_email,
      professorNome:   a.professor_nome,
      disciplina:      a.disciplina,
      nota:            a.nota != null ? parseFloat(a.nota) : null,
      anotacoes:       a.anotacoes || '',
      positivos:       a.positivos || '',
      melhorar:        a.melhorar  || '',
      data:            a.data instanceof Date
                         ? a.data.toISOString().split('T')[0]
                         : String(a.data).split('T')[0],
      status:          a.status,
      integrantesAval: (a.integrantes_aval || []).map(i => ({
        nome:      i.nome,
        matricula: i.matricula,
        nota:      i.nota != null ? parseFloat(i.nota) : null,
        obs:       i.obs || '',
      })),
    })));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/api/avaliacoes', verifyToken, requireRole('professor'), async (req: Request, res: Response) => {
  const body = validate(AvaliacaoCreateSchema, req.body, res);
  if (!body) return;
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO avaliacoes
         (id, grupo_nome, criador_email, professor_email, professor_nome,
          disciplina, nota, anotacoes, positivos, melhorar, data, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [body.id, body.grupoNome, body.criadorEmail ?? null, body.professorEmail, body.professorNome,
       body.disciplina, body.nota ?? null, body.anotacoes, body.positivos, body.melhorar,
       body.data, body.status]
    );
    for (const m of body.integrantesAval) {
      await client.query(
        'INSERT INTO integrantes_aval (avaliacao_id, nome, matricula, nota, obs) VALUES ($1,$2,$3,$4,$5)',
        [body.id, m.nome, m.matricula, m.nota ?? null, m.obs]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ id: body.id });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: (e as Error).message });
  } finally {
    client.release();
  }
});

app.put('/api/avaliacoes/:id', verifyToken, requireRole('professor'), async (req: Request, res: Response) => {
  const body = validate(AvaliacaoUpdateSchema, req.body, res);
  if (!body) return;
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: ownA } = await client.query<{ professor_email: string }>(
      'SELECT professor_email FROM avaliacoes WHERE id=$1', [req.params.id]
    );
    if (!ownA.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }
    if (ownA[0].professor_email !== req.user!.email) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Sem permissão.' });
    }
    await client.query(
      `UPDATE avaliacoes SET
         grupo_nome=$1, criador_email=$2, professor_email=$3, professor_nome=$4,
         disciplina=$5, nota=$6, anotacoes=$7, positivos=$8, melhorar=$9, data=$10, status=$11
       WHERE id=$12`,
      [body.grupoNome, body.criadorEmail ?? null, body.professorEmail, body.professorNome,
       body.disciplina, body.nota ?? null, body.anotacoes, body.positivos, body.melhorar,
       body.data, body.status, req.params.id]
    );
    await client.query('DELETE FROM integrantes_aval WHERE avaliacao_id=$1', [req.params.id]);
    for (const m of body.integrantesAval) {
      await client.query(
        'INSERT INTO integrantes_aval (avaliacao_id, nome, matricula, nota, obs) VALUES ($1,$2,$3,$4,$5)',
        [req.params.id, m.nome, m.matricula, m.nota ?? null, m.obs]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: (e as Error).message });
  } finally {
    client.release();
  }
});

app.delete('/api/avaliacoes/:id', verifyToken, requireRole('professor'), async (req: Request, res: Response) => {
  try {
    const { rows: own } = await pool.query<{ professor_email: string }>(
      'SELECT professor_email FROM avaliacoes WHERE id=$1', [req.params.id]
    );
    if (!own.length) return res.status(404).json({ error: 'Avaliação não encontrada.' });
    if (own[0].professor_email !== req.user!.email) return res.status(403).json({ error: 'Sem permissão.' });
    await pool.query('DELETE FROM avaliacoes WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ── Professores  (GET: coordenador | POST/PUT/DELETE: coordenador) ──────── */
app.get('/api/professores', verifyToken, requireRole('coordenador'), async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query<UsuarioRow>(
      "SELECT id, email, nome, materias FROM usuarios WHERE role='professor' ORDER BY nome"
    );
    res.json(rows.map(p => ({ id: p.id, nome: p.nome, email: p.email, materias: p.materias || [] })));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/api/professores', verifyToken, requireRole('coordenador'), async (req: Request, res: Response) => {
  const body = validate(ProfessorCreateSchema, req.body, res);
  if (!body) return;
  try {
    const hash = await bcrypt.hash(body.senha, 10);
    const { rows } = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, role, materias) VALUES ($1,$2,$3,'professor',$4) RETURNING id",
      [body.nome, body.email, hash, body.materias]
    );
    res.status(201).json({ id: rows[0].id, nome: body.nome, email: body.email, materias: body.materias });
  } catch (e) {
    const err = e as PgError;
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe um professor com este e-mail.' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/professores/:id', verifyToken, requireRole('coordenador'), async (req: Request, res: Response) => {
  const body = validate(ProfessorUpdateSchema, req.body, res);
  if (!body) return;
  try {
    if (body.senha) {
      const hash = await bcrypt.hash(body.senha, 10);
      await pool.query(
        'UPDATE usuarios SET nome=$1, email=$2, senha=$3, materias=$4 WHERE id=$5',
        [body.nome, body.email, hash, body.materias, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nome=$1, email=$2, materias=$3 WHERE id=$4',
        [body.nome, body.email, body.materias, req.params.id]
      );
    }
    res.json({ ok: true });
  } catch (e) {
    const err = e as PgError;
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe um professor com este e-mail.' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/professores/:id', verifyToken, requireRole('coordenador'), async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM usuarios WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ── Start ───────────────────────────────────────────────────────────────── */
const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
