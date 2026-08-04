/* journal: Krystal's drawing journal  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */
/*
  A little diary she keeps: she writes entries about your days together — hugs, the
  places she visited, milestones — and tucks in the pictures she draws. Fully
  self-contained: it builds its own DOM + CSS and watches the game state via the
  EXTRA_UPDATERS hook, so it never edits the core files. Open it from the 📖 tab
  on the left edge of the stage.
*/
(function(){
  try{
    const KEY = 'bpet_journal';
    let entries = [];
    try{ const r = localStorage.getItem(KEY); if (r) entries = JSON.parse(r) || []; }catch(e){}
    const CAP = 150;
    function saveJ(){ try{ localStorage.setItem(KEY, JSON.stringify(entries.slice(0, CAP))); }catch(e){} }
    function todayLabel(){ const d = new Date(); return (d.getMonth()+1) + '/' + d.getDate(); }
    let pulse = 0;
    function add(icon, text, img){
      entries.unshift({ d: todayLabel(), i: icon, m: text, g: img || null });
      if (entries.length > CAP) entries.length = CAP;
      saveJ();
      pulse = 1.3;
      const p = document.getElementById('journalPanel');
      if (p && !p.classList.contains('hide')) buildJ();
    }
    // let the rest of the game log too, if it ever wants to
    try{ window.journalAdd = add; }catch(e){}

    /* ---- styles (injected, matches the note-panel look) ---- */
    const css = `
      #journalTab{position:absolute;left:0;top:42%;transform:translateY(-50%);z-index:14;
        background:var(--accent,#e07a8b);color:#fff;font-size:16px;line-height:1;
        padding:9px 6px;border-radius:0 12px 12px 0;box-shadow:2px 2px 8px rgba(0,0,0,.3);
        cursor:pointer;user-select:none;}
      #journalPanel{position:absolute;inset:0;background:rgba(42,33,28,.9);z-index:16;
        display:flex;flex-direction:column;padding:16px;backdrop-filter:blur(3px);}
      #journalPanel.hide{display:none;}
      #journalHead{color:#fff;font-weight:700;font-size:16px;display:flex;
        justify-content:space-between;align-items:center;margin-bottom:4px;}
      #journalClose{cursor:pointer;}
      #journalHint{color:#f2d9c9;font-size:11px;margin-bottom:10px;opacity:.85;}
      #journalList{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;}
      .jCard{background:#fdf6ee;border-radius:12px;padding:10px 12px;color:#4a3a34;
        font-size:13px;line-height:1.45;box-shadow:0 2px 6px rgba(0,0,0,.25);
        display:flex;gap:10px;align-items:flex-start;}
      .jCard .je{font-size:18px;flex:none;}
      .jCard .jt{flex:1;}
      .jCard .jd{font-size:10px;font-weight:700;color:var(--accent,#e07a8b);margin-bottom:2px;}
      .jCard img{width:66px;height:46px;object-fit:cover;border-radius:6px;border:1px solid #e7cdbf;flex:none;}
      #journalEmpty{color:#f2d9c9;text-align:center;margin-top:36px;font-size:13px;line-height:1.6;}
    `;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    /* ---- DOM ---- */
    const stage = document.getElementById('stagewrap');
    const game = document.getElementById('game') || stage;
    const tab = document.createElement('div'); tab.id = 'journalTab'; tab.title = "Krystal's journal"; tab.textContent = '📖';
    const panel = document.createElement('div'); panel.id = 'journalPanel'; panel.className = 'hide';
    panel.innerHTML = '<div id="journalHead"><span>📖 My Journal</span><span id="journalClose">✕</span></div>'
      + '<div id="journalHint">Little notes and drawings from our days together 💛</div>'
      + '<div id="journalList"></div>';
    if (stage) stage.appendChild(tab);
    if (game) game.appendChild(panel);

    function esc(s){ return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
    function buildJ(){
      const list = document.getElementById('journalList'); if (!list) return; list.innerHTML = '';
      if (!entries.length){
        list.innerHTML = '<div id="journalEmpty">No entries yet 🖊️<br>Play together and I\'ll start writing about our days.</div>';
        return;
      }
      entries.forEach(e => {
        const c = document.createElement('div'); c.className = 'jCard';
        let html = '<span class="je">' + (e.i || '💛') + '</span>'
          + '<div class="jt"><div class="jd">' + esc(e.d || '') + '</div>' + esc(e.m || '') + '</div>';
        if (e.g) html += '<img src="' + e.g + '" alt="a drawing">';
        c.innerHTML = html; list.appendChild(c);
      });
    }
    function openJ(){ buildJ(); panel.classList.remove('hide'); }
    function closeJ(){ panel.classList.add('hide'); }
    tab.addEventListener('click', openJ);
    const cl = panel.querySelector('#journalClose'); if (cl) cl.addEventListener('click', closeJ);

    /* ---- observe the game and write entries for the moments that matter ---- */
    let lastHugLog = -999;                 // so the first hug logs, then every ~8th
    let prev = null;                       // previous snapshot
    let warm = 1.6;                        // ignore the load-time snapshot & new-day boot greeting
    const num = v => (typeof v === 'number' ? v : 0);
    function snap(){
      return {
        hugs: num(typeof state!=='undefined' && state.hugs),
        draws: num(typeof state!=='undefined' && state.draws),
        visited: (typeof visited!=='undefined') ? visited.size : 0,
        days: (typeof meta!=='undefined' && meta) ? num(meta.totalDays) : 0,
        gallery: (typeof gallery!=='undefined') ? gallery.length : 0,
        ach: (typeof achieved!=='undefined') ? achieved.size : 0,
      };
    }
    function placeName(){
      try{
        const sc = SCENES[currentScene];
        return (typeof sceneLabel==='function') ? sceneLabel(sc) : sc;
      }catch(e){ return 'somewhere lovely'; }
    }
    EXTRA_UPDATERS.push(function(dt){
      // gentle pulse on the tab after a new entry
      if (pulse > 0){ pulse -= dt; tab.style.transform = 'translateY(-50%) scale(' + (1 + Math.max(0,pulse)*0.14) + ')'; }
      try{
        const s = snap();
        if (!prev){ prev = s; return; }
        if (warm > 0){ warm -= dt; prev = s; return; }
        // a new drawing was saved to the gallery — tuck the picture in
        if (s.gallery > prev.gallery){
          const img = (typeof gallery!=='undefined' && gallery[0]) ? gallery[0] : null;
          add('🎨', pick(['I drew a little something for us today 🎨','We made some art together! 🖌️','A doodle to remember today by ✏️']), img);
        }
        // first time somewhere new
        if (s.visited > prev.visited){
          add('🗺️', pick([
            'I visited ' + placeName() + ' for the first time today ✨',
            'A new place with Paul: ' + placeName() + ' 🥰',
            'We explored ' + placeName() + ' together today 🌿'
          ]));
        }
        // a new day together
        if (s.days > prev.days){
          add('💛', 'Day ' + s.days + ' together — my favourite kind of day 💛');
        }
        // an achievement
        if (s.ach > prev.ach && typeof ACHIEVEMENTS!=='undefined'){
          const got = ACHIEVEMENTS.filter(a => achieved.has(a.id));
          const last = got[got.length - 1];
          if (last) add(last.icon || '🏅', 'We did it — ' + last.name + (last.desc ? (' (' + last.desc + ')') : '') + '!');
        }
        // an occasional hug memory (throttled)
        if (s.hugs > prev.hugs && (s.hugs - lastHugLog) >= 8){
          add('🤗', pick([
            'Paul gave me the warmest hug at ' + placeName() + ' 🤗',
            'So many hugs today — I feel so loved 💗',
            'A cuddle at ' + placeName() + '. I never want to let go 🥰'
          ]));
          lastHugLog = s.hugs;
        }
        prev = s;
      }catch(e){}
    });
  }catch(e){ try{ console.log('journal error', e); }catch(_){} }
})();
