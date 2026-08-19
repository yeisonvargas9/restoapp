# Puerta de Calidad (Quality Gate) — RestoApp

Herramienta de **desarrollo**, inspirada en el patrón
[PocketFlow](https://github.com/The-Pocket/PocketFlow) + Mistral AI +
evaluadores rigurosos, que revisa el código de RestoApp **antes** de
que llegue a producción, siguiendo el concepto de "Quality Gates":
atrapar código defectuoso, bugs y vulnerabilidades antes de que
lleguen a los usuarios.

> ⚠️ Esto **no es parte de la app que usan tus meseros/administradores**.
> Es un script que corres tú (o tu pipeline de CI/CD) desde la terminal,
> con Node.js, antes de subir cambios. No se despliega junto con
> `index.html`, `pedido.html`, etc.

## Qué hace

El flujo (`flow.mjs`) encadena 4 nodos estilo PocketFlow
(`prep → exec → post`, con reintentos y fallback donde aplica):

1. **`LeerCodigoNode`** — lee todos los `.html`, `.css`, `.js` y `.json`
   del proyecto (excluyendo esta misma carpeta `quality-gate/`).
2. **`EvaluadoresLocalesNode`** — "evaluadores rigurosos" basados en
   reglas estáticas, sin depender de ninguna API: credenciales
   hardcodeadas, uso de `var`, `eval()`, `innerHTML` sin sanitizar,
   placeholders `TODO_REEMPLAZAR` sin completar, referencias a la
   instancia antigua de Firebase, `console.log` residual.
3. **`EvaluarConIANode`** — envía un resumen del código a **Mistral AI**
   (`mistral-small-latest` por defecto) pidiéndole una revisión
   adicional de bugs/vulnerabilidades/riesgos de regresión. Si no hay
   `MISTRAL_API_KEY`, o falla la llamada, este paso se **omite**
   explícitamente (no inventa resultados) y el reporte lo indica.
4. **`GenerarReporteNode`** — combina ambos resultados y decide:
   - Si hay **algún** hallazgo `critico` → puerta **⛔ BLOQUEADA**
   - Si solo hay `advertencia` (o nada) → puerta **✅ APROBADA**

   Escribe el detalle en `reportes/ultimo-reporte.md` y termina el
   proceso con código de salida `1` (bloqueado) o `0` (aprobado) — útil
   para un pipeline de CI/CD.

## Cómo ejecutarlo

Requiere Node.js 18+ (usa `fetch` nativo, sin dependencias externas).

```bash
cd quality-gate

# Sin revisión de IA (solo evaluadores locales):
node run.mjs

# Con revisión de Mistral AI:
export MISTRAL_API_KEY="tu_api_key_de_mistral"
node run.mjs

# o usando el archivo .env (Node 20.6+):
cp .env.example .env   # y completa MISTRAL_API_KEY
node --env-file=.env run.mjs
```

También puedes usar `npm run quality-gate` (ver `package.json`).

## Obtener la API key de Mistral

1. Crea una cuenta / inicia sesión en https://console.mistral.ai/
2. Ve a "API Keys" y genera una nueva key.
3. Cópiala en `.env` (campo `MISTRAL_API_KEY`) o expórtala como
   variable de entorno. **No la subas a un repositorio público.**

## Limitaciones conocidas

- El paso de Mistral AI **no se pudo probar contra la API real** desde
  este entorno de generación (no tiene salida de red hacia
  `api.mistral.ai`). El código sigue el formato documentado de la API
  de chat completions de Mistral, pero pruébalo tú con tu propia key
  antes de confiar en él para bloquear despliegues.
- Los evaluadores locales son reglas simples (expresiones regulares),
  no un analizador estático completo — atrapan patrones comunes, no
  garantizan ausencia total de bugs.
- Esta no es la librería oficial de PocketFlow (que es Python/TS),
  sino una reimplementación mínima y fiel al mismo patrón de nodos,
  para no depender de un paquete externo no verificable desde aquí.
