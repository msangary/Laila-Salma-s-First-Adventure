window.FirstAdventureTokyo = window.FirstAdventureTokyo || {};

(function (SC) {
  const GK_POOL = [
    { q: 'Which planet is known as the Red Planet?', opts: ['Mars', 'Venus', 'Jupiter', 'Saturn'], a: 0 },
    { q: 'What is the capital city of Japan?', opts: ['Osaka', 'Kyoto', 'Tokyo', 'Sapporo'], a: 2 },
    { q: 'How many legs does a butterfly have?', opts: ['4', '6', '8', '10'], a: 1 },
    { q: 'Which gas do plants absorb from the air to make food?', opts: ['Oxygen', 'Carbon Dioxide', 'Helium', 'Neon'], a: 1 },
    { q: 'What is the largest ocean on Earth?', opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], a: 3 },
    { q: 'Which season do sakura (cherry blossoms) bloom in Japan?', opts: ['Spring', 'Summer', 'Autumn', 'Winter'], a: 0 },
    { q: 'How many continents are there on Earth?', opts: ['5', '6', '7', '8'], a: 2 },
    { q: 'Which animal is the tallest land mammal?', opts: ['Elephant', 'Giraffe', 'Camel', 'Horse'], a: 1 },
    { q: 'What colors make green when mixed together?', opts: ['Red & Blue', 'Blue & Yellow', 'Red & Yellow', 'Blue & White'], a: 1 },
    { q: 'How many days are in a leap year?', opts: ['364', '365', '366', '367'], a: 2 },
    { q: 'Which organ pumps blood through your body?', opts: ['Lungs', 'Brain', 'Heart', 'Stomach'], a: 2 },
    { q: 'What is the freezing point of water in Celsius?', opts: ['0°C', '10°C', '32°C', '100°C'], a: 0 }
  ];

  function seededRand(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function generateQuiz(seed) {
    const rng = seededRand(seed);
    const pool = GK_POOL.slice();
    const questions = [];

    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(rng() * pool.length);
      const item = pool.splice(idx, 1)[0];
      questions.push({ cat: 'General Knowledge', q: item.q, opts: item.opts, a: item.a });
    }

    for (let i = 0; i < 2; i++) {
      const a = 4 + Math.floor(rng() * 18);
      const b = 3 + Math.floor(rng() * 14);
      const isAdd = rng() > 0.4;
      const ans = isAdd ? a + b : (a + b) - b;
      const qText = isAdd ? ('What is ' + a + ' + ' + b + '?') : ('What is ' + (a + b) + ' - ' + b + '?');
      const set = new Set([ans]);
      while (set.size < 4) {
        const delta = Math.floor(rng() * 9) - 4;
        if (ans + delta >= 0) set.add(ans + delta);
      }
      const opts = Array.from(set).sort(() => rng() - 0.5);
      questions.push({ cat: 'Math', q: qText, opts: opts.map(String), a: opts.indexOf(ans) });
    }
    return questions;
  }

  let activeQuiz = null;
  let timerInterval = null;
  let activeShopTab = 'laila';
  let activeRoomTab = 'wallpaper';

  function formatMs(ms) {
    const total = Math.ceil(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
  }

  function refreshSchoolLobby() {
    const cd = SC.getQuizCooldownMs();
    const box = document.getElementById('quiz-timer-box');
    const startBtn = document.getElementById('btn-start-quiz');
    if (cd <= 0) {
      box.innerHTML = '✅ <strong>New 2-Hour Quiz Ready!</strong> Earn up to <strong>+60 XP</strong> &amp; <strong>+75c</strong>.';
      startBtn.disabled = false;
    } else {
      box.innerHTML = '⏳ Next graded quiz refreshes in <strong>' + formatMs(cd) + '</strong>. You can still play Practice Mode!';
      startBtn.disabled = true;
    }
  }

  SC.openSchoolModal = function () {
    SC.runtime.modalOpen = true;
    document.getElementById('school-modal').classList.remove('hidden');
    document.getElementById('school-lobby').classList.remove('hidden');
    document.getElementById('school-question').classList.add('hidden');
    document.getElementById('school-report').classList.add('hidden');
    refreshSchoolLobby();
    clearInterval(timerInterval);
    timerInterval = setInterval(refreshSchoolLobby, 1000);
  };

  function renderQuestion() {
    const qObj = activeQuiz.questions[activeQuiz.index];
    document.getElementById('q-progress').textContent = 'Question ' + (activeQuiz.index + 1) + ' / ' + activeQuiz.questions.length;
    document.getElementById('q-category').textContent = qObj.cat;
    document.getElementById('q-text').textContent = qObj.q;

    const fb = document.getElementById('q-feedback');
    fb.classList.add('hidden');

    const grid = document.getElementById('q-options');
    grid.innerHTML = '';
    qObj.opts.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(idx, btn);
      grid.appendChild(btn);
    });
  }

  function handleAnswer(idx, btn) {
    if (activeQuiz.locked) return;
    activeQuiz.locked = true;
    const qObj = activeQuiz.questions[activeQuiz.index];
    const buttons = document.querySelectorAll('#q-options .option-btn');
    const fb = document.getElementById('q-feedback');
    fb.classList.remove('hidden');

    if (idx === qObj.a) {
      activeQuiz.score += 1;
      btn.classList.add('correct');
      fb.textContent = '🌟 Great job, Laila & Salma! That’s correct!';
      SC.playTone(660, 0.14);
    } else {
      btn.classList.add('wrong');
      if (buttons[qObj.a]) buttons[qObj.a].classList.add('correct');
      fb.textContent = '💡 Good try! The right answer is: ' + qObj.opts[qObj.a];
      SC.playTone(280, 0.16);
    }

    setTimeout(() => {
      activeQuiz.index += 1;
      activeQuiz.locked = false;
      if (activeQuiz.index < activeQuiz.questions.length) {
        renderQuestion();
      } else {
        finishQuiz();
      }
    }, 1050);
  }

  function finishQuiz() {
    document.getElementById('school-question').classList.add('hidden');
    document.getElementById('school-report').classList.remove('hidden');

    const s = activeQuiz.score;
    document.getElementById('report-summary').textContent =
      'Laila & Salma scored ' + s + ' out of 5' + (activeQuiz.practice ? ' (Practice Mode)' : '') + '!';

    const rew = document.getElementById('report-rewards');
    if (activeQuiz.practice) {
      rew.innerHTML = '📝 Practice complete! Come back when the 2-hour timer refreshes for graded XP &amp; Coins.';
    } else {
      const xpGain = 15 + s * 9;
      const coinGain = 20 + s * 11;
      SC.state.lastCompletedWindow = SC.getCurrentQuizWindow();
      SC.addCoins(coinGain);
      SC.addXP(xpGain);
      rew.innerHTML = '✨ Earned <strong>+' + xpGain + ' XP</strong> and <strong>+' + coinGain + ' Coins</strong>!';
    }
  }

  SC.openRamenModal = function () {
    SC.runtime.modalOpen = true;
    document.getElementById('ramen-msg').textContent = '';
    document.getElementById('ramen-modal').classList.remove('hidden');
  };

  function renderShopItems() {
    const grid = document.getElementById('shop-items-grid');
    const msgEl = document.getElementById('shop-msg');
    if (!grid) return;
    grid.innerHTML = '';

    document.getElementById('tab-laila').classList.toggle('active', activeShopTab === 'laila');
    document.getElementById('tab-salma').classList.toggle('active', activeShopTab === 'salma');

    const equippedId = activeShopTab === 'laila' ? SC.state.equippedLaila : SC.state.equippedSalma;
    const list = SC.OUTFITS.filter(o => o.who === activeShopTab);

    list.forEach(item => {
      const unlocked = SC.state.unlockedOutfits.includes(item.id);
      const isEquipped = equippedId === item.id;

      const row = document.createElement('div');
      row.className = 'shop-item' + (isEquipped ? ' equipped' : '');

      const info = document.createElement('div');
      info.innerHTML =
        '<strong><span class="swatch-dot" style="background:' + item.swatch + '"></span>' + item.name + '</strong>' +
        '<div class="ramen-desc">' + item.desc + '</div>';

      const btn = document.createElement('button');
      if (isEquipped) {
        btn.className = 'btn-secondary';
        btn.textContent = 'Equipped ✓';
        btn.disabled = true;
      } else if (unlocked) {
        btn.className = 'btn-primary';
        btn.textContent = 'Wear';
        btn.onclick = () => {
          if (activeShopTab === 'laila') SC.state.equippedLaila = item.id;
          else SC.state.equippedSalma = item.id;
          SC.saveState();
          SC.applyOutfit(activeShopTab, item.id);
          SC.playTone(587.33, 0.12);
          msgEl.textContent = '';
          renderShopItems();
          SC.showToast('✨ Equipped ' + item.name + '!');
        };
      } else {
        btn.className = 'btn-primary';
        btn.textContent = item.cost + 'c';
        btn.onclick = () => {
          if (SC.state.coins < item.cost) {
            msgEl.textContent = 'Not enough coins! Find hidden cats or take a quiz at school.';
            SC.playTone(220, 0.14);
            return;
          }
          SC.addCoins(-item.cost);
          SC.state.unlockedOutfits.push(item.id);
          if (activeShopTab === 'laila') SC.state.equippedLaila = item.id;
          else SC.state.equippedSalma = item.id;
          SC.saveState();
          SC.applyOutfit(activeShopTab, item.id);
          SC.playTone(659.25, 0.14);
          msgEl.textContent = '';
          renderShopItems();
          SC.showToast('🎀 Unlocked & wearing ' + item.name + '!');
        };
      }

      row.appendChild(info);
      row.appendChild(btn);
      grid.appendChild(row);
    });
  }

  SC.openShopModal = function () {
    SC.runtime.modalOpen = true;
    document.getElementById('shop-msg').textContent = '';
    renderShopItems();
    document.getElementById('shop-modal').classList.remove('hidden');
  };

  function renderGachaponShelf() {
    const shelf = document.getElementById('gachapon-shelf');
    if (!shelf) return;
    shelf.innerHTML = '';
    SC.GACHAPON_TOYS.forEach(toy => {
      const owned = SC.state.unlockedToys.includes(toy.id);
      const card = document.createElement('div');
      card.className = 'toy-slot ' + (owned ? 'owned' : 'locked');
      card.innerHTML =
        '<div class="toy-emoji">' + (owned ? toy.emoji : '❓') + '</div>' +
        '<div class="toy-name">' + (owned ? toy.name : 'Mystery Capsule') + '</div>';
      shelf.appendChild(card);
    });
  }

  SC.openGachaponModal = function () {
    SC.runtime.modalOpen = true;
    document.getElementById('gachapon-msg').textContent = '';
    renderGachaponShelf();
    document.getElementById('gachapon-modal').classList.remove('hidden');
  };

  SC.openDrinkVendingModal = function () {
    SC.runtime.modalOpen = true;
    document.getElementById('drink-msg').textContent = '';
    document.getElementById('drink-modal').classList.remove('hidden');
  };

  SC.openMochiModal = function () {
    SC.runtime.modalOpen = true;
    document.getElementById('mochi-msg').textContent = '';
    document.getElementById('mochi-modal').classList.remove('hidden');
  };

  function renderClubhousePreview() {
    const preview = document.getElementById('clubhouse-preview');
    const catsRow = document.getElementById('clubhouse-cats-shelf');
    const grid = document.getElementById('clubhouse-items-grid');
    const msgEl = document.getElementById('clubhouse-msg');
    if (!preview || !grid) return;

    const wp = SC.ROOM_WALLPAPERS.find(w => w.id === SC.state.roomWallpaper) || SC.ROOM_WALLPAPERS[0];
    const bb = SC.ROOM_BEANBAGS.find(b => b.id === SC.state.roomBeanbag) || SC.ROOM_BEANBAGS[0];
    const po = SC.ROOM_POSTERS.find(p => p.id === SC.state.roomPoster) || SC.ROOM_POSTERS[0];

    preview.style.background = wp.color;
    preview.style.borderColor = wp.accent;
    preview.innerHTML =
      '<div class="room-poster-banner">' + po.label + '</div>' +
      '<div class="room-stage-row">' +
        '<span class="room-pill">👧 Laila</span>' +
        '<span class="room-beanbag" style="background:' + bb.color + '">🛋️ ' + bb.name + '</span>' +
        '<span class="room-pill">🧒 Salma</span>' +
      '</div>';

    if (catsRow) {
      const catNames = {
        cat_mikan: '🐱 Mikan',
        cat_kuro: '🐱 Kuro',
        cat_yuki: '🐱 Yuki',
        cat_sakura: '🐱 Sakura',
        cat_tama: '🐱 Tama'
      };
      const found = SC.state.foundCats || [];
      catsRow.innerHTML = '<strong>Rescued Cats Shelf (' + found.length + '/5):</strong> ' +
        Object.keys(catNames).map(cid =>
          '<span class="cat-shelf-badge ' + (found.includes(cid) ? 'found' : '') + '">' +
          (found.includes(cid) ? catNames[cid] : '🐾 ???') + '</span>'
        ).join(' ');
    }

    document.getElementById('rtab-wallpaper').classList.toggle('active', activeRoomTab === 'wallpaper');
    document.getElementById('rtab-beanbag').classList.toggle('active', activeRoomTab === 'beanbag');
    document.getElementById('rtab-poster').classList.toggle('active', activeRoomTab === 'poster');

    const sourceList = activeRoomTab === 'wallpaper'
      ? SC.ROOM_WALLPAPERS
      : (activeRoomTab === 'beanbag' ? SC.ROOM_BEANBAGS : SC.ROOM_POSTERS);

    const activeId = activeRoomTab === 'wallpaper'
      ? SC.state.roomWallpaper
      : (activeRoomTab === 'beanbag' ? SC.state.roomBeanbag : SC.state.roomPoster);

    grid.innerHTML = '';
    sourceList.forEach(item => {
      const unlocked = SC.state.unlockedRoomItems.includes(item.id);
      const isActive = activeId === item.id;
      const row = document.createElement('div');
      row.className = 'shop-item' + (isActive ? ' equipped' : '');

      const dotHtml = item.color
        ? '<span class="swatch-dot" style="background:' + item.color + '"></span>'
        : '🖼️ ';
      const info = document.createElement('div');
      info.innerHTML = '<strong>' + dotHtml + item.name + '</strong>';

      const btn = document.createElement('button');
      if (isActive) {
        btn.className = 'btn-secondary';
        btn.textContent = 'In Room ✓';
        btn.disabled = true;
      } else if (unlocked) {
        btn.className = 'btn-primary';
        btn.textContent = 'Place';
        btn.onclick = () => {
          if (activeRoomTab === 'wallpaper') SC.state.roomWallpaper = item.id;
          else if (activeRoomTab === 'beanbag') SC.state.roomBeanbag = item.id;
          else SC.state.roomPoster = item.id;
          SC.saveState();
          msgEl.textContent = '';
          renderClubhousePreview();
          SC.showToast('🏡 Updated room with ' + item.name + '!');
        };
      } else {
        btn.className = 'btn-primary';
        btn.textContent = item.cost + 'c';
        btn.onclick = () => {
          if (SC.state.coins < item.cost) {
            msgEl.textContent = 'Need more coins! Try quizzes, hidden cats, or Fetch/Tag with Mochi.';
            SC.playTone(220, 0.14);
            return;
          }
          SC.addCoins(-item.cost);
          SC.state.unlockedRoomItems.push(item.id);
          if (activeRoomTab === 'wallpaper') SC.state.roomWallpaper = item.id;
          else if (activeRoomTab === 'beanbag') SC.state.roomBeanbag = item.id;
          else SC.state.roomPoster = item.id;
          SC.saveState();
          SC.playTone(659.25, 0.14);
          msgEl.textContent = '';
          renderClubhousePreview();
          SC.showToast('🏡 Added ' + item.name + " to Laila & Salma's Room!");
        };
      }

      row.appendChild(info);
      row.appendChild(btn);
      grid.appendChild(row);
    });
  }

  SC.openClubhouseModal = function () {
    SC.runtime.modalOpen = true;
    document.getElementById('clubhouse-msg').textContent = '';
    renderClubhousePreview();
    document.getElementById('clubhouse-modal').classList.remove('hidden');
  };

  SC.petHiddenCat = function (catId) {
    const cat = SC.world.hiddenCats.find(c => c.id === catId);
    if (!cat || cat.found) return;
    cat.found = true;
    if (cat.marker) cat.marker.visible = false;
    if (!SC.state.foundCats.includes(catId)) {
      SC.state.foundCats.push(catId);
    }
    SC.world.zones = SC.world.zones.filter(z => z.id !== 'cat:' + catId);
    SC.runtime.nearZone = null;

    const count = SC.state.foundCats.length;
    const isAll = count >= 5;
    const coinReward = isAll ? 85 : 35;
    const xpReward = isAll ? 50 : 20;

    SC.addCoins(coinReward);
    SC.addXP(xpReward);
    SC.saveState();
    SC.updateHUD();

    SC.playTone(587.33, 0.1);
    setTimeout(() => SC.playTone(880, 0.16), 110);

    if (isAll) {
      SC.showToast('🐾🎉 All 5 Neighborhood Cats Found! Bonus +' + coinReward + 'c & +' + xpReward + ' XP!');
    } else {
      SC.showToast('🐱 Found ' + cat.name + ' (' + count + '/5)! +' + coinReward + 'c & +' + xpReward + ' XP!');
    }
  };

  SC.closeAllModals = function () {
    SC.runtime.modalOpen = false;
    clearInterval(timerInterval);
    document.getElementById('school-modal').classList.add('hidden');
    document.getElementById('ramen-modal').classList.add('hidden');
    document.getElementById('shop-modal').classList.add('hidden');
    document.getElementById('gachapon-modal').classList.add('hidden');
    document.getElementById('drink-modal').classList.add('hidden');
    document.getElementById('mochi-modal').classList.add('hidden');
    document.getElementById('clubhouse-modal').classList.add('hidden');
  };

  const RAMEN_CATALOG = {
    shoyu: { name: 'Shoyu Ramen', short: 'Speed+', cost: 40, speedMult: 1.2, infiniteStamina: false, durationMs: 180000, bonusXp: 0 },
    miso: { name: 'Miso Ramen', short: 'Inf.Run', cost: 60, speedMult: 1.1, infiniteStamina: true, durationMs: 180000, bonusXp: 0 },
    tonkotsu: { name: 'Special Tonkotsu', short: 'Turbo', cost: 90, speedMult: 1.3, infiniteStamina: true, durationMs: 240000, bonusXp: 25 }
  };

  function startMochiMiniGame(mode) {
    SC.closeAllModals();
    const lp = SC.chars.laila.root.position;
    const ballPos = new THREE.Vector3(
      Math.max(-3.2, Math.min(3.2, lp.x * 0.5)),
      0.14,
      Math.max(-24, Math.min(18, lp.z - (mode === 'fetch' ? 8.5 : 5.5)))
    );
    SC.runtime.mochiGame = {
      mode,
      timeLeft: 30,
      score: 0,
      ballPos,
      state: 'to_target',
      spinTimer: 0
    };
    if (SC.world.mochiBall) {
      SC.world.mochiBall.visible = (mode === 'fetch');
      SC.world.mochiBall.position.copy(ballPos);
    }
    SC.playTone(587.33, 0.12);
    SC.showToast(mode === 'fetch'
      ? '🎾 30s Frisbee/Ball Fetch Started! Run near the ball or with Mochi!'
      : '🐕 30s Neighborhood Tag Started! Chase & tag Mochi down Main Street!');
  }

  SC.finishMochiMiniGame = function () {
    const mg = SC.runtime.mochiGame;
    if (!mg) return;
    const earnedCoins = 20 + mg.score * 15;
    const earnedXP = 15 + mg.score * 10;
    SC.addCoins(earnedCoins);
    SC.addXP(earnedXP);
    SC.runtime.mochiGame = null;
    if (SC.world.mochiBall) SC.world.mochiBall.visible = false;
    SC.playTone(783.99, 0.2);
    SC.showToast('🎉 Mochi ' + (mg.mode === 'fetch' ? 'Fetch' : 'Tag') + ' Done! Score ' + mg.score + ' • +' + earnedCoins + 'c & +' + earnedXP + ' XP!');
  };

  SC.initGameplayUI = function (scene) {
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', SC.closeAllModals);
    });

    document.getElementById('tab-laila').addEventListener('click', () => {
      activeShopTab = 'laila';
      renderShopItems();
    });
    document.getElementById('tab-salma').addEventListener('click', () => {
      activeShopTab = 'salma';
      renderShopItems();
    });

    document.getElementById('rtab-wallpaper').addEventListener('click', () => {
      activeRoomTab = 'wallpaper';
      renderClubhousePreview();
    });
    document.getElementById('rtab-beanbag').addEventListener('click', () => {
      activeRoomTab = 'beanbag';
      renderClubhousePreview();
    });
    document.getElementById('rtab-poster').addEventListener('click', () => {
      activeRoomTab = 'poster';
      renderClubhousePreview();
    });

    // Gachapon spin
    document.getElementById('btn-spin-gachapon').addEventListener('click', () => {
      const msgEl = document.getElementById('gachapon-msg');
      const cost = 15;
      if (SC.state.coins < cost) {
        msgEl.textContent = 'Need 15 coins! Earn more from quizzes, hidden cats, or Mochi.';
        SC.playTone(220, 0.14);
        return;
      }
      SC.addCoins(-cost);
      const idx = Math.floor(Math.random() * SC.GACHAPON_TOYS.length);
      const toy = SC.GACHAPON_TOYS[idx];
      if (!SC.state.unlockedToys.includes(toy.id)) {
        SC.state.unlockedToys.push(toy.id);
        SC.addXP(15);
        msgEl.style.color = '#1b7a43';
        msgEl.textContent = '🎉 New Capsule Toy: ' + toy.emoji + ' ' + toy.name + ' added to your Toy Shelf!';
        SC.showToast('🎁 New Toy: ' + toy.emoji + ' ' + toy.name + '!');
      } else {
        SC.addCoins(5);
        msgEl.style.color = '#9c6514';
        msgEl.textContent = '✨ Got ' + toy.emoji + ' ' + toy.name + ' again (+5c refund)!';
      }
      SC.saveState();
      SC.updateHUD();
      renderGachaponShelf();
      SC.playTone(659.25, 0.14);
    });

    // Japanese drink & snack vending machine
    document.querySelectorAll('.buy-drink').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-drink');
        const msgEl = document.getElementById('drink-msg');
        const cost = 20;
        if (SC.state.coins < cost) {
          msgEl.textContent = 'Not enough coins (20c)!';
          SC.playTone(220, 0.14);
          return;
        }
        SC.addCoins(-cost);
        SC.runtime.stamina = 100;
        if (type === 'melon_soda') {
          SC.runtime.superJumpUntil = Date.now() + 45000;
          SC.closeAllModals();
          SC.playTone(784, 0.16);
          SC.showToast('🍈 Melon Soda Fizzy! Super-Jump active for 45s!');
        } else if (type === 'strawberry_milk') {
          SC.runtime.sparkleUntil = Date.now() + 45000;
          SC.closeAllModals();
          SC.playTone(698.46, 0.16);
          SC.showToast('🍓 Strawberry Milk Sweet! Sparkle Trail active for 45s!');
        } else {
          SC.runtime.buff = {
            name: 'Warm Taiyaki',
            short: 'Taiyaki+',
            speedMult: 1.25,
            infiniteStamina: true,
            expiresAt: Date.now() + 60000
          };
          SC.closeAllModals();
          SC.playTone(659.25, 0.16);
          SC.showToast('🐟 Warm Taiyaki! Speed + Infinite Stamina boost for 60s!');
        }
        SC.updateHUD();
      });
    });

    // Mochi play / fetch / tag buttons
    document.getElementById('btn-pet-mochi').addEventListener('click', () => {
      SC.runtime.mochiHeartTimer = 3.2;
      if (SC.chars.mochi) {
        SC.chars.mochi.rotation.y += Math.PI * 2;
      }
      SC.addXP(10);
      SC.closeAllModals();
      SC.playTone(783.99, 0.14);
      SC.showToast('💖 Laila & Salma pet Mochi! Happy spin & +10 XP!');
    });
    document.getElementById('btn-start-fetch').addEventListener('click', () => startMochiMiniGame('fetch'));
    document.getElementById('btn-start-tag').addEventListener('click', () => startMochiMiniGame('tag'));

    document.getElementById('btn-start-quiz').addEventListener('click', () => {
      activeQuiz = {
        questions: generateQuiz(SC.getCurrentQuizWindow() * 97 + 13),
        index: 0,
        score: 0,
        practice: false,
        locked: false
      };
      document.getElementById('school-lobby').classList.add('hidden');
      document.getElementById('school-question').classList.remove('hidden');
      renderQuestion();
    });

    document.getElementById('btn-practice-quiz').addEventListener('click', () => {
      activeQuiz = {
        questions: generateQuiz(Math.floor(Math.random() * 99999)),
        index: 0,
        score: 0,
        practice: true,
        locked: false
      };
      document.getElementById('school-lobby').classList.add('hidden');
      document.getElementById('school-question').classList.remove('hidden');
      renderQuestion();
    });

    document.getElementById('btn-demo-skip').addEventListener('click', () => {
      SC.state.demoOffsetWindows = (SC.state.demoOffsetWindows || 0) + 1;
      SC.saveState();
      refreshSchoolLobby();
      SC.showToast('⏱️ Demo Skip: New school quiz unlocked!');
    });

    document.querySelectorAll('.buy-ramen').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-ramen');
        const item = RAMEN_CATALOG[key];
        if (!item) return;
        if (SC.state.coins < item.cost) {
          document.getElementById('ramen-msg').textContent = 'Not enough coins! Take a quiz at Sakura Elementary to earn more.';
          SC.playTone(220, 0.14);
          return;
        }
        SC.addCoins(-item.cost);
        SC.runtime.stamina = 100;
        SC.runtime.buff = {
          name: item.name,
          short: item.short,
          speedMult: item.speedMult,
          infiniteStamina: item.infiniteStamina,
          expiresAt: Date.now() + item.durationMs
        };
        if (item.bonusXp > 0) SC.addXP(item.bonusXp);
        SC.closeAllModals();
        SC.startEatingAnimation(scene, key, item.name);
      });
    });

    document.getElementById('btn-skip-eat').addEventListener('click', () => {
      SC.finishEatingAnimation(scene);
    });
  };

  SC.startEatingAnimation = function (scene, ramenKey, ramenName) {
    if (SC.runtime.eating) SC.finishEatingAnimation(scene);
    const bowlObj = SC.spawnRamenBowl(scene, ramenKey);
    SC.runtime.eating = {
      timer: 0,
      duration: 5.2,
      bowlObj,
      savedPos: SC.chars.laila.root.position.clone()
    };

    const laila = SC.chars.laila;
    laila.root.position.set(SC.world.ramenStoolPos.x, 0.14, SC.world.ramenStoolPos.z);
    laila.root.rotation.y = Math.PI / 2;
    laila.leftLeg.rotation.x = -1.25;
    laila.rightLeg.rotation.x = -1.25;

    const salma = SC.chars.salma;
    if (salma) {
      salma.root.position.set(SC.world.salmaStoolPos.x, 0.16, SC.world.salmaStoolPos.z);
      salma.root.rotation.y = Math.PI / 2;
      salma.leftLeg.rotation.x = -1.25;
      salma.rightLeg.rotation.x = -1.25;
    }

    document.getElementById('eating-status').textContent = '🍜 Laila & Salma are enjoying ' + ramenName + '... Oishii! 😋';
    document.getElementById('eating-banner').classList.remove('hidden');
    SC.playTone(587.33, 0.14);
  };

  SC.finishEatingAnimation = function (scene) {
    if (!SC.runtime.eating) return;
    scene.remove(SC.runtime.eating.bowlObj.group);
    const laila = SC.chars.laila;
    laila.root.position.set(SC.world.ramenStoolPos.x - 1.1, 0, SC.world.ramenStoolPos.z);
    laila.leftLeg.rotation.x = 0;
    laila.rightLeg.rotation.x = 0;
    laila.rightArm.rotation.x = 0;
    laila.headGroup.rotation.x = 0;

    const salma = SC.chars.salma;
    if (salma) {
      salma.root.position.set(SC.world.salmaStoolPos.x - 1.1, 0, SC.world.salmaStoolPos.z);
      salma.leftLeg.rotation.x = 0;
      salma.rightLeg.rotation.x = 0;
      salma.rightArm.rotation.x = 0;
      salma.headGroup.rotation.x = 0;
    }

    SC.runtime.eating = null;
    document.getElementById('eating-banner').classList.add('hidden');
    SC.showToast('😋 Gochisousama! Laila & Salma’s ramen buff is active!');
    SC.updateHUD();
  };
})(window.FirstAdventureTokyo);
