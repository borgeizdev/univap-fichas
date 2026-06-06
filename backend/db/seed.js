/* Seed inicial: cria usuários padrão (coordenador e aluno demo) */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'univap_fichas',
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
});

async function seed() {
  const coordSenha  = process.env.SEED_COORD_PASS;
  const alunoSenha  = process.env.SEED_ALUNO_PASS;
  const mateusSenha = process.env.SEED_MATEUS_PASS;
  if (!coordSenha || !alunoSenha || !mateusSenha) {
    throw new Error('Defina SEED_COORD_PASS, SEED_ALUNO_PASS e SEED_MATEUS_PASS no .env antes de rodar o seed.');
  }

  const coordHash  = await bcrypt.hash(coordSenha,  10);
  const alunoHash  = await bcrypt.hash(alunoSenha,  10);
  const mateusHash = await bcrypt.hash(mateusSenha, 10);

  await pool.query(`
    INSERT INTO usuarios (email, senha, nome, role, matricula) VALUES
      ('coord@univap.com',  $1, 'Coord. Técnico',  'coordenador', NULL),
      ('gui@univap.com',    $2, 'Guilherme Souza', 'aluno',       '50240001'),
      ('mateus@univap.com', $3, 'Mateus Ricardo',  'aluno',       '50240609')
    ON CONFLICT (email) DO UPDATE SET matricula = EXCLUDED.matricula
  `, [coordHash, alunoHash, mateusHash]);

  console.log('Seed concluído! Usuários padrão criados.');
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
