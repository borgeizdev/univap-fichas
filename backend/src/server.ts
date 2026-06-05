import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { Pool, PoolClient } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'univap_fichas',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASS     || 'Mateus2009#',
});

/* ── Types ───────────────────────────────────────────────────────────────── */
interface UsuarioRow {
  id:       number;
  email:    string;
  senha:    string;
  nome:     string;
  role:     'coordenador' | 'professor' | 'aluno';
  materias: string[];
}

interface GrupoRow {
  id:            string;
  nome:          string;
  curso:         string;
  ano:           string;
  turma:         string;
  materia:       string | null;
  criador_email: string;
  integrantes:   IntegranteItem[];
}

interface IntegranteItem {
  nome:      string;
  matricula: string;
  lider:     boolean;
}

interface AvaliacaoRow {
  id:              string;
  grupo_nome:      string;
  criador_email:   string | null;
  professor_email: string;
  professor_nome:  string;
  disciplina:      string;
  nota:            string | null;
  anotacoes:       string;
  positivos:       string;
  melhorar:        string;
  data:            Date | string;
  status:          string;
  integrantes_aval: IntegranteAvalItem[];
}

interface IntegranteAvalItem {
  nome:      string;
  matricula: string;
  nota:      string | null;
  obs:       string;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmtUsuario = (row: UsuarioRow) => ({
  id:       row.id,
  email:    row.email,
  nome:     row.nome,
  role:     row.role,
  materias: row.materias || [],
});

/* ── Auth ────────────────────────────────────────────────────────────────── */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body as { email: unknown; senha: unknown };
    if (typeof email !== 'string' || typeof senha !== 'string') {
      return res.status(400).json({ error: 'email e senha são obrigatórios.' });
    }
    const { rows } = await pool.query<UsuarioRow>(
      'SELECT * FROM usuarios WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciais inválidas.' });
    const u = rows[0];
    const ok = await bcrypt.compare(senha, u.senha);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas.' });
    res.json(fmtUsuario(u));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ── Grupos ──────────────────────────────────────────────────────────────── */
app.get('/api/grupos', async (_req: Request, res: Response) => {
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
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);
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

app.post('/api/grupos', async (req: Request, res: Response) => {
  const client: PoolClient = await pool.connect();
  try {
    const { id, nome, curso, ano, turma, materia, criadorEmail, integrantes = [] } =
      req.body as {
        id: string; nome: string; curso: string; ano: string; turma: string;
        materia?: string; criadorEmail: string; integrantes?: IntegranteItem[];
      };
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO grupos (id, nome, curso, ano, turma, materia, criador_email) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, nome, curso, ano, turma, materia || null, criadorEmail]
    );
    for (const m of integrantes) {
      await client.query(
        'INSERT INTO integrantes (grupo_id, nome, matricula, lider) VALUES ($1,$2,$3,$4)',
        [id, m.nome, m.matricula, !!m.lider]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ id });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: (e as Error).message });
  } finally {
    client.release();
  }
});

