/* Debug sprite library viewer — activated with ?debug in URL.
   Press L to toggle. Shows all registered sprites with stats, animation preview,
   anchor point editor, and problem flagging. Saves flags to MySQL via debug server. */
(function spriteLibrary(){
  if (!new URLSearchParams(window.location.search).has('debug')) return;
  const isLocal = window.location.hostname === 'localhost';

  let libOpen = false;
  let libFilter = '';
  let selectedSprite = null;
  let anchorMode = false;

  const lib = document.createElement('div');
  lib.id = 'spriteLibrary';
  lib.style.cssText = `
    position:fixed; left:0; top:0; width:480px; height:100vh; overflow-y:auto;
    background:#1a1a1a; color:#fff; border-right:1px solid #333;
    font-size:11px; font-family:sans-serif; z-index:9998; display:none;
  `;
  lib.innerHTML = `
    <div style="padding:8px 10px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;">
      <b>📚 Sprite Library</b>
      <span id="slClose" style="cursor:pointer;font-size:14px;">✕</span>
    </div>
    <div style="padding:6px 10px;border-bottom:1px solid #222;">
      <input id="slFilter" type="text" placeholder="Filter sprites..." style="width:100%;padding:4px 8px;background:#111;border:1px solid #333;border-radius:3px;color:#fff;font-size:11px;">
    </div>
    <div id="slList" style="max-height:35vh;overflow-y:auto;border-bottom:1px solid #333;"></div>
    <div id="slDetail" style="padding:10px;display:none;">
      <div id="slPreview" style="text-align:center;padding:10px;background:#111;border-radius:4px;margin-bottom:8px;position:relative;min-height:420px;"></div>
      <div id="slStats" style="font-family:monospace;font-size:10px;color:#aaa;margin-bottom:8px;"></div>
      <div id="slAnchor" style="margin-bottom:8px;">
        <button id="slAnchorBtn" style="font-size:10px;padding:3px 10px;background:#333;color:#fff;border:1px solid #555;border-radius:3px;cursor:pointer;">Set anchor point (click preview)</button>
        <span id="slAnchorVal" style="font-family:monospace;font-size:10px;color:#4fc3f7;margin-left:6px;"></span>
      </div>
      <div style="margin-bottom:6px;">
        <label style="color:#aaa;font-size:10px;">Flag problem:</label>
        <select id="slFlag" style="font-size:10px;padding:2px;background:#222;color:#fff;border:1px solid #444;border-radius:3px;">
          <option value="">None</option>
          <option value="wrong_cols">Wrong column count</option>
          <option value="multi_image">Multiple images in one sheet</option>
          <option value="should_animate">Should be animated</option>
          <option value="bad_anchor">Bad anchor point</option>
          <option value="wrong_size">Wrong default size</option>
          <option value="other">Other issue</option>
        </select>
      </div>
      <textarea id="slNotes" placeholder="Notes..." style="width:100%;height:40px;padding:4px;background:#111;border:1px solid #333;border-radius:3px;color:#fff;font-size:10px;resize:vertical;"></textarea>
      <button id="slSaveFlag" style="font-size:10px;padding:3px 10px;background:#333;color:#fff;border:1px solid #555;border-radius:3px;cursor:pointer;margin-top:4px;">Save flag to DB</button>
      <span id="slSaveStatus" style="font-size:10px;color:#66bb6a;margin-left:6px;"></span>
    </div>
  `;
  document.body.appendChild(lib);

  lib.querySelector('#slClose').addEventListener('click', () => { libOpen = false; lib.style.display = 'none'; });
  lib.querySelector('#slFilter').addEventListener('input', e => { libFilter = e.target.value.toLowerCase(); buildList(); });

  // Toggle with L key
  document.addEventListener('keydown', e => {
    if (e.key === 'l' || e.key === 'L') {
      libOpen = !libOpen;
      lib.style.display = libOpen ? '' : 'none';
      if (libOpen) buildList();
    }
  });

  function getAllSprites() {
    if (typeof SpriteRenderer === 'undefined') return [];
    const reg = SpriteRenderer.getRegistry();
    const list = [];
    for (const [name, cfg] of reg) {
      cfg._name = name;  // ensure name is on the original record
      list.push(cfg);    // use the live registry record, not a copy
    }
    return list.sort((a, b) => (a._name || a.name || '').localeCompare(b._name || b.name || ''));
  }

  function buildList() {
    const slList = lib.querySelector('#slList');
    const sprites = getAllSprites().filter(s => !libFilter || s.name.toLowerCase().includes(libFilter));
    slList.innerHTML = '';
    for (const s of sprites) {
      const row = document.createElement('div');
      const isSelected = selectedSprite === s.name;
      row.style.cssText = `padding:4px 10px;cursor:pointer;border-bottom:1px solid #222;${isSelected ? 'background:#2a3a4a;color:#4fc3f7;' : 'color:#ccc;'}`;
      const cat = s.category || s.renderMode || '';
      const animated = s.cols > 1 ? `${s.cols}f @${s.fps}fps` : 'static';
      row.innerHTML = `<b>${s.name}</b> <span style="color:#555;font-size:9px;">${s.defaultSize || s.defaultWidth || '?'}px ${animated} ${cat}</span>`;
      row.addEventListener('click', () => { selectedSprite = s.name; buildList(); showDetail(s); });
      slList.appendChild(row);
    }
  }

  let previewAnim = null;
  function showDetail(s) {
    const detail = lib.querySelector('#slDetail');
    detail.style.display = '';
    const stats = lib.querySelector('#slStats');
    const size = s.defaultSize || s.defaultWidth || '?';
    const phase = s.phase || 'actors';
    const ax = s.anchorX ?? 0.5, ay = s.anchorY ?? 1;
    stats.innerHTML = `
      name: ${s.name}<br>
      src: ${s.src}<br>
      size: ${size}px | cols: ${s.cols} | fps: ${s.fps}<br>
      phase: ${phase} | anchor: (${ax}, ${ay})<br>
      frame: ${s.fw}×${s.fh} | ready: ${s.ready}<br>
      ${s.footprint ? `footprint: ${s.footprint.width}×${s.footprint.depth}` : ''}
    `;

    // Preview
    const preview = lib.querySelector('#slPreview');
    if (previewAnim) cancelAnimationFrame(previewAnim);
    preview.innerHTML = '';

    if (!s.ready || !s.image) {
      // Try to load it
      if (s.load) s.load();
      preview.textContent = 'Loading...';
      setTimeout(() => showDetail(s), 500);
      return;
    }

    const cvs = document.createElement('canvas');
    const previewSize = 400;
    cvs.width = previewSize;
    cvs.height = previewSize;
    cvs.style.cssText = 'border:1px solid #333;background:#0a0a0a;cursor:crosshair;';
    preview.appendChild(cvs);
    const pctx = cvs.getContext('2d');

    let frame = 0;
    function drawPreview() {
      pctx.clearRect(0, 0, previewSize, previewSize);
      // Grid
      pctx.strokeStyle = '#222';
      pctx.lineWidth = 0.5;
      for (let g = 0; g < previewSize; g += 20) {
        pctx.beginPath(); pctx.moveTo(g, 0); pctx.lineTo(g, previewSize); pctx.stroke();
        pctx.beginPath(); pctx.moveTo(0, g); pctx.lineTo(previewSize, g); pctx.stroke();
      }
      // Draw sprite centered
      const scale = Math.min((previewSize - 20) / s.fw, (previewSize - 20) / s.fh);
      const dw = s.fw * scale, dh = s.fh * scale;
      const dx = (previewSize - dw) / 2, dy = (previewSize - dh) / 2;
      const col = frame % s.cols;
      pctx.drawImage(s.image, col * s.fw, 0, s.fw, s.fh, dx, dy, dw, dh);
      // Anchor point crosshair
      const ancX = dx + dw * (s.anchorX ?? 0.5);
      const ancY = dy + dh * (s.anchorY ?? 1);
      pctx.strokeStyle = '#ef5350';
      pctx.lineWidth = 1;
      pctx.beginPath(); pctx.moveTo(ancX - 8, ancY); pctx.lineTo(ancX + 8, ancY); pctx.stroke();
      pctx.beginPath(); pctx.moveTo(ancX, ancY - 8); pctx.lineTo(ancX, ancY + 8); pctx.stroke();
      // Frame counter
      pctx.fillStyle = '#555';
      pctx.font = '9px monospace';
      pctx.fillText(`frame ${col}/${s.cols}`, 4, previewSize - 4);

      if (s.cols > 1 && s.fps > 0) {
        frame++;
        previewAnim = setTimeout(() => requestAnimationFrame(drawPreview), 1000 / s.fps);
      }
    }
    drawPreview();

    // Click to set anchor
    cvs.addEventListener('click', e => {
      if (!anchorMode) return;
      const rect = cvs.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width * previewSize;
      const cy = (e.clientY - rect.top) / rect.height * previewSize;
      const scale = Math.min((previewSize - 20) / s.fw, (previewSize - 20) / s.fh);
      const dw = s.fw * scale, dh = s.fh * scale;
      const dx = (previewSize - dw) / 2, dy = (previewSize - dh) / 2;
      const newAncX = Math.round(((cx - dx) / dw) * 100) / 100;
      const newAncY = Math.round(((cy - dy) / dh) * 100) / 100;
      lib.querySelector('#slAnchorVal').textContent = `anchorX:${newAncX}, anchorY:${newAncY}`;
      anchorMode = false;
      lib.querySelector('#slAnchorBtn').textContent = 'Set anchor point (click preview)';
    });

    lib.querySelector('#slAnchorBtn').onclick = () => {
      anchorMode = !anchorMode;
      lib.querySelector('#slAnchorBtn').textContent = anchorMode ? 'Click on the preview...' : 'Set anchor point (click preview)';
    };

    // Save flag
    lib.querySelector('#slSaveFlag').onclick = () => {
      const flag = lib.querySelector('#slFlag').value;
      const notes = lib.querySelector('#slNotes').value;
      if (!flag && !notes) return;
      if (isLocal) {
        fetch('/api/sprite-flags', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ sprite: s.name, flag, notes, src: s.src, cols: s.cols, fps: s.fps, defaultSize: s.defaultSize })
        }).then(() => {
          lib.querySelector('#slSaveStatus').textContent = 'Saved!';
          setTimeout(() => lib.querySelector('#slSaveStatus').textContent = '', 2000);
        }).catch(() => {
          lib.querySelector('#slSaveStatus').textContent = 'DB error (is debug server running?)';
        });
      } else {
        lib.querySelector('#slSaveStatus').textContent = 'Need local debug server';
      }
    };
  }
})();
