/* Univap Fichas — Professor Início */
function PageHeading({ title, sub, action }) {
  return (
    <div className="uv-page-head">
      <div>
        <h1 className="uv-page-title">{title}</h1>
        {sub && <p className="uv-page-sub">{sub}</p>}
      </div>
      {action && <div className="uv-page-action">{action}</div>}
    </div>
  );
}

function ListRow({ label, right, tone, onClick }) {
  return (
    <button className="uv-list-row" onClick={onClick} type="button">
      <span className="uv-list-label">{label}</span>
      <span className={`uv-list-right ${tone ? "tone-" + tone : ""}`}>{right}</span>
    </button>
  );
}

function ProfInicio({ user, go }) {
  const avaliacoes = loadAvaliacoes().filter(a => a.professorEmail === user.email);
  const grupos = loadGrupos();
  const avaliados = new Set(avaliacoes.map(a => a.grupoNome));
  const pendentes = grupos.filter(g => !avaliados.has(g.nome));
  const ultimas = [...avaliacoes].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 3);
  const media = avaliacoes.length > 0
    ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length).toFixed(1)
    : "—";

  return (
    <>
      <PageHeading title={`Olá, ${user.nome}`} sub="Bem-vindo ao Univap Fichas" />

      <div className="uv-grid-3 uv-stats">
        <StatCard icon="clipboardList" label="Avaliações lançadas" value={avaliacoes.length} tone="blue" />
        <StatCard icon="clock"         label="Grupos pendentes"    value={pendentes.length}  tone="blue" />
        <StatCard icon="award"         label="Média geral"         value={media}             tone="blue" />
      </div>

      <div className="uv-grid-2">
        <Card>
          <CardHead title="Últimas avaliações"
            action={<Button size="sm" variant="ghost" onClick={() => go("fichas")}>Ver todas</Button>} />
          {ultimas.length === 0 ? (
            <EmptyState icon="clipboardList" title="Nenhuma avaliação ainda"
              text="Clique em Nova Ficha para lançar sua primeira avaliação." />
          ) : (
            <div className="uv-list">
              {ultimas.map(a => (
                <div key={a.id} className="uv-list-row rich static">
                  <div className="uv-list-rich-left">
                    <span className="uv-list-label">{a.grupoNome}</span>
                    <span className="uv-list-meta">{a.disciplina} · {fmtDataBR(a.data)}</span>
                  </div>
                  <NotaBadge nota={a.nota} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHead title="Grupos pendentes"
            action={<Button size="sm" icon="clipboardPlus" onClick={() => go("nova")}>Avaliar</Button>} />
          {pendentes.length === 0 && grupos.length === 0 ? (
            <EmptyState icon="users" title="Nenhum grupo cadastrado"
              text="Aguarde os alunos criarem seus grupos." />
          ) : pendentes.length === 0 ? (
            <EmptyState icon="check" title="Todos avaliados"
              text="Todos os grupos já receberam ao menos uma avaliação." />
          ) : (
            <div className="uv-list">
              {pendentes.slice(0, 4).map((g, i) => (
                <div key={i} className="uv-list-row rich static">
                  <div className="uv-list-rich-left">
                    <span className="uv-list-label">{g.nome}</span>
                    <span className="uv-list-meta">
                      {(g.ano || "").replace(" ano", "")}{g.turma} · {g.curso}
                    </span>
                  </div>
                  <Badge tone="amber">Pendente</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

Object.assign(window, { ProfInicio, PageHeading, ListRow });
