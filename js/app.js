import { loadData } from './data.js';
import { renderHome } from './screens/home.js';
import { renderTopic } from './screens/topic.js';
import { renderCards } from './screens/cards.js';
import { renderExam } from './screens/exam.js';

const app = document.getElementById('app');
let data = null;

function route() {
  if (!data) return;
  const [, page, id, extra] = location.hash.split('/');
  window.scrollTo(0, 0);
  if (page === 'topic') renderTopic(app, data, id);
  else if (page === 'learn') renderCards(app, data, id, extra === 'all');
  else if (page === 'exam') renderExam(app, data, id);
  else renderHome(app, data);
}

async function start() {
  try {
    data = await loadData();
  } catch {
    app.innerHTML = '<div class="card"><h2>Не получилось загрузить слова</h2><p class="muted">Откройте приложение с интернетом один раз — потом оно будет работать без сети.</p></div>';
    return;
  }
  window.addEventListener('hashchange', route);
  route();
}

start();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
