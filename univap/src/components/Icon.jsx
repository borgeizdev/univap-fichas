/* Univap Fichas — icon set (curated Lucide-style line icons) */
const ICON_PATHS = {
  home: "M3 10.2 12 3l9 7.2M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5",
  clipboardPlus: "M9 4H8a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM12 11v6M9 14h6",
  clipboardList: "M9 4H8a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM9 12h6M9 16h6M9 8.01",
  folderOpen: "M4 8a2 2 0 0 1 2-2h3.5l1.6 1.8H18a2 2 0 0 1 2 2H6a2 2 0 0 0-1.9 1.4L4 16zM4 16l1.6-5.2A2 2 0 0 1 7.5 9.4H21l-1.9 5.9A2 2 0 0 1 17.2 17H6a2 2 0 0 1-2-1z",
  barChart: "M3 3v18h18M8 16v-5M13 16V8M18 16v-9",
  fileText: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6M9 9h1",
  user: "M20 21v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  users: "M16 21v-1a4 4 0 0 0-3-3.87M16 3.5a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1",
  settings: "M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4",
  logOut: "M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  check: "M20 6 9 17l-5-5",
  checkCircle: "M9 12l2 2 4-4M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  x: "M18 6 6 18M6 6l12 12",
  xCircle: "M15 9l-6 6M9 9l6 6M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  download: "M12 3v12M7 10l5 5 5-5M5 21h14",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  edit: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  chevronDown: "M6 9l6 6 6-6",
  menu: "M4 6h16M4 12h16M4 18h16",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  calendar: "M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  filter: "M3 5h18l-7 8v6l-4 2v-8z",
  award: "M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.5 12.5 7 21l5-3 5 3-1.5-8.5",
  trendingUp: "M3 17l6-6 4 4 8-8M21 7h-5M21 7v5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  layoutGrid: "M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4z",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  graduationCap: "M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5M22 10v6",
  pen: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z",
};

function Icon({ name, size = 20, strokeWidth = 1.8, className = "", style = {} }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    React.createElement("svg", {
      width: size, height: size, viewBox: "0 0 24 24", fill: "none",
      stroke: "currentColor", strokeWidth, strokeLinecap: "round",
      strokeLinejoin: "round", className, style, "aria-hidden": "true",
    }, d.split("M").filter(Boolean).map((seg, i) =>
      React.createElement("path", { key: i, d: "M" + seg })
    ))
  );
}

window.Icon = Icon;
window.ICON_PATHS = ICON_PATHS;
