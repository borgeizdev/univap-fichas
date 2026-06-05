/* Univap Fichas — Dashboard */
function StatCard({ icon, label, value, tone = "blue", delta }) {
  return (
    <Card className={`uv-stat tone-${tone}`}>
      <span className="uv-stat-label">{label}</span>
      <span className="uv-stat-value">{value}</span>
      {delta && <span className="uv-stat-delta"><Icon name="trendingUp" size={12} /> {delta}</span>}
    </Card>
  );
}

function Dashboard({ onView }) {
  const toast = useToast();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    Promise.all([apiGetAvals(), apiGetGrupos()])
      .then(([avals, grps]) => { setAvaliacoes(avals); setGrupos(grps); })
      .catch(e => toast(e.message || "Erro ao carregar dashboard.", "error"));
  }, []);

  const total    = avaliacoes.length;
  const avaliados = new Set(avaliacoes.map(a => a.grupoNome));
  const pend     = grupos.filter(g => !avaliados.has(g.nome)).length;
  const comNota  = avaliacoes.filter(a => a.nota != null);
  const media    = comNota.length > 0
    ? (comNota.reduce((s, a) => s + a.nota, 0) / comNota.length).toFixed(1)
    : "—";
  const numTurmas = [...new Set(grupos.map(g => `${(g.ano||"").replace(" ano","")}${g.turma}`))].length;

  const ultimas   = [...avaliacoes].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
  const pendentes = grupos.filter(g => !avaliados.has(g.nome)).slice(0, 5);

  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const mesesCount = {};
  avaliacoes.forEach(a => {
    const idx = parseInt((a.data || "").split("-")[1], 10) - 1;
    const mes = MESES[idx] || "?";
    mesesCount[mes] = (mesesCount[mes] || 0) + 1;
  });
  const avalPorMes = Object.entries(mesesCount).map(([mes, total]) => ({ mes, total }));

  const turmaSum = {}, turmaCount = {};
  avaliacoes.forEach(a => {
    if (a.nota == null) return;
    const g = grupos.find(x => x.nome === a.grupoNome);
    if (!g) return;
    const key = `${(g.ano||"").replace(" ano","")}${g.turma}`;
    turmaSum[key]   = (turmaSum[key]   || 0) + a.nota;
    turmaCount[key] = (turmaCount[key] || 0) + 1;
  });
  const mediaPorTurma = Object.entries(turmaSum)
    .map(([turma, sum]) => ({ turma, media: +(sum / turmaCount[turma]).toFixed(1) }));

  return (
    <>
      <PageHeading title="Dashboard" sub="Visão geral do sistema de avaliação" />

      <div className="uv-grid-4 uv-stats">
        <StatCard icon="clipboardList" label="Total de avaliações" value={total}     tone="blue" />
        <StatCard icon="clock"         label="Pendentes"           value={pend}      tone="blue" />
        <StatCard icon="award"         label="Média geral"         value={media}     tone="blue" />
        <StatCard icon="users"         label="Turmas ativas"       value={numTurmas} tone="blue" />
      </div>

      {avalPorMes.length > 0 && mediaPorTurma.length > 0 && (
        <div className="uv-grid-2 uv-charts">
          <Card>
            <CardHead title="Avaliações por mês" />
            <BarChart data={avalPorMes} />
          </Card>
          <Card>
            <CardHead title="Média por turma" sub="Escala de 0 a 10" />
            <LineChart data={mediaPorTurma} />
          </Card>
        </div>
      )}

      {total === 0 && grupos.length === 0 ? (
        <EmptyState icon="clipboardList" title="Sem dados ainda"
          text="Quando alunos criarem grupos e professores lançarem avaliações, o dashboard será preenchido automaticamente." />
      ) : (
        <div className="uv-grid-2">
          <Card>
            <CardHead title="Últimas avaliações" />
            {ultimas.length === 0 ? (
              <EmptyState icon="clipboardList" title="Nenhuma avaliação" text="Nenhuma avaliação lançada ainda." />
            ) : (
              <div className="uv-list">
                {ultimas.map(a => (
                  <button key={a.id} className="uv-list-row rich" onClick={() => onView(a)}>
                    <div className="uv-list-rich-left">
                      <span className="uv-list-label">{a.grupoNome}</span>
                      <span className="uv-list-meta">{a.disciplina} · {fmtDataBR(a.data)}</span>
                    </div>
                    {a.nota != null && <NotaBadge nota={a.nota} />}
                  </button>
                ))}
              </div>
            )}
          </Card>
          <Card>
            <CardHead title="Grupos sem avaliação" />
            {pendentes.length === 0 ? (
              <EmptyState icon="check" title="Todos avaliados"
                text="Todos os grupos já possuem pelo menos uma avaliação." />
            ) : (
              <div className="uv-list">
                {pendentes.map((g) => (
                  <div key={g.id} className="uv-list-row rich static">
                    <div className="uv-list-rich-left">
                      <span className="uv-list-label">{g.nome}</span>
                      <span className="uv-list-meta">
                        {(g.ano||"").replace(" ano","")}{g.turma} · {g.curso}
                      </span>
                    </div>
                    <StatusBadge status="Pendente" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

Object.assign(window, { Dashboard, StatCard });
