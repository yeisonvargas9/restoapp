// Lógica de autenticación con Firebase Authentication.
// Reemplaza las credenciales hardcodeadas (admin/admin) del código legacy.
import { auth } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export function iniciarSesion(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function cerrarSesion() {
  return signOut(auth);
}

/**
 * Suscribe un callback(user|null) a los cambios de sesión.
 * Devuelve la función de "unsubscribe".
 */
export function observarSesion(callback) {
  return onAuthStateChanged(auth, callback);
}

// Mapeo de códigos de error de Firebase Auth a mensajes en español.
export const MENSAJES_ERROR_AUTH = {
  "auth/invalid-email": "El correo ingresado no es válido.",
  "auth/user-not-found": "No existe una cuenta con ese correo.",
  "auth/wrong-password": "Contraseña incorrecta.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde.",
  "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
};

export function mensajeErrorAuth(code) {
  return MENSAJES_ERROR_AUTH[code] || "No se pudo iniciar sesión. Intenta nuevamente.";
}
