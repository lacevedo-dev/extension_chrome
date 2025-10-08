import test from 'node:test';
import assert from 'node:assert/strict';
import { promptsToCsv } from '../src/lib/csv.js';
import { createPromptEntry } from '../src/lib/promptStore.js';

test('genera encabezados y filas con datos sanitizados', () => {
  const entry = createPromptEntry('Hola, "mundo"', {
    sourceUrl: 'https://ejemplo.com',
    sourceTitle: 'Ejemplo',
    tags: ['demo', 'IA']
  });
  const csv = promptsToCsv([entry]);
  const lines = csv.split('\n');
  assert.equal(lines[0], 'texto,origen,titulo,creado_en,actualizado_en,tags');
  assert.equal(lines.length, 2);
  assert.ok(lines[1].includes('"Hola, ""mundo"""'));
  assert.ok(lines[1].includes('demo|ia'));
});
