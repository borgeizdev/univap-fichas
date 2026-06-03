/* Univap Fichas — Login */
const USERS = {
  "coord@univap.com": { senha: "123coord", role: "coordenador", nome: "Coord. Técnico" },
  "gui@univap.com":   { senha: "123aluno", role: "aluno",       nome: "Guilherme Souza" },
};

function Login({ onLogin, dark, onToggleTheme }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    const key = email.trim().toLowerCase();
    const base = USERS[key];
    if (base && base.senha === senha) {
      onLogin(base.role, key, base.nome);
      return;
    }
    const dynProf = loadProfessores().find(p => p.email === key);
    if (dynProf && dynProf.senha === senha) {
      onLogin("professor", key, dynProf.nome);
      return;
    }
    setError("E-mail ou senha incorretos.");
  };

  return (
    <div className="uv-login">
      <form className="uv-login-card uv-anim-up" onSubmit={submit}>
        <button type="button" className="uv-login-theme-btn" onClick={onToggleTheme} title={dark ? "Tema claro" : "Tema escuro"}>
          <Icon name={dark ? "sun" : "moon"} size={16} />
        </button>
        <div className="uv-login-brand">
          <img src={dark ? "assets/images/univap-sidebar.png" : "assets/images/univap-login.png"} alt="UniVap" className="uv-login-logo" />
          <p className="uv-login-sub">Sistema de Avaliação Acadêmica</p>
        </div>

        <Field label="E-mail">
          <Input type="email" icon="user" placeholder="ex: coord@univap.com"
            value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </Field>
        <Field label="Senha">
          <PasswordInput placeholder="••••••••" value={senha}
            onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
        </Field>

        {error && <p className="uv-login-error">{error}</p>}

        <Button type="submit" className="uv-w-full" size="lg">Entrar</Button>
        <a className="uv-login-forgot" href="#" onClick={(e) => e.preventDefault()}>Esqueceu sua senha?</a>

        <p className="uv-login-hint">
          Demo — coord: coord@univap.com / 123coord · aluno: gui@univap.com / 123aluno
          · professores são criados pelo coordenador
        </p>
      </form>
      <p className="uv-login-foot">© 2026 Univap — Todos os direitos reservados.</p>
    </div>
  );
}
window.Login = Login;
