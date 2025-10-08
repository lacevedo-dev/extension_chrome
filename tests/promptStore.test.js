import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPromptEntry,
  filterPrompts,
  mergeTags,
  normalizeText,
  upsertPrompt
} from '../src/lib/promptStore.js';

test('normaliza espacios y mayúsculas al generar hash', () => {
  const a = createPromptEntry('Hola   mundo');
  const b = createPromptEntry('Hola mundo');
  assert.equal(a.hash, b.hash);
});

test('inserta y actualiza prompts sin duplicados', () => {
  const original = createPromptEntry('Prompt de prueba');
  const { prompts, added } = upsertPrompt([], original);
  assert.equal(added, true);
  assert.equal(prompts.length, 1);

  const updatedEntry = { ...original, text: 'Prompt de prueba', updatedAt: new Date().toISOString() };
  const result = upsertPrompt(prompts, updatedEntry);
  assert.equal(result.added, false);
  assert.equal(result.prompts.length, 1);
  assert.equal(result.prompts[0].updatedAt, updatedEntry.updatedAt);
});

test('limita la cantidad máxima de prompts', () => {
  const prompts = [];
  for (let i = 0; i < 10; i += 1) {
    const entry = createPromptEntry(`Prompt ${i}`);
    const { prompts: updated } = upsertPrompt(prompts, entry, { maxSize: 5 });
    prompts.splice(0, prompts.length, ...updated);
  }
  assert.equal(prompts.length, 5);
});

test('combina etiquetas sin duplicados', () => {
  const tags = mergeTags(['Diseño', 'IA'], ['ia', 'Productividad']);
  assert.deepEqual(tags, ['diseño', 'ia', 'productividad']);
});

test('filtra prompts por texto y etiquetas', () => {
  const entries = [
    createPromptEntry('Resumir texto', { tags: ['resumen'] }),
    createPromptEntry('Traducir correo', { tags: ['traducción'] })
  ];
  const filtered = filterPrompts(entries, 'traducción');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].text, 'Traducir correo');
  assert.equal(normalizeText(filtered[0].text), 'Traducir correo');
});
