/* Univap Fichas — App root */
const LS = "univap_state_v1";
function loadState() {
  try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; }
}
function saveState(s) { try { localStorage.setItem(LS, JSON.stringify(s)); } catch (e) {} }

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "sidebar": "solid",
  "accent": "#2364a6",
  "font": "Roboto",
  "cardRadius": 16
}/*EDITMODE-END*/;

const ACCENTS = ["#2364a6", "#0054a6", "#436384", "#1b6fb3"];
const FONTS = ["Roboto", "Plus Jakarta Sans", "Figtree", "Manrope"];
const FONT_STACKS = {
  "Roboto": "'Roboto', system-ui, sans-serif",
  "Plus Jakarta Sans": "'Plus Jakarta Sans', system-ui, sans-serif",
  "Figtree": "'Figtree', system-ui, sans-serif",
  "Manrope": "'Manrope', system-ui, sans-serif",
};

function App() {
  const init = loadState();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [auth, setAuth] = useState(init.auth || null); // {role, email, nome}
  const [view, setView] = useState(init.view || "grupo");
  const [dark, setDark] = useState(!!init.dark);
  const [viewAval, setViewAval] = useState(null);

  useEffect(() => { saveState({ auth, view, dark }); }, [auth, view, dark]);

  useEffect(() => {
    const handle = () => { setAuth(null); setView("grupo"); };
    window.addEventListener("univap:401", handle);
    return () => window.removeEventListener("univap:401", handle);
  }, []);

  useEffect(() => {
    const r = document.documentElement;
    r.setAttribute("data-theme", dark ? "dark" : "light");
    r.style.setProperty("--uv-primary", t.accent);
    r.style.setProperty("--uv-primary-dark", shade(t.accent, -0.18));
    r.style.setProperty("--uv-font", FONT_STACKS[t.font] || FONT_STACKS["Plus Jakarta Sans"]);
    r.style.setProperty("--uv-card-radius", (t.cardRadius || 16) + "px");
  }, [dark, t.accent, t.font, t.cardRadius]);

  const login = (role, email, nome, materias, matricula, trocar_senha) => {
    setAuth({ role, email, nome, materias: materias || [], matricula: matricula || null, trocar_senha: !!trocar_senha });
    const defaultView = role === "professor" ? "inicio"
      : role === "coordenador" ? "materias"
      : "grupo";
    setView(defaultView);
  };
  const logout = () => { apiLogout(); setAuth(null); setView("grupo"); };

  const crumbsFor = (v) => {
    const map = {
      inicio: "Início", nova: "Nova Ficha",
      fichas: "Gerenciar Fichas", dashboard: "Dashboard",
      relatorios: "Relatórios", perfil: "Perfil", config: "Configurações",
      grupo: "Meus Grupos", minhas: "Histórico de Avaliações",
      materias: "Matérias", professores: "Professores",
    };
    return map[v] || "Início";
  };

  const panel = (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Identidade" />
      <TweakColor label="Cor de destaque" value={t.accent} options={ACCENTS}
        onChange={(v) => setTweak("accent", v)} />
      <TweakSelect label="Fonte" value={t.font} options={FONTS}
        onChange={(v) => setTweak("font", v)} />
      <TweakSlider label="Arredondamento dos cards" value={t.cardRadius} min={6} max={24} step={2} unit="px"
        onChange={(v) => setTweak("cardRadius", v)} />
    </TweaksPanel>
  );

  if (!auth) {
    return (<><Login onLogin={login} dark={dark} onToggleTheme={() => setDark(d => !d)} />{panel}</>);
  }

  if (auth.trocar_senha) {
    return (<><TrocarSenha dark={dark} onToggleTheme={() => setDark(d => !d)}
      onConcluido={() => setAuth(a => ({ ...a, trocar_senha: false }))} />{panel}</>);
  }

  const renderScreen = () => {
    if (auth.role === "aluno") {
      if (view === "minhas") return <HistoricoAvaliacoes user={auth} />;
      return <MeuGrupo user={auth} />;
    }

    if (auth.role === "coordenador") {
      if (view === "professores") return <CadastroProfessores />;
      return <CadastroMaterias />;
    }

    switch (view) {
      case "inicio":    return <ProfInicio user={auth} go={setView} />;
      case "nova":      return <NovaAvaliacao user={auth} />;
      case "fichas":    return <GerenciarFichas user={auth} />;
      case "dashboard": return <Dashboard onView={setViewAval} />;
      case "relatorios":return <ComingSoon title="Relatórios" sub="Geração de folhas de projeto" icon="fileText" />;
      case "perfil":    return <ComingSoon title="Perfil" sub="Dados da conta" icon="user" />;
      case "config":    return <ComingSoon title="Configurações" sub="Preferências do sistema" icon="settings" />;
      default:          return <ProfInicio user={auth} go={setView} />;
    }
  };

  return (
    <>
      <AppShell role={auth.role} view={view} setView={setView} user={auth}
        dark={dark} onToggleTheme={() => setDark((d) => !d)}
        onLogout={logout} crumb={crumbsFor(view)}>
        <div key={view} className="uv-anim-fade">{renderScreen()}</div>
      </AppShell>
      {viewAval && <ViewFichaModal aval={viewAval} onClose={() => setViewAval(null)} />}
      {panel}
    </>
  );
}

function shade(hex, amt) {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(Math.max(0, Math.min(255, r + r * amt)));
  g = Math.round(Math.max(0, Math.min(255, g + g * amt)));
  b = Math.round(Math.max(0, Math.min(255, b + b * amt)));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ToastProvider><App /></ToastProvider>
);
