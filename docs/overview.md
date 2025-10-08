# Guía de orientación para la extensión "Prompt Keeper"

## 1. Panorama general
- El repositorio contiene una **extensión de Chrome en Manifest V3** que captura prompts desde campos de texto y los guarda en `chrome.storage.local`. 【F:manifest.json†L1-L18】【F:src/background.js†L1-L46】
- La extensión ofrece un popup para consultar, buscar y exportar los prompts a CSV. 【F:src/popup/popup.html†L1-L33】【F:src/popup/popup.js†L1-L73】

## 2. Estructura del proyecto

| Carpeta/archivo | Propósito principal | Notas |
| --- | --- | --- |
| `manifest.json` | Define permisos, service worker y popup. | Usa `type: "module"` para habilitar ES Modules en el service worker. |
| `src/background.js` | Guarda prompts, gestiona deduplicación y expone API para el popup. | Basado en utilidades compartidas (`src/lib/`). |
| `src/contentScript.js` | Observa textareas, inputs y elementos `contenteditable` para capturar prompts. | Envía mensajes al background en blur y `Ctrl/Cmd + Enter`. |
| `src/popup/` | UI ligera en HTML/CSS/JS para listar y exportar prompts. | Incluye filtrado en tiempo real y descarga CSV. |
| `src/lib/` | Funciones puras para normalización, hash, deduplicación y CSV. | Cubiertas por pruebas `node --test`. |
| `scripts/` | Scripts auxiliares (`build.js`, `lint.js`). | `lint.js` valida sintaxis con `node --check`. |
| `tests/` | Pruebas unitarias con el runner nativo de Node. | Ejecutar `npm test`. |

## 3. Flujo funcional
1. **Captura**: El content script detecta interacciones relevantes y envía el texto al background. 【F:src/contentScript.js†L1-L64】
2. **Almacenamiento**: El background normaliza, deduplica y persiste el prompt. 【F:src/background.js†L12-L35】
3. **Visualización**: El popup solicita los datos al background y los renderiza con filtros básicos. 【F:src/popup/popup.js†L21-L67】
4. **Exportación**: El usuario puede descargar los prompts filtrados en CSV. 【F:src/popup/popup.js†L41-L63】【F:src/lib/csv.js†L1-L27】

## 4. Pruebas y calidad
- Usa `npm test` para ejecutar las suites ubicadas en `tests/`. 【F:package.json†L1-L11】
- Ejecuta `npm run lint` para validar sintaxis con `node --check` en cada archivo `.js`. 【F:scripts/lint.js†L1-L40】
- Antes de publicar, verifica la extensión manualmente cargando `dist/` en modo desarrollador.

## 5. Aprendizajes recomendados
1. **Manifest V3 avanzado**: lifecycle del service worker, limitaciones de `chrome.storage`.
2. **UX del popup**: accesibilidad, navegabilidad con teclado y temas claros/oscuros.
3. **Sincronización y seguridad**: cifrado con Web Crypto, uso de `chrome.storage.sync` y manejo de permisos mínimos.
4. **Pruebas E2E**: Playwright/Puppeteer para validar captura real en sitios como ChatGPT o Gemini.

## 6. Roadmap sugerido
- [ ] Añadir página de opciones para personalizar tags automáticos y límites.
- [ ] Permitir sincronización remota y exportación programada.
- [ ] Añadir métricas y diagnósticos opcionales para detectar fallos de captura.
- [ ] Integrar pruebas end-to-end automatizadas.

Esta guía se mantiene como referencia para nuevos colaboradores y debe actualizarse conforme evolucione la extensión.
