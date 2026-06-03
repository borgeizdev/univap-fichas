/* Univap Fichas — Meu Grupo (Aluno) */

/* ── Tela principal ─────────────────────────────────────────────────────── */
function MeuGrupo({ user }) {
  const toast = useToast();
  const [grupos, setGrupos] = useState(loadGrupos);
  const [criando, setCriando] = useState(false);
  const [grupoAtivo, setGrupoAtivo] = useState(null);

  const salvarGrupos = (gs) => { setGrupos(gs); saveGrupos(gs); };

  const onCriar = (novoGrupo) => {
    const gs = [...grupos, novoGrupo];
    salvarGrupos(gs);
    setGrupoAtivo(gs.length - 1);
    setCriando(false);
    toast("Grupo criado com sucesso!", "success");
  };

  const onAtualizarGrupo = (idx, grupoAtualizado) => {
    const gs = grupos.map((g, i) => i === idx ? grupoAtualizado : g);
    salvarGrupos(gs);
  };

  const onExcluirGrupo = (idx) => {
    const gs = grupos.filter((_, i) => i !== idx);
    salvarGrupos(gs);
    setGrupoAtivo(null);
    toast("Grupo excluído.", "success");
  };

  /* lista de grupos do aluno */
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
          /* eslint-disable-next-line */
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

  /* formulário de criação */
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

  /* gerenciamento do grupo ativo */
  return (
    <GerenciarGrupo
      grupo={grupos[grupoAtivo]}
      onVoltar={() => setGrupoAtivo(null)}
      onAtualizar={(g) => onAtualizarGrupo(grupoAtivo, g)}
      onExcluir={() => onExcluirGrupo(grupoAtivo)}
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
  const set = (k) => (val) => setF(s => ({ ...s, [k]: val.target ? val.target.value : val }));

  const disciplinas = loadDisciplinas();

  const salvar = () => {
    if (!f.curso || !f.ano || !f.turma) {
      toast("Preencha todos os campos do grupo.", "warn");
      return;
    }
    onSalvar({
      ...f,
      nome: gerarNomeGrupo(f.ano, f.turma, grupos),
      id: "grp_" + Date.now(),
      criadorEmail: user.email,
      integrantes: [{ nome: user.nome, matricula: "—", lider: true }],
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
              <Select options={MOCK.cursos} value={f.curso} onChange={set("curso")} placeholder="Selecione…" />
            </Field>
            <Field label="Ano">
              <Select options={MOCK.anos} value={f.ano} onChange={set("ano")} placeholder="Selecione…" />
            </Field>
            <Field label="Turma">
              <Select options={MOCK.turmas} value={f.turma} onChange={set("turma")} placeholder="Selecione…" />
            </Field>
          </div>
          {disciplinas.length > 0 ? (
            <Field label="Matéria">
              <Select options={disciplinas} value={f.materia} onChange={set("materia")} placeholder="Selecione a matéria…" />
            </Field>
          ) : (
            <div className="uv-materia-aviso">
              <Icon name="clipboardList" size={15} />
              Nenhuma matéria disponível. Aguarde o coordenador técnico cadastrá-las.
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
function GerenciarGrupo({ grupo, onVoltar, onAtualizar, onExcluir }) {
  const toast = useToast();
  const [novoNome, setNovoNome] = useState("");
  const [novaMatricula, setNovaMatricula] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  const adicionar = () => {
    if (!novoNome.trim() || !novaMatricula.trim()) {
      toast("Informe nome e matrícula do integrante.", "warn");
      return;
    }
    const atualizado = {
      ...grupo,
      integrantes: [...grupo.integrantes, { nome: novoNome.trim(), matricula: novaMatricula.trim() }],
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

      {/* Info */}
      <Card className="uv-mb-card">
        <CardHead title="Informações do Grupo" />
        <div className="uv-grupo-info-grid">
          <MetaItem label="Curso"   value={grupo.curso} />
          <MetaItem label="Ano"     value={grupo.ano} />
          <MetaItem label="Turma"   value={grupo.turma} />
          <MetaItem label="Matéria" value={grupo.materia} />
        </div>
      </Card>

      {/* Integrantes */}
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

        {/* Adicionar integrante */}
        <div className="uv-add-member">
          <p className="uv-add-member-title">Adicionar Integrante</p>
          <div className="uv-add-member-row">
            <Field label="Nome">
              <Input placeholder="Nome completo" value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)} />
            </Field>
            <Field label="Matrícula">
              <Input placeholder="Ex: 2026-0001" value={novaMatricula}
                onChange={(e) => setNovaMatricula(e.target.value)} />
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
