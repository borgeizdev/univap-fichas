/* Univap Fichas — Histórico de Avaliações (Aluno) */

function HistoricoAvaliacoes({ user }) {
  const toast = useToast();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [q,        setQ]       = useState("");
  const [filtDisc, setFiltDisc] = useState("");
  const [filtProf, setFiltProf] = useState("");
  const [detalhe,  setDetalhe]  = useState(null);

  useEffect(() => {
    apiGetAvals()
      .then(avals => setAvaliacoes(avals.filter(a =>
        a.criadorEmail === user.email ||
        (a.integrantesAval || []).some(x => x.nome === user.nome)
      )))
      .catch(e => toast(e.message || "Erro ao carregar avaliações.", "error"));
  }, [user.email]);

  const disciplinas = [...new Set(avaliacoes.map(a => a.disciplina))].sort();
  const professores  = [...new Set(avaliacoes.map(a => a.professorNome))].sort();

  const filtered = avaliacoes.filter(a =>
    (!q        || a.disciplina.toLowerCase().includes(q.toLowerCase()) ||
                  a.professorNome.toLowerCase().includes(q.toLowerCase())) &&
    (!filtDisc || a.disciplina === filtDisc) &&
    (!filtProf || a.professorNome === filtProf)
  ).sort((a, b) => b.data.localeCompare(a.data));

  if (detalhe) {
    return <DetalheAvaliacao aval={detalhe} user={user} onVoltar={() => setDetalhe(null)} />;
  }

  return (
    <>
      <PageHeading
        title="Histórico de Avaliações"
        sub={`${filtered.length} avaliação${filtered.length !== 1 ? "ões" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`}
      />

      <Card className="uv-filterbar">
        <div className="uv-filters">
          <div className="uv-filter-search">
            <Input icon="search" placeholder="Disciplina ou professor…"
              value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Select options={disciplinas} value={filtDisc} onChange={setFiltDisc} placeholder="Disciplina" />
          <Select options={professores}  value={filtProf} onChange={setFiltProf} placeholder="Professor" />
        </div>
        {(q || filtDisc || filtProf) && (
          <button className="uv-filter-clear"
            onClick={() => { setQ(""); setFiltDisc(""); setFiltProf(""); }}>
            <Icon name="x" size={14} /> Limpar filtros
          </button>
        )}
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon="clipboardList"
          title="Nenhuma avaliação encontrada"
          text={avaliacoes.length === 0
            ? "Você ainda não recebeu nenhuma avaliação. Crie um grupo e aguarde seu professor publicar."
            : "Tente ajustar os filtros acima."}
        />
      ) : (
        <div className="uv-hist-list">
          {filtered.map(a => (
            <HistCard key={a.id} aval={a} userName={user.nome} onClick={() => setDetalhe(a)} />
          ))}
        </div>
      )}
    </>
  );
}

function HistCard({ aval, userName, onClick }) {
  const minhaAval = aval.integrantesAval?.find(x => x.nome === userName);
  const nota = minhaAval?.nota ?? aval.nota;
  return (
    <button className="uv-hist-card" onClick={onClick} type="button">
      <div className="uv-hist-nota">
        {nota != null ? <NotaBadge nota={nota} big /> : <span className="uv-nota uv-nota-slate" style={{ fontSize: 20, padding: "6px 14px" }}>—</span>}
      </div>
      <div className="uv-hist-info">
        <span className="uv-hist-disc">{aval.disciplina}</span>
        <span className="uv-hist-meta">
          <Icon name="user" size={13} />
          {aval.professorNome}
          <span className="uv-hist-dot" />
          {fmtDataBR(aval.data)}
        </span>
      </div>
      <div className="uv-hist-right">
        <StatusBadge status={aval.status} />
        <Icon name="chevronRight" size={17} className="uv-hist-arrow" />
      </div>
    </button>
  );
}

function DetalheAvaliacao({ aval, user, onVoltar }) {
  const minhaAval = aval.integrantesAval?.find(x => x.nome === user.nome);

  return (
    <>
      <PageHeading
        title={aval.disciplina}
        sub={`Avaliação · ${fmtDataBR(aval.data)}`}
        action={<Button variant="ghost" icon="chevronLeft" onClick={onVoltar}>Voltar</Button>}
      />

      <div className="uv-det-nota-wrap">
        {minhaAval?.nota != null && (
          <div className="uv-det-nota-box">
            <span className="uv-det-nota-label">Sua Nota</span>
            <span className={`uv-det-nota-val uv-nota-${notaTone(minhaAval.nota)}`}>
              {minhaAval.nota.toFixed(1)}
            </span>
          </div>
        )}
        <StatusBadge status={aval.status} />
      </div>

      <Card className="uv-mb-card">
        <div className="uv-grupo-info-grid">
          <MetaItem label="Disciplina" value={aval.disciplina} />
          <MetaItem label="Professor"  value={aval.professorNome} />
          <MetaItem label="Data"       value={fmtDataBR(aval.data)} />
          <MetaItem label="Grupo"      value={aval.grupoNome} />
        </div>
      </Card>

      {minhaAval?.obs && (
        <Card className="uv-mb-card">
          <CardHead title="Observação Individual" />
          <p className="uv-det-texto">{minhaAval.obs}</p>
        </Card>
      )}

      {aval.anotacoes && (
        <Card className="uv-mb-card">
          <CardHead title="Observações do Professor" />
          <p className="uv-det-texto">{aval.anotacoes}</p>
        </Card>
      )}

      {(aval.positivos || aval.melhorar) && (
        <div className="uv-grid-2">
          {aval.positivos && (
            <Card>
              <CardHead title="Elogios" />
              <div className="uv-det-bloco pos">
                <Icon name="trendingUp" size={15} />
                <p>{aval.positivos}</p>
              </div>
            </Card>
          )}
          {aval.melhorar && (
            <Card>
              <CardHead title="Pontos de Melhoria" />
              <div className="uv-det-bloco neg">
                <Icon name="arrowRight" size={15} />
                <p>{aval.melhorar}</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

Object.assign(window, { HistoricoAvaliacoes, HistCard, DetalheAvaliacao });
