(function (SC) {
  let scene, camera, renderer, dirLight, hemiLight;
  const clock = new THREE.Clock();
  const keys = {};
  const joy = { x: 0, y: 0, active: false };

  let camYaw = Math.PI;
  let camPitch = 0.28;
  let dragging = false;
  let lastPointer = { x: 0, y: 0 };
  let velY = 0;
  let grounded = true;
  let salmaVelY = 0;
  let salmaGrounded = true;

  function showError(msg) {
    const ov = document.getElementById('error-overlay');
    const el = document.getElementById('error-message');
    if (el) el.textContent = msg;
    if (ov) ov.classList.remove('hidden');
  }

  function applyTimeOfDay() {
    const mode = SC.state.timeMode;
    const btn = document.getElementById('btn-time');
    if (mode === 1) {
      scene.fog.color.setHex(0xf2a772);
      dirLight.color.setHex(0xffa45b);
      dirLight.intensity = 1.05;
      hemiLight.color.setHex(0xffc99e);
      hemiLight.groundColor.setHex(0x6e4b3a);
      if (btn) btn.textContent = '🌇';
    } else if (mode === 2) {
      scene.fog.color.setHex(0x28385e);
      dirLight.color.setHex(0x88a8e6);
      dirLight.intensity = 0.65;
      hemiLight.color.setHex(0x50689c);
      hemiLight.groundColor.setHex(0x1f2536);
      if (btn) btn.textContent = '🌙';
    } else {
      scene.fog.color.setHex(0xcbe6f7);
      dirLight.color.setHex(0xfff1d0);
      dirLight.intensity = 1.15;
      hemiLight.color.setHex(0xbbe2ff);
      hemiLight.groundColor.setHex(0x7c8c64);
      if (btn) btn.textContent = '🌤️';
    }
    if (SC.world.skyMesh) {
      SC.world.skyMesh.material.map = SC.createSkyTexture(mode);
      SC.world.skyMesh.material.needsUpdate = true;
    }
  }

  function triggerJump() {
    if (grounded && !SC.runtime.eating && !SC.runtime.modalOpen) {
      const superJump = SC.runtime.superJumpUntil && Date.now() < SC.runtime.superJumpUntil;
      velY = superJump ? 10.2 : 6.2;
      grounded = false;
      SC.playTone(440, 0.09);
      if (salmaGrounded) {
        setTimeout(() => {
          if (salmaGrounded && !SC.runtime.eating) {
            salmaVelY = 6.0;
            salmaGrounded = false;
          }
        }, 120);
      }
    }
  }

  function triggerSisterPose() {
    if (SC.runtime.eating || SC.runtime.modalOpen) return;
    SC.runtime.poseTimer = 2.6;
    const nearSalma = SC.chars.salma &&
      SC.chars.laila.root.position.distanceTo(SC.chars.salma.root.position) < 3.6;
    if (nearSalma) {
      SC.runtime.highFiveTimer = 1.6;
      SC.runtime.buff = {
        name: 'Sister High-Five Boost',
        short: 'High-5⚡',
        speedMult: 1.25,
        infiniteStamina: true,
        expiresAt: Date.now() + 15000
      };
      SC.playTone(659.25, 0.12);
      setTimeout(() => SC.playTone(880, 0.18), 110);
      SC.showToast('🙌 Sister High-Five & Boost! Salma checks for cats...');
      SC.showSalmaCatHint();
    } else {
      SC.playTone(523.25, 0.1);
      setTimeout(() => SC.playTone(659.25, 0.14), 100);
      SC.showToast('👋 Laila & Salma wave hello to Tokyo!');
    }
  }

  function cycleCameraMode() {
    SC.runtime.camMode = (SC.runtime.camMode + 1) % 3;
    const btn = document.getElementById('btn-front-cam');
    const banner = document.getElementById('front-view-banner');
    const label = document.getElementById('front-view-label');
    if (SC.runtime.camMode === 0) {
      btn.classList.remove('active');
      banner.classList.add('hidden');
    } else if (SC.runtime.camMode === 1) {
      btn.classList.add('active');
      label.textContent = "📷 Laila's Front View";
      banner.classList.remove('hidden');
    } else {
      btn.classList.add('active');
      label.textContent = "📷 Salma's Front View";
      banner.classList.remove('hidden');
    }
  }

  function setupInputs() {
    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (SC.runtime.modalOpen) {
        if (k === 'escape') SC.closeAllModals();
        return;
      }
      if (k === 'c') cycleCameraMode();
      if (k === 'v') triggerSisterPose();
      if (k === 'm') toggleMiniMap();
      if (k === 'r') toggleRunButton();
      if (k === 'e') triggerInteract();
      if (k === ' ') triggerJump();
    });

    window.addEventListener('keyup', e => {
      keys[e.key.toLowerCase()] = false;
    });

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', e => {
      dragging = true;
      lastPointer = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointermove', e => {
      if (!dragging || SC.runtime.modalOpen) return;
      const dx = e.clientX - lastPointer.x;
      const dy = e.clientY - lastPointer.y;
      lastPointer = { x: e.clientX, y: e.clientY };
      camYaw -= dx * 0.006;
      camPitch = Math.max(0.08, Math.min(0.85, camPitch + dy * 0.004));
    });
    window.addEventListener('pointerup', () => { dragging = false; });

    document.getElementById('btn-time').addEventListener('click', () => {
      SC.state.timeMode = (SC.state.timeMode + 1) % 3;
      SC.saveState();
      applyTimeOfDay();
    });

    const grainBtn = document.getElementById('btn-grain');
    const grainEl = document.getElementById('grain-overlay');
    grainEl.classList.toggle('grain-active', SC.state.grainEnabled);
    grainBtn.classList.toggle('active', SC.state.grainEnabled);
    grainBtn.addEventListener('click', () => {
      SC.state.grainEnabled = !SC.state.grainEnabled;
      SC.saveState();
      grainEl.classList.toggle('grain-active', SC.state.grainEnabled);
      grainBtn.classList.toggle('active', SC.state.grainEnabled);
    });

    const soundBtn = document.getElementById('btn-sound');
    soundBtn.textContent = SC.state.soundEnabled ? '🔊' : '🔇';
    soundBtn.addEventListener('click', () => {
      SC.state.soundEnabled = !SC.state.soundEnabled;
      SC.saveState();
      soundBtn.textContent = SC.state.soundEnabled ? '🔊' : '🔇';
      if (SC.state.soundEnabled) SC.playTone(523.25, 0.12);
    });

    document.getElementById('btn-front-cam').addEventListener('click', cycleCameraMode);
    document.getElementById('btn-pose').addEventListener('click', triggerSisterPose);
    const mmCard = document.getElementById('minimap-card');
    if (mmCard) mmCard.addEventListener('click', toggleMiniMap);
    document.getElementById('btn-run').addEventListener('click', toggleRunButton);
    document.getElementById('btn-jump').addEventListener('click', triggerJump);
    document.getElementById('interact-prompt').addEventListener('click', triggerInteract);
    document.getElementById('btn-interact-mobile').addEventListener('click', triggerInteract);

    const jZone = document.getElementById('joystick-zone');
    const jKnob = document.getElementById('joystick-knob');
    if (jZone) {
      let jId = null;
      const updateJoy = (clientX, clientY) => {
        const rect = jZone.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = (clientX - cx) / 36;
        let dy = (clientY - cy) / 36;
        const mag = Math.hypot(dx, dy);
        if (mag > 1) { dx /= mag; dy /= mag; }
        joy.x = dx;
        joy.y = dy;
        jKnob.style.left = (33 + dx * 30) + 'px';
        jKnob.style.top = (33 + dy * 30) + 'px';
      };
      jZone.addEventListener('pointerdown', e => {
        jId = e.pointerId;
        joy.active = true;
        jZone.setPointerCapture(jId);
        updateJoy(e.clientX, e.clientY);
      });
      jZone.addEventListener('pointermove', e => {
        if (joy.active && e.pointerId === jId) updateJoy(e.clientX, e.clientY);
      });
      jZone.addEventListener('pointerup', () => {
        joy.active = false;
        joy.x = 0; joy.y = 0;
        jKnob.style.left = '33px';
        jKnob.style.top = '33px';
      });
    }
  }

