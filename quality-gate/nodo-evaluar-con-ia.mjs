/**
 * nodo-evaluar-con-ia.mjs
 *
 * Nodo PocketFlow: envía un resumen del código a la API de chat de
 * Mistral AI y le pide que identifique bugs, vulnerabilidades y
 * riesgos de regresión que los evaluadores locales (basados en reglas
 * fijas) podrían no detectar.
 *
 * Requiere la variable de entorno MISTRAL_API_KEY. Si no está definida,
 * o si la llamada a la API falla (sin red, key inválida, etc.), el
 * nodo NO inventa resultados: registra que este paso se omitió y deja
 * que la puerta de calidad dependa solo de los evaluadores locales.
 *
 * Modelo y endpoint según la documentación pública de Mistral AI
 * (https://docs.mistral.ai/api/): POST https://api.mistral.ai/v1/chat/completions
 */
import { Node } from "./pocketflow.mjs";

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const MODELO_POR_DEFECTO = "mistral-small-latest";
// Límite de caracteres de código enviados a la API para no exceder
// el contexto ni gastar tokens de más en un proyecto pequeño como este.
const LIMITE_CARACTERES = 15000;

function construirResumenCodigo(archivos) {
  let acumulado = "";
  for (const archivo of archivos) {
    const bloque = `\n\n// ==== ${archivo.ruta} ====\n${archivo.contenido}`;
    if (acumulado.length + bloque.length > LIMITE_CARACTERES) break;
    acumulado += bloque;
  }
  return acumulado;
}

const PROMPT_SISTEMA = `Eres un evaluador riguroso de calidad de código (quality gate) para un
proyecto web estático (HTML/CSS/JS + Firebase). Analiza el código que
se te entrega y responde ÚNICAMENTE con un JSON válido (sin texto
adicional, sin backticks) con esta forma exacta:
{
  "hallazgos": [
    { "severidad": "critico" | "advertencia", "archivo": "ruta o 'general'", "mensaje": "descripción breve en español" }
  ]
}
Si no encuentras problemas, responde { "hallazgos": [] }. Sé conciso y
concreto: prioriza bugs reales, vulnerabilidades y riesgos de
regresión por encima de preferencias de estilo.`;

export class EvaluarConIANode extends Node {
  constructor() {
    // 2 intentos, 3 segundos de espera entre ellos (llamadas de red).
    super(2, 3);
  }

  async prep(shared) {
    return shared.archivos || [];
  }

  async exec(archivos) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      const error = new Error("MISTRAL_API_KEY no está configurada.");
      error.omitido = true;
      throw error;
    }

    const codigo = construirResumenCodigo(archivos);
    const respuesta = await fetch(MISTRAL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.MISTRAL_MODEL || MODELO_POR_DEFECTO,
        messages: [
          { role: "system", content: PROMPT_SISTEMA },
          { role: "user", content: codigo },
        ],
        temperature: 0.2,
      }),
    });

    if (!respuesta.ok) {
      throw new Error(`Mistral AI respondió con estado ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    const texto = datos.choices?.[0]?.message?.content ?? "{}";

    try {
      const parseado = JSON.parse(texto);
      return { omitido: false, hallazgos: parseado.hallazgos || [] };
    } catch {
      throw new Error("La respuesta de Mistral AI no fue un JSON válido.");
    }
  }

  async execFallback(_prepRes, error) {
    const motivo = error.omitido
      ? "MISTRAL_API_KEY no configurada"
      : `error llamando a Mistral AI: ${error.message}`;
    console.warn(`[evaluar-con-ia] Paso omitido — ${motivo}`);
    return { omitido: true, motivo, hallazgos: [] };
  }

  async post(shared, _prepRes, resultado) {
    shared.hallazgosIA = resultado;
    if (!resultado.omitido) {
      console.log(`[evaluar-con-ia] ${resultado.hallazgos.length} hallazgos de Mistral AI`);
    }
    return "default";
  }
}
