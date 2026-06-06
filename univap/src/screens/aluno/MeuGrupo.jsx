/* Univap Fichas — Meu Grupo (Aluno) */

function MeuGrupo({ user }) {
  const toast = useToast();
  const [grupos, setGrupos] = useState([]);
  const [criando, setCriando] = useState(false);
  const [grupoAtivo, setGrupoAtivo] = useState(null);

  useEffect(() => {
    apiGetGrupos()
      .then(setGrupos)
      .catch(e => toast(e.message || "Erro ao carregar grupos.", "error"));
  }, []);

  const onCriar = async (novoGrupo) => {
    try {
      await apiCreateGrupo(novoGrupo);
      const gs = await apiGetGrupos();
      setGrupos(gs);
      setGrupoAtivo(gs.findIndex(g => g.id === novoGrupo.id));
      setCriando(false);
      toast("Grupo criado com sucesso!", "success");
    } catch (e) {
      toast(e.message || "Erro ao criar grupo.", "error");
    }
  };

  const onAtualizarGrupo = async (grupoAtualizado) => {
    try {
      await apiUpdateGrupo(grupoAtualizado.id, grupoAtualizado);
      setGrupos(prev => prev.map(g => g.id === grupoAtualizado.id ? grupoAtualizado : g));
    } catch (e) {
      toast(e.message || "Erro ao atualizar grupo.", "error");
    }
  };

  const onExcluirGrupo = async (id) => {
    try {
      await apiDeleteGrupo(id);
      setGrupos(prev => prev.filter(g => g.id !== id));
      setGrupoAtivo(null);
      toast("Grupo excluído.", "success");
    } catch (e) {
      toast(e.message || "Erro ao excluir grupo.", "error");
    }
  };

  if (!criando && grupoAtivo === null) {
    return (
      <>
        <PageHeading
          title="Meus Grupos"
          sub="Gerencie os grupos do seu projeto"
          action={
            <Button icon="plus" onClick={() => setCriando(true)}>Novo Grupo</Button>
          }
        />

        {grupos.length === 0 ? (
          <EmptyState
            icon="users"
            title="Nenhum grupo criado"
            text="Crie seu primeiro grupo de projeto para começar."
          />
        ) : (
          <div className="uv-grid-3">
            {grupos.map((g, i) => (
              <Card key={g.id} hover className="uv-grupo-card" onClick={() => setGrupoAtivo(i)}>
                <div className="uv-grupo-top">
                  <div>
                    <h3 className="uv-grupo-name">{g.nome}</h3>
                    <p className="uv-grupo-proj">{g.materia}</p>
                  </div>
                </div>
                <div className="uv-grupo-meta">
                  <span className="uv-chip">{g.ano.replace(" ano","")}{g.turma} · {g.curso}</span>
                </div>
                <div className="uv-grupo-foot">
                  <AvatarStack nomes={g.integrantes.map(m => m.nome)} size={28} />
                  <Button size="sm" variant="ghost" icon="chevronRight">Gerenciar</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </>
    );
  }

  if (criando) {
    return (
      <CriarGrupoForm
        user={user}
        grupos={grupos}
        onSalvar={onCriar}
        onCancelar={() => setCriando(false)}
      />
    );
  }

  return (
    <GerenciarGrupo
      grupo={grupos[grupoAtivo]}
      user={user}
      onVoltar={() => setGrupoAtivo(null)}
      onAtualizar={(g) => onAtualizarGrupo(g)}
      onExcluir={() => onExcluirGrupo(grupos[grupoAtivo].id)}
    />
  );
}

/* ── Formulário de criação ──────────────────────────────────────────────── */
function gerarNomeGrupo(ano, turma, grupos) {
  const anoNum = ano.replace(/\D/g, "");
  const count = grupos.filter(g => g.ano === ano && g.turma === turma).length;
  return `${anoNum}${turma} - Grupo ${count + 1}`;
}

function CriarGrupoForm({ user, grupos, onSalvar, onCancelar }) {
  const toast = useToast();
  const [f, setF] = useState({ curso: "", ano: "", turma: "", materia: "" });
  const [disciplinas, setDisciplinas] = useState([]);

  useEffect(() => {
    apiGetDiscs()
      .then(setDisciplinas)
      .catch(e => toast(e.message || "Erro ao carregar disciplinas.", "error"));
  }, []);

  const setCurso = (curso) => setF(s => ({ ...s, curso, turma: "", materia: "" }));
  const set = (k) => (val) => setF(s => ({ ...s, [k]: val.target ? val.target.value : val }));

  const turmasFiltradas = f.curso ? (MOCK.turmasPorCurso[f.curso] || MOCK.turmas) : [];
  const discFiltradas   = f.curso
    ? disciplinas.filter(d => d.curso === f.curso).map(d => d.nome)
    : [];

  const salvar = () => {
    if (!f.curso || !f.ano || !f.turma) {
      toast("Preencha todos os campos do grupo.", "warn");
      return;
    }
    onSalvar({
      ...f,
      nome: gerarNomeGrupo(f.ano, f.turma, grupos),
      id: crypto.randomUUID(),
      criadorEmail: user.email,
      integrantes: [{ nome: user.nome, matricula: user.matricula || "—", lider: true }],
    });
  };

  return (
    <>
      <PageHeading
        title="Novo Grupo"
        sub="Preencha as informações do grupo de projeto"
        action={<Button variant="ghost" icon="chevronLeft" onClick={onCancelar}>Voltar</Button>}
      />
      <Card>
        <CardHead title="Informações do Grupo" />
        <div className="uv-form-stack">
          <div className="uv-grid-3 uv-gap-sm">
            <Field label="Curso">
              <Select options={MOCK.cursos} value={f.curso} onChange={setCurso} placeholder="Selecione…" />
            </Field>
            <Field label="Ano">
              <Select options={MOCK.anos} value={f.ano} onChange={set("ano")} placeholder="Selecione…" />
            </Field>
            <Field label="Turma">
              <Select
                options={turmasFiltradas}
                value={f.turma}
                onChange={set("turma")}
                placeholder={f.curso ? "Selecione…" : "Selecione o curso primeiro…"}
                disabled={!f.curso}
              />
            </Field>
          </div>
          {!f.curso ? (
            <div className="uv-materia-aviso">
              <Icon name="clipboardList" size={15} />
              Selecione o curso para ver as matérias disponíveis.
            </div>
          ) : discFiltradas.length > 0 ? (
            <Field label="Matéria">
              <Select options={discFiltradas} value={f.materia} onChange={set("materia")} placeholder="Selecione a matéria…" />
            </Field>
          ) : (
            <div className="uv-materia-aviso">
              <Icon name="clipboardList" size={15} />
              Nenhuma matéria cadastrada para {f.curso}. Aguarde o coordenador técnico.
            </div>
          )}
          <div className="uv-form-actions">
            <Button variant="ghost" onClick={onCancelar}>Cancelar</Button>
            <Button icon="check" onClick={salvar}>Criar Grupo</Button>
          </div>
        </div>
      </Card>
    </>
  );
}

/* ── Gerenciar grupo existente ──────────────────────────────────────────── */
function GerenciarGrupo({ grupo, user, onVoltar, onAtualizar, onExcluir }) {
  const toast = useToast();
  const [novoNome, setNovoNome] = useState("");
  const [novaMatricula, setNovaMatricula] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (novaMatricula.length < 4) return;
    const mat = novaMatricula.trim();
    if (mat === user.matricula) {
      toast("Você já está no grupo como líder.", "warn");
      setNovaMatricula("");
      return;
    }
    if (grupo.integrantes.some(m => m.matricula === mat)) {
      toast("Este aluno já está no grupo.", "warn");
      setNovaMatricula("");
      return;
    }
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await apiBuscarAluno(mat);
        setNovoNome(res.nome);
      } catch (_) {
        /* não encontrado — deixa o campo livre para digitação manual */
      } finally {
        setBuscando(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [novaMatricula]);

  const adicionar = () => {
    if (!novoNome.trim() || !novaMatricula.trim()) {
      toast("Informe nome e matrícula do integrante.", "warn");
      return;
    }
    const mat = novaMatricula.trim();
    if (mat === user.matricula || grupo.integrantes.some(m => m.matricula === mat)) {
      toast("Este aluno já está no grupo.", "warn");
      return;
    }
    const atualizado = {
      ...grupo,
      integrantes: [...grupo.integrantes, { nome: novoNome.trim(), matricula: mat }],
    };
    onAtualizar(atualizado);
    setNovoNome("");
    setNovaMatricula("");
    toast("Integrante adicionado.", "success");
  };

  const remover = (idx) => {
    if (grupo.integrantes[idx]?.lider) {
      toast("O líder do grupo não pode ser removido.", "warn");
      return;
    }
    const atualizado = {
      ...grupo,
      integrantes: grupo.integrantes.filter((_, i) => i !== idx),
    };
    onAtualizar(atualizado);
    toast("Integrante removido.", "success");
  };

  return (
    <>
      <PageHeading
        title={grupo.nome}
        sub="Gerenciamento do grupo"
        action={
          <div style={{ display: "flex", gap: 10 }}>
            {confirmando ? (
              <>
                <span className="uv-confirm-label">Confirmar exclusão?</span>
                <Button variant="ghost" onClick={() => setConfirmando(false)}>Cancelar</Button>
                <Button variant="primary" icon="x" onClick={onExcluir} style={{ background: "var(--red)" }}>Excluir</Button>
              </>
            ) : (
              <Button variant="ghost" icon="x" onClick={() => setConfirmando(true)}>Excluir Grupo</Button>
            )}
            <Button variant="ghost" icon="chevronLeft" onClick={onVoltar}>Voltar</Button>
          </div>
        }
      />

      <Card className="uv-mb-card">
        <CardHead title="Informações do Grupo" />
        <div className="uv-grupo-info-grid">
          <MetaItem label="Curso"   value={grupo.curso} />
          <MetaItem label="Ano"     value={grupo.ano} />
          <MetaItem label="Turma"   value={grupo.turma} />
          <MetaItem label="Matéria" value={grupo.materia} />
        </div>
      </Card>

      <Card>
        <CardHead
          title="Integrantes"
          sub={`${grupo.integrantes.length} membro${grupo.integrantes.length !== 1 ? "s" : ""}`}
        />
        <div className="uv-table-wrap">
          <table className="uv-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Matrícula</th>
                <th className="ta-r"></th>
              </tr>
            </thead>
            <tbody>
              {grupo.integrantes.map((m, i) => (
                <tr key={`${m.nome}-${m.matricula}`}>
                  <td>
                    <div className="uv-td-aluno">
                      <Avatar nome={m.nome} size={30} idx={i} />
                      <span>{m.nome}</span>
                      {m.lider && <Badge tone="blue">Líder</Badge>}
                    </div>
                  </td>
                  <td className="uv-td-muted">{m.matricula}</td>
                  <td className="ta-r">
                    {!m.lider && (
                      <button className="uv-icon-btn sm danger" title="Remover integrante" onClick={() => remover(i)}>
                        <Icon name="x" size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="uv-add-member">
          <p className="uv-add-member-title">Adicionar Integrante</p>
          <div className="uv-add-member-row">
            <Field label="Matrícula">
              <Input placeholder="Matrícula" value={novaMatricula}
                onChange={(e) => { setNovaMatricula(e.target.value); setNovoNome(""); }} />
            </Field>
            <Field label="Nome">
              <Input placeholder={buscando ? "Buscando…" : "Nome completo"} value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)} readOnly={buscando} />
            </Field>
            <div className="uv-add-member-btn">
              <Button icon="plus" onClick={adicionar}>Adicionar</Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

Object.assign(window, { MeuGrupo });
