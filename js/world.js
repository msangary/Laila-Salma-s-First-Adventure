window.FirstAdventureTokyo = window.FirstAdventureTokyo || {};

(function (SC) {
  SC.world = {
    colliders: [],
    zones: [],
    norenPanels: [],
    hiddenCats: [],
    petals: null,
    skyMesh: null,
    ramenTablePos: new THREE.Vector3(7.4, 0, -5.5),
    ramenStoolPos: new THREE.Vector3(6.2, 0, -5.15),
    salmaStoolPos: new THREE.Vector3(6.2, 0, -5.92),
    mochiBall: null,
    swingPivot: null,
    slideStartPos: new THREE.Vector3(7.8, 1.55, 13.6),
    slideEndPos: new THREE.Vector3(7.8, 0.12, 16.2),
    swingSeatPos: new THREE.Vector3(8.8, 0.55, 11.4),
    hopscotchPos: new THREE.Vector3(6.2, 0.04, 15.0)
  };

  function addCollider(x, z, hw, hd) {
    SC.world.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
  }

  function buildHouse(scene, x, z, rotY, wallHex, roofHex, opts) {
    const cfg = opts || {};
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;

    const wallMat = SC.makeToonMat(0xffffff, { map: SC.createPlasterTexture(wallHex) });
    const roofMat = SC.makeToonMat(0xffffff, { map: SC.createRoofTileTexture(roofHex) });
    const woodMat = SC.makeToonMat(cfg.doorColor || 0x7c5333);
    const winMat = SC.makeToonMat(0x8bc3e8);

    const body = new THREE.Mesh(new THREE.BoxGeometry(7.2, 5.4, 6.2), wallMat);
    body.position.y = 2.7;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.8, 2.3, 4), roofMat);
    roof.position.y = 6.55;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.1, 1, 0.96);
    roof.castShadow = true;
    g.add(roof);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.2, 0.16), woodMat);
    door.position.set(-1.4, 1.1, 3.12);
    g.add(door);

    if (cfg.clubhouseSign) {
      const sc = document.createElement('canvas');
      sc.width = 512; sc.height = 128;
      const ctx = sc.getContext('2d');
      ctx.fillStyle = '#fff0f6';
      ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = '#d95d88';
      ctx.lineWidth = 8;
      ctx.strokeRect(8, 8, 496, 112);
      ctx.fillStyle = '#6b2144';
      ctx.font = 'bold 31px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("🏡 LAILA & SALMA'S ROOM", 256, 76);
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.85, 0.18),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc) })
      );
      sign.position.set(-1.4, 2.75, 3.2);
      g.add(sign);
    }

    [1.4, -1.4].forEach((wx, i) => {
      const wy = i === 0 ? 1.7 : 3.9;
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.2, 0.14), winMat);
      win.position.set(wx, wy, 3.12);
      g.add(win);
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.25, 0.16), woodMat);
      shutter.position.set(wx + 1.08, wy, 3.14);
      g.add(shutter);
    });
    const upperWin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.2, 0.14), winMat);
    upperWin.position.set(1.4, 3.9, 3.12);
    g.add(upperWin);

    const ac = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.65, 0.45), SC.makeToonMat(0xe6e4dc));
    ac.position.set(2.9, 0.45, 3.32);
    g.add(ac);

    const wall = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.15, 0.35), SC.makeToonMat(0xcac6bc));
    wall.position.set(0, 0.57, 4.3);
    wall.castShadow = true;
    wall.receiveShadow = true;
    g.add(wall);

    const post = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.32), SC.makeToonMat(0xd13838));
    post.position.set(-3.4, 1.25, 4.45);
    g.add(post);

    scene.add(g);
    addCollider(x, z, 4.3, 4.4);
  }

  function buildTree(scene, x, z, isSakura, scale) {
    const s = scale || 1;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(s);

    const trunkMat = SC.makeToonMat(isSakura ? 0x5c3c2e : 0x6e4a30);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 2.8, 8), trunkMat);
    trunk.position.y = 1.4;
    trunk.castShadow = true;
    g.add(trunk);

    const colors = isSakura
      ? [0xffc7d9, 0xffaec8, 0xffe0eb]
      : [0x4c9a42, 0x66b852, 0x3b7d36];

    const puffs = [
      [0, 3.3, 0, 1.55],
      [-0.95, 2.85, 0.45, 1.15],
      [0.95, 2.95, -0.35, 1.2],
      [0.15, 3.9, 0.4, 1.05],
      [-0.4, 3.6, -0.7, 1.0]
    ];
    puffs.forEach((p, idx) => {
      const m = new THREE.Mesh(
        new THREE.DodecahedronGeometry(p[3], 1),
        SC.makeToonMat(colors[idx % colors.length])
      );
      m.position.set(p[0], p[1], p[2]);
      m.castShadow = true;
      g.add(m);
    });

    scene.add(g);
    addCollider(x, z, 0.55 * s, 0.55 * s);
  }

  function buildIchibanRamen(scene) {
    const g = new THREE.Group();
    g.position.set(11.2, 0, -5.5);

    const woodDark = SC.makeToonMat(0x5a3921);
    const plaster = SC.makeToonMat(0xf4ead3);
    const roofMat = SC.makeToonMat(0xffffff, { map: SC.createRoofTileTexture('#3d434f') });

    const body = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.2, 7.2), plaster);
    body.position.y = 2.1;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 1.8, 4), roofMat);
    roof.position.y = 5.0;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);

    const awning = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 6.2), woodDark);
    awning.position.set(-3.9, 2.8, 0);
    awning.rotation.z = 0.22;
    g.add(awning);

    const norenMat = SC.makeToonMat(0xc9302c, { side: THREE.DoubleSide });
    for (let i = -2; i <= 2; i++) {
      const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.88, 0.92), norenMat);
      cloth.position.set(-4.45, 2.25, i * 1.05);
      g.add(cloth);
      SC.world.norenPanels.push({ mesh: cloth, phase: i * 0.7 });
    }

    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffd27d });
    [-2.7, 2.7].forEach(lz => {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), lanternMat);
      l.scale.set(1, 1.35, 1);
      l.position.set(-4.5, 2.35, lz);
      g.add(l);
    });

    const sc = document.createElement('canvas');
    sc.width = 512; sc.height = 128;
    const ctx = sc.getContext('2d');
    ctx.fillStyle = '#3b2414';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#e5a94c';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = '#fff5dc';
    ctx.font = 'bold 46px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍜 ICHIBAN RAMEN', 256, 80);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.95, 3.8),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc) })
    );
    sign.position.set(-3.42, 3.5, 0);
    g.add(sign);

    scene.add(g);
    addCollider(11.2, -5.5, 3.5, 3.7);

    const tableG = new THREE.Group();
    tableG.position.copy(SC.world.ramenTablePos);
    const tWood = SC.makeToonMat(0x9a6539);
    const tLeg = SC.makeToonMat(0x6e4524);

    const top = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 1.75), tWood);
    top.position.y = 0.78;
    top.castShadow = true;
    top.receiveShadow = true;
    tableG.add(top);

    [[-0.45, -0.72], [0.45, -0.72], [-0.45, 0.72], [0.45, 0.72]].forEach(p => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.76, 0.09), tLeg);
      leg.position.set(p[0], 0.38, p[1]);
      tableG.add(leg);
    });

    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.18, 8), SC.makeToonMat(0x7c4a26));
    holder.position.set(0.28, 0.92, -0.58);
    tableG.add(holder);

    const soyBody = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.16, 8), SC.makeToonMat(0x2b1a12));
    soyBody.position.set(0.3, 0.91, -0.34);
    tableG.add(soyBody);
    const soyCap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 0.05, 8), SC.makeToonMat(0xd63636));
    soyCap.position.set(0.3, 1.01, -0.34);
    tableG.add(soyCap);

    const napkin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.11, 0.14), SC.makeToonMat(0xf5efe0));
    napkin.position.set(0.26, 0.88, 0.56);
    tableG.add(napkin);

    scene.add(tableG);
    addCollider(SC.world.ramenTablePos.x, SC.world.ramenTablePos.z, 0.65, 0.92);

    function makeStool(pos, scaleH) {
      const stoolG = new THREE.Group();
      stoolG.position.copy(pos);
      const h = 0.48 * (scaleH || 1);
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.28, 0.08, 12), tWood);
      seat.position.y = h;
      seat.castShadow = true;
      stoolG.add(seat);
      const sLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.17, h - 0.02, 8), tLeg);
      sLeg.position.y = (h - 0.02) / 2;
      stoolG.add(sLeg);
      scene.add(stoolG);
    }

    makeStool(SC.world.ramenStoolPos, 1.0);
    makeStool(SC.world.salmaStoolPos, 0.92);

    SC.world.zones.push({
      id: 'ramen',
      label: 'Order at Ichiban Ramen',
      pos: new THREE.Vector3(6.6, 0, -5.5),
      radius: 3.6
    });
  }

  function buildBoutiqueKiosk(scene) {
    const g = new THREE.Group();
    g.position.set(-8.6, 0, -10.8);

    const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.0, 4.2), SC.makeToonMat(0xffe4ec));
    body.position.y = 1.5;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.3, 1.3, 4), SC.makeToonMat(0xd95d88));
    roof.position.y = 3.65;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);

    const stripeColors = [0xff8fab, 0xffffff, 0xffd166, 0xffffff, 0xff8fab];
    stripeColors.forEach((col, i) => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.78), SC.makeToonMat(col));
      panel.position.set(2.05, 2.25, -1.56 + i * 0.78);
      panel.rotation.z = -0.22;
      g.add(panel);
    });

    const counter = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.95, 3.4), SC.makeToonMat(0xc68b59));
    counter.position.set(1.95, 0.48, 0);
    counter.castShadow = true;
    g.add(counter);

    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.14, 0.65, 8), SC.makeToonMat(0x7c5333));
    stand.position.set(1.95, 1.25, -0.8);
    g.add(stand);
    const displayHat = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.04, 14), SC.makeToonMat(0xfacc15));
    displayHat.position.set(1.95, 1.56, -0.8);
    g.add(displayHat);
    const displayCrown = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), SC.makeToonMat(0xfacc15));
    displayCrown.position.set(1.95, 1.56, -0.8);
    g.add(displayCrown);

    const sc = document.createElement('canvas');
    sc.width = 512; sc.height = 128;
    const ctx = sc.getContext('2d');
    ctx.fillStyle = '#fff0f5';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#d95d88';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = '#7a2244';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎀 TOKYO BOUTIQUE', 256, 78);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.78, 3.2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc) })
    );
    sign.position.set(1.76, 2.75, 0);
    g.add(sign);

    scene.add(g);
    addCollider(-8.6, -10.8, 2.1, 2.2);

    SC.world.zones.push({
      id: 'shop',
      label: 'Browse Outfits & Hats',
      pos: new THREE.Vector3(-5.6, 0, -10.8),
      radius: 3.4
    });
  }

  function buildSakuraSchool(scene) {
    const g = new THREE.Group();
    g.position.set(0, 0, -32);

    const wallMat = SC.makeToonMat(0xf7efe0);
    const roofMat = SC.makeToonMat(0xffffff, { map: SC.createRoofTileTexture('#8a3e3b') });
    const winMat = SC.makeToonMat(0x8ec9ed);

    const main = new THREE.Mesh(new THREE.BoxGeometry(16, 6.4, 7.5), wallMat);
    main.position.y = 3.2;
    main.castShadow = true;
    main.receiveShadow = true;
    g.add(main);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(17.2, 1.1, 8.6), roofMat);
    roof.position.y = 6.9;
    g.add(roof);

    const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.2, 16), SC.makeToonMat(0xffffff));
    clock.rotation.x = Math.PI / 2;
    clock.position.set(0, 5.2, 3.82);
    g.add(clock);

    for (let x = -5.5; x <= 5.5; x += 2.75) {
      if (Math.abs(x) < 1) continue;
      const w1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.14), winMat);
      w1.position.set(x, 2.0, 3.78);
      g.add(w1);
      const w2 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.14), winMat);
      w2.position.set(x, 4.3, 3.78);
      g.add(w2);
    }

    const entrance = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.3), SC.makeToonMat(0x7c5333));
    entrance.position.set(0, 1.3, 3.76);
    g.add(entrance);

    [-3.4, 3.4].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.8), SC.makeToonMat(0xd4ccb8));
      pillar.position.set(px, 1.2, 7.5);
      pillar.castShadow = true;
      g.add(pillar);
    });

    const sc = document.createElement('canvas');
    sc.width = 512; sc.height = 110;
    const ctx = sc.getContext('2d');
    ctx.fillStyle = '#fdf6e7';
    ctx.fillRect(0, 0, 512, 110);
    ctx.strokeStyle = '#8a3e3b';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 98);
    ctx.fillStyle = '#3d2c1e';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏫 SAKURA ELEMENTARY', 256, 68);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.9, 0.18),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc) })
    );
    sign.position.set(0, 3.1, 3.92);
    g.add(sign);

    scene.add(g);
    addCollider(0, -32, 8.2, 4.0);

    SC.world.zones.push({
      id: 'school',
      label: 'Enter Sakura Elementary Quiz',
      pos: new THREE.Vector3(0, 0, -24.5),
      radius: 4.0
    });
  }

  function buildHiddenCats(scene) {
    const catDefs = [
      { id: 'cat_mikan', name: 'Mikan (Orange Tabby)', pos: new THREE.Vector3(5.4, 0, 6.2), color: 0xe89643, accent: 0xfff3d6 },
      { id: 'cat_kuro', name: 'Kuro (Midnight Cat)', pos: new THREE.Vector3(-6.4, 0, 12.2), color: 0x2a2d36, accent: 0xffd166 },
      { id: 'cat_yuki', name: 'Yuki (Snowball)', pos: new THREE.Vector3(-7.0, 0, -19.5), color: 0xfaf7f2, accent: 0xffa6c1 },
      { id: 'cat_sakura', name: 'Sakura (Calico)', pos: new THREE.Vector3(7.6, 0, -15.2), color: 0xf4b678, accent: 0x4a3525 },
      { id: 'cat_tama', name: 'Tama (Schoolyard Cat)', pos: new THREE.Vector3(5.6, 0, -26.8), color: 0x8b95a5, accent: 0xffffff }
    ];

    catDefs.forEach(cd => {
      const alreadyFound = SC.state.foundCats && SC.state.foundCats.includes(cd.id);
      const g = new THREE.Group();
      g.position.copy(cd.pos);

      const fur = SC.makeToonMat(cd.color);
      const acc = SC.makeToonMat(cd.accent);

      const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), fur);
      body.scale.set(1.25, 0.78, 0.95);
      body.position.y = 0.2;
      body.castShadow = true;
      g.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), fur);
      head.position.set(0.22, 0.34, 0);
      g.add(head);

      [-0.08, 0.08].forEach(ez => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.13, 5), acc);
        ear.position.set(0.24, 0.5, ez);
        g.add(ear);
      });

      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.34, 6), fur);
      tail.position.set(-0.28, 0.34, 0);
      tail.rotation.z = 0.65;
      g.add(tail);

      const mc = document.createElement('canvas');
      mc.width = 128; mc.height = 128;
      const mctx = mc.getContext('2d');
      mctx.fillStyle = 'rgba(255, 248, 225, 0.95)';
      mctx.beginPath();
      mctx.arc(64, 64, 52, 0, Math.PI * 2);
      mctx.fill();
      mctx.strokeStyle = '#e07a34';
      mctx.lineWidth = 8;
      mctx.stroke();
      mctx.font = 'bold 54px sans-serif';
      mctx.textAlign = 'center';
      mctx.fillText('🐾', 64, 82);
      const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(mc), transparent: true }));
      marker.scale.set(0.75, 0.75, 1);
      marker.position.set(0.1, 1.05, 0);
      marker.visible = !alreadyFound;
      g.add(marker);

      scene.add(g);

      SC.world.hiddenCats.push({
        id: cd.id,
        name: cd.name,
        mesh: g,
        marker,
        tail,
        found: alreadyFound
      });

      if (!alreadyFound) {
        SC.world.zones.push({
          id: 'cat:' + cd.id,
          label: 'Pet ' + cd.name + ' (+35c)',
          pos: cd.pos.clone(),
          radius: 2.3
        });
      }
    });
  }

  // Pocket Park with working Slide, Swing, and Hopscotch grid (East side near z=11..16.5)
  function buildPocketPark(scene) {
    const pad = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 7.6),
      SC.makeToonMat(0x95d47a)
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(8.2, 0.015, 13.8);
    pad.receiveShadow = true;
    scene.add(pad);

    // Slide at (7.8, 0, 13.6 -> 16.2)
    const slideG = new THREE.Group();
    slideG.position.set(7.8, 0, 14.8);
    const slideBlue = SC.makeToonMat(0x3b82f6);
    const ladderMat = SC.makeToonMat(0xf59e0b);

    const platform = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 1.1), slideBlue);
    platform.position.set(0, 1.55, -0.85);
    platform.castShadow = true;
    slideG.add(platform);

    [-0.5, 0.5].forEach(lx => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.56, 8), ladderMat);
      post.position.set(lx, 0.78, -1.32);
      slideG.add(post);
    });
    for (let ry = 0.35; ry <= 1.4; ry += 0.35) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), ladderMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, ry, -1.32);
      slideG.add(rung);
    }

    const chute = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 2.35), slideBlue);
    chute.position.set(0, 0.84, 0.55);
    chute.rotation.x = 0.54;
    chute.castShadow = true;
    slideG.add(chute);

    scene.add(slideG);
    addCollider(7.8, 14.8, 0.65, 1.45);

    SC.world.zones.push({
      id: 'park_slide',
      label: 'Ride the Park Slide',
      pos: new THREE.Vector3(7.2, 0, 14.5),
      radius: 2.3
    });

    // Swing Set at (8.8, 0, 11.4)
    const swingG = new THREE.Group();
    swingG.position.set(8.8, 0, 11.4);
    const frameMat = SC.makeToonMat(0x8b5a2b);

    [-0.85, 0.85].forEach(sz => {
      const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8), frameMat);
      legA.position.set(-0.5, 1.12, sz);
      legA.rotation.z = 0.22;
      const legB = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8), frameMat);
      legB.position.set(0.5, 1.12, sz);
      legB.rotation.z = -0.22;
      swingG.add(legA, legB);
    });

    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 8), frameMat);
    topBar.rotation.x = Math.PI / 2;
    topBar.position.set(0, 2.15, 0);
    swingG.add(topBar);

    const pivot = new THREE.Group();
    pivot.position.set(0, 2.12, 0);
    const ropeMat = SC.makeToonMat(0xd6c7b2);
    [-0.24, 0.24].forEach(rz => {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.55, 6), ropeMat);
      rope.position.set(0, -0.78, rz);
      pivot.add(rope);
    });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.07, 0.62), SC.makeToonMat(0xef4444));
    seat.position.set(0, -1.56, 0);
    pivot.add(seat);
    swingG.add(pivot);
    SC.world.swingPivot = pivot;

    scene.add(swingG);
    addCollider(8.8, 11.4, 0.75, 1.15);

    SC.world.zones.push({
      id: 'park_swing',
      label: 'Swing Together on the Swing',
      pos: new THREE.Vector3(8.0, 0, 11.4),
      radius: 2.3
    });

    // Hopscotch Grid on ground at (6.2, 0.03, 15.0)
    const hopC = document.createElement('canvas');
    hopC.width = 256; hopC.height = 512;
    const hctx = hopC.getContext('2d');
    hctx.clearRect(0, 0, 256, 512);
    hctx.strokeStyle = '#fff9eb';
    hctx.lineWidth = 8;
    hctx.fillStyle = '#fff9eb';
    hctx.font = 'bold 42px sans-serif';
    hctx.textAlign = 'center';

    const cells = [
      [64, 410, '1'], [192, 410, '2'],
      [128, 310, '3'],
      [64, 210, '4'], [192, 210, '5'],
      [128, 110, '6']
    ];
    cells.forEach(cell => {
      hctx.strokeRect(cell[0] - 46, cell[1] - 46, 92, 92);
      hctx.fillText(cell[2], cell[0], cell[1] + 15);
    });
    const hopMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 3.0),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(hopC), transparent: true })
    );
    hopMesh.rotation.x = -Math.PI / 2;
    hopMesh.position.copy(SC.world.hopscotchPos);
    scene.add(hopMesh);

    SC.world.zones.push({
      id: 'park_hopscotch',
      label: 'Play Hopscotch (+20c)',
      pos: new THREE.Vector3(6.2, 0, 15.0),
      radius: 2.2
    });
  }

  function buildStreetDetails(scene) {
    // Interactive Blue Gachapon (Capsule Toy) Vending Machine at (-5.8, 0, -15.6)
    const vm = new THREE.Group();
    vm.position.set(-5.8, 0, -15.6);
    const vmBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.0, 0.78), SC.makeToonMat(0x2563eb));
    vmBody.position.y = 1.0;
    vmBody.castShadow = true;
    vm.add(vmBody);
    const vmGlow = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.95, 0.08), new THREE.MeshBasicMaterial({ color: 0xffe082 }));
    vmGlow.position.set(0, 1.32, 0.38);
    vm.add(vmGlow);
    const vmAccent = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.32, 0.8), SC.makeToonMat(0xf43f5e));
    vmAccent.position.y = 0.25;
    vm.add(vmAccent);
    scene.add(vm);
    addCollider(-5.8, -15.6, 0.7, 0.6);

    SC.world.zones.push({
      id: 'gachapon',
      label: 'Spin Capsule Toy Machine (15c)',
      pos: new THREE.Vector3(-4.5, 0, -15.6),
      radius: 2.8
    });

    // Interactive Japanese Drink & Snack Vending Machine (Melon Soda, Strawberry Milk, Taiyaki) at (-5.8, 0, -13.6)
    const drinkVm = new THREE.Group();
    drinkVm.position.set(-5.8, 0, -13.6);
    const dBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.95, 0.74), SC.makeToonMat(0xef4444));
    dBody.position.y = 0.98;
    dBody.castShadow = true;
    drinkVm.add(dBody);
    const dWindow = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.86, 0.08), new THREE.MeshBasicMaterial({ color: 0xa7f3d0 }));
    dWindow.position.set(0, 1.3, 0.36);
    drinkVm.add(dWindow);
    scene.add(drinkVm);
    addCollider(-5.8, -13.6, 0.68, 0.58);

    SC.world.zones.push({
      id: 'drink_vending',
      label: 'Japanese Drink & Snack Machine',
      pos: new THREE.Vector3(-4.5, 0, -13.6),
      radius: 2.6
    });

    // Clubhouse Room Zone outside Laila & Salma's Room (-11.8, -1.5 -> sidewalk at -6.2, -1.5)
    SC.world.zones.push({
      id: 'clubhouse',
      label: "Enter Laila & Salma's Room",
      pos: new THREE.Vector3(-6.2, 0, -1.5),
      radius: 3.1
    });

    // Fetch / Tag Ball mesh
    const ballMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 10),
      SC.makeToonMat(0xffbe0b)
    );
    ballMesh.position.set(-2.5, 0.14, -5.2);
    ballMesh.visible = false;
    scene.add(ballMesh);
    SC.world.mochiBall = ballMesh;

    const bike = new THREE.Group();
    bike.position.set(-4.8, 0, 5.5);
    bike.rotation.y = 0.25;
    const wheelMat = SC.makeToonMat(0x2c2c2c);
    const frameMat = SC.makeToonMat(0x52a69a);
    [-0.52, 0.52].forEach(wz => {
      const w = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 8, 16), wheelMat);
      w.position.set(0, 0.34, wz);
      w.rotation.y = Math.PI / 2;
      bike.add(w);
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.05), frameMat);
    frame.position.set(0, 0.55, 0);
    bike.add(frame);
    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.26), SC.makeToonMat(0x9a6d40));
    basket.position.set(0, 0.78, -0.52);
    bike.add(basket);
    scene.add(bike);

    const poleMat = SC.makeToonMat(0x5a5650);
    const polePositions = [[-5.6, 12], [-5.6, -6], [-5.6, -22], [5.6, 4], [5.6, -16]];
    polePositions.forEach(p => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 8.6, 8), poleMat);
      pole.position.set(p[0], 4.3, p[1]);
      pole.castShadow = true;
      scene.add(pole);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.12), poleMat);
      bar.position.set(p[0], 7.8, p[1]);
      scene.add(bar);
    });

    const lineMat = new THREE.LineBasicMaterial({ color: 0x2f2f35 });
    for (let i = 0; i < 2; i++) {
      const p1 = new THREE.Vector3(-5.6, 7.8, polePositions[i][1]);
      const p2 = new THREE.Vector3(-5.6, 7.8, polePositions[i + 1][1]);
      const mid = p1.clone().lerp(p2, 0.5);
      mid.y -= 0.75;
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(12));
      scene.add(new THREE.Line(geo, lineMat));
    }
  }

  SC.buildWorld = function (scene) {
    const skyGeo = new THREE.SphereGeometry(165, 24, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      map: SC.createSkyTexture(SC.state.timeMode),
      side: THREE.BackSide
    });
    SC.world.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(SC.world.skyMesh);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 240),
      SC.makeToonMat(0x7ab862)
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(8.6, 78),
      new THREE.MeshLambertMaterial({ map: SC.createRoadTexture() })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.02, -6);
    road.receiveShadow = true;
    scene.add(road);

    const swMat = SC.makeToonMat(0xd6cfc2);
    [-5.3, 5.3].forEach(sx => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 78), swMat);
      sw.position.set(sx, 0.07, -6);
      sw.receiveShadow = true;
      scene.add(sw);
    });

    buildHouse(scene, -11.8, 12, Math.PI / 2, '#f5ebd6', '#46566b');
    buildHouse(scene, -11.8, -1.5, Math.PI / 2, '#ffe8ef', '#c94c79', { clubhouseSign: true, doorColor: 0xe05780 });
    buildHouse(scene, -11.8, -19.5, Math.PI / 2, '#eef2e6', '#3f5954');
    buildHouse(scene, 11.8, 10, -Math.PI / 2, '#f7ece0', '#4f5a6e');
    buildHouse(scene, 11.8, -19, -Math.PI / 2, '#f2e6d0', '#5e4959');

    buildIchibanRamen(scene);
    buildBoutiqueKiosk(scene);
    buildSakuraSchool(scene);
    buildHiddenCats(scene);
    buildPocketPark(scene);

    buildStreetDetails(scene);
    buildTree(scene, -7.2, 5.2, false, 1.15);
    buildTree(scene, 7.2, 2.8, true, 1.15);
    buildTree(scene, -7.4, -7.2, true, 1.0);
    buildTree(scene, 7.6, -13.2, false, 1.1);
    buildTree(scene, -6.5, -26.0, true, 1.25);
    buildTree(scene, 6.5, -26.0, true, 1.25);

    const hillMat = SC.makeToonMat(0x5e9c68);
    const hillData = [
      [-45, -72, 34, 18], [0, -82, 42, 24], [48, -70, 36, 19],
      [-70, -10, 32, 16], [70, -12, 34, 17]
    ];
    hillData.forEach(h => {
      const hill = new THREE.Mesh(new THREE.SphereGeometry(h[2], 16, 12), hillMat);
      hill.scale.set(1.4, h[3] / h[2], 1.0);
      hill.position.set(h[0], -2, h[1]);
      scene.add(hill);
    });

    const pCount = 90;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 34;
      pPos[i * 3 + 1] = 1 + Math.random() * 11;
      pPos[i * 3 + 2] = -32 + Math.random() * 52;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffc0d6, size: 0.18, transparent: true, opacity: 0.9 });
    SC.world.petals = new THREE.Points(pGeo, pMat);
    scene.add(SC.world.petals);
  };

  SC.updateWorldAnimations = function (dt, elapsed) {
    SC.world.norenPanels.forEach(n => {
      n.mesh.rotation.z = Math.sin(elapsed * 2.1 + n.phase) * 0.08;
    });

    SC.world.hiddenCats.forEach((cat, idx) => {
      if (cat.tail) cat.tail.rotation.x = Math.sin(elapsed * 3.2 + idx) * 0.25;
      if (cat.marker && !cat.found) {
        cat.marker.position.y = 1.02 + Math.sin(elapsed * 3.0 + idx) * 0.12;
      }
    });

    if (SC.world.swingPivot) {
      if (SC.runtime.parkActivity && SC.runtime.parkActivity.type === 'swing') {
        SC.world.swingPivot.rotation.x = Math.sin(elapsed * 4.5) * 0.58;
      } else {
        SC.world.swingPivot.rotation.x *= 0.9;
      }
    }

    if (SC.world.petals) {
      const pos = SC.world.petals.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - dt * 0.65;
        let x = pos.getX(i) + Math.sin(elapsed + i) * dt * 0.35;
        if (y < 0.2) {
          y = 11.5;
          x = (Math.random() - 0.5) * 34;
        }
        pos.setXY(i, x, y);
      }
      pos.needsUpdate = true;
    }
  };
})(window.FirstAdventureTokyo);
