// Service worker: сохраняет все файлы в телефоне, чтобы приложение работало без интернета.
// При изменении слов или кода поднимите номер версии — телефон скачает свежие файлы.
const VERSION = 'v1';
const CACHE = `travel-english-${VERSION}`;
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/config.js',
  'js/util.js',
  'js/storage.js',
  'js/srs.js',
  'js/check.js',
  'js/speech.js',
  'js/data.js',
  'js/screens/home.js',
  'js/screens/topic.js',
  'js/screens/cards.js',
  'js/screens/exam.js',
  'data/words.json',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Сначала кэш, при отсутствии — сеть
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request))
  );
});
