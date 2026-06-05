/* Univap Fichas — Cadastro de Professores (Coordenador) */

function ProfessorForm({ form, onChange, disciplinas, selecionadas, onToggleMat, onSubmit, submitLabel, onCancelar, showDisclaimer }) {
  const senhasOk = !form.confirmarSenha || form.senha === form.confirmarSenha;

  return (
    <div className="uv-form-stack">
      <div className="uv-grid-2 uv-gap-sm">
        <Field label="Nome completo">
          <Input placeholder="Ex: Prof. João Silva" value={form.nome} onChange={onChange("nome")} />
        </Field>
        <Field label="E-mail">
          <Input type="email" placeholder="joao@univap.com" value={form.email} onChange={onChange("email")} />
        </Field>
        <Field label="Senha">
          <PasswordInput placeholder="Senha de acesso" value={form.senha} onChange={onChange("senha")} />
        </Field>
        <Field
          label="Confirmar Senha"
          error={!senhasOk ? "Senhas não coincidem" : undefined}
        >
          <PasswordInput
            placeholder="Repita a senha"
            value={form.confirmarSenha}
            onChange={onChange("confirmarSenha")}
            error={!senhasOk}
          />
        </Field>
      </div>

      {disciplinas.length > 0 && (
        <Field label="Matérias que leciona">
          <div className="uv-check-grid">
            {disciplinas.map((m) => (
              <label key={m} className={`uv-check-item ${selecionadas.includes(m) ? "checked" : ""}`}>
                <input type="checkbox" checked={selecionadas.includes(m)} onChange={() => onToggleMat(m)} />
                <span>{m}</span>
              </label>
            ))}
          </div>
        </Field>
      )}

      {showDisclaimer && disciplinas.length === 0 && (
        <div className="uv-materia-aviso">
          <Icon name="clipboardList" size={15} />
          Cadastre matérias primeiro para poder atribuí-las ao professor.
        </div>
      )}

      <div className="uv-form-actions">
        <Button icon={onCancelar ? "check" : "plus"} onClick={onSubmit}>{submitLabel}</Button>
        {onCancelar && <Button variant="ghost" icon="x" onClick={onCancelar}>Cancelar</Button>}
      </div>
    </div>
  );
}

const FORM_VAZIO = { nome: "", email: "", senha: "", confirmarSenha: "" };

