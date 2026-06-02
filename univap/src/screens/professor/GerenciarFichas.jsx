/* Univap Fichas — Gerenciar Fichas */
function fmtData(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function GerenciarFichas({ user, onView }) {
  const [q,        setQ]        = useState("");
  const [filtDisc, setFiltDisc] = useState("");

  const todasAvals = loadAvaliacoes().filter(a => a.professorEmail === user?.email);
  const disciplinas = [...new Set(todasAvals.map(a => a.disciplina))].sort();

  const filtered = todasAvals.filter(a =>
    (!q || a.grupoNome.toLowerCase().includes(q.toLowerCase()) ||
           a.disciplina.toLowerCase().includes(q.toLowerCase())) &&
    (!filtDisc || a.disciplina === filtDisc)
  ).sort((a, b) => b.data.localeCompare(a.data));

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
                    <td className="uv-td-muted">{fmtData(a.data)}</td>
                    <td><NotaBadge nota={a.nota} /></td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="ta-r">
                      <button className="uv-icon-btn sm" title="Ver ficha" onClick={() => onView(a)}>
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

Object.assign(window, { GerenciarFichas, fmtData });
