import { STEPS_DAYS, LEARNED_AFTER } from './config.js';
import { getEntry, setEntry } from './storage.js';

const DAY = 24 * 60 * 60 * 1000;

// Запись слова: { n: сколько раз подряд вспомнил, due: когда показать снова (мс) }

export function statusOf(id) {
  const e = getEntry(id);
  if (!e) return 'new';
  return e.n >= LEARNED_AFTER ? 'learned' : 'progress';
}

export function isDue(id, now = Date.now()) {
  const e = getEntry(id);
  return !e || e.due <= now;
}

// «Помню»: переходим на следующую ступень
export function remember(id, now = Date.now()) {
  const n = (getEntry(id)?.n || 0) + 1;
  const days = STEPS_DAYS[Math.min(n, STEPS_DAYS.length) - 1];
  setEntry(id, { n, due: now + days * DAY });
}

// «Не помню» или ошибка на экзамене: возвращаем на первую ступень
export function forget(id, now = Date.now()) {
  setEntry(id, { n: 0, due: now });
}
