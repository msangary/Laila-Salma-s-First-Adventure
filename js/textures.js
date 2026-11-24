window.FirstAdventureTokyo = window.FirstAdventureTokyo || {};

(function (SC) {
  let cachedGradientMap = null;

  SC.getToonGradient = function () {
    if (cachedGradientMap) return cachedGradientMap;
    const data = new Uint8Array([120, 200, 255]);
    const tex = new THREE.DataTexture(data, 3, 1, THREE.LuminanceFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    cachedGradientMap = tex;
    return tex;
  };

  SC.makeToonMat = function (color, opts) {
    const cfg = Object.assign({
      color: color
    }, opts || {});
    return new THREE.MeshLambertMaterial(cfg);
  };

  SC.createRoadTexture = function () {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 1024;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#565b63';
    ctx.fillRect(0, 0, 512, 1024);

    for (let i = 0; i < 4500; i++) {
      const v = 74 + Math.floor(Math.random() * 28);
      ctx.fillStyle = 'rgba(' + v + ',' + v + ',' + (v + 6) + ',0.35)';
      ctx.fillRect(Math.random() * 512, Math.random() * 1024, 2, 2);
    }

    ctx.fillStyle = '#f2f0e6';
    ctx.fillRect(28, 0, 12, 1024);
    ctx.fillRect(472, 0, 12, 1024);

    ctx.fillStyle = '#f7e9c4';
    for (let y = 30; y < 1024; y += 128) {
      ctx.fillRect(250, y, 12, 66);
    }

    ctx.strokeStyle = 'rgba(245, 242, 232, 0.88)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(155, 220);
    ctx.lineTo(195, 290);
    ctx.lineTo(155, 360);
    ctx.lineTo(115, 290);
    ctx.closePath();
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = 'rgba(245, 242, 232, 0.88)';
    ctx.font = 'bold 46px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('止まれ', 355, 760);
    ctx.fillRect(280, 700, 150, 12);
    ctx.restore();

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 6);
    return tex;
  };

  SC.createRoofTileTexture = function (baseHex) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = baseHex || '#445266';
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += 24) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(0, y, 256, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, y + 20, 256, 4);
      for (let x = 0; x < 256; x += 32) {
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 16, y + 18, 16, 0, Math.PI);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    return tex;
  };

  SC.createPlasterTexture = function (hex) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = hex || '#f3ead8';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(120,90,60,0.07)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 3);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  };

  SC.createSkyTexture = function (mode) {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    if (mode === 1) {
      grad.addColorStop(0, '#3a4f7a');
      grad.addColorStop(0.45, '#e88b5a');
      grad.addColorStop(0.85, '#ffd485');
      grad.addColorStop(1, '#ffefb8');
    } else if (mode === 2) {
      grad.addColorStop(0, '#131d3b');
      grad.addColorStop(0.55, '#2b3e6b');
      grad.addColorStop(1, '#5d6b8f');
    } else {
      grad.addColorStop(0, '#3a88d4');
      grad.addColorStop(0.5, '#7fc2f0');
      grad.addColorStop(0.85, '#d5ecfa');
      grad.addColorStop(1, '#fff3d6');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    function drawCloud(cx, cy, scale, alpha) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      const puffs = [
        [0, 0, 58], [-48, 18, 42], [52, 16, 46], [-22, -32, 40],
        [24, -28, 38], [0, -56, 30], [-78, 32, 32], [82, 30, 34]
      ];
      const shadowCol = mode === 1 ? 'rgba(205,120,95,' + alpha + ')' :
                        mode === 2 ? 'rgba(40,52,88,' + alpha + ')' :
                                     'rgba(180,208,232,' + alpha + ')';
      const lightCol = mode === 1 ? 'rgba(255,228,195,' + alpha + ')' :
                       mode === 2 ? 'rgba(92,110,152,' + alpha + ')' :
                                    'rgba(255,253,246,' + alpha + ')';
      puffs.forEach(p => {
        ctx.fillStyle = shadowCol;
        ctx.beginPath();
        ctx.arc(p[0], p[1] + 10, p[2], 0, Math.PI * 2);
        ctx.fill();
      });
      puffs.forEach(p => {
        ctx.fillStyle = lightCol;
        ctx.beginPath();
        ctx.arc(p[0], p[1], p[2] * 0.94, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    drawCloud(240, 210, 1.35, 0.92);
    drawCloud(680, 190, 1.6, 0.94);
    drawCloud(900, 240, 1.0, 0.85);
    drawCloud(90, 250, 0.9, 0.82);

    return new THREE.CanvasTexture(c);
  };

  SC.createAnimeFaceTexture = function (opts) {
    const cfg = Object.assign({
      skin: '#ffe3cc',
      eyeColor: '#4a2f1d',
      eyeHighlight: '#7c5132',
      blush: 'rgba(244, 130, 140, 0.42)',
      blink: false,
      happy: false,
      glasses: false,
      elder: false,
      mustache: false
    }, opts || {});

    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    ctx.fillStyle = cfg.skin;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = cfg.blush;
    ctx.beginPath();
    ctx.ellipse(150, 305, 42, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(362, 305, 42, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = cfg.elder ? '#999999' : '#3a2416';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(132, 182);
    ctx.quadraticCurveTo(175, 166, 214, 180);
    ctx.moveTo(298, 180);
    ctx.quadraticCurveTo(337, 166, 380, 182);
    ctx.stroke();

    function drawEye(cx) {
      if (cfg.blink || cfg.happy) {
        ctx.strokeStyle = '#2d1c12';
        ctx.lineWidth = 12;
        ctx.beginPath();
        if (cfg.happy) {
          ctx.arc(cx, 256, 34, Math.PI * 1.12, Math.PI * 1.88);
        } else {
          ctx.arc(cx, 240, 34, Math.PI * 0.15, Math.PI * 0.85);
        }
        ctx.stroke();
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, 246, 36, 40, 0, 0, Math.PI * 2);
      ctx.fill();

      const ig = ctx.createLinearGradient(cx, 212, cx, 282);
      ig.addColorStop(0, cfg.eyeColor);
      ig.addColorStop(1, cfg.eyeHighlight);
      ctx.fillStyle = ig;
      ctx.beginPath();
      ctx.ellipse(cx, 250, 26, 33, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1b110c';
      ctx.beginPath();
      ctx.ellipse(cx, 252, 13, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 10, 234, 9, 0, Math.PI * 2);
      ctx.arc(cx + 10, 264, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#24150d';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.arc(cx, 252, 38, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
    }

    drawEye(174);
    drawEye(338);

    if (cfg.glasses) {
      ctx.strokeStyle = '#4a3a2c';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(174, 248, 48, 0, Math.PI * 2);
      ctx.moveTo(222, 248);
      ctx.lineTo(290, 248);
      ctx.moveTo(386, 248);
      ctx.arc(338, 248, 48, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = '#c99372';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(256, 286);
    ctx.lineTo(252, 304);
    ctx.lineTo(260, 306);
    ctx.stroke();

    if (cfg.mustache) {
      ctx.fillStyle = cfg.elder ? '#c8c8c8' : '#3a2416';
      ctx.beginPath();
      ctx.ellipse(234, 336, 28, 10, -0.2, 0, Math.PI * 2);
      ctx.ellipse(278, 336, 28, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#99473d';
    ctx.lineWidth = 9;
    ctx.beginPath();
    if (cfg.happy) {
      ctx.fillStyle = '#e56b6f';
      ctx.arc(256, 344, 30, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.arc(256, 332, 32, Math.PI * 0.18, Math.PI * 0.82);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(c);
  };

  SC.createSpeechBubbleSprite = function (name, text) {
    const c = document.createElement('canvas');
    const measureCtx = c.getContext('2d');
    measureCtx.font = '600 24px sans-serif';

    const maxTextWidth = 432;
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const test = currentLine + words[i] + ' ';
      if (measureCtx.measureText(test).width > maxTextWidth && currentLine) {
        lines.push(currentLine.trim());
        currentLine = words[i] + ' ';
      } else {
        currentLine = test;
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    const lineHeight = 31;
    const extraLines = Math.max(0, lines.length - 2);
    const boxHeight = 126 + extraLines * lineHeight;
    const tailHeight = 26;
    const topPad = 14;
    const bottomPad = 14;

    c.width = 512;
    c.height = topPad + boxHeight + tailHeight + bottomPad;

    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(253, 246, 231, 0.96)';
    ctx.strokeStyle = '#b98b52';
    ctx.lineWidth = 8;

    const x = 16, y = topPad, w = 480, h = boxHeight, r = 26;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(276, y + h);
    ctx.lineTo(256, y + h + tailHeight);
    ctx.lineTo(236, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#b85424';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(name, 40, 52);

    ctx.fillStyle = '#3d2c1e';
    ctx.font = '600 24px sans-serif';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 40, 88 + i * lineHeight);
    }

    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    const worldHeight = 1.48 * (c.height / 180);
    sprite.scale.set(4.2, worldHeight, 1);
    sprite.visible = false;
    return sprite;
  };
})(window.FirstAdventureTokyo);
