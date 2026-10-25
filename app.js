'use strict';
const config = window.BIRTHDAY_CONFIG;
const $ = (selector) => document.querySelector(selector);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.recipient').forEach(el => el.textContent = config.name);
$('.signature').textContent = config.signature;
document.title = `${config.name}，请签收你的生日快乐 ♡`;
$('.brand>span:last-child').firstChild.textContent = `${config.name}的快乐星球`;
config.letter.forEach(text => { const p = document.createElement('p'); p.textContent = text; $('#letter-paragraphs').append(p); });
config.memories.forEach((memory, index) => {
  if (memory.video) {
    const card = document.createElement('article');
    card.className = 'memory-card memory-video-card';
    card.innerHTML = `<div class="memory-face memory-front"><div class="memory-picture"><video controls playsinline preload="metadata" aria-label="最难忘的时刻"></video></div><h3></h3><small>OUR LITTLE MOVIE / 03</small><p class="video-caption"></p></div>`;
    card.querySelector('h3').textContent = memory.title;
    card.querySelector('.video-caption').textContent = memory.caption;
    const video = card.querySelector('video');
    video.src = memory.video;
    video.addEventListener('play', () => stopMusic());
    video.append(document.createTextNode('你的浏览器暂时无法播放这段视频。'));
    const fallback = document.createElement('a');
    fallback.className = 'video-fallback'; fallback.href = memory.video;
    fallback.textContent = '单独打开视频 ↗';
    card.querySelector('.memory-front').append(fallback);
    $('#memory-grid').append(card);
    return;
  }
  const card = document.createElement('button');
  card.type = 'button'; card.className = 'memory-card';
  card.setAttribute('aria-pressed', 'false');
  card.setAttribute('aria-label', `${memory.title}，点击翻转`);
  card.innerHTML = `<span class="memory-inner"><span class="memory-face memory-front"><span class="memory-picture"></span><strong></strong><small></small></span><span class="memory-face memory-back"><span aria-hidden="true">♡</span><p></p><small>再点一下，翻回正面</small></span></span>`;
  card.querySelector('strong').textContent = memory.title;
  card.querySelector('.memory-back p').textContent = memory.caption;
  card.querySelector('.memory-front small').textContent = `OUR LITTLE MOMENT / 0${index + 1} · 点击翻面`;
  const img = document.createElement('img');
  img.src = memory.image; img.alt = index === 0 ? '我们戴着毛绒发箍的镜子合照' : '我们靠在一起的眼睛特写合照';
  img.loading = 'lazy'; img.decoding = 'async';
  card.querySelector('.memory-picture').append(img);
  card.addEventListener('click', () => card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true')));
  $('#memory-grid').append(card);
});
function updateCountdown() {
  const remaining = Math.max(0, new Date(config.birthday).getTime() - Date.now());
  const values = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
  ['days','hours','minutes','seconds'].forEach((id, i) => $('#' + id).textContent = String(values[i]).padStart(2, '0'));
  if (!remaining) {
    $('#countdown-title').textContent = `${config.name}，生日快乐！`;
    $('#countdown-caption').textContent = '惊喜已送达，所有快乐都可以拆开啦。';
  }
}
updateCountdown(); setInterval(updateCountdown, 1000);

const giftDialog = $('#gift-dialog');
$('#unwrap').addEventListener('click', () => { giftDialog.showModal(); confetti(35); });
$('#close-dialog').addEventListener('click', () => giftDialog.close());
giftDialog.addEventListener('click', event => { if (event.target === giftDialog) { const r = giftDialog.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) giftDialog.close(); } });
$('#start-journey').addEventListener('click', () => { giftDialog.close(); $('#gifts').scrollIntoView({behavior:reducedMotion ? 'auto':'smooth'}); });
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000); }
function confetti(count = 70) {
  if (reducedMotion) return;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span'); piece.className = 'confetti-piece'; piece.textContent = ['♥', '✦', '●', '▪'][i % 4];
    piece.style.left = `${Math.random() * 100}%`; piece.style.color = ['#c35250','#d9b263','#91a88c','#edaaa7'][i % 4];
    piece.style.setProperty('--duration', `${2.5 + Math.random() * 2}s`); piece.style.setProperty('--delay', `${Math.random() * .6}s`); piece.style.setProperty('--drift', `${Math.random() * 240 - 120}px`);
    $('#confetti').append(piece); setTimeout(() => piece.remove(), 5500);
  }
}
const questions = [
  { title: '今天，谁是全宇宙最可爱的人？', options: [config.name, '出题的这只小兔', '桌上的草莓蛋糕'], correct: 0, hint: '小兔和蛋糕都说：今天风头归你。再试一次～' },
  { title: '寿星今天可以领取什么？', options: ['一个超级大拥抱', '全都要，快乐不设限', '一整天的夸夸'], correct: 1, hint: '已经很接近啦，不过寿星可以更贪心一点！' },
  { title: '下一站，我们一起去……', options: ['许一个甜甜的生日愿望', '突然开始加班', '跳过生日，直接明天'], correct: 0, hint: '今天的待办只有开心，小兔不准你加班。' }
];
let questionIndex = 0, quizPending = false;
function renderQuestion() {
  quizPending = false;
  $('#question-number').textContent = `心动问答 / 0${questionIndex + 1}`;
  $('#quiz-progress').textContent = questions.map((_, i) => i <= questionIndex ? '●':'○').join(' ');
  $('#quiz-feedback').textContent = '';
  $('#quiz-content').replaceChildren();
  const question = questions[questionIndex];
  const title = document.createElement('h3'); title.textContent = question.title; $('#quiz-content').append(title);
  const options = document.createElement('div'); options.className = 'quiz-options';
  question.options.forEach((text, i) => {
    const button = document.createElement('button'); button.className = 'quiz-option';
    const label = document.createElement('span'); label.textContent = String.fromCharCode(65 + i); button.append(label, document.createTextNode(text));
    button.addEventListener('click', () => {
      if (quizPending) return;
      if (i !== question.correct) { $('#quiz-feedback').textContent = question.hint; return; }
      quizPending = true; button.classList.add('correct'); $('#quiz-feedback').textContent = '答对啦！你的偏爱正在到账 ♡';
      options.querySelectorAll('button').forEach(el => el.disabled = true);
      setTimeout(() => { questionIndex++; if (questionIndex < questions.length) renderQuestion(); else renderReward(); const heading = $('#quiz-content h3'); heading.tabIndex = -1; heading.focus({preventScroll:true}); }, 750);
    }); options.append(button);
  }); $('#quiz-content').append(options);
}
function renderReward() {
  $('#question-number').textContent = '偏爱已到账 / 03'; $('#quiz-progress').textContent = '♥ ♥ ♥'; $('#quiz-feedback').textContent = '';
  $('#quiz-content').innerHTML = '<div class="quiz-result"><h3>恭喜，领取一份无限量偏爱。</h3><div class="coupon">本券专属持有人：<span id="coupon-name"></span><br><strong>生日快乐加倍券 ♡</strong><br>今天请理直气壮地被宠爱。</div><a class="button primary" href="#cake">带着快乐去许愿 →</a><button class="text-button" id="quiz-restart">再玩一次</button></div>';
  $('#coupon-name').textContent = config.name;
  $('#quiz-restart').addEventListener('click', () => { questionIndex = 0; renderQuestion(); }); confetti(45);
}
renderQuestion();
$('#blow').addEventListener('click', () => {
  $('.big-cake').classList.add('extinguished'); $('#blow').disabled = true; $('#blow').textContent = '愿望已交给星星保管 ♡';
  $('#wish-status').textContent = `生日快乐，${config.name}。愿你新的一岁，万事可爱。`;
  $('#relight').hidden = false; confetti(100);
  toast($('#wish').value.trim() ? '愿望收到啦，愿它在新的一岁慢慢实现 ♡' : '没有说出口的愿望，也要悄悄实现 ♡');
});
$('#relight').addEventListener('click', () => {
  $('.big-cake').classList.remove('extinguished'); $('#blow').disabled = false; $('#blow').innerHTML = '许好啦，吹蜡烛 <span>✧</span>';
  $('#wish-status').textContent = ''; $('#relight').hidden = true; $('#wish').focus({preventScroll:true});
});
$('#open-letter').addEventListener('click', () => {
  const open = $('#open-letter').getAttribute('aria-expanded') === 'true';
  $('#open-letter').setAttribute('aria-expanded', String(!open)); $('#letter-content').hidden = open;
  $('.envelope-instruction').textContent = open ? '轻轻点开，有人在认真想你。' : '♡ 已展开这封信 · 点这里收好';
  if (!open) { $('#letter-content').scrollIntoView({behavior:reducedMotion ? 'auto':'smooth',block:'start'}); }
});
let audioContext, musicInterval, musicOn = false, noteIndex = 0;
const melody = [523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,659.25,783.99,1046.5,783.99,587.33,698.46,783.99,0];
function playNote() {
  if (!audioContext || !musicOn) return;
  const frequency = melody[noteIndex++ % melody.length]; if (!frequency) return;
  const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
  oscillator.type = 'sine'; oscillator.frequency.value = frequency;
  const now = audioContext.currentTime;
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.055, now + .025); gain.gain.exponentialRampToValueAtTime(.0001, now + .9);
  oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(now); oscillator.stop(now + 1);
}
function stopMusic() { musicOn = false; clearInterval(musicInterval); if(audioContext) audioContext.suspend(); $('#music').setAttribute('aria-pressed','false'); $('#music-label').textContent = '开点音乐'; }
$('#music').addEventListener('click', async () => {
  if (musicOn) { stopMusic(); return; }
  document.querySelectorAll('.memory-picture video').forEach(video => video.pause());
  try { const AudioEngine = window.AudioContext || window.webkitAudioContext; if(!AudioEngine) throw new Error('Audio unavailable'); audioContext ||= new AudioEngine(); await audioContext.resume(); musicOn = true; playNote(); musicInterval = setInterval(playNote, 410); $('#music').setAttribute('aria-pressed','true'); $('#music-label').textContent = '音乐开着'; }
  catch { toast('这台设备暂时不能播放音乐，惊喜照常继续 ♡'); }
});
document.addEventListener('visibilitychange', () => { if(document.hidden && musicOn) stopMusic(); });
