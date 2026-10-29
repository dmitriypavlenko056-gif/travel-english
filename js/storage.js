// Прогресс хранится в телефоне (localStorage). Если хранилище недоступно, работаем в памяти.
const KEY = 'travel-english-progress-v1';
let memory = null;

function load() {
  if (memory) return memory;
  try {
    memory = JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    memory = {};
  }
  return memory;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // нет доступа к хранилищу — прогресс живёт до закрытия
  }
}

export const getEntry = (id) => load()[id] || null;

export function setEntry(id, entry) {
  load()[id] = entry;
  save();
}
