/* Univap Fichas — Troca de senha obrigatória */
function TrocarSenha({ onConcluido, dark, onToggleTheme }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await apiTrocarSenha(novaSenha);
      onConcluido();
    } catch (err) {
      setError(err.message || "Erro ao alterar a senha.");
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

        <p style={{ fontSize: 14, color: "var(--uv-text-2)", marginBottom: 4 }}>
          É necessário criar uma senha pessoal antes de continuar.
        </p>

        <Field label="Nova senha">
          <PasswordInput placeholder="mínimo 6 caracteres" value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)} autoComplete="new-password" />
        </Field>
        <Field label="Confirmar senha">
          <PasswordInput placeholder="repita a senha" value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)} autoComplete="new-password" />
        </Field>

        {error && <p className="uv-login-error">{error}</p>}

        <Button type="submit" className="uv-w-full" size="lg" disabled={loading}>
          {loading ? "Salvando…" : "Salvar e continuar"}
        </Button>
      </form>
      <p className="uv-login-foot">© 2026 Univap — Todos os direitos reservados.</p>
    </div>
  );
}
window.TrocarSenha = TrocarSenha;
