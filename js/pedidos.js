// Lógica de negocio de pedidos.
// Refactorización de la antigua función monolítica `tomarTodo()`:
// aquí solo hay validación y cálculo, sin acceso al DOM.

export const IVA_RATE = 0.19;

/**
 * Valida los datos de un pedido.
 * @returns {{valido:boolean, errores:string[], cantidad:number, precioUnitario:number}}
 */
export function validarPedido({ platoId, cantidad, precioUnitario }) {
  const errores = [];

  if (!platoId) {
    errores.push("Debes seleccionar un plato.");
  }

  const cantidadNum = Number(cantidad);
  if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
    errores.push("La cantidad debe ser un número mayor que 0.");
  }

  const precioNum = Number(precioUnitario);
  if (!Number.isFinite(precioNum) || precioNum <= 0) {
    errores.push("El precio unitario debe ser un número mayor que 0.");
  }

  return {
    valido: errores.length === 0,
    errores,
    cantidad: cantidadNum,
    precioUnitario: precioNum,
  };
}

/**
 * Calcula subtotal, IVA y total de un pedido ya validado.
 */
export function calcularPedido({ cantidad, precioUnitario, tasaIva = IVA_RATE }) {
  const subtotal = cantidad * precioUnitario;
  const iva = subtotal * tasaIva;
  const total = subtotal + iva;
  return { subtotal, iva, total };
}

/**
 * Construye el texto de resumen para mostrar al usuario.
 */
export function crearResumenPedido({ platoNombre, cantidad, subtotal, iva, total }) {
  return (
    `Pedido: ${platoNombre} x${cantidad} | ` +
    `Subtotal: $${subtotal.toFixed(2)} | ` +
    `IVA: $${iva.toFixed(2)} | ` +
    `Total: $${total.toFixed(2)}`
  );
}
