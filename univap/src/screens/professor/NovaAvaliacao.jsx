/* Univap Fichas — Nova Ficha (Professor) */

function NovaAvaliacao({ user }) {
  const grupos = loadGrupos();
  const [selecionado, setSelecionado] = useState(null);

  if (selecionado) {
    return <FormAvaliacao grupo={selecionado} user={user} onVoltar={() => setSelecionado(null)} />;
  }

  return (
    <>
      <PageHeading title="Nova Ficha" sub="Selecione um grupo para avaliar" />
      {grupos.length === 0 ? (
        <EmptyState
          icon="users"
          title="Nenhum grupo cadastrado"
          text="Aguarde os alunos criarem seus grupos para que você possa avaliá-los."
        />
      ) : (
        <div className="uv-grid-3">
          {grupos.map((g) => (
            <GrupoAvalCard key={g.id} grupo={g} onSelecionar={() => setSelecionado(g)} />
          ))}
        </div>
      )}
    </>
  );
}

function GrupoAvalCard({ grupo, onSelecionar }) {
  const n = loadAvaliacoes().filter(a => a.grupoNome === grupo.nome).length;
  return (
    <Card hover className="uv-grupo-card">
      <div className="uv-grupo-top">
        <div>
          <h3 className="uv-grupo-name">{grupo.nome}</h3>
          <p className="uv-grupo-proj">{grupo.materia || "Sem matéria"}</p>
        </div>
        {n > 0 && <Badge tone="green">{n} ficha{n !== 1 ? "s" : ""}</Badge>}
      </div>
      <div className="uv-grupo-meta">
        <span className="uv-chip">
          {(grupo.ano || "").replace(" ano", "")}{grupo.turma} · {grupo.curso}
        </span>
      </div>
      <div className="uv-grupo-foot">
        <AvatarStack nomes={grupo.integrantes.map(m => m.nome)} size={28} />
        <Button size="sm" icon="clipboardPlus" onClick={onSelecionar}>Avaliar</Button>
      </div>
    </Card>
  );
}

function FormAvaliacao({ grupo, user, onVoltar }) {
  const toast = useToast();
  const materias = getProfMaterias(user.email) || loadDisciplinas().map(d => d.nome);
  const [f, setF] = useState({
    disciplina: grupo.materia || "",
    anotacoes: "", positivos: "", melhorar: "",
  });
  const [errors, setErrors] = useState({});
  const [integrantesAval, setIntegrantesAval] = useState(
    grupo.integrantes.map(m => ({ nome: m.nome, matricula: m.matricula, nota: "", obs: "" }))
  );

  const set = (k) => (val) => setF(s => ({ ...s, [k]: val.target ? val.target.value : val }));
  const updIntegrante = (i, k) => (e) =>
    setIntegrantesAval(arr => arr.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x));

  const validate = () => {
    const e = {};
    if (!f.disciplina) e.disciplina = "Selecione a disciplina.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const publicar = () => {
    if (!validate()) { toast("Selecione a disciplina.", "warn"); return; }
    saveAvaliacoes([...loadAvaliacoes(), {
      id: "aval_" + Date.now(),
      grupoNome: grupo.nome,
      criadorEmail: grupo.criadorEmail || "",
      professorEmail: user.email,
      professorNome: user.nome,
      disciplina: f.disciplina,
      nota: null,
      anotacoes: f.anotacoes,
      positivos: f.positivos,
      melhorar: f.melhorar,
      integrantesAval: integrantesAval.map(x => ({
        nome: x.nome,
        matricula: x.matricula,
        nota: x.nota !== "" ? parseFloat(x.nota) : null,
        obs: x.obs.trim(),
      })),
      data: new Date().toISOString().split("T")[0],
      status: "Publicada",
    }]);
    toast("Avaliação publicada com sucesso!", "success");
    onVoltar();
  };

  return (
    <>
      <PageHeading
        title={`Avaliar: ${grupo.nome}`}
        sub={`${grupo.integrantes.length} integrante${grupo.integrantes.length !== 1 ? "s" : ""}`}
        action={<Button variant="ghost" icon="chevronLeft" onClick={onVoltar}>Voltar</Button>}
      />

      {/* Disciplina + integrantes com nota/obs individual */}
      <Card className="uv-mb-card">
        <div className="uv-form-stack">
          <Field label="Disciplina" error={errors.disciplina}>
            <Select options={materias} value={f.disciplina} onChange={set("disciplina")}
              placeholder="Selecione…" error={errors.disciplina} />
          </Field>

          <ol className="uv-integrantes">
            {grupo.integrantes.map((m, i) => (
              <li key={`${m.nome}-${m.matricula}`} className="uv-integrante uv-integrante-form">
                <div className="uv-integrante-head">
                  <Avatar nome={m.nome} size={32} idx={i} />
                  <div className="uv-integrante-info">
                    <span className="uv-integrante-nome">
                      {m.nome}
                      {m.lider && <Badge tone="blue" className="uv-lider-badge">Líder</Badge>}
                    </span>
                    <span className="uv-integrante-mat">Matrícula {m.matricula}</span>
                  </div>
                </div>
                <div className="uv-integrante-body">
                  <Field label="Nota">
                    <Input type="number" min="0" max="10" step="0.1" placeholder="—"
                      value={integrantesAval[i].nota} onChange={updIntegrante(i, "nota")} />
                  </Field>
                  <Field label="Observação">
                    <Input placeholder="Observação sobre este integrante…"
                      value={integrantesAval[i].obs} onChange={updIntegrante(i, "obs")} />
                  </Field>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      {/* Observações gerais */}
      <Card>
        <CardHead title="Observações Gerais" />
        <div className="uv-form-stack">
          <Field label="Observações do Professor">
            <Textarea rows="3" placeholder="Observações gerais sobre o desempenho do grupo…"
              value={f.anotacoes} onChange={set("anotacoes")} />
          </Field>

          <div className="uv-grid-2 uv-gap-sm">
            <Field label="Elogios / Pontos positivos">
              <Textarea rows="3" placeholder="O que o grupo fez bem…"
                value={f.positivos} onChange={set("positivos")} />
            </Field>
            <Field label="Pontos de melhoria">
              <Textarea rows="3" placeholder="O que precisa melhorar…"
                value={f.melhorar} onChange={set("melhorar")} />
            </Field>
          </div>

          <div className="uv-form-actions">
            <Button variant="ghost" onClick={onVoltar}>Cancelar</Button>
            <Button icon="send" onClick={publicar}>Publicar Avaliação</Button>
          </div>
        </div>
      </Card>
    </>
  );
}

/* mantidos para não quebrar referências em outros arquivos */
function EmptyState({ icon, title, text, action }) {
  return (
    <div className="uv-empty">
      <div className="uv-empty-ico"><Icon name={icon} size={28} /></div>
      <h3 className="uv-empty-title">{title}</h3>
      <p className="uv-empty-text">{text}</p>
      {action}
    </div>
  );
}
function SectionLabel({ n, text }) {
  return (
    <div className="uv-section-label">
      <span className="uv-section-num">{n}</span>
      <span>{text}</span>
    </div>
  );
}

Object.assign(window, { NovaAvaliacao, GrupoAvalCard, FormAvaliacao, EmptyState, SectionLabel });
