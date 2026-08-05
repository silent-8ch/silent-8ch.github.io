/* Debug sprite editor — activated with ?debug in URL.
   Shows a draggable overlay listing all sprites in the current frame.
   Click a sprite in the list to select it; drag on the canvas to reposition.
   Positions are shown in code-ready format. Press E to toggle. */
(function spriteEditor(){
  const params = new URLSearchParams(window.location.search);
  if (!params.has('debug')) return;

  // Debug layout: game stays centered mobile size, debug panels fill the sides
  document.body.style.overflow = 'hidden';
  document.body.style.display = 'flex';
  document.body.style.alignItems = 'center';
  document.body.style.justifyContent = 'center';
  document.body.style.gap = '0';

  let editorOpen = false;
  let selected = null;       // index into current frame's submitted list
  let dragging = false;
  let dragOffX = 0, dragOffY = 0;
  let savedPositions = {};   // sprite name → {x, y} overrides

  // Load saved positions from localStorage
  try {
    const raw = localStorage.getItem('bpet_sprite_positions');
    if (raw) savedPositions = JSON.parse(raw);
  } catch(e){}

  // Panel DOM
  const panel = document.createElement('div');
  panel.id = 'spriteEditorPanel';
  panel.innerHTML = `
    <div id="seHeader" style="padding:8px 10px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;">
      <b>🔧 Sprite Editor</b>
      <span id="seClose" style="cursor:pointer;font-size:14px;">✕</span>
    </div>
    <div id="seScene" style="padding:6px 10px;background:#1e1e1e;border-bottom:1px solid #222;font-size:10px;color:#aaa;"></div>
    <div id="seInfo" style="font-size:10px;color:#666;padding:4px 10px;border-bottom:1px solid #222;">Select sprite → drag on canvas. Press E to toggle.</div>
    <div id="seList" style="max-height:40vh;overflow-y:auto;"></div>
    <div id="seCoords" style="padding:6px 10px;font-family:monospace;font-size:11px;color:#4fc3f7;min-height:28px;background:#111;border-top:1px solid #222;"></div>
    <div style="padding:6px 10px;display:flex;gap:4px;border-top:1px solid #222;">
      <button id="seSave" style="font-size:10px;padding:3px 10px;background:#333;color:#fff;border:1px solid #555;border-radius:3px;cursor:pointer;">Save</button>
      <button id="seClear" style="font-size:10px;padding:3px 10px;background:#333;color:#fff;border:1px solid #555;border-radius:3px;cursor:pointer;">Clear</button>
      <button id="seCopy" style="font-size:10px;padding:3px 10px;background:#333;color:#fff;border:1px solid #555;border-radius:3px;cursor:pointer;">Copy code</button>
    </div>
  `;
  panel.style.cssText = `
    width:280px; height:100vh; overflow-y:auto;
    background:#1a1a1a; color:#fff; border-left:1px solid #333;
    font-size:11px; font-family:sans-serif; flex-shrink:0;
    display:none;
  `;
  // Insert panel after the game element so it sits to the right
  const gameEl = document.getElementById('game');
  if (gameEl && gameEl.parentNode) {
    gameEl.parentNode.appendChild(panel);
  } else {
    document.body.appendChild(panel);
  }

  const seList = panel.querySelector('#seList');
  const seCoords = panel.querySelector('#seCoords');

  panel.querySelector('#seClose').addEventListener('click', () => { editorOpen = false; panel.style.display = 'none'; });
  panel.querySelector('#seSave').addEventListener('click', () => {
    try { localStorage.setItem('bpet_sprite_positions', JSON.stringify(savedPositions)); } catch(e){}
    seCoords.textContent = 'Saved!';
  });
  panel.querySelector('#seClear').addEventListener('click', () => {
    savedPositions = {};
    try { localStorage.removeItem('bpet_sprite_positions'); } catch(e){}
    seCoords.textContent = 'Cleared!';
  });
  panel.querySelector('#seCopy').addEventListener('click', () => {
    const lines = [];
    for (const [key, pos] of Object.entries(savedPositions)) {
      lines.push(`${key}: x:${Math.round(pos.x)}, y:${Math.round(pos.y)}`);
    }
    if (lines.length) {
      navigator.clipboard.writeText(lines.join('\n')).then(() => {
        seCoords.textContent = 'Copied!';
      });
    }
  });

  // Toggle with E key
  document.addEventListener('keydown', e => {
    if (e.key === 'e' || e.key === 'E') {
      editorOpen = !editorOpen;
      panel.style.display = editorOpen ? '' : 'none';
      if (editorOpen) refreshList();
    }
  });

  function getSubmittedSprites() {
    if (typeof SpriteRenderer === 'undefined') return [];
    const submitted = SpriteRenderer.getSubmitted();
    return submitted.filter(s => s.sprite && s.sprite !== 'cloud');
  }

  function refreshList() {
    // Scene info
    const seScene = panel.querySelector('#seScene');
    if (typeof SCENES !== 'undefined' && typeof currentScene !== 'undefined') {
      seScene.textContent = '📍 ' + SCENES[currentScene] + ' (index ' + currentScene + ')  |  W:' + W + ' H:' + H + '  |  groundY ≈ ' + Math.round(H * 0.52);
    }

    const sprites = getSubmittedSprites();
    seList.innerHTML = '';
    sprites.forEach((s, i) => {
      const row = document.createElement('div');
      row.style.cssText = `padding:4px 10px;cursor:pointer;border-bottom:1px solid #222;font-size:11px;${selected === i ? 'background:#2a3a4a;color:#4fc3f7;' : 'color:#ccc;'}`;
      const sprite = SpriteRenderer.getSprite(s.sprite);
      const w = s.width || sprite?.defaultSize || '?';
      const phase = s.phase || sprite?.phase || 'actors';
      row.innerHTML = `<span style="color:${selected === i ? '#4fc3f7' : '#888'};font-size:9px;">${phase}</span> <b>${s.sprite}</b> <span style="color:#666;font-family:monospace;font-size:10px;">(${Math.round(s.x)}, ${Math.round(s.y)})</span> <span style="color:#555;font-size:9px;">${w}px</span>`;
      row.addEventListener('click', () => {
        selected = i;
        refreshList();
        updateCoords(s);
      });
      seList.appendChild(row);
    });
  }

  function updateCoords(s) {
    const sprite = SpriteRenderer.getSprite(s.sprite);
    const size = s.width || sprite?.defaultSize || '?';
    seCoords.textContent = `${s.sprite}: x:${Math.round(s.x)}, y:${Math.round(s.y)}, ${s.phase||'actors'}, ${size}px`;
  }

  // Canvas mouse/touch handling for dragging
  const cvEl = document.getElementById('cv');

  function canvasToWorld(clientX, clientY) {
    const r = cvEl.getBoundingClientRect();
    return {
      x: (clientX - r.left) / r.width * W,
      y: (clientY - r.top) / r.height * H
    };
  }

  cvEl.addEventListener('pointerdown', e => {
    if (!editorOpen) return;
    const sprites = getSubmittedSprites();
    if (selected == null || selected >= sprites.length) return;
    const s = sprites[selected];
    const pos = canvasToWorld(e.clientX, e.clientY);
    const sprite = SpriteRenderer.getSprite(s.sprite);
    const size = s.width || sprite?.defaultSize || 50;
    // Check if click is near the selected sprite
    if (Math.abs(pos.x - s.x) < size && Math.abs(pos.y - s.y) < size) {
      dragging = true;
      dragOffX = pos.x - s.x;
      dragOffY = pos.y - s.y;
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  window.addEventListener('pointermove', e => {
    if (!dragging || selected == null) return;
    const sprites = getSubmittedSprites();
    if (selected >= sprites.length) return;
    const s = sprites[selected];
    const pos = canvasToWorld(e.clientX, e.clientY);
    s.x = pos.x - dragOffX;
    s.y = pos.y - dragOffY;
    // Save override
    savedPositions[s.sprite + '_' + selected] = { x: s.x, y: s.y, sprite: s.sprite };
    updateCoords(s);
    e.preventDefault();
  });

  window.addEventListener('pointerup', () => {
    if (dragging) {
      dragging = false;
      refreshList();
    }
  });

  // Draw selection highlight
  EXTRA_DRAWERS.push(function drawEditorOverlay() {
    if (!editorOpen) return;
    const sprites = getSubmittedSprites();
    if (selected == null || selected >= sprites.length) return;
    const s = sprites[selected];
    const sprite = SpriteRenderer.getSprite(s.sprite);
    const size = s.width || sprite?.defaultSize || 50;
    const ax = s.anchorX ?? 0.5, ay = s.anchorY ?? 1;

    ctx.save();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(s.x - size * ax, s.y - size * ay, size, size);
    ctx.setLineDash([]);
    // Crosshair at anchor point
    ctx.strokeStyle = '#ef5350';
    ctx.beginPath();
    ctx.moveTo(s.x - 6, s.y); ctx.lineTo(s.x + 6, s.y);
    ctx.moveTo(s.x, s.y - 6); ctx.lineTo(s.x, s.y + 6);
    ctx.stroke();
    // Label
    ctx.fillStyle = '#4fc3f7';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${s.sprite} (${Math.round(s.x)},${Math.round(s.y)})`, s.x - size * ax, s.y - size * ay - 4);
    ctx.restore();
  });

  // Refresh the list periodically
  setInterval(() => { if (editorOpen) refreshList(); }, 1000);
})();
