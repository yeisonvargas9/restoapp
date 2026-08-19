/**
 * nodo-generar-reporte.mjs
 *
 * Nodo PocketFlow: combina los hallazgos de los evaluadores locales y
 * de Mistral AI, decide si la "puerta de calidad" aprueba o bloquea
 * el código, y escribe un reporte en Markdown.
 *
 * Regla de la puerta: cualquier hallazgo con severidad "critico"
 * (de cualquiera de las dos fuentes) bloquea el paso a producción.
 * Las "advertencia" no bloquean, pero quedan documentadas.
 *
 * Devuelve la acción "aprobado" o "bloqueado" para que el Flow (o
 * quien lo invoque) pueda reaccionar — por ejemplo, un CI/CD que
 * falle el build si la acción es "bloqueado".
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Node } from "./pocketflow.mjs";

function formatearHallazgo(h) {
  const archivo = h.archivo || "general";
  const ocurrencias = h.ocurrencias ? ` (${h.ocurrencias} ocurrencia(s))` : "";
  return `- **[${h.severidad.toUpperCase()}]** \`${archivo}\` — ${h.mensaje}${ocurrencias}`;
}

export class GenerarReporteNode extends Node {
  async prep(shared) {
    return {
      locales: shared.hallazgosLocales || [],
      ia: shared.hallazgosIA || { omitido: true, hallazgos: [] },
      reportePath: shared.reportePath,
    };
  }

  async exec({ locales, ia }) {
    const hallazgosIA = (ia.hallazgos || []).map((h) => ({
      ...h,
      origen: "mistral-ai",
    }));
    const hallazgosLocales = locales.map((h) => ({ ...h, origen: "evaluador-local" }));
    const todos = [...hallazgosLocales, ...hallazgosIA];
    const criticos = todos.filter((h) => h.severidad === "critico");
    const advertencias = todos.filter((h) => h.severidad === "advertencia");
    const aprobado = criticos.length === 0;

    return { todos, criticos, advertencias, aprobado, iaOmitida: ia.omitido, motivoOmisionIA: ia.motivo };
  }

  async post(shared, { reportePath }, resultado) {
    const { todos, criticos, advertencias, aprobado, iaOmitida, motivoOmisionIA } = resultado;

    const lineas = [
      "# Reporte de Puerta de Calidad — RestoApp",
      "",
      `Fecha: ${new Date().toISOString()}`,
      `Resultado: ${aprobado ? "✅ APROBADO" : "⛔ BLOQUEADO"}`,
      `Hallazgos críticos: ${criticos.length} · Advertencias: ${advertencias.length}`,
      iaOmitida
        ? `\n> ⚠️ La revisión con Mistral AI se omitió (${motivoOmisionIA}). El resultado solo refleja los evaluadores locales.`
        : "",
      "",
      "## Críticos (bloquean la puerta de calidad)",
      criticos.length ? criticos.map(formatearHallazgo).join("\n") : "_Ninguno._",
      "",
      "## Advertencias (no bloquean, revisar cuando sea posible)",
      advertencias.length ? advertencias.map(formatearHallazgo).join("\n") : "_Ninguna._",
      "",
    ];

    const contenido = lineas.join("\n");
    mkdirSync(join(reportePath, ".."), { recursive: true });
    writeFileSync(reportePath, contenido, "utf-8");

    shared.resultadoFinal = resultado;
    console.log(`\n[generar-reporte] Reporte escrito en: ${reportePath}`);
    console.log(aprobado ? "✅ Puerta de calidad: APROBADO" : "⛔ Puerta de calidad: BLOQUEADO");

    return aprobado ? "aprobado" : "bloqueado";
  }
}
