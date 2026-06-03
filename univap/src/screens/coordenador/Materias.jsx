/* Univap Fichas — Cadastro de Matérias (Coordenador Técnico) */

function CadastroMaterias() {
  const toast = useToast();
  const [materias, setMaterias] = useState(loadDisciplinas);
  const [nome, setNome]         = useState("");
  const [editIdx, setEditIdx]   = useState(null);
  const [editNome, setEditNome] = useState("");

  const salvar = (ms) => { setMaterias(ms); saveDisciplinas(ms); };

  const adicionar = () => {
    const n = nome.trim();
    if (!n) { toast("Informe o nome da matéria.", "warn"); return; }
    if (materias.includes(n)) { toast("Matéria já cadastrada.", "warn"); return; }
    salvar([...materias, n]);
    setNome("");
    toast("Matéria cadastrada com sucesso!", "success");
  };

  const iniciarEdicao = (i) => {
    setEditIdx(i === editIdx ? null : i);
    setEditNome(materias[i]);
  };

  const salvarEdicao = () => {
    const n = editNome.trim();
    if (!n) { toast("Informe o nome da matéria.", "warn"); return; }
    if (materias.some((m, i) => i !== editIdx && m === n)) {
      toast("Matéria já cadastrada.", "warn"); return;
    }
    salvar(materias.map((m, i) => (i === editIdx ? n : m)));
    setEditIdx(null);
    toast("Matéria atualizada com sucesso!", "success");
  };

  const remover = (idx) => {
    if (editIdx === idx) setEditIdx(null);
    salvar(materias.filter((_, i) => i !== idx));
    toast("Matéria removida.", "success");
  };

  const onKey   = (e) => { if (e.key === "Enter") adicionar(); };
  const onKeyEd = (e) => { if (e.key === "Enter") salvarEdicao(); };

  return (
    <>
      <PageHeading
        title="Matérias"
        sub={`${materias.length} matéria${materias.length !== 1 ? "s" : ""} cadastrada${materias.length !== 1 ? "s" : ""}`}
      />

      <div className="uv-materias-layout">
        {/* Coluna esquerda — formulário */}
        <Card>
          <CardHead title="Cadastrar Nova Matéria" />
          <div className="uv-form-stack">
            <Field label="Nome da Matéria">
              <Input
                placeholder="Ex: Programação Web"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={onKey}
              />
            </Field>
            <div className="uv-form-actions">
              <Button icon="plus" onClick={adicionar}>Adicionar</Button>
            </div>
          </div>
        </Card>

        {/* Coluna direita — lista */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <CardHead
            title="Matérias Cadastradas"
            sub={`${materias.length} no total`}
          />
          {materias.length === 0 ? (
            <EmptyState
              icon="clipboardList"
              title="Nenhuma matéria cadastrada"
              text="Cadastre matérias para que os alunos possam selecioná-las ao criar seus grupos."
            />
          ) : (
            <div className="uv-table-wrap" style={{ flex: 1 }}>
              <table className="uv-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nome da Matéria</th>
                    <th className="ta-r"></th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map((m, i) => (
                    <React.Fragment key={m}>
                      <tr className={editIdx === i ? "uv-tr-editing" : ""}>
                        <td className="uv-td-muted" style={{ width: 48 }}>{i + 1}</td>
                        <td>{m}</td>
                        <td className="ta-r">
                          <div className="uv-actions-cell">
                            <button className="uv-icon-btn sm" title="Editar" onClick={() => iniciarEdicao(i)}>
                              <Icon name="edit" size={15} />
                            </button>
                            <button className="uv-icon-btn sm danger" title="Remover matéria" onClick={() => remover(i)}>
                              <Icon name="x" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {editIdx === i && (
                        <tr className="uv-tr-edit-form">
                          <td colSpan={3}>
                            <div className="uv-inline-edit">
                              <Field label="Nome da Matéria">
                                <Input
                                  value={editNome}
                                  onChange={(e) => setEditNome(e.target.value)}
                                  onKeyDown={onKeyEd}
                                  autoFocus
                                />
                              </Field>
                              <div className="uv-form-actions">
                                <Button icon="check" onClick={salvarEdicao}>Salvar</Button>
                                <Button variant="ghost" icon="x" onClick={() => setEditIdx(null)}>Cancelar</Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

Object.assign(window, { CadastroMaterias });
