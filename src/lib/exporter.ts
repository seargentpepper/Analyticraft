import { CardTheme, ChartConfig } from "../types/dashboard";
import { getTheme } from "./themes";
import {
  accentColor,
  buildChartOption,
  buildRingsLegend,
  Row,
} from "./chartOptions";

interface ExportOptions {
  projectName: string;
  theme: CardTheme;
  charts: {
    config: ChartConfig;
    data: Row[];
  }[];
}

/** JSON that is safe to inline inside a <script> tag. */
export function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateStandaloneHTML({
  projectName,
  theme,
  charts,
}: ExportOptions): string {
  const t = getTheme(theme);

  // Everything the browser needs is precomputed here so the exported file has
  // zero dependencies besides the ECharts CDN script.
  const items = charts.map(({ config, data }) => ({
    config: {
      title: config.title,
      type: config.type,
      aggregation: config.aggregation,
      metricCol: config.metricCol,
      dimensionCol: config.dimensionCol,
      description: config.description ?? "",
    },
    rows: data,
    option: ["bar", "line", "area", "pie", "rings"].includes(config.type)
      ? buildChartOption(config, data, t)
      : null,
    legend: config.type === "rings" ? buildRingsLegend(data, t) : [],
    accent: accentColor(t, 0),
  }));

  const fontFamily = t.fontFamily ?? "'Plus Jakarta Sans', system-ui, sans-serif";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(projectName)} - Analyticraft Report</title>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #131315;
      --card-bg: ${t.cardBg};
      --card-border: ${t.cardBorder};
      --text-main: ${t.text};
      --text-muted: ${t.subtext};
      --accent: ${accentColor(t, 0)};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: ${fontFamily}; }
    body { background: var(--bg); color: #f1f5f9; min-height: 100vh; padding: 2rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.25rem; border-bottom: 1px solid #2c2c2e; }
    .badge { display: inline-block; font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #fff; background: #2c2c2e; border: 1px solid #48484a; padding: 3px 9px; border-radius: 4px; margin-bottom: .5rem; }
    h1 { font-size: 1.7rem; font-weight: 800; letter-spacing: -.02em; color: #fff; }
    .meta { font-size: .8rem; color: #98989d; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 1.25rem; }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 1.1rem; display: flex; flex-direction: column; }
    .card-header { margin-bottom: .85rem; padding-bottom: .55rem; border-bottom: 1px solid var(--card-border); }
    .card-title { font-size: 1rem; font-weight: 700; color: var(--text-main); }
    .card-subtitle { font-size: .72rem; color: var(--text-muted); font-weight: 600; margin-top: 2px; }
    .chart-box { width: 100%; height: 280px; }
    .chart-box.rings { height: 230px; }
    .kpi-box { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; text-align: center; }
    .kpi-value { font-size: 3.2rem; font-weight: 900; color: var(--accent); line-height: 1; margin-bottom: .5rem; }
    .kpi-label { font-size: .9rem; color: var(--text-muted); font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: .82rem; }
    th, td { padding: .6rem .8rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,.06); }
    th { color: var(--text-main); font-weight: 800; background: rgba(0,0,0,.2); }
    td { color: var(--text-muted); font-weight: 600; }
    .table-container { max-height: 300px; overflow-y: auto; }
    .legend { display: flex; flex-wrap: wrap; gap: .4rem .9rem; justify-content: center; margin-top: .4rem; }
    .legend-item { display: flex; align-items: center; gap: .35rem; font-size: .75rem; font-weight: 700; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .legend-value { color: var(--text-muted); }
    .note { margin-top: .6rem; padding-top: .5rem; border-top: 1px dashed var(--card-border); font-size: .72rem; color: var(--text-muted); font-weight: 500; }
    footer { margin-top: 2.5rem; text-align: center; font-size: .78rem; color: #8e8e93; }
  </style>
</head>
<body>
  <header>
    <div>
      <span class="badge">Analyticraft Standalone Report</span>
      <h1>${escapeHtml(projectName)}</h1>
    </div>
    <div class="meta">Generado localmente · Autocontenido</div>
  </header>

  <main class="grid" id="chart-grid"></main>

  <footer>Generado por <strong>Analyticraft</strong> — Business Intelligence local-first para PyMEs.</footer>

  <script>
    const items = ${safeJson(items)};
    const grid = document.getElementById("chart-grid");
    const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    const nf = (n, d) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: d }).format(n);

    items.forEach((item, index) => {
      const cfg = item.config;
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML =
        '<div class="card-header"><div class="card-title">' + esc(cfg.title) + '</div>' +
        '<div class="card-subtitle">' + esc(cfg.aggregation) + '(' + esc(cfg.metricCol) + ') según ' + esc(cfg.dimensionCol) + '</div></div>';

      const body = document.createElement("div");
      card.appendChild(body);
      grid.appendChild(card);

      if (cfg.type === "kpi") {
        const value = Number((item.rows[0] || {}).metric) || 0;
        body.innerHTML = '<div class="kpi-box"><div class="kpi-value">' + nf(value, 1) +
          '</div><div class="kpi-label">' + esc(cfg.aggregation) + ' de ' + esc(cfg.metricCol) + '</div></div>';
      } else if (cfg.type === "table") {
        const rowsHtml = item.rows.map(r =>
          '<tr><td>' + esc(r.dimension ?? "N/A") + '</td><td>' + nf(Number(r.metric) || 0, 2) + '</td></tr>').join("");
        body.innerHTML = '<div class="table-container"><table><thead><tr><th>' + esc(cfg.dimensionCol) +
          '</th><th>' + esc(cfg.aggregation) + '(' + esc(cfg.metricCol) + ')</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div>';
      } else if (item.option) {
        const box = document.createElement("div");
        box.className = "chart-box" + (cfg.type === "rings" ? " rings" : "");
        body.appendChild(box);
        const chart = echarts.init(box, null, { renderer: "canvas" });
        chart.setOption(item.option);
        window.addEventListener("resize", () => chart.resize());

        if (item.legend && item.legend.length) {
          const legend = document.createElement("div");
          legend.className = "legend";
          legend.innerHTML = item.legend.map(l =>
            '<div class="legend-item"><span class="dot" style="background:' + esc(l.color) + '"></span>' +
            '<span style="color:' + esc(l.color) + '">' + esc(l.label) + '</span>' +
            '<span class="legend-value">' + esc(l.value) + '</span></div>').join("");
          body.appendChild(legend);
        }
      }

      if (cfg.description && cfg.description.trim()) {
        const note = document.createElement("div");
        note.className = "note";
        note.textContent = cfg.description;
        card.appendChild(note);
      }
    });
  </script>
</body>
</html>`;
}
