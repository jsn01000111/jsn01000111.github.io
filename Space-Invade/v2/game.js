(function(){
  if(window.__spaceInvadeActive){
    alert("Game already running!");
    return;
  }
  window.__spaceInvadeActive = true;

  // --- Utility Functions for Fullscreen & Haptics ---
  function requestFullscreen(element) {
      if (!element) element = document.documentElement;
      if (element.requestFullscreen) {
          element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
      }
  }

  function exitFullscreen() {
      if (document.exitFullscreen) {
          document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
          element.msExitFullscreen();
      }
  }

  function triggerHaptic(ms) {
    try {
      if (window.SpaceInvadeAndroid && window.SpaceInvadeAndroid.vibrate) {
        window.SpaceInvadeAndroid.vibrate(ms);
      } else if (navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch (e) {}
  }

  // -------------------------------------------------
  // Mixed Enemy Roster: Space Invaders + Space Impact
  // -------------------------------------------------
  const ENEMY_BITMAPS = {
    // Space Invaders Classics
    octopus: [
      [
        "....####....",
        "..########..",
        ".##########.",
        "###ee##ee###",
        "############",
        "..###..###..",
        ".##..##..##.",
        "##........##",
        "............",
        "............"
      ],
      [
        "....####....",
        "..########..",
        ".##########.",
        "###ee##ee###",
        "############",
        "...##..##...",
        "..##.##.##..",
        "...##..##...",
        "............",
        "............"
      ]
    ],
    crab: [
      [
        "..#......#..",
        "...#....#...",
        "..########..",
        ".##ee##ee##.",
        "############",
        "#.########.#",
        "#.#......#.#",
        "...##..##...",
        "............",
        "............"
      ],
      [
        "..#......#..",
        "#..#....#..#",
        "#.########.#",
        "###ee##ee###",
        ".##########.",
        "..########..",
        "..#......#..",
        ".#........#.",
        "............",
        "............"
      ]
    ],
    squid: [
      [
        ".....##.....",
        "....####....",
        "...######...",
        "..##e##e##..",
        "..########..",
        "...#.##.#...",
        "..#..##..#..",
        ".#.#....#.#.",
        "............",
        "............"
      ],
      [
        ".....##.....",
        "....####....",
        "...######...",
        "..##e##e##..",
        "..########..",
        "....#..#....",
        "...#.##.#...",
        "..#......#..",
        "............",
        "............"
      ]
    ],
    ufo: [
      [
        "....####....",
        "..########..",
        ".##########.",
        "##w##w##w###",
        "############",
        "..###..###..",
        "...#....#...",
        "............",
        "............",
        "............"
      ],
      [
        "....####....",
        "..########..",
        ".##########.",
        "###w##w##w##",
        "############",
        "..###..###..",
        "..#......#..",
        "............",
        "............",
        "............"
      ]
    ],
    // Space Impact Biomechanicals
    dart: [
      [
        "........###.",
        "......#####.",
        "...########.",
        ".#######ww##",
        "###########.",
        ".#######ww##",
        "...########.",
        "......#####.",
        "........###.",
        "............"
      ],
      [
        ".......###..",
        ".....#####..",
        "...########.",
        ".#######ww##",
        "############",
        ".#######ww##",
        "...########.",
        ".....#####..",
        ".......###..",
        "............"
      ]
    ],
    jelly: [
      [
        "....#####...",
        "..#########.",
        ".###w###w###",
        "############",
        "############",
        ".##########.",
        "..##.##.##..",
        ".#...##...#.",
        "............",
        "............"
      ],
      [
        "...#######..",
        "..#########.",
        ".###w###w###",
        "############",
        ".##########.",
        "..########..",
        "...##..##...",
        "..#......#..",
        "............",
        "............"
      ]
    ],
    pod: [
      [
        "...######...",
        ".##########.",
        "##ww####ww##",
        "############",
        "###rrrrrr###",
        "############",
        "##ww####ww##",
        ".##########.",
        "...######...",
        "............"
      ],
      [
        "...######...",
        ".##########.",
        "##ww####ww##",
        "############",
        "###wwwwww###",
        "############",
        "##ww####ww##",
        ".##########.",
        "...######...",
        "............"
      ]
    ],
    spikemine: [
      [
        ".....##.....",
        "..#..##..#..",
        "...######...",
        ".##########.",
        "####rrrr####",
        ".##########.",
        "...######...",
        "..#..##..#..",
        ".....##.....",
        "............"
      ],
      [
        "....####....",
        ".#..####..#.",
        "..########..",
        "############",
        "####wwww####",
        "############",
        "..########..",
        ".#..####..#.",
        "....####....",
        "............"
      ]
    ],
    wasp: [
      [
        ".....###....",
        "...#####....",
        "..#######...",
        "###ww#######",
        "############",
        "###ww#######",
        "..#######...",
        "...#####....",
        ".....###....",
        "............"
      ],
      [
        "....###.....",
        "....#####...",
        "..#######...",
        "###ww#######",
        "############",
        "###ww#######",
        "..#######...",
        "....#####...",
        "....###.....",
        "............"
      ]
    ]
  };

  const SPACE_INVADER_SPRITES = new Set(['octopus', 'crab', 'squid', 'ufo']);

  const ENEMY_SPRITES = {};
  for (const key in ENEMY_BITMAPS) {
    ENEMY_SPRITES[key] = (ctx, x, y, w, h, color = "#f00") => {
      const frame = Math.floor(performance.now() / 320) % 2;
      const rows = ENEMY_BITMAPS[key][frame];
      const cw = w / 12, ch = h / 10;
      for (let r = 0; r < 10; r++) {
        const row = rows[r];
        for (let c = 0; c < 12; c++) {
          const k = row[c];
          if (k === '.') continue;
          ctx.fillStyle = k === '#' ? color : (k === 'w' ? '#fff' : (k === 'r' ? '#f33' : '#111'));
          ctx.fillRect(x + c * cw, y + r * ch, cw + 0.25, ch + 0.25);
        }
      }
    };
  }

  // Player Sprite (16x16 bitmap mirrored top/bottom)
  const PLAYER_ROWS = [
    "................",
    "..d.............",
    "..dd............",
    "..ddd#..........",
    "..d######.......",
    "yy.#########....",
    ".y.dd###########",
    "yyd#####ccc#####"
  ];
  const PLAYER_COLORS = { '#': '#0f0', 'd': '#0a0', 'c': '#0ff', 'y': '#ff0' };
  const PLAYER_SPRITE = (ctx, x, y, w, h) => {
    const cw = w / 16, ch = h / 16;
    for (let r = 0; r < 16; r++) {
      const row = PLAYER_ROWS[r < 8 ? r : 15 - r];
      for (let c = 0; c < 16; c++) {
        const k = row[c];
        if (k === '.') continue;
        ctx.fillStyle = PLAYER_COLORS[k];
        ctx.fillRect(x + c * cw, y + r * ch, cw + 0.3, ch + 0.3);
      }
    }
  };

  // Boss Sprites (20x10 bitmaps mirrored top/bottom)
  const BOSS_ROWS = {
    // Redesigned Stage 1 Boss: Twin-Prong Interceptor with swept wings & glowing core
    Sentinel:[
      "..........####......",
      "........########....",
      "......#####..#####..",
      "....######....####..",
      "..#######..ww..###..",
      ".#########wwww####..",
      "####..############..",
      "..###...#######rrr..",
      "....###..#####rrrr..",
      "......########rrrr.."],
    Interceptor:[
      "...............###..",
      "..............####..",
      "............######..",
      "..........########..",
      "........##########..",
      "......#########ww...",
      "....############w...",
      "..##############rr..",
      "###########w######..",
      "###################."],
    Cruiser:[
      "....................",
      ".......##...##......",
      ".......##...##......",
      "......####.####.....",
      "..################..",
      ".##################.",
      "####www#########www#",
      "###################.",
      "####rr##########rr##",
      ".#################.."],
    Dreadnought:[
      "....................",
      "####................",
      "####.##############.",
      "..#.################",
      "####.##ww########ww.",
      "....################",
      "###.######rr########",
      "###.################",
      "....######rr########",
      "####################"],
    Overlord:[
      "..##............##..",
      "..###..........###..",
      "...####......####...",
      "...##############...",
      "..################..",
      "..###rrr###########.",
      "..###rrr###########.",
      "..################..",
      "...#.#.#.#.#.#####..",
      "....#.#.#.#.######.."],
    Core:[
      "........########....",
      "......############..",
      "....##....wwww....##",
      "...##..############.",
      "..##..####....####..",
      ".##..###..rrrr..###.",
      ".##.###..rrrrrr..##.",
      "###.##..rrrrrrrr.###",
      "###.##..rrrrrrrr.###",
      "###.##..rrrrrrrr.###"],
    Crawler:[
      "...#...#...#...#....",
      "..##..##..##..##....",
      ".####.####.####.####",
      "..################..",
      ".##################.",
      "###.rr###########...",
      "###.################",
      ".####wwww###########",
      "..##################",
      "...#################"]
  };

  const makeBossSprite = (rows) => (ctx, x, y, w, h, col, flash) => {
    const cw = w / 20, ch = h / 20;
    for (let r = 0; r < 20; r++) {
      const row = rows[r < 10 ? r : 19 - r];
      let c = 0;
      while (c < 20) {
        const k = row[c];
        if (k === '.') { c++; continue; }
        let end = c;
        while (end + 1 < 20 && row[end + 1] === k) end++;
        ctx.fillStyle = flash ? "#fff" : (k === '#' ? col : k === 'w' ? "#fff" : "#f33");
        ctx.fillRect(x + c * cw, y + r * ch, (end - c + 1) * cw + 0.3, ch + 0.3);
        c = end + 1;
      }
    }
  };

  const BOSS_SPRITES = {};
  for (const name in BOSS_ROWS) BOSS_SPRITES[name] = makeBossSprite(BOSS_ROWS[name]);

  BOSS_SPRITES.Serpent = (ctx, x, y, w, h, col, flash, b) => {
    if (!b || !b.rects) return;
    for (let k = b.rects.length - 1; k >= 0; k--) {
      const r = b.rects[k];
      ctx.fillStyle = flash ? "#fff" : (k % 2 === 0 ? col : "#1a7a1a");
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = flash ? "#ddd" : "#0a3a0a";
      ctx.fillRect(r.x + 2, r.y + 2, Math.max(1, r.w - 4), 1);
      if (k === 0 && !flash) {
        ctx.fillStyle = "#f33";
        ctx.fillRect(r.x + 3, r.y + 3, 3, 3);
        ctx.fillRect(r.x + 3, r.y + r.h - 6, 3, 3);
        ctx.fillStyle = "#fff";
        ctx.fillRect(r.x - 2, r.y + 5, 2, 2);
        ctx.fillRect(r.x - 2, r.y + r.h - 7, 2, 2);
      }
    }
  };

  const drawCoreHull = makeBossSprite(BOSS_ROWS.Core);
  BOSS_SPRITES.Core = (ctx, x, y, w, h, col, flash, b) => {
    const phaseCol = !b ? col : (b.phase === 3 ? "#f33" : b.phase === 2 ? "#fc0" : col);
    drawCoreHull(ctx, x, y, w, h, phaseCol, flash);
    if (!b || !b.eyes || flash) return;
    const blink = Math.floor(performance.now() / 120) % 2 === 0;
    for (const e of b.eyes) {
      if (e.open) {
        ctx.fillStyle = blink ? "#fff" : "#ff8";
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = "#f00";
        ctx.fillRect(e.x + e.w / 2 - 2, e.y + e.h / 2 - 2, 4, 4);
      } else {
        ctx.fillStyle = "#334";
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 1;
        ctx.strokeRect(e.x + 0.5, e.y + 0.5, e.w - 1, e.h - 1);
      }
    }
  };

  const BOSS_GRAPHICS = BOSS_SPRITES;

  // -------------------------------------------------
  // Background Themes & Planet Styles
  // -------------------------------------------------
  const BG_THEMES = [
    { name: 'STAGE AUTO',   bg: null,      planet: 'ringed',   pCol: null,        ring: true,  grid: false },
    { name: 'RINGED GAS',   bg: '#101828', planet: 'ringed',   pCol: [70,180,255],ring: true,  grid: false },
    { name: 'CRIMSON MARS', bg: '#281010', planet: 'cratered', pCol: [255,95,65], ring: false, grid: false },
    { name: 'CYBER GRID',   bg: '#081e1a', planet: 'cyber',    pCol: [40,255,190],ring: true,  grid: true  },
    { name: 'NEBULA VOID',  bg: '#1e0e2c', planet: 'nebula',   pCol: [215,90,255],ring: false, grid: false },
    { name: 'ICE TITAN',    bg: '#0c1c26', planet: 'ice',      pCol: [130,235,255],ring: true, grid: false }
  ];

  // -------------------------------------------------
  // Core Game Initialization Function
  // -------------------------------------------------
  function startSpaceInvadeGame() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 240;
    canvas.height = 120;

    Object.assign(canvas.style, {
      position: "fixed", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      width: "100vw", height: "auto", maxHeight: "100vh",
      imageRendering: "pixelated", background: "black", zIndex: 999999
    });
    document.body.appendChild(canvas);
    document.body.style.overflow = "hidden";

    function applyDisplayFilter() {
      if (settings.nokiaMode) {
        canvas.style.filter = "grayscale(1) sepia(1) hue-rotate(42deg) saturate(3.2) contrast(1.25) brightness(0.92)";
      } else {
        canvas.style.filter = "saturate(1.25) contrast(1.08)";
      }
    }

    // Native CRT vignette & damage flash overlays
    const crtOverlay = document.createElement("div");
    crtOverlay.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:1000001;" +
      "background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55) 100%)," +
      "repeating-linear-gradient(0deg,rgba(0,0,0,.16) 0,rgba(0,0,0,.16) 1px,transparent 1px,transparent 3px)";
    const damageFlashOverlay = document.createElement("div");
    damageFlashOverlay.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:1000002;opacity:0;" +
      "background:radial-gradient(ellipse at center,rgba(255,0,0,0) 40%,rgba(255,0,0,.65) 100%)";
    document.body.append(crtOverlay, damageFlashOverlay);

    // Native Visual FX state
    const fxState = {
      glow: true,
      particles: [],
      rings: [],
      floatingTexts: [],
      trauma: 0,
      flash: 0
    };

    function hexToRgb(hex) {
      const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [26, 26, 26];
    }

    function activeTheme() {
      return BG_THEMES[settings.bgTheme] || BG_THEMES[0];
    }

    function activeBgColor() {
      const th = activeTheme();
      return th.bg || currentStageData.bgColor;
    }

    function spawnParticles(x, y, count, colors, speed) {
      for (let i = 0; i < count && fxState.particles.length < 320; i++) {
        const a = Math.random() * 6.283;
        const s = (0.4 + Math.random()) * speed;
        fxState.particles.push({
          x, y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 0,
          maxLife: 18 + Math.random() * 16,
          color: colors[i % colors.length],
          size: Math.random() < 0.3 ? 2 : 1
        });
      }
    }

    function spawnFloatingText(x, y, text, color = "#ff0") {
      if (fxState.floatingTexts.length > 24) fxState.floatingTexts.shift();
      fxState.floatingTexts.push({ x, y, text, color, life: 36, maxLife: 36 });
    }

    function triggerExplosionFx(x, y) {
      spawnParticles(x, y, 14, ['#fff', '#ff0', '#fa0', '#f50'], 1.6);
      fxState.rings.push({ x, y, r: 2, alpha: 1 });
      fxState.trauma = Math.min(1, fxState.trauma + 0.18);
    }

    function triggerDamageFx() {
      fxState.flash = 1;
      fxState.trauma = Math.min(1, fxState.trauma + 0.5);
    }

    function updateScreenEffects() {
      fxState.trauma *= 0.9;
      fxState.flash *= 0.88;
      const shake = fxState.trauma * fxState.trauma * 7;
      canvas.style.translate = fxState.trauma > 0.01
        ? ((Math.random() - 0.5) * shake) + "px " + ((Math.random() - 0.5) * shake) + "px"
        : "";
      damageFlashOverlay.style.opacity = fxState.flash < 0.02 ? "0" : String(fxState.flash);
    }

    // Space Impact scrolling horizon terrain silhouette
    const STAGE_TERRAINS = [
      [3, 5, 8, 4, 2, 6, 9, 5, 3, 2, 7, 4],
      [2, 3, 4, 3, 2, 1, 2, 4, 5, 3, 2, 1],
      [8, 6, 4, 7, 9, 5, 3, 6, 8, 4, 5, 7],
      [4, 4, 8, 8, 3, 3, 9, 9, 2, 2, 6, 6],
      [2, 5, 2, 7, 2, 4, 1, 6, 2, 5, 3, 2],
      [3, 7, 9, 6, 3, 8, 10, 5, 2, 6, 8, 4],
      [5, 2, 8, 3, 9, 1, 7, 2, 8, 4, 6, 2],
      [5, 5, 5, 9, 9, 5, 5, 7, 7, 5, 5, 9]
    ];

    function drawHorizonTerrain(t, stageIdx, bgHex) {
      const th = activeTheme();
      const profile = STAGE_TERRAINS[stageIdx % STAGE_TERRAINS.length];
      const segW = 20;
      const scroll = (t * 0.025) % segW;
      const c = hexToRgb(bgHex);
      ctx.fillStyle = `rgb(${Math.max(4, c[0] - 10)},${Math.max(4, c[1] - 10)},${Math.max(4, c[2] - 10)})`;
      const baseIdx = Math.floor((t * 0.025) / segW);
      for (let i = -1; i <= 13; i++) {
        const h = profile[(baseIdx + i + profile.length * 100) % profile.length];
        const x = i * segW - scroll;
        ctx.fillRect(x, 120 - h, segW + 0.5, h);
      }
      ctx.fillStyle = th.grid ? "rgba(40,255,190,0.28)" : "rgba(255,255,255,0.06)";
      for (let i = -1; i <= 13; i++) {
        const h = profile[(baseIdx + i + profile.length * 100) % profile.length];
        const x = i * segW - scroll;
        ctx.fillRect(x, 120 - h, segW + 0.5, 1);
      }
    }

    function drawSpaceBackdrop(t, bgHex, dt, verticalScroll = false) {
      const th = activeTheme();
      const c = hexToRgb(bgHex);
      const b = th.pCol || c.map(v => Math.min(255, v * 4 + 40));
      const W = canvas.width, H = canvas.height;
      ctx.save();

      if (th.grid) {
        ctx.strokeStyle = 'rgba(40,255,190,0.10)';
        ctx.lineWidth = 1;
        const step = 15;
        const off = (t * 0.025) % step;
        if (verticalScroll) {
          for (let gx = 0; gx <= W; gx += step) {
            ctx.beginPath(); ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, H); ctx.stroke();
          }
          for (let gy = off - step; gy <= H; gy += step) {
            ctx.beginPath(); ctx.moveTo(0, gy + 0.5); ctx.lineTo(W, gy + 0.5); ctx.stroke();
          }
        } else {
          for (let gx = -off; gx <= W; gx += step) {
            ctx.beginPath(); ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, H); ctx.stroke();
          }
          for (let gy = 0; gy <= H; gy += step) {
            ctx.beginPath(); ctx.moveTo(0, gy + 0.5); ctx.lineTo(W, gy + 0.5); ctx.stroke();
          }
        }
      }

      for (let i = 0; i < 3; i++) {
        const x = (W / 2) + Math.sin(t * 0.00007 * (i + 1) + i * 2) * (W * 0.45);
        const y = (H / 2) + Math.cos(t * 0.00009 * (i + 1) + i) * (H * 0.38);
        const col = [b[i % 3], b[(i + 1) % 3], b[(i + 2) % 3]].join(',');
        const g = ctx.createRadialGradient(x, y, 0, x, y, 65);
        g.addColorStop(0, 'rgba(' + col + ',.22)');
        g.addColorStop(1, 'rgba(' + col + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      const px = verticalScroll ? (W * 0.72) : ((W + 40) - ((t * 0.004) % (W + 120)));
      const py = verticalScroll ? (-30 + ((t * 0.004) % (H + 90))) : (H * 0.68);
      const col = b.join(',');
      const rad = W < 160 ? 18 : 26;
      const pg = ctx.createRadialGradient(px - rad * 0.3, py - rad * 0.3, 2, px, py, rad);
      pg.addColorStop(0, 'rgba(' + col + ',.62)');
      pg.addColorStop(1, 'rgba(0,0,0,.78)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, 6.283);
      ctx.fill();

      if (th.planet === 'cratered') {
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.beginPath(); ctx.arc(px - rad * 0.3, py - rad * 0.1, rad * 0.22, 0, 6.283); ctx.fill();
        ctx.beginPath(); ctx.arc(px + rad * 0.25, py + rad * 0.25, rad * 0.18, 0, 6.283); ctx.fill();
      } else if (th.planet === 'cyber') {
        ctx.strokeStyle = 'rgba(' + col + ',.45)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(px, py, rad * 0.72, 0, 6.283); ctx.stroke();
      }

      if (th.ring) {
        ctx.strokeStyle = 'rgba(' + col + ',.32)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py, rad * 1.55, rad * 0.32, -0.3, 0, 6.283);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawFxEffects(dt) {
      ctx.save();
      for (let i = fxState.rings.length - 1; i >= 0; i--) {
        const r = fxState.rings[i];
        r.r += 1.4 * dt;
        r.alpha -= 0.045 * dt;
        if (r.alpha <= 0) { fxState.rings.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(255,200,80,' + r.alpha + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, 6.283);
        ctx.stroke();
      }

      for (let i = fxState.particles.length - 1; i >= 0; i--) {
        const p = fxState.particles[i];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.97;
        p.vy *= 0.97;
        if (p.life >= p.maxLife) { fxState.particles.splice(i, 1); continue; }
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();
    }

    function drawFloatingTexts(dt) {
      if (!fxState.floatingTexts.length) return;
      ctx.save();
      ctx.font = "bold 6px monospace";
      ctx.textAlign = "center";
      for (let i = fxState.floatingTexts.length - 1; i >= 0; i--) {
        const ft = fxState.floatingTexts[i];
        ft.life -= dt;
        ft.y -= 0.25 * dt;
        if (ft.life <= 0) { fxState.floatingTexts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, ft.life / (ft.maxLife * 0.5));
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.restore();
    }

    function drawSplitLogo(x, y, sizePx, showTagline) {
      const n = performance.now();
      ctx.save();
      ctx.font = `bold ${sizePx}px monospace`;
      const spaceW = ctx.measureText("SPACE ").width;
      const invadeW = ctx.measureText("INVADE").width;
      const totalW = spaceW + invadeW;
      const startX = x - totalW / 2;

      ctx.textAlign = "left";
      ctx.shadowBlur = 6 + Math.sin(n * 0.004) * 3;
      ctx.shadowColor = "#0f0";
      ctx.fillStyle = "#5f7";
      ctx.fillText("SPACE", startX, y);

      ctx.shadowColor = "#0ff";
      ctx.fillStyle = "#3ef";
      ctx.fillText("INVADE", startX + spaceW, y);

      ctx.shadowBlur = 0;
      if (showTagline) {
        ctx.textAlign = "center";
        ctx.font = "5px monospace";
        ctx.fillStyle = "#8fa";
        ctx.fillText("DEFEND THE GALAXY", x, y + 8);
      }
      ctx.restore();
    }

    // Landscape Attract-Mode background skirmish
    const attractShots = [];
    const attractSparks = [];
    let lastAttractFire = 0;

    function drawAttractSkirmish(t, shipX, shipY, enemyBaseX, enemyBaseY) {
      const shipBob = Math.sin(t * 0.0045) * 8;
      const sy = shipY + shipBob;

      if (t - lastAttractFire > 520) {
        attractShots.push({ x: shipX + 16, y: sy + 7 });
        lastAttractFire = t;
      }

      ctx.fillStyle = "#fa0";
      ctx.fillRect(shipX - 3 - (Math.floor(t / 60) % 3), sy + 7, 3, 2);
      PLAYER_SPRITE(ctx, shipX, sy, 16, 16);

      const invTypes = [
        { sprite: 'squid', color: '#0ff', dy: -13 },
        { sprite: 'pod',   color: '#fa0', dy: 0 },
        { sprite: 'jelly', color: '#f5f', dy: 13 }
      ];
      const invX = enemyBaseX + Math.sin(t * 0.002) * 5;
      const invY = enemyBaseY + Math.cos(t * 0.003) * 4;

      for (let i = 0; i < invTypes.length; i++) {
        const inv = invTypes[i];
        ENEMY_SPRITES[inv.sprite](ctx, invX, invY + inv.dy, 12, 10, inv.color);
      }

      for (let i = attractShots.length - 1; i >= 0; i--) {
        const s = attractShots[i];
        s.x += 2.6;
        ctx.fillStyle = "#0f0";
        ctx.fillRect(s.x, s.y, 4, 1.5);
        if (s.x >= invX) {
          for (let p = 0; p < 7; p++) {
            attractSparks.push({
              x: invX + 4, y: s.y,
              vx: (Math.random() - 0.5) * 2.2,
              vy: (Math.random() - 0.5) * 2.2,
              life: 14,
              color: p % 2 === 0 ? '#ff0' : '#0ff'
            });
          }
          attractShots.splice(i, 1);
        }
      }

      for (let i = attractSparks.length - 1; i >= 0; i--) {
        const sp = attractSparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life--;
        if (sp.life <= 0) { attractSparks.splice(i, 1); continue; }
        ctx.fillStyle = sp.color;
        ctx.fillRect(sp.x, sp.y, 1.5, 1.5);
      }
    }

    // Portrait Home Showcase matching sketch
    const portraitAttractShots = [];
    let lastPortraitAttractFire = 0;

    function drawPortraitHomeShowcase(t) {
      const wobbleX = Math.sin(t * 0.0025) * 4;
      const wobbleY = Math.cos(t * 0.004) * 1.5;
      const rowEnemies = [
        { sprite: 'squid', color: '#0ff', x: 30 },
        { sprite: 'pod',   color: '#fa0', x: 54 },
        { sprite: 'crab',  color: '#3f6', x: 78 }
      ];
      for (const re of rowEnemies) {
        ENEMY_SPRITES[re.sprite](ctx, re.x + wobbleX, 56 + wobbleY, 13, 11, re.color);
      }

      const shipX = 60 + Math.sin(t * 0.003) * 10;
      const shipY = 204;

      if (t - lastPortraitAttractFire > 480) {
        portraitAttractShots.push({ x: shipX - 0.75, y: shipY - 10 });
        lastPortraitAttractFire = t;
      }

      for (let i = portraitAttractShots.length - 1; i >= 0; i--) {
        const s = portraitAttractShots[i];
        s.y -= 1.8;
        ctx.fillStyle = '#0f0';
        ctx.fillRect(s.x, s.y, 1.5, 4);
        if (s.y < 166) {
          portraitAttractShots.splice(i, 1);
        }
      }

      ctx.save();
      ctx.translate(shipX, shipY);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#fa0';
      ctx.fillRect(-11 - (Math.floor(t / 60) % 3), -1, 3, 2);
      PLAYER_SPRITE(ctx, -8, -8, 16, 16);
      ctx.restore();
    }

    // --- Orientation & Canvas Sizing ---
    let started = false, gameOver = false, paused = false;
    let portraitGame = false;
    const isPortrait = () => started ? portraitGame : window.innerHeight > window.innerWidth;

    function lockPlayOrientation() {
      portraitGame = window.innerHeight > window.innerWidth;
      try {
        if (window.SpaceInvadeAndroid && window.SpaceInvadeAndroid.lockOrientation) {
          window.SpaceInvadeAndroid.lockOrientation(portraitGame ? 'portrait' : 'landscape');
        }
      } catch (err) {}
    }

    function unlockMenuOrientation() {
      try {
        if (window.SpaceInvadeAndroid && window.SpaceInvadeAndroid.unlockOrientation) {
          window.SpaceInvadeAndroid.unlockOrientation();
        }
      } catch (err) {}
    }

    function portraitLayout() {
      const portrait = isPortrait();
      const w = portrait ? 120 : 240, h = portrait ? 240 : 120;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      canvas.style.transform = 'translate(-50%, -50%)';
      canvas.style.width = portrait ? 'min(100vw, 50vh)' : 'min(100vw, 200vh)';
      canvas.style.height = 'auto';
      canvas.style.maxHeight = '100vh';
      canvas.style.maxWidth = '100vw';
      return portrait;
    }

    function canvasPoint(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      return {
        x: (clientX - r.left) * canvas.width / r.width,
        y: (clientY - r.top) * canvas.height / r.height
      };
    }

    function gamePoint(clientX, clientY) {
      const p = canvasPoint(clientX, clientY);
      return isPortrait() ? { x: 240 - p.y, y: p.x } : p;
    }

    function portraitKeys(e) {
      if (!isPortrait()) return;
      const map = { ArrowUp: 'ArrowRight', ArrowRight: 'ArrowDown', ArrowDown: 'ArrowLeft', ArrowLeft: 'ArrowUp',
                    KeyW: 'KeyD', KeyD: 'KeyS', KeyS: 'KeyA', KeyA: 'KeyW' };
      if (map[e.code]) Object.defineProperty(e, 'code', { value: map[e.code] });
    }

    portraitLayout();
    window.addEventListener('resize', () => { if (!started) portraitLayout(); });

    let lastEnemySpawn = 0, score = 0, currentStage = 0;
    let touchActive = false;
    let touchOffsetX = 0, touchOffsetY = 0;
    let isSpecialFiring = false;
    let lastFireTime = 0;
    let lastSpecialShot = 0;
    const baseFireCooldown = 125;
    const specialCooldown = 500;
    let movementTouchId = null;
    let lastTime = performance.now();
    let finalScore = 0;

    let continues = 3;
    let stageBannerTimer = 0;
    let muzzleFlashTimer = 0;
    let stageUfoSpawned = false;

    // -------------------------------------------------
    // Meta-Progression: Scrap Currency & Hangar Upgrades
    // -------------------------------------------------
    const META_KEY = 'spaceInvadeMetaV1';
    const meta = {
      scrap: 0,
      upgrades: {
        cannon: 1,
        hull: 1,
        magnet: 1,
        special: 1
      }
    };
    try {
      const savedMeta = JSON.parse(localStorage.getItem(META_KEY) || 'null');
      if (savedMeta && typeof savedMeta === 'object') {
        if (Number.isFinite(savedMeta.scrap) && savedMeta.scrap >= 0) meta.scrap = Math.floor(savedMeta.scrap);
        if (savedMeta.upgrades) {
          for (const k of ['cannon', 'hull', 'magnet', 'special']) {
            const v = savedMeta.upgrades[k];
            if (Number.isInteger(v) && v >= 1 && v <= 4) meta.upgrades[k] = v;
          }
        }
      }
    } catch (e) {}

    function saveMeta() {
      try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {}
    }

    const UPGRADE_COSTS = [0, 60, 150, 320];
    function upgradeCost(key) {
      const lv = meta.upgrades[key];
      return lv >= 4 ? null : UPGRADE_COSTS[lv];
    }

    // -------------------------------------------------
    // Run-Specific Combat State: Combo, Overdrive, Perks
    // -------------------------------------------------
    const combo = { count: 0, mult: 1, timer: 0, maxTimer: 2600 };
    const runPerks = {
      fireRateMult: 1,
      pierce: false,
      wingman: false,
      scrapMult: 1
    };
    let perkChoices = [];
    const perkButtons = [];
    let perkDraftReadyAt = 0;
    const pauseButtons = [];
    let runScrapEarned = 0;

    const PERK_POOL = [
      { id: 'repair',    name: 'REPAIR HULL',  desc: '+1 HEART',         color: '#f55' },
      { id: 'ammo',      name: 'HEAVY AMMO',   desc: '+2 SPECIAL AMMO',  color: '#0ff' },
      { id: 'overclock', name: 'OVERCLOCK',    desc: '+20% FIRE RATE',   color: '#ff0' },
      { id: 'wingman',   name: 'WINGMAN DRONE',desc: 'AUTO-FIRE ORBIT',  color: '#3f6' },
      { id: 'pierce',    name: 'PIERCE SHOT',  desc: 'SHOTS PIERCE FOES', color: '#fa0' },
      { id: 'bounty',    name: 'SCRAP BOUNTY', desc: '+50% SCRAP DROP',  color: '#fd0' }
    ];

    function registerKill(x, y, basePoints) {
      combo.count++;
      combo.timer = combo.maxTimer;
      combo.mult = Math.min(8, 1 + Math.floor(combo.count / 4));
      const gained = basePoints * combo.mult;
      score += gained;
      if (combo.count > 0 && combo.count % 4 === 0) {
        spawnFloatingText(x, y - 6, combo.mult === 8 ? 'OVERDRIVE x8!' : 'COMBO x' + combo.mult + '!', combo.mult === 8 ? '#ff0' : '#0ff');
      }
      return gained;
    }

    function resetCombo() {
      combo.count = 0;
      combo.mult = 1;
      combo.timer = 0;
    }

    function openPerkDraft() {
      const pool = PERK_POOL.filter(p => {
        if (p.id === 'wingman' && runPerks.wingman) return false;
        if (p.id === 'pierce' && runPerks.pierce) return false;
        if (p.id === 'repair' && player.health >= player.maxHealth) return false;
        return true;
      });
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      perkChoices = pool.slice(0, 3);
      perkDraftReadyAt = performance.now() + 420;
      stageState = 'PERK_DRAFT';
      playLevelUpSound();
    }

    function applyPerk(perk) {
      if (!perk) return;
      switch (perk.id) {
        case 'repair':
          player.health = Math.min(player.maxHealth, player.health + 1);
          break;
        case 'ammo':
          if (!player.specialPower || player.specialCount <= 0) {
            const names = ['missile', 'laser', 'wipeout'];
            player.specialPower = names[Math.floor(Math.random() * names.length)];
            player.specialCount = 2;
          } else {
            player.specialCount = Math.min(MAX_SPECIAL, player.specialCount + 2);
          }
          break;
        case 'overclock':
          runPerks.fireRateMult *= 0.8;
          break;
        case 'wingman':
          runPerks.wingman = true;
          break;
        case 'pierce':
          runPerks.pierce = true;
          break;
        case 'bounty':
          runPerks.scrapMult += 0.5;
          break;
      }
      blip(980);
      triggerHaptic(20);
      beginNextStage();
    }

    const keys = {
      ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
      KeyW: false, KeyS: false, KeyA: false, KeyD: false,
      Space: false, ShiftLeft: false, KeyP: false
    };

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    let musicGainNode = null;

    // ---------- Settings / Home menu state ----------
    const DIFFICULTY = [
      { name: 'EASY',   hearts: 4, continues: 5, enemySpeed: 0.85, bulletSpeed: 0.85, fireRate: 1.3,  bossHealth: 0.7, carrier: 0.8 },
      { name: 'NORMAL', hearts: 3, continues: 3, enemySpeed: 1.0,  bulletSpeed: 1.0,  fireRate: 1.0,  bossHealth: 1.0, carrier: 0.6 },
      { name: 'HARD',   hearts: 2, continues: 2, enemySpeed: 1.2,  bulletSpeed: 1.15, fireRate: 0.75, bossHealth: 1.4, carrier: 0.4 }
    ];
    const settings = { difficulty: 1, music: true, sfx: true, musicTrack: -1, shotSound: 1, autoFire: true, nokiaMode: false, bgTheme: 0, shooterPresetVersion: 6 };
    const SHOT_SOUNDS = ['SPACE SHOOTER', 'GALAXY IMPACT', 'COMET BLASTER'];
    let hiScore = 0;
    try {
      const saved = JSON.parse(localStorage.getItem('spaceInvadeSettings') || 'null');
      if (saved) {
        if (saved.difficulty >= 0 && saved.difficulty <= 2) settings.difficulty = saved.difficulty;
        if (typeof saved.music === 'boolean') settings.music = saved.music;
        if (typeof saved.sfx === 'boolean') settings.sfx = saved.sfx;
        if (typeof saved.autoFire === 'boolean') settings.autoFire = saved.autoFire;
        if (typeof saved.nokiaMode === 'boolean') settings.nokiaMode = saved.nokiaMode;
        if (Number.isInteger(saved.bgTheme) && saved.bgTheme >= 0 && saved.bgTheme < BG_THEMES.length) settings.bgTheme = saved.bgTheme;
        if (Number.isInteger(saved.musicTrack) && saved.musicTrack >= -1 && saved.musicTrack < 8) settings.musicTrack = saved.musicTrack;
        if (saved.shooterPresetVersion >= 2 && Number.isInteger(saved.shotSound) && saved.shotSound >= 0 && saved.shotSound < SHOT_SOUNDS.length) settings.shotSound = saved.shotSound;
      }
      hiScore = parseInt(localStorage.getItem('spaceInvadeHiScore') || '0', 10) || 0;
    } catch (e) {}
    applyDisplayFilter();

    const SCORE_KEY = 'spaceInvadeLeaderboardV1';
    let leaderboard = [];
    try {
      const data = JSON.parse(localStorage.getItem(SCORE_KEY) || '[]');
      if (Array.isArray(data)) leaderboard = data.filter(e => e && typeof e.name === 'string' && Number.isFinite(e.score)).slice(0, 10);
    } catch (e) {}
    if (!leaderboard.length && hiScore > 0) leaderboard = [{ name: 'PLAYER', score: hiScore }];
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length) hiScore = Math.max(hiScore, leaderboard[0].score);
    let scoreSavedThisRun = false;
    let scoreDialogOpen = false;
    let endTouchStart = null;
    let endScreenReadyAt = 0;
    let suppressMouseUntil = 0;
    const END_SCREEN_TOUCH_DELAY = 750;
    const endButtons = [];

    function savePlayerScore(name) {
      if (scoreSavedThisRun || cheatActive) return;
      const safeName = String(name || 'PLAYER').trim().replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 14) || 'PLAYER';
      leaderboard.push({ name: safeName, score: Math.max(0, Math.floor(finalScore)) });
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard = leaderboard.slice(0, 10);
      hiScore = Math.max(hiScore, finalScore);
      try {
        localStorage.setItem(SCORE_KEY, JSON.stringify(leaderboard));
        localStorage.setItem('spaceInvadeHiScore', String(hiScore));
      } catch (e) {}
      scoreSavedThisRun = true;
    }

    function openScoreDialog() {
      if (scoreDialogOpen || scoreSavedThisRun || cheatActive) return;
      scoreDialogOpen = true;
      const backdrop = document.createElement('div');
      backdrop.id = 'space-score-dialog';
      Object.assign(backdrop.style, {
        position: 'fixed', inset: '0', zIndex: '1000003',
        background: 'rgba(0,0,0,.88)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', color: '#8aff8a'
      });
      const panel = document.createElement('form');
      Object.assign(panel.style, {
        width: 'min(86vw,400px)', background: '#07160c',
        border: '2px solid #25e45c', borderRadius: '10px',
        padding: '18px', boxSizing: 'border-box',
        textAlign: 'center', boxShadow: '0 0 30px #064d1b'
      });
      const title = document.createElement('div');
      title.textContent = 'SAVE YOUR SCORE: ' + finalScore;
      title.style.cssText = 'font-size:clamp(13px,3vw,20px);margin-bottom:12px;font-weight:bold';
      const input = document.createElement('input');
      input.type = 'text'; input.maxLength = 14; input.placeholder = 'PLAYER NAME'; input.autocomplete = 'off'; input.required = true;
      input.style.cssText = 'display:block;box-sizing:border-box;width:100%;padding:12px;background:#000;color:#fff;border:1px solid #25e45c;border-radius:5px;font:16px monospace;text-align:center;user-select:text;-webkit-user-select:text';
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:10px;margin-top:14px';
      const save = document.createElement('button'); save.type = 'submit'; save.textContent = 'SAVE SCORE';
      const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'CANCEL';
      for (const b of [save, cancel]) b.style.cssText = 'flex:1;padding:11px 5px;border:1px solid #25e45c;border-radius:5px;background:#10361b;color:#fff;font:bold 13px monospace';
      actions.append(save, cancel); panel.append(title, input, actions); backdrop.append(panel); document.body.append(backdrop);
      function close() { backdrop.remove(); scoreDialogOpen = false; canvas.focus(); }
      panel.addEventListener('submit', e => { e.preventDefault(); savePlayerScore(input.value); close(); });
      cancel.addEventListener('click', close);
      input.focus();
    }

    function drawEndButton(label, x, y, w, action, color = '#0f0') {
      const h = 17;
      ctx.fillStyle = '#071c10'; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
      ctx.fillStyle = color; ctx.font = isPortrait() ? 'bold 8px monospace' : 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(label, x + w / 2, y + 12);
      endButtons.push({ x, y, w, h, label, action });
    }
    function endButtonAt(clientX, clientY) {
      if (scoreDialogOpen || performance.now() < endScreenReadyAt) return;
      const { x, y } = canvasPoint(clientX, clientY);
      const btn = endButtons.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
      if (btn) btn.action();
    }

    function saveSettings() {
      try { localStorage.setItem('spaceInvadeSettings', JSON.stringify(settings)); } catch (e) {}
    }
    function diff() { return DIFFICULTY[settings.difficulty]; }

    const sfxBus = audioCtx.createGain();
    sfxBus.gain.value = settings.sfx ? 1 : 0;
    sfxBus.connect(audioCtx.destination);
    function blip(freq) { playSound({ frequency: freq, duration: 0.06, type: 'square', volume: 0.15 }); }

    // --- Audio helpers ---
    function playSound(options) {
      if (!audioCtx || audioCtx.state === 'suspended') return;
      const { frequency, duration, type, volume, pan, endFrequency, detune, delay } = {
        frequency: 440, duration: 0.1, type: 'square', volume: 0.5, pan: 0, endFrequency: null, detune: 0, delay: 0, ...options
      };
      const now = audioCtx.currentTime + delay;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const pannerNode = audioCtx.createStereoPanner();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      if (detune !== 0) { oscillator.detune.setValueAtTime(detune, now); }
      if (endFrequency !== null) {
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration * 0.9);
      }
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      pannerNode.pan.setValueAtTime(pan, now);
      oscillator.connect(gainNode); gainNode.connect(pannerNode); pannerNode.connect(sfxBus);
      oscillator.start(now);
      oscillator.stop(now + duration);
      oscillator.onended = () => { gainNode.disconnect(); pannerNode.disconnect(); };
    }

    function shooterTone(startHz, endHz, duration, type, volume, delaySeconds = 0) {
      const when = audioCtx.currentTime + 0.01 + delaySeconds;
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(startHz, when);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endHz), when + duration * 0.92);
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(volume, when + Math.min(0.012, duration * 0.2));
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      oscillator.connect(gain);
      gain.connect(sfxBus);
      oscillator.start(when);
      oscillator.stop(when + duration + 0.02);
      oscillator.onended = () => { try { oscillator.disconnect(); gain.disconnect(); } catch (e) {} };
    }

    function playPlayerShotSound() {
      if (!settings.sfx || audioCtx.state === 'suspended') return;
      switch (settings.shotSound) {
        case 0:
          shooterTone(980, 220, 0.16, 'square', 0.18);
          shooterTone(1470, 286, 0.096, 'triangle', 0.05);
          break;
        case 2:
          shooterTone(1320, 280, 0.11, 'square', 0.18);
          break;
        default:
          shooterTone(1150, 180, 0.14, 'square', 0.18);
          shooterTone(1725, 234, 0.084, 'triangle', 0.05);
          break;
      }
    }

    function playSpecialShotSound(powerName) {
      switch (powerName) {
        case 'missile':
          playSound({ frequency: 300, duration: 0.25, type: 'sawtooth', volume: 0.3, endFrequency: 90 });
          setTimeout(() => playSound({ frequency: 120, duration: 0.2, type: 'square', volume: 0.15, endFrequency: 60 }), 60);
          break;
        case 'laser':
          playSound({ frequency: 2400, duration: 0.35, type: 'square', volume: 0.2, endFrequency: 1200 });
          playSound({ frequency: 1200, duration: 0.35, type: 'sawtooth', volume: 0.12, endFrequency: 600 });
          break;
        case 'wipeout':
          playSound({ frequency: 100, duration: 0.5, type: 'sawtooth', volume: 0.35, endFrequency: 900 });
          break;
      }
    }

    function playEnemyHitSound() { playSound({ frequency: 900, duration: 0.03, type: 'triangle', volume: 0.2, endFrequency: 300, detune: -50 }); }
    function playExplosionSound() {
      const now = audioCtx.currentTime;
      const duration = 0.15;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, now); oscillator.frequency.exponentialRampToValueAtTime(30, now + duration);
      gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gainNode); gainNode.connect(sfxBus);
      oscillator.start(now); oscillator.stop(now + duration);
      const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) { output[i] = (Math.random() * 2 - 1) * 0.8; }
      const noiseSource = audioCtx.createBufferSource(); noiseSource.buffer = noiseBuffer;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now); noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);
      noiseSource.connect(noiseGain); noiseGain.connect(sfxBus);
      noiseSource.start(now); noiseSource.stop(now + duration);
      oscillator.onended = () => { gainNode.disconnect(); noiseGain.disconnect(); };
    }
    function playGameOverSound() { playSound({ frequency: 200, duration: 0.6, type: 'sawtooth', volume: 0.3, endFrequency: 80, detune: -100 }); }
    function playPowerupSound() { playSound({ frequency: 600, duration: 0.08, type: 'sine', volume: 0.3, endFrequency: 1200, detune: 50 }); }
    function playScrapSound() { playSound({ frequency: 1250, duration: 0.05, type: 'sine', volume: 0.18, endFrequency: 1850 }); }
    function playLevelUpSound() {
      playSound({ frequency: 800, duration: 0.06, type: 'square', volume: 0.2, endFrequency: 1200, detune: 50 });
      setTimeout(() => { playSound({ frequency: 1200, duration: 0.06, type: 'square', volume: 0.2, endFrequency: 1600, detune: 50 }); }, 60);
    }
    function playBossIntroSound() { playSound({ frequency: 100, duration: 0.5, type: 'sawtooth', volume: 0.3, endFrequency: 50, detune: -100 }); }

    function playEnemyShotSound(entity) {
      const pan = (entity.x / 240) * 2 - 1;
      const now = audioCtx.currentTime;
      const duration = 0.08;
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + duration);
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      const pannerNode = audioCtx.createStereoPanner();
      pannerNode.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      osc.connect(gainNode);
      gainNode.connect(pannerNode);
      pannerNode.connect(sfxBus);
      osc.start(now);
      osc.stop(now + duration);
      osc.onended = () => { gainNode.disconnect(); pannerNode.disconnect(); };
    }

    // ---------- Soundtrack ----------
    let ambientMusicRunning = false;
    const MUSIC_VOLUME = 0.45;
    const LEAD_PATTERNS = {
      A: [3,-1,-1,3,-1,4,-1,5, -1,-1,5,-1,4,-1,3,-1],
      B: [5,-1,4,-1,3,-1,4,5, -1,-1,3,-1,2,-1,3,-1],
      C: [3,3,-1,4,4,-1,5,-1, 5,-1,4,-1,3,-1,-1,-1],
      D: [3,4,5,4,3,4,5,4, 3,4,5,4,3,2,1,0]
    };
    const BASS_PATTERNS = {
      eighths: [0,null,0,null,0,null,12,null, 0,null,0,null,0,null,7,null],
      gallop:  [0,0,null,0,0,null,0,0, 0,0,null,0,0,null,12,null],
      offbeat: [null,null,0,null,null,null,0,null, null,null,0,null,null,null,12,0],
      drive:   [0,0,12,0, 0,0,12,0, 0,0,12,0, 0,7,12,7]
    };
    const DRUM_PATTERNS = {
      four:   { k: "x...x...x...x...", s: "....x.......x...", h: "x.x.x.x.x.x.x.x.", o: "..x...x...x...x." },
      drive:  { k: "x...x...x...x..x", s: "....x.......x...", h: "x.xxx.xxx.xxx.xx", o: "..x...x...x...x." },
      brk:    { k: "x.....x...x....x", s: "....x.......x..x", h: "xxxxxxxxxxxxxxxx", o: "................" },
      half:   { k: "x.......x.x.....", s: "........x.......", h: "x.x.x.x.x.x.x.x.", o: "..x...x...x...x." },
      double: { k: "x.x.x.x.x.x.x.x.", s: "....x.......x...", h: "xxxxxxxxxxxxxxxx", o: "................" }
    };
    const ARP_PAT = [0, 1, 2, 1, 2, 1, 0, 1];
    const MUSIC_TRACKS = [
      { name: 'Blast Off',     bpm: 140, prog: [[45,'m'],[41,'M'],[48,'M'],[43,'M']], drums: 'four',   bass: 'eighths', lead: ['A','B','A','C','D','B','A','C'], wave: 'square',   arp: false },
      { name: 'Nebula Rush',   bpm: 148, prog: [[38,'m'],[46,'M'],[41,'M'],[48,'M']], drums: 'four',   bass: 'drive',   lead: ['C','A','D','B','C','A','B','D'], wave: 'sawtooth', arp: true  },
      { name: 'Cavern Chase',  bpm: 136, prog: [[40,'m'],[48,'M'],[43,'M'],[50,'M']], drums: 'drive',  bass: 'gallop',  lead: ['B','C','A','C','A','D','B','C'], wave: 'square',   arp: false },
      { name: 'Alien Assault', bpm: 152, prog: [[42,'m'],[50,'M'],[45,'M'],[40,'M']], drums: 'brk',    bass: 'offbeat', lead: ['A','C','B','D','A','C','D','B'], wave: 'sawtooth', arp: true  },
      { name: 'Dark Void',     bpm: 144, prog: [[48,'m'],[44,'M'],[46,'M'],[43,'M']], drums: 'half',   bass: 'gallop',  lead: ['C','B','C','A','D','B','C','A'], wave: 'sawtooth', arp: false },
      { name: 'Bio Lair',      bpm: 156, prog: [[43,'m'],[39,'M'],[46,'M'],[41,'M']], drums: 'double', bass: 'drive',   lead: ['D','A','B','C','D','A','C','B'], wave: 'square',   arp: true  },
      { name: 'Cosmic Rift',   bpm: 160, prog: [[47,'m'],[43,'M'],[50,'M'],[45,'M']], drums: 'brk',    bass: 'drive',   lead: ['A','D','C','B','A','D','B','C'], wave: 'sawtooth', arp: true  },
      { name: 'Mothership',    bpm: 168, prog: [[49,'m'],[45,'M'],[40,'M'],[47,'M']], drums: 'double', bass: 'drive',   lead: ['D','C','D','B','D','C','A','B'], wave: 'sawtooth', arp: true  }
    ];
    let musicTimer = null, musicDelay = null, musicFeedback = null, musicDelayFilter = null;
    let musicPadFilter = null, musicBassFilter = null, musicNoise = null;
    let musicStep = 0, musicBar = 0, musicTrack = -1, nextNoteTime = 0;
    const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const chordTone = (root, q, i) => root + 12 + [0, q === 'm' ? 3 : 4, 7][i % 3] + 12 * Math.floor(i / 3);

    function musicNote(freq, when, dur, type, vol, dest, attack, send, detune) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, when);
      if (detune) osc.detune.setValueAtTime(detune, when);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(vol, when + attack);
      g.gain.linearRampToValueAtTime(0.0001, when + dur);
      osc.connect(g);
      g.connect(dest);
      if (send) g.connect(send);
      osc.start(when);
      osc.stop(when + dur + 0.05);
      osc.onended = () => { try { g.disconnect(); osc.disconnect(); } catch (e) {} };
    }
    function drumKick(when) {
      const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, when);
      osc.frequency.exponentialRampToValueAtTime(42, when + 0.12);
      g.gain.setValueAtTime(0.5, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + 0.24);
      osc.connect(g); g.connect(musicGainNode);
      osc.start(when); osc.stop(when + 0.26);
      osc.onended = () => { try { g.disconnect(); osc.disconnect(); } catch (e) {} };
    }
    function drumNoise(when, dur, vol, hp) {
      if (!musicNoise) return;
      const src = audioCtx.createBufferSource();
      src.buffer = musicNoise;
      const f = audioCtx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.setValueAtTime(hp, when);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(vol, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + dur);
      src.connect(f); f.connect(g); g.connect(musicGainNode);
      src.start(when); src.stop(when + dur + 0.02);
      src.onended = () => { try { g.disconnect(); f.disconnect(); src.disconnect(); } catch (e) {} };
    }
    function drumSnare(when, vol) {
      drumNoise(when, 0.17, vol, 1800);
      musicNote(190, when, 0.1, 'triangle', vol * 0.8, musicGainNode, 0.002);
    }

    function scheduleMusic() {
      if (!ambientMusicRunning || !musicGainNode) return;
      const boss = (stageState === 'BOSS_INTRO' || stageState === 'BOSS_FIGHT');
      while (nextNoteTime < audioCtx.currentTime + 0.3) {
        let crash = false;
        if (musicStep === 0) {
          const idx = settings.musicTrack < 0 ? Math.min(currentStage, MUSIC_TRACKS.length - 1) : settings.musicTrack;
          if (idx !== musicTrack) { musicTrack = idx; musicBar = 0; crash = true; }
          if (musicBar % 8 === 0) crash = true;
        }
        const tr = MUSIC_TRACKS[musicTrack];
        const stepDur = 60 / (tr.bpm * (boss ? 1.06 : 1)) / 4;
        musicDelay.delayTime.value = stepDur * 3;
        const [root, q] = tr.prog[musicBar % 4];
        const s = musicStep, when = nextNoteTime;
        const dr = DRUM_PATTERNS[tr.drums];

        if (crash) drumNoise(when, 1.0, 0.1, 5000);
        if (dr.k[s] === 'x') drumKick(when);
        const fill = (musicBar % 4 === 3 && s >= 12);
        if (dr.s[s] === 'x' || fill) drumSnare(when, fill ? 0.12 + (s - 12) * 0.03 : 0.22);
        if (dr.h[s] === 'x' || (boss && s % 2 === 1)) drumNoise(when, 0.05, s % 4 === 0 ? 0.07 : 0.045, 7000);
        if (dr.o[s] === 'x') drumNoise(when, 0.14, 0.05, 6500);

        const bv = BASS_PATTERNS[tr.bass][s];
        if (bv !== null) musicNote(midiHz(root + bv), when, stepDur * 1.7, 'sawtooth', 0.17, musicBassFilter, 0.004);

        if (s === 0) {
          for (let i = 0; i < 3; i++) {
            const f = midiHz(chordTone(root, q, i));
            musicNote(f, when, stepDur * 16, 'sawtooth', 0.012, musicPadFilter, 0.08, null, -8);
            musicNote(f, when, stepDur * 16, 'sawtooth', 0.012, musicPadFilter, 0.08, null, 8);
          }
        }

        const li = LEAD_PATTERNS[tr.lead[musicBar % tr.lead.length]][s];
        if (li >= 0) {
          const f = midiHz(chordTone(root, q, li));
          musicNote(f, when, stepDur * 1.9, tr.wave, 0.03, musicGainNode, 0.008, musicDelay, -6);
          musicNote(f, when, stepDur * 1.9, tr.wave, 0.03, musicGainNode, 0.008, musicDelay, 6);
        }

        if (tr.arp || boss) {
          const m = chordTone(root, q, ARP_PAT[s % 8] + 3);
          musicNote(midiHz(m), when, stepDur * 1.3, 'triangle', 0.028, musicGainNode, 0.004, musicDelay);
        }

        nextNoteTime += stepDur;
        musicStep++;
        if (musicStep >= 16) { musicStep = 0; musicBar++; }
      }
    }

    function startAmbientSound() {
      if (!ambientMusicRunning) return;
      const now = audioCtx.currentTime;
      musicGainNode = audioCtx.createGain();
      musicGainNode.gain.setValueAtTime(0.0001, now);
      musicGainNode.gain.linearRampToValueAtTime(MUSIC_VOLUME, now + 0.4);
      musicGainNode.connect(audioCtx.destination);

      musicPadFilter = audioCtx.createBiquadFilter();
      musicPadFilter.type = "lowpass";
      musicPadFilter.frequency.setValueAtTime(1500, now);
      musicPadFilter.Q.setValueAtTime(0.7, now);
      musicPadFilter.connect(musicGainNode);

      musicBassFilter = audioCtx.createBiquadFilter();
      musicBassFilter.type = "lowpass";
      musicBassFilter.frequency.setValueAtTime(600, now);
      musicBassFilter.Q.setValueAtTime(1.2, now);
      musicBassFilter.connect(musicGainNode);

      musicDelay = audioCtx.createDelay(2);
      musicDelay.delayTime.value = 0.2;
      musicFeedback = audioCtx.createGain();
      musicFeedback.gain.value = 0.32;
      musicDelayFilter = audioCtx.createBiquadFilter();
      musicDelayFilter.type = "lowpass";
      musicDelayFilter.frequency.setValueAtTime(2600, now);
      musicDelay.connect(musicDelayFilter);
      musicDelayFilter.connect(musicFeedback);
      musicFeedback.connect(musicDelay);
      musicDelayFilter.connect(musicGainNode);

      const len = Math.floor(audioCtx.sampleRate);
      musicNoise = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const out = musicNoise.getChannelData(0);
      for (let i = 0; i < len; i++) out[i] = Math.random() * 2 - 1;

      musicStep = 0; musicBar = 0; musicTrack = -1;
      nextNoteTime = now + 0.1;
      musicTimer = setInterval(scheduleMusic, 40);
      scheduleMusic();
    }

    function startMusic() {
      if (!settings.music || ambientMusicRunning) return;
      ambientMusicRunning = true;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => startAmbientSound());
      } else {
        startAmbientSound();
      }
    }

    function stopMusic() {
      if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
      for (const n of [musicDelay, musicFeedback, musicDelayFilter, musicPadFilter, musicBassFilter, musicGainNode]) {
        if (n) { try { n.disconnect(); } catch (e) {} }
      }
      musicDelay = musicFeedback = musicDelayFilter = musicPadFilter = musicBassFilter = musicGainNode = null;
      musicNoise = null;
      ambientMusicRunning = false;
    }

    // -------------------------------------------------
    // Game objects
    // -------------------------------------------------
    const player = {
      x: 20, y: 53, w: 13.6, h: 13.6,
      speed: 1.8, bullets: [],
      health: 3, maxHealth: 3,
      specialPower: null, specialCount: 0,
      invulnerable: false,
      invulTimer: 0,
      invulDuration: 1500,
      flashTimer: 0
    };
    let enemies = [];
    const explosions = [];
    const powerups = [];
    const scraps = [];
    let boss = null;
    let stageState = 'MINIONS';

    const MAX_SPECIAL = 9;
    const specialPowers = [
      { name: 'missile', label: 'MISSILE', short: 'M', color: '#ff8800', damage: 10 },
      { name: 'laser',   label: 'LASER',   short: 'L', color: '#00ffff', damage: 5 },
      { name: 'wipeout', label: 'WIPEOUT', short: 'W', color: '#ffff00', damage: 25 }
    ];

    const TOTAL_STAGES = 8;

    const generateStage = (i) => {
      const stageIndex = i + 1;
      const minionCount = 55 + i * 10;
      const minionTypes = ["basic", "invader", "kamikaze", "sine", "shooting", "mine", "zigzag", "fast-bullet"];
      const types = minionTypes.slice(0, Math.min(minionTypes.length, 4 + Math.floor(i / 2)));

      const bossDefinitions = [
        { kind: 'scout',       name: "Scout Drone",        sprite: 'Sentinel',    color: "#4af", health: 45,  w: 36,  h: 34,  speed: 0.9 },
        { kind: 'turret',      name: "Dual-Turret Ship",   sprite: 'Cruiser',     color: "#f55", health: 75,  w: 50,  h: 40,  speed: 0.6 },
        { kind: 'crawler',     name: "Mechanical Crawler", sprite: 'Crawler',     color: "#fa0", health: 95,  w: 44,  h: 34,  speed: 0.5 },
        { kind: 'interceptor', name: "Winged Interceptor", sprite: 'Interceptor', color: "#f80", health: 110, w: 44,  h: 36,  speed: 2.0 },
        { kind: 'artillery',   name: "Heavy Artillery",    sprite: 'Dreadnought', color: "#0cc", health: 195, w: 52,  h: 46,  speed: 0.3 },
        { kind: 'skull',       name: "Skull Entity",       sprite: 'Overlord',    color: "#ee0", health: 150, w: 42,  h: 42,  speed: 1.0 },
        { kind: 'serpent',     name: "Serpent",            sprite: 'Serpent',     color: "#3d3", health: 185, w: 132, h: 84,  speed: 0.8 },
        { kind: 'core',        name: "Mothership Core",    sprite: 'Core',        color: "#c4f", health: 240, w: 60,  h: 100, speed: 0.5 }
      ];

      const bossDef = bossDefinitions[Math.min(i, bossDefinitions.length - 1)];

      return {
        stage: stageIndex,
        name: ["Asteroid Field", "Nebula Trails", "Underground Caves", "Alien Sector", "Dark Void", "Bio Lair", "Cosmic Rift", "The Mothership"][i],
        bgColor: ["#1a1a1a", "#332a40", "#2a2218", "#2a1e1e", "#1a0d0d", "#102a1a", "#0d1a1a", "#1a0a24"][i],
        starDensity: 60 + i * 15,
        enemyTypes: types,
        enemySpeedFactor: 1 + i * 0.16,
        spawnRateFactor: Math.max(0.65, 1 - i * 0.045),
        minionCount: minionCount,
        boss: {
          type: bossDef.name,
          kind: bossDef.kind,
          initialHealth: bossDef.health,
          width: bossDef.w * 0.80,
          height: bossDef.h * 0.80,
          speed: bossDef.speed,
          value: 100 + i * 100,
          color: bossDef.color,
          graphic: BOSS_GRAPHICS[bossDef.sprite]
        },
        minionsSpawned: 0,
        powerTypes: ['missile', 'laser', 'wipeout', 'health'],
        hasBeenCleared: false
      };
    };

    const stages = Array.from({ length: TOTAL_STAGES }, (_, i) => generateStage(i));
    let currentStageData = stages[currentStage];
    let minionSpawnTracker = 0;
    let allSpawnedAt = 0;

    const stars = [];
    function initStars(density) {
      stars.length = 0;
      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * 240,
          y: Math.random() * 240,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.5 + 0.1
        });
      }
    }
    initStars(currentStageData.starDensity);

    // -------------------------------------------------
    // Custom Pixel UI Icons (Hearts, Scrap, Shield, Perks)
    // -------------------------------------------------
    const HEART_ROWS = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];
    function drawHeart(x, y, color) {
      ctx.fillStyle = color;
      for (let r = 0; r < HEART_ROWS.length; r++)
        for (let c = 0; c < 7; c++)
          if (HEART_ROWS[r][c] === '#') ctx.fillRect(x + c, y + r, 1, 1);
    }

    function drawScrapIcon(x, y) {
      ctx.fillStyle = "#fa0";
      ctx.fillRect(x + 2, y, 1, 5);
      ctx.fillRect(x, y + 2, 5, 1);
      ctx.fillStyle = "#ff0";
      ctx.fillRect(x + 1, y + 1, 3, 3);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 2, y + 2, 1, 1);
    }

    function drawShieldIcon(x, y, active) {
      ctx.fillStyle = active ? "#0ff" : "#344";
      ctx.fillRect(x, y, 5, 3);
      ctx.fillRect(x + 1, y + 3, 3, 1);
      ctx.fillRect(x + 2, y + 4, 1, 1);
    }

    function drawPerkIcon(id, cx, cy) {
      ctx.save();
      if (id === 'repair') {
        drawHeart(cx - 3.5, cy - 3, "#f55");
      } else if (id === 'ammo') {
        ctx.fillStyle = "#0ff";
        ctx.fillRect(cx - 4, cy - 3, 6, 2);
        ctx.fillRect(cx - 2, cy + 1, 6, 2);
        ctx.fillStyle = "#fff";
        ctx.fillRect(cx + 2, cy - 3, 2, 2);
        ctx.fillRect(cx + 4, cy + 1, 2, 2);
      } else if (id === 'overclock') {
        ctx.fillStyle = "#ff0";
        ctx.fillRect(cx, cy - 4, 2, 3);
        ctx.fillRect(cx - 2, cy - 1, 5, 2);
        ctx.fillRect(cx - 1, cy + 1, 2, 3);
      } else if (id === 'wingman') {
        ctx.fillStyle = "#3f6";
        ctx.fillRect(cx - 3, cy - 3, 6, 6);
        ctx.fillStyle = "#fff";
        ctx.fillRect(cx + 1, cy - 1, 2, 2);
      } else if (id === 'pierce') {
        ctx.fillStyle = "#fa0";
        ctx.fillRect(cx - 5, cy - 1, 8, 2);
        ctx.fillStyle = "#fff";
        ctx.fillRect(cx + 1, cy - 3, 2, 6);
        ctx.fillRect(cx + 3, cy - 2, 2, 4);
      } else if (id === 'bounty') {
        drawScrapIcon(cx - 2.5, cy - 2.5);
      }
      ctx.restore();
    }

    // --- Menu & Cheat Code ---
    let menuScreen = 'home'; // 'home' | 'options' | 'hangar' | 'scores'
    let menuIndex = 0;
    let menuTouchStart = null;

    const CHEAT_SEQUENCE = ['Up', 'Up', 'Down', 'Down', 'Left', 'Right', 'Left', 'Right'];
    const CHEAT_SWIPE_ZONE_X = 66;
    let cheatBuffer = [];
    let cheatArmed = false;
    let cheatActive = false;

    function pushCheatInput(dir) {
      if (started || menuScreen !== 'home') return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      cheatBuffer.push(dir);
      if (cheatBuffer.length > CHEAT_SEQUENCE.length) cheatBuffer.shift();
      if (cheatBuffer.length === CHEAT_SEQUENCE.length && cheatBuffer.every((d, i) => d === CHEAT_SEQUENCE[i])) {
        cheatBuffer = [];
        cheatArmed = !cheatArmed;
        const notes = cheatArmed ? [660, 880, 1320] : [880, 660, 440];
        notes.forEach((f, i) => playSound({ frequency: f, duration: 0.09, type: 'square', volume: 0.2, delay: i * 0.09 }));
      }
    }

    function applyLoadout() {
      const bonusHearts = meta.upgrades.hull - 1;
      player.maxHealth = diff().hearts + bonusHearts;
      player.health = player.maxHealth;
      continues = diff().continues;

      resetCombo();
      runPerks.fireRateMult = 1;
      runPerks.pierce = false;
      runPerks.wingman = false;
      runPerks.scrapMult = 1;
      runScrapEarned = 0;

      const startSpec = meta.upgrades.special - 1;
      if (startSpec > 0) {
        const names = ['missile', 'laser', 'wipeout'];
        player.specialPower = names[Math.floor(Math.random() * names.length)];
        player.specialCount = startSpec;
      } else {
        player.specialPower = null;
        player.specialCount = 0;
      }
    }

    function menuItems() {
      if (menuScreen === 'home') {
        return [
          { id: 'play',    label: 'PLAY',    x: 56,  y: 66, w: 60, h: 16 },
          { id: 'hangar',  label: 'HANGAR',  x: 124, y: 66, w: 60, h: 16 },
          { id: 'scores',  label: 'SCORES',  x: 56,  y: 86, w: 60, h: 16 },
          { id: 'options', label: 'OPTIONS', x: 124, y: 86, w: 60, h: 16 }
        ];
      }
      if (menuScreen === 'hangar') {
        const fmt = (key) => {
          const cost = upgradeCost(key);
          return cost === null ? 'MAX' : cost + 'S';
        };
        return [
          { id: 'upg_cannon',  key: 'cannon',  label: 'CANNON',     value: fmt('cannon'),  x: 16, y: 24, w: 208, h: 15 },
          { id: 'upg_hull',    key: 'hull',    label: 'MAX HULL',   value: fmt('hull'),    x: 16, y: 42, w: 208, h: 15 },
          { id: 'upg_magnet',  key: 'magnet',  label: 'MAGNET',     value: fmt('magnet'),  x: 16, y: 60, w: 208, h: 15 },
          { id: 'upg_special', key: 'special', label: 'START SPEC', value: fmt('special'), x: 16, y: 78, w: 208, h: 15 },
          { id: 'back',        label: 'BACK',       x: 70, y: 98, w: 100, h: 14 }
        ];
      }
      if (menuScreen === 'scores') {
        return [
          { id: 'back', label: 'BACK', x: 70, y: 98, w: 100, h: 14 }
        ];
      }
      const musicName = settings.musicTrack < 0 ? 'AUTO / STAGE' : MUSIC_TRACKS[settings.musicTrack].name.toUpperCase();
      const themeName = activeTheme().name;
      return [
        { id: 'difficulty', label: 'DIFFICULTY', value: '< ' + diff().name + ' >', x: 18, y: 14, w: 204, h: 10 },
        { id: 'bgTheme',    label: 'THEME',      value: '< ' + themeName + ' >', x: 18, y: 26, w: 204, h: 10 },
        { id: 'autoFire',   label: 'AUTO FIRE',  value: settings.autoFire ? 'ON' : 'OFF', on: settings.autoFire, x: 18, y: 38, w: 204, h: 10 },
        { id: 'nokiaMode',  label: 'DISPLAY',    value: settings.nokiaMode ? 'NOKIA 3310' : 'ARCADE', on: !settings.nokiaMode, x: 18, y: 50, w: 204, h: 10 },
        { id: 'music',      label: 'MUSIC',      value: settings.music ? 'ON' : 'OFF', on: settings.music, x: 18, y: 62, w: 204, h: 10 },
        { id: 'musicTrack', label: 'BGM TRACK',  value: '< ' + musicName + ' >', x: 18, y: 74, w: 204, h: 10 },
        { id: 'sfx',        label: 'EFFECTS',    value: settings.sfx ? 'ON' : 'OFF', on: settings.sfx, x: 18, y: 86, w: 204, h: 10 },
        { id: 'shotSound',  label: 'SHOT SOUND', value: '< ' + SHOT_SOUNDS[settings.shotSound] + ' >', x: 18, y: 98, w: 204, h: 10 },
        { id: 'back',       label: 'BACK',       x: 70, y: 110, w: 100, h: 9 }
      ];
    }

    function buyUpgrade(key) {
      const cost = upgradeCost(key);
      if (cost === null || meta.scrap < cost) {
        playSound({ frequency: 180, duration: 0.1, type: 'sawtooth', volume: 0.2 });
        return;
      }
      meta.scrap -= cost;
      meta.upgrades[key]++;
      saveMeta();
      playPowerupSound();
      triggerHaptic(25);
    }

    function menuActivate(id, dir) {
      switch (id) {
        case 'play':
          lockPlayOrientation();
          cheatActive = cheatArmed;
          applyLoadout();
          for (const k in keys) keys[k] = false;
          started = true;
          stageUfoSpawned = false;
          stageBannerTimer = 140;
          lastTime = performance.now();
          startMusic();
          break;
        case 'hangar':  menuScreen = 'hangar'; menuIndex = 0; blip(880); break;
        case 'scores':  menuScreen = 'scores'; menuIndex = 0; blip(880); break;
        case 'options': menuScreen = 'options'; menuIndex = 0; blip(880); break;
        case 'upg_cannon':  buyUpgrade('cannon'); break;
        case 'upg_hull':    buyUpgrade('hull'); break;
        case 'upg_magnet':  buyUpgrade('magnet'); break;
        case 'upg_special': buyUpgrade('special'); break;
        case 'difficulty':
          settings.difficulty = (settings.difficulty + (dir || 1) + 3) % 3;
          saveSettings(); blip(660); break;
        case 'bgTheme':
          settings.bgTheme = (settings.bgTheme + (dir || 1) + BG_THEMES.length) % BG_THEMES.length;
          saveSettings(); blip(720); break;
        case 'autoFire':
          settings.autoFire = !settings.autoFire;
          saveSettings(); blip(660); break;
        case 'nokiaMode':
          settings.nokiaMode = !settings.nokiaMode;
          applyDisplayFilter();
          saveSettings(); blip(740); break;
        case 'music':
          settings.music = !settings.music;
          if (settings.music) startMusic(); else stopMusic();
          saveSettings(); blip(660); break;
        case 'musicTrack':
          settings.musicTrack = ((settings.musicTrack + 1 + (dir || 1) + MUSIC_TRACKS.length + 1) % (MUSIC_TRACKS.length + 1)) - 1;
          saveSettings();
          if (settings.music) { stopMusic(); startMusic(); }
          blip(660);
          break;
        case 'shotSound':
          settings.shotSound = (settings.shotSound + (dir || 1) + SHOT_SOUNDS.length) % SHOT_SOUNDS.length;
          saveSettings();
          if (audioCtx.state === 'suspended') audioCtx.resume();
          playPlayerShotSound();
          break;
        case 'sfx':
          settings.sfx = !settings.sfx;
          sfxBus.gain.value = settings.sfx ? 1 : 0;
          saveSettings(); blip(660); break;
        case 'back': menuScreen = 'home'; menuIndex = 0; blip(520); break;
      }
    }

    function menuKey(e) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      if (settings.music && !ambientMusicRunning) startMusic();
      const items = menuItems();
      const code = e.code;
      if (code === 'ArrowUp') pushCheatInput('Up');
      else if (code === 'ArrowDown') pushCheatInput('Down');
      else if (code === 'ArrowLeft') pushCheatInput('Left');
      else if (code === 'ArrowRight') pushCheatInput('Right');
      if (code === 'ArrowUp' || code === 'KeyW') { menuIndex = (menuIndex + items.length - 1) % items.length; blip(520); }
      else if (code === 'ArrowDown' || code === 'KeyS') { menuIndex = (menuIndex + 1) % items.length; blip(520); }
      else if (code === 'ArrowLeft' || code === 'KeyA') {
        if (menuScreen === 'home') { menuIndex = (menuIndex + 3) % 4; blip(520); }
        else { const it = items[menuIndex]; if (it && it.value !== undefined && menuScreen === 'options') menuActivate(it.id, -1); }
      }
      else if (code === 'ArrowRight' || code === 'KeyD') {
        if (menuScreen === 'home') { menuIndex = (menuIndex + 1) % 4; blip(520); }
        else { const it = items[menuIndex]; if (it && it.value !== undefined && menuScreen === 'options') menuActivate(it.id, 1); }
      }
      else if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') { menuActivate(items[menuIndex].id, 1); }
      else if (code === 'Escape' && menuScreen !== 'home') { menuActivate('back'); }
      else return false;
      return true;
    }

    function menuPointer(clientX, clientY) {
      if (isPortrait()) {
        const { x: cx, y: cy } = canvasPoint(clientX, clientY);
        if (menuScreen === 'home') {
          if (cx >= 22 && cx <= 98) {
            if (cy >= 80 && cy <= 98)  { menuActivate('play'); return; }
            if (cy >= 102 && cy <= 120) { menuActivate('hangar'); return; }
            if (cy >= 124 && cy <= 142) { menuActivate('scores'); return; }
            if (cy >= 146 && cy <= 164) { menuActivate('options'); return; }
          }
        } else if (menuScreen === 'scores') {
          if (cx >= 20 && cx <= 100 && cy >= 198 && cy <= 218) { menuActivate('back'); return; }
        } else if (cx >= 5 && cx <= 115) {
          const items = menuItems();
          const rowH = menuScreen === 'hangar' ? 32 : 21;
          const startY = menuScreen === 'hangar' ? 38 : 24;
          const idx = Math.floor((cy - startY) / rowH);
          if (idx >= 0 && idx < items.length && cy >= startY + idx * rowH && cy <= startY + idx * rowH + (rowH - 2)) {
            menuIndex = idx; menuActivate(items[idx].id, 1); return;
          }
        }
        return;
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      if (settings.music && !ambientMusicRunning) startMusic();
      const { x: cx, y: cy } = canvasPoint(clientX, clientY);
      const items = menuItems();
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (cx >= it.x && cx <= it.x + it.w && cy >= it.y - 2 && cy <= it.y + it.h + 2) {
          menuIndex = i;
          menuActivate(it.id, it.value !== undefined && cx < it.x + it.w / 2 ? -1 : 1);
          return;
        }
      }
    }

    function portraitMenu(t) {
      ctx.textAlign = 'center';
      if (menuScreen === 'home') {
        ctx.fillStyle = 'rgba(0,10,14,0.75)';
        ctx.fillRect(0, 0, 120, 14);
        drawScrapIcon(6, 4);
        ctx.textAlign = 'left'; ctx.font = 'bold 6px monospace'; ctx.fillStyle = '#fd0';
        ctx.fillText(String(meta.scrap), 14, 9);
        ctx.textAlign = 'right'; ctx.fillStyle = '#3f6';
        ctx.fillText('HI ' + hiScore, 114, 9);
        ctx.textAlign = 'center';

        drawSplitLogo(60, 34, 13, true);
        drawPortraitHomeShowcase(t);

        portraitMenuButton('PLAY',   22, 80,  76, 18, '#3f6');
        portraitMenuButton('HANGAR', 22, 102, 76, 18, '#fd0');
        portraitMenuButton('SCORE',  22, 124, 76, 18, '#fa0');
        portraitMenuButton('OPTION', 22, 146, 76, 18, '#0ff');

        if (cheatArmed) {
          ctx.fillStyle = Math.floor(t / 300) % 2 === 0 ? '#ff0' : '#f80';
          ctx.font = '7px monospace'; ctx.fillText('CHEAT ON', 60, 232);
        }
      } else if (menuScreen === 'scores') {
        ctx.fillStyle = '#fa0';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('TOP PILOTS', 60, 24);
        ctx.fillStyle = '#03120c';
        ctx.fillRect(6, 34, 108, 152);
        ctx.strokeStyle = '#185b48';
        ctx.strokeRect(6.5, 34.5, 107, 151);

        const top = leaderboard.slice(0, 5);
        if (!top.length) {
          ctx.fillStyle = '#8fa'; ctx.font = '8px monospace';
          ctx.fillText('NO SCORES YET', 60, 105);
        } else {
          for (let i = 0; i < top.length; i++) {
            const rowY = 54 + i * 26;
            ctx.textAlign = 'left';
            ctx.fillStyle = i === 0 ? '#ff0' : '#9ef';
            ctx.font = 'bold 7px monospace';
            ctx.fillText('#' + (i + 1) + ' ' + top[i].name.slice(0, 11), 11, rowY);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#3f6';
            ctx.fillText(String(top[i].score), 109, rowY + 10);
          }
          ctx.textAlign = 'center';
        }
        portraitMenuButton('BACK', 20, 198, 80, 20, '#3f6');
      } else {
        ctx.fillStyle = menuScreen === 'hangar' ? '#fd0' : '#3f6';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(menuScreen === 'hangar' ? 'HANGAR' : 'OPTIONS', 60, 16);
        if (menuScreen === 'hangar') {
          drawScrapIcon(38, 22);
          ctx.font = '7px monospace'; ctx.fillStyle = '#fd0'; ctx.textAlign = 'left';
          ctx.fillText(String(meta.scrap), 46, 27);
          ctx.textAlign = 'center';
        }
        const items = menuItems();
        const rowH = menuScreen === 'hangar' ? 32 : 21;
        const startY = menuScreen === 'hangar' ? 38 : 24;
        for (let i = 0; i < items.length; i++) {
          const it = items[i], y = startY + i * rowH;
          const cost = it.key ? upgradeCost(it.key) : null;
          const affordable = cost !== null && meta.scrap >= cost;
          ctx.fillStyle = '#03120c'; ctx.fillRect(5, y, 110, rowH - 2);
          ctx.strokeStyle = i === menuIndex ? '#3f6' : (affordable ? '#fd0' : '#185b48');
          ctx.strokeRect(5.5, y + .5, 109, rowH - 3);
          ctx.font = '6px monospace'; ctx.fillStyle = '#9ef';
          ctx.fillText(it.label, 60, y + 7.5);
          if (it.key) {
            const lv = meta.upgrades[it.key];
            for (let b = 0; b < 4; b++) {
              ctx.fillStyle = b < lv ? '#3f6' : '#183828';
              ctx.fillRect(14 + b * 11, y + 14, 9, 4);
            }
            ctx.textAlign = 'right';
            ctx.fillStyle = cost === null ? '#3f6' : (affordable ? '#fd0' : '#777');
            ctx.fillText(it.value, 108, y + 18);
            ctx.textAlign = 'center';
          } else if (it.value !== undefined) {
            ctx.font = '6px monospace'; ctx.fillStyle = '#fff';
            ctx.fillText(String(it.value).slice(0, 20), 60, y + 15);
          }
        }
      }
    }
    function portraitMenuButton(label, x, y, w, h, color) {
      ctx.fillStyle = '#06160e'; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = color; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
      ctx.fillStyle = color; ctx.font = 'bold 8px monospace';
      ctx.fillText(label, x + w / 2, y + h / 2 + 3);
    }

    function portraitHud() {
      ctx.fillStyle = 'rgba(0,8,12,.88)'; ctx.fillRect(0, 0, 120, 24);
      ctx.strokeStyle = '#123a2c'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 24.5); ctx.lineTo(120, 24.5); ctx.stroke();

      ctx.fillStyle = '#3f6'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'left';
      ctx.fillText(String(score), 4, 9);
      ctx.fillStyle = '#8fa'; ctx.font = '6px monospace';
      ctx.fillText('STG ' + (currentStage + 1), 4, 18);

      for (let i = 0; i < player.maxHealth; i++) {
        drawHeart(44 + (i % 4) * 8, i < 4 ? 3 : 11, i < player.health ? '#f33' : '#311');
      }
      if (combo.mult > 1) {
        ctx.fillStyle = combo.mult === 8 ? '#ff0' : '#0ff';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('x' + combo.mult, 44, 22);
      }

      drawScrapIcon(84, 3);
      ctx.fillStyle = '#fd0'; ctx.font = '6px monospace';
      ctx.fillText(String(meta.scrap + runScrapEarned), 91, 8);
      drawShieldIcon(84, 12, continues > 0);
      ctx.fillStyle = continues > 0 ? '#0ff' : '#f44';
      ctx.fillText('x' + continues, 91, 17);

      ctx.fillStyle = 'rgba(6,31,25,.85)'; ctx.fillRect(97, 27, 20, 16);
      ctx.strokeStyle = '#0ff'; ctx.strokeRect(97.5, 27.5, 19, 15);
      ctx.fillStyle = '#0ff'; ctx.fillRect(104, 31, 2, 8); ctx.fillRect(108, 31, 2, 8);

      if (!settings.autoFire) {
        ctx.fillStyle = 'rgba(0, 90, 30, 0.88)'; ctx.fillRect(82, 208, 34, 24);
        ctx.strokeStyle = '#3f6'; ctx.strokeRect(82.5, 208.5, 33, 23);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('FIRE', 99, 223);
        ctx.textAlign = 'left';
      }

      if (player.specialPower && player.specialCount > 0) {
        const sp = specialPowers.find(s => s.name === player.specialPower);
        const sy = (!settings.autoFire) ? 180 : 208;
        ctx.fillStyle = 'rgba(4,31,16,.9)'; ctx.fillRect(82, sy, 34, 24);
        ctx.strokeStyle = sp.color; ctx.strokeRect(82.5, sy + 0.5, 33, 23);
        ctx.fillStyle = sp.color; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText(sp.short + ' x' + player.specialCount, 99, sy + 15);
        ctx.textAlign = 'left';
      }

      ctx.fillStyle = '#587'; ctx.font = '6px monospace'; ctx.textAlign = 'center';
      ctx.fillText('DRAG ANYWHERE TO FLY', 44, 236);

      if (stageBannerTimer > 0) {
        const alpha = Math.min(1, stageBannerTimer / 30);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0,18,12,0.88)';
        ctx.fillRect(6, 98, 108, 32);
        ctx.strokeStyle = '#3f6';
        ctx.strokeRect(6.5, 98.5, 107, 31);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#3f6'; ctx.font = 'bold 9px monospace';
        ctx.fillText('STAGE 0' + (currentStage + 1), 60, 111);
        ctx.fillStyle = '#fff'; ctx.font = '6px monospace';
        ctx.fillText(currentStageData.name.toUpperCase(), 60, 122);
        ctx.restore();
      }
    }

    function drawPauseScreen() {
      pauseButtons.length = 0;
      if (isPortrait()) {
        ctx.fillStyle = 'rgba(0,6,10,0.85)'; ctx.fillRect(0, 0, 120, 240);
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 16px monospace';
        ctx.fillText('PAUSED', 60, 82);

        const drawPBtn = (label, y, color, action) => {
          ctx.fillStyle = '#071c12'; ctx.fillRect(16, y, 88, 22);
          ctx.strokeStyle = color; ctx.strokeRect(16.5, y + 0.5, 87, 21);
          ctx.fillStyle = color; ctx.font = 'bold 9px monospace';
          ctx.fillText(label, 60, y + 14);
          pauseButtons.push({ x: 16, y, w: 88, h: 22, action });
        };
        drawPBtn('RESUME', 106, '#3f6', () => { paused = false; startMusic(); });
        drawPBtn('QUIT TO MENU', 138, '#f55', () => { paused = false; unlockMenuOrientation(); restart(); });
        return;
      }

      ctx.fillStyle = "rgba(0, 6, 10, 0.82)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", canvas.width / 2, 42);

      const drawLBtn = (label, x, y, w, color, action) => {
        ctx.fillStyle = "#071c12"; ctx.fillRect(x, y, w, 18);
        ctx.strokeStyle = color; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 17);
        ctx.fillStyle = color; ctx.font = "bold 8px monospace";
        ctx.fillText(label, x + w / 2, y + 12);
        pauseButtons.push({ x, y, w, h: 18, action });
      };
      drawLBtn("RESUME", 34, 62, 80, "#3f6", () => { paused = false; startMusic(); });
      drawLBtn("QUIT TO MENU", 126, 62, 80, "#f55", () => { paused = false; unlockMenuOrientation(); restart(); });
    }

    function handlePauseClick(clientX, clientY) {
      const p = canvasPoint(clientX, clientY);
      const hit = pauseButtons.find(b => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
      if (hit) {
        hit.action();
        return true;
      }
      return false;
    }

    function portraitEnd() {
      endButtons.length = 0;
      ctx.fillStyle = 'rgba(0,0,0,.84)'; ctx.fillRect(0, 0, 120, 240);
      const win = currentStage >= TOTAL_STAGES;
      ctx.textAlign = 'center'; ctx.fillStyle = win ? '#3f6' : '#f44';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(win ? 'GALAXY SAVED' : continues > 0 ? 'CONTINUE?' : 'GAME OVER', 60, 54);
      ctx.fillStyle = '#fff'; ctx.font = '10px monospace';
      ctx.fillText('SCORE ' + finalScore, 60, 74);
      ctx.fillStyle = '#fd0'; ctx.font = '8px monospace';
      ctx.fillText('+' + runScrapEarned + ' SCRAP', 60, 88);
      const playAgain = () => { restart(); menuActivate('play'); };
      if (!win && continues > 0) {
        ctx.fillStyle = '#ffb'; ctx.font = '8px monospace';
        ctx.fillText(continues + ' CONTINUES LEFT', 60, 106);
        drawEndButton('CONTINUE', 13, 125, 94, useContinue, '#3f6');
        drawEndButton('RESTART', 13, 160, 94, playAgain, '#0ff');
      } else {
        ctx.fillStyle = '#ffb'; ctx.font = '8px monospace';
        ctx.fillText(scoreSavedThisRun ? 'SCORE SAVED!' : 'SAVE IS OPTIONAL', 60, 106);
        if (!scoreSavedThisRun && !cheatActive)
          drawEndButton('SAVE SCORE', 13, 125, 94, openScoreDialog, '#3f6');
        drawEndButton('RESTART', 13, 160, 94, playAgain, '#0ff');
      }
    }

    function drawPerkDraftScreen() {
      perkButtons.length = 0;
      const locked = performance.now() < perkDraftReadyAt;
      if (isPortrait()) {
        ctx.fillStyle = 'rgba(0,6,12,0.9)';
        ctx.fillRect(0, 0, 120, 240);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#3f6';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('STAGE ' + (currentStage + 1) + ' CLEAR!', 60, 26);
        ctx.fillStyle = '#fff';
        ctx.font = '7px monospace';
        ctx.fillText('CHOOSE UPGRADE', 60, 38);

        for (let i = 0; i < perkChoices.length; i++) {
          const p = perkChoices[i];
          const x = 10, y = 50 + i * 56, w = 100, h = 46;
          ctx.fillStyle = '#071c12';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = locked ? '#354' : p.color;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

          drawPerkIcon(p.id, x + 15, y + 23);
          ctx.textAlign = 'left';
          ctx.fillStyle = p.color;
          ctx.font = 'bold 7px monospace';
          ctx.fillText(p.name, x + 28, y + 19);
          ctx.fillStyle = '#ddd';
          ctx.font = '6px monospace';
          ctx.fillText(p.desc, x + 28, y + 32);
          ctx.textAlign = 'center';
          perkButtons.push({ x, y, w, h, perk: p });
        }
        return;
      }

      ctx.fillStyle = 'rgba(0,6,12,0.88)';
      ctx.fillRect(0, 0, 240, 120);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#3f6';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('STAGE ' + (currentStage + 1) + ' CLEAR! CHOOSE UPGRADE', 120, 20);

      const cardW = 68, cardH = 74, gap = 8;
      const startX = (240 - (cardW * 3 + gap * 2)) / 2;
      for (let i = 0; i < perkChoices.length; i++) {
        const p = perkChoices[i];
        const x = startX + i * (cardW + gap), y = 30;
        ctx.fillStyle = '#071c12';
        ctx.fillRect(x, y, cardW, cardH);
        ctx.strokeStyle = locked ? '#354' : p.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cardW - 1, cardH - 1);

        drawPerkIcon(p.id, x + cardW / 2, y + 18);

        ctx.fillStyle = p.color;
        ctx.font = 'bold 7px monospace';
        ctx.fillText(p.name, x + cardW / 2, y + 36);
        ctx.fillStyle = '#ddd';
        ctx.font = '6px monospace';
        ctx.fillText(p.desc, x + cardW / 2, y + 49);
        ctx.fillStyle = locked ? '#566' : '#8fa';
        ctx.fillText(locked ? 'WAIT...' : '[SELECT]', x + cardW / 2, y + 64);

        perkButtons.push({ x, y, w: cardW, h: cardH, perk: p });
      }
    }

    function drawStartScreen(t) {
      ctx.textAlign = "center";

      if (menuScreen === 'home') {
        ctx.fillStyle = "rgba(0, 10, 14, 0.78)";
        ctx.fillRect(0, 0, 240, 13);
        ctx.textAlign = "left";
        ctx.font = "bold 6px monospace";
        ctx.fillStyle = "#3f6";
        ctx.fillText("1UP " + String(score).padStart(5, '0'), 6, 9);

        ctx.textAlign = "center";
        ctx.fillStyle = "#9ef";
        ctx.fillText("HI-SCORE " + String(hiScore).padStart(6, '0'), 120, 9);

        drawScrapIcon(204, 4);
        ctx.textAlign = "left";
        ctx.fillStyle = "#fd0";
        ctx.fillText(String(meta.scrap), 212, 9);
        ctx.textAlign = "center";

        drawSplitLogo(120, 31, 16, true);
        drawAttractSkirmish(t, 12, 72, 206, 74);

        if (cheatArmed) {
          ctx.font = "6px monospace";
          ctx.fillStyle = Math.floor(t / 300) % 2 === 0 ? "#ff0" : "#f80";
          ctx.fillText("CHEAT ON", 120, 111);
        }
      } else if (menuScreen === 'hangar') {
        ctx.fillStyle = "#fd0";
        ctx.font = "bold 12px monospace";
        ctx.fillText("HANGAR UPGRADES", 120, 12);
        drawScrapIcon(92, 15);
        ctx.textAlign = "left";
        ctx.font = "bold 7px monospace";
        ctx.fillText(String(meta.scrap), 100, 20);
        ctx.textAlign = "center";
      } else if (menuScreen === 'scores') {
        ctx.fillStyle = "#fa0";
        ctx.font = "bold 12px monospace";
        ctx.fillText("TOP 5 LEADERBOARD", 120, 14);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(34, 20, 172, 72);
        ctx.strokeStyle = "#075";
        ctx.strokeRect(34.5, 20.5, 171, 71);

        const top = leaderboard.slice(0, 5);
        if (!top.length) {
          ctx.fillStyle = "#8fa"; ctx.font = "8px monospace";
          ctx.fillText("NO SCORES SAVED YET", 120, 58);
        } else {
          for (let i = 0; i < top.length; i++) {
            const ry = 32 + i * 13;
            ctx.textAlign = "left";
            ctx.fillStyle = i === 0 ? "#ff0" : "#0f0";
            ctx.font = "bold 7px monospace";
            ctx.fillText("#" + (i + 1) + "  " + top[i].name, 42, ry);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.fillText(String(top[i].score), 198, ry);
          }
          ctx.textAlign = "center";
        }
      } else {
        ctx.fillStyle = "#0f0";
        ctx.font = "bold 11px monospace";
        ctx.fillText("OPTIONS", 120, 10);
      }

      const items = menuItems();
      ctx.font = menuScreen === 'home' ? "bold 7px monospace" : "6.5px monospace";
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const sel = i === menuIndex;
        const cost = it.key ? upgradeCost(it.key) : null;
        const affordable = cost !== null && meta.scrap >= cost;

        ctx.fillStyle = sel ? "#0a3a0a" : "rgba(0,0,0,0.65)";
        ctx.fillRect(it.x, it.y, it.w, it.h);
        ctx.strokeStyle = sel ? "#0f0" : (it.key ? (affordable ? "#fd0" : "#442") : "#075");
        ctx.lineWidth = 1;
        ctx.strokeRect(it.x + 0.5, it.y + 0.5, it.w - 1, it.h - 1);
        const ty = it.y + it.h / 2 + 2.3;

        if (it.key) {
          ctx.textAlign = "left";
          ctx.fillStyle = sel ? "#fff" : "#9ef";
          ctx.fillText(it.label, it.x + 6, ty);

          const lv = meta.upgrades[it.key];
          for (let b = 0; b < 4; b++) {
            ctx.fillStyle = b < lv ? "#3f6" : "#183828";
            ctx.fillRect(it.x + 86 + b * 16, it.y + 4, 13, 7);
          }

          ctx.textAlign = "right";
          ctx.fillStyle = cost === null ? "#3f6" : (affordable ? "#fd0" : "#777");
          ctx.fillText(it.value, it.x + it.w - 6, ty);
        } else if (it.value === undefined) {
          ctx.textAlign = "center";
          const btnCol = it.id === 'hangar' ? "#fd0" : (it.id === 'scores' ? "#fa0" : (it.id === 'options' ? "#0ff" : "#3f6"));
          ctx.fillStyle = sel ? "#fff" : btnCol;
          ctx.fillText(it.label, it.x + it.w / 2, ty);
        } else {
          ctx.textAlign = "left";
          ctx.fillStyle = sel ? "#fff" : "#0f0";
          ctx.fillText(it.label, it.x + 7, ty);
          ctx.textAlign = "right";
          ctx.fillStyle = it.on === undefined ? "#ff0" : (it.on ? "#0f0" : "#f55");
          ctx.fillText(it.value, it.x + it.w - 7, ty);
        }
        if (sel && menuScreen !== 'home') { ctx.textAlign = "left"; ctx.fillStyle = "#0f0"; ctx.fillText(">", it.x - 8, ty); }
      }
      ctx.textAlign = "center";
    }

    function drawPlayer() {
      if (touchActive) {
        ctx.save();
        ctx.strokeStyle = "rgba(0,255,180,0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (combo.mult >= 4) {
        const pulse = 11 + Math.sin(performance.now() * 0.015) * 1.5;
        ctx.save();
        ctx.strokeStyle = combo.mult === 8 ? "rgba(255,220,0,0.55)" : "rgba(0,255,255,0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(player.x + player.w / 2, player.y + player.h / 2, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (player.invulnerable && Math.floor(player.invulTimer / (1000 / 60 / 5)) % 2 === 0) return;
      if (player.flashTimer > 0) {
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(player.x, player.y, player.w, player.h);
        player.flashTimer--;
        return;
      }
      if (Math.random() < 0.28 && fxState.particles.length < 320) {
        fxState.particles.push({
          x: player.x,
          y: player.y + player.h / 2 + (Math.random() - 0.5) * 3,
          vx: -1 - Math.random(),
          vy: (Math.random() - 0.5) * 0.3,
          life: 0,
          maxLife: 12,
          color: combo.mult === 8 ? '#0ff' : (Math.random() < 0.5 ? '#fa0' : '#ff8'),
          size: 1
        });
      }
      PLAYER_SPRITE(ctx, player.x, player.y, player.w, player.h);

      if (muzzleFlashTimer > 0) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(player.x + player.w, player.y + player.h / 2 - 2, 3, 4);
        ctx.fillStyle = "#0ff";
        ctx.fillRect(player.x + player.w + 3, player.y + player.h / 2 - 1, 2, 2);
        muzzleFlashTimer--;
      }

      if (runPerks.wingman) {
        const ang = performance.now() * 0.005;
        const wx = player.x + player.w / 2 + Math.cos(ang) * 11 - 2;
        const wy = player.y + player.h / 2 + Math.sin(ang) * 11 - 2;
        ctx.fillStyle = "#3f6";
        ctx.fillRect(wx, wy, 4, 4);
        ctx.fillStyle = "#fff";
        ctx.fillRect(wx + 2, wy + 1, 2, 2);
      }
    }

    function drawBullet(b) {
      const blink = Math.floor(performance.now() / 50) % 2 === 0;
      if (b.beam) {
        ctx.fillStyle = blink ? "rgba(0,255,255,0.8)" : "rgba(0,180,255,0.6)";
        ctx.fillRect(b.x, b.y - 1, b.w, b.h + 2);
        ctx.fillStyle = "#fff";
        ctx.fillRect(b.x, b.y + b.h / 2 - 0.5, b.w, 1);
      } else if (b.wipe) {
        ctx.fillStyle = "rgba(255,255,0,0.25)";
        ctx.fillRect(b.x - 5, b.y, 5, b.h);
        ctx.fillStyle = blink ? "#ff0" : "#fff";
        ctx.fillRect(b.x, b.y, b.w, b.h);
      } else if (b.power === 'missile') {
        ctx.save();
        ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
        ctx.rotate(b.ang || 0);
        ctx.fillStyle = blink ? "#f00" : "#ff0";
        ctx.fillRect(-7, -1, 3, 2);
        ctx.fillStyle = "#ff8800";
        ctx.fillRect(-4, -2, 6, 4);
        ctx.fillStyle = "#fff";
        ctx.fillRect(2, -1, 2, 2);
        ctx.restore();
      } else {
        const col = b.color || (combo.mult === 8 ? "#ff0" : "#0f0");
        ctx.save();
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(b.x - 8, b.y, 8, b.h);
        ctx.globalAlpha = 1;
        if (fxState.glow) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = col;
        }
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.restore();
      }
    }

    function drawEnemy(e) {
      if (e.type === 'enemyBullet') {
        ctx.save();
        ctx.fillStyle = e.color || "#f44";
        if (fxState.glow) {
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 4;
        }
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.restore();
        return;
      }

      const spriteFn = ENEMY_SPRITES[e.sprite] || ENEMY_SPRITES.octopus;
      const drawCol = (e.carrier && Math.floor(performance.now() / 150) % 2 === 0) ? "#fff" : e.color;

      ctx.save();
      if (fxState.glow) {
        ctx.shadowColor = drawCol;
        ctx.shadowBlur = 3;
      }

      if (isPortrait() && SPACE_INVADER_SPRITES.has(e.sprite)) {
        const cx = e.x + e.w / 2;
        const cy = e.y + e.h / 2;
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 2);
        spriteFn(ctx, -e.w / 2, -e.h / 2, e.w, e.h, drawCol);
      } else {
        spriteFn(ctx, e.x, e.y, e.w, e.h, drawCol);
      }
      ctx.restore();

      if (e.type === 'mine' && e.armed && Math.floor(performance.now() / 200) % 2 === 0) {
        ctx.strokeStyle = "#f00";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2, e.y + e.h / 2, e.w / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function drawBoss(b) {
      computeBossRects(b, performance.now());

      if (b.health / b.maxHealth <= 0.35 && Math.random() < 0.35 && fxState.particles.length < 320) {
        fxState.particles.push({
          x: b.x + Math.random() * b.w,
          y: b.y + Math.random() * b.h,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.6 - Math.random() * 0.6,
          life: 0,
          maxLife: 22,
          color: Math.random() < 0.35 ? '#ff0' : '#777',
          size: Math.random() < 0.4 ? 2 : 1
        });
      }

      if (b.flashTimer > 0) {
        b.graphic(ctx, b.x, b.y, b.w, b.h, "#fff", true, b);
        b.flashTimer--;
        return;
      }
      b.graphic(ctx, b.x, b.y, b.w, b.h, b.color, false, b);
    }

    function drawExplosion(exp) {
      const { x, y, size, life } = exp;
      const alpha = life / exp.maxLife;
      ctx.save();
      ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(255, 255, 0, ${alpha})`;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.8})`;
      ctx.fillRect(x - size / 4, y - size / 4, size / 2, size / 2);
      ctx.restore();
    }

    function drawScrap(s) {
      const blink = Math.floor(performance.now() / 120) % 2 === 0;
      ctx.save();
      ctx.fillStyle = blink ? "#ff0" : "#fa0";
      if (fxState.glow) {
        ctx.shadowColor = "#fd0";
        ctx.shadowBlur = 4;
      }
      ctx.fillRect(s.x + 1, s.y, 2, 4);
      ctx.fillRect(s.x, s.y + 1, 4, 2);
      ctx.restore();
    }

    function drawPowerup(p) {
      if (p.type === 'health') {
        drawHeart(p.x + 0.5, p.y + 1, "#f22");
        return;
      }
      const sp = specialPowers.find(s => s.name === p.type);
      const col = sp ? sp.color : "#ff0";
      ctx.fillStyle = "#000";
      ctx.fillRect(p.x, p.y, 9, 9);
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, 8, 8);
      ctx.fillStyle = "#fff";
      if (p.type === 'missile') {
        ctx.fillRect(p.x + 1, p.y + 3, 5, 3);
        ctx.fillRect(p.x + 6, p.y + 4, 2, 1);
      } else if (p.type === 'laser') {
        ctx.fillRect(p.x + 1, p.y + 4, 7, 1);
        ctx.fillRect(p.x + 1, p.y + 3, 1, 3);
      } else if (p.type === 'wipeout') {
        ctx.fillRect(p.x + 4, p.y + 1, 1, 7);
        ctx.fillRect(p.x + 2, p.y + 1, 1, 7);
      }
    }

    function drawButtons(t) {
      ctx.fillStyle = "rgba(0, 20, 15, 0.75)";
      ctx.fillRect(222, 2, 15, 11);
      ctx.strokeStyle = "#0ff";
      ctx.lineWidth = 1;
      ctx.strokeRect(222.5, 2.5, 14, 10);
      ctx.fillStyle = "#0ff";
      ctx.fillRect(227, 5, 2, 5);
      ctx.fillRect(231, 5, 2, 5);

      if (!settings.autoFire) {
        ctx.fillStyle = "rgba(0, 90, 30, 0.85)";
        ctx.fillRect(204, 100, 32, 16);
        ctx.strokeStyle = "#3f6";
        ctx.strokeRect(204.5, 100.5, 31, 15);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 7px monospace";
        ctx.textAlign = "center";
        ctx.fillText("FIRE", 220, 110.5);
        ctx.textAlign = "left";
      }

      if (player.specialPower && player.specialCount > 0) {
        const sp = specialPowers.find(s => s.name === player.specialPower);
        const specialReady = t - lastSpecialShot >= specialCooldown;
        const progress = specialReady ? 1 : (t - lastSpecialShot) / specialCooldown;
        const bx = 204;
        const by = (!settings.autoFire) ? 81 : 100;
        const bw = 32, bh = 16;

        ctx.fillStyle = "rgba(10, 10, 10, 0.85)";
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = specialReady ? sp.color : "#422";
        ctx.globalAlpha = specialReady ? 0.35 : 0.25;
        ctx.fillRect(bx, by, bw * progress, bh);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = specialReady ? sp.color : "#666";
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 7px monospace";
        ctx.textAlign = "center";
        ctx.fillText(sp.short + " x" + player.specialCount, bx + bw / 2, by + 10.5);
        ctx.textAlign = "left";
      }
    }

    function drawScoreAndHealth() {
      ctx.fillStyle = "rgba(0, 8, 12, 0.65)";
      ctx.fillRect(0, 0, 240, 14);

      ctx.textAlign = "left";
      ctx.font = "bold 7px monospace";
      ctx.fillStyle = "#3f6";
      ctx.fillText(String(score), 5, 9);

      ctx.fillStyle = "#8fa";
      ctx.font = "6px monospace";
      ctx.fillText("STG " + (currentStage + 1), 46, 8);

      const prog = Math.min(1, minionSpawnTracker / Math.max(1, currentStageData.minionCount));
      ctx.fillStyle = "#123";
      ctx.fillRect(46, 10, 24, 2);
      ctx.fillStyle = stageState === 'MINIONS' ? "#0ff" : "#f55";
      ctx.fillRect(46, 10, 24 * prog, 2);

      for (let i = 0; i < player.maxHealth; i++) {
        drawHeart(78 + i * 8, 3, i < player.health ? "#f22" : "#311");
      }

      const shieldX = 78 + player.maxHealth * 8 + 4;
      drawShieldIcon(shieldX, 4, continues > 0);
      ctx.fillStyle = continues > 0 ? "#0ff" : "#f44";
      ctx.fillText("x" + continues, shieldX + 7, 9);

      const scrapX = shieldX + 22;
      drawScrapIcon(scrapX, 4);
      ctx.fillStyle = "#fd0";
      ctx.fillText(String(meta.scrap + runScrapEarned), scrapX + 7, 9);

      if (combo.mult > 1) {
        ctx.fillStyle = combo.mult === 8 ? "#ff0" : "#0ff";
        ctx.font = "bold 6px monospace";
        ctx.fillText(combo.mult === 8 ? "OVERDRIVE x8" : "COMBO x" + combo.mult, 5, 21);
        const barW = 34 * Math.max(0, combo.timer / combo.maxTimer);
        ctx.fillRect(5, 23, barW, 1.5);
      }

      if (cheatActive) {
        ctx.font = "6px monospace";
        ctx.fillStyle = "#ff0";
        ctx.fillText("CHEAT", 4, 116);
      }

      if (stageBannerTimer > 0) {
        const alpha = Math.min(1, stageBannerTimer / 30);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(0, 18, 12, 0.85)";
        ctx.fillRect(54, 26, 132, 22);
        ctx.strokeStyle = "#3f6";
        ctx.strokeRect(54.5, 26.5, 131, 21);
        ctx.textAlign = "center";
        ctx.fillStyle = "#3f6";
        ctx.font = "bold 7px monospace";
        ctx.fillText("STAGE 0" + (currentStage + 1) + " // " + currentStageData.name.toUpperCase(), 120, 40);
        ctx.restore();
      }
    }

    function drawEndScreen() {
      endButtons.length = 0;
      const isWin = currentStage >= TOTAL_STAGES;
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center';
      ctx.fillStyle = isWin ? '#3f6' : '#f44';
      ctx.font = 'bold 16px monospace';
      if (isWin) {
        ctx.fillText('GALAXY DEFENDED!', 120, 26);
      } else if (continues > 0) {
        ctx.fillText('CONTINUE?', 120, 28);
      } else {
        ctx.fillText('GAME OVER', 120, 26);
      }
      ctx.fillStyle = '#fff'; ctx.font = '9px monospace';
      ctx.fillText('SCORE: ' + finalScore + '   +' + runScrapEarned + ' SCRAP', 120, 44);
      const playAgain = () => {
        restart();
        menuActivate('play');
      };
      if (!isWin && continues > 0) {
        ctx.fillStyle = '#ffb'; ctx.font = '8px monospace';
        ctx.fillText(continues + ' CONTINUES LEFT', 120, 57);
        drawEndButton('CONTINUE', 12, 70, 103, useContinue, '#3f6');
        drawEndButton('RESTART', 125, 70, 103, playAgain, '#0ff');
      } else {
        if (cheatActive) {
          ctx.fillStyle = '#ffb'; ctx.font = '8px monospace';
          ctx.fillText('CHEAT MODE - NO LEADERBOARD', 120, 58);
        } else if (scoreSavedThisRun) {
          ctx.fillStyle = '#3f6'; ctx.font = '9px monospace';
          ctx.fillText('SCORE SAVED!', 120, 58);
        } else {
          ctx.fillStyle = '#ffb'; ctx.font = '8px monospace';
          ctx.fillText('SAVE YOUR SCORE? (OPTIONAL)', 120, 58);
        }
        if (!cheatActive && !scoreSavedThisRun) {
          drawEndButton('SAVE SCORE', 12, 70, 103, openScoreDialog, '#3f6');
          drawEndButton('RESTART', 125, 70, 103, playAgain, '#0ff');
        } else {
          drawEndButton('RESTART', 60, 70, 120, playAgain, '#0ff');
        }
      }
    }

    function drawBossIntro() {
      if (boss && stageState === 'BOSS_INTRO') {
        ctx.fillStyle = "#ff0";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`WARNING: ${boss.type.toUpperCase()}`, 120, 60);
      }
    }

    // -------------------------------------------------
    // Collision & Mixed-Roster Spawning
    // -------------------------------------------------
    function isColliding(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x &&
             a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function pierceHit(b, target) {
      if (!b.hit) b.hit = new Map();
      const last = b.hit.get(target);
      if (last !== undefined && b.age - last < (b.tick || 1e9)) return false;
      b.hit.set(target, b.age);
      return true;
    }

    function spawnEnemy() {
      const data = stages[currentStage];
      const type = data.enemyTypes[Math.floor(Math.random() * data.enemyTypes.length)];
      const remaining = data.minionCount - minionSpawnTracker;
      const W = 240, H = 120;
      const rnd = (a, b) => a + Math.random() * (b - a);
      const size = (type === 'mine' ? 9 : 13 + Math.floor(Math.random() * 4)) * 0.85;

      let sprite;
      if (type === 'invader') {
        const invPool = ['squid', 'crab', 'octopus'];
        sprite = invPool[Math.floor(Math.random() * invPool.length)];
      } else if (type === 'basic') {
        sprite = Math.random() < 0.5 ? 'dart' : 'octopus';
      } else if (type === 'kamikaze') {
        sprite = 'wasp';
      } else if (type === 'sine') {
        sprite = 'jelly';
      } else if (type === 'shooting' || type === 'fast-bullet') {
        sprite = Math.random() < 0.5 ? 'pod' : 'crab';
      } else if (type === 'mine') {
        sprite = 'spikemine';
      } else if (type === 'zigzag') {
        sprite = Math.random() < 0.5 ? 'wasp' : 'squid';
      } else {
        sprite = 'octopus';
      }

      const colors = ["#4af", "#f5f", "#0ff", "#fa0", "#3f6", "#ff0", "#f55", "#c4f"];
      const color = colors[(currentStage + sprite.length) % colors.length];
      const speed = (1.05 + Math.random() * 0.4) * data.enemySpeedFactor * diff().enemySpeed;

      const stageArmor = currentStage >= 4 && (sprite === 'pod' || sprite === 'crab') ? 1 : 0;
      const baseHp = ((type === 'shooting' || type === 'fast-bullet') ? 2 : 1) + stageArmor;

      const group = [];
      const make = (x, y, extra) => {
        const e = Object.assign({
          x: x, y: y, w: size, h: size * 0.85, speed: speed,
          type: type, sprite: sprite, color: color,
          health: baseHp,
          points: sprite === 'crab' || sprite === 'pod' ? 10 : (sprite === 'squid' ? 15 : 5),
          lastShot: 0,
          shotInterval: (type === 'fast-bullet' ? 850 + Math.random() * 800 : 1100 + Math.random() * 1000) * diff().fireRate,
          armed: type !== 'mine',
          armedTimer: type === 'mine' ? 120 : 0,
          directionY: type === 'zigzag' ? (Math.random() < 0.5 ? 1 : -1) : 0
        }, extra || {});
        if (type === 'kamikaze') e.speed *= 1.45;
        enemies.push(e);
        group.push(e);
      };

      const X0 = W + 10;
      if (type === 'sine') {
        const n = Math.min(remaining, 5 + Math.floor(Math.random() * 3));
        const amp = rnd(14, 24);
        const baseY = rnd(amp + 14, H - size - amp - 8);
        for (let i = 0; i < n; i++) make(X0 + i * 16, baseY, { baseY: baseY, amp: amp });
      } else if (type === 'shooting' || type === 'fast-bullet') {
        const n = Math.min(remaining, 3);
        for (let i = 0; i < n; i++) make(X0 + i * 15, (H * (i + 1)) / (n + 1) - size / 2 + rnd(-6, 6));
      } else if (type === 'kamikaze') {
        const n = Math.min(remaining, 3);
        for (let i = 0; i < n; i++) make(X0 + i * 22, rnd(16, H - size - 8));
      } else if (type === 'mine') {
        const n = Math.min(remaining, 2);
        for (let i = 0; i < n; i++) make(X0 + i * 32, rnd(18, H - size - 10));
      } else if (type === 'zigzag') {
        const n = Math.min(remaining, 3);
        for (let i = 0; i < n; i++) make(X0 + i * 20, rnd(16, H - size - 8));
      } else {
        const pattern = ['line', 'vee', 'column', 'stairs', 'phalanx'][Math.floor(Math.random() * 5)];
        if (pattern === 'phalanx') {
          const cols = Math.min(3, Math.ceil(remaining / 2));
          const rows = Math.min(2, Math.floor(remaining / cols));
          const y0 = rnd(18, H - rows * (size + 5) - 10);
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (group.length < remaining) make(X0 + c * (size + 6), y0 + r * (size + 5));
            }
          }
        } else if (pattern === 'line') {
          const n = Math.min(remaining, 4 + Math.floor(Math.random() * 3));
          const y = rnd(16, H - size - 10);
          for (let i = 0; i < n; i++) make(X0 + i * (size + 10), y);
        } else if (pattern === 'vee') {
          const n = Math.min(remaining, 5);
          const y0 = rnd(32, H - size - 32);
          make(X0, y0);
          for (let k = 1; group.length < n; k++) {
            make(X0 + k * 12, y0 - k * 14);
            if (group.length < n) make(X0 + k * 12, y0 + k * 14);
          }
        } else if (pattern === 'column') {
          const n = Math.min(remaining, 3 + Math.floor(Math.random() * 2));
          const total = n * (size + 4);
          const y0 = rnd(16, Math.max(16, H - total - 8));
          for (let i = 0; i < n; i++) make(X0, y0 + i * (size + 4));
        } else {
          const n = Math.min(remaining, 5);
          const span = (n - 1) * (size + 2);
          const down = Math.random() < 0.5;
          const yStart = rnd(16, Math.max(16, H - size - span - 8));
          for (let i = 0; i < n; i++) make(X0 + i * 12, down ? yStart + i * (size + 2) : yStart + span - i * (size + 2));
        }
      }

      if (type !== 'mine' && group.length > 0 && Math.random() < diff().carrier) group[group.length - 1].carrier = true;
      minionSpawnTracker += group.length;
    }

    function spawnBonusUfo() {
      enemies.push({
        x: 248, y: 17, w: 14, h: 9,
        speed: 1.55 * diff().enemySpeed,
        type: 'ufo',
        sprite: 'ufo',
        color: '#f33',
        health: 2,
        points: 150,
        carrier: true
      });
    }

    function shootSingleBullet() {
      const now = performance.now();
      const cannonLv = meta.upgrades.cannon;
      const cannonCooldownMult = cannonLv >= 2 ? 0.78 : 1;
      const overdriveMult = combo.mult === 8 ? 0.72 : 1;
      const effectiveCooldown = baseFireCooldown * cannonCooldownMult * runPerks.fireRateMult * overdriveMult;

      if (now - lastFireTime >= effectiveCooldown) {
        const sx = player.x + player.w;
        const cy = player.y + player.h / 2;
        const col = combo.mult === 8 ? '#ff0' : '#0f0';

        const mk = (x, y, vy = 0) => ({
          x, y, w: 3.5, h: 1.7, speed: 5, vy,
          color: col, pierce: runPerks.pierce, age: 0
        });

        if (cannonLv === 1 || cannonLv === 2) {
          player.bullets.push(mk(sx, cy - 1));
        } else if (cannonLv === 3) {
          player.bullets.push(mk(sx, cy - 3.5));
          player.bullets.push(mk(sx, cy + 1.8));
        } else {
          player.bullets.push(mk(sx, cy - 1, 0));
          player.bullets.push(mk(sx - 1, cy - 3.5, -0.45));
          player.bullets.push(mk(sx - 1, cy + 1.8, 0.45));
        }

        if (runPerks.wingman) {
          const ang = now * 0.005;
          const wx = player.x + player.w / 2 + Math.cos(ang) * 11;
          const wy = player.y + player.h / 2 + Math.sin(ang) * 11;
          player.bullets.push({ x: wx + 2, y: wy - 0.5, w: 3, h: 1.4, speed: 5, vy: 0, color: '#3f6', pierce: false, age: 0 });
        }

        muzzleFlashTimer = 2;
        playPlayerShotSound();
        lastFireTime = now;
      }
    }

    function fireSpecial(t) {
      if (!isSpecialFiring) return;
      if (!player.specialPower || player.specialCount <= 0) { isSpecialFiring = false; return; }
      if (t - lastSpecialShot < specialCooldown) return;
      const power = specialPowers.find(sp => sp.name === player.specialPower);
      const sx = player.x + player.w, cy = player.y + player.h / 2;
      const base = { special: true, damage: power.damage, power: power.name, color: power.color, age: 0 };
      if (power.name === 'missile') {
        player.bullets.push(Object.assign({ x: sx, y: cy - 2, w: 8, h: 4, speed: 2, ang: 0 }, base));
      } else if (power.name === 'laser') {
        player.bullets.push(Object.assign({ x: sx, y: cy - 1.5, w: 240 - sx, h: 3, speed: 0, beam: true, life: 24, tick: 5 }, base));
      } else if (power.name === 'wipeout') {
        player.bullets.push(Object.assign({ x: sx, y: 0, w: 4, h: 120, speed: 5, wipe: true }, base));
      }
      playSpecialShotSound(power.name);
      triggerHaptic(30);
      player.specialCount--;
      if (player.specialCount <= 0) { player.specialCount = 0; player.specialPower = null; }
      lastSpecialShot = t;
      isSpecialFiring = false;
    }

    function enemyFire(entity, t, bulletSpeed = 2) {
      if (t - entity.lastShot >= entity.shotInterval) {
        let speed = (entity.type === 'fast-bullet' ? 3.5 : bulletSpeed) * diff().bulletSpeed;
        enemies.push({ x: entity.x - 5, y: entity.y + entity.h / 2 - 1, w: 3.5, h: 1.7, speed: speed, type: 'enemyBullet' });
        playEnemyShotSound(entity);
        entity.lastShot = t;
      }
    }

    // ---------- Boss helpers ----------
    function bossShoot(b, o) {
      const blt = Object.assign({ w: 3.5, h: 1.7, speed: 2.5, type: 'enemyBullet', color: b.color }, o);
      blt.speed *= diff().bulletSpeed;
      enemies.push(blt);
    }
    function aimDir(x, y, speed) {
      const px = player.x + player.w / 2, py = player.y + player.h / 2;
      const dx = Math.max(20, x - px);
      return Math.max(-0.6, Math.min(0.6, ((py - y) / dx) * speed / 2));
    }
    function schedule(b, delay, fn) { b.queue.push({ at: b.now + delay, fn: fn }); }
    function bounceY(b, spd) {
      b.y += spd * b.directionY;
      if (b.y <= 14) { b.y = 14; b.directionY = 1; }
      if (b.y >= 120 - b.h) { b.y = 120 - b.h; b.directionY = -1; }
    }

    function bossRects(b) {
      return b.rects || [{ x: b.x, y: b.y, w: b.w, h: b.h, weak: true, key: 'boss' }];
    }

    function computeBossRects(b, now) {
      if (b.kind === 'serpent') {
        const n = 9, list = [];
        const amp = (b.h - 14.4) / 2, phase = now * 0.004;
        for (let k = 0; k < n; k++) {
          const size = (k === 0 ? 18 : (k === n - 1 ? 9 : 14 - Math.floor(k / 3))) * 0.80;
          const sx = b.x + k * (b.w - 14.4) / (n - 1);
          const sy = b.y + b.h / 2 + Math.sin(phase + k * 0.8) * amp - size / 2;
          list.push({ x: sx, y: sy, w: size, h: size, weak: true, key: 'boss' });
        }
        b.rects = list;
      } else if (b.kind === 'core') {
        const r = b.health / b.maxHealth;
        b.phase = r > 0.66 ? 1 : (r > 0.33 ? 2 : 3);
        const slotTop = Math.floor(now / 2200) % 2 === 0;
        const eyeTop = { x: b.x + 0.1 * b.w, y: b.y + 0.14 * b.h, w: b.w * (14 / 60), h: b.h * (14 / 100), key: 'eyeTop', open: b.phase === 1 ? slotTop : true };
        const eyeBot = { x: b.x + 0.1 * b.w, y: b.y + 0.86 * b.h - b.h * (14 / 100), w: b.w * (14 / 60), h: b.h * (14 / 100), key: 'eyeBot', open: b.phase === 1 ? !slotTop : true };
        const core = { x: b.x + 0.28 * b.w, y: b.y + 0.5 * b.h - b.h * 0.08, w: b.w * (16 / 60), h: b.h * 0.16, key: 'core', open: b.phase === 3 };
        b.eyes = [eyeTop, eyeBot, core];
        const list = [];
        for (const e of b.eyes) if (e.open) list.push({ x: e.x, y: e.y, w: e.w, h: e.h, weak: true, key: e.key });
        list.push({ x: b.x, y: b.y, w: b.w, h: b.h, weak: false, key: 'hull' });
        b.rects = list;
      }
    }

    function updateBossMovement(b, t, sf) {
      const H = 120, W = 240, st = b.st;
      const homeX = W - b.w - 20;
      switch (b.kind) {
        case 'scout':     bounceY(b, 0.9 * sf); break;
        case 'turret':    bounceY(b, 0.6 * sf); break;
        case 'artillery': bounceY(b, 0.3 * sf); break;
        case 'crawler': {
          if (!st.mode) { st.mode = 'floor'; st.timer = t + 2200; st.dir = -1; }
          b.x += st.dir * 0.45 * sf;
          if (b.x <= W * 0.5) { b.x = W * 0.5; st.dir = 1; }
          if (b.x >= homeX) { b.x = homeX; st.dir = -1; }
          const floorY = H - b.h, ceilY = 14;
          const step = (target, spd) => { b.y += Math.sign(target - b.y) * Math.min(Math.abs(target - b.y), spd); };
          if (st.mode === 'floor' || st.mode === 'ceiling') {
            const target = st.mode === 'floor' ? floorY : ceilY;
            step(target, 3 * sf);
            if (t > st.timer && Math.abs(b.y - target) < 1) st.mode = st.mode === 'floor' ? 'toCeiling' : 'toFloor';
          } else {
            const target = st.mode === 'toCeiling' ? ceilY : floorY;
            step(target, 3.8 * sf);
            if (Math.abs(b.y - target) < 0.5) {
              st.mode = st.mode === 'toCeiling' ? 'ceiling' : 'floor';
              st.timer = t + 1800 + Math.random() * 1400;
            }
          }
          break;
        }
        case 'interceptor': {
          if (!st.mode) { st.mode = 'track'; st.timer = t + 2400; }
          const py = player.y + player.h / 2 - b.h / 2;
          b.y += Math.max(-2.4 * sf, Math.min(2.4 * sf, py - b.y));
          if (st.mode === 'track') {
            if (t > st.timer) { st.mode = 'lunge'; st.lunged = false; }
          } else if (st.mode === 'lunge') {
            b.x -= 3.4 * sf;
            if (b.x <= W * 0.42) st.mode = 'retreat';
          } else {
            b.x += 2.2 * sf;
            if (b.x >= homeX) { b.x = homeX; st.mode = 'track'; st.timer = t + 2200 + Math.random() * 1200; }
          }
          break;
        }
        case 'skull': {
          if (st.tx === undefined || t > st.mvNext) {
            st.tx = W * 0.45 + Math.random() * (homeX - W * 0.45);
            st.ty = 14 + Math.random() * (H - b.h - 14);
            st.mvNext = t + 500 + Math.random() * 900;
          }
          b.x += (st.tx - b.x) * 0.05 * sf;
          b.y += (st.ty - b.y) * 0.05 * sf + (Math.random() - 0.5) * 1.2 * sf;
          break;
        }
        case 'serpent':
          b.x = homeX + Math.sin(t * 0.0006) * 14;
          b.y = 14 + (H - 14 - b.h) / 2 + Math.sin(t * 0.0009) * (H - 14 - b.h) / 2;
          break;
        case 'core':
          b.x = homeX;
          b.y = 14 + (H - 14 - b.h) / 2 + Math.sin(t * 0.001) * 6;
          break;
      }
      b.x = Math.max(0, Math.min(b.x, homeX + (b.kind === 'serpent' ? 14 : 0)));
      b.y = Math.max(14, Math.min(b.y, H - b.h));
    }

    function updateBossAttack(b, t) {
      b.now = t;
      if (cheatActive) { b.queue.length = 0; return; }
      const st = b.st;
      for (let i = b.queue.length - 1; i >= 0; i--) {
        if (t >= b.queue[i].at) { const q = b.queue.splice(i, 1)[0]; q.fn(); }
      }
      if (st.next === undefined) st.next = t + 1100;
      const cy = b.y + b.h / 2;
      let fired = false;

      switch (b.kind) {
        case 'scout':
          if (t >= st.next) {
            bossShoot(b, { x: b.x - 5, y: cy - 1, speed: 2.3 });
            st.next = t + 1300; fired = true;
          }
          break;

        case 'turret':
          if (t >= st.next) {
            const top = st.side !== 1;
            const mx = b.x + 0.3 * b.w;
            const my = top ? b.y + 0.07 * b.h : b.y + 0.93 * b.h - 2;
            const dir = top ? 0.12 : -0.12;
            for (let k = 0; k < 2; k++)
              schedule(b, k * 140, () => bossShoot(b, { x: mx, y: my, speed: 2.6, dirY: dir }));
            st.side = top ? 1 : 0;
            st.next = t + 650; fired = true;
          }
          break;

        case 'crawler':
          if ((st.mode === 'floor' || st.mode === 'ceiling') && t >= st.next) {
            for (let k = 0; k < 5; k++) {
              schedule(b, k * 70, () => {
                const y = b.y + b.h / 2;
                bossShoot(b, { x: b.x - 3, y: y, w: 3, h: 3, speed: 3.2, dirY: aimDir(b.x, y, 3.2) + (Math.random() - 0.5) * 0.2, color: "#ffb" });
              });
            }
            st.next = t + 1500; fired = true;
          }
          break;

        case 'interceptor': {
          const burst = (n) => {
            for (let k = 0; k < n; k++)
              schedule(b, k * 60, () => {
                const y = b.y + b.h / 2 - 1;
                bossShoot(b, { x: b.x - 8, y: y, w: 12, h: 2, speed: 5.2, dirY: aimDir(b.x, y, 5.2), color: "#fff" });
              });
          };
          if (st.mode === 'track' && t >= st.next) { burst(4); st.next = t + 1100; fired = true; }
          if (st.mode === 'lunge' && !st.lunged) { burst(6); st.lunged = true; fired = true; }
          break;
        }

        case 'artillery':
          if (t >= st.next) {
            for (let k = 0; k < 7; k++)
              bossShoot(b, { x: b.x - 6, y: cy - 2, w: 6, h: 4, speed: 1.7, dirY: (k - 3) * 0.15 });
            schedule(b, 650, () => {
              for (let k = 0; k < 3; k++)
                bossShoot(b, { x: b.x - 8, y: b.y + b.h / 2 - 3 + (k - 1) * 14, w: 8, h: 6, speed: 1.5 });
            });
            st.next = t + 2300; fired = true;
          }
          break;

        case 'skull':
          if (t >= st.next) {
            const wave = (n, off) => {
              for (let k = 0; k < n; k++)
                bossShoot(b, { x: b.x - 4, y: b.y + b.h / 2 - 2, w: 4, h: 4, speed: 2.1, dirY: (k - off) * 0.14 });
            };
            wave(9, 4);
            schedule(b, 450, () => wave(8, 3.5));
            st.next = t + 1700; fired = true;
          }
          break;

        case 'serpent': {
          const head = b.rects && b.rects[0];
          if (head && t >= st.next) {
            const hx = head.x, hy = head.y + head.h / 2;
            const a = aimDir(hx, hy, 2.4);
            for (let k = -1; k <= 1; k++)
              bossShoot(b, { x: hx - 4, y: hy - 2, w: 4, h: 4, speed: 2.4, dirY: a + k * 0.12 });
            st.next = t + 1400; fired = true;
          }
          if (b.rects && (st.next2 === undefined || t >= st.next2)) {
            const r = b.rects[2 + Math.floor(Math.random() * 6)];
            bossShoot(b, { x: r.x, y: r.y + r.h / 2 - 2, w: 4, h: 4, speed: 2, dirY: aimDir(r.x, r.y, 2), color: "#af4" });
            st.next2 = t + 800;
          }
          break;
        }

        case 'core': {
          const ph = b.phase || 1;
          const open = (b.eyes || []).filter(e => e.open && e.key !== 'core');
          const eyesList = open.length ? open : (b.eyes || []).slice(0, 2);
          if (st.fan === undefined) { st.fan = t + 1000; st.beam = t + 2200; st.missile = t + 2600; }
          if (t >= st.fan) {
            const n = ph === 3 ? 7 : 5;
            for (const e of eyesList)
              for (let k = 0; k < n; k++)
                bossShoot(b, { x: e.x - 4, y: e.y + e.h / 2 - 2, w: 4, h: 4, speed: 2.2, dirY: (k - (n - 1) / 2) * 0.16 });
            st.fan = t + (ph === 1 ? 1700 : ph === 2 ? 1400 : 1000); fired = true;
          }
          if (t >= st.beam) {
            const shooters = ph === 3 ? eyesList : [eyesList[Math.floor(Math.random() * eyesList.length)]];
            for (const e of shooters)
              bossShoot(b, { x: e.x - 26, y: e.y + e.h / 2 - 1, w: 26, h: 3, speed: 4, color: "#0ff" });
            st.beam = t + (ph === 1 ? 3000 : ph === 2 ? 2400 : 1800); fired = true;
          }
          if (ph >= 2 && t >= st.missile) {
            for (let k = 0; k < 2; k++) {
              const e = eyesList[k % eyesList.length];
              schedule(b, k * 250, () => bossShoot(b, { x: e.x - 4, y: e.y + e.h / 2 - 1, w: 5, h: 3, speed: 1.8, homing: 0.05, color: "#f80" }));
            }
            st.missile = t + (ph === 2 ? 2600 : 1800); fired = true;
          }
          break;
        }
      }
      if (fired) playEnemyShotSound(b);
    }

    function createExplosion(x, y) {
      explosions.push({ x: x, y: y, size: 5, maxLife: 20, life: 20 });
      triggerExplosionFx(x, y);
      playExplosionSound();
    }

    function spawnScrap(x, y, amount = 1) {
      if (cheatActive) return;
      const total = Math.max(1, Math.round(amount * runPerks.scrapMult));
      for (let i = 0; i < total; i++) {
        scraps.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          w: 4, h: 4,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          value: 1
        });
      }
    }

    function dropPowerup(x, y) {
      const types = ['missile', 'laser', 'wipeout'];
      if (player.health < player.maxHealth) types.push('health', 'health');
      const type = types[Math.floor(Math.random() * types.length)];
      powerups.push({ x: x, y: y, w: 9, h: 9, speed: 1, type: type });
    }

    function useContinue() {
      if (continues > 0) {
        continues--;
        player.health = player.maxHealth;
        player.bullets.length = 0;
        enemies = enemies.filter(e => e.type !== 'enemyBullet');
        resetCombo();

        gameOver = false;
        startMusic();
        player.invulnerable = true;
        player.invulTimer = player.invulDuration * 2;
        player.x = 20;
        player.y = 53;
        finalScore = score;
      }
    }

    function beginNextStage() {
      currentStage++;
      currentStageData = stages[currentStage];
      minionSpawnTracker = 0;
      stageUfoSpawned = false;
      stageBannerTimer = 140;
      initStars(currentStageData.starDensity);
      playLevelUpSound();

      player.bullets.length = 0;
      enemies = [];
      powerups.length = 0;
      scraps.length = 0;
      boss = null;
      stageState = 'MINIONS';
    }

    function advanceStage() {
      if (currentStage + 1 < TOTAL_STAGES) {
        openPerkDraft();
      } else {
        currentStage = TOTAL_STAGES;
        finalScore = score;
        gameOver = true;
        endTouchStart = null;
        endScreenReadyAt = performance.now() + END_SCREEN_TOUCH_DELAY;
        suppressMouseUntil = endScreenReadyAt;
        stopMusic();
      }
    }

    function takeDamage() {
      if (player.invulnerable) return;
      player.health--;
      player.flashTimer = 5;
      resetCombo();
      triggerDamageFx();
      triggerHaptic(55);
      if (player.health <= 0) {
        finalScore = score;
        gameOver = true;
        endTouchStart = null;
        endScreenReadyAt = performance.now() + END_SCREEN_TOUCH_DELAY;
        suppressMouseUntil = endScreenReadyAt;
        createExplosion(player.x + player.w / 2, player.y + player.h / 2);
        playGameOverSound();
        stopMusic();
      } else {
        player.invulnerable = true;
        player.invulTimer = player.invulDuration;
        playSound({ frequency: 160, duration: 0.1, type: 'triangle', volume: 0.2, endFrequency: 120, detune: -50 });
      }
    }

    function restart() {
      player.x = 20; player.y = 53; player.bullets = [];
      player.specialPower = null; player.specialCount = 0;
      player.invulnerable = false; player.invulTimer = 0; player.flashTimer = 0;
      enemies = []; explosions.length = 0; powerups.length = 0; scraps.length = 0;
      fxState.particles.length = 0; fxState.rings.length = 0; fxState.floatingTexts.length = 0;
      fxState.trauma = 0; fxState.flash = 0;
      score = 0; lastEnemySpawn = 0; gameOver = false; started = false;
      touchActive = false; movementTouchId = null; scoreSavedThisRun = false; endButtons.length = 0;
      endTouchStart = null; endScreenReadyAt = 0; suppressMouseUntil = performance.now() + 500;
      for (const key in keys) { keys[key] = false; }
      boss = null; currentStage = 0; minionSpawnTracker = 0; stageUfoSpawned = false; stageState = 'MINIONS';
      currentStageData = stages[currentStage];
      applyLoadout();
      cheatArmed = false; cheatActive = false; cheatBuffer = [];
      menuScreen = 'home'; menuIndex = 0;
      portraitLayout();
      initStars(currentStageData.starDensity);
      stopMusic();
      lastTime = performance.now();
    }

    function cleanup() {
      canvas.remove();
      crtOverlay.remove();
      damageFlashOverlay.remove();
      document.body.style.overflow = "";
      window.__spaceInvadeActive = false;
      stopMusic();
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
      if (document.fullscreenElement) exitFullscreen();
    }

    function handlePerkClick(clientX, clientY) {
      if (performance.now() < perkDraftReadyAt) return true;
      const p = canvasPoint(clientX, clientY);
      const hit = perkButtons.find(b => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
      if (hit) {
        applyPerk(hit.perk);
        return true;
      }
      return false;
    }

    function handleButtonClick(clientX, clientY, t) {
      const { x: canvasX, y: canvasY } = canvasPoint(clientX, clientY);
      if (isPortrait()) {
        if (canvasX >= 95 && canvasY >= 25 && canvasY <= 46) {
          paused = !paused; if (paused) stopMusic(); else startMusic(); return true;
        }
        if (!settings.autoFire && canvasX >= 80 && canvasY >= 206 && canvasY <= 235) {
          shootSingleBullet();
          return true;
        }
        if (player.specialPower && player.specialCount > 0) {
          const sy = (!settings.autoFire) ? 178 : 206;
          if (canvasX >= 80 && canvasY >= sy && canvasY <= sy + 28) {
            isSpecialFiring = true;
            if (t - lastSpecialShot >= specialCooldown) fireSpecial(t);
            return true;
          }
        }
        return false;
      }

      if (canvasX >= 220 && canvasX <= 239 && canvasY >= 0 && canvasY <= 15) {
        paused = !paused;
        if (!paused) startMusic();
        else stopMusic();
        return true;
      }

      if (!settings.autoFire && canvasX >= 202 && canvasX <= 238 && canvasY >= 98 && canvasY <= 118) {
        shootSingleBullet(); return true;
      }

      if (player.specialPower && player.specialCount > 0) {
        const by = (!settings.autoFire) ? 79 : 98;
        if (canvasX >= 202 && canvasX <= 238 && canvasY >= by && canvasY <= by + 18) {
          isSpecialFiring = true;
          if (t - lastSpecialShot >= specialCooldown) fireSpecial(t);
          return true;
        }
      }
      return false;
    }

    // -------------------------------------------------
    // Main game loop
    // -------------------------------------------------
    function gameLoop(t) {
      const delta = Math.min(50, Math.max(0, t - lastTime));
      lastTime = t;
      const speedFactor = delta / 16.66;
      const portrait = portraitLayout();
      const bgHex = activeBgColor();

      updateScreenEffects();

      const playerSpeed = player.speed * speedFactor;
      const starSpeedFactor = speedFactor / 1.5;

      // 1. Clear background & draw backdrop aligned to actual screen orientation
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawSpaceBackdrop(t, bgHex, speedFactor, portrait);

      // 2. If in portrait gameplay, switch into rotated 240x120 game coordinates
      if (portrait && started && !gameOver) {
        ctx.setTransform(0, -1, 1, 0, 0, 240);
      }

      drawFxEffects(speedFactor);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        if (portrait && !started) {
          star.y += star.speed * starSpeedFactor;
          if (star.y > 240) { star.y = 0; star.x = Math.random() * 120; }
        } else {
          star.x -= star.speed * starSpeedFactor;
          if (star.x < 0) { star.x = 240; star.y = Math.random() * 120; }
        }
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.003 + star.x * 12.9 + star.y * 7.1));
        ctx.fillStyle = "#fff";
        ctx.fillRect(star.x, star.y, star.size, star.size);
        ctx.restore();
      }

      // Draw scrolling horizon terrain in landscape mode only (avoids sideways edge bar in portrait)
      if (!portrait) {
        drawHorizonTerrain(t, currentStage, bgHex);
      }

      if (!started) {
        if (portrait) portraitMenu(t); else drawStartScreen(t);
        requestAnimationFrame(gameLoop);
        return;
      }

      if (gameOver) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (portrait) portraitEnd(); else drawEndScreen();
        requestAnimationFrame(gameLoop);
        return;
      }

      if (stageState === 'PERK_DRAFT') {
        drawPlayer();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        drawPerkDraftScreen();
        requestAnimationFrame(gameLoop);
        return;
      }

      if (paused) {
        drawPlayer();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        drawPauseScreen();
        requestAnimationFrame(gameLoop);
        return;
      }

      if (stageBannerTimer > 0) stageBannerTimer -= speedFactor;

      if (combo.count > 0) {
        combo.timer -= delta;
        if (combo.timer <= 0) resetCombo();
      }

      if (player.invulnerable) {
        player.invulTimer -= delta;
        if (player.invulTimer <= 0) player.invulnerable = false;
      }

      if (!touchActive) {
        let moveX = 0, moveY = 0;
        if (keys.ArrowLeft || keys.KeyA) moveX = -1;
        if (keys.ArrowRight || keys.KeyD) moveX = 1;
        if (keys.ArrowUp || keys.KeyW) moveY = -1;
        if (keys.ArrowDown || keys.KeyS) moveY = 1;
        player.x += moveX * playerSpeed;
        player.y += moveY * playerSpeed;
        player.x = Math.max(0, Math.min(player.x, 240 - player.w));
        player.y = Math.max(14, Math.min(player.y, 120 - player.h));
      }

      if (settings.autoFire) shootSingleBullet();
      fireSpecial(t);

      for (let i = player.bullets.length - 1; i >= 0; i--) {
        const b = player.bullets[i];
        const frames = delta / (1000 / 60);
        if (b.beam) {
          b.age += frames; b.life -= frames;
          b.x = player.x + player.w; b.y = player.y + player.h / 2 - b.h / 2; b.w = 240 - b.x;
          if (b.life <= 0) player.bullets.splice(i, 1); else drawBullet(b);
          continue;
        }
        if (b.wipe) {
          b.age += frames; b.x += b.speed * speedFactor;
          if (b.x > 240) player.bullets.splice(i, 1); else drawBullet(b);
          continue;
        }
        if (b.power === 'missile') {
          let target = null, best = 1e9;
          const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
          for (const e of enemies) {
            if (e.type === 'enemyBullet') continue;
            const d = Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy);
            if (d < best) { best = d; target = e; }
          }
          if (boss && (stageState === 'BOSS_INTRO' || stageState === 'BOSS_FIGHT')) {
            for (const r of bossRects(boss)) {
              if (!r.weak) continue;
              const d = Math.hypot(r.x + r.w / 2 - cx, r.y + r.h / 2 - cy);
              if (d < best) { best = d; target = r; }
            }
          }
          if (target) {
            const want = Math.atan2(target.y + target.h / 2 - cy, target.x + target.w / 2 - cx);
            let diffAng = want - b.ang;
            while (diffAng > Math.PI) diffAng -= 2 * Math.PI;
            while (diffAng < -Math.PI) diffAng += 2 * Math.PI;
            const maxTurn = 0.08 * frames;
            b.ang += Math.max(-maxTurn, Math.min(maxTurn, diffAng));
          }
          b.speed = Math.min(3.4, b.speed + 0.03 * frames);
          b.x += Math.cos(b.ang) * b.speed * speedFactor;
          b.y += Math.sin(b.ang) * b.speed * speedFactor;
          if (b.x > 250 || b.x < -10 || b.y < -10 || b.y > 130) player.bullets.splice(i, 1);
          else drawBullet(b);
          continue;
        }
        b.age += frames;
        b.x += b.speed * speedFactor;
        if (b.vy) b.y += b.vy * speedFactor;
        if (b.x > 240 || b.y < -5 || b.y > 125) player.bullets.splice(i, 1);
        else drawBullet(b);
      }

      if (stageState === 'MINIONS') {
        if (!stageUfoSpawned && minionSpawnTracker >= Math.floor(currentStageData.minionCount * 0.5)) {
          stageUfoSpawned = true;
          spawnBonusUfo();
        }

        if (minionSpawnTracker < currentStageData.minionCount) {
          const onScreen = enemies.filter(e => e.type !== 'enemyBullet').length;
          const waveGap = 2600 * currentStageData.spawnRateFactor;
          if (t - lastEnemySpawn > waveGap || (onScreen === 0 && t - lastEnemySpawn > 850)) {
            spawnEnemy();
            lastEnemySpawn = t;
          }
        }

        if (minionSpawnTracker >= currentStageData.minionCount) {
          if (!allSpawnedAt) allSpawnedAt = t;
          if (t - allSpawnedAt > 15000) enemies = enemies.filter(e => e.type !== 'enemyBullet');
        } else {
          allSpawnedAt = 0;
        }
        const activeEnemies = enemies.filter(e => e.type !== 'enemyBullet').length;
        if (minionSpawnTracker >= currentStageData.minionCount && activeEnemies === 0) {
          allSpawnedAt = 0;
          stageState = 'BOSS_INTRO';
          player.bullets.length = 0;
          enemies = [];
          powerups.length = 0;
          boss = null;
          lastEnemySpawn = t;
        }
      } else if (stageState === 'BOSS_INTRO') {
        const bossDef = currentStageData.boss;

        if (!boss) {
          boss = {
            x: 240 + 20, y: 120 / 2 - bossDef.height / 2,
            w: bossDef.width, h: bossDef.height, speed: bossDef.speed,
            health: Math.round(bossDef.initialHealth * diff().bossHealth),
            maxHealth: Math.round(bossDef.initialHealth * diff().bossHealth),
            type: bossDef.type, kind: bossDef.kind, value: bossDef.value,
            st: {}, queue: [], now: t, rects: null,
            directionY: (Math.random() < 0.5 ? 1 : -1),
            lastShot: t, shotInterval: 1000 + Math.random() * 2000,
            flashTimer: 0,
            graphic: bossDef.graphic,
            color: bossDef.color
          };
          playBossIntroSound();
        }

        const bossSpeed = boss.speed * speedFactor;
        boss.x -= bossSpeed * 1.5;

        if (boss.x <= 240 - boss.w - 20) {
          boss.x = 240 - boss.w - 20;
          stageState = 'BOSS_FIGHT';
        }
        drawBoss(boss);

      } else if (stageState === 'BOSS_FIGHT') {
        updateBossMovement(boss, t, speedFactor);
        updateBossAttack(boss, t);
        drawBoss(boss);
      }

      if (boss && (stageState === 'BOSS_INTRO' || stageState === 'BOSS_FIGHT')) {
        if (bossRects(boss).some(r => isColliding(player, r))) {
          player.x = Math.max(0, player.x - 5);
          boss.x = Math.min(boss.x + 10, 240 - boss.w - 20);
          if (!player.invulnerable) takeDamage();
        }

        for (let j = player.bullets.length - 1; j >= 0; j--) {
          const b = player.bullets[j];
          const hr = bossRects(boss).find(r => isColliding(b, r));
          if (!hr) continue;
          const piercing = b.beam || b.wipe;
          if (piercing) { if (!pierceHit(b, hr.key || 'boss')) continue; }
          else player.bullets.splice(j, 1);

          if (boss.kind === 'core' && !hr.weak) {
            spawnParticles(b.x + b.w, b.y, 4, ['#0ff', '#fff'], 1.2);
          }

          const baseDamage = b.special ? b.damage : 1;
          const weakBonus = boss.kind === 'core' && hr.weak ? 2 : 1;
          boss.health -= baseDamage * weakBonus;
          if (boss.health <= 0) {
            const bx = boss.x + boss.w / 2, by = boss.y + boss.h / 2;
            for (let k = 0; k < 5; k++)
              createExplosion(boss.x + Math.random() * boss.w, boss.y + Math.random() * boss.h);
            triggerHaptic(70);
            registerKill(bx, by, boss.value);
            spawnScrap(bx, by, 8 + currentStage * 3);
            boss = null;
            stageState = 'STAGE_COMPLETE';
            break;
          }
          boss.flashTimer = 3;
          playEnemyHitSound();
          if (!piercing) break;
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        let enemyCurrentSpeed = e.speed * speedFactor;

        if (e.type === 'enemyBullet') {
          if (e.dirY !== undefined) e.y += e.dirY * speedFactor * 2;
          if (e.homing && player.x > e.x) {
            const angle = Math.atan2(player.y + player.h / 2 - e.y, player.x - e.x);
            e.x += Math.cos(angle) * enemyCurrentSpeed * e.homing;
            e.y += Math.sin(angle) * enemyCurrentSpeed * e.homing;
          }
          e.x -= e.speed * speedFactor;
          if (e.x + e.w < 0) enemies.splice(i, 1);
          else drawEnemy(e);
          continue;
        } else if (e.type === 'ufo') {
          e.x -= enemyCurrentSpeed;
          e.y = 17 + Math.sin(e.x * 0.08) * 2;
        } else if (e.type === 'mine') {
          const durationFactor = delta / (1000 / 60);
          if (e.armedTimer > 0) e.armedTimer -= durationFactor;
          else if (!e.armed) e.armed = true;
          e.x -= enemyCurrentSpeed * 0.45;
        } else if (e.type === 'kamikaze') {
          const angle = Math.atan2(player.y - e.y, player.x - e.x);
          e.x += Math.cos(angle) * enemyCurrentSpeed;
          e.y += Math.sin(angle) * enemyCurrentSpeed;
        } else if (e.type === 'sine') {
          e.x -= enemyCurrentSpeed; e.y = e.baseY + Math.sin(e.x * 0.06) * e.amp;
        } else if (e.type === 'shooting' || e.type === 'fast-bullet') {
          e.x -= enemyCurrentSpeed * 0.5; enemyFire(e, t, 2);
        } else if (e.type === 'zigzag') {
          e.x -= enemyCurrentSpeed * 0.8;
          e.y += enemyCurrentSpeed * 0.8 * e.directionY;
          if (e.y <= 14 || e.y + e.h >= 120) { e.directionY *= -1; e.y = Math.max(14, Math.min(e.y, 120 - e.h)); }
        } else {
          e.x -= enemyCurrentSpeed;
        }

        e.y = Math.max(14, Math.min(e.y, 120 - e.h));
        if (e.x + e.w < 0) enemies.splice(i, 1);
        else drawEnemy(e);
      }

      if (!player.invulnerable) {
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          if (isColliding(player, e)) {
            if (e.type !== 'enemyBullet') {
              takeDamage();
              createExplosion(e.x + e.w / 2, e.y + e.h / 2);
              enemies.splice(i, 1);
              score += (e.type === 'mine' ? 0 : 5);
              break;
            } else {
              takeDamage();
              enemies.splice(i, 1);
              break;
            }
          }
        }
      }

      if (stageState === 'MINIONS' || enemies.filter(e => e.type !== 'enemyBullet').length > 0) {
        for (let j = player.bullets.length - 1; j >= 0; j--) {
          const b = player.bullets[j];
          const piercing = b.beam || b.wipe || b.pierce;
          for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (!isColliding(b, e)) continue;
            if (e.type === 'enemyBullet') {
              if (b.beam || b.wipe) enemies.splice(i, 1);
              continue;
            }
            if (piercing) {
              if (!pierceHit(b, e)) continue;
              e.health -= b.wipe ? 999 : (b.special ? b.damage : 1);
            } else {
              e.health -= b.special ? b.damage : 1;
              if (b.power === 'missile') {
                createExplosion(b.x + b.w, b.y + b.h / 2);
                for (const o of enemies) {
                  if (o === e || o.type === 'enemyBullet') continue;
                  const dx = (o.x + o.w / 2) - (e.x + e.w / 2), dy = (o.y + o.h / 2) - (e.y + e.h / 2);
                  if (Math.hypot(dx, dy) < 22) o.health -= b.damage;
                }
              }
              player.bullets.splice(j, 1);
            }
            if (e.health > 0) playEnemyHitSound();
            if (!piercing) break;
          }
        }
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          if (e.type === 'enemyBullet' || e.health > 0) continue;
          const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
          createExplosion(cx, cy);
          if (e.carrier) dropPowerup(cx, cy);
          if (e.type === 'ufo') {
            spawnScrap(cx, cy, 5);
            spawnFloatingText(cx, cy + 4, 'UFO +150!', '#ff0');
          } else if (e.type !== 'mine' && Math.random() < 0.45) {
            spawnScrap(cx, cy, 1);
          }
          const pts = e.points || 5;
          enemies.splice(i, 1);
          registerKill(cx, cy, pts);
        }
      }

      if (stageState === 'STAGE_COMPLETE' && !boss) {
        advanceStage();
      }

      const magnetRadius = 14 + (meta.upgrades.magnet - 1) * 18;
      const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
      for (let i = scraps.length - 1; i >= 0; i--) {
        const s = scraps[i];
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.x += (s.vx - 0.4) * speedFactor;
        s.y += s.vy * speedFactor;
        const dist = Math.hypot(pcx - (s.x + 2), pcy - (s.y + 2));
        if (dist < magnetRadius) {
          const ang = Math.atan2(pcy - (s.y + 2), pcx - (s.x + 2));
          s.x += Math.cos(ang) * 2.8 * speedFactor;
          s.y += Math.sin(ang) * 2.8 * speedFactor;
        }
        if (s.x + s.w < 0) { scraps.splice(i, 1); continue; }
        drawScrap(s);
        if (isColliding(player, s)) {
          meta.scrap += s.value;
          runScrapEarned += s.value;
          saveMeta();
          playScrapSound();
          scraps.splice(i, 1);
        }
      }

      for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.x -= p.speed * speedFactor;
        const dist = Math.hypot(pcx - (p.x + p.w / 2), pcy - (p.y + p.h / 2));
        if (dist < magnetRadius * 0.85) {
          const ang = Math.atan2(pcy - (p.y + p.h / 2), pcx - (p.x + p.w / 2));
          p.x += Math.cos(ang) * 1.8 * speedFactor;
          p.y += Math.sin(ang) * 1.8 * speedFactor;
        }
        if (p.x + p.w < 0) { powerups.splice(i, 1); continue; }
        drawPowerup(p);
        if (isColliding(player, p)) {
          if (p.type === 'health') {
            if (player.health < player.maxHealth) { player.health++; playPowerupSound(); }
            else continue;
          } else {
            if (!player.specialPower || player.specialCount <= 0) { player.specialPower = p.type; player.specialCount = 1; }
            else if (player.specialPower === p.type) player.specialCount = Math.min(MAX_SPECIAL, player.specialCount + 1);
            else player.specialPower = p.type;
            playPowerupSound();
          }
          powerups.splice(i, 1);
        }
      }

      const durationFactor = delta / (1000 / 60);

      for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.life -= durationFactor;
        exp.size += 0.5 * speedFactor;
        if (exp.life <= 0) explosions.splice(i, 1);
        else drawExplosion(exp);
      }

      drawFloatingTexts(durationFactor);
      drawPlayer();
      if (portrait) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        portraitHud();
        ctx.setTransform(0, -1, 1, 0, 0, 240);
      } else {
        drawScoreAndHealth();
        drawButtons(t);
      }
      drawBossIntro();
      requestAnimationFrame(gameLoop);
    }

    // End screen pointer controls
    let endPointer = null;
    canvas.addEventListener('pointerdown', e => {
      if (!started || !gameOver || scoreDialogOpen) return;
      if (performance.now() < endScreenReadyAt) return;
      const { x, y } = canvasPoint(e.clientX, e.clientY);
      const b = endButtons.find(v => x >= v.x && x <= v.x + v.w && y >= v.y && y <= v.y + v.h);
      endPointer = b ? { id: e.pointerId, label: b.label, x: e.clientX, y: e.clientY } : null;
      if (endPointer) { try { canvas.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); }
    });
    canvas.addEventListener('pointerup', e => {
      if (!endPointer || !gameOver || e.pointerId !== endPointer.id) return;
      const start = endPointer; endPointer = null;
      if (performance.now() < endScreenReadyAt ||
          Math.hypot(e.clientX - start.x, e.clientY - start.y) > 30) return;
      const { x, y } = canvasPoint(e.clientX, e.clientY);
      const b = endButtons.find(v => v.label === start.label && x >= v.x && x <= v.x + v.w && y >= v.y && y <= v.y + v.h);
      if (b) b.action();
      e.preventDefault();
    });
    canvas.addEventListener('pointercancel', () => { endPointer = null; });

    // --- Input handling ---
    canvas.addEventListener("touchstart", e => {
      suppressMouseUntil = performance.now() + 850;
      if (!started) {
        const tt = e.changedTouches[0];
        menuTouchStart = { x: tt.clientX, y: tt.clientY };
      } else if (gameOver) {
        if (window.PointerEvent) { e.preventDefault(); return; }
        const tt = e.changedTouches[0];
        if (tt && performance.now() >= endScreenReadyAt) {
          const { x, y } = canvasPoint(tt.clientX, tt.clientY);
          const button = endButtons.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
          endTouchStart = button ? { x: tt.clientX, y: tt.clientY, label: button.label, id: tt.identifier } : null;
        } else endTouchStart = null;
      } else if (stageState === 'PERK_DRAFT') {
        const tt = e.changedTouches[0];
        if (tt) handlePerkClick(tt.clientX, tt.clientY);
      } else if (paused) {
        const tt = e.changedTouches[0];
        if (tt) handlePauseClick(tt.clientX, tt.clientY);
      } else {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          const buttonPressed = handleButtonClick(t.clientX, t.clientY, performance.now());
          if (!buttonPressed && movementTouchId === null) {
            const point = gamePoint(t.clientX, t.clientY);
            touchOffsetX = point.x - player.x;
            touchOffsetY = point.y - player.y;
            touchActive = true;
            movementTouchId = t.identifier;
          }
        }
      }
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchmove", e => {
      if (!paused && started && !gameOver && stageState !== 'PERK_DRAFT') {
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          if (t.identifier === movementTouchId && touchActive) {
            const point = gamePoint(t.clientX, t.clientY);
            let newX = point.x - touchOffsetX;
            let newY = point.y - touchOffsetY;
            player.x = Math.max(0, Math.min(newX, 240 - player.w));
            player.y = Math.max(14, Math.min(newY, 120 - player.h));
          }
        }
      }
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchend", e => {
      if (!started) {
        const tt = e.changedTouches[0];
        if (menuTouchStart && tt) {
          const dx = tt.clientX - menuTouchStart.x, dy = tt.clientY - menuTouchStart.y;
          if (Math.hypot(dx, dy) < 25) menuPointer(tt.clientX, tt.clientY);
          else {
            const r = canvas.getBoundingClientRect();
            const startX = (menuTouchStart.x - r.left) * (canvas.width / r.width);
            if (startX < CHEAT_SWIPE_ZONE_X) pushCheatInput(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'Left' : 'Right') : (dy < 0 ? 'Up' : 'Down'));
          }
        }
        menuTouchStart = null;
        e.preventDefault();
        return;
      }
      if (gameOver) {
        if (window.PointerEvent) { e.preventDefault(); return; }
        const tt = e.changedTouches[0];
        if (tt && endTouchStart && tt.identifier === endTouchStart.id &&
            Math.hypot(tt.clientX - endTouchStart.x, tt.clientY - endTouchStart.y) < 25 &&
            performance.now() >= endScreenReadyAt) {
          const { x, y } = canvasPoint(tt.clientX, tt.clientY);
          const sameButton = endButtons.find(b => b.label === endTouchStart.label &&
            x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
          if (sameButton) sameButton.action();
        }
        endTouchStart = null;
        e.preventDefault(); return;
      }
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === movementTouchId) {
          touchActive = false;
          movementTouchId = null;
        }
      }
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("mousedown", e => {
      if (performance.now() < suppressMouseUntil) { e.preventDefault(); return; }
      if (!started) {
        menuPointer(e.clientX, e.clientY);
      } else if (gameOver) {
        if (!window.PointerEvent) endButtonAt(e.clientX, e.clientY);
      } else if (stageState === 'PERK_DRAFT') {
        handlePerkClick(e.clientX, e.clientY);
      } else if (paused) {
        handlePauseClick(e.clientX, e.clientY);
      } else {
        handleButtonClick(e.clientX, e.clientY, performance.now());
      }
      e.preventDefault();
    });

    document.addEventListener("keydown", e => {
      if (scoreDialogOpen) return;
      if (!started) {
        if (menuKey(e)) e.preventDefault();
        return;
      }
      if (stageState === 'PERK_DRAFT') {
        if (performance.now() < perkDraftReadyAt) return;
        if (e.code === 'Digit1' && perkChoices[0]) { applyPerk(perkChoices[0]); e.preventDefault(); }
        else if (e.code === 'Digit2' && perkChoices[1]) { applyPerk(perkChoices[1]); e.preventDefault(); }
        else if (e.code === 'Digit3' && perkChoices[2]) { applyPerk(perkChoices[2]); e.preventDefault(); }
        return;
      }
      portraitKeys(e);
      if (keys.hasOwnProperty(e.code)) {
        if (e.code === "KeyP") {
          if (started && !gameOver) {
            paused = !paused;
            if (!paused) startMusic();
            else stopMusic();
          }
        } else if (!paused) {
          keys[e.code] = true;
          if (e.code === "Space") shootSingleBullet();
          if (e.code === "ShiftLeft") { isSpecialFiring = true; fireSpecial(performance.now()); }
        }
        e.preventDefault();
      }

      if (gameOver && !scoreDialogOpen && (e.code === 'Enter' || e.code === 'NumpadEnter')) {
        if (currentStage < TOTAL_STAGES && continues > 0) useContinue();
        else if (!scoreSavedThisRun && !cheatActive) openScoreDialog();
        else { restart(); menuActivate('play'); }
        e.preventDefault();
      }
    });

    document.addEventListener("keyup", e => {
      portraitKeys(e);
      if (keys.hasOwnProperty(e.code)) { keys[e.code] = false; e.preventDefault(); }
    });

    requestAnimationFrame(gameLoop);
  }

  startSpaceInvadeGame();
})();
