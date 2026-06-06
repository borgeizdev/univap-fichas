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
  const guiNasc     = process.env.SEED_GUI_NASC;
  const mateusNasc  = process.env.SEED_MATEUS_NASC;
  const miguelNasc  = process.env.SEED_MIGUEL_NASC;
  if (!coordSenha || !guiNasc || !mateusNasc || !miguelNasc) {
    throw new Error('Defina SEED_COORD_PASS, SEED_GUI_NASC, SEED_MATEUS_NASC e SEED_MIGUEL_NASC no .env antes de rodar o seed.');
  }

  const coordHash  = await bcrypt.hash(coordSenha, 10);
  const guiHash    = await bcrypt.hash(guiNasc,    10);
  const mateusHash = await bcrypt.hash(mateusNasc, 10);
  const miguelHash = await bcrypt.hash(miguelNasc, 10);

  await pool.query(`
    INSERT INTO usuarios (email, senha, nome, role, matricula, trocar_senha) VALUES
      ('coord@univap.com',  $1, 'Coord. Técnico',  'coordenador', NULL,       FALSE),
      ('gui@univap.com',    $2, 'Guilherme Souza', 'aluno',       '50240609', TRUE),
      ('mateus@univap.com', $3, 'Mateus Ricardo',  'aluno',       '50240363', TRUE),
      ('miguel@univap.com', $4, 'Miguel',          'aluno',       '50240397', TRUE)
    ON CONFLICT (email) DO UPDATE SET
      senha        = EXCLUDED.senha,
      matricula    = EXCLUDED.matricula,
      trocar_senha = EXCLUDED.trocar_senha
  `, [coordHash, guiHash, mateusHash, miguelHash]);

  console.log('Seed concluído! Usuários padrão criados.');
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
