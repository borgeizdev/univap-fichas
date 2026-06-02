/* Univap Fichas — layout: Topbar + AppShell */

const PROF_NAV = [
  { id: "inicio",     label: "Início",              icon: "home" },
  { id: "nova",       label: "Nova Ficha",           icon: "clipboardPlus" },
  { id: "fichas",     label: "Gerenciar Fichas",     icon: "folderOpen" },
  { id: "relatorios", label: "Relatórios",           icon: "fileText" },
];
const ALUNO_NAV = [
  { id: "grupo",   label: "Meus Grupos",             icon: "users" },
  { id: "minhas",  label: "Histórico de Avaliações", icon: "clipboardList" },
];
const COORD_NAV = [
  { id: "materias",    label: "Matérias",    icon: "clipboardList" },
  { id: "professores", label: "Professores", icon: "users" },
];
const NAV_BY_ROLE = { professor: PROF_NAV, aluno: ALUNO_NAV, coordenador: COORD_NAV };

function roleLabel(r) {
  return { professor: "Professor", aluno: "Aluno", coordenador: "Coordenador" }[r] || r;
}

function Brand() { return null; }

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function AppShell({ role, view, setView, user, dark, onToggleTheme, onLogout, children }) {
  const nav = NAV_BY_ROLE[role] || PROF_NAV;
  const now = useClock();
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="uv-shell">
      <header className="uv-topbar">

        {/* imagem cobre todo o topbar (brand + nav) */}
        <img src="assets/images/writing-bg.png" className="uv-topbar-bg-full" alt="" aria-hidden="true" />

        {/* Faixa superior */}
        <div className="uv-topbar-brand">
          <img src="assets/images/univap-login.png" className="uv-topbar-logo" alt="UniVap" />

          <div className="uv-topbar-user">
            <span className="uv-topbar-role">{roleLabel(role).toUpperCase()}</span>
            <span className="uv-topbar-name">{user.nome}</span>
            <span className="uv-topbar-meta">{dateStr} · {timeStr}</span>
          </div>
        </div>

        {/* Faixa de navegação + ações */}
        <nav className="uv-topbar-nav" aria-label="Navegação principal">
          <div className="uv-topbar-ghost-actions">
            <button className="uv-topbar-ghost-btn" onClick={onToggleTheme} title={dark ? "Tema claro" : "Tema escuro"}>
              <Icon name={dark ? "sun" : "moon"} size={14} />
            </button>
            <button className="uv-topbar-ghost-btn" onClick={onLogout}>
              <Icon name="logOut" size={14} />
              <span>Sair</span>
            </button>
          </div>
          <div className="uv-topbar-nav-links">
            {nav.map(n => (
              <button key={n.id}
                className={`uv-nav-link ${view === n.id ? "active" : ""}`}
                onClick={() => setView(n.id)}>
                {n.label}
              </button>
            ))}
          </div>
        </nav>

      </header>

      <main className="uv-main">
        <div className="uv-content">
          <div className="uv-content-inner">{children}</div>
          <PageFooter />
        </div>
      </main>
    </div>
  );
}

function Header() { return null; }

function PageFooter() {
  return (
    <footer className="uv-page-footer">
      © 2026 Univap — Todos os direitos reservados. Sistema de Avaliação Acadêmica.
    </footer>
  );
}

Object.assign(window, { AppShell, Header, PageFooter, Brand, roleLabel,
  PROF_NAV, ALUNO_NAV, COORD_NAV, NAV_BY_ROLE });
