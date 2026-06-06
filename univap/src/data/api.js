/* Univap Fichas — cliente de API */
const API_BASE = "http://localhost:3001/api";
const TOKEN_KEY = "univap_token";

async function _req(method, path, body) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const r = await fetch(API_BASE + path, opts);

  if (r.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent("univap:401"));
  }

  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || r.statusText);
  }
  return r.json();
}

const _get = (p)     => _req("GET",    p);
const _post = (p, b) => _req("POST",   p, b);
const _put  = (p, b) => _req("PUT",    p, b);
const _del  = (p)    => _req("DELETE", p);

/* Auth */
const apiLogin = async (login, senha) => {
  const data = await _post("/auth/login", { login, senha });
  if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};
const apiLogout = () => localStorage.removeItem(TOKEN_KEY);
const apiTrocarSenha = (novaSenha) => _put("/auth/trocar-senha", { novaSenha });

/* Grupos */
const apiGetGrupos   = ()       => _get("/grupos");
const apiCreateGrupo = (g)      => _post("/grupos", g);
const apiUpdateGrupo = (id, g)  => _put("/grupos/" + id, g);
const apiDeleteGrupo = (id)     => _del("/grupos/" + id);

/* Disciplinas */
const apiGetDiscs   = ()       => _get("/disciplinas");
const apiCreateDisc = (d)      => _post("/disciplinas", d);
const apiUpdateDisc = (id, d)  => _put("/disciplinas/" + id, d);
const apiDeleteDisc = (id)     => _del("/disciplinas/" + id);

/* Avaliações */
const apiGetAvals   = ()       => _get("/avaliacoes");
const apiCreateAval = (a)      => _post("/avaliacoes", a);
const apiUpdateAval = (id, a)  => _put("/avaliacoes/" + id, a);
const apiDeleteAval = (id)     => _del("/avaliacoes/" + id);

/* Professores */
const apiGetProfs   = ()       => _get("/professores");
const apiCreateProf = (p)      => _post("/professores", p);
const apiUpdateProf = (id, p)  => _put("/professores/" + id, p);
const apiDeleteProf = (id)     => _del("/professores/" + id);
