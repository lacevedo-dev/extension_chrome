import { normalizeText } from './promptStore.js';

const CSV_HEADERS = ['texto', 'origen', 'titulo', 'creado_en', 'actualizado_en', 'tags'];

function escapeCell (value) {
  if (value == null) return '';
  const stringValue = String(value).replace(/\r?\n/g, '\n');
  if (/[",;\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function normalizeTag (tag) {
  const normalized = normalizeText(tag);
  return normalized ? normalized.toLowerCase() : '';
}

export function promptsToCsv (prompts) {
  const rows = [CSV_HEADERS.join(',')];
  prompts.forEach((prompt) => {
    rows.push([
      escapeCell(prompt.text),
      escapeCell(prompt.sourceUrl || ''),
      escapeCell(prompt.sourceTitle || ''),
      escapeCell(prompt.createdAt || ''),
      escapeCell(prompt.updatedAt || ''),
      escapeCell(Array.isArray(prompt.tags) ? prompt.tags.map(normalizeTag).filter(Boolean).join('|') : '')
    ].join(','));
  });
  return rows.join('\n');
}

export default {
  promptsToCsv
};
