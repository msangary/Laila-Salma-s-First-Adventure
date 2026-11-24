window.FirstAdventureTokyo = window.FirstAdventureTokyo || {};

(function (SC) {
  const SAVE_KEY = 'first_adventure_tokyo_sisters_v3';
  const QUIZ_WINDOW_MS = 2 * 60 * 60 * 1000;

  SC.GACHAPON_TOYS = [
    { id: 'mini_daruma', name: 'Lucky Mini Daruma', emoji: '🎎', desc: 'Red wish charm that cheers on Laila & Salma' },
    { id: 'origami_crane', name: 'Folded Origami Crane', emoji: '🕊️', desc: 'Paper peace crane from Tokyo craft stalls' },
    { id: 'pixel_cat', name: 'Pixel Kitteh Badge', emoji: '👾', desc: 'Retro arcade kitty pin for the Toy Shelf' },
    { id: 'ramen_charm', name: 'Mini Ramen Keychain', emoji: '🍥', desc: 'Tiny narutomaki & noodle charm' },
    { id: 'sakura_fan', name: 'Blossom Folding Fan', emoji: '🪭', desc: 'Springtime sakura fan with gold trim' },
    { id: 'shiba_plush', name: 'Pocket Shiba Plush', emoji: '🐕', desc: "Mini Mochi plushie for Salma's shelf" }
  ];

  SC.ROOM_WALLPAPERS = [
    { id: 'sakura_cream', name: 'Sakura Cream', cost: 0, color: '#fdf3e3', accent: '#f4a4b8' },
    { id: 'sky_pastel', name: 'Sky Pastel', cost: 60, color: '#e3f2fd', accent: '#64b5f6' },
    { id: 'matcha_mint', name: 'Matcha Garden', cost: 85, color: '#e8f5e9', accent: '#66bb6a' },
    { id: 'starry_lilac', name: 'Starry Lilac', cost: 110, color: '#f3e5f5', accent: '#ab47bc' }
  ];

  SC.ROOM_BEANBAGS = [
    { id: 'strawberry_puff', name: 'Strawberry Beanbag', cost: 0, color: '#ff8fab' },
    { id: 'lemon_cloud', name: 'Lemon Cloud Puff', cost: 55, color: '#ffd166' },
    { id: 'berry_pop', name: 'Berry Pop Cushion', cost: 80, color: '#9d4edd' }
  ];

  SC.ROOM_POSTERS = [
    { id: 'tokyo_sketches', name: 'Tokyo & Cat Sketches', cost: 0, label: 'TOKYO 🗼 & 🐱' },
    { id: 'space_cats', name: 'Astronaut Cats Poster', cost: 65, label: 'ASTRO CATS 🚀🐾' },
    { id: 'ramen_dreams', name: 'Ramen & Stars Art', cost: 90, label: 'RAMEN & STARS 🍜✨' }
  ];

  const defaultState = {
    level: 1,
    xp: 0,
    coins: 180,
    lastCompletedWindow: -1,
    demoOffsetWindows: 0,
    timeMode: 0,
    grainEnabled: true,
    soundEnabled: false,
    foundCats: [],
    unlockedOutfits: ['laila_school', 'salma_kinder'],
    equippedLaila: 'laila_school',
    equippedSalma: 'salma_kinder',
    unlockedToys: [],
    roomWallpaper: 'sakura_cream',
    unlockedRoomItems: ['sakura_cream', 'strawberry_puff', 'tokyo_sketches'],
    roomBeanbag: 'strawberry_puff',
    roomPoster: 'tokyo_sketches'
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return Object.assign({}, defaultState);
      const parsed = JSON.parse(raw);
      return Object.assign({}, defaultState, parsed, {
        foundCats: Array.isArray(parsed.foundCats) ? parsed.foundCats : [],
        unlockedOutfits: Array.isArray(parsed.unlockedOutfits) ? parsed.unlockedOutfits : ['laila_school', 'salma_kinder'],
        unlockedToys: Array.isArray(parsed.unlockedToys) ? parsed.unlockedToys : [],
        unlockedRoomItems: Array.isArray(parsed.unlockedRoomItems) ? parsed.unlockedRoomItems : ['sakura_cream', 'strawberry_puff', 'tokyo_sketches']
      });
    } catch (e) {
      return Object.assign({}, defaultState);
    }
  }

  SC.state = loadState();
  SC.runtime = {
    stamina: 100,
    running: false,
    runToggle: false,
    camMode: 0,
    poseTimer: 0,
    highFiveTimer: 0,
    modalOpen: false,
    eating: null,
    buff: null,
    superJumpUntil: 0,
    sparkleUntil: 0,
    nearZone: null,
    mochiGame: null, // { mode: 'fetch'|'tag', timeLeft, score, ballPos, ballVel, state, targetPos, spinTimer }
    mochiHeartTimer: 0,
    parkActivity: null // { type: 'slide'|'swing'|'hopscotch', timer }
  };

  SC.saveState = function () {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(SC.state));
    } catch (e) {}
  };

  SC.xpForLevel = function (lv) {
    return 100 + (lv - 1) * 50;
  };

  SC.addXP = function (amount) {
    SC.state.xp += amount;
    let leveledUp = false;
    while (SC.state.xp >= SC.xpForLevel(SC.state.level)) {
      SC.state.xp -= SC.xpForLevel(SC.state.level);
      SC.state.level += 1;
      leveledUp = true;
    }
    SC.saveState();
    SC.updateHUD();
    if (leveledUp) {
      SC.playTone(523.25, 0.14);
      setTimeout(() => SC.playTone(659.25, 0.14), 130);
      setTimeout(() => SC.playTone(783.99, 0.25), 260);
      SC.showToast('🎉 Level Up! Laila & Salma reached Level ' + SC.state.level + '!');
    }
    return leveledUp;
  };

  SC.addCoins = function (amount) {
    SC.state.coins = Math.max(0, SC.state.coins + amount);
    SC.saveState();
    SC.updateHUD();
  };

  SC.getCurrentQuizWindow = function () {
    return Math.floor(Date.now() / QUIZ_WINDOW_MS) + (SC.state.demoOffsetWindows || 0);
  };

  SC.getQuizCooldownMs = function () {
    const cur = SC.getCurrentQuizWindow();
    if (SC.state.lastCompletedWindow < cur) return 0;
    const realWindow = Math.floor(Date.now() / QUIZ_WINDOW_MS);
    const nextRealBoundary = (realWindow + 1) * QUIZ_WINDOW_MS;
    return Math.max(0, nextRealBoundary - Date.now());
  };

  SC.updateHUD = function () {
    const lvEl = document.getElementById('hud-level');
    const xpBar = document.getElementById('xp-bar');
    const xpText = document.getElementById('xp-text');
    const stamBar = document.getElementById('stamina-bar');
    const stamText = document.getElementById('stamina-text');
    const coinEl = document.getElementById('coin-count');
    const catEl = document.getElementById('cat-count');
    const toyEl = document.getElementById('toy-count');
    const buffPill = document.getElementById('buff-pill');

    const need = SC.xpForLevel(SC.state.level);
    if (lvEl) lvEl.textContent = 'Lv. ' + SC.state.level + ' • 3rd Grader & 5yo';
    if (xpBar) xpBar.style.width = Math.min(100, Math.round((SC.state.xp / need) * 100)) + '%';
    if (xpText) xpText.textContent = SC.state.xp + '/' + need;
    if (stamBar) stamBar.style.width = Math.round(SC.runtime.stamina) + '%';
    if (stamText) stamText.textContent = Math.round(SC.runtime.stamina) + '%';
    if (coinEl) coinEl.textContent = SC.state.coins;
    if (catEl) catEl.textContent = (SC.state.foundCats ? SC.state.foundCats.length : 0) + '/5';
    if (toyEl) toyEl.textContent = (SC.state.unlockedToys ? SC.state.unlockedToys.length : 0) + '/' + SC.GACHAPON_TOYS.length;

    if (buffPill) {
      const tags = [];
      if (SC.runtime.buff && Date.now() < SC.runtime.buff.expiresAt) {
        tags.push(SC.runtime.buff.short + ' ' + Math.ceil((SC.runtime.buff.expiresAt - Date.now()) / 1000) + 's');
      } else {
        SC.runtime.buff = null;
      }
      if (SC.runtime.superJumpUntil && Date.now() < SC.runtime.superJumpUntil) {
        tags.push('🦘Jump ' + Math.ceil((SC.runtime.superJumpUntil - Date.now()) / 1000) + 's');
      }
      if (SC.runtime.sparkleUntil && Date.now() < SC.runtime.sparkleUntil) {
        tags.push('✨Sparkle ' + Math.ceil((SC.runtime.sparkleUntil - Date.now()) / 1000) + 's');
      }
      if (tags.length > 0) {
        buffPill.textContent = '🧃 ' + tags.join(' • ');
        buffPill.classList.remove('hidden');
      } else {
        buffPill.classList.add('hidden');
      }
    }
  };

  let toastTimer = null;
  SC.showToast = function (msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
  };

  let audioCtx = null;
  SC.playTone = function (freq, duration, type) {
    if (!SC.state.soundEnabled) return;
    try {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtx = new Ctx();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration || 0.15));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + (duration || 0.15));
    } catch (e) {}
  };
})(window.FirstAdventureTokyo);
