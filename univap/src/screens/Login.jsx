/* Univap Fichas — Login */
function Login({ onLogin, dark, onToggleTheme }) {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await apiLogin(login.trim(), senha);
      onLogin(user.role, user.email, user.nome, user.materias, user.matricula, user.trocar_senha);
    } catch (err) {
      setError(err.message || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
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

        <Field label="E-mail ou Matrícula">
          <Input type="text" icon="user" placeholder="seu e-mail ou matrícula"
            value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" />
        </Field>
        <Field label="Senha">
          <PasswordInput placeholder="••••••••" value={senha}
            onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
        </Field>

        {error && <p className="uv-login-error">{error}</p>}

        <Button type="submit" className="uv-w-full" size="lg" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </Button>
        <a className="uv-login-forgot" href="#" onClick={(e) => e.preventDefault()}>Esqueceu sua senha?</a>
      </form>
      <p className="uv-login-foot">© 2026 Univap — Todos os direitos reservados.</p>
    </div>
  );
}
window.Login = Login;
