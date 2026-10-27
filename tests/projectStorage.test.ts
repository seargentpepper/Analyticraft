import { describe, it, expect } from "vitest";
import { openProjectSingleFile } from "../src/lib/projectStorage";

describe("projectStorage - M-03 Validation", () => {
  it("rejects non-JSON files", async () => {
    const invalidFile = new File(["this is not json"], "bad.json", { type: "text/plain" });
    await expect(openProjectSingleFile(invalidFile)).rejects.toThrow("no es un JSON válido");
  });

  it("rejects JSON missing the required name property", async () => {
    const badObjFile = new File([JSON.stringify({ description: "no name" })], "test.analyticraft", {
      type: "application/json",
    });
    await expect(openProjectSingleFile(badObjFile)).rejects.toThrow("propiedad 'name' requerida");
  });

  it("sanitizes missing arrays and parses valid projects cleanly", async () => {
    const validJson = JSON.stringify({
      version: 1,
      name: "Mi_Proyecto_Test",
      activeTheme: "corporate",
    });
    const file = new File([validJson], "Mi_Proyecto_Test.analyticraft", { type: "application/json" });
    const res = await openProjectSingleFile(file);

    expect(res).not.toBeNull();
    expect(res?.project.name).toBe("Mi_Proyecto_Test");
    expect(res?.project.charts).toEqual([]);
    expect(res?.project.filters).toEqual([]);
    expect(res?.project.relations).toEqual([]);
    expect(res?.project.sources).toEqual([]);
  });
});
