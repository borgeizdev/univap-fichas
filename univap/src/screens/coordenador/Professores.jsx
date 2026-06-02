/* Univap Fichas — Cadastro de Professores (Coordenador) */

function CadastroProfessores() {
  const toast = useToast();
  const [profs, setProfs]     = useState(loadProfessores);
  const [form, setForm]       = useState({ nome: "", email: "", senha: "" });
  const [selecionadas, setSel] = useState([]);
  const [editIdx, setEditIdx]  = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", email: "", senha: "" });
  const [editSel, setEditSel]  = useState([]);
  const disciplinas = loadDisciplinas();

  const set    = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setEd  = (k) => (e) => setEditForm(f => ({ ...f, [k]: e.target.value }));

  const toggleMat    = (m) => setSel(s => s.includes(m) ? s.filter(x => x !== m) : [...s, m]);
  const toggleEditMat = (m) => setEditSel(s => s.includes(m) ? s.filter(x => x !== m) : [...s, m]);

  const salvarProfs = (list) => { setProfs(list); saveProfessores(list); };

  const adicionar = () => {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      toast("Preencha nome, e-mail e senha.", "warn"); return;
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
    setForm({ nome: "", email: "", senha: "" });
    setSel([]);
    toast("Professor cadastrado com sucesso!", "success");
  };

  const iniciarEdicao = (i) => {
    const p = profs[i];
    setEditIdx(i);
    setEditForm({ nome: p.nome, email: p.email, senha: p.senha });
    setEditSel(p.materias || []);
  };

  const cancelarEdicao = () => { setEditIdx(null); };

  const salvarEdicao = () => {
    if (!editForm.nome.trim() || !editForm.email.trim() || !editForm.senha.trim()) {
      toast("Preencha nome, e-mail e senha.", "warn"); return;
    }
    const emailConflito = profs.some((p, i) => i !== editIdx && p.email === editForm.email.trim());
    if (emailConflito) {
      toast("Já existe um professor com este e-mail.", "warn"); return;
    }
    const updated = profs.map((p, i) => i === editIdx ? {
      ...p,
      nome: editForm.nome.trim(),
      email: editForm.email.trim().toLowerCase(),
      senha: editForm.senha.trim(),
      materias: editSel,
    } : p);
    salvarProfs(updated);
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
        <div className="uv-form-stack">
          <div className="uv-grid-3 uv-gap-sm">
            <Field label="Nome completo">
              <Input placeholder="Ex: Prof. João Silva" value={form.nome} onChange={set("nome")} />
            </Field>
            <Field label="E-mail">
              <Input type="email" placeholder="joao@univap.com" value={form.email} onChange={set("email")} />
            </Field>
            <Field label="Senha">
              <Input type="password" placeholder="Senha de acesso" value={form.senha} onChange={set("senha")} />
            </Field>
          </div>

          {disciplinas.length > 0 && (
            <Field label="Matérias que leciona">
              <div className="uv-check-grid">
                {disciplinas.map((m, i) => (
                  <label key={i} className={`uv-check-item ${selecionadas.includes(m) ? "checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={selecionadas.includes(m)}
                      onChange={() => toggleMat(m)}
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </Field>
          )}

          {disciplinas.length === 0 && (
            <div className="uv-materia-aviso">
              <Icon name="clipboardList" size={15} />
              Cadastre matérias primeiro para poder atribuí-las ao professor.
            </div>
          )}

          <div className="uv-form-actions">
            <Button icon="plus" onClick={adicionar}>Cadastrar Professor</Button>
          </div>
        </div>
      </Card>

      {/* Card de edição */}
      {editIdx !== null && (
        <Card style={{ marginBottom: 24, borderColor: "var(--uv-primary)" }}>
          <CardHead title={`Editando: ${profs[editIdx]?.nome}`} />
          <div className="uv-form-stack">
            <div className="uv-grid-3 uv-gap-sm">
              <Field label="Nome completo">
                <Input placeholder="Ex: Prof. João Silva" value={editForm.nome} onChange={setEd("nome")} />
              </Field>
              <Field label="E-mail">
                <Input type="email" placeholder="joao@univap.com" value={editForm.email} onChange={setEd("email")} />
              </Field>
              <Field label="Senha">
                <Input type="password" placeholder="Senha de acesso" value={editForm.senha} onChange={setEd("senha")} />
              </Field>
            </div>

            {disciplinas.length > 0 && (
              <Field label="Matérias que leciona">
                <div className="uv-check-grid">
                  {disciplinas.map((m, i) => (
                    <label key={i} className={`uv-check-item ${editSel.includes(m) ? "checked" : ""}`}>
                      <input
                        type="checkbox"
                        checked={editSel.includes(m)}
                        onChange={() => toggleEditMat(m)}
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </Field>
            )}

            <div className="uv-form-actions">
              <Button icon="check" onClick={salvarEdicao}>Salvar Alterações</Button>
              <Button variant="ghost" icon="x" onClick={cancelarEdicao}>Cancelar</Button>
            </div>
          </div>
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
                  <tr key={i} className={editIdx === i ? "uv-tr-editing" : ""}>
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
                          ? p.materias.map((m, j) => <span key={j} className="uv-chip">{m}</span>)
                          : <span className="uv-td-muted">—</span>
                        }
                      </div>
                    </td>
                    <td className="ta-r">
                      <div className="uv-actions-cell">
                        <button className="uv-icon-btn sm" title="Editar" onClick={() => iniciarEdicao(i)}>
                          <Icon name="edit" size={15} />
                        </button>
                        <button className="uv-icon-btn sm" title="Remover" onClick={() => remover(i)} style={{ color: "var(--red)" }}>
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
