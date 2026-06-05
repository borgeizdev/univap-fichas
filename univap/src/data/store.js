/* Univap Fichas — utilitários compartilhados */

function fmtDataBR(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}
