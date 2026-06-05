/* Univap Fichas — Gerenciar Fichas */
function GerenciarFichas({ user, onView }) {
  const toast = useToast();
  const [todasAvals, setTodasAvals] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [q,        setQ]        = useState("");
  const [filtDisc, setFiltDisc] = useState("");
  const [detalhe,  setDetalhe]  = useState(null);

  useEffect(() => {
    Promise.all([apiGetAvals(), apiGetGrupos()])
      .then(([avals, grps]) => {
        setTodasAvals(avals.filter(a => a.professorEmail === user?.email));
        setGrupos(grps);
      })
      .catch(e => toast(e.message || "Erro ao carregar fichas.", "error"));
  }, [user?.email]);

  const disciplinas = [...new Set(todasAvals.map(a => a.disciplina))].sort();

  const filtered = todasAvals.filter(a =>
    (!q || a.grupoNome.toLowerCase().includes(q.toLowerCase()) ||
           a.disciplina.toLowerCase().includes(q.toLowerCase())) &&
    (!filtDisc || a.disciplina === filtDisc)
  ).sort((a, b) => b.data.localeCompare(a.data));

  if (detalhe) {
    return <DetalheFichaPage aval={detalhe} grupos={grupos} onVoltar={() => setDetalhe(null)} />;
  }

  return (
    <>
      <PageHeading
        title="Gerenciar Fichas"
        sub={`${filtered.length} ficha${filtered.length !== 1 ? "s" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`}
      />

      <Card className="uv-filterbar">
        <div className="uv-filters">
          <div className="uv-filter-search">
            <Input icon="search" placeholder="Grupo ou disciplina…"
              value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Select options={disciplinas} value={filtDisc} onChange={setFiltDisc} placeholder="Disciplina" />
        </div>
        {(q || filtDisc) && (
          <button className="uv-filter-clear" onClick={() => { setQ(""); setFiltDisc(""); }}>
            <Icon name="x" size={14} /> Limpar filtros
          </button>
        )}
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon="folderOpen"
          title="Nenhuma ficha encontrada"
          text={todasAvals.length === 0
            ? "Você ainda não lançou nenhuma avaliação. Vá em Nova Ficha para começar."
            : "Tente ajustar os filtros acima."}
        />
      ) : (
        <Card>
          <div className="uv-table-wrap">
            <table className="uv-table">
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Disciplina</th>
                  <th>Data</th>
                  <th>Nota</th>
                  <th>Status</th>
                  <th className="ta-r"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td><span>{a.grupoNome}</span></td>
                    <td className="uv-td-muted">{a.disciplina}</td>
                    <td className="uv-td-muted">{fmtDataBR(a.data)}</td>
                    <td>{a.nota != null ? <NotaBadge nota={a.nota} /> : <span className="uv-td-muted">—</span>}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="ta-r">
                      <button className="uv-icon-btn sm" title="Ver ficha" onClick={() => setDetalhe(a)}>
                        <Icon name="eye" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

function DetalheFichaPage({ aval, grupos, onVoltar }) {
  const grupo = grupos.find(g => g.nome === aval.grupoNome);
  const integrantes = grupo ? grupo.integrantes : [];

  return (
    <>
      <PageHeading
        title={aval.grupoNome}
        sub={`Ficha de Avaliação · ${fmtDataBR(aval.data)}`}
        action={<Button variant="ghost" icon="chevronLeft" onClick={onVoltar}>Voltar</Button>}
      />

      <div className="uv-det-nota-wrap">
        <StatusBadge status={aval.status} />
      </div>

      <Card className="uv-mb-card">
        <div className="uv-grupo-info-grid">
          <MetaItem label="Disciplina"  value={aval.disciplina} />
          <MetaItem label="Professor"   value={aval.professorNome} />
          <MetaItem label="Data"        value={fmtDataBR(aval.data)} />
          <MetaItem label="Grupo"       value={aval.grupoNome} />
        </div>
      </Card>

      {integrantes.length > 0 && (
        <Card className="uv-mb-card">
          <CardHead title="Integrantes" sub={`${integrantes.length} membro${integrantes.length !== 1 ? "s" : ""}`} />
          <ol className="uv-integrantes" style={{ padding: "6px 4px 2px" }}>
            {integrantes.map((m, i) => {
              const ia = (aval.integrantesAval || []).find(x => x.matricula === m.matricula);
              return (
                <li key={`${m.nome}-${m.matricula}`} className="uv-integrante">
                  <Avatar nome={m.nome} size={32} idx={i} />
                  <div className="uv-integrante-info">
                    <span className="uv-integrante-nome">
                      {m.nome}
                      {m.lider && <Badge tone="blue" className="uv-lider-badge">Líder</Badge>}
                    </span>
                    <span className="uv-integrante-mat">Matrícula {m.matricula}</span>
                    {ia?.obs && <span className="uv-integrante-obs">{ia.obs}</span>}
                  </div>
                  {ia?.nota != null && (
                    <div className="uv-integrante-nota-right"><NotaBadge nota={ia.nota} /></div>
                  )}
                </li>
              );
            })}
          </ol>
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

Object.assign(window, { GerenciarFichas, DetalheFichaPage });
