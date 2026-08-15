// Lógica de negocio del panel de administración.
import { auth } from "./firebase-init.js";

const MENU_URL =
  "https://restoapp-415df-default-rtdb.firebaseio.com/menu.json";

/**
 * Valida los datos de un producto nuevo.
 */
export function validarProducto({ name, price }) {
  const errores = [];

  if (!name || name.trim().length < 2) {
    errores.push("El nombre debe tener al menos 2 caracteres.");
  }

  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    errores.push("El precio debe ser un número mayor que 0.");
  }

  return { valido: errores.length === 0, errores, price: priceNum };
}

/**
 * Crea un producto en el menú de Firebase Realtime Database.
 * Requiere una sesión activa: el token de identidad del usuario
 * autenticado se envía en la escritura para que las reglas de
 * seguridad de la base de datos (`auth != null`) la permitan.
 * Ver database.rules.json.
 */
export async function crearProducto({ name, price }) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Debes iniciar sesión para crear productos.");
  }

  const idToken = await user.getIdToken();
  const res = await fetch(`${MENU_URL}?auth=${idToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price }),
  });

  if (!res.ok) {
    throw new Error("Error al crear el producto en el servidor.");
  }

  return res.json();
}
