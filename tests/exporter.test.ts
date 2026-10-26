import { describe, it, expect } from "vitest";
import { escapeHtml, safeJson, generateStandaloneHTML } from "../src/lib/exporter";
import { ChartConfig } from "../src/types/dashboard";

describe("Exportador HTML y Sanitización (exporter.ts)", () => {
  it("escapeHtml debe neutralizar etiquetas HTML y comillas peligrosas", () => {
    const raw = '<script>alert("xss & risk")</script>';
    const escaped = escapeHtml(raw);

    expect(escaped).not.toContain("<script>");
    expect(escaped).not.toContain("</script>");
    expect(escaped).toContain("&lt;script&gt;");
    expect(escaped).toContain("&quot;xss &amp; risk&quot;");
  });

  it("safeJson debe escapar caracteres <, > y & para inyección segura en <script>", () => {
    const maliciousPayload = {
      title: "</script><script>alert('pwn')</script>",
      query: "SELECT * FROM sales WHERE a < 10 & b > 20",
    };

    const serialized = safeJson(maliciousPayload);

    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain(">");
    expect(serialized).not.toContain("&");
    expect(serialized).toContain("\\u003c");
    expect(serialized).toContain("\\u003e");
    expect(serialized).toContain("\\u0026");
  });

  it("generateStandaloneHTML debe generar un archivo HTML autocontenido válido", () => {
    const sampleConfig: ChartConfig = {
      id: "card-1",
      title: "Ventas por Región",
      type: "bar",
      aggregation: "SUM",
      metricCol: "Venta",
      dimensionCol: "Region",
      description: "Métrica acumulada del primer trimestre",
      tableName: "Sales",
    };

    const sampleData = [
      { dimension: "Norte", metric: 1200 },
      { dimension: "Sur", metric: 850 },
    ];

    const html = generateStandaloneHTML({
      projectName: "Mi_Proyecto_Test",
      theme: "corporate",
      charts: [{ config: sampleConfig, data: sampleData }],
    });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html lang=\"es\">");
    expect(html).toContain("Mi_Proyecto_Test");
    expect(html).toContain("echarts.min.js");
    expect(html).toContain("Ventas por Región");
    expect(html).toContain("SUM");
    expect(html).toContain("Venta");
    expect(html).toContain("Region");
    expect(html).toContain("Métrica acumulada del primer trimestre");
  });
});
