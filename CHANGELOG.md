# CHANGELOG — Refactorización RestoApp

## Resumen

El proyecto pasó de ser un único `index.html` monolítico a una **MPA
(Multiple Page Application)** modular: 4 páginas HTML, una hoja de
estilos unificada y JavaScript separado por responsabilidad usando
módulos ES (`type="module"`), sin variables globales.

Toda la funcionalidad original se mantiene: carga de menú desde
Firebase Realtime Database, cálculo de pedidos con IVA del 19%, login
y creación de productos.

## Cambio de instancia de Firebase

El proyecto legacy apuntaba a `stock-flow-2e23e-default-rtdb.firebaseio.com`.
Toda referencia a esa URL fue eliminada. La aplicación ahora usa
exclusivamente:

```
https://restoapp-415df-default-rtdb.firebaseio.com
```

Esta URL se usa en `js/firebase-config.js` (campo `databaseURL`) y en
las peticiones REST de `js/menu-service.js` y `js/admin-service.js`.
La estructura de datos esperada en `/menu` no cambió (objetos o
arreglo con `name`/`price` o `precio`), por lo que es compatible con
el formato original.

## Archivos nuevos

```
index.html                 → Página de inicio / navegación (nueva)
pedido.html                → Antes era el formulario "Mesero" en index.html
login.html                 → Antes era la sección #auth en index.html
admin.html                 → Antes era la sección #productForm en index.html
css/styles.css             → Todo el CSS embebido, unificado y limpio
js/firebase-config.js      → Configuración de Firebase (placeholders, ver abajo)
js/firebase-init.js        → Inicialización de la app y Auth de Firebase
js/menu-service.js         → Lógica de negocio del menú (fetch + normalización)
js/pedidos.js              → Lógica de negocio de pedidos (validación + cálculo)
js/pedido-page.js          → DOM/UI de pedido.html
js/auth-service.js         → Lógica de autenticación (Firebase Auth)
js/login-page.js           → DOM/UI de login.html
js/admin-service.js        → Lógica de negocio de administración (crear producto)
js/admin-page.js           → DOM/UI de admin.html
database.rules.json        → Reglas de seguridad de Realtime Database
CHANGELOG.md                → Este archivo
```

## Archivos modificados

- `index.html`: reemplazado por completo (antes contenía las 3 vistas
  mezcladas); ahora es solo una página de navegación.
- `README.md`: actualizado para reflejar la nueva estructura del taller.

## Problemas del código legacy solucionados

1. **Monolito de una sola página** → separado en 4 páginas HTML
   (`index`, `pedido`, `login`, `admin`), cada una con su propio script.
2. **CSS embebido y con selectores muertos** (`.clase_redundante_que_no_se_usa`)
   → unificado en `css/styles.css`, con la clase muerta eliminada.
3. **Variables globales** (`items`, `total_global`, `menuData`, `isLogged`,
   `ADMIN_USER`, `ADMIN_PASS`) → eliminadas. El estado ahora vive dentro
   de cada módulo ES (scope de módulo, no `window`) o en Firebase Auth.
4. **Función monolítica `tomarTodo()`** (alta complejidad ciclomática,
   variables crípticas `a`, `b`, `p`) → dividida en:
   - `validarPedido()` (validación pura)
   - `calcularPedido()` (cálculo de subtotal/IVA/total, pura)
   - `crearResumenPedido()` (formato de texto, pura)
   - `pedido-page.js` (únicamente manipulación del DOM)
5. **Código muerto**: `funcionObsoletaCalculoAnterior()` eliminada por
   completo (no se llamaba desde ningún lugar).
6. **Credenciales hardcodeadas en el cliente** (`admin`/`admin`)
   → eliminadas. El login ahora usa **Firebase Authentication**
   (correo/contraseña). Requiere configuración manual, ver más abajo.
7. **Escritura sin autenticación en Firebase** (cualquiera podía hacer
   `POST` a `/menu.json`) → ahora la escritura requiere un usuario
   autenticado; el token de sesión (`idToken`) se envía en la petición
   y las reglas de la base de datos (`database.rules.json`) rechazan
   escrituras sin `auth != null`.
8. **Sin validación real de formularios** → validaciones explícitas
   con mensajes de error claros en `pedidos.js` y `admin-service.js`
   (cantidad/precio > 0, nombre con longitud mínima, email/contraseña
   requeridos, etc.), mostrados en la UI mediante elementos `.msg`.
9. **Lógica de negocio mezclada con el DOM** → separada consistentemente:
   los archivos `*-service.js` / `pedidos.js` no tocan el DOM; los
   archivos `*-page.js` no contienen reglas de negocio, solo leen/escriben
   el DOM y llaman a las funciones de negocio.
10. **Manejo de errores pobre** (`alert("Error en datos")`) → reemplazado
    por mensajes específicos en pantalla (`msg-error` / `msg-success`)
    y captura de errores de red/Firebase con mensajes entendibles.

## Configuración manual requerida (IMPORTANTE)

Estos pasos **no se pueden hacer desde el código** y debes completarlos
tú en la [Consola de Firebase](https://console.firebase.google.com/)
del proyecto `restoapp-415df`:

1. **Completar `js/firebase-config.js`**
   Reemplaza los valores `"TODO_REEMPLAZAR"` por los datos reales de
   tu app web: Configuración del proyecto → Tus apps → SDK de Firebase
   → "Config". El `databaseURL` ya está correcto.

2. **Habilitar Firebase Authentication**
   En la consola: Authentication → Sign-in method → habilitar el
   proveedor **Correo electrónico/contraseña**.

3. **Crear el usuario administrador**
   En Authentication → Users → "Add user", crea la cuenta
   (correo + contraseña) que usará el mesero/administrador para
   entrar en `login.html`. Ya no existen credenciales en el código.

4. **Publicar las reglas de Realtime Database**
   En Realtime Database → Reglas, pega el contenido de
   `database.rules.json` (lectura pública del menú, escritura solo
   para usuarios autenticados) y publica los cambios. Sin este paso,
   la base de datos seguirá aceptando escrituras sin autenticación
   (comportamiento del proyecto original) o, si ya tenía reglas más
   restrictivas, el panel de admin podría no poder escribir.

5. **(Opcional) Dominios autorizados**
   Si vas a alojar el proyecto en un dominio distinto a `localhost`,
   agrégalo en Authentication → Settings → Authorized domains, o
   Firebase Auth rechazará los inicios de sesión desde ese dominio.

## No se implementó (fuera de alcance)

- Backend propio / servidor intermedio: el taller pedía usar Firebase
  Authentication como alternativa viable dentro del proyecto estático,
  así que no se agregó un backend adicional.
- Roles diferenciados de usuario (ej. "mesero" vs "admin"): cualquier
  usuario autenticado en Firebase Auth puede usar el panel de admin,
  igual que en el proyecto original cualquiera que supiera la
  contraseña única podía hacerlo. Si se necesitan roles, se puede
  extender con Firebase Custom Claims o un campo `role` en la base de
  datos — no se agregó porque no estaba en los objetivos del taller.
