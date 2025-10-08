import { filterPrompts } from '../lib/promptStore.js';
import { promptsToCsv } from '../lib/csv.js';

const listElement = document.getElementById('prompt-list');
const template = document.getElementById('prompt-item-template');
const searchInput = document.getElementById('search');
const emptyState = document.getElementById('empty-state');
const exportButton = document.getElementById('export');

let prompts = [];

function formatDate (isoString) {
  if (!isoString) return 'Fecha desconocida';
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch (error) {
    console.warn('Prompt Keeper: fecha inválida', error);
    return isoString;
  }
}

function renderPrompts (items) {
  listElement.innerHTML = '';
  if (!items.length) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  items.forEach((prompt) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('.prompt-text').textContent = prompt.text;
    node.querySelector('.prompt-time').textContent = formatDate(prompt.updatedAt);
    const link = node.querySelector('.prompt-link');
    if (prompt.sourceUrl) {
      link.href = prompt.sourceUrl;
      link.textContent = new URL(prompt.sourceUrl).hostname;
    } else {
      link.remove();
    }
    const tagsContainer = node.querySelector('.prompt-tags');
    (prompt.tags || []).forEach((tag) => {
      const li = document.createElement('li');
      li.textContent = tag;
      tagsContainer.appendChild(li);
    });
    listElement.appendChild(node);
  });
}

function refreshList () {
  const filtered = filterPrompts(prompts, searchInput.value);
  renderPrompts(filtered);
}

function fetchPrompts () {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_PROMPTS' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response?.prompts || []);
    });
  });
}

function downloadCsv () {
  const csv = promptsToCsv(filterPrompts(prompts, searchInput.value));
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `prompts-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

searchInput.addEventListener('input', refreshList);
exportButton.addEventListener('click', downloadCsv);

document.addEventListener('DOMContentLoaded', () => {
  fetchPrompts()
    .then((items) => {
      prompts = items;
      refreshList();
    })
    .catch((error) => {
      console.error('Prompt Keeper: no se pudieron recuperar los prompts', error);
      emptyState.textContent = 'Error al cargar los prompts. Revisa la consola.';
      emptyState.hidden = false;
    });
});
