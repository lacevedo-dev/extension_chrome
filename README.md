# Prompt Keeper

Extensión de Chrome (Manifest V3) para capturar, organizar y exportar prompts de IA directamente desde cualquier página.

## Estructura del proyecto

- `manifest.json`: configuración principal de la extensión.
- `src/background.js`: service worker que guarda los prompts en `chrome.storage` y atiende las solicitudes del popup.
- `src/contentScript.js`: detecta interacciones en campos de texto y envía los prompts al background.
- `src/popup/`: interfaz del popup con su HTML, estilos y lógica.
- `src/lib/`: utilidades compartidas (gestión de prompts y exportación CSV).
- `scripts/build.js`: script de build que prepara la carpeta `dist/` para cargar la extensión en modo desarrollador.
- `scripts/lint.js`: verificación rápida de sintaxis para todos los archivos `.js`.
- `tests/`: pruebas unitarias con el runner nativo de Node (`node --test`).

## Requisitos previos

- Node.js 18 o superior.
- npm 9 o superior.

## Scripts disponibles

```bash
npm install      # (opcional) solo si deseas añadir dependencias propias
npm run build    # genera la carpeta dist/ lista para Chrome
npm test         # ejecuta las pruebas unitarias nativas de Node
npm run lint     # valida la sintaxis de todos los archivos JS
```

## Flujo de trabajo recomendado

1. Ejecuta `npm run build` para crear `dist/` y carga esa carpeta en `chrome://extensions` (modo desarrollador > Cargar descomprimida).
2. Usa `npm test` tras cada cambio en utilidades o lógica de negocio.
3. Revisa `npm run lint` antes de abrir un PR.

## Seguimiento de tareas

- [x] Crear scaffolding inicial de la extensión (manifest, background, content script, popup).
- [x] Implementar utilidades compartidas con deduplicación y exportación CSV.
- [x] Configurar pruebas unitarias con el runner nativo de Node.
- [x] Documentar instrucciones de instalación, build y pruebas.
- [ ] Implementar opciones de usuario (p.ej. gestión de tags personalizadas avanzadas).
- [ ] Añadir sincronización opcional con `chrome.storage.sync` y respaldos externos.
- [ ] Cubrir escenarios end-to-end con Playwright o similar.

## Próximos pasos sugeridos

- Diseñar una pantalla de opciones para editar tags predeterminados, límites y reglas de captura.
- Integrar mecanismos de cifrado local para prompts sensibles.
- Añadir métricas básicas (ej. contador diario) y telemetría opcional conforme a políticas de privacidad.

## Licencia

MIT
