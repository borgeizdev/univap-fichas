/* Univap Fichas — UI kit */
const { useState, useEffect, useRef, createContext, useContext } = React;

/* ---------- Button ---------- */
function Button({ variant = "primary", size = "md", icon, iconRight, children, className = "", ...rest }) {
  return (
    <button className={`uv-btn uv-btn-${variant} uv-btn-${size} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 16 : 18} />}
    </button>
  );
}

/* ---------- Card ---------- */
function Card({ children, className = "", hover = false, ...rest }) {
  return <div className={`uv-card ${hover ? "uv-card-hover" : ""} ${className}`} {...rest}>{children}</div>;
}
function CardHead({ title, sub, action }) {
  return (
    <div className="uv-card-head">
      <div>
        <h3 className="uv-card-title">{title}</h3>
        {sub && <p className="uv-card-sub">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Badge ---------- */
const STATUS_TONE = {
  "Pendente": "amber", "Em avaliação": "blue", "Avaliado": "green",
  "Rascunho": "slate", "Publicada": "green", "Revisada": "violet",
};
const STATUS_DOT = {
  "Publicada": "green", "Avaliado": "green", "Revisada": "green",
  "Pendente": "red", "Em avaliação": "amber", "Rascunho": "slate",
};
function Badge({ children, tone = "slate", dot = false, className = "" }) {
  return (
    <span className={`uv-badge uv-badge-${tone} ${className}`}>
      {dot && <span className="uv-badge-dot" />}
      {children}
    </span>
  );
}
function StatusBadge({ status }) {
  const dot = STATUS_DOT[status] || "slate";
  return (
    <span className="uv-status-badge">
      <span className={`uv-status-dot uv-status-dot-${dot}`} />
      {status}
    </span>
  );
}
function notaTone(n) { return n >= 7 ? "green" : n >= 5 ? "amber" : "red"; }
function NotaBadge({ nota, big = false }) {
  return <span className={`uv-nota uv-nota-${notaTone(nota)} ${big ? "uv-nota-big" : ""}`}>{nota.toFixed(1)}</span>;
}

/* ---------- Inputs ---------- */
function Field({ label, hint, error, children }) {
  return (
    <label className="uv-field">
      {label && <span className="uv-field-label">{label}</span>}
      {children}
      {error ? <span className="uv-field-error">{error}</span>
        : hint ? <span className="uv-field-hint">{hint}</span> : null}
    </label>
  );
}
function Input({ icon, error, className = "", ...rest }) {
  return (
    <div className={`uv-input-wrap ${icon ? "has-icon" : ""} ${error ? "is-error" : ""}`}>
      {icon && <Icon name={icon} size={18} className="uv-input-icon" />}
      <input className={`uv-input ${className}`} {...rest} />
    </div>
  );
}
function PasswordInput({ error, className = "", ...rest }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className={`uv-input-wrap has-eye ${error ? "is-error" : ""}`}>
      <input className={`uv-input ${className}`} type={show ? "text" : "password"} {...rest} />
      <button type="button" className="uv-input-eye" tabIndex={-1}
        onClick={() => setShow(s => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
        <Icon name={show ? "eyeOff" : "eye"} size={16} />
      </button>
    </div>
  );
}
function Textarea({ error, className = "", ...rest }) {
  return <textarea className={`uv-input uv-textarea ${error ? "is-error" : ""} ${className}`} {...rest} />;
}
function Select({ options = [], value, onChange, placeholder, error, ...rest }) {
  return (
    <div className={`uv-select-wrap ${error ? "is-error" : ""}`}>
      <select className="uv-input uv-select" value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <Icon name="chevronDown" size={16} className="uv-select-caret" />
    </div>
  );
}

/* ---------- Avatar ---------- */
function avInitials(nome) {
  const p = nome.replace(/^Prof\.?ª?\s*/i, "").trim().split(" ");
  return ((p[0]?.[0] || "") + (p[p.length - 1]?.[0] || "")).toUpperCase();
}
function Avatar({ nome, size = 34, idx = 0 }) {
  const hues = [212, 198, 224, 188, 232];
  const h = hues[idx % hues.length];
  return (
    <span className="uv-avatar" style={{
      width: size, height: size, fontSize: size * 0.38,
      background: `oklch(0.92 0.04 ${h})`, color: `oklch(0.42 0.10 ${h})`,
    }} title={nome}>{avInitials(nome)}</span>
  );
}
function AvatarStack({ nomes, max = 4, size = 30 }) {
  const shown = nomes.slice(0, max);
  const extra = nomes.length - shown.length;
  return (
    <div className="uv-avatar-stack">
      {shown.map((n, i) => (
        <span key={i} style={{ marginLeft: i ? -size * 0.32 : 0, zIndex: 10 - i }}>
          <Avatar nome={n} size={size} idx={i} />
        </span>
      ))}
      {extra > 0 && (
        <span className="uv-avatar uv-avatar-extra" style={{ width: size, height: size, fontSize: size * 0.36, marginLeft: -size * 0.32 }}>+{extra}</span>
      )}
    </div>
  );
}

/* ---------- Toast ---------- */
const ToastCtx = createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (msg, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="uv-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`uv-toast uv-toast-${t.tone}`}>
            <Icon name={t.tone === "success" ? "checkCircle" : "bell"} size={18} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

/* ---------- Charts ---------- */
function BarChart({ data, max, height = 180, valueKey = "total", labelKey = "mes" }) {
  const m = max || Math.max(...data.map((d) => d[valueKey])) * 1.15;
  const w = 100 / data.length;
  return (
    <div className="uv-chart" style={{ height }}>
      <div className="uv-bars">
        {data.map((d, i) => (
          <div key={i} className="uv-bar-col" style={{ width: `${w}%` }}>
            <div className="uv-bar-track">
              <div className="uv-bar-fill" style={{ height: `${(d[valueKey] / m) * 100}%` }}>
                <span className="uv-bar-val">{d[valueKey]}</span>
              </div>
            </div>
            <span className="uv-bar-label">{d[labelKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data, height = 200, valueKey = "media", labelKey = "turma", min = 0, max = 10 }) {
  const W = 520, H = height, padX = 34, padY = 26;
  const innerW = W - padX * 2, innerH = H - padY * 2;
  const xs = (i) => padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const ys = (v) => padY + innerH - ((v - min) / (max - min)) * innerH;
  const pts = data.map((d, i) => [xs(i), ys(d[valueKey])]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0].toFixed(1)} ${(padY + innerH).toFixed(1)} L${pts[0][0].toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;
  const grid = [0, 2.5, 5, 7.5, 10];
  return (
    <svg className="uv-linechart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height }}>
      {grid.map((g, i) => (
        <g key={i}>
          <line x1={padX} x2={W - padX} y1={ys(g)} y2={ys(g)} className="uv-grid-line" />
          <text x={padX - 8} y={ys(g) + 4} className="uv-axis-label" textAnchor="end">{g}</text>
        </g>
      ))}
      <path d={area} className="uv-line-area" />
      <path d={path} className="uv-line-path" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4.5" className="uv-line-dot" />
          <text x={p[0]} y={H - 6} className="uv-axis-label" textAnchor="middle">{data[i][labelKey]}</text>
        </g>
      ))}
    </svg>
  );
}

Object.assign(window, {
  Button, Card, CardHead, Badge, StatusBadge, NotaBadge, notaTone,
  Field, Input, PasswordInput, Textarea, Select, Avatar, AvatarStack, avInitials,
  ToastProvider, useToast, BarChart, LineChart, STATUS_TONE,
});
