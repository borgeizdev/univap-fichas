/* Univap Fichas — misc: ficha viewer + placeholders */
function ViewFichaModal({ aval, onClose }) {
  const grupo = loadGrupos().find(g => g.nome === aval.grupoNome);
  const integrantes = grupo ? grupo.integrantes : [];
  return (
    <div className="uv-drawer-scrim" onClick={onClose}>
      <aside className="uv-drawer uv-anim-right" onClick={(e) => e.stopPropagation()}>

        <div className="uv-drawer-head">
          <div>
            <div className="uv-drawer-eyebrow">Ficha de Avaliação</div>
            <h2 className="uv-drawer-title">{aval.grupoNome}</h2>
          </div>
          <button className="uv-icon-btn" onClick={onClose} aria-label="Fechar">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="uv-drawer-body">

          {/* Nota + status unificados */}
          <div className="uv-ficha-hero">
            <div className="uv-ficha-hero-left">
              <span className="uv-ficha-nota-val uv-nota-big uv-nota-{notaTone(aval.nota)}"
                style={{ color: `var(--${notaTone(aval.nota) === "green" ? "green" : notaTone(aval.nota) === "amber" ? "amber" : "red"})` }}>
                {aval.nota.toFixed(1)}
              </span>
              <span className="uv-ficha-nota-label">Nota final</span>
            </div>
            <StatusBadge status={aval.status} />
          </div>

          {/* Metadados */}
          <div className="uv-view-meta">
            <MetaItem label="Disciplina" value={aval.disciplina} />
            <MetaItem label="Professor"  value={aval.professorNome} />
            <MetaItem label="Data"       value={fmtDataBR(aval.data)} />
            <MetaItem label="Grupo"      value={aval.grupoNome} />
          </div>

          {/* Integrantes */}
          {integrantes.length > 0 && (
            <div className="uv-ficha-section">
              <span className="uv-ficha-section-title">Integrantes</span>
              <ol className="uv-integrantes">
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
            </div>
          )}

          {/* Anotações */}
          {aval.anotacoes && (
            <div className="uv-ficha-section">
              <span className="uv-ficha-section-title">Anotações do Professor</span>
              <p className="uv-view-text">{aval.anotacoes}</p>
            </div>
          )}

          {/* Pontos */}
          {(aval.positivos || aval.melhorar) && (
            <div className="uv-grid-2 uv-gap-sm">
              {aval.positivos && (
                <div className="uv-view-box pos">
                  <span className="uv-view-box-title pos">Pontos positivos</span>
                  <p>{aval.positivos}</p>
                </div>
              )}
              {aval.melhorar && (
                <div className="uv-view-box neg">
                  <span className="uv-view-box-title neg">Pontos a melhorar</span>
                  <p>{aval.melhorar}</p>
                </div>
              )}
            </div>
          )}

        </div>

        <div className="uv-drawer-foot">
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </div>
      </aside>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="uv-meta-item">
      <span className="uv-mini-label">{label}</span>
      <span className="uv-meta-value">{value || "—"}</span>
    </div>
  );
}

function ComingSoon({ title, sub, icon = "layoutGrid" }) {
  return (
    <>
      <PageHeading title={title} sub={sub} />
      <EmptyState icon={icon} title="Em desenvolvimento"
        text="Esta área faz parte do roadmap do sistema." />
    </>
  );
}

Object.assign(window, { ViewFichaModal, MetaItem, ComingSoon });
