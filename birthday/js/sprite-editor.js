/* Debug sprite editor — activated with ?debug in URL.
   Shows a draggable overlay listing all sprites in the current frame.
   Click a sprite in the list to select it; drag on the canvas to reposition.
   Positions are shown in code-ready format. Press E to toggle. */
(function spriteEditor(){
  const params = new URLSearchParams(window.location.search);
  if (!params.has('debug')) return;

  // Expand game to full screen in debug mode
  const gameEl = document.getElementById('game');
  if (gameEl) {
    gameEl.style.width = '100vw';
    gameEl.style.maxWidth = '100vw';
    gameEl.style.height = '100vh';
    gameEl.style.borderRadius = '0';
    gameEl.style.aspectRatio = 'unset';
  }
  document.body.style.overflow = 'hidden';

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
    <div id="seHeader">
      <b>Sprite Editor</b>
      <span id="seClose" style="cursor:pointer;float:right;">✕</span>
    </div>
    <div id="seInfo" style="font-size:10px;color:#aaa;padding:2px 6px;">Click sprite in list, drag on canvas</div>
    <div id="seList"></div>
    <div id="seCoords" style="padding:4px 6px;font-family:monospace;font-size:10px;color:#4fc3f7;min-height:24px;"></div>
    <div style="padding:4px 6px;">
      <button id="seSave" style="font-size:10px;padding:2px 8px;">Save positions</button>
      <button id="seClear" style="font-size:10px;padding:2px 8px;">Clear saved</button>
      <button id="seCopy" style="font-size:10px;padding:2px 8px;">Copy code</button>
    </div>
  `;
  panel.style.cssText = `
    position:fixed; top:10px; right:10px; width:220px; max-height:80vh;
    overflow-y:auto; background:rgba(18,18,18,0.95); color:#fff;
    border:1px solid #333; border-radius:8px; font-size:11px;
    font-family:sans-serif; z-index:9999; display:none;
    box-shadow:0 4px 20px rgba(0,0,0,0.5);
  `;
  document.body.appendChild(panel);

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
    const sprites = getSubmittedSprites();
    seList.innerHTML = '';
    sprites.forEach((s, i) => {
      const row = document.createElement('div');
      row.style.cssText = `padding:3px 6px;cursor:pointer;border-bottom:1px solid #222;${selected === i ? 'background:#333;color:#4fc3f7;' : ''}`;
      const sprite = SpriteRenderer.getSprite(s.sprite);
      const w = s.width || sprite?.defaultSize || '?';
      row.textContent = `${s.sprite} (${Math.round(s.x)},${Math.round(s.y)}) ${w}px`;
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
