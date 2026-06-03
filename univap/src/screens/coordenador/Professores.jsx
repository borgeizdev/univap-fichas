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
          <Input type="password" placeholder="Senha de acesso" value={form.senha} onChange={onChange("senha")} />
        </Field>
        <Field
          label="Confirmar Senha"
          error={!senhasOk ? "Senhas não coincidem" : undefined}
        >
          <Input
            type="password"
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
  const [profs, setProfs]       = useState(loadProfessores);
  const [form, setForm]         = useState(FORM_VAZIO);
  const [selecionadas, setSel]  = useState([]);
  const [editIdx, setEditIdx]   = useState(null);
  const [editForm, setEditForm] = useState(FORM_VAZIO);
  const [editSel, setEditSel]   = useState([]);
  const disciplinas = loadDisciplinas();

  const set   = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setEd = (k) => (e) => setEditForm(f => ({ ...f, [k]: e.target.value }));

  const toggleMat     = (m) => setSel(s => s.includes(m) ? s.filter(x => x !== m) : [...s, m]);
  const toggleEditMat = (m) => setEditSel(s => s.includes(m) ? s.filter(x => x !== m) : [...s, m]);

  const salvarProfs = (list) => { setProfs(list); saveProfessores(list); };

  const adicionar = () => {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      toast("Preencha nome, e-mail e senha.", "warn"); return;
    }
    if (form.senha !== form.confirmarSenha) {
      toast("As senhas não coincidem.", "warn"); return;
    }
    if (profs.some(p => p.email === form.email.trim())) {
      toast("Já existe um professor com este e-mail.", "warn"); return;
    }
    salvarProfs([...profs, {
      id: "prof_" + Date.now(),
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      senha: form.senha.trim(),
      materias: selecionadas,
    }]);
    setForm(FORM_VAZIO);
    setSel([]);
    toast("Professor cadastrado com sucesso!", "success");
  };

  const iniciarEdicao = (i) => {
    const p = profs[i];
    setEditIdx(i);
    setEditForm({ nome: p.nome, email: p.email, senha: p.senha, confirmarSenha: "" });
    setEditSel(p.materias || []);
  };

  const salvarEdicao = () => {
    if (!editForm.nome.trim() || !editForm.email.trim() || !editForm.senha.trim()) {
      toast("Preencha nome, e-mail e senha.", "warn"); return;
    }
    if (editForm.senha !== editForm.confirmarSenha) {
      toast("As senhas não coincidem.", "warn"); return;
    }
    if (profs.some((p, i) => i !== editIdx && p.email === editForm.email.trim())) {
      toast("Já existe um professor com este e-mail.", "warn"); return;
    }
    salvarProfs(profs.map((p, i) => i === editIdx ? {
      ...p,
      nome: editForm.nome.trim(),
      email: editForm.email.trim().toLowerCase(),
      senha: editForm.senha.trim(),
      materias: editSel,
    } : p));
    setEditIdx(null);
    toast("Professor atualizado com sucesso!", "success");
  };

  const remover = (idx) => {
    if (editIdx === idx) setEditIdx(null);
    salvarProfs(profs.filter((_, i) => i !== idx));
    toast("Professor removido.", "success");
  };

  return (
    <>
      <PageHeading
        title="Professores"
        sub={`${profs.length} professor${profs.length !== 1 ? "es" : ""} cadastrado${profs.length !== 1 ? "s" : ""}`}
      />

      {/* Formulário de cadastro */}
      <Card style={{ marginBottom: 24 }}>
        <CardHead title="Cadastrar Professor" />
        <ProfessorForm
          form={form} onChange={set}
          disciplinas={disciplinas} selecionadas={selecionadas} onToggleMat={toggleMat}
          onSubmit={adicionar} submitLabel="Cadastrar Professor"
          showDisclaimer
        />
      </Card>

      {/* Card de edição */}
      {editIdx !== null && (
        <Card style={{ marginBottom: 24, borderColor: "var(--uv-primary)" }}>
          <CardHead title={`Editando: ${profs[editIdx]?.nome}`} />
          <ProfessorForm
            form={editForm} onChange={setEd}
            disciplinas={disciplinas} selecionadas={editSel} onToggleMat={toggleEditMat}
            onSubmit={salvarEdicao} submitLabel="Salvar Alterações"
            onCancelar={() => setEditIdx(null)}
          />
        </Card>
      )}

      {/* Lista */}
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
                  <tr key={p.id} className={editIdx === i ? "uv-tr-editing" : ""}>
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
                        <button className="uv-icon-btn sm" title="Editar" onClick={() => iniciarEdicao(i)}>
                          <Icon name="edit" size={15} />
                        </button>
                        <button className="uv-icon-btn sm danger" title="Remover" onClick={() => remover(i)}>
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
