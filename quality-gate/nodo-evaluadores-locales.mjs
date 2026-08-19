/**
 * nodo-evaluadores-locales.mjs
 *
 * Nodo PocketFlow: "evaluadores rigurosos" que corren en local, sin
 * depender de ninguna API externa. Aplican reglas estáticas simples
 * pero útiles para detectar patrones de riesgo típicos: credenciales
 * hardcodeadas, uso de `var`, `eval()`, `innerHTML` sin sanitizar,
 * TODOs sin resolver, URLs de Firebase antiguas, etc.
 *
 * Cada regla produce hallazgos con severidad "critico" | "advertencia".
 * Los hallazgos "critico" son los que bloquean la puerta de calidad.
 */
import { Node } from "./pocketflow.mjs";

const REGLAS = [
  {
    id: "credenciales-hardcodeadas",
    severidad: "critico",
    // Busca ASIGNACIONES de una contraseña/credencial literal
    // (ej. `password = "1234"`, `PASS: 'admin'`), no cualquier mención
    // de la palabra — así no marca falsos positivos como
    // getElementById("password") o type="password", que son selectores
    // de formulario legítimos, no secretos.
    patron: /\b(pass(word)?|contraseña|pwd)\s*[:=]\s*['"][^'"]+['"]/gi,
    mensaje: "Posible credencial o contraseña hardcodeada en el código.",
    extensiones: [".js", ".html"],
  },
  {
    id: "uso-de-var",
    severidad: "advertencia",
    patron: /(^|\s)var\s+[a-zA-Z_$]/gm,
    mensaje: "Uso de 'var' (preferir 'const'/'let' con scope de módulo).",
    extensiones: [".js"],
  },
  {
    id: "eval-peligroso",
    severidad: "critico",
    patron: /\beval\s*\(/g,
    mensaje: "Uso de eval(): riesgo de ejecución de código arbitrario.",
    extensiones: [".js", ".html"],
  },
  {
    id: "innerhtml-sin-sanitizar",
    severidad: "advertencia",
    patron: /\.innerHTML\s*=\s*[^"'`]*(\+|\$\{)/g,
    mensaje: "innerHTML construido con concatenación/interpolación: riesgo de XSS si el dato viene del usuario.",
    extensiones: [".js"],
  },
  {
    id: "todo-sin-resolver",
    severidad: "advertencia",
    patron: /\bTODO_REEMPLAZAR\b/g,
    mensaje: "Placeholder de configuración sin completar (TODO_REEMPLAZAR).",
    extensiones: [".js"],
  },
  {
    id: "url-firebase-antigua",
    severidad: "critico",
    patron: /stock-flow-2e23e/g,
    // Nota: se excluye .md a propósito — el CHANGELOG documenta el cambio
    // de instancia mencionando la URL antigua, eso no es un bug de código.
    mensaje: "Referencia a la instancia antigua de Firebase (stock-flow-2e23e).",
    extensiones: [".js", ".html", ".json"],
  },
  {
    id: "console-log-residual",
    severidad: "advertencia",
    patron: /console\.log\(/g,
    mensaje: "console.log() presente (revisar si es intencional antes de producción).",
    extensiones: [".js"],
  },
];

export class EvaluadoresLocalesNode extends Node {
  async prep(shared) {
    return shared.archivos || [];
  }

  async exec(archivos) {
    const hallazgos = [];

    for (const archivo of archivos) {
      const ext = archivo.ruta.slice(archivo.ruta.lastIndexOf("."));
      for (const regla of REGLAS) {
        if (!regla.extensiones.includes(ext)) continue;
        const coincidencias = [...archivo.contenido.matchAll(regla.patron)];
        if (coincidencias.length > 0) {
          hallazgos.push({
            regla: regla.id,
            severidad: regla.severidad,
            mensaje: regla.mensaje,
            archivo: archivo.ruta,
            ocurrencias: coincidencias.length,
          });
        }
      }
    }

    return hallazgos;
  }

  async post(shared, _prepRes, hallazgos) {
    shared.hallazgosLocales = hallazgos;
    const criticos = hallazgos.filter((h) => h.severidad === "critico").length;
    console.log(`[evaluadores-locales] ${hallazgos.length} hallazgos (${criticos} críticos)`);
    return "default";
  }
}
