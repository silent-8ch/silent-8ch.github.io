/* pet rendering: drawPet, drawHugGroup, drawPlaceholder, utils  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */

/* ---------- Krystal mood-based expression sprites ----------
   When idle (not moving, not acting, not resting, not crying), swap her walk
   standing pose for an expression sprite that reflects her mood. Each expression
   is a 4-frame horizontal strip (1024x256). Lazily loaded, shared with cutscene
   expression system if present. */
const petExprSprites = {};
const PET_EXPR_LIST = ['cheer','sad','think','wave','laugh'];
function petLoadExpression(expr){
  const key = 'krystal:' + expr;
  if (petExprSprites[key]) return;
  const img = new Image();
  const rec = { img, ready: false, fw: 0, fh: 0 };
  petExprSprites[key] = rec;
  img.onload = () => { rec.fw = Math.floor(img.width / 4); rec.fh = img.height; rec.ready = true; rec.img = img; };
  img.src = 'sprites/expressions/krystal/' + expr + '.png';
}
for (const expr of PET_EXPR_LIST) petLoadExpression(expr);

/* Pick the mood expression to show when Krystal is idle. Returns null for
   "normal" mood (just use the walk sheet standing frame). */
function petMoodExpression(){
  const m = moodScore();
  const e = state.energy ?? 100;
  if (e < 18) return null;        // sleepy state already handled by rest system
  if (m > 80) return 'cheer';     // delighted
  if (m > 60) return 'wave';      // happy — friendly wave idle
  if (m < 20) return 'sad';       // sad
  return null;                    // normal range — use default walk pose
}

