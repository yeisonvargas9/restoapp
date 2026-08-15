// Capa de UI (DOM) para login.html.
import { iniciarSesion, observarSesion, mensajeErrorAuth } from "./auth-service.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const mensaje = document.getElementById("mensaje");

function mostrarError(texto) {
  mensaje.textContent = texto;
  mensaje.className = "msg msg-error";
}

// Si ya hay sesión activa, redirige directo al panel de admin.
observarSesion((user) => {
  if (user) {
    window.location.href = "admin.html";
  }
});

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensaje.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    mostrarError("Debes ingresar correo y contraseña.");
    return;
  }

  try {
    await iniciarSesion(email, password);
    // La redirección a admin.html la maneja observarSesion() arriba.
  } catch (err) {
    console.error("Error de inicio de sesión:", err);
    mostrarError(mensajeErrorAuth(err.code));
  }
});
