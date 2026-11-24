window.FirstAdventureTokyo = window.FirstAdventureTokyo || {};

(function (SC) {
  SC.chars = {
    laila: null,
    salma: null,
    salmaBubble: null,
    mochiHeart: null,
    npcs: [],
    mochi: null
  };

  SC.OUTFITS = [
    // Laila outfits
    { id: 'laila_school', who: 'laila', name: 'Sakura Sailor Uniform', desc: 'Classic navy & white uniform with red randoseru', cost: 0, swatch: '#2c4a7c',
      style: { topColor: 0xffffff, bottomColor: 0x2c4a7c, shoeColor: 0xd94848, backpackColor: 0xc92c3b, hatType: 'none' } },
    { id: 'laila_sakura', who: 'laila', name: 'Sakura Pink Dress & Beret', desc: 'Blossom-pink dress with a matching artist beret', cost: 80, swatch: '#ff8fab',
      style: { topColor: 0xffc2d1, bottomColor: 0xfb6f92, shoeColor: 0xffffff, backpackColor: 0xffe5ec, hatType: 'beret', hatColor: 0xfb6f92 } },
    { id: 'laila_hoodie', who: 'laila', name: 'Tokyo Mint Streetwear', desc: 'Mint hoodie, denim skirt & bunny-ear cap', cost: 110, swatch: '#52b788',
      style: { topColor: 0x95d5b2, bottomColor: 0x3d5a80, shoeColor: 0xffb703, backpackColor: 0x2d6a4f, hatType: 'cap', hatColor: 0x52b788 } },
    { id: 'laila_festival', who: 'laila', name: 'Starlight Lavender Yukata', desc: 'Festive lavender outfit with golden ribbon', cost: 140, swatch: '#9d4edd',
      style: { topColor: 0xe0aaff, bottomColor: 0x7b2cbf, shoeColor: 0xffd166, backpackColor: 0xc77dff, hatType: 'beret', hatColor: 0xffd166 } },

    // Salma outfits
    { id: 'salma_kinder', who: 'salma', name: 'Sunny Kindergarten Set', desc: 'Lemon top & classic yellow tsūgakubō hat', cost: 0, swatch: '#facc15',
      style: { topColor: 0xfff3b0, bottomColor: 0x3b6ea5, shoeColor: 0xf59e0b, backpackColor: 0xf59e0b, hatType: 'kinder', hatColor: 0xfacc15 } },
    { id: 'salma_strawberry', who: 'salma', name: 'Strawberry Picnic Outfit', desc: 'Berry-red dress with a white sun hat', cost: 75, swatch: '#ef476f',
      style: { topColor: 0xffccd5, bottomColor: 0xef476f, shoeColor: 0xffffff, backpackColor: 0xff758f, hatType: 'kinder', hatColor: 0xffffff } },
    { id: 'salma_bunny', who: 'salma', name: 'Sky-Blue Bunny Hoodie', desc: 'Pastel sky outfit with cute bunny ears', cost: 100, swatch: '#4cc9f0',
      style: { topColor: 0xbde0fe, bottomColor: 0x4895ef, shoeColor: 0xffafcc, backpackColor: 0x90e0ef, hatType: 'bunny', hatColor: 0xffffff } },
    { id: 'salma_panda', who: 'salma', name: 'Ueno Panda Explorer', desc: 'Monochrome panda jacket & panda ear hat', cost: 130, swatch: '#2b2d42',
      style: { topColor: 0xffffff, bottomColor: 0x2b2d42, shoeColor: 0xef233c, backpackColor: 0x2b2d42, hatType: 'panda', hatColor: 0xffffff } }
  ];

  function buildHatMeshes(hatType, hatColor) {
    const group = new THREE.Group();
    if (!hatType || hatType === 'none') return group;

    const mainMat = SC.makeToonMat(hatColor || 0xfacc15);
    const bandMat = SC.makeToonMat(0x2563eb);

    if (hatType === 'kinder') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), mainMat);
      dome.position.set(0, 0.08, 0);
      dome.rotation.x = -0.12;
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.41, 0.03, 18), mainMat);
      brim.position.set(0, 0.11, 0.02);
      brim.rotation.x = -0.12;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.312, 0.315, 0.05, 16), bandMat);
      band.position.set(0, 0.14, 0.01);
      band.rotation.x = -0.12;
      group.add(dome, brim, band);
    } else if (hatType === 'beret') {
      const beret = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), mainMat);
      beret.scale.set(1.08, 0.36, 1.08);
      beret.position.set(0.04, 0.25, -0.02);
      beret.rotation.z = -0.18;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 6), mainMat);
      stem.position.set(0.06, 0.36, -0.02);
      group.add(beret, stem);
    } else if (hatType === 'cap') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.305, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), mainMat);
      dome.position.set(0, 0.06, 0);
      const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.025, 14, 1, false, -Math.PI * 0.4, Math.PI * 0.8), mainMat);
      visor.position.set(0, 0.12, 0.16);
      visor.rotation.x = 0.15;
      group.add(dome, visor);
    } else if (hatType === 'bunny') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.03, 8, 20), mainMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.15;
      group.add(band);
      [-0.12, 0.12].forEach(ex => {
        const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.34, 8), mainMat);
        ear.position.set(ex, 0.38, 0);
        ear.rotation.z = ex < 0 ? 0.15 : -0.15;
        const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.24, 8), SC.makeToonMat(0xffafcc));
        inner.position.set(ex, 0.38, 0.025);
        inner.rotation.z = ex < 0 ? 0.15 : -0.15;
        group.add(ear, inner);
      });
    } else if (hatType === 'panda') {
      const hood = new THREE.Mesh(new THREE.SphereGeometry(0.312, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mainMat);
      hood.position.set(0, 0.05, 0);
      group.add(hood);
      [-0.22, 0.22].forEach(ex => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), SC.makeToonMat(0x1f2421));
        ear.position.set(ex, 0.31, 0);
        group.add(ear);
      });
    }
    return group;
  }

  function createAnimeCharacter(cfg) {
    const root = new THREE.Group();
    const s = cfg.scale || 1.0;

    const skinMat = SC.makeToonMat(cfg.skin || 0xffe3cc);
    const hairMat = SC.makeToonMat(cfg.hairColor || 0x3b261d);
    const topMat = SC.makeToonMat(cfg.topColor || 0xffffff);
    const bottomMat = SC.makeToonMat(cfg.bottomColor || 0x2d4373);
    const shoeMat = SC.makeToonMat(cfg.shoeColor || 0xd94c4c);
    const bpMat = SC.makeToonMat(cfg.backpackColor || 0xc92c3b);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    function makeLeg(sideX) {
      const leg = new THREE.Group();
      leg.position.set(sideX, 0.58, 0);
      const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.072, 0.52, 10), cfg.pants ? bottomMat : skinMat);
      limb.position.y = -0.26;
      limb.castShadow = true;
      leg.add(limb);

      if (!cfg.pants) {
        const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.072, 0.16, 10), SC.makeToonMat(0xffffff));
        sock.position.y = -0.44;
        leg.add(sock);
      }

      const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), shoeMat);
      shoe.scale.set(0.95, 0.65, 1.4);
      shoe.position.set(0, -0.54, 0.04);
      leg.add(shoe);
      return leg;
    }

    const leftLeg = makeLeg(-0.13);
    const rightLeg = makeLeg(0.13);
    bodyPivot.add(leftLeg, rightLeg);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.23, 0.56, 12), topMat);
    torso.position.y = 0.88;
    torso.castShadow = true;
    bodyPivot.add(torso);

    if (!cfg.pants) {
      const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.36, 14), bottomMat);
      skirt.position.y = 0.64;
      skirt.castShadow = true;
      bodyPivot.add(skirt);
    }

    if (cfg.sailorCollar) {
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.24, 0.16, 12), bottomMat);
      collar.position.y = 1.09;
      bodyPivot.add(collar);
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.06), SC.makeToonMat(0xd93848));
      ribbon.position.set(0, 1.02, 0.21);
      bodyPivot.add(ribbon);
    }

    if (cfg.backpackColor) {
      const bp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.19), bpMat);
      bp.position.set(0, 0.92, -0.24);
      bp.castShadow = true;
      bodyPivot.add(bp);
      const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), SC.makeToonMat(0xf2c94c));
      clasp.position.set(0, 0.78, -0.34);
      bodyPivot.add(clasp);
    }

    function makeArm(sideX) {
      const arm = new THREE.Group();
      arm.position.set(sideX, 1.1, 0);
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), topMat);
      arm.add(shoulder);
      const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.058, 0.44, 10), skinMat);
      limb.position.y = -0.24;
      limb.castShadow = true;
      arm.add(limb);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), skinMat);
      hand.position.y = -0.47;
      arm.add(hand);
      return arm;
    }

    const leftArm = makeArm(-0.26);
    const rightArm = makeArm(0.26);
    bodyPivot.add(leftArm, rightArm);

    const headGroup = new THREE.Group();
    headGroup.position.y = 1.44;
    bodyPivot.add(headGroup);

    const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.29, 18, 14), skinMat);
    headSphere.castShadow = true;
    headGroup.add(headSphere);

    const openFaceTex = SC.createAnimeFaceTexture(cfg.faceOpts);
    const blinkFaceTex = SC.createAnimeFaceTexture(Object.assign({}, cfg.faceOpts, { blink: true }));
    const happyFaceTex = SC.createAnimeFaceTexture(Object.assign({}, cfg.faceOpts, { happy: true }));

    const faceMat = new THREE.MeshBasicMaterial({ map: openFaceTex, transparent: true });
    const facePlane = new THREE.Mesh(
      new THREE.SphereGeometry(0.294, 16, 12, -Math.PI * 0.34, Math.PI * 0.68, Math.PI * 0.22, Math.PI * 0.56),
      faceMat
    );
    facePlane.rotation.y = Math.PI / 2;
    headGroup.add(facePlane);

    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.305, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
    hairTop.position.y = 0.02;
    headGroup.add(hairTop);

    if (cfg.longHair) {
      const backHair = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.31, 0.42, 12), hairMat);
      backHair.position.set(0, -0.14, -0.08);
      headGroup.add(backHair);
    }
    if (cfg.pigtails) {
      [-0.28, 0.28].forEach(px => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), hairMat);
        puff.position.set(px, -0.02, -0.06);
        headGroup.add(puff);
        const tie = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), SC.makeToonMat(0xf59e0b));
        tie.position.set(px * 0.85, 0.04, -0.04);
        headGroup.add(tie);
      });
    }

    const hatSlot = new THREE.Group();
    if (cfg.hatType && cfg.hatType !== 'none') {
      hatSlot.add(buildHatMeshes(cfg.hatType, cfg.hatColor));
    }
    headGroup.add(hatSlot);

    if (cfg.hairBun) {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), hairMat);
      bun.position.set(0, 0.24, -0.2);
      headGroup.add(bun);
    }
    if (cfg.headband) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.032, 8, 20), SC.makeToonMat(0xf5f5f5));
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.14;
      headGroup.add(band);
    }

    root.scale.setScalar(s);

    return {
      root,
      bodyPivot,
      headGroup,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      topMat,
      bottomMat,
      shoeMat,
      bpMat,
      hatSlot,
      faceMat,
      openFaceTex,
      blinkFaceTex,
      happyFaceTex,
      blinkTimer: 2 + Math.random() * 3,
      isBlinking: false
    };
  }

  SC.applyOutfit = function (who, outfitId) {
    const outfit = SC.OUTFITS.find(o => o.id === outfitId && o.who === who);
    const charObj = who === 'salma' ? SC.chars.salma : SC.chars.laila;
    if (!outfit || !charObj) return;
    const st = outfit.style;
    charObj.topMat.color.setHex(st.topColor);
    charObj.bottomMat.color.setHex(st.bottomColor);
    charObj.shoeMat.color.setHex(st.shoeColor);
    charObj.bpMat.color.setHex(st.backpackColor);

    while (charObj.hatSlot.children.length > 0) {
      charObj.hatSlot.remove(charObj.hatSlot.children[0]);
    }
    if (st.hatType && st.hatType !== 'none') {
      charObj.hatSlot.add(buildHatMeshes(st.hatType, st.hatColor));
    }
  };

  function createShibaInu() {
    const g = new THREE.Group();
    const fur = SC.makeToonMat(0xd98a3b);
    const cream = SC.makeToonMat(0xfae8cd);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.65), fur);
    body.position.y = 0.36;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), fur);
    head.position.set(0, 0.56, 0.34);
    g.add(head);

    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), cream);
    snout.position.set(0, 0.52, 0.5);
    g.add(snout);

    [-0.12, 0.12].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 6), fur);
      ear.position.set(ex, 0.76, 0.32);
      g.add(ear);
    });

    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, 6, 12, Math.PI * 1.4), fur);
    tail.position.set(0, 0.52, -0.34);
    tail.rotation.y = Math.PI / 2;
    g.add(tail);

    [[-0.11, 0.2], [0.11, 0.2], [-0.11, -0.2], [0.11, -0.2]].forEach(lp => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.28, 8), cream);
      leg.position.set(lp[0], 0.14, lp[1]);
      g.add(leg);
    });

    return g;
  }

  SC.buildCharacters = function (scene) {
    SC.chars.laila = createAnimeCharacter({
      scale: 0.86,
      hairColor: 0x3b251b,
      topColor: 0xffffff,
      bottomColor: 0x2c4a7c,
      shoeColor: 0xd94848,
      sailorCollar: true,
      backpackColor: 0xc92c3b,
      longHair: true,
      hatType: 'none',
      faceOpts: { eyeColor: '#4e2e1a', eyeHighlight: '#966238' }
    });
    SC.chars.laila.root.position.set(0, 0, 14);
    SC.chars.laila.root.rotation.y = Math.PI;
    scene.add(SC.chars.laila.root);

    SC.chars.salma = createAnimeCharacter({
      scale: 0.68,
      hairColor: 0x452b1f,
      topColor: 0xfff3b0,
      bottomColor: 0x3b6ea5,
      shoeColor: 0xf59e0b,
      backpackColor: 0xf59e0b,
      pigtails: true,
      hatType: 'kinder',
      hatColor: 0xfacc15,
      faceOpts: { eyeColor: '#54331d', eyeHighlight: '#a36b3e', blush: 'rgba(244, 120, 135, 0.52)' }
    });
    SC.chars.salma.root.position.set(-1.1, 0, 15.1);
    SC.chars.salma.root.rotation.y = Math.PI;
    SC.chars.salmaBubble = SC.createSpeechBubbleSprite('Salma', 'Wait for me, Laila! Let’s find all 5 cats & visit the boutique! 🌸');
    SC.chars.salmaBubble.position.set(0, 2.35, 0);
    SC.chars.salma.root.add(SC.chars.salmaBubble);
    scene.add(SC.chars.salma.root);

    // Apply saved outfits
    SC.applyOutfit('laila', SC.state.equippedLaila);
    SC.applyOutfit('salma', SC.state.equippedSalma);

    const npcConfigs = [
      {
        name: 'Yui',
        pos: new THREE.Vector3(-3.8, 0, 4.5),
        patrol: { axis: 'z', center: 4.5, range: 4.0, speed: 0.9 },
        line: 'Hi Laila & Salma! Did you see the new Tokyo Boutique across the street?',
        char: { scale: 0.86, hairColor: 0x5c3724, topColor: 0xffffff, bottomColor: 0x2c4a7c, sailorCollar: true, backpackColor: 0xe67e8a, longHair: true }
      },
      {
        name: 'Haruto',
        pos: new THREE.Vector3(3.8, 0, 8.5),
        patrol: { axis: 'z', center: 8.5, range: 3.8, speed: 1.05 },
        line: 'Hey Laila & Salma! 5 neighborhood cats are hiding around Tokyo!',
        char: { scale: 0.88, hairColor: 0x242429, topColor: 0x34527a, bottomColor: 0x2b3342, pants: true, backpackColor: 0x22262e }
      },
      {
        name: 'Ojii-san',
        pos: new THREE.Vector3(-4.2, 0, -5.5),
        patrol: { axis: 'z', center: -5.5, range: 2.5, speed: 0.55 },
        line: 'Good afternoon, Laila & Salma! Press V anytime to do a sister wave!',
        char: { scale: 0.96, hairColor: 0xc9c9c9, topColor: 0x7b8c6e, bottomColor: 0x4d463f, pants: true, faceOpts: { elder: true, glasses: true, mustache: true } }
      },
      {
        name: 'Master Ken',
        pos: new THREE.Vector3(6.6, 0, -3.2),
        patrol: null,
        line: 'Irasshaimase, Laila & Salma! Two steaming bowls ready at Ichiban Ramen!',
        char: { scale: 1.02, hairColor: 0x29231f, topColor: 0x2b3a55, bottomColor: 0x222630, pants: true, headband: true, faceOpts: { mustache: true } }
      },
      {
        name: 'Ms. Aoi',
        pos: new THREE.Vector3(-2.6, 0, -23.5),
        patrol: null,
        line: 'Hello Laila & Salma! Step through the gate anytime to take your quiz.',
        char: { scale: 0.98, hairColor: 0x382820, topColor: 0xe8d5c4, bottomColor: 0x4a5b70, hairBun: true, faceOpts: { glasses: true } }
      },
      {
        name: 'Mina',
        pos: new THREE.Vector3(-6.4, 0, -10.8),
        patrol: null,
        line: 'Welcome to Tokyo Boutique! Try on cute hats & dresses for Laila and Salma!',
        char: { scale: 0.9, hairColor: 0x6b3e2e, topColor: 0xffb3c6, bottomColor: 0x723d46, hatType: 'beret', hatColor: 0xd95d88 }
      }
    ];

    npcConfigs.forEach(cfg => {
      const model = createAnimeCharacter(cfg.char);
      model.root.position.copy(cfg.pos);
      const bubble = SC.createSpeechBubbleSprite(cfg.name, cfg.line);
      bubble.position.set(0, 2.25, 0);
      model.root.add(bubble);
      scene.add(model.root);

      SC.chars.npcs.push({
        name: cfg.name,
        model,
        bubble,
        patrol: cfg.patrol,
        dir: 1,
        baseRot: cfg.name === 'Master Ken' ? -Math.PI / 2 : (cfg.name === 'Mina' ? Math.PI / 2 : 0)
      });
    });

    SC.chars.mochi = createShibaInu();
    SC.chars.mochi.position.set(-3.1, 0, -5.2);
    const hc = document.createElement('canvas');
    hc.width = 160; hc.height = 120;
    const hctx = hc.getContext('2d');
    hctx.font = 'bold 74px sans-serif';
    hctx.textAlign = 'center';
    hctx.fillText('💖', 80, 88);
    const heartSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(hc), transparent: true, depthTest: false }));
    heartSprite.scale.set(0.95, 0.72, 1);
    heartSprite.position.set(0, 1.15, 0);
    heartSprite.visible = false;
    SC.chars.mochi.add(heartSprite);
    SC.chars.mochiHeart = heartSprite;
    scene.add(SC.chars.mochi);
  };

  SC.showSalmaCatHint = function () {
    if (!SC.chars.salma || !SC.world.hiddenCats) return;
    const unfound = SC.world.hiddenCats.filter(c => !c.found);
    if (unfound.length === 0) {
      if (SC.chars.salma.children && SC.chars.salma.children.length) {}
      SC.showToast('🐾 Salma: We found all 5 cats in Tokyo!');
      return;
    }
    const lp = SC.chars.laila.root.position;
    let nearest = unfound[0];
    let bestD = Infinity;
    unfound.forEach(c => {
      const d = c.mesh.position.distanceTo(lp);
      if (d < bestD) { bestD = d; nearest = c; }
    });
    const dx = nearest.mesh.position.x - lp.x;
    const dz = nearest.mesh.position.z - lp.z;
    const dir = (Math.abs(dz) > Math.abs(dx))
      ? (dz < 0 ? 'north toward school/ramen' : 'south down Main Street')
      : (dx < 0 ? 'west near the boutique/houses' : 'east near the park/ramen');
    const hintText = 'Laila, I hear ' + nearest.name.split(' ')[0] + ' meowing ' + dir + '!';
    if (SC.chars.salmaBubble) {
      SC.chars.salma.root.remove(SC.chars.salmaBubble);
      const nb = SC.createSpeechBubbleSprite('Salma', hintText);
      nb.position.set(0, 2.35, 0);
      nb.visible = true;
      SC.chars.salmaBubble = nb;
      SC.chars.salma.root.add(nb);
      SC.runtime.salmaHintUntil = Date.now() + 4500;
    }
    SC.showToast('🐱 Salma Boost: ' + hintText);
  };

  function buildSingleBowl(ramenType, bowlScale) {
    const g = new THREE.Group();
    const bs = bowlScale || 1.0;

    const bowlMat = SC.makeToonMat(bs < 1 ? 0xe07a34 : 0xb82e2e);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.14, 0.16, 14), bowlMat);
    bowl.position.y = 0.08;
    g.add(bowl);

    const brothColors = { shoyu: 0x7c4820, miso: 0xc27b30, tonkotsu: 0xf2dfc0 };
    const broth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.02, 14),
      SC.makeToonMat(brothColors[ramenType] || 0xc27b30)
    );
    broth.position.y = 0.15;
    g.add(broth);

    const chashu = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 10), SC.makeToonMat(0x9e5838));
    chashu.position.set(-0.07, 0.17, 0.03);
    g.add(chashu);

    const naruto = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 10), SC.makeToonMat(0xffffff));
    naruto.position.set(0.08, 0.17, -0.05);
    g.add(naruto);

    const egg = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), SC.makeToonMat(0xffc947));
    egg.scale.set(1, 0.45, 1.2);
    egg.position.set(0.05, 0.17, 0.08);
    g.add(egg);

    const nori = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.015), SC.makeToonMat(0x1f2e22));
    nori.position.set(0.0, 0.2, -0.16);
    nori.rotation.x = -0.3;
    g.add(nori);

    const sticks = new THREE.Group();
    sticks.position.set(-0.04, 0.28, 0.0);
    const stickMat = SC.makeToonMat(0xd6a667);
    const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.34, 6), stickMat);
    s1.rotation.z = 1.1;
    const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.34, 6), stickMat);
    s2.rotation.z = 1.25;
    s2.position.y = 0.02;
    const noodles = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.16, 8), SC.makeToonMat(0xf5d66b));
    noodles.position.set(0.06, -0.06, 0);
    sticks.add(s1, s2, noodles);
    g.add(sticks);

    g.scale.setScalar(bs);
    return { group: g, sticks };
  }

  SC.spawnRamenBowl = function (scene, ramenType) {
    const wrapper = new THREE.Group();

    const lailaBowl = buildSingleBowl(ramenType, 1.0);
    lailaBowl.group.position.set(SC.world.ramenTablePos.x - 0.18, 0.84, SC.world.ramenStoolPos.z);
    wrapper.add(lailaBowl.group);

    const salmaBowl = buildSingleBowl(ramenType, 0.82);
    salmaBowl.group.position.set(SC.world.ramenTablePos.x - 0.18, 0.84, SC.world.salmaStoolPos.z);
    wrapper.add(salmaBowl.group);

    const sc = document.createElement('canvas');
    sc.width = 320; sc.height = 96;
    const ctx = sc.getContext('2d');
    ctx.fillStyle = '#fff5dc';
    ctx.strokeStyle = '#d97a2b';
    ctx.lineWidth = 6;
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText('Oishii! 😋🍜', 160, 60);
    ctx.fillText('Oishii! 😋🍜', 160, 60);
    const oishii = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(sc), transparent: true }));
    oishii.scale.set(1.65, 0.5, 1);
    oishii.position.set(SC.world.ramenTablePos.x - 0.25, 2.15, SC.world.ramenTablePos.z);
    wrapper.add(oishii);

    scene.add(wrapper);
    return {
      group: wrapper,
      sticks: lailaBowl.sticks,
      salmaSticks: salmaBowl.sticks,
      oishii
    };
  };

  function updateBlink(charObj, dt, forceHappy) {
    if (forceHappy) {
      if (charObj.faceMat.map !== charObj.happyFaceTex) {
        charObj.faceMat.map = charObj.happyFaceTex;
        charObj.faceMat.needsUpdate = true;
      }
      return;
    }
    charObj.blinkTimer -= dt;
    if (!charObj.isBlinking && charObj.blinkTimer <= 0) {
      charObj.isBlinking = true;
      charObj.blinkTimer = 0.14;
      charObj.faceMat.map = charObj.blinkFaceTex;
      charObj.faceMat.needsUpdate = true;
    } else if (charObj.isBlinking && charObj.blinkTimer <= 0) {
      charObj.isBlinking = false;
      charObj.blinkTimer = 2.4 + Math.random() * 3.2;
      charObj.faceMat.map = charObj.openFaceTex;
      charObj.faceMat.needsUpdate = true;
    }
  }

  SC.updateCharacters = function (dt, elapsed, playerPos) {
    const happyNow = Boolean(SC.runtime.eating) || SC.runtime.poseTimer > 0;
    updateBlink(SC.chars.laila, dt, happyNow);
    if (SC.chars.salma) {
      updateBlink(SC.chars.salma, dt, happyNow || SC.runtime.highFiveTimer > 0);
      if (SC.chars.salmaBubble) {
        const hintActive = SC.runtime.salmaHintUntil && Date.now() < SC.runtime.salmaHintUntil;
        SC.chars.salmaBubble.visible = !SC.runtime.eating && (hintActive || (elapsed % 18 < 4.5));
      }
    }

    SC.chars.npcs.forEach(npc => {
      updateBlink(npc.model, dt, false);
      const dist = npc.model.root.position.distanceTo(playerPos);

      if (dist < 6.0) {
        const targetYaw = Math.atan2(
          playerPos.x - npc.model.root.position.x,
          playerPos.z - npc.model.root.position.z
        );
        npc.model.root.rotation.y += (targetYaw - npc.model.root.rotation.y) * Math.min(1, dt * 6);
        npc.bubble.visible = true;
        npc.model.leftLeg.rotation.x *= 0.85;
        npc.model.rightLeg.rotation.x *= 0.85;
        if (npc.name === 'Master Ken' || npc.name === 'Mina') {
          npc.model.rightArm.rotation.z = -2.4 + Math.sin(elapsed * 7) * 0.35;
        }
      } else {
        npc.bubble.visible = false;
        if (npc.name === 'Master Ken' || npc.name === 'Mina') {
          npc.model.rightArm.rotation.z = Math.sin(elapsed * 2) * 0.08;
        }
        if (npc.patrol) {
          const p = npc.patrol;
          npc.model.root.position.z += npc.dir * p.speed * dt;
          if (npc.model.root.position.z > p.center + p.range) npc.dir = -1;
          if (npc.model.root.position.z < p.center - p.range) npc.dir = 1;
          npc.model.root.rotation.y = npc.dir > 0 ? 0 : Math.PI;
          const swing = Math.sin(elapsed * 5.5) * 0.45;
          npc.model.leftLeg.rotation.x = swing;
          npc.model.rightLeg.rotation.x = -swing;
          npc.model.leftArm.rotation.x = -swing * 0.7;
          npc.model.rightArm.rotation.x = swing * 0.7;
        }
      }
    });

    if (SC.chars.mochiHeart) {
      if (SC.runtime.mochiHeartTimer > 0) {
        SC.runtime.mochiHeartTimer -= dt;
        SC.chars.mochiHeart.visible = true;
        SC.chars.mochiHeart.position.y = 1.15 + Math.sin(elapsed * 8) * 0.14;
      } else {
        SC.chars.mochiHeart.visible = false;
      }
    }

    const ojii = SC.chars.npcs.find(n => n.name === 'Ojii-san');
    if (ojii && SC.chars.mochi && !SC.runtime.mochiGame) {
      const target = ojii.model.root.position.clone().add(new THREE.Vector3(1.05, 0, 0.3));
      SC.chars.mochi.position.lerp(target, Math.min(1, dt * 4));
      SC.chars.mochi.rotation.y = ojii.model.root.rotation.y;
    }
  };
})(window.FirstAdventureTokyo);
