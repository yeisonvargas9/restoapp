/**
 * flow.mjs
 *
 * Arma el Flow de PocketFlow (la "puerta de calidad") encadenando:
 *   LeerCodigoNode -> EvaluadoresLocalesNode -> EvaluarConIANode -> GenerarReporteNode
 */
import { Flow } from "./pocketflow.mjs";
import { LeerCodigoNode } from "./nodo-leer-codigo.mjs";
import { EvaluadoresLocalesNode } from "./nodo-evaluadores-locales.mjs";
import { EvaluarConIANode } from "./nodo-evaluar-con-ia.mjs";
import { GenerarReporteNode } from "./nodo-generar-reporte.mjs";

export function crearFlowPuertaDeCalidad() {
  const leerCodigo = new LeerCodigoNode();
  const evaluadoresLocales = new EvaluadoresLocalesNode();
  const evaluarConIA = new EvaluarConIANode();
  const generarReporte = new GenerarReporteNode();

  leerCodigo.next(evaluadoresLocales);
  evaluadoresLocales.next(evaluarConIA);
  evaluarConIA.next(generarReporte);

  return new Flow(leerCodigo);
}
