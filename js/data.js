export async function loadData() {
  const res = await fetch('data/words.json');
  if (!res.ok) throw new Error('Не удалось загрузить слова');
  const data = await res.json();
  const byId = new Map(data.words.map((w) => [w.id, w]));
  return {
    topics: data.topics,
    words: data.words,
    byId,
    wordsOf: (topicId) => (topicId === 'all' ? data.words : data.words.filter((w) => w.topic === topicId)),
  };
}
