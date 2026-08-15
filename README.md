RestoApp - Taller de Refactorización y Uso de IA

Resumen
- Este proyecto fue refactorizado desde una base "legacy" de una sola
  página a una MPA (Multiple Page Application) modular. Ver
  [CHANGELOG.md](CHANGELOG.md) para el detalle completo de los cambios.
- Sigue conectado a Firebase Realtime Database en:
  https://restoapp-415df-default-rtdb.firebaseio.com/menu.json

Estructura del proyecto
```
index.html          → Página de inicio / navegación
pedido.html          → Formulario para que el mesero tome pedidos
login.html           → Inicio de sesión (Firebase Authentication)
admin.html           → Panel de administración (crear productos), requiere sesión
css/
  styles.css          → Hoja de estilos unificada
js/
  firebase-config.js  → Configuración de Firebase (completar manualmente)
  firebase-init.js    → Inicialización de Firebase App + Auth
  menu-service.js     → Lógica de negocio: obtener/normalizar el menú
  pedidos.js          → Lógica de negocio: validar y calcular pedidos
  pedido-page.js       → DOM/UI de pedido.html
  auth-service.js      → Lógica de autenticación (Firebase Auth)
  login-page.js        → DOM/UI de login.html
  admin-service.js      → Lógica de negocio: validar/crear productos
  admin-page.js          → DOM/UI de admin.html
database.rules.json    → Reglas de seguridad de Realtime Database
CHANGELOG.md            → Historial de la refactorización
```

Configuración inicial (requerida antes de usar login/admin)
1. Completar `js/firebase-config.js` con los datos reales de tu proyecto Firebase.
2. Habilitar el proveedor de correo/contraseña en Firebase Authentication.
3. Crear el usuario administrador en Firebase Authentication.
4. Publicar `database.rules.json` en Realtime Database.

Ver el detalle paso a paso en la sección "Configuración manual requerida"
de [CHANGELOG.md](CHANGELOG.md).

Instrucciones rápidas
1. Abrir `index.html` en el navegador (doble clic), o servirlo con
   cualquier servidor estático. El proyecto sigue siendo 100% estático.
   Nota: por usar módulos ES (`type="module"`), algunos navegadores
   requieren servir los archivos por `http://` en vez de `file://`
   (por ejemplo con `npx serve` o la extensión "Live Server").
2. `pedido.html` funciona sin sesión (lectura pública del menú).
3. `login.html` y `admin.html` requieren la configuración de Firebase
   Authentication descrita arriba.

Objetivo del taller
- Transformar la base legacy en una MPA bien estructurada y modular. ✅
- Enseñar a usar la IA como asistente para revisar, proponer y aplicar
  refactorizaciones. ✅

Ejercicios sugeridos (ya resueltos como referencia; útiles para revisión)
- Ejercicio 1 — Convertir a MPA: ver `index.html`, `login.html`,
  `pedido.html`, `admin.html`.
- Ejercicio 2 — Modularizar JavaScript: ver carpeta `js/`, separada por
  responsabilidad (menú, pedidos, auth, admin) y por capa (servicio vs. página).
- Ejercicio 3 — Autenticación y seguridad: ver `auth-service.js`,
  `database.rules.json` y la sección de configuración manual en
  `CHANGELOG.md`.
- Ejercicio 4 — Limpieza y pruebas: código muerto eliminado
  (`funcionObsoletaCalculoAnterior`), validaciones agregadas.
- Ejercicio 5 — Buenas prácticas: lógica de negocio separada de la
  manipulación del DOM (`*-service.js` / `pedidos.js` vs. `*-page.js`).

Uso de la IA como asistente
- Pide a la IA que haga cambios pequeños y justificables:
  "Refactoriza `calcularPedido()` para soportar descuentos."
- Ejemplos de prompts útiles:
  - "Agrega una página de reportes de pedidos."
  - "Escribe pruebas unitarias para `pedidos.js`."
  - "Revisa `database.rules.json` y sugiere mejoras de seguridad."

Autor: Instructor (plantilla para taller) — refactorización asistida por IA.
