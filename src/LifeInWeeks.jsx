import { useState, useRef, useEffect, useCallback } from "react";

const PALETTES = {
  "Full Custom": [
    { id: 1, name: "Infancy", startAge: 0, endAge: 2, color: "#8B5CF6" },
    { id: 2, name: "Early Childhood", startAge: 3, endAge: 5, color: "#D946EF" },
    { id: 3, name: "Elementary", startAge: 6, endAge: 11, color: "#F43F5E" },
    { id: 4, name: "Adolescence", startAge: 12, endAge: 17, color: "#F97316" },
    { id: 5, name: "Higher Education", startAge: 18, endAge: 22, color: "#EAB308" },
    { id: 6, name: "Early Career", startAge: 23, endAge: 35, color: "#22C55E" },
    { id: 7, name: "Peak Career", startAge: 36, endAge: 55, color: "#06B6D4" },
    { id: 8, name: "Pre-Retirement", startAge: 56, endAge: 64, color: "#3B82F6" },
    { id: 9, name: "Retirement", startAge: 65, endAge: 90, color: "#6366F1" },
  ],
  Heatmap: [
    { id: 1, name: "Infancy", startAge: 0, endAge: 2, color: "#5E4FA2" },
    { id: 2, name: "Early Childhood", startAge: 3, endAge: 5, color: "#3288BD" },
    { id: 3, name: "Elementary", startAge: 6, endAge: 11, color: "#66C2A5" },
    { id: 4, name: "Adolescence", startAge: 12, endAge: 17, color: "#ABDDA4" },
    { id: 5, name: "Higher Education", startAge: 18, endAge: 22, color: "#E6F598" },
    { id: 6, name: "Early Career", startAge: 23, endAge: 35, color: "#FEE08B" },
    { id: 7, name: "Peak Career", startAge: 36, endAge: 55, color: "#FDAE61" },
    { id: 8, name: "Pre-Retirement", startAge: 56, endAge: 64, color: "#F46D43" },
    { id: 9, name: "Retirement", startAge: 65, endAge: 90, color: "#D53E4F" },
  ],
  Pastel: [
    { id: 1, name: "Infancy", startAge: 0, endAge: 2, color: "#FFB3BA" },
    { id: 2, name: "Early Childhood", startAge: 3, endAge: 5, color: "#FFDFBA" },
    { id: 3, name: "Elementary", startAge: 6, endAge: 11, color: "#FFFFBA" },
    { id: 4, name: "Adolescence", startAge: 12, endAge: 17, color: "#B9F2FF" },
    { id: 5, name: "Higher Education", startAge: 18, endAge: 22, color: "#BAFFC9" },
    { id: 6, name: "Early Career", startAge: 23, endAge: 35, color: "#E2BAFF" },
    { id: 7, name: "Peak Career", startAge: 36, endAge: 55, color: "#FFC4E1" },
    { id: 8, name: "Pre-Retirement", startAge: 56, endAge: 64, color: "#FDE2E4" },
    { id: 9, name: "Retirement", startAge: 65, endAge: 90, color: "#E2F0CB" },
  ],
  Basic: [
    { id: 1, name: "Infancy", startAge: 0, endAge: 2, color: "#FF9B71" },
    { id: 2, name: "Early Childhood", startAge: 3, endAge: 5, color: "#FFD93D" },
    { id: 3, name: "Elementary", startAge: 6, endAge: 11, color: "#FF6B9D" },
    { id: 4, name: "Adolescence", startAge: 12, endAge: 17, color: "#B57BFF" },
    { id: 5, name: "Higher Education", startAge: 18, endAge: 22, color: "#4CC9F0" },
    { id: 6, name: "Early Career", startAge: 23, endAge: 35, color: "#4ADE80" },
    { id: 7, name: "Peak Career", startAge: 36, endAge: 55, color: "#38BDF8" },
    { id: 8, name: "Pre-Retirement", startAge: 56, endAge: 64, color: "#FB923C" },
    { id: 9, name: "Retirement", startAge: 65, endAge: 90, color: "#FDE68A" },
  ],
  "Black & White": [
    { id: 1, name: "Infancy", startAge: 0, endAge: 2, color: "#FFFFFF" },
    { id: 2, name: "Early Childhood", startAge: 3, endAge: 5, color: "#E6E6E6" },
    { id: 3, name: "Elementary", startAge: 6, endAge: 11, color: "#CCCCCC" },
    { id: 4, name: "Adolescence", startAge: 12, endAge: 17, color: "#B3B3B3" },
    { id: 5, name: "Higher Education", startAge: 18, endAge: 22, color: "#999999" },
    { id: 6, name: "Early Career", startAge: 23, endAge: 35, color: "#808080" },
    { id: 7, name: "Peak Career", startAge: 36, endAge: 55, color: "#4D4D4D" },
    { id: 8, name: "Pre-Retirement", startAge: 56, endAge: 64, color: "#1A1A1A" },
    { id: 9, name: "Retirement", startAge: 65, endAge: 90, color: "#000000" },
  ]
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_COL = [0, 4, 8, 13, 17, 21, 26, 30, 35, 39, 43, 48];

const EXPORT_PRESETS = [
  { label: "HD  (1×)", cellPx: 14, gapPx: 3 },
  { label: "2K  (2×)", cellPx: 20, gapPx: 4 },
  { label: "4K  (3×)", cellPx: 28, gapPx: 5 },
  { label: "iPhone Pro", cellPx: 22, gapPx: 4 },
  { label: "A3 Print", cellPx: 34, gapPx: 6 },
];

function drawLifeGrid(canvas, {
  birthday, phases, title, darkMode, showLegend, showTitle, gridOnly, rounding,
  cellPx = 10, gapPx = 2,
}) {
  const birthDate = new Date(birthday + "T00:00:00");
  const now = new Date();

  // Calculate lived weeks precisely
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const livedWeeks = Math.max(0, Math.floor((now - birthDate) / msPerWeek));
  const totalWeeks = 90 * 52;

  const age = ((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
  const bornStr = `Born ${birthDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
  const ageStr = `Age ${isNaN(age) ? '0' : age}`;

  const getColor = (absWeek) => {
    const a = absWeek / 52;
    for (const ph of phases) {
      if (a >= ph.startAge && a <= ph.endAge + 1) return ph.color;
    }
    return null;
  };

  const step = cellPx + gapPx;
  const gridW = 52 * step - gapPx;
  const gridH = 90 * step - gapPx;

  let labelW = 0, padX = cellPx * 4, padY = cellPx * 4;
  let headerH = 0, monthLabelH = 0, legendH = 0;

  if (!gridOnly) {
    labelW = cellPx * 4.5;
    padX = cellPx * 5;
    padY = cellPx * 6;
    headerH = cellPx * 18;
    monthLabelH = cellPx * 2.5;
    if (showLegend) {
      const cols = 4;
      const rows = Math.ceil(phases.length / cols);
      legendH = cellPx * 3 + (rows * cellPx * 2);
    }
    if (!showTitle) {
      headerH -= cellPx * 4.5; // reduce header height if title off
    }
  }

  const padLeft = padX + labelW;
  const padRight = padX + labelW;

  canvas.width = Math.round(padLeft + gridW + padRight);
  canvas.height = Math.round(padY + headerH + monthLabelH + gridH + legendH + padY);

  const ctx = canvas.getContext("2d");
  const BG = darkMode ? "#070B14" : "#F8F7F3";
  const INK = darkMode ? "#FFFFFF" : "#0A0A0A";
  const MUTED = darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const FUTURE_F = darkMode ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.055)";
  const FUTURE_S = darkMode ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let gridStartX = padLeft;
  let gridStartY = padY;

  // ── Header ────────────────────────────────────────────────
  if (!gridOnly) {
    const cx = canvas.width / 2;
    let currentY = padY + cellPx * 2;

    if (showTitle) {
      // Title
      const titleSize = Math.round(cellPx * 2.6);
      ctx.fillStyle = INK;
      ctx.font = `900 ${titleSize}px 'Inter', sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(title.toUpperCase(), cx, currentY);
      currentY += cellPx * 4;
    } else {
      currentY += cellPx;
    }

    // Loading Bar
    const barW = cellPx * 30;
    const barH = Math.max(Math.round(cellPx * 0.9), 5);

    // Bar Background
    ctx.fillStyle = darkMode ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.05)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cx - barW / 2, currentY, barW, barH, barH / 2);
    else ctx.rect(cx - barW / 2, currentY, barW, barH);
    ctx.fill();

    // Border
    ctx.strokeStyle = darkMode ? "#FFFFFF" : "#E5E5E5";
    ctx.lineWidth = Math.max(1, cellPx * 0.1);
    ctx.stroke();

    // Bar Fill
    const fillPerc = Math.min(1, Math.max(0, livedWeeks / totalWeeks));
    const fillW = isNaN(fillPerc) ? 0 : barW * fillPerc;
    ctx.fillStyle = darkMode ? "#FFFFFF" : "#0A0A0A";
    if (fillW > 0) {
      ctx.beginPath();
      // Only round the left corners and potentially right corners based on progression
      if (ctx.roundRect) ctx.roundRect(cx - barW / 2, currentY, fillW, barH, barH / 2);
      else ctx.rect(cx - barW / 2, currentY, fillW, barH);
      ctx.fill();
    }

    // Pass / Left % Text
    const pctPassed = (fillPerc * 100).toFixed(1) + "%";
    const pctLeft = ((1 - fillPerc) * 100).toFixed(1) + "%";

    currentY += cellPx * 2.5;
    const pctSize = Math.max(Math.round(cellPx * 0.9), 8);
    ctx.font = `600 ${pctSize}px 'Inter', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = INK;
    ctx.fillText(`${pctPassed} PASSED   ·   ${pctLeft} REMAINING`, cx, currentY);

    // Born On
    const subSize = Math.round(cellPx * 1.1);
    currentY += cellPx * 3.5;
    ctx.font = `500 ${subSize}px 'Inter', sans-serif`;
    ctx.fillStyle = MUTED;
    ctx.fillText(bornStr, cx, currentY);

    // Age
    currentY += cellPx * 2;
    ctx.fillText(ageStr, cx, currentY);

    // ── Month labels ─────────────────────────────────────────
    let birthMonthIdx = isNaN(birthDate.getMonth()) ? 0 : birthDate.getMonth();
    const shiftedMonths = [...MONTHS.slice(birthMonthIdx), ...MONTHS.slice(0, birthMonthIdx)];

    gridStartY = padY + headerH + monthLabelH;

    const mFont = Math.max(Math.round(cellPx * 0.9), 7);
    ctx.font = `600 ${mFont}px 'Inter', sans-serif`;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "left";
    MONTH_COL.forEach((col, i) => {
      ctx.fillText(shiftedMonths[i], gridStartX + col * step, gridStartY - cellPx * 1.5);
    });
  }

  // ── Grid ─────────────────────────────────────────────────
  const yFont = Math.max(Math.round(cellPx * 0.9), 7);
  const radius = cellPx * rounding;

  for (let yr = 0; yr < 90; yr++) {
    const cy = Math.round(gridStartY + yr * step);

    // year label every 5 years
    if (!gridOnly && yr % 5 === 0) {
      ctx.font = `500 ${yFont}px 'Inter', sans-serif`;
      ctx.fillStyle = MUTED;
      ctx.textAlign = "right";
      ctx.fillText(`${yr}`, gridStartX - Math.round(gapPx * 2.5), cy + cellPx * 0.85);
    }

    for (let wk = 0; wk < 52; wk++) {
      const abs = yr * 52 + wk;
      const x = Math.round(gridStartX + wk * step);
      const col = getColor(abs);

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, cy, cellPx, cellPx, radius);
      } else {
        ctx.rect(x, cy, cellPx, cellPx);
      }

      if (abs < livedWeeks) {
        ctx.fillStyle = col || (darkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)");
        ctx.fill();
      } else if (abs === livedWeeks) {
        ctx.save();
        ctx.shadowColor = darkMode ? "#FFFFFF" : "#0A0A0A";
        ctx.shadowBlur = cellPx * 1.5;
        ctx.fillStyle = INK;
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = FUTURE_F;
        ctx.fill();
        ctx.strokeStyle = FUTURE_S;
        ctx.lineWidth = Math.max(0.4, cellPx * 0.08);
        ctx.stroke();
      }
    }
  }

  // ── Legend ───────────────────────────────────────────────
  if (!gridOnly && showLegend) {
    const legTopY = Math.round(gridStartY + 90 * step + cellPx * 4);
    const legFont = Math.max(Math.round(cellPx * 0.9), 7);
    const swatchSz = Math.round(cellPx * 1.0);

    ctx.font = `500 ${legFont}px 'Inter', sans-serif`;
    ctx.textAlign = "left";

    // Layout as a 4-column grid, bounded by gridW
    const cols = 4;
    const colWidth = Math.floor(gridW / cols);
    const rowHeight = cellPx * 2; // tighter vertical space

    for (let i = 0; i < phases.length; i++) {
      const ph = phases[i];
      const r = Math.floor(i / cols);
      const c = i % cols;

      // Calculate X to align with the columns within the grid width limits
      const x = gridStartX + (c * colWidth);
      const y = legTopY + (r * rowHeight);

      ctx.fillStyle = ph.color;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, swatchSz, swatchSz, swatchSz * 0.25);
      } else {
        ctx.rect(x, y, swatchSz, swatchSz);
      }
      ctx.fill();

      ctx.fillStyle = MUTED;
      ctx.fillText(ph.name, x + swatchSz + Math.round(cellPx * 0.8), y + swatchSz - Math.round(cellPx * 0.15));
    }
  }
}

// ─────────────────────────────────────────────────────────────
export default function LifeInWeeks() {
  const [birthday, setBirthday] = useState("1997-03-15");
  const [paletteName, setPaletteName] = useState("Heatmap");
  const [phases, setPhases] = useState(PALETTES.Heatmap);
  const [title, setTitle] = useState("My Life in Weeks");
  const [darkMode, setDarkMode] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [gridOnly, setGridOnly] = useState(false);
  const [rounding, setRounding] = useState(0.3);
  const [exportIdx, setExportIdx] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const previewRef = useRef(null);

  const redraw = useCallback(() => {
    if (!previewRef.current) return;
    drawLifeGrid(previewRef.current, {
      birthday, phases, title, darkMode, showLegend, showTitle, gridOnly, rounding,
      cellPx: 8, gapPx: 1.8,
    });
  }, [birthday, phases, title, darkMode, showLegend, showTitle, gridOnly, rounding]);

  useEffect(() => { redraw(); }, [redraw]);

  const handlePaletteChange = (e) => {
    const pName = e.target.value;
    setPaletteName(pName);
    setPhases(PALETTES[pName]);
  };

  const handlePhaseColorChange = (id, val) => {
    setPaletteName("Full Custom");
    setPhases(prev => prev.map(p => p.id === id ? { ...p, color: val } : p));
  };

  const updatePhase = (id, field, val) =>
    setPhases(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));

  const handleExport = () => {
    try {
      const preset = EXPORT_PRESETS[exportIdx];
      const off = document.createElement("canvas");
      drawLifeGrid(off, {
        birthday, phases, title, darkMode, showLegend, showTitle, gridOnly, rounding,
        cellPx: preset.cellPx, gapPx: preset.gapPx,
      });
      off.toBlob(blob => {
        if (!blob) {
          alert("Export failed: Could not generate image file.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `life-in-weeks-${preset.label.replace(/\s+/g, "-").toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    } catch (err) {
      console.error(err);
      alert("Error generating export: " + err.message);
    }
  };

  // ── Styles ──────────────────────────────────────────────
  const S = {
    sHead: { padding: "20px 24px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 16 },
    sTitle: { fontSize: 11, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 14, fontWeight: 600 },
    section: { padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    label: { fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 8, display: "block", fontWeight: 600 },
    input: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#E2E2E8", padding: "8px 10px", fontSize: 12, fontFamily: "'Inter', sans-serif", boxSizing: "border-box", outline: "none", transition: "border 0.2s" },
    select: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#E2E2E8", padding: "6px 8px", fontSize: 11, fontFamily: "'Inter', sans-serif", boxSizing: "border-box", outline: "none" },
    slider: { width: "100%", cursor: "pointer", accentColor: "#FFFFFF" },
    valTag: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 },
    row: { display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between" },
    btn: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#E2E2E8", padding: "8px 12px", fontSize: 11, cursor: "pointer", fontFamily: "'Inter', sans-serif", letterSpacing: "0.05em", flexShrink: 0 },
    btnPrimary: { background: "#FFFFFF", border: "none", borderRadius: 6, color: "#08080F", padding: "12px 16px", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em", fontWeight: 700, width: "100%", marginTop: 8, transition: "transform 0.1s" },
    phaseRow: { display: "flex", gap: 6, alignItems: "center", marginBottom: 8 },
    swatch: (col) => ({ width: 22, height: 22, borderRadius: 4, background: col, flexShrink: 0, cursor: "pointer", border: "1px solid rgba(255,255,255,0.15)", position: "relative" }),
    pInput: { flex: 1, width: "50px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#E2E2E8", fontSize: 11, fontFamily: "'Inter', sans-serif", padding: "4px 0", outline: "none", fontWeight: 500 },
    numIn: { width: 40, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 4, color: "#E2E2E8", padding: "4px", fontSize: 11, fontFamily: "'Inter', sans-serif", outline: "none", textAlign: "center" },
    canvas: { maxWidth: "100%", minHeight: 0, borderRadius: 8, boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)", objectFit: "contain" },
    tag: { fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", fontWeight: 500 },
    toggle: (on) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none", padding: "6px 0" }),
    toggleDot: (on) => ({ width: 34, height: 20, borderRadius: 10, background: on ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)", position: "relative", transition: "background 0.2s", flexShrink: 0 }),
    toggleThumb: (on) => ({ position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: 8, background: on ? "#08080F" : "rgba(255,255,255,0.6)", transition: "left 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)" }),
  };

  return (
    <div className={`app-wrap ${previewMode ? "preview-mode" : ""}`}>
      {/* ── Sidebar ────────────────────────────────────────── */}
      <div className="app-sidebar">
        <div style={S.sHead}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.04em", marginBottom: 4 }}>Life in Weeks</div>
          <div style={S.sTitle}>Poster Generator</div>
        </div>

        {/* Basics */}
        <div style={S.section}>
          <label style={S.label}>Poster Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} disabled={gridOnly || !showTitle} style={{ ...S.input, opacity: (gridOnly || !showTitle) ? 0.4 : 1 }} />
        </div>

        <div style={S.section}>
          <label style={S.label}>Birthday</label>
          <input style={S.input} type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
        </div>

        {/* Options */}
        <div style={S.section}>
          <label style={S.label}>Display Options</label>
          <div style={S.toggle(darkMode)} onClick={() => setDarkMode(v => !v)}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Dark Theme</span>
            <div style={S.toggleDot(darkMode)}>
              <div style={S.toggleThumb(darkMode)} />
            </div>
          </div>
          <div style={{ ...S.toggle(showTitle), marginTop: 6 }} onClick={() => setShowTitle(v => !v)}>
            <span style={{ fontSize: 12, color: gridOnly ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)", fontWeight: 500 }}>Show Top Title</span>
            <div style={{ ...S.toggleDot(showTitle), opacity: gridOnly ? 0.3 : 1 }}>
              <div style={S.toggleThumb(showTitle)} />
            </div>
          </div>
          <div style={{ ...S.toggle(showLegend), marginTop: 6 }} onClick={() => setShowLegend(v => !v)}>
            <span style={{ fontSize: 12, color: gridOnly ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)", fontWeight: 500 }}>Show Legend</span>
            <div style={{ ...S.toggleDot(showLegend), opacity: gridOnly ? 0.3 : 1 }}>
              <div style={S.toggleThumb(showLegend)} />
            </div>
          </div>
          <div style={{ ...S.toggle(gridOnly), marginTop: 6, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }} onClick={() => setGridOnly(v => !v)}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Grid Only Mode</span>
            <div style={S.toggleDot(gridOnly)}>
              <div style={S.toggleThumb(gridOnly)} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={S.row}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Cell Rounding</span>
              <span style={S.valTag}>{Math.round(rounding * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="0.5" step="0.05"
              value={rounding} onChange={e => setRounding(parseFloat(e.target.value))}
              style={{ ...S.slider, marginTop: 8 }}
            />
          </div>
        </div>

        {/* Life Phases */}
        <div style={{ ...S.section, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ ...S.label, marginBottom: 0 }}>Life Phases</label>
            <select style={{ ...S.select, width: "auto" }} value={paletteName} onChange={handlePaletteChange}>
              {Object.keys(PALETTES).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {phases.map(ph => (
            <div key={ph.id} style={S.phaseRow}>
              <div style={S.swatch(ph.color)}>
                <input
                  type="color" value={ph.color}
                  onChange={e => handlePhaseColorChange(ph.id, e.target.value)}
                  style={{ opacity: 0, position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "pointer", padding: 0, border: "none" }}
                />
              </div>
              <input
                style={S.pInput} value={ph.name}
                onChange={e => updatePhase(ph.id, "name", e.target.value)}
              />
              <input
                style={S.numIn} type="number" min={0} max={89} value={ph.startAge}
                onChange={e => updatePhase(ph.id, "startAge", +e.target.value)}
              />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>–</span>
              <input
                style={S.numIn} type="number" min={1} max={90} value={ph.endAge}
                onChange={e => updatePhase(ph.id, "endAge", +e.target.value)}
              />
            </div>
          ))}
          <button
            style={{ ...S.btn, marginTop: 8, fontSize: 10, padding: "6px 10px", width: "100%" }}
            onClick={() => setPhases(prev => [...prev, { id: Date.now(), name: "New Phase", startAge: 0, endAge: 5, color: "#94A3B8" }])}
          >+ Add Phase</button>
        </div>

        {/* Export */}
        <div style={{ ...S.section, paddingBottom: 24 }}>
          <label style={S.label}>Export Resolution</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {EXPORT_PRESETS.map((p, i) => (
              <button
                key={i}
                style={{
                  ...S.btn,
                  background: i === exportIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.05)",
                  borderColor: i === exportIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                  color: i === exportIdx ? "#08080F" : "#E2E2E8",
                  fontWeight: i === exportIdx ? 600 : 400,
                  fontSize: 10, padding: "6px 10px",
                }}
                onClick={() => setExportIdx(i)}
              >{p.label}</button>
            ))}
          </div>
          <button style={S.btnPrimary} onClick={handleExport}>
            ↓ EXPORT PNG
          </button>
        </div>
      </div>

      {/* ── Preview ────────────────────────────────────────── */}
      <div className="app-main">
        <button
          className="preview-toggle"
          onClick={() => setPreviewMode(!previewMode)}
          title={previewMode ? "Exit Preview" : "Enter Preview"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={previewMode ? "#3B82F6" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.3s ease" }}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <canvas ref={previewRef} style={S.canvas} className="app-canvas" />
        <div style={{ ...S.tag, display: previewMode ? 'none' : 'block' }}>PREVIEW · Click Export PNG to download full resolution</div>
      </div>
    </div>
  );
}