function CadastroProfessores() {
  const toast = useToast();
  const [profs, setProfs]       = useState([]);
  const [disciplinas, setDiscs] = useState([]);
  const [form, setForm]         = useState(FORM_VAZIO);
  const [selecionadas, setSel]  = useState([]);
  const [editId, setEditId]     = useState(null);
  const [editForm, setEditForm] = useState(FORM_VAZIO);
  const [editSel, setEditSel]   = useState([]);

  useEffect(() => {
    Promise.all([apiGetProfs(), apiGetDiscs()])
      .then(([ps, ds]) => { setProfs(ps); setDiscs(ds.map(d => d.nome)); })
      .catch(e => toast(e.message || "Erro ao carregar dados.", "error"));
  }, []);

  const set   = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setEd = (k) => (e) => setEditForm(f => ({ ...f, [k]: e.target.value }));

  const toggleMat     = (m) => setSel(s => s.includes(m) ? s.filter(x => x !== m) : [...s, m]);
  const toggleEditMat = (m) => setEditSel(s => s.includes(m) ? s.filter(x => x !== m) : [...s, m]);

  const adicionar = async () => {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      toast("Preencha nome, e-mail e senha.", "warn"); return;
    }
    if (form.senha !== form.confirmarSenha) {
      toast("As senhas não coincidem.", "warn"); return;
    }
    try {
      const novo = await apiCreateProf({
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha.trim(),
        materias: selecionadas,
      });
      setProfs(prev => [...prev, novo]);
      setForm(FORM_VAZIO);
      setSel([]);
      toast("Professor cadastrado com sucesso!", "success");
    } catch (e) {
      toast(e.message || "Erro ao cadastrar professor.", "error");
    }
  };

  const iniciarEdicao = (p) => {
    setEditId(editId === p.id ? null : p.id);
    setEditForm({ nome: p.nome, email: p.email, senha: "", confirmarSenha: "" });
    setEditSel(p.materias || []);
  };

  const salvarEdicao = async () => {
    if (!editForm.nome.trim() || !editForm.email.trim()) {
      toast("Preencha nome e e-mail.", "warn"); return;
    }
    if (editForm.senha && editForm.senha !== editForm.confirmarSenha) {
      toast("As senhas não coincidem.", "warn"); return;
    }
    try {
      await apiUpdateProf(editId, {
        nome: editForm.nome.trim(),
        email: editForm.email.trim().toLowerCase(),
        senha: editForm.senha.trim() || undefined,
        materias: editSel,
      });
      setProfs(prev => prev.map(p => p.id === editId
        ? { ...p, nome: editForm.nome.trim(), email: editForm.email.trim().toLowerCase(), materias: editSel }
        : p
      ));
      setEditId(null);
      toast("Professor atualizado com sucesso!", "success");
    } catch (e) {
      toast(e.message || "Erro ao atualizar professor.", "error");
    }
  };

  const remover = async (id) => {
    if (editId === id) setEditId(null);
    try {
      await apiDeleteProf(id);
      setProfs(prev => prev.filter(p => p.id !== id));
      toast("Professor removido.", "success");
    } catch (e) {
      toast(e.message || "Erro ao remover professor.", "error");
    }
  };

  const editProf = profs.find(p => p.id === editId);

  return (
    <>
      <PageHeading
        title="Professores"
        sub={`${profs.length} professor${profs.length !== 1 ? "es" : ""} cadastrado${profs.length !== 1 ? "s" : ""}`}
      />

      <Card style={{ marginBottom: 24 }}>
        <CardHead title="Cadastrar Professor" />
        <ProfessorForm
          form={form} onChange={set}
          disciplinas={disciplinas} selecionadas={selecionadas} onToggleMat={toggleMat}
          onSubmit={adicionar} submitLabel="Cadastrar Professor"
          showDisclaimer
        />
      </Card>

      {editId !== null && editProf && (
        <Card style={{ marginBottom: 24, borderColor: "var(--uv-primary)" }}>
          <CardHead title={`Editando: ${editProf.nome}`} />
          <ProfessorForm
            form={editForm} onChange={setEd}
            disciplinas={disciplinas} selecionadas={editSel} onToggleMat={toggleEditMat}
            onSubmit={salvarEdicao} submitLabel="Salvar Alterações"
            onCancelar={() => setEditId(null)}
          />
        </Card>
      )}

      <Card>
        <CardHead title="Professores Cadastrados" />
        {profs.length === 0 ? (
          <EmptyState
            icon="users"
            title="Nenhum professor cadastrado"
            text="Cadastre professores para que possam acessar o sistema."
          />
        ) : (
          <div className="uv-table-wrap">
            <table className="uv-table">
              <thead>
                <tr>
                  <th>Professor</th>
                  <th>E-mail</th>
                  <th>Matérias</th>
                  <th className="ta-r"></th>
                </tr>
              </thead>
              <tbody>
                {profs.map((p, i) => (
                  <tr key={p.id} className={editId === p.id ? "uv-tr-editing" : ""}>
                    <td>
                      <div className="uv-td-aluno">
                        <Avatar nome={p.nome} size={30} idx={i} />
                        <span>{p.nome}</span>
                      </div>
                    </td>
                    <td className="uv-td-muted">{p.email}</td>
                    <td>
                      <div className="uv-mat-tags">
                        {p.materias.length > 0
                          ? p.materias.map((m) => <span key={m} className="uv-chip">{m}</span>)
                          : <span className="uv-td-muted">—</span>
                        }
                      </div>
                    </td>
                    <td className="ta-r">
                      <div className="uv-actions-cell">
                        <button className="uv-icon-btn sm" title="Editar" onClick={() => iniciarEdicao(p)}>
                          <Icon name="edit" size={15} />
                        </button>
                        <button className="uv-icon-btn sm danger" title="Remover" onClick={() => remover(p.id)}>
                          <Icon name="x" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

Object.assign(window, { CadastroProfessores });
