# Guía de orientación para la extensión "extension_chrome"

## 1. Panorama general
- El repositorio actualmente describe una **extensión de Chrome enfocada en guardar prompts de IA**. 【F:README.md†L1-L2】
- Aún no se ha versionado código fuente adicional; este documento orienta sobre la estructura y prácticas recomendadas para empezar a contribuir.

## 2. Estructura sugerida del proyecto
Aunque el repositorio todavía está vacío, es útil conocer los bloques típicos de una extensión moderna:

| Carpeta/archivo | Propósito principal | Notas |
| --- | --- | --- |
| `manifest.json` | Define metadatos de la extensión, permisos, scripts y recursos declarados. | Para Chrome MV3 usa `service_worker` en lugar de `background` persistente. |
| `src/background/` | Código que corre en el contexto del **Service Worker**: sincroniza almacenamiento, escucha eventos del navegador y sirve como hub de mensajería. | Mantén el estado mínimo y usa APIs asíncronas (`chrome.storage`, `chrome.runtime`). |
| `src/content/` | Scripts que se inyectan en páginas para capturar prompts o interacciones con IA. | Evita tocar el DOM sin comprobar permisos y origen. |
| `src/popup/` | Interfaz que aparece al pulsar el icono de la extensión. | Ideal para mostrar historial de prompts guardados y atajos rápidos. |
| `src/options/` | Página de configuración para gestionar sincronización, exportación/importación y preferencias. | Usa `chrome.storage.sync` para compartir configuraciones entre dispositivos. |
| `assets/` | Íconos, estilos globales, fuentes. | Chrome exige imágenes de varios tamaños (`16`, `32`, `128`). |
| `tests/` | Pruebas unitarias y E2E (por ejemplo, con `web-ext`, `jest`, `playwright`). | Útil para validar captura de prompts y flujos de guardado. |

> Consejo: adopta un sistema de bundling (p. ej. Vite, Webpack o esbuild) para transformar TypeScript/React y empaquetar la extensión.

## 3. Flujo funcional básico
1. **Captura**: Un content script detecta la presencia de un prompt de IA (textarea, editor, etc.).
2. **Comunicación**: El script envía el prompt al background mediante `chrome.runtime.sendMessage` o `chrome.runtime.connect`.
3. **Persistencia**: El background guarda los datos en `chrome.storage.local`/`sync` y opcionalmente en IndexedDB para búsquedas avanzadas.
4. **Visualización**: El popup u opciones leen el historial y permiten filtrar, etiquetar y exportar.
5. **Integraciones**: Hooks opcionales para enviar prompts a servicios externos (p. ej. Notion, Google Drive) usando `fetch` desde el background o desde un servidor auxiliar.

## 4. Aspectos clave que conviene dominar
- **Manifest V3**: permisos mínimos (`activeTab`, `scripting`, `storage`), restricciones de `service_worker` y actualización de recursos.
- **APIs de almacenamiento**: diferencias entre `chrome.storage.local`, `sync` y uso de `IndexedDB` para datos grandes.
- **Mensajería y eventos**: patrones `request/response`, `Port`, listeners que deben mantenerse ligeros para evitar que el service worker se suspenda.
- **UI modular**: construir componentes reutilizables (React, Svelte o vanilla). Considerar i18n y accesibilidad.
- **Gestión de estado**: sin `window` global en service worker; usa módulos, patrones pub/sub o librerías ligeras.
- **Automatización**: scripts de `npm` para build (`npm run build`), empaquetado (`npm run zip`), linting (`eslint`, `prettier`) y pruebas.

## 5. Qué aprender a continuación
1. **Documentación oficial de Chrome Extensions (MV3)**: entender límites de permisos, políticas de publicación y proceso de revisión.
2. **Herramientas de empaquetado front-end**: elegir y configurar Vite/Webpack para manejar TypeScript, JSX y CSS.
3. **Persistencia avanzada**: Indexado con IndexedDB, serialización/deserialización de prompts y cifrado opcional (Web Crypto).
4. **Buenas prácticas de UX**: accesibilidad (WCAG), diseño responsivo del popup, atajos de teclado (`commands`).
5. **Pruebas automatizadas**: configurar `web-ext` o `chrome-extension-cli` para ejecutar pruebas y `Playwright`/`Puppeteer` para flujos end-to-end.
6. **Integraciones externas**: OAuth 2.0, manejo seguro de tokens, uso de `chrome.identity`.

## 6. Próximos pasos sugeridos para el equipo
- Definir requerimientos funcionales concretos (tipos de prompts, tags, exportación).
- Decidir stack UI (React + TypeScript, Svelte, vanilla).
- Configurar pipeline de build y linting desde el inicio.
- Establecer convenciones de carpetas, nombrado y guidelines de contribución.

## 7. Utilidades y buenas prácticas recomendadas para la extensión
Para que la extensión realmente cubra el flujo de trabajo de guardado de prompts, conviene priorizar utilidades concretas:

- **Captura inteligente de prompts**: detecta cambios en textareas relevantes (ChatGPT, Gemini, Claude, etc.) y evita duplicados comparando hash o timestamps.
- **Etiquetado y clasificación**: permite añadir etiquetas, carpetas o estados (borrador/publicado). Facilita búsquedas por contexto, tono o modelo usado.
- **Historial enriquecido**: guarda metadatos (fecha, origen, enlace de conversación, modelo IA) y soporta notas rápidas para cada entrada.
- **Búsqueda avanzada**: incluye filtros por etiqueta, rango de fechas y texto completo (fuzzy search) para localizar prompts rápidamente.
- **Sincronización y backup**: usa `chrome.storage.sync` para datos ligeros y exportación/importación (JSON/CSV) para respaldos completos.
- **Automatizaciones**: crea acciones rápidas (copiar al portapapeles, enviar a API externa, crear plantilla) expuestas en popup u omnibox.
- **Privacidad y seguridad**: ofrece cifrado opcional local, bloqueo con contraseña y controles granulares de permisos/domínios.
- **Atajos y accesibilidad**: define comandos de teclado (`commands` en manifest) y soporta lectores de pantalla y temas de alto contraste.
- **Integraciones externas**: contempla webhooks o conectores (Notion, Slack, correo) gestionados desde el background con colas y reintentos.
- **Observabilidad**: registra eventos clave (captura, error de sync) en `chrome.storage` o consola para debugging, y facilita enviar reportes.

---
Esta guía sirve como punto de partida hasta que el repositorio incorpore el código base real de la extensión.
