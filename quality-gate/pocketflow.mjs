/**
 * pocketflow.mjs
 *
 * Implementación mínima, en JavaScript, del patrón PocketFlow
 * (https://github.com/The-Pocket/PocketFlow): un grafo de nodos donde
 * cada nodo tiene tres fases —prep, exec, post— y el resultado de
 * `post` (una "acción") decide cuál es el siguiente nodo del `Flow`.
 *
 * No es el paquete oficial (que es Python/TS), sino una reimplementación
 * fiel al mismo patrón para no depender de un paquete externo que no
 * podemos verificar contra la red desde este entorno. La API es
 * intencionalmente muy parecida a la original: BaseNode, Node (con
 * reintentos) y Flow (que encadena nodos).
 */

export class BaseNode {
  constructor() {
    this.params = {};
    this.successors = {};
  }

  setParams(params) {
    this.params = params;
    return this;
  }

  /** Conecta este nodo con `node` para la acción dada (por defecto "default"). */
  next(node, action = "default") {
    if (this.successors[action]) {
      console.warn(`[pocketflow] Sobrescribiendo sucesor para la acción '${action}'`);
    }
    this.successors[action] = node;
    return node;
  }

  // Las subclases sobreescriben estos tres métodos.
  async prep(shared) {}
  async exec(prepRes) {}
  async post(shared, prepRes, execRes) {
    return execRes;
  }

  async _exec(prepRes) {
    return this.exec(prepRes);
  }

  async _run(shared) {
    const prepRes = await this.prep(shared);
    const execRes = await this._exec(prepRes);
    return this.post(shared, prepRes, execRes);
  }

  async run(shared) {
    if (Object.keys(this.successors).length) {
      console.warn("[pocketflow] Este nodo tiene sucesores; debería ejecutarse dentro de un Flow.");
    }
    return this._run(shared);
  }
}

/** Nodo con reintentos y fallback ante fallos en `exec` (útil para llamadas a APIs externas). */
export class Node extends BaseNode {
  constructor(maxRetries = 1, waitSeconds = 0) {
    super();
    this.maxRetries = maxRetries;
    this.waitSeconds = waitSeconds;
  }

  /** Se ejecuta si todos los reintentos de `exec` fallan. Por defecto, relanza el error. */
  async execFallback(prepRes, error) {
    throw error;
  }

  async _exec(prepRes) {
    for (let intento = 0; intento < this.maxRetries; intento++) {
      try {
        return await this.exec(prepRes);
      } catch (error) {
        if (intento === this.maxRetries - 1) {
          return this.execFallback(prepRes, error);
        }
        if (this.waitSeconds > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.waitSeconds * 1000));
        }
      }
    }
  }
}

/** Orquesta una cadena de nodos siguiendo las acciones devueltas por cada `post`. */
export class Flow extends BaseNode {
  constructor(startNode) {
    super();
    this.startNode = startNode;
  }

  getNextNode(current, action) {
    const next = current.successors[action || "default"];
    if (!next && Object.keys(current.successors).length) {
      console.warn(`[pocketflow] Flow termina: no hay sucesor para la acción '${action}'`);
    }
    return next || null;
  }

  async _run(shared) {
    let current = this.startNode;
    let lastAction = null;
    while (current) {
      current.setParams(this.params);
      lastAction = await current._run(shared);
      current = this.getNextNode(current, lastAction);
    }
    return lastAction;
  }
}
