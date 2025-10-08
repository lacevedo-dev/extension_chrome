const DEFAULT_MAX_PROMPTS = 500;

export const STORAGE_KEY = 'promptKeeper.prompts';

export function normalizeText (text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim();
}

export function hashPrompt (text) {
  const normalized = normalizeText(text);
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function createPromptEntry (text, metadata = {}) {
  const normalized = normalizeText(text);
  const hash = hashPrompt(normalized);
  const now = new Date().toISOString();
  return {
    id: `${hash}-${Date.now()}`,
    hash,
    text: normalized,
    createdAt: metadata.createdAt || now,
    updatedAt: now,
    sourceUrl: metadata.sourceUrl || null,
    sourceTitle: metadata.sourceTitle || null,
    tags: Array.isArray(metadata.tags) ? metadata.tags.map(normalizeText).filter(Boolean) : []
  };
}

export function upsertPrompt (collection, newEntry, options = {}) {
  const prompts = Array.isArray(collection) ? [...collection] : [];
  const max = typeof options.maxSize === 'number' ? options.maxSize : DEFAULT_MAX_PROMPTS;
  const existingIndex = prompts.findIndex((prompt) => prompt.hash === newEntry.hash);
  let updated = false;

  if (existingIndex >= 0) {
    const previous = prompts[existingIndex];
    prompts[existingIndex] = {
      ...previous,
      text: newEntry.text || previous.text,
      updatedAt: newEntry.updatedAt,
      sourceUrl: newEntry.sourceUrl || previous.sourceUrl,
      sourceTitle: newEntry.sourceTitle || previous.sourceTitle,
      tags: mergeTags(previous.tags, newEntry.tags)
    };
  } else {
    prompts.unshift(newEntry);
    updated = true;
  }

  if (prompts.length > max) {
    prompts.length = max;
  }

  return {
    prompts,
    added: updated,
    total: prompts.length
  };
}

export function mergeTags (previous = [], incoming = []) {
  const set = new Set();
  [...previous, ...incoming].forEach((tag) => {
    const normalized = normalizeText(tag);
    if (normalized) set.add(normalized.toLowerCase());
  });
  return Array.from(set);
}

export function filterPrompts (collection, query = '') {
  const normalizedQuery = normalizeText(query).toLowerCase();
  if (!normalizedQuery) return [...collection];
  return collection.filter((prompt) => {
    return (
      prompt.text.toLowerCase().includes(normalizedQuery) ||
      (prompt.tags || []).some((tag) => tag.toLowerCase().includes(normalizedQuery))
    );
  });
}

export function toSerializable (collection) {
  return collection.map((prompt) => ({
    id: prompt.id,
    hash: prompt.hash,
    text: prompt.text,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
    sourceUrl: prompt.sourceUrl,
    sourceTitle: prompt.sourceTitle,
    tags: Array.isArray(prompt.tags) ? [...prompt.tags] : []
  }));
}

export default {
  STORAGE_KEY,
  normalizeText,
  hashPrompt,
  createPromptEntry,
  upsertPrompt,
  mergeTags,
  filterPrompts,
  toSerializable
};