function drawPet(){
  const acting = pet.animLock > 0;

  // hugging draws a whole group (Krystal + others), so handle it up front
  if (acting && pet.action === 'hug' && sheets.hugs1 && sheets.hugs1.ready){
    drawHugGroup();
    drawHugRunners();
    return;
  }

  // choose which sheet, row and frame to draw
  let sh, row, frame;
  let useExpression = null;    // if set, draw an expression sprite instead of the sheet
  if (acting && (pet.action==='eat' || pet.action==='draw') && sheets[pet.action] && sheets[pet.action].ready){
    sh = sheets[pet.action];                         // dedicated action animation
    row = 0;
    frame = pet.frame % sh.cfg.cols;
  } else if (!acting && isCrying() && sheets.cry && sheets.cry.ready){
    sh = sheets.cry;                                 // sobbing when neglected
    row = 0;
    frame = pet.frame % sh.cfg.cols;
  } else if (sheets.walk && sheets.walk.ready){
    sh = sheets.walk;
    row = sh.cfg.rowMap[acting ? 'down' : pet.dir] ?? 0;   // face forward while acting
    frame = (!acting && pet.moving) ? (pet.frame % sh.cfg.cols) : 0;
    // when idle and not moving, check for mood-based expression
    if (!acting && !pet.moving && !pet.resting && !pet.restPhase){
      const expr = petMoodExpression();
      if (expr){
        const key = 'krystal:' + expr;
        const sp = petExprSprites[key];
        if (sp && sp.ready) useExpression = { sp, expr };
      }
    }
  } else {
    // art still loading -> placeholder so the game is playable
    const size = 84;
    const bob = Math.sin(pet.bob*6) * (pet.moving?2.5:1.2);
    ctx.fillStyle = 'rgba(0,0,0,.15)';
    ctx.beginPath(); ctx.ellipse(pet.x, pet.y-6, size*0.30, size*0.10, 0, 0, 7); ctx.fill();
    drawPlaceholder(pet.x, pet.y - size*0.55 + bob, size);
    return;
  }

  const dispH = sh.cfg.displayH || 150;
  const dispW = dispH * (sh.fw / sh.fh);
  const bob = (!acting && pet.moving) ? Math.abs(Math.sin(pet.bob*10)) * 3 : 0;
  const foot = (sh.cfg.footInset || 0) * dispH;    // shift down so feet meet the floor
  const feetX = pet.x, feetY = pet.y + foot;

  // shadow (pinned to the ground line, doesn't bob or shift with footInset)
  ctx.fillStyle = 'rgba(0,0,0,.16)';
  ctx.beginPath(); ctx.ellipse(pet.x, pet.y-4, dispW*0.32, dispH*0.05, 0, 0, 7); ctx.fill();

  // while resting she rotates toward horizontal (lying down), pivoting at her feet
  const lying = pet.restAngle > 0.001;
  if (lying){ ctx.save(); ctx.translate(feetX, feetY); ctx.rotate(-pet.restAngle); ctx.translate(-feetX, -feetY); }

  if (useExpression){
    // draw expression sprite instead of walk sheet
    const sp = useExpression.sp;
    const exprFrame = Math.floor(pet.bob * 6) % 4;  // animate using bob timer
    const ew = dispH * (sp.fw / sp.fh);
    ctx.drawImage(sp.img, exprFrame * sp.fw, 0, sp.fw, sp.fh,
      feetX - ew / 2, feetY - dispH - bob, ew, dispH);
  } else {
    ctx.drawImage(
      sh.canvas,
      frame*sh.fw, row*sh.fh, sh.fw, sh.fh,
      feetX - dispW/2, feetY - dispH - bob, dispW, dispH
    );
  }
  if (lying){ ctx.restore(); }

  // accessory on her head (skip while she's crying or mid-nap so it doesn't clash)
  if (!(isCrying()) && !pet.restPhase){
    const topY = (feetY - dispH - bob) + dispH*0.175;   // approx top of her head
    drawAccessory(activeAccessory(), feetX, topY, dispW/46);
  }

  // blushing cheeks after a nuzzle
  if (pet.blush > 0 && !isCrying() && !pet.restPhase && (!acting || pet.action!=='hug')){
    const a = Math.min(0.5, pet.blush * 0.28);
    const faceY = (feetY - dispH - bob) + dispH*0.335;
    const cxo = dispW*0.10;
    ctx.fillStyle = `rgba(255,120,150,${a})`;
    ctx.beginPath(); ctx.ellipse(feetX-cxo, faceY, dispW*0.05, dispH*0.02, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(feetX+cxo, faceY, dispW*0.05, dispH*0.02, 0, 0, 7); ctx.fill();
  }

  // (fallback path while the hug sheets are still loading) float a heart
  if (acting && pet.action==='hug'){
    ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('💗', feetX, feetY - dispH + 4 + Math.sin(pet.bob*5)*3);
  }
}

function drawHugRunners(){
  for (const runner of hugRunners){
    const sh = sheets[runner.sheet];
    if (!sh || !sh.ready) continue;
    const dispH = sh.cfg.displayH;
    const dispW = dispH * sh.fw / sh.fh;
    const feetY = runner.y + (sh.cfg.footInset || 0) * dispH;
    const facesLeft = runner.side > 0;
    const row = sh.cfg.rowMap ? sh.cfg.rowMap[facesLeft ? 'left' : 'right'] : 0;

    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.beginPath();
    ctx.ellipse(runner.x, runner.y-4, dispW*0.27, dispH*0.04, 0, 0, 7);
    ctx.fill();
    ctx.save();
    ctx.translate(runner.x, 0);
    ctx.scale(facesLeft ? -1 : 1, 1);
    ctx.drawImage(sh.canvas, runner.frame*sh.fw, row*sh.fh, sh.fw, sh.fh,
      -dispW/2, feetY-dispH, dispW, dispH);
    ctx.restore();
  }
}

/* Draw the hug: Krystal in the middle with the group clustered around her,
   everyone squeezed together in unison by a pulsing sine wave. */
function drawHugGroup(){
  const cfg = SHEETS.hugs1;
  const anchor = sheets.hugs1;
  const dispH = cfg.displayH;
  const dispW = dispH * (anchor.fw / anchor.fh);
  const feetY = pet.y + (cfg.footInset || 0) * dispH;
  // squeeze pulse: 1.0 = loose, (1 - AMP) = tightest hug
  const squeeze = 1 - HUG_SQUEEZE_AMP * (0.5 + 0.5 * Math.sin(pet.bob * HUG_SQUEEZE_FREQ));

  // group shadow
  ctx.fillStyle = 'rgba(0,0,0,.16)';
  ctx.beginPath(); ctx.ellipse(pet.x, pet.y-4, dispW*0.5, dispH*0.05, 0, 0, 7); ctx.fill();

  // assign each hugger to a side (alternating right, left, right, …) and a rank
  const rights = [], lefts = [];
  hugGroup.forEach((name, i) => {
    const side = (i % 2 === 0) ? 1 : -1;            // even -> right, odd -> left
    const rank = Math.floor(i / 2);                 // how far out on that side
    const offset = side * (HUG_BASE_GAP + rank * HUG_SIDE_STEP);
    (side > 0 ? rights : lefts).push({ name, offset, rank });
  });

  function drawPerson(name, offset, mirror){
    const h = HUGGERS[name];
    const sh = sheets[h.sheet];
    if (!sh || !sh.ready) return;
    ctx.save();
    ctx.translate(pet.x + offset * squeeze, feetY);
    ctx.scale((mirror ? -1 : 1) * squeeze, 1);      // mirror to face inward + squeeze width
    ctx.drawImage(sh.canvas, h.index*sh.fw, 0, sh.fw, sh.fh, -dispW/2, -dispH, dispW, dispH);
    ctx.restore();
  }

  // back-to-front: left side (mirrored) behind, then Krystal, then right side in front
  lefts.sort((a,b)=> b.rank - a.rank).forEach(e => drawPerson(e.name, e.offset, true));
  drawPerson('krystal', 0, false);
  rights.sort((a,b)=> b.rank - a.rank).forEach(e => drawPerson(e.name, e.offset, false));
}

/* Placeholder "her": a friendly blob shown only while the walk sheet loads. */
function drawPlaceholder(gx, gy, size){
  const mi = moodInfo();
  ctx.save();
  ctx.translate(gx, gy);

  const squash = pet.moving ? 1+Math.sin(pet.bob*12)*0.04 : 1;
  const r = size*0.34;

  // body
  ctx.fillStyle = getVar('--accent2');
  ctx.beginPath(); ctx.ellipse(0, 0, r*0.9, r*squash, 0, 0, 7); ctx.fill();
  // head
  ctx.fillStyle = '#ffe0c2';
  ctx.beginPath(); ctx.arc(0, -r*1.05, r*0.66, 0, 7); ctx.fill();
  // hair
  ctx.fillStyle = '#6b4a34';
  ctx.beginPath(); ctx.arc(0, -r*1.25, r*0.68, Math.PI, 0); ctx.fill();
  ctx.fillRect(-r*0.68, -r*1.25, r*0.22, r*0.9);
  ctx.fillRect( r*0.46, -r*1.25, r*0.22, r*0.9);
  // eyes
  ctx.fillStyle = '#3a2a20';
  const eo = (mi.key==='sad') ? 0.6 : 1;
  ctx.beginPath(); ctx.arc(-r*0.22, -r*1.02, 2.6*eo, 0, 7); ctx.arc(r*0.22, -r*1.02, 2.6*eo, 0, 7); ctx.fill();
  // mouth by mood
  ctx.strokeStyle = '#b5544f'; ctx.lineWidth = 2.2; ctx.beginPath();
  if (mi.key==='happy'){ ctx.arc(0, -r*0.82, r*0.24, 0.15*Math.PI, 0.85*Math.PI); }
  else if (mi.key==='sad'){ ctx.arc(0, -r*0.70, r*0.24, 1.15*Math.PI, 1.85*Math.PI); }
  else { ctx.moveTo(-r*0.14, -r*0.80); ctx.lineTo(r*0.14, -r*0.80); }
  ctx.stroke();
  // cheeks
  ctx.fillStyle = 'rgba(224,122,139,.5)';
  ctx.beginPath(); ctx.arc(-r*0.34, -r*0.90, 3, 0, 7); ctx.arc(r*0.34, -r*0.90, 3, 0, 7); ctx.fill();

  // little prop hints per action
  if (pet.animLock > 0){
    ctx.font = (r*0.9)+'px serif'; ctx.textAlign='center';
    const em = pet.action==='eat' ? '🍪' : pet.action==='draw' ? '🎨' : '💗';
    ctx.fillText(em, r*0.9, -r*0.2);
  }
  ctx.restore();
}

/* utils */
function roundRect(x,y,w,h,rr){ ctx.beginPath(); ctx.moveTo(x+rr,y); ctx.arcTo(x+w,y,x+w,y+h,rr); ctx.arcTo(x+w,y+h,x,y+h,rr); ctx.arcTo(x,y+h,x,y,rr); ctx.arcTo(x,y,x+w,y,rr); ctx.closePath(); }
function getVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
