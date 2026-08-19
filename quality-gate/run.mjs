/**
 * run.mjs
 *
 * Punto de entrada CLI de la puerta de calidad.
 * Uso:
 *   node run.mjs                  → analiza ../ (el proyecto resto-app)
 *   MISTRAL_API_KEY=xxxx node run.mjs   → incluye la revisión con Mistral AI
 *
 * Código de salida: 0 si la puerta aprueba, 1 si bloquea (útil para
 * integrarlo en un pipeline de CI/CD que deba fallar el build).
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { crearFlowPuertaDeCalidad } from "./flow.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const projectDir = join(__dirname, ".."); // raíz de resto-app
  const reportePath = join(__dirname, "reportes", "ultimo-reporte.md");

  const shared = { projectDir, reportePath };
  const flow = crearFlowPuertaDeCalidad();

  console.log("=== Puerta de Calidad RestoApp (PocketFlow) ===");
  console.log(`Proyecto: ${projectDir}`);
  console.log(process.env.MISTRAL_API_KEY ? "Mistral AI: habilitado" : "Mistral AI: SIN CONFIGURAR (se omitirá)");
  console.log("");

  const resultado = await flow._run(shared);

  process.exit(resultado === "aprobado" ? 0 : 1);
}

main().catch((error) => {
  console.error("Error ejecutando la puerta de calidad:", error);
  process.exit(1);
});
