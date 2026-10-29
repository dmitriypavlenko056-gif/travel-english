// Озвучка встроенным синтезатором браузера. Вызывать только из нажатия кнопки.
export const NO_VOICE_HINT =
  'Не нашёл английский голос. Откройте «Настройки → Универсальный доступ → Устный контент → Голоса → Английский» и скачайте любой голос. Также проверьте, что выключен беззвучный режим.';

function englishVoice() {
  const voices = speechSynthesis.getVoices();
  const us = voices.find((v) => v.lang.replace('_', '-').toLowerCase() === 'en-us');
  return us || voices.find((v) => v.lang.toLowerCase().startsWith('en')) || null;
}

// Возвращает true, если озвучка запущена, и false, если голоса нет
export function speak(text) {
  if (!('speechSynthesis' in window)) return false;
  const voices = speechSynthesis.getVoices();
  const voice = englishVoice();
  if (voices.length > 0 && !voice) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  if (voice) u.voice = voice;
  u.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  return true;
}

// Голоса на iPhone подгружаются не сразу — просим список заранее
if ('speechSynthesis' in window) speechSynthesis.getVoices();
