// Capa de UI (DOM) para pedido.html.
// Usa las funciones puras de menu-service.js y pedidos.js;
// este archivo solo se encarga de leer/escribir el DOM.
import { obtenerMenu } from "./menu-service.js";
import { validarPedido, calcularPedido, crearResumenPedido } from "./pedidos.js";

const selectPlato = document.getElementById("plato");
const inputCantidad = document.getElementById("cantidad");
const inputPrecio = document.getElementById("precio");
const form = document.getElementById("pedidoForm");
const resultado = document.getElementById("resultado");
const mensaje = document.getElementById("mensaje");

// Estado local del módulo (no global): el menú cargado para esta página.
let menuActual = [];

async function cargarMenuEnSelect() {
  selectPlato.innerHTML = '<option value="">Cargando menú...</option>';
  try {
    menuActual = await obtenerMenu();
    selectPlato.innerHTML = '<option value="">-- Selecciona un plato --</option>';
    menuActual.forEach((plato) => {
      const opt = document.createElement("option");
      opt.value = plato.id;
      opt.textContent = `${plato.name} ($${plato.price})`;
      selectPlato.appendChild(opt);
    });
  } catch (err) {
    console.error("Error cargando menú:", err);
    selectPlato.innerHTML = '<option value="">-- Error cargando menú --</option>';
    mostrarMensaje("No se pudo cargar el menú. Intenta recargar la página.", "error");
  }
}

function obtenerPlatoPorId(id) {
  return menuActual.find((p) => p.id === String(id));
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo === "error" ? "msg msg-error" : "msg msg-success";
}

function limpiarFormulario() {
  form.reset();
  inputPrecio.value = "";
}

// Autocompletar precio al seleccionar plato
selectPlato.addEventListener("change", () => {
  const plato = obtenerPlatoPorId(selectPlato.value);
  inputPrecio.value = plato ? plato.price : "";
});

// Envío del pedido
form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  mensaje.textContent = "";
  resultado.textContent = "";

  const datos = {
    platoId: selectPlato.value,
    cantidad: inputCantidad.value,
    precioUnitario: inputPrecio.value,
  };

  const validacion = validarPedido(datos);
  if (!validacion.valido) {
    mostrarMensaje(validacion.errores.join(" "), "error");
    return;
  }

  const { subtotal, iva, total } = calcularPedido({
    cantidad: validacion.cantidad,
    precioUnitario: validacion.precioUnitario,
  });

  const plato = obtenerPlatoPorId(datos.platoId);
  resultado.textContent = crearResumenPedido({
    platoNombre: plato ? plato.name : datos.platoId,
    cantidad: validacion.cantidad,
    subtotal,
    iva,
    total,
  });

  limpiarFormulario();
});

cargarMenuEnSelect();
