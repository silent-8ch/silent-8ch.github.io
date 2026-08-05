/* Persistent family hide-and-seek. Each person wanders in one scene until found,
   then relocates to another enabled scene. Uses the shared extension hooks. */
(function familyHideout(){
  const STORAGE_KEY = 'bpet_family_hideouts_v1';
  const NOTE_STORAGE_KEY = 'bpet_family_clue_notes_v1';
  const PEOPLE = [
    { name:'paul', label:'Paul' },
    { name:'luna', label:'Luna' },
    { name:'wade', label:'Wade' },
    { name:'luke', label:'Luke' },
    { name:'william', label:'William' },
  ];
  const DISPLAY_H = 118;
  const WALK_SPEED = 24;
  const EXIT_SPEED = 90;
  const CELEBRATE_DURATION = 3;
  const FLOOR = { minX:0.12, maxX:0.88, minY:0.67, maxY:0.84 };
  const FOUND_LINES = [
    'You found me! 😄',
    'There you are — you found me! 💛',
    'Found me! I’m picking a new hiding place…',
    'You caught me! Off to hide somewhere else! 🏃',
  ];

  let savedScenes = loadScenes();
  let noteState = loadNoteState();
  const walkers = new Map();

  function loadScenes(){
    try{
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    }catch(e){ return {}; }
  }

  function saveScenes(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(savedScenes)); }catch(e){}
  }

  function loadNoteState(){
    try{
      const value = JSON.parse(localStorage.getItem(NOTE_STORAGE_KEY) || '{}');
      return {
        visitCount:Number.isFinite(value.visitCount) ? value.visitCount : 0,
        lastScene:typeof value.lastScene === 'string' ? value.lastScene : null,
        notes:value.notes && typeof value.notes === 'object' ? value.notes : {},
      };
    }catch(e){ return { visitCount:0, lastScene:null, notes:{} }; }
  }

  function saveNoteState(){
    try{ localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(noteState)); }catch(e){}
  }

  function enabledSceneNames(){
    try{
      return SCENES.filter(scene =>
        !disabledScenes.has(scene) && typeof SCENE_RENDERERS[scene] === 'function');
    }catch(e){ return []; }
  }

  function pickScene(excluded, fallbackExcluded){
    const enabled = enabledSceneNames();
    let choices = enabled.filter(scene => !excluded.has(scene));
    if (!choices.length) choices = enabled.filter(scene => !fallbackExcluded.has(scene));
    if (!choices.length) choices = enabled;
    return choices.length ? pick(choices) : null;
  }

  function assignMissingScenes(){
    const enabled = new Set(enabledSceneNames());
    const claimed = new Set();
    const keepUnique = enabled.size >= PEOPLE.length;
    let changed = false;
    for (const person of PEOPLE){
      let scene = savedScenes[person.name];
      if (!enabled.has(scene) || (keepUnique && claimed.has(scene))){
        scene = pickScene(keepUnique ? claimed : new Set(), new Set());
        if (scene){ savedScenes[person.name] = scene; changed = true; }
      }
      if (scene) claimed.add(scene);
    }
    if (changed) saveScenes();
  }

  function resetWalker(person){
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? W*FLOOR.minX : W*FLOOR.maxX;
    const y = rand(H*FLOOR.minY, H*FLOOR.maxY);
    const walker = {
      name:person.name, label:person.label, sheet:`${person.name}Walk`,
      scene:savedScenes[person.name], x, y, tx:x, ty:y,
      dir:fromLeft ? 'right' : 'left', frame:0, frameTime:0, pause:0,
      celebrateT:0, celebrateElapsed:0, leaving:false,
    };
    walkers.set(person.name, walker);
    chooseTarget(walker);
    return walker;
  }

  function chooseTarget(walker){
    walker.tx = rand(W*FLOOR.minX, W*FLOOR.maxX);
    walker.ty = rand(H*FLOOR.minY, H*FLOOR.maxY);
  }

  function activeWalkers(){
    const scene = SCENES[currentScene];
    return PEOPLE.flatMap(person => {
      const existing = walkers.get(person.name);
      if (existing && existing.scene === scene && (existing.celebrateT > 0 || existing.leaving)){
        return [existing];
      }
      if (savedScenes[person.name] !== scene) return [];
      let walker = existing;
      if (!walker || walker.scene !== scene) walker = resetWalker(person);
      return [walker];
    });
  }

  function updateWalker(walker, dt){
    if (walker.leaving){
      walker.x += (walker.dir === 'right' ? 1 : -1) * EXIT_SPEED * dt;
      walker.frameTime += dt;
      while (walker.frameTime >= 1/10){
        walker.frameTime -= 1/10;
        walker.frame = (walker.frame + 1) % 4;
      }
      if (walker.x < -55 || walker.x > W+55) walkers.delete(walker.name);
      return;
    }
    if (walker.celebrateT > 0){
      const clap = birthdayClapSheets[walker.name];
      if (!clap || !clap.ready) return; // preserve the full three seconds after loading
      walker.celebrateT -= dt;
      walker.celebrateElapsed += dt;
      if (walker.celebrateT <= 0){
        walker.celebrateT = 0;
        walker.leaving = true;
        walker.dir = walker.x < W/2 ? 'left' : 'right';
        walker.frame = 0;
        walker.frameTime = 0;
      }
      return;
    }
    if (walker.pause > 0){
      walker.pause -= dt;
      walker.frame = 0;
      return;
    }
    const dx = walker.tx - walker.x;
    const dy = walker.ty - walker.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 2){
      walker.x = walker.tx; walker.y = walker.ty;
      walker.pause = rand(0.25, 0.8);
      chooseTarget(walker);
      return;
    }
    const step = Math.min(distance, WALK_SPEED * dt);
    walker.x += dx / distance * step;
    walker.y += dy / distance * step;
    if (Math.abs(dx) > Math.abs(dy)) walker.dir = dx > 0 ? 'right' : 'left';
    else walker.dir = dy > 0 ? 'down' : 'up';
    walker.frameTime += dt;
    while (walker.frameTime >= 1/8){
      walker.frameTime -= 1/8;
      walker.frame = (walker.frame + 1) % 4;
    }
  }

  function drawWalker(walker){
    if (walker.celebrateT > 0){
      drawCelebration(walker);
      return;
    }
    const sh = sheets[walker.sheet];
    if (!sh || !sh.ready) return;
    const displayW = DISPLAY_H * sh.fw / sh.fh;
    const feetY = walker.y + (sh.cfg.footInset || 0) * DISPLAY_H;
    const row = sh.cfg.rowMap[walker.dir] ?? 0;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.beginPath();
    ctx.ellipse(walker.x, walker.y-3, displayW*.26, DISPLAY_H*.035, 0, 0, 7);
    ctx.fill();
    ctx.drawImage(sh.canvas, walker.frame*sh.fw, row*sh.fh, sh.fw, sh.fh,
      walker.x-displayW/2, feetY-DISPLAY_H, displayW, DISPLAY_H);
    ctx.restore();
  }

  function drawCelebration(walker){
    const clap = birthdayClapSheets[walker.name];
    if (!clap || !clap.ready) return;
    const sourceW = 543, sourceH = 724;
    const displayW = DISPLAY_H * sourceW / sourceH;
    const frame = Math.floor(walker.celebrateElapsed * 8) % 4;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.beginPath();
    ctx.ellipse(walker.x, walker.y-3, displayW*.3, DISPLAY_H*.035, 0, 0, 7);
    ctx.fill();
    ctx.drawImage(clap.img, frame*sourceW, 0, sourceW, sourceH,
      walker.x-displayW/2, walker.y-DISPLAY_H, displayW, DISPLAY_H);
    ctx.restore();
  }

  function trackSceneVisit(){
    const scene = SCENES[currentScene];
    if (!scene || scene === noteState.lastScene) return;
    noteState.lastScene = scene;
    noteState.visitCount += 1;
    if (noteState.visitCount % 2 === 0){
      const person = pick(PEOPLE);
      noteState.notes[scene] = {
        person:person.name,
        x:rand(W*.18, W*.82),
        y:rand(H*.70, H*.82),
      };
    }
    saveNoteState();
  }

  function activeNote(){
    return noteState.notes[SCENES[currentScene]] || null;
  }

  function drawClueNote(){
    const note = activeNote();
    if (!note) return;
    const bob = Math.sin(sceneTime*2.6)*1.5;
    ctx.save();
    ctx.translate(note.x, note.y+bob);
    ctx.rotate(-0.08);
    ctx.fillStyle = 'rgba(0,0,0,.16)';
    ctx.fillRect(-13, 5, 27, 5);
    ctx.fillStyle = '#fff3c9';
    ctx.strokeStyle = '#b98b55';
    ctx.lineWidth = 1;
    ctx.fillRect(-14, -10, 28, 19);
    ctx.strokeRect(-14, -10, 28, 19);
    ctx.beginPath();
    ctx.moveTo(-14,-10); ctx.lineTo(0,2); ctx.lineTo(14,-10);
    ctx.stroke();
    ctx.fillStyle = '#e07a8b';
    ctx.beginPath(); ctx.arc(0,1,2.5,0,7); ctx.fill();
    ctx.restore();
  }

  function tapClueNote(px, py){
    const scene = SCENES[currentScene];
    const note = noteState.notes[scene];
    if (!note || Math.abs(px-note.x) > 28 || Math.abs(py-note.y) > 26) return false;
    const person = PEOPLE.find(candidate => candidate.name === note.person) || pick(PEOPLE);
    const target = savedScenes[person.name];
    const place = target ? sceneLabel(target) : 'another location';
    say(`A note from ${person.label}: “Try looking for me around ${place}!” 📝`);
    if (typeof showToast === 'function') showToast(`Clue: ${person.label} → ${place}`);
    burstAt('📝', note.x, note.y-8);
    if (typeof sfx === 'function') sfx('find');
    delete noteState.notes[scene];
    saveNoteState();
    return true;
  }

  function relocate(walker){
    const occupied = new Set(PEOPLE
      .filter(person => person.name !== walker.name)
      .map(person => savedScenes[person.name]));
    const oldScene = savedScenes[walker.name];
    const excluded = new Set([...occupied, oldScene]);
    const nextScene = pickScene(excluded, new Set([oldScene]));
    if (nextScene) savedScenes[walker.name] = nextScene;
    saveScenes();
  }

  assignMissingScenes();

  globalThis.getFamilyHideoutLocations = function getFamilyHideoutLocations(){
    const byScene = {};
    for (const person of PEOPLE){
      const scene = savedScenes[person.name];
      if (!scene) continue;
      (byScene[scene] ||= []).push(person.label);
    }
    return byScene;
  };

  EXTRA_UPDATERS.push(function updateFamilyHideout(dt){
    assignMissingScenes();
    trackSceneVisit();
    for (const walker of activeWalkers()) updateWalker(walker, dt);
  });

  EXTRA_DRAWERS.push(function drawFamilyHideout(){
    const visible = activeWalkers().slice().sort((a,b)=>a.y-b.y);
    for (const walker of visible) drawWalker(walker);
    drawClueNote();
  });

  CHARACTER_TAPS.push(function tapFamilyHideout(px, py){
    if (tapClueNote(px, py)) return true;
    const visible = activeWalkers().slice().sort((a,b)=>b.y-a.y);
    for (const walker of visible){
      const dx = px - walker.x;
      const dy = py - (walker.y - DISPLAY_H*.48);
      if (Math.abs(dx) > 34 || Math.abs(dy) > DISPLAY_H*.5) continue;
      if (walker.celebrateT > 0 || walker.leaving) return true;
      const line = pick(FOUND_LINES);
      say(`${walker.label}: ${line}`);
      if (typeof showToast === 'function') showToast(`Found ${walker.label}! 🎉`);
      burstAt('✨', walker.x, walker.y-DISPLAY_H*.35);
      if (typeof sfx === 'function') sfx('find');
      state.fun = clamp(state.fun + 6);
      state.love = clamp(state.love + 3);
      refreshHUD();
      if (typeof loadBirthdayClappers === 'function') loadBirthdayClappers();
      walker.celebrateT = CELEBRATE_DURATION;
      walker.celebrateElapsed = 0;
      relocate(walker);
      return true;
    }
    return false;
  });
})();