app.put('/api/grupos/:id', async (req: Request, res: Response) => {
  const client: PoolClient = await pool.connect();
  try {
    const { nome, curso, ano, turma, materia, integrantes = [] } =
      req.body as {
        nome: string; curso: string; ano: string; turma: string;
        materia?: string; integrantes?: IntegranteItem[];
      };
    await client.query('BEGIN');
    await client.query(
      'UPDATE grupos SET nome=$1, curso=$2, ano=$3, turma=$4, materia=$5 WHERE id=$6',
      [nome, curso, ano, turma, materia || null, req.params.id]
    );
    await client.query('DELETE FROM integrantes WHERE grupo_id=$1', [req.params.id]);
    for (const m of integrantes) {
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

app.delete('/api/grupos/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM grupos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ── Disciplinas ─────────────────────────────────────────────────────────── */
app.get('/api/disciplinas', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM disciplinas ORDER BY curso, nome');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/api/disciplinas', async (req: Request, res: Response) => {
  try {
    const { nome, curso } = req.body as { nome: string; curso: string };
    const { rows } = await pool.query(
      'INSERT INTO disciplinas (nome, curso) VALUES ($1,$2) RETURNING *',
      [nome, curso]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    const err = e as NodeJS.ErrnoException & { code?: string };
    if (err.code === '23505') return res.status(409).json({ error: 'Matéria já cadastrada para este curso.' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/disciplinas/:id', async (req: Request, res: Response) => {
  try {
    const { nome, curso } = req.body as { nome: string; curso: string };
    await pool.query('UPDATE disciplinas SET nome=$1, curso=$2 WHERE id=$3', [nome, curso, req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    const err = e as NodeJS.ErrnoException & { code?: string };
    if (err.code === '23505') return res.status(409).json({ error: 'Matéria já cadastrada para este curso.' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/disciplinas/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM disciplinas WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ── Avaliações ──────────────────────────────────────────────────────────── */
app.get('/api/avaliacoes', async (_req: Request, res: Response) => {
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
      GROUP BY a.id
      ORDER BY a.data DESC, a.created_at DESC
    `);
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

app.post('/api/avaliacoes', async (req: Request, res: Response) => {
  const client: PoolClient = await pool.connect();
  try {
    const {
      id, grupoNome, criadorEmail, professorEmail, professorNome,
      disciplina, nota, anotacoes, positivos, melhorar, integrantesAval = [], data, status,
    } = req.body as {
      id: string; grupoNome: string; criadorEmail?: string;
      professorEmail: string; professorNome: string; disciplina: string;
      nota?: number | null; anotacoes?: string; positivos?: string; melhorar?: string;
      integrantesAval?: IntegranteAvalItem[]; data: string; status?: string;
    };
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO avaliacoes
         (id, grupo_nome, criador_email, professor_email, professor_nome,
          disciplina, nota, anotacoes, positivos, melhorar, data, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [id, grupoNome, criadorEmail || null, professorEmail, professorNome,
       disciplina, nota ?? null, anotacoes || '', positivos || '', melhorar || '',
       data, status || 'Publicada']
    );
    for (const m of integrantesAval) {
      await client.query(
        'INSERT INTO integrantes_aval (avaliacao_id, nome, matricula, nota, obs) VALUES ($1,$2,$3,$4,$5)',
        [id, m.nome, m.matricula, m.nota ?? null, m.obs || '']
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ id });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: (e as Error).message });
  } finally {
    client.release();
  }
});

/* ── Professores ─────────────────────────────────────────────────────────── */
app.get('/api/professores', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query<UsuarioRow>(
      "SELECT id, email, nome, materias FROM usuarios WHERE role='professor' ORDER BY nome"
    );
    res.json(rows.map(p => ({ id: p.id, nome: p.nome, email: p.email, materias: p.materias || [] })));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/api/professores', async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, materias = [] } =
      req.body as { nome: string; email: string; senha: string; materias?: string[] };
    const hash = await bcrypt.hash(senha, 10);
    const { rows } = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, role, materias) VALUES ($1,$2,$3,'professor',$4) RETURNING id",
      [nome.trim(), email.toLowerCase().trim(), hash, materias]
    );
    res.status(201).json({ id: rows[0].id, nome: nome.trim(), email: email.toLowerCase().trim(), materias });
  } catch (e) {
    const err = e as NodeJS.ErrnoException & { code?: string };
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe um professor com este e-mail.' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/professores/:id', async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, materias = [] } =
      req.body as { nome: string; email: string; senha?: string; materias?: string[] };
    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      await pool.query(
        'UPDATE usuarios SET nome=$1, email=$2, senha=$3, materias=$4 WHERE id=$5',
        [nome.trim(), email.toLowerCase().trim(), hash, materias, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nome=$1, email=$2, materias=$3 WHERE id=$4',
        [nome.trim(), email.toLowerCase().trim(), materias, req.params.id]
      );
    }
    res.json({ ok: true });
  } catch (e) {
    const err = e as NodeJS.ErrnoException & { code?: string };
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe um professor com este e-mail.' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/professores/:id', async (req: Request, res: Response) => {
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
