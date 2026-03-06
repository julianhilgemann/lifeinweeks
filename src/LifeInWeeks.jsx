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

  // Map real time to a strict 52-weeks-per-year scale to align with the grid
  const exactAge = (now - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
  const livedWeeks = Math.max(0, Math.floor(exactAge * 52));
  const totalWeeks = 90 * 52;

  const age = exactAge.toFixed(1);
  const bornStr = `Born ${birthDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
  const ageStr = `Age ${isNaN(age) ? '0' : age}`;

  const getColor = (absWeek) => {
    const a = absWeek / 52;
    for (const ph of phases) {
      if (!ph.hidden && a >= ph.startAge && a < ph.endAge + 1) return ph.color;
    }
    return null;
  };

  const step = cellPx + gapPx;
  const gridW = 52 * step - gapPx;
  const gridH = 90 * step - gapPx;

  // Always use fixed padding for width so the aspect ratio is stable
  // For gridOnly (Clean) mode, reduce padding to fill more space
  const padScale = gridOnly ? 0.4 : 1.0;
  const labelW = cellPx * 4.5 * padScale;
  const padX = cellPx * 5 * padScale;
  const padLeft = padX + labelW;
  const padRight = padX + labelW;

  canvas.width = Math.round(padLeft + gridW + padRight);
  // Enforce a 9:16 mobile phone proportion for the poster shape
  canvas.height = Math.round(canvas.width * (16 / 9));

  let headerH = 0, monthLabelH = 0, legendH = 0;

  if (!gridOnly) {
    headerH = cellPx * 18;
    monthLabelH = cellPx * 2.5;
    if (showLegend) {
      const cols = 4;
      const visiblePhases = phases.filter(ph => !ph.hidden);
      const rows = Math.ceil(visiblePhases.length / cols);
      legendH = rows > 0 ? cellPx * 3 + (rows * cellPx * 2) : 0;
    }
    if (!showTitle) {
      headerH -= cellPx * 4.5; // reduce header height if title off
    }
  }

  // Calculate the total height of current content to vertically center it
  const currentContentH = headerH + monthLabelH + gridH + legendH;

  // Track the ideal 16:9 vertical height
  let finalHeight = canvas.height;

  // Fallback: only increase height if elements physically cannot fit.
  // We prefer shrinking padding instead of increasing canvas size
  if (currentContentH > finalHeight - cellPx * 4) {
    finalHeight = Math.round(currentContentH + cellPx * 4);
  }

  canvas.height = finalHeight;

  // Vertically center the content in the fixed canvas, avoiding negative padding
  const padY = Math.max(cellPx * 2, (canvas.height - currentContentH) / 2);

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

      if (abs <= livedWeeks) {
        ctx.fillStyle = col || (darkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)");
        ctx.fill();
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

    const visiblePhases = phases.filter(ph => !ph.hidden);

    for (let i = 0; i < visiblePhases.length; i++) {
      const ph = visiblePhases[i];
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
  const [isDraggingRounding, setIsDraggingRounding] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [pendingExportIdx, setPendingExportIdx] = useState(null);
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

  const triggerExport = (idxOrEvent) => {
    const actualIdx = typeof idxOrEvent === 'number' ? idxOrEvent : exportIdx;
    setPendingExportIdx(actualIdx);
    setShowExportMenu(false);
    setShowSupportPopup(true);
  };

  const handlePhaseColorChange = (id, val) => {
    setPaletteName("Full Custom");
    setPhases(prev => prev.map(p => p.id === id ? { ...p, color: val } : p));
  };

  const updatePhase = (id, field, val) =>
    setPhases(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));

  const executeExport = () => {
    try {
      if (pendingExportIdx === null) return;

      const preset = EXPORT_PRESETS[pendingExportIdx];
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

        setShowSupportPopup(false);
        setPendingExportIdx(null);
      }, "image/png");
    } catch (err) {
      console.error(err);
      alert("Error generating export: " + err.message);
      setShowSupportPopup(false);
      setPendingExportIdx(null);
    }
  };

  // ── Styles ──────────────────────────────────────────────
  const S = {
    section: { padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    label: { fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 },
    input: { width: "100%", height: "36px", margin: 0, WebkitAppearance: "none", appearance: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#E2E2E8", padding: "0 10px", fontSize: 12, fontFamily: "'Inter', sans-serif", boxSizing: "border-box", outline: "none", transition: "border 0.2s" },
    select: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#E2E2E8", padding: "6px 8px", fontSize: 11, fontFamily: "'Inter', sans-serif", boxSizing: "border-box", outline: "none" },
    slider: { width: "100%", cursor: "pointer", accentColor: "#FFFFFF" },
    valTag: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 },
    row: { display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between" },
    btn: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#E2E2E8", padding: "8px 12px", fontSize: 11, cursor: "pointer", fontFamily: "'Inter', sans-serif", letterSpacing: "0.05em", flexShrink: 0 },
    btnPrimary: { background: "#FFFFFF", border: "none", borderRadius: 6, color: "#08080F", padding: "12px 16px", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em", fontWeight: 700, width: "100%", marginTop: 8, transition: "transform 0.1s" },
    phaseRow: { display: "flex", gap: 6, alignItems: "center", marginBottom: 8 },
    swatch: (col) => ({ width: 22, height: 22, borderRadius: 4, background: col, flexShrink: 0, cursor: "pointer", border: "1px solid rgba(255,255,255,0.15)", position: "relative" }),
    pInput: { flex: 1, width: "50px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#E2E2E8", fontSize: 11, fontFamily: "'Inter', sans-serif", padding: "4px 0", outline: "none", fontWeight: 500 },
    numIn: { width: "32px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#E2E2E8", fontSize: 11, fontFamily: "'Inter', sans-serif", padding: "4px 0", outline: "none", fontWeight: 500, textAlign: "center", appearance: "none", WebkitAppearance: "none", margin: 0 },
    // We'll remove inline S.main styles and use CSS classes for glassmorphism
    canvas: {
      maxWidth: "100%",
      minHeight: 0,
      borderRadius: 4, // Smoother, slightly rounded border-radius for poster
      padding: 12, // Ensure poster contents aren't squeezed
      background: darkMode ? "#070B14" : "#F8F7F3",
      transition: "border 0.3s ease, box-shadow 0.3s ease",
      boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
      objectFit: "contain"
    },
    tag: { fontSize: 11, color: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)", letterSpacing: "0.05em", fontWeight: 500 },
    toggle: (on) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none", padding: "6px 0" }),
    toggleDot: (on) => ({ width: 34, height: 20, borderRadius: 10, background: on ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)", position: "relative", transition: "background 0.2s", flexShrink: 0 }),
    toggleThumb: (on) => ({ position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: 8, background: on ? "#08080F" : "rgba(255,255,255,0.6)", transition: "left 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)" }),
  };

  return (
    <div className={`app-wrap ${previewMode ? "preview-mode" : ""}`}>
      {/* ── Navbar ────────────────────────────────────────── */}
      <div className={`pill-navbar ${darkMode ? "pill-navbar-dark" : "pill-navbar-light"}`}>
        <div style={{ display: "flex", flex: 1, justifyContent: "flex-start" }}>
          <a href="https://www.julianhilgemann.com/start" target="_blank" rel="noopener noreferrer" className="navbar-logo" style={{ display: "flex", alignItems: "center" }}>
            <svg style={{ height: "20px", width: "auto" }} viewBox="-16 -16 528.05 528.05" xmlns="http://www.w3.org/2000/svg">
              <circle cx="248.02" cy="248.02" r="240.02" fill="none" stroke={darkMode ? "#FFFFFF" : "#0A0A0A"} strokeMiterlimit="10" strokeWidth="24px" />
              <polygon points="414.8 247.47 410.09 270.25 367.27 271.43 339.39 386.13 294.21 385.74 323.68 270.65 258.47 270.65 264.75 247.87 329.57 247.08 365.31 110 410.09 109.6 373.95 247.47 414.8 247.47" fill={darkMode ? "#FFFFFF" : "#0A0A0A"} />
              <path d="M196.7,262s-16-1-41.88.54c-55.68,3.24-70.22,41-71,63.83-2.4,69.53,84,63.73,109.2-14.34,11.07-34.27,45.19-175.44,46.2-177-36.09-.3-112.1-.45-112.1-.45s2.66-10.16,6.49-23.61l155.25-.25c-.2,1.05-25,106.7-47.43,183.68C215,385.08,146.67,399.39,125,398.4c-34.13-1.54-62.45-27.88-62.45-72.27C62.51,290,92.36,245.7,155.6,246l44.88-.2Z" transform="translate(-1.71 -1.87)" fill={darkMode ? "#FFFFFF" : "#0A0A0A"} />
            </svg>
          </a>
        </div>
        <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
          <div className="navbar-text">Life in Weeks Poster Generator</div>
        </div>
        <div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
          <a href="https://github.com/julianhilgemann/lifeinweeks" target="_blank" rel="noopener noreferrer" className="navbar-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </div>
      </div>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <div className="app-sidebar">

        {/* Basics */}
        <div style={S.section}>
          <label style={S.label}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
            Poster Title
          </label>
          <input value={title} onChange={e => setTitle(e.target.value)} disabled={gridOnly || !showTitle} style={{ ...S.input, opacity: (gridOnly || !showTitle) ? 0.4 : 1 }} />
        </div>

        <div style={S.section}>
          <label style={S.label}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" /><path d="M2 21h20" /><path d="M7 8v3" /><path d="M12 8v3" /><path d="M17 8v3" /><path d="M7 4h.01" /><path d="M12 4h.01" /><path d="M17 4h.01" /></svg>
            Birthday
          </label>
          <input style={S.input} type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
        </div>

        {/* Options */}
        <div style={S.section}>
          <label style={S.label}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            Display Options
          </label>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            <button
              style={{
                ...S.btn, flex: 1, padding: "6px 0", textAlign: "center", fontSize: 11,
                background: gridOnly ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.05)",
                borderColor: gridOnly ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                color: gridOnly ? "#08080F" : "#E2E2E8",
                fontWeight: gridOnly ? 600 : 400,
              }}
              onClick={() => { setGridOnly(true); setShowTitle(false); setShowLegend(false); }}
            >Clean</button>
            <button
              style={{
                ...S.btn, flex: 1, padding: "6px 0", textAlign: "center", fontSize: 11,
                background: !gridOnly && !showTitle && !showLegend ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.05)",
                borderColor: !gridOnly && !showTitle && !showLegend ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                color: !gridOnly && !showTitle && !showLegend ? "#08080F" : "#E2E2E8",
                fontWeight: !gridOnly && !showTitle && !showLegend ? 600 : 400,
              }}
              onClick={() => { setGridOnly(false); setShowTitle(false); setShowLegend(false); }}
            >Data</button>
            <button
              style={{
                ...S.btn, flex: 1, padding: "6px 0", textAlign: "center", fontSize: 11,
                background: !gridOnly && showTitle && showLegend ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.05)",
                borderColor: !gridOnly && showTitle && showLegend ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                color: !gridOnly && showTitle && showLegend ? "#08080F" : "#E2E2E8",
                fontWeight: !gridOnly && showTitle && showLegend ? 600 : 400,
              }}
              onClick={() => { setGridOnly(false); setShowTitle(true); setShowLegend(true); }}
            >Full</button>
          </div>
          <div style={{ ...S.toggle(showTitle) }} onClick={() => setShowTitle(v => !v)}>
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
              type="range" min="0" max="0.5" step="0.01"
              value={rounding} onChange={e => setRounding(parseFloat(e.target.value))}
              onMouseDown={() => setIsDraggingRounding(true)}
              onMouseUp={() => setIsDraggingRounding(false)}
              onTouchStart={() => setIsDraggingRounding(true)}
              onTouchEnd={() => setIsDraggingRounding(false)}
              style={{ ...S.slider, marginTop: 8 }}
            />
          </div>
        </div>

        {/* Life Phases */}
        <div style={{ ...S.section, flex: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ ...S.label, marginBottom: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Life Phases
            </label>
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
              <button
                style={{ background: "transparent", border: "none", padding: "0 4px", cursor: "pointer", display: "flex", alignItems: "center", justifyItems: "center" }}
                onClick={() => updatePhase(ph.id, "hidden", !ph.hidden)}
                title={ph.hidden ? "Show Phase" : "Hide Phase"}
              >
                {ph.hidden ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          ))}
          <button
            style={{ ...S.btn, marginTop: 8, fontSize: 10, padding: "6px 10px", width: "100%" }}
            onClick={() => setPhases(prev => [...prev, { id: Date.now(), name: "New Phase", startAge: 0, endAge: 5, color: "#94A3B8" }])}
          >+ Add Phase</button>
        </div>

        {/* Export */}
        <div className="sidebar-export-section" style={{ ...S.section, paddingBottom: 24 }}>
          <label style={S.label}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            Export Resolution
          </label>
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
          <button style={S.btnPrimary} onClick={triggerExport}>
            ↓ EXPORT PNG
          </button>
        </div>

        {/* Footer */}
        <div style={{
          padding: "24px",
          paddingBottom: "32px",
          textAlign: "center",
          fontSize: "12px",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          marginTop: "auto"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
            Made with
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444" stroke="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            and
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A484" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            by Julian Hilgemann
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <a href="https://www.julianhilgemann.com" target="_blank" rel="noopener noreferrer" style={{ color: "#FFFFFF", textDecoration: "none", transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = 0.7} onMouseOut={e => e.currentTarget.style.opacity = 1}>
              www.julianhilgemann.com
            </a>
          </div>
        </div>
      </div>

      {/* ── Preview ────────────────────────────────────────── */}
      <div className={`app-main view-bg view-bg-${darkMode ? "dark" : "light"}`}>
        {/* Animated background neon blobs */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="glass-pane"></div>

        {isDraggingRounding && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: darkMode ? 'rgba(30, 30, 40, 0.35)' : 'rgba(255, 255, 255, 0.35)',
            width: 260,
            height: 260,
            borderRadius: 24,
            boxShadow: darkMode
              ? '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.1)'
              : '0 20px 60px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.05)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              width: 120,
              height: 120,
              background: phases[0]?.color || '#3B82F6',
              borderRadius: 120 * rounding,
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)'
            }} />
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: darkMode ? '#FFF' : '#000',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.05em'
            }}>
              {Math.round(rounding * 100)}% Rounding
            </div>
            <div style={{
              fontSize: 12,
              color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              fontFamily: "'Inter', sans-serif",
              textAlign: 'center',
              padding: '0 24px',
              lineHeight: 1.4
            }}>
              Preview of cell border radius as it will appear on the final poster
            </div>
          </div>
        )}
        <div className="preview-grid-container" style={{ display: "flex", justifyContent: "center", width: "100%", zIndex: 10, margin: "0" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "100%" }}>
            <canvas ref={previewRef} style={S.canvas} className={`app-canvas canvas-border-${darkMode ? "dark" : "light"}`} />
          </div>
        </div>

        <div className="preview-actions-wrapper">
          <button
            className={`preview-toggle ${darkMode ? "preview-toggle-dark" : "preview-toggle-light"}`}
            onClick={() => setPreviewMode(!previewMode)}
            title={previewMode ? "Exit Preview" : "Enter Preview"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={previewMode ? "#3B82F6" : (darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.3s ease" }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>

          <button
            className={`preview-toggle ${darkMode ? "preview-toggle-dark" : "preview-toggle-light"}`}
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          <div className="mobile-export-wrapper" style={{ position: "relative" }}>
            <button
              className={`preview-toggle ${darkMode ? "preview-toggle-dark" : "preview-toggle-light"}`}
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Export PNG"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={darkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            {showExportMenu && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  onClick={() => setShowExportMenu(false)}
                />
                <div className={`export-context-menu ${darkMode ? "export-context-menu-dark" : "export-context-menu-light"}`}>
                  {EXPORT_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      className="export-menu-item"
                      onClick={() => triggerExport(i)}
                    >
                      <span>{p.label}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Support Popup Overlay */}
        {showSupportPopup && (
          <div className="support-popup-overlay">
            <div className={`support-popup ${darkMode ? "support-popup-dark" : "support-popup-light"}`}>
              <div className="support-popup-content">
                <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 600, color: darkMode ? "#FFF" : "#0A0A0A" }}>Support my work</h3>
                <p style={{ margin: "0 0 24px 0", fontSize: 14, color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
                  If you found this tool useful and want to support its continued development, consider buying me a coffee!
                </p>

                <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
                  <button
                    className="support-btn-secondary"
                    onClick={executeExport}
                  >
                    Just Download
                  </button>
                  <a
                    href="https://buymeacoffee.com/julianhilgemann"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-btn-primary"
                    onClick={() => {
                      executeExport();
                    }}
                  >
                    ☕ Buy me a coffee
                  </a>
                </div>
              </div>
            </div>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: -1 }}
              onClick={() => setShowSupportPopup(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
