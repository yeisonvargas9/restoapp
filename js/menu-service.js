// Lógica de negocio del menú: obtención y normalización de datos.
// No toca el DOM — eso es responsabilidad de cada *-page.js.

const MENU_URL =
  "https://restoapp-415df-default-rtdb.firebaseio.com/menu.json";

/**
 * Obtiene el menú desde Firebase Realtime Database y lo normaliza
 * a un arreglo de objetos { id, name, price }.
 * @returns {Promise<Array<{id:string, name:string, price:number}>>}
 */
export async function obtenerMenu() {
  const res = await fetch(MENU_URL);
  if (!res.ok) {
    throw new Error("No se pudo cargar el menú desde el servidor.");
  }
  const data = await res.json();
  return normalizarMenu(data);
}

/**
 * Normaliza los datos crudos de Firebase (que pueden venir como
 * arreglo o como objeto de objetos) a una estructura consistente.
 */
export function normalizarMenu(data) {
  const menu = [];

  if (Array.isArray(data)) {
    data.forEach((item, idx) => {
      if (!item) return;
      menu.push(crearItemMenu(item.id ?? idx, item));
    });
  } else if (data && typeof data === "object") {
    Object.keys(data).forEach((key) => {
      menu.push(crearItemMenu(key, data[key] || {}));
    });
  }

  return menu;
}

function crearItemMenu(id, item) {
  return {
    id: String(id),
    name: item.name || `Plato ${id}`,
    price: Number(item.price ?? item.precio ?? 0),
  };
}
