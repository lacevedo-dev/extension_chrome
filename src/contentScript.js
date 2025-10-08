const OBSERVED_ELEMENTS = new WeakSet();

function buildPayload (element) {
  const text = element?.value ?? element?.innerText ?? '';
  const trimmed = text.trim();
  if (!trimmed) return null;
  return {
    text: trimmed,
    sourceUrl: window.location.href,
    sourceTitle: document.title
  };
}

async function sendPrompt (payload) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'PROMPT_CAPTURED', payload }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('Prompt Keeper: error enviando prompt', chrome.runtime.lastError);
        resolve(false);
        return;
      }
      resolve(response?.added || false);
    });
  });
}

function handleKeyDown (event) {
  if (!event.isTrusted) return;
  const target = event.target;
  const isPromptField = target && (target.matches('textarea, input[type="text"], input[type="search"], [contenteditable="true"]'));
  if (!isPromptField) return;

  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    const payload = buildPayload(target);
    if (payload) {
      sendPrompt(payload);
    }
  }
}

function observeEditable (node) {
  if (!(node instanceof HTMLElement)) return;
  if (OBSERVED_ELEMENTS.has(node)) return;
  if (node.matches('textarea, input[type="text"], input[type="search"], [contenteditable="true"]')) {
    node.addEventListener('blur', () => {
      const payload = buildPayload(node);
      if (payload) sendPrompt(payload);
    });
    OBSERVED_ELEMENTS.add(node);
  }
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        observeEditable(node);
        node.querySelectorAll('textarea, input[type="text"], input[type="search"], [contenteditable="true"]').forEach(observeEditable);
      }
    });
  });
});

window.addEventListener('keydown', handleKeyDown, true);

document.querySelectorAll('textarea, input[type="text"], input[type="search"], [contenteditable="true"]').forEach(observeEditable);

observer.observe(document.documentElement, { childList: true, subtree: true });
