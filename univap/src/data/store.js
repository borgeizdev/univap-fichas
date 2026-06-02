/* Univap Fichas — store centralizado (localStorage) */
const LS_GRUPOS      = "univap_grupos_v1";
const LS_DISC        = "univap_disciplinas_v1";
const LS_AVALIACOES  = "univap_avaliacoes_v1";
const LS_PROFESSORES = "univap_professores_v1";

function loadGrupos()       { try { return JSON.parse(localStorage.getItem(LS_GRUPOS))      || []; } catch { return []; } }
function saveGrupos(v)      { try { localStorage.setItem(LS_GRUPOS, JSON.stringify(v));      } catch {} }

function loadDisciplinas()  { try { return JSON.parse(localStorage.getItem(LS_DISC))        || []; } catch { return []; } }
function saveDisciplinas(v) { try { localStorage.setItem(LS_DISC, JSON.stringify(v));        } catch {} }

function loadAvaliacoes()   { try { return JSON.parse(localStorage.getItem(LS_AVALIACOES))  || []; } catch { return []; } }
function saveAvaliacoes(v)  { try { localStorage.setItem(LS_AVALIACOES, JSON.stringify(v)); } catch {} }

function loadProfessores()  { try { return JSON.parse(localStorage.getItem(LS_PROFESSORES)) || []; } catch { return []; } }
function saveProfessores(v) { try { localStorage.setItem(LS_PROFESSORES, JSON.stringify(v));} catch {} }

/* matérias atribuídas ao professor; null = professor padrão (acesso a tudo) */
function getProfMaterias(email) {
  const p = loadProfessores().find(p => p.email === email);
  return p ? p.materias : null;
}

function fmtDataBR(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
