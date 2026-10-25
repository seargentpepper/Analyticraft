import { CardTheme } from "../types/dashboard";

export type ThemeGroup = "Base" | "Multicolor" | "iWork" | "Fitness";

export interface ThemeDef {
  id: CardTheme;
  label: string;
  group: ThemeGroup;
  /** Card background / border / text colors (only affect cards, never the Studio UI). */
  cardBg: string;
  cardBorder: string;
  text: string;
  subtext: string;
  /**
   * "gradient": single-hue look, bars use a vertical gradient palette[0] -> palette[1].
   * "multi": every category/ring gets its own color from the palette.
   */
  mode: "gradient" | "multi";
  palette: string[];
  /** Optional per-color gradient pairs [from, to] (used by neon / ring themes). */
  gradients?: [string, string][];
  fontFamily?: string;
  barRadius: number;
  /** Inactive ring track / background color. */
  track: string;
}

const MONO_FONT = "'JetBrains Mono', monospace";
// SF Pro cannot be redistributed outside Apple platforms: use the system font
// stack so Apple devices render it natively and everyone else falls back to Inter.
const APPLE_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif";

export const THEMES: Record<CardTheme, ThemeDef> = {
  // ───────────── Base ─────────────
  corporate: {
    id: "corporate", label: "Corporativo (Azul/Gris)", group: "Base",
    cardBg: "#242830", cardBorder: "#343d4d", text: "#ffffff", subtext: "#94a3b8",
    mode: "gradient", palette: ["#3b82f6", "#1d4ed8"], barRadius: 3, track: "rgba(59,130,246,0.18)",
  },
  geek: {
    id: "geek", label: "Geek (Negro/Verde)", group: "Base",
    cardBg: "#0f140f", cardBorder: "#1e331e", text: "#00ff66", subtext: "#88cc88",
    mode: "gradient", palette: ["#00ff66", "#008833"], fontFamily: MONO_FONT, barRadius: 0,
    track: "rgba(0,255,102,0.15)",
  },
  vibrant: {
    id: "vibrant", label: "Colorido (Rosa/Violeta)", group: "Base",
    cardBg: "#282333", cardBorder: "#4a3863", text: "#ffffff", subtext: "#d8b4fe",
    mode: "gradient", palette: ["#ec4899", "#8b5cf6"], barRadius: 4, track: "rgba(236,72,153,0.18)",
  },
  "all-blue": {
    id: "all-blue", label: "All-Blue (Monocromático)", group: "Base",
    cardBg: "#172236", cardBorder: "#1e3a66", text: "#ffffff", subtext: "#93c5fd",
    mode: "gradient", palette: ["#38bdf8", "#0284c7"], barRadius: 3, track: "rgba(56,189,248,0.18)",
  },
  "all-pink": {
    id: "all-pink", label: "All-Pink (Fucsia)", group: "Base",
    cardBg: "#2c1e26", cardBorder: "#592b45", text: "#ffffff", subtext: "#fbcfe8",
    mode: "gradient", palette: ["#f43f5e", "#be123c"], barRadius: 3, track: "rgba(244,63,94,0.18)",
  },

  // ───────────── Multicolor profiles ─────────────
  sunset: {
    id: "sunset", label: "Atardecer", group: "Multicolor",
    cardBg: "#2a1f2d", cardBorder: "#5a3a4d", text: "#ffffff", subtext: "#f5c2c7",
    mode: "multi", palette: ["#ff5e5b", "#ff9f1c", "#ffd23f", "#f15bb5", "#9b5de5", "#ee6c4d"],
    barRadius: 4, track: "rgba(255,255,255,0.10)",
  },
  "ocean-reef": {
    id: "ocean-reef", label: "Arrecife", group: "Multicolor",
    cardBg: "#12232e", cardBorder: "#1f4457", text: "#ffffff", subtext: "#a5d8e6",
    mode: "multi", palette: ["#00b4d8", "#2ec4b6", "#48cae4", "#80ed99", "#0077b6", "#90e0ef"],
    barRadius: 4, track: "rgba(255,255,255,0.10)",
  },
  aurora: {
    id: "aurora", label: "Aurora Boreal", group: "Multicolor",
    cardBg: "#101a24", cardBorder: "#284b4f", text: "#ffffff", subtext: "#9fe8d8",
    mode: "multi", palette: ["#00f5d4", "#00bbf9", "#9b5de5", "#f15bb5", "#80ffdb", "#7400b8"],
    barRadius: 4, track: "rgba(255,255,255,0.10)",
  },
  pastel: {
    id: "pastel", label: "Pastel", group: "Multicolor",
    cardBg: "#2b2b33", cardBorder: "#4a4a5a", text: "#ffffff", subtext: "#d6d6e4",
    mode: "multi", palette: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#bdb2ff"],
    barRadius: 6, track: "rgba(255,255,255,0.10)",
  },
  "retro-80s": {
    id: "retro-80s", label: "Retro 80s", group: "Multicolor",
    cardBg: "#1b1030", cardBorder: "#4b2a7b", text: "#ffffff", subtext: "#e0c3ff",
    mode: "multi", palette: ["#ff71ce", "#01cdfe", "#05ffa1", "#b967ff", "#fffb96", "#ff9a8b"],
    barRadius: 0, track: "rgba(255,255,255,0.10)",
  },
  autumn: {
    id: "autumn", label: "Otoño", group: "Multicolor",
    cardBg: "#2b211b", cardBorder: "#5a4333", text: "#ffffff", subtext: "#e6cfae",
    mode: "multi", palette: ["#d9480f", "#e8a33d", "#a3b18a", "#bc6c25", "#8c6a3f", "#6b705c"],
    barRadius: 3, track: "rgba(255,255,255,0.10)",
  },
  cyberpunk: {
    id: "cyberpunk", label: "Cyberpunk", group: "Multicolor",
    cardBg: "#0d0d14", cardBorder: "#3a1f5a", text: "#fcee0a", subtext: "#00f0ff",
    mode: "multi", palette: ["#fcee0a", "#00f0ff", "#ff003c", "#7d12ff", "#00ff9f", "#ff6ec7"],
    fontFamily: MONO_FONT, barRadius: 0, track: "rgba(255,255,255,0.10)",
  },
  tropical: {
    id: "tropical", label: "Tropical", group: "Multicolor",
    cardBg: "#10261f", cardBorder: "#25584a", text: "#ffffff", subtext: "#b7ecd9",
    mode: "multi", palette: ["#ff6b6b", "#feca57", "#1dd1a1", "#48dbfb", "#ff9ff3", "#54a0ff"],
    barRadius: 5, track: "rgba(255,255,255,0.10)",
  },

  // ───────────── iWork-inspired (Numbers-like) ─────────────
  iwork: {
    id: "iwork", label: "Estilo iWork (Estándar)", group: "iWork",
    cardBg: "#1c1c1e", cardBorder: "#3a3a3c", text: "#ffffff", subtext: "#98989d",
    mode: "multi", palette: ["#007AFF", "#34C759", "#FF9500", "#FF2D55", "#AF52DE", "#5AC8FA"],
    fontFamily: APPLE_FONT, barRadius: 6, track: "rgba(255,255,255,0.10)",
  },
  "iwork-mono": {
    id: "iwork-mono", label: "Estilo iWork (Mono/Editorial)", group: "iWork",
    cardBg: "#1c1c1e", cardBorder: "#3a3a3c", text: "#ffffff", subtext: "#aeaeb2",
    mode: "multi", palette: ["#007AFF", "#D1D1D6", "#AEAEB2", "#8E8E93", "#6E6E73", "#48484A"],
    fontFamily: APPLE_FONT, barRadius: 6, track: "rgba(255,255,255,0.10)",
  },
  "iwork-pastel": {
    id: "iwork-pastel", label: "Estilo iWork (Pastel/Soft)", group: "iWork",
    cardBg: "#232327", cardBorder: "#3f3f46", text: "#ffffff", subtext: "#d4d4dc",
    mode: "multi", palette: ["#A7C7E7", "#B5EAD7", "#FFDAC1", "#FF9AA2", "#C7CEEA", "#E2F0CB"],
    fontFamily: APPLE_FONT, barRadius: 8, track: "rgba(255,255,255,0.10)",
  },
  "iwork-earth": {
    id: "iwork-earth", label: "Estilo iWork (Tierra/Cálido)", group: "iWork",
    cardBg: "#26211c", cardBorder: "#4a3f33", text: "#ffffff", subtext: "#dcc9ad",
    mode: "multi", palette: ["#CC7722", "#E2725B", "#808000", "#8B5A2B", "#C19A6B", "#6B8E23"],
    fontFamily: APPLE_FONT, barRadius: 6, track: "rgba(255,255,255,0.10)",
  },

  // ───────────── Activity-rings inspired (Move / Exercise / Stand) ─────────────
  fitness: {
    id: "fitness", label: "Anillos de Actividad (Fitness)", group: "Fitness",
    cardBg: "#000000", cardBorder: "#1c1c1e", text: "#ffffff", subtext: "#8e8e93",
    mode: "multi",
    palette: ["#FA114F", "#9EE600", "#00E5FF", "#FF5E3A"],
    gradients: [
      ["#FA114F", "#FF5E3A"], // Move (rojo/rosa neón)
      ["#9EE600", "#00E887"], // Exercise (verde lima)
      ["#00E5FF", "#00A3FF"], // Stand (cian neón)
      ["#FF9500", "#FFD60A"],
    ],
    fontFamily: APPLE_FONT, barRadius: 10, track: "rgba(255,255,255,0.14)",
  },
};

export const THEME_LIST: ThemeDef[] = Object.values(THEMES);

export const THEME_GROUPS: ThemeGroup[] = ["Base", "Multicolor", "iWork", "Fitness"];

export function getTheme(id: CardTheme | undefined): ThemeDef {
  return (id && THEMES[id]) || THEMES.corporate;
}