let miniMapCompact = false;
  function toggleMiniMap() {
    miniMapCompact = !miniMapCompact;
    const canvas = document.getElementById('minimap-canvas');
    const legend = document.querySelector('.minimap-legend');
    if (canvas) canvas.classList.toggle('hidden', miniMapCompact);
    if (legend) legend.classList.toggle('hidden', miniMapCompact);
  }

  function updateMiniMap() {
    if (miniMapCompact) return;
    const canvas = document.getElementById('minimap-canvas');
    if (!canvas || !SC.chars.laila) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // World bounds: X in [-18, 18], Z in [-36, 22]
    const minX = -18, maxX = 18;
    const minZ = -36, maxZ = 22;
    const toMapX = wx => ((wx - minX) / (maxX - minX)) * W;
    const toMapY = wz => ((wz - minZ) / (maxZ - minZ)) * H;

    // Background grass
    ctx.fillStyle = '#8cc474';
    ctx.fillRect(0, 0, W, H);

    // Sidewalks & Main Street Road
    const roadLeft = toMapX(-6.3);
    const roadRight = toMapX(6.3);
    ctx.fillStyle = '#dcd5c7';
    ctx.fillRect(roadLeft, 0, roadRight - roadLeft, H);

    const asphaltLeft = toMapX(-4.3);
    const asphaltRight = toMapX(4.3);
    ctx.fillStyle = '#5a6069';
    ctx.fillRect(asphaltLeft, 0, asphaltRight - asphaltLeft, H);

    // Center dashed road line
    ctx.strokeStyle = '#f7e9c4';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(toMapX(0), 0);
    ctx.lineTo(toMapX(0), H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Houses (gray blocks)
    ctx.fillStyle = '#c9bfa8';
    ctx.strokeStyle = '#7a6852';
    ctx.lineWidth = 1;
    const houses = [
      [-11.8, 12], [-11.8, -1.5], [-11.8, -19.5],
      [11.8, 10], [11.8, -19]
    ];
    houses.forEach(h => {
      const hx = toMapX(h[0] - 3.2);
      const hy = toMapY(h[1] - 3.6);
      const hw = toMapX(h[0] + 3.2) - hx;
      const hh = toMapY(h[1] + 3.6) - hy;
      ctx.fillRect(hx, hy, hw, hh);
      ctx.strokeRect(hx, hy, hw, hh);
    });

    // Landmarks: Sakura Elementary (top), Ichiban Ramen (east), Tokyo Boutique (west)
    // School
    ctx.fillStyle = '#b84a46';
    const sx = toMapX(-8), sy = toMapY(-35.5);
    ctx.fillRect(sx, sy, toMapX(8) - sx, toMapY(-28.2) - sy);
    ctx.fillStyle = '#fff8eb';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏫 SCHOOL', toMapX(0), toMapY(-30.6));

    // Ichiban Ramen
    ctx.fillStyle = '#d97724';
    const rx = toMapX(7.6), ry = toMapY(-9.1);
    ctx.fillRect(rx, ry, toMapX(14.6) - rx, toMapY(-1.9) - ry);
    ctx.fillStyle = '#fff8eb';
    ctx.fillText('🍜 RAMEN', toMapX(11.1), toMapY(-4.8));

    // Tokyo Boutique
    ctx.fillStyle = '#db5485';
    const bx = toMapX(-10.5), by = toMapY(-13.0);
    ctx.fillRect(bx, by, toMapX(-6.7) - bx, toMapY(-8.6) - by);
    ctx.fillStyle = '#fff8eb';
    ctx.fillText('🎀 SHOP', toMapX(-8.6), toMapY(-10.2));

    // Unfound Hidden Cats (purple pulsing dots)
    if (SC.world.hiddenCats) {
      SC.world.hiddenCats.forEach(cat => {
        if (cat.found) return;
        const cx = toMapX(cat.mesh.position.x);
        const cy = toMapY(cat.mesh.position.z);
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    }

    // Salma (amber dot)
    if (SC.chars.salma) {
      const sp = SC.chars.salma.root.position;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(toMapX(sp.x), toMapY(sp.z), 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    // Laila (red directional arrow)
    const lp = SC.chars.laila.root.position;
    const lx = toMapX(lp.x);
    const ly = toMapY(lp.z);
    const yaw = SC.chars.laila.root.rotation.y;
    ctx.save();
    ctx.translate(lx, ly);
    // In 3D, +X is right, +Z is down on map; yaw=0 faces +Z (down), yaw=PI faces -Z (up)
    ctx.rotate(-yaw);
    ctx.fillStyle = '#e63946';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 6.5);
    ctx.lineTo(-4.8, -4.8);
    ctx.lineTo(0, -2.5);
    ctx.lineTo(4.8, -4.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function toggleRunButton() {
    SC.runtime.runToggle = !SC.runtime.runToggle;
    document.getElementById('btn-run').classList.toggle('active', SC.runtime.runToggle);
  }

  function triggerInteract() {
    if (SC.runtime.modalOpen || SC.runtime.eating) return;
    if (!SC.runtime.nearZone && SC.chars.mochi &&
        SC.chars.laila.root.position.distanceTo(SC.chars.mochi.position) < 2.5) {
      SC.openMochiModal();
      return;
    }
    if (!SC.runtime.nearZone) return;
    const zid = SC.runtime.nearZone.id;
    if (zid === 'school') SC.openSchoolModal();
    else if (zid === 'ramen') SC.openRamenModal();
    else if (zid === 'shop') SC.openShopModal();
    else if (zid === 'gachapon') SC.openGachaponModal();
    else if (zid === 'drink_vending') SC.openDrinkVendingModal();
    else if (zid === 'clubhouse') SC.openClubhouseModal();
    else if (zid === 'mochi') SC.openMochiModal();
    else if (zid === 'park_slide') {
      SC.runtime.parkActivity = { type: 'slide', timer: 2.2 };
      SC.addXP(10);
      SC.playTone(587.33, 0.14);
      SC.showToast('🛝 Wheee! Sliding down together! +10 XP');
    } else if (zid === 'park_swing') {
      SC.runtime.parkActivity = { type: 'swing', timer: 3.5 };
      SC.addXP(10);
      SC.playTone(523.25, 0.14);
      SC.showToast(' swinging high on the park swing! +10 XP');
    } else if (zid === 'park_hopscotch') {
      SC.addCoins(20);
      SC.addXP(12);
      SC.playTone(659.25, 0.12);
      setTimeout(() => SC.playTone(783.99, 0.14), 110);
      SC.showToast('🎯 Hopscotch cleared! +20c & +12 XP!');
    } else if (zid.startsWith('cat:')) SC.petHiddenCat(zid.slice(4));
  }

  function resolveCollisions(pos, radius) {
    pos.x = Math.max(-22, Math.min(22, pos.x));
    pos.z = Math.max(-34, Math.min(26, pos.z));
    const r = radius || 0.45;
    for (let i = 0; i < SC.world.colliders.length; i++) {
      const c = SC.world.colliders[i];
      if (pos.x + r > c.minX && pos.x - r < c.maxX && pos.z + r > c.minZ && pos.z - r < c.maxZ) {
        const dL = Math.abs((pos.x + r) - c.minX);
        const dR = Math.abs(c.maxX - (pos.x - r));
        const dT = Math.abs((pos.z + r) - c.minZ);
        const dB = Math.abs(c.maxZ - (pos.z - r));
        const m = Math.min(dL, dR, dT, dB);
        if (m === dL) pos.x = c.minX - r;
        else if (m === dR) pos.x = c.maxX + r;
        else if (m === dT) pos.z = c.minZ - r;
        else pos.z = c.maxZ + r;
      }
    }
  }

  function updateSalmaCompanion(dt, elapsed, isRunning, speed) {
    const laila = SC.chars.laila;
    const salma = SC.chars.salma;
    if (!salma) return;

    const lp = laila.root.position;
    const sp = salma.root.position;

    // When waving/posing together, stand side-by-side
    const sideOffset = SC.runtime.poseTimer > 0 ? 1.05 : 0.65;
    const backOffset = SC.runtime.poseTimer > 0 ? 0.15 : 1.15;

    const behindX = -Math.sin(laila.root.rotation.y) * backOffset - Math.cos(laila.root.rotation.y) * sideOffset;
    const behindZ = -Math.cos(laila.root.rotation.y) * backOffset + Math.sin(laila.root.rotation.y) * sideOffset;
    const targetX = lp.x + behindX;
    const targetZ = lp.z + behindZ;

    const dx = targetX - sp.x;
    const dz = targetZ - sp.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 12) {
      sp.set(targetX, 0, targetZ);
    } else if (dist > 0.25) {
      const followSpeed = Math.max(speed * 1.04, dist * 3.4);
      const step = Math.min(dist, followSpeed * dt);
      sp.x += (dx / dist) * step;
      sp.z += (dz / dist) * step;
      resolveCollisions(sp, 0.36);

      const targetRot = Math.atan2(dx, dz);
      let diff = targetRot - salma.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      salma.root.rotation.y += diff * Math.min(1, dt * 12);

      const sprinting = isRunning || dist > 2.2;
      const freq = sprinting ? 14.5 : 9.5;
      const amp = sprinting ? 0.82 : 0.52;
      const swing = Math.sin(elapsed * freq + 0.8) * amp;
      salma.leftLeg.rotation.x = swing;
      salma.rightLeg.rotation.x = -swing;
      salma.leftArm.rotation.x = -swing * 0.85;
      if (SC.runtime.poseTimer <= 0) salma.rightArm.rotation.x = swing * 0.85;
    } else {
      let diff = laila.root.rotation.y - salma.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      salma.root.rotation.y += diff * Math.min(1, dt * 8);

      salma.leftLeg.rotation.x *= 0.82;
      salma.rightLeg.rotation.x *= 0.82;
      salma.leftArm.rotation.x *= 0.82;
      if (SC.runtime.poseTimer <= 0) salma.rightArm.rotation.x *= 0.82;
    }

    if (!salmaGrounded) {
      salmaVelY -= 17.5 * dt;
      sp.y += salmaVelY * dt;
      if (sp.y <= 0) {
        sp.y = 0;
        salmaVelY = 0;
        salmaGrounded = true;
      }
    }
  }

  function updatePlayer(dt, elapsed) {
    const laila = SC.chars.laila;
    const salma = SC.chars.salma;

    if (SC.runtime.eating) {
      const eat = SC.runtime.eating;
      eat.timer += dt;
      laila.rightArm.rotation.x = -1.25 + Math.sin(elapsed * 5.2) * 0.35;
      laila.headGroup.rotation.x = Math.sin(elapsed * 5.2) * 0.14;
      eat.bowlObj.sticks.position.y = 0.28 + Math.max(0, Math.sin(elapsed * 5.2)) * 0.18;

      if (salma) {
        salma.rightArm.rotation.x = -1.25 + Math.sin(elapsed * 5.8 + 0.9) * 0.35;
        salma.headGroup.rotation.x = Math.sin(elapsed * 5.8 + 0.9) * 0.16;
        if (eat.bowlObj.salmaSticks) {
          eat.bowlObj.salmaSticks.position.y = 0.28 + Math.max(0, Math.sin(elapsed * 5.8 + 0.9)) * 0.18;
        }
      }

      eat.bowlObj.oishii.position.y = 2.15 + Math.sin(elapsed * 3.5) * 0.12;
      if (eat.timer >= eat.duration) SC.finishEatingAnimation(scene);
      return;
    }

    if (SC.runtime.modalOpen) return;

    let inX = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
    let inZ = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
    if (joy.active) { inX = joy.x; inZ = joy.y; }

    const moving = Math.hypot(inX, inZ) > 0.08;
    if (moving) SC.runtime.poseTimer = 0;

    const wantsRun = (keys['shift'] || SC.runtime.runToggle) && moving;
    const infStam = SC.runtime.buff && SC.runtime.buff.infiniteStamina && Date.now() < SC.runtime.buff.expiresAt;
    const isRunning = wantsRun && (SC.runtime.stamina > 2 || infStam);

    if (isRunning && !infStam) {
      SC.runtime.stamina = Math.max(0, SC.runtime.stamina - dt * 24);
    } else {
      SC.runtime.stamina = Math.min(100, SC.runtime.stamina + dt * 16);
    }

    const buffMult = (SC.runtime.buff && Date.now() < SC.runtime.buff.expiresAt) ? SC.runtime.buff.speedMult : 1.0;
    const speed = (isRunning ? 8.2 : 4.6) * buffMult;

    if (moving) {
      const len = Math.hypot(inX, inZ);
      inX /= len; inZ /= len;
      const forward = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw));
      const right = new THREE.Vector3(-forward.z, 0, forward.x);
      const moveVec = new THREE.Vector3()
        .addScaledVector(forward, -inZ)
        .addScaledVector(right, inX)
        .normalize();

      laila.root.position.addScaledVector(moveVec, speed * dt);
      resolveCollisions(laila.root.position, 0.45);

      const targetRot = Math.atan2(moveVec.x, moveVec.z);
      let diff = targetRot - laila.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      laila.root.rotation.y += diff * Math.min(1, dt * 12);

      const freq = isRunning ? 12.5 : 8.0;
      const amp = isRunning ? 0.78 : 0.48;
      const swing = Math.sin(elapsed * freq) * amp;
      laila.leftLeg.rotation.x = swing;
      laila.rightLeg.rotation.x = -swing;
      laila.leftArm.rotation.x = -swing * 0.8;
      laila.rightArm.rotation.x = swing * 0.8;
      laila.rightArm.rotation.z = 0;
      if (salma) salma.rightArm.rotation.z = 0;
    } else {
      laila.leftLeg.rotation.x *= 0.82;
      laila.rightLeg.rotation.x *= 0.82;
      laila.leftArm.rotation.x *= 0.82;

      if (SC.runtime.poseTimer > 0) {
        SC.runtime.poseTimer -= dt;
        laila.rightArm.rotation.x = -0.38;
        laila.rightArm.rotation.z = 2.15 + Math.sin(elapsed * 9.5) * 0.34;
        laila.headGroup.rotation.z = -0.08 + Math.sin(elapsed * 4.5) * 0.06;
        if (salma) {
          salma.rightArm.rotation.x = -0.42;
          salma.rightArm.rotation.z = 2.22 + Math.sin(elapsed * 10.0 + 0.5) * 0.38;
          salma.headGroup.rotation.z = 0.08 - Math.sin(elapsed * 4.5) * 0.08;
        }
      } else {
        laila.rightArm.rotation.x *= 0.82;
        laila.rightArm.rotation.z *= 0.8;
        laila.headGroup.rotation.z *= 0.8;
        if (salma) {
          salma.rightArm.rotation.z *= 0.8;
          salma.headGroup.rotation.z *= 0.8;
        }
      }
    }

    if (!grounded) {
      velY -= 17.5 * dt;
      laila.root.position.y += velY * dt;
      if (laila.root.position.y <= 0) {
        laila.root.position.y = 0;
        velY = 0;
        grounded = true;
      }
    }

    updateSalmaCompanion(dt, elapsed, isRunning, speed);

    if (SC.runtime.highFiveTimer > 0) {
      SC.runtime.highFiveTimer -= dt;
      laila.rightArm.rotation.x = -0.35;
      laila.rightArm.rotation.z = 2.45;
      if (salma) {
        salma.rightArm.rotation.x = -0.35;
        salma.rightArm.rotation.z = 2.45;
        salma.root.position.y = Math.abs(Math.sin(elapsed * 10)) * 0.45;
      }
    }

    if (SC.runtime.parkActivity) {
      SC.runtime.parkActivity.timer -= dt;
      if (SC.runtime.parkActivity.type === 'slide') {
        const t = Math.max(0, Math.min(1, 1 - (SC.runtime.parkActivity.timer / 2.2)));
        laila.root.position.lerpVectors(SC.world.slideStartPos, SC.world.slideEndPos, t);
      }
      if (SC.runtime.parkActivity.timer <= 0) {
        SC.runtime.parkActivity = null;
      }
    }

    if (SC.runtime.mochiGame && SC.chars.mochi) {
      const mg = SC.runtime.mochiGame;
      mg.timeLeft -= dt;
      const mp = SC.chars.mochi.position;
      const lp = laila.root.position;
      if (mg.mode === 'fetch') {
        if (mg.state === 'to_target') {
          const dx = mg.ballPos.x - mp.x;
          const dz = mg.ballPos.z - mp.z;
          const d = Math.hypot(dx, dz);
          if (d > 0.2) {
            mp.x += (dx / d) * 6.8 * dt;
            mp.z += (dz / d) * 6.8 * dt;
            mp.rotation.y = Math.atan2(dx, dz);
          } else {
            mg.state = 'returning';
          }
        } else {
          const dx = lp.x - mp.x;
          const dz = lp.z - mp.z;
          const d = Math.hypot(dx, dz);
          if (d > 0.9) {
            mp.x += (dx / d) * 6.6 * dt;
            mp.z += (dz / d) * 6.6 * dt;
            mp.rotation.y = Math.atan2(dx, dz);
            if (SC.world.mochiBall) SC.world.mochiBall.position.set(mp.x, 0.25, mp.z);
          } else {
            mg.score += 1;
            SC.runtime.mochiHeartTimer = 1.6;
            SC.playTone(698.46, 0.12);
            mg.state = 'to_target';
            mg.ballPos.set((Math.random() - 0.5) * 6.2, 0.14, -22 + Math.random() * 36);
            if (SC.world.mochiBall) SC.world.mochiBall.position.copy(mg.ballPos);
          }
        }
      } else {
        // Tag mode: Mochi trots around & gives tag points when Laila gets close
        const dPlayer = lp.distanceTo(mp);
        if (dPlayer < 1.65) {
          mg.score += 1;
          SC.runtime.mochiHeartTimer = 1.5;
          SC.playTone(783.99, 0.12);
          mp.x = Math.max(-3.5, Math.min(3.5, lp.x + (Math.random() - 0.5) * 9));
          mp.z = Math.max(-24, Math.min(18, lp.z + (Math.random() - 0.5) * 9));
        } else {
          mp.x = Math.max(-3.6, Math.min(3.6, mp.x + Math.sin(elapsed * 2.2) * 3.5 * dt));
          mp.z = Math.max(-24, Math.min(18, mp.z + Math.cos(elapsed * 1.9) * 3.5 * dt));
        }
      }
      if (mg.timeLeft <= 0) {
        SC.finishMochiMiniGame();
      }
    }

    let found = null;
    for (let i = 0; i < SC.world.zones.length; i++) {
      const z = SC.world.zones[i];
      if (laila.root.position.distanceTo(z.pos) < z.radius) {
        found = z;
        break;
      }
    }
    if (!found && SC.chars.mochi && laila.root.position.distanceTo(SC.chars.mochi.position) < 2.4) {
      found = { id: 'mochi', label: 'Play with Mochi (Fetch / Tag / Pet)' };
    }
    SC.runtime.nearZone = found;
    const prompt = document.getElementById('interact-prompt');
    const mobBtn = document.getElementById('btn-interact-mobile');
    if (found) {
      document.getElementById('interact-label').textContent = found.label;
      prompt.classList.remove('hidden');
      mobBtn.classList.remove('hidden');
    } else {
      prompt.classList.add('hidden');
      mobBtn.classList.add('hidden');
    }

    const pz = laila.root.position.z;
    const px = laila.root.position.x;
    const zoneEl = document.getElementById('compass-zone');
    if (zoneEl) {
      if (pz < -21) zoneEl.textContent = 'Sakura Elementary';
      else if (px > 4 && Math.abs(pz + 5.5) < 6) zoneEl.textContent = 'Ichiban Ramen';
      else if (px < -4 && Math.abs(pz + 10.8) < 5) zoneEl.textContent = 'Tokyo Boutique';
      else zoneEl.textContent = 'Main Street';
    }
  }

  function updateCamera(dt) {
    const laila = SC.chars.laila;
    const salma = SC.chars.salma;
    const p = laila.root.position;
    let desiredPos, lookTarget;

    if (SC.runtime.eating) {
      desiredPos = new THREE.Vector3(SC.world.ramenTablePos.x - 3.05, 1.52, SC.world.ramenTablePos.z + 2.75);
      lookTarget = new THREE.Vector3(SC.world.ramenTablePos.x - 0.85, 0.82, SC.world.ramenTablePos.z - 0.05);
    } else if (SC.runtime.camMode === 1) {
      const fwd = new THREE.Vector3(Math.sin(laila.root.rotation.y), 0, Math.cos(laila.root.rotation.y));
      desiredPos = p.clone().addScaledVector(fwd, 2.25).add(new THREE.Vector3(0, 1.32, 0));
      lookTarget = p.clone().add(new THREE.Vector3(0, 1.18, 0));
    } else if (SC.runtime.camMode === 2 && salma) {
      const sp = salma.root.position;
      const fwd = new THREE.Vector3(Math.sin(salma.root.rotation.y), 0, Math.cos(salma.root.rotation.y));
      desiredPos = sp.clone().addScaledVector(fwd, 1.95).add(new THREE.Vector3(0, 1.1, 0));
      lookTarget = sp.clone().add(new THREE.Vector3(0, 0.95, 0));
    } else {
      const dist = 6.4;
      const offX = -Math.sin(camYaw) * Math.cos(camPitch) * dist;
      const offY = Math.sin(camPitch) * dist + 1.5;
      const offZ = -Math.cos(camYaw) * Math.cos(camPitch) * dist;
      desiredPos = new THREE.Vector3(p.x + offX, p.y + offY, p.z + offZ);
      lookTarget = new THREE.Vector3(p.x, p.y + 1.25, p.z);
    }

    camera.position.lerp(desiredPos, Math.min(1, dt * 8));
    camera.lookAt(lookTarget);
  }

  function init() {
    if (typeof THREE === 'undefined') {
      showError('Three.js failed to load. Please check your internet connection and reload.');
      return;
    }

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcbe6f7, 42, 135);

    camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 260);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);

    hemiLight = new THREE.HemisphereLight(0xbbe2ff, 0x7c8c64, 0.78);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0xfff1d0, 1.15);
    dirLight.position.set(18, 28, 16);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.left = -35;
    dirLight.shadow.camera.right = 35;
    dirLight.shadow.camera.top = 35;
    dirLight.shadow.camera.bottom = -35;
    scene.add(dirLight);

    SC.buildWorld(scene);
    SC.buildCharacters(scene);
    SC.initGameplayUI(scene);
    applyTimeOfDay();
    setupInputs();
    SC.updateHUD();

    camera.position.set(0, 3.2, 20.2);
    camera.lookAt(0, 1.25, 14);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
      requestAnimationFrame(animate);
      try {
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;
        updatePlayer(dt, elapsed);
        SC.updateCharacters(dt, elapsed, SC.chars.laila.root.position);
        SC.updateWorldAnimations(dt, elapsed);
        updateCamera(dt);
        SC.updateHUD();
        updateMiniMap();
        renderer.render(scene, camera);
      } catch (err) {
        console.error(err);
      }
    }
    animate();
  }

  window.addEventListener('DOMContentLoaded', () => {
    try {
      init();
    } catch (err) {
      showError(err && err.message ? err.message : String(err));
    }
  });
})(window.FirstAdventureTokyo);
