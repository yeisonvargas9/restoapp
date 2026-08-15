/**
 * Configuración de Firebase.
 *
 * IMPORTANTE — CONFIGURACIÓN MANUAL REQUERIDA:
 * Los valores marcados como "TODO_REEMPLAZAR" son PLACEHOLDERS.
 * Debes reemplazarlos por los datos reales de tu proyecto Firebase.
 * Se obtienen en: Firebase Console > Configuración del proyecto (ícono
 * de engranaje) > pestaña "General" > sección "Tus apps" > app web >
 * "Configuración del SDK" > opción "Config".
 *
 * `databaseURL` es el único valor que se conoce con certeza (lo
 * proporcionaste tú) y ya está configurado para tu instancia de
 * Realtime Database. El resto de los campos (apiKey, authDomain,
 * projectId, storageBucket, messagingSenderId, appId) NO se inventaron:
 * debes completarlos tú copiándolos directamente de la consola de
 * Firebase de tu proyecto "restoapp-415df".
 *
 * La apiKey de Firebase para apps web no es secreta por diseño (se
 * protege con las reglas de seguridad de Firebase, no ocultándola),
 * pero de todas formas es buena práctica no versionar este archivo
 * con datos reales si tu flujo de trabajo lo exige.
 */
export const firebaseConfig = {
  apiKey: "TODO_REEMPLAZAR",
  authDomain: "TODO_REEMPLAZAR",
  databaseURL: "https://restoapp-415df-default-rtdb.firebaseio.com",
  projectId: "TODO_REEMPLAZAR",
  storageBucket: "TODO_REEMPLAZAR",
  messagingSenderId: "TODO_REEMPLAZAR",
  appId: "TODO_REEMPLAZAR",
};
