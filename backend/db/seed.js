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
  const coordHash = await bcrypt.hash('123coord', 10);
  const alunoHash = await bcrypt.hash('123aluno', 10);

  await pool.query(`
    INSERT INTO usuarios (email, senha, nome, role) VALUES
      ('coord@univap.com', $1, 'Coord. Técnico',  'coordenador'),
      ('gui@univap.com',   $2, 'Guilherme Souza', 'aluno')
    ON CONFLICT (email) DO NOTHING
  `, [coordHash, alunoHash]);

  console.log('Seed concluído! Usuários padrão criados.');
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
