// Проверка ответа на экзамене.

export function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // знаки препинания -> пробел
    .replace(/\s+/g, ' ')
    .trim();
}

const sortedWords = (s) => normalize(s).split(' ').sort().join(' ');

export function isCorrect(answer, word) {
  const a = normalize(answer);
  if (!a) return false;
  if (word.ru.some((v) => normalize(v) === a)) return true;
  // фразы: порядок слов не важен
  if (word.type === 'phrase') {
    const b = sortedWords(answer);
    return word.ru.some((v) => sortedWords(v) === b);
  }
  return false;
}
