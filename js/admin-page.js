// Capa de UI (DOM) para admin.html.
import { observarSesion, cerrarSesion } from "./auth-service.js";
import { validarProducto, crearProducto } from "./admin-service.js";
import { obtenerMenu } from "./menu-service.js";

const logoutBtn = document.getElementById("logoutBtn");
const userLabel = document.getElementById("userLabel");
const form = document.getElementById("productForm");
const nameInput = document.getElementById("newName");
const priceInput = document.getElementById("newPrice");
const mensaje = document.getElementById("prodMsg");
const listaMenu = document.getElementById("listaMenu");

// Guarda de ruta: si no hay sesión, se redirige a login.html.
observarSesion((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  userLabel.textContent = user.email;
  cargarListaMenu();
});

logoutBtn.addEventListener("click", async () => {
  await cerrarSesion();
  window.location.href = "login.html";
});

async function cargarListaMenu() {
  try {
    const menu = await obtenerMenu();
    listaMenu.innerHTML = "";
    menu.forEach((plato) => {
      const li = document.createElement("li");
      li.textContent = `${plato.name} — $${plato.price}`;
      listaMenu.appendChild(li);
    });
  } catch (err) {
    console.error("Error cargando menú:", err);
  }
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo === "error" ? "msg msg-error" : "msg msg-success";
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensaje.textContent = "";

  const datos = { name: nameInput.value.trim(), price: priceInput.value };
  const validacion = validarProducto(datos);

  if (!validacion.valido) {
    mostrarMensaje(validacion.errores.join(" "), "error");
    return;
  }

  try {
    await crearProducto({ name: datos.name, price: validacion.price });
    mostrarMensaje("Producto creado correctamente.", "success");
    form.reset();
    await cargarListaMenu();
  } catch (err) {
    console.error("Error creando producto:", err);
    mostrarMensaje(err.message || "Error creando el producto.", "error");
  }
});
