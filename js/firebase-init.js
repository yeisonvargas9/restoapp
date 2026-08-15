// Inicialización centralizada de Firebase (App + Auth).
// Solo se importa en las páginas que necesitan autenticación
// (login.html y admin.html), para no cargar el SDK completo
// en pedido.html, que solo necesita lectura pública del menú.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
