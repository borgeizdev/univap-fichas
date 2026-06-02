/* Univap Fichas — Cadastro de Matérias (Coordenador Técnico) */

function CadastroMaterias() {
  const toast = useToast();
  const [materias, setMaterias] = useState(loadDisciplinas);
  const [nome, setNome] = useState("");

  const salvar = (ms) => { setMaterias(ms); saveDisciplinas(ms); };

  const adicionar = () => {
    const n = nome.trim();
    if (!n) { toast("Informe o nome da matéria.", "warn"); return; }
    if (materias.includes(n)) { toast("Matéria já cadastrada.", "warn"); return; }
    salvar([...materias, n]);
    setNome("");
    toast("Matéria cadastrada com sucesso!", "success");
  };

  const remover = (idx) => {
    salvar(materias.filter((_, i) => i !== idx));
    toast("Matéria removida.", "success");
  };

  const onKey = (e) => { if (e.key === "Enter") adicionar(); };

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
                    <tr key={i}>
                      <td className="uv-td-muted" style={{ width: 48 }}>{i + 1}</td>
                      <td>{m}</td>
                      <td className="ta-r">
                        <button
                          className="uv-icon-btn sm"
                          title="Remover matéria"
                          onClick={() => remover(i)}
                          style={{ color: "var(--red)" }}
                        >
                          <Icon name="x" size={16} />
                        </button>
                      </td>
                    </tr>
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
