/**
 * nodo-leer-codigo.mjs
 *
 * Nodo PocketFlow: lee todos los archivos HTML/CSS/JS del proyecto
 * RestoApp y los deja disponibles en `shared.archivos` para los
 * siguientes nodos (evaluadores locales y evaluación con IA).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { Node } from "./pocketflow.mjs";

const EXTENSIONES_RELEVANTES = new Set([".html", ".css", ".js", ".json"]);
const CARPETAS_IGNORADAS = new Set(["node_modules", "quality-gate", "reportes"]);

function listarArchivos(dir) {
  const resultado = [];
  for (const entrada of readdirSync(dir)) {
    if (CARPETAS_IGNORADAS.has(entrada)) continue;
    const ruta = join(dir, entrada);
    const info = statSync(ruta);
    if (info.isDirectory()) {
      resultado.push(...listarArchivos(ruta));
    } else if (EXTENSIONES_RELEVANTES.has(extname(entrada))) {
      resultado.push(ruta);
    }
  }
  return resultado;
}

export class LeerCodigoNode extends Node {
  async prep(shared) {
    return shared.projectDir;
  }

  async exec(projectDir) {
    const rutas = listarArchivos(projectDir);
    return rutas.map((ruta) => ({
      ruta,
      contenido: readFileSync(ruta, "utf-8"),
    }));
  }

  async post(shared, _prepRes, archivos) {
    shared.archivos = archivos;
    console.log(`[leer-codigo] ${archivos.length} archivos leídos de ${shared.projectDir}`);
    return "default";
  }
}
