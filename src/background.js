import {
  STORAGE_KEY,
  createPromptEntry,
  toSerializable,
  upsertPrompt
} from './lib/promptStore.js';

async function loadPrompts () {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
}

async function savePrompts (prompts) {
  await chrome.storage.local.set({ [STORAGE_KEY]: prompts });
}

async function handlePromptCaptured (payload, sender) {
  if (!payload || typeof payload.text !== 'string') return { added: false };
  const prompts = await loadPrompts();
  const entry = createPromptEntry(payload.text, {
    sourceUrl: payload.sourceUrl || sender?.url || null,
    sourceTitle: payload.sourceTitle || sender?.tab?.title || null,
    tags: payload.tags || []
  });
  const result = upsertPrompt(prompts, entry);
  await savePrompts(result.prompts);
  return { added: result.added, total: result.total };
}

async function handleGetPrompts () {
  const prompts = await loadPrompts();
  return { prompts: toSerializable(prompts) };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message || {};
  if (type === 'PROMPT_CAPTURED') {
    handlePromptCaptured(payload, sender)
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('Error guardando prompt', error);
        sendResponse({ added: false, error: error.message });
      });
    return true;
  }

  if (type === 'GET_PROMPTS') {
    handleGetPrompts()
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('Error leyendo prompts', error);
        sendResponse({ prompts: [], error: error.message });
      });
    return true;
  }

  return false;
});

chrome.runtime.onInstalled.addListener(async () => {
  const prompts = await loadPrompts();
  if (!Array.isArray(prompts)) {
    await savePrompts([]);
  }
});
