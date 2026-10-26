import { describe, it, expect } from "vitest";
import { THEMES, THEME_LIST, THEME_GROUPS, getTheme } from "../src/lib/themes";
import { CardTheme } from "../src/types/dashboard";

describe("Catálogo de Temas (themes.ts)", () => {
  const expectedThemes: CardTheme[] = [
    // Base (5)
    "corporate",
    "geek",
    "vibrant",
    "all-blue",
    "all-pink",
    // Multicolor (8)
    "sunset",
    "ocean-reef",
    "aurora",
    "pastel",
    "retro-80s",
    "autumn",
    "cyberpunk",
    "tropical",
    // iWork (4)
    "iwork",
    "iwork-mono",
    "iwork-pastel",
    "iwork-earth",
    // Fitness (1)
    "fitness",
  ];

  it("debe contener exactamente los 18 temas del catálogo", () => {
    expect(THEME_LIST).toHaveLength(18);
    for (const themeId of expectedThemes) {
      expect(THEMES[themeId]).toBeDefined();
      expect(THEMES[themeId].id).toBe(themeId);
    }
  });

  it("cada tema debe poseer propiedades obligatorias de tarjeta y contraste", () => {
    for (const theme of THEME_LIST) {
      expect(theme.label).toBeTruthy();
      expect(theme.group).toBeTruthy();
      expect(THEME_GROUPS).toContain(theme.group);

      // Colores de tarjeta y texto
      expect(theme.cardBg).toMatch(/^#|^rgba/);
      expect(theme.cardBorder).toMatch(/^#|^rgba/);
      expect(theme.text).toMatch(/^#|^rgba/);
      expect(theme.subtext).toMatch(/^#|^rgba/);

      // Paleta y modo
      expect(["gradient", "multi"]).toContain(theme.mode);
      expect(theme.palette.length).toBeGreaterThanOrEqual(2);
      for (const hex of theme.palette) {
        expect(hex).toMatch(/^#/);
      }

      // Propiedades de pista y radio de barras
      expect(typeof theme.barRadius).toBe("number");
      expect(theme.track).toMatch(/^rgba/);
    }
  });

  it("getTheme debe retornar el tema correcto o fallback a corporate", () => {
    expect(getTheme("geek").id).toBe("geek");
    expect(getTheme("fitness").id).toBe("fitness");

    // Fallbacks seguros ante id indefinido o inexistente
    expect(getTheme(undefined).id).toBe("corporate");
    // @ts-expect-error probando entrada inválida en tiempo de ejecución
    expect(getTheme("tema-inexistente").id).toBe("corporate");
  });

  it("el tema fitness debe contar con gradientes por color para anillos de actividad", () => {
    const fitness = THEMES.fitness;
    expect(fitness.group).toBe("Fitness");
    expect(fitness.gradients).toBeDefined();
    expect(fitness.gradients!.length).toBeGreaterThanOrEqual(3);
    for (const pair of fitness.gradients!) {
      expect(pair).toHaveLength(2);
      expect(pair[0]).toMatch(/^#/);
      expect(pair[1]).toMatch(/^#/);
    }
  });
});
