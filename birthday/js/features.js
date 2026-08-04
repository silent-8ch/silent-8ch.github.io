/* features: passport, trinkets, achievements, compliment, settings, outfits, notes, pad, days-together, scene registry  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */

/* ---- passport: places she's visited (persisted) + milestone badges ---- */
let visited = (function(){ try{ const r=localStorage.getItem('bpet_visited'); if(r) return new Set(JSON.parse(r)); }catch(e){} return new Set(); })();
function saveVisited(){ try{ localStorage.setItem('bpet_visited', JSON.stringify([...visited])); }catch(e){} }
const PASSPORT_BADGES = [
  {n:10, icon:'🌱', name:'Wanderer'}, {n:25, icon:'🧭', name:'Explorer'},
  {n:50, icon:'⭐', name:'Adventurer'}, {n:100, icon:'🏆', name:'Voyager'},
];
function earnedBadges(){ return PASSPORT_BADGES.filter(b=>visited.size>=b.n); }

/* ---- collectible trinkets she finds while exploring ---- */
const TRINKET_POOL = (()=>{
  const map={}; const g=(names,arr)=>names.forEach(n=>map[n]=arr);
  g(['beach','tidepools','marina','fishingdock'], ['🐚','⭐','🦀','🌊']);
  g(['autumnforest','orchard','pumpkinpatch','coveredbridge','cornmaze','wheatfield','redwoods'], ['🍁','🌰','🍄','🍂']);
  g(['florist','cherryblossom','lavender','tulipfield','sunflowers','greenhouse','topiary','hedgemaze','vineyard','pasture','alpinemeadow','teaplantation','backyard'], ['🌸','🌼','🍀','🐝']);
  g(['fireflies','meteorshower','observatory','planetarium','aurora','biobay','glowwormcave'], ['✨','🌙','☄️','🔭']);
  g(['aquarium','koipond','coralreef','waterlily','river'], ['🐠','🐚','💧','🪸']);
  g(['snowycabin','icepond','frozenfalls','icebergbay'], ['❄️','⛄','🧊']);
  g(['bakery','chocolateshop','candyshop','icecreamparlor','cafe','diner','cheeseshop','perfumery'], ['🍪','🍬','🧁','🍫']);
  g(['musicroom','recordshop','ballroom','cinema','carnival','arcade'], ['🎵','🎶','🎫']);
  g(['artstudio','pottery','sewingstudio','weaving','stainedglass','glassblowing','luthier','bookbindery','letterpress','cobbler'], ['🎨','🖌️','🧵']);
  g(['catcafe','petshop','butterflydome','aviary','savanna'], ['🐾','🦋','🪶']);
  g(['desert','saltflats'], ['🌵','🦎','🏜️']);
  g(['spa','hotspring','zengarden','bamboo'], ['🕯️','🍃','🪷']);
  g(['teahouse'], ['🍵','🫖','🍡']);
  g(['library'], ['📖','🔖','✒️']);
  g(['balletstudio','millinery'], ['🩰','🎀','👒']);
  g(['forge','candleshop'], ['⚒️','🔥','🪵']);
  g(['balloons'], ['🎈','🎊','🎉']);
  return map;
})();
const TRINKET_DEFAULT = ['💛','🍀','✨'];
const TRINKETS_ALL = [...new Set([].concat(...Object.values(TRINKET_POOL), TRINKET_DEFAULT))];
let collection = (function(){ try{ const r=localStorage.getItem('bpet_collection'); if(r) return JSON.parse(r); }catch(e){} return {}; })();
function saveCollection(){ try{ localStorage.setItem('bpet_collection', JSON.stringify(collection)); }catch(e){} }
function collectedKinds(){ return TRINKETS_ALL.filter(t=>collection[t]>0).length; }
let trinketTimer = rand(18, 30);
function findTrinket(dt){
  trinketTimer -= dt;
  if (trinketTimer > 0) return;
  trinketTimer = rand(22, 42);
  if (pet.animLock > 0 || pet.resting || isCrying() || speech.classList.contains('show')) return;
  if (Math.random() > 0.6) return;                       // not every time — keep it special
  const pool = TRINKET_POOL[SCENES[currentScene]] || TRINKET_DEFAULT;
  const t = pick(pool);
  const first = !collection[t];
  collection[t] = (collection[t]||0) + 1; saveCollection();
  say(`Found a ${t}!`); burstAt(t, pet.x + rand(-10,10), pet.y - 10); sfx('find');
  if (first) hearts();
  state.fun = clamp(state.fun + 3); refreshHUD();
}
function buildCollection(){
  const grid=document.getElementById('collectGrid'); if(!grid) return;
  grid.innerHTML='';
  TRINKETS_ALL.forEach(t=>{
    const n = collection[t]||0;
    const cell=document.createElement('div'); cell.className='collectCell'+(n?'':' locked');
    cell.innerHTML = `<span class="ce">${t}</span><span class="cn">${n?('×'+n):'?'}</span>`;
    grid.appendChild(cell);
  });
}
/* ---- achievements + toasts ---- */
const ACHIEVEMENTS = [
  {id:'first_hug', icon:'🤗', name:'First Hug',       desc:'Give her a hug',            test:()=> (state.hugs||0) >= 1},
  {id:'hug_50',    icon:'💞', name:'Hug Champion',    desc:'50 hugs',                  test:()=> (state.hugs||0) >= 50},
  {id:'cookie_25', icon:'🍪', name:'Cookie Lover',    desc:'25 cookies',               test:()=> (state.feeds||0) >= 25},
  {id:'cookie_100',icon:'🎂', name:'Cookie Monster',  desc:'100 cookies',              test:()=> (state.feeds||0) >= 100},
  {id:'artist',    icon:'🎨', name:'Little Artist',   desc:'Draw together 25 times',   test:()=> (state.draws||0) >= 25},
  {id:'napper',    icon:'😴', name:'Cozy Napper',     desc:'Rest 5 times',             test:()=> (state.rests||0) >= 5},
  {id:'explorer',  icon:'🧭', name:'Explorer',        desc:'Visit 50 places',          test:()=> visited.size >= 50},
  {id:'globetrot', icon:'🗺️', name:'Globetrotter',    desc:'Visit every place',        test:()=> visited.size >= SCENES.length},
  {id:'collector', icon:'🧺', name:'Treasure Hunter', desc:'Collect 10 kinds',         test:()=> collectedKinds() >= 10},
  {id:'week',      icon:'🔥', name:'Week Together',    desc:'A 7-day streak',           test:()=> (meta.streak||0) >= 7},
  {id:'month',     icon:'🌟', name:'A Month of Us',   desc:'30 days together',         test:()=> (meta.totalDays||0) >= 30},
  {id:'first_draw',  icon:'✏️', name:'First Doodle',    desc:'Draw together once',       test:()=> (state.draws||0) >= 1},
  {id:'first_cookie',icon:'🍪', name:'First Cookie',    desc:'Share a cookie',           test:()=> (state.feeds||0) >= 1},
  {id:'first_nap',   icon:'💤', name:'First Nap',       desc:'Take a rest',              test:()=> (state.rests||0) >= 1},
  {id:'draw_100',    icon:'🖼️', name:'Master Artist',    desc:'Draw together 100 times',  test:()=> (state.draws||0) >= 100},
  {id:'rest_25',     icon:'🛌', name:'Well Rested',     desc:'Rest 25 times',            test:()=> (state.rests||0) >= 25},
  {id:'hug_200',     icon:'🫂', name:'Endless Hugs',    desc:'200 hugs',                 test:()=> (state.hugs||0) >= 200},
  {id:'wanderer',    icon:'🌱', name:'Wanderer',        desc:'Visit 10 places',          test:()=> visited.size >= 10},
  {id:'sightseer',   icon:'🧳', name:'Sightseer',       desc:'Visit 25 places',          test:()=> visited.size >= 25},
  {id:'curator',     icon:'🔮', name:'Curator',         desc:'Collect 25 kinds',         test:()=> collectedKinds() >= 25},
  {id:'completion',  icon:'🏅', name:'Completionist',   desc:'Collect every kind',       test:()=> collectedKinds() >= TRINKETS_ALL.length},
  {id:'streak_3',    icon:'✨', name:'Three in a Row',  desc:'A 3-day streak',           test:()=> (meta.streak||0) >= 3},
  {id:'fortnight',   icon:'🗓️', name:'Two Weeks of Us', desc:'14 days together',         test:()=> (meta.totalDays||0) >= 14},
  {id:'season',      icon:'🌷', name:'A Season Together',desc:'90 days together',         test:()=> (meta.totalDays||0) >= 90},
  {id:'gallery',     icon:'🎨', name:'Gallery Opening', desc:'Save a drawing on the pad',test:()=> (typeof gallery!=='undefined') && gallery.length >= 1},
];
let achieved = (function(){ try{ const r=localStorage.getItem('bpet_achieved'); if(r) return new Set(JSON.parse(r)); }catch(e){} return new Set(); })();
function saveAchieved(){ try{ localStorage.setItem('bpet_achieved', JSON.stringify([...achieved])); }catch(e){} }
let toastQueue = [], toastBusy = false;
/* ---- a little daily compliment from Paul (same one all day, new each day) ---- */
const COMPLIMENTS = [
  'Your laugh is my favorite sound in the world.',
  'You make ordinary days feel like gifts.',
  'I\'d choose you again, every single time.',
  'The world is softer because you\'re in it.',
  'Your kindness is the bravest thing I know.',
  'I still get butterflies when you smile.',
  'You\'re my favorite hello and hardest goodbye.',
  'Everything is better with your hand in mine.',
  'You draw beauty into everything you touch.',
  'Home isn\'t a place — it\'s you.',
  'You\'re proof that some things are just meant to be.',
  'I love the way your eyes light up when you\'re happy.',
  'You make me want to be gentler with the world.',
  'Loving you is the easiest thing I do.',
  'Your heart is the biggest, warmest place I know.',
  'You\'re the best part of every single day.',
  'I\'d cross any distance just to sit beside you.',
  'You make even Mondays feel like ours.',
  'Your hugs fix things nothing else can.',
  'I fall for you a little more each morning.',
  'You are enough, exactly as you are.',
  'My favorite adventure is the quiet one with you.',
  'You\'re the wish I\'d make on every star.',
  'Being loved by you is my luckiest thing.',
  'You have a way of making everyone feel seen.',
  'I love how you notice the tiny, beautiful things.',
  'Your calm is my favorite place to land.',
  'Even your bad days can\'t hide how lovely you are.',
  'You make me laugh in the middle of ordinary chores.',
  'I\'d pick our little routines over anyone\'s grand adventure.',
  'You\'re the softest, strongest person I know.',
  'Somehow you always know what my heart needs.',
  'Growing older sounds wonderful if it\'s next to you.',
  'You turned my whole life a warmer shade.',
  'I love the little hum you make when you\'re happy.',
  'Every good habit I have, I learned from loving you.',
  'You\'re my favorite thought before I fall asleep.',
  'The best plans are the ones that include you.'
];
function dailyCompliment(){
  try{
    const t = todayStr();
    if (localStorage.getItem('bpet_fortune') === t) return;   // already shown today
    localStorage.setItem('bpet_fortune', t);
    // deterministic pick so it stays the same all day
    const dayNum = Math.floor(new Date(t+'T00:00').getTime() / 86400000);
    const msg = COMPLIMENTS[((dayNum % COMPLIMENTS.length) + COMPLIMENTS.length) % COMPLIMENTS.length];
    setTimeout(()=>{ showToast('💛','A little truth for today', msg); }, 3200);
  }catch(e){}
}
function showToast(icon, title, sub){
  toastQueue.push([icon,title,sub]);
  if (toastBusy) return;
  const el = document.getElementById('toast'); if(!el) return;
  const next = ()=>{
    if (!toastQueue.length){ toastBusy=false; return; }
    toastBusy = true;
    const [i,t,s] = toastQueue.shift();
    el.innerHTML = `<span class="ti">${i}</span><span><span class="tt">${t}</span><span class="ts">${s||''}</span></span>`;
    el.className = '';                 // visible (base), restart pop animation
    void el.offsetWidth; el.classList.add('show');
    setTimeout(()=>{ el.classList.add('hide'); setTimeout(next, 200); }, 2600);
  };
  next();
}
function checkAchievements(){
  ACHIEVEMENTS.forEach(a=>{
    if (!achieved.has(a.id) && a.test()){
      achieved.add(a.id); saveAchieved();
      showToast(a.icon, 'Achievement: '+a.name, a.desc + ' 🏆'); sfx('day'); hearts();
    }
  });
}

/* ---- settings: gentle sound, relaxed mode, reset ---- */
let settings = (function(){ try{ const r=localStorage.getItem('bpet_settings'); if(r) return {sound:false,relaxed:false,...JSON.parse(r)}; }catch(e){} return {sound:false, relaxed:false}; })();
function saveSettings(){ try{ localStorage.setItem('bpet_settings', JSON.stringify(settings)); }catch(e){} }
let sfxCtx = null;
function ensureAudio(){ try{ if(!sfxCtx) sfxCtx = new (window.AudioContext||window.webkitAudioContext)(); if(sfxCtx.state==='suspended') sfxCtx.resume(); }catch(e){} }
function tone(freq, dur, when, vol, type){ if(!settings.sound||!sfxCtx) return;
  const t0=sfxCtx.currentTime+(when||0); const o=sfxCtx.createOscillator(), g=sfxCtx.createGain();
  o.type=type||'sine'; o.frequency.value=freq; g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(vol||0.12, t0+0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
  o.connect(g).connect(sfxCtx.destination); o.start(t0); o.stop(t0+dur+0.03);
}
const SFX = {
  feed:[[523,0.12,0],[659,0.14,0.08]], draw:[[587,0.1,0],[784,0.16,0.06]],
  hug:[[659,0.14,0],[880,0.2,0.08]], rest:[[392,0.35,0,0.09]],
  find:[[784,0.08,0],[1047,0.14,0.05]], day:[[523,0.12,0],[659,0.12,0.09],[784,0.2,0.18]],
  tap:[[880,0.06,0,0.07]],
};
function sfx(kind){ if(!settings.sound) return; ensureAudio(); (SFX[kind]||[]).forEach(n=> tone(n[0],n[1],n[2],n[3])); }

// compose the current scene into a little framed "photo" with a caption
function buildKeepsakeCanvas(){
  const pad=14, capH=48;
  const oc=document.createElement('canvas'); oc.width=W+pad*2; oc.height=H+pad*2+capH;
  const o=oc.getContext('2d');
  o.fillStyle='#f6e6cf'; o.fillRect(0,0,oc.width,oc.height);            // warm mat/frame
  o.drawImage(cv, pad, pad, W, H);                                       // the moment itself
  o.strokeStyle='rgba(0,0,0,.12)'; o.lineWidth=1; o.strokeRect(pad+0.5,pad+0.5,W-1,H-1);
  const place=sceneLabel(SCENES[currentScene]);
  const d=new Date(); const ds=(d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear();
  o.textAlign='center';
  o.fillStyle='#8a5a4a'; o.font='700 16px system-ui,Segoe UI,sans-serif';
  o.fillText('📍 '+place+'  ·  '+ds, oc.width/2, H+pad*2+20);
  o.fillStyle='#c98a86'; o.font='600 13px system-ui,Segoe UI,sans-serif';
  o.fillText('a moment with '+CONFIG.name+'  💛', oc.width/2, H+pad*2+40);
  return oc;
}
function saveKeepsake(){
  try{
    const oc=buildKeepsakeCanvas();
    oc.toBlob(function(blob){
      if(!blob) return;
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url; a.download='keepsake-'+SCENES[currentScene]+'.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 4000);
    });
    if(typeof showToast==='function') showToast('📸','Keepsake saved','A little photo of this moment 💛');
    sfx('find');
  }catch(e){ console.log('keepsake error', e); }
}
function buildSettings(){
  const list=document.getElementById('setList'); if(!list) return; list.innerHTML='';
  const toggle=(label, key, sub)=>{
    const row=document.createElement('div'); row.className='setRow';
    row.innerHTML=`<span>${label}${sub?`<small>${sub}</small>`:''}</span><span class="sv">${settings[key]?'On':'Off'}</span>`;
    row.addEventListener('click',()=>{ settings[key]=!settings[key]; saveSettings(); if(key==='sound'&&settings.sound){ ensureAudio(); sfx('find'); } buildSettings(); });
    list.appendChild(row);
  };
  toggle('🔊 Sound', 'sound', 'Gentle chimes when you play with her');
  toggle('🌿 Relaxed mode', 'relaxed', 'Her needs drain half as fast');
  const keep=document.createElement('div'); keep.className='setRow';
  keep.innerHTML=`<span>📸 Save a keepsake<small>Download a little photo of this moment</small></span><span class="sv">Save</span>`;
  keep.addEventListener('click', saveKeepsake);
  list.appendChild(keep);
  const reset=document.createElement('div'); reset.className='setRow danger';
  reset.innerHTML=`<span>♻️ Reset progress<small>Clears stats, days, passport & collection</small></span><span class="sv">Reset</span>`;
  reset.addEventListener('click',()=>{ if(confirm('Reset all progress? This can’t be undone.')){ ['bpet','bpet_disabled','bpet_visited','bpet_meta','bpet_collection','bpet_outfit','bpet_settings','bpet_achieved'].forEach(k=>{ try{localStorage.removeItem(k);}catch(e){} }); location.reload(); } });
  list.appendChild(reset);
  // achievements
  const hdr=document.createElement('div'); hdr.id='setSection'; hdr.textContent=`🏆 Achievements ${achieved.size}/${ACHIEVEMENTS.length}`; list.appendChild(hdr);
  ACHIEVEMENTS.forEach(a=>{
    const got=achieved.has(a.id);
    const row=document.createElement('div'); row.className='achRow'+(got?'':' locked');
    row.innerHTML=`<span class="ai">${a.icon}</span><span>${a.name}<small>${a.desc}</small></span>`;
    list.appendChild(row);
  });
}
function openSettings(){ ensureAudio(); buildSettings(); document.getElementById('setPanel').classList.remove('hide'); }
function closeSettings(){ document.getElementById('setPanel').classList.add('hide'); }

function buildOutfitList(){
  const list=document.getElementById('outfitList'); if(!list) return; list.innerHTML='';
  OUTFITS.forEach(o=>{
    const row=document.createElement('div'); row.className='outfitRow'+(o.id===outfit?' sel':'');
    row.innerHTML=`<span class="oi">${o.icon}</span><span>${o.label}</span>`;
    row.addEventListener('click',()=>{ outfit=o.id; saveOutfit(); buildOutfitList(); });
    list.appendChild(row);
  });
}
function openOutfit(){ buildOutfitList(); document.getElementById('outfitPanel').classList.remove('hide'); }
function closeOutfit(){ document.getElementById('outfitPanel').classList.add('hide'); }

function openCollect(){ buildCollection();
  const el=document.getElementById('collectHead').firstElementChild;
  if(el) el.textContent=`🧺 Collection ${collectedKinds()}/${TRINKETS_ALL.length}`;
  document.getElementById('collectPanel').classList.remove('hide'); }
function closeCollect(){ document.getElementById('collectPanel').classList.add('hide'); }

/* ---- outfits / accessories drawn over her ---- */
const OUTFITS = [
  {id:'auto',   label:'Auto (by place)', icon:'✨'},
  {id:'none',   label:'None',            icon:'🚫'},
  {id:'party',  label:'Party hat',       icon:'🎉'},
  {id:'sun',    label:'Sun hat',         icon:'👒'},
  {id:'beanie', label:'Beanie',          icon:'🧢'},
  {id:'flower', label:'Flower crown',    icon:'🌸'},
  {id:'bow',    label:'Ribbon bow',      icon:'🎀'},
  {id:'crown',      label:'Crown',           icon:'👑'},
  {id:'tiara',      label:'Tiara',           icon:'💎'},
  {id:'chef',       label:'Chef\'s hat',     icon:'🧑‍🍳'},
  {id:'halo',       label:'Little halo',     icon:'😇'},
  {id:'catears',    label:'Cat ears',        icon:'🐱'},
  {id:'winterhat',  label:'Winter hat',      icon:'🧣'},
  {id:'earmuffs',   label:'Earmuffs',        icon:'❄️'},
  {id:'headphones', label:'Headphones',      icon:'🎧'},
  {id:'laurel',     label:'Laurel wreath',   icon:'🌿'},
  {id:'gradcap',    label:'Grad cap',        icon:'🎓'},
];
let outfit = (function(){ try{ return localStorage.getItem('bpet_outfit') || 'auto'; }catch(e){ return 'auto'; } })();
function saveOutfit(){ try{ localStorage.setItem('bpet_outfit', outfit); }catch(e){} }
// which accessory to actually draw right now (resolves 'auto' from the scene)
function activeAccessory(){
  if (outfit !== 'auto') return outfit;
  const s = SCENES[currentScene];
  if (['beach','desert','sunflowers','tulipfield','marina','vineyard','saltflats','tidepools'].includes(s)) return 'sun';
  if (['snowycabin','icepond','frozenfalls','icebergbay','aurora'].includes(s)) return 'beanie';
  if (['florist','cherryblossom','lavender','greenhouse','topiary','hedgemaze','pasture','alpinemeadow','koipond','teahouse','zengarden'].includes(s)) return 'flower';
  if (['carnival','arcade','balloons','ballroom','cinema','recordshop'].includes(s)) return 'party';
  if (['balletstudio','perfumery','millinery','spa','candyshop','icecreamparlor'].includes(s)) return 'bow';
  return 'none';
}
// cx = head center x, topY = top of head, s = pixel scale
function drawAccessory(kind, cx, topY, s){
  if (!kind || kind==='none') return;
  ctx.save();
  if (kind==='party'){
    ctx.fillStyle='#e0556a'; ctx.beginPath(); ctx.moveTo(cx-9*s,topY+6*s); ctx.lineTo(cx+9*s,topY+6*s); ctx.lineTo(cx,topY-16*s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.4; for(let i=1;i<=2;i++){ const w=9*s*(1-i*0.32), y=topY+6*s-i*6.5*s; ctx.beginPath(); ctx.moveTo(cx-w,y); ctx.lineTo(cx+w,y); ctx.stroke(); }
    ctx.fillStyle='#f2c14e'; ctx.beginPath(); ctx.arc(cx,topY-16*s,2.4*s,0,7); ctx.fill();
  } else if (kind==='sun'){
    ctx.fillStyle='#e8c98a'; ctx.beginPath(); ctx.ellipse(cx,topY+7*s,17*s,5*s,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx,topY+2*s,9*s,7*s,0,Math.PI,0); ctx.fill();
    ctx.fillStyle='#c85a7a'; ctx.fillRect(cx-9*s,topY+4*s,18*s,2.4*s);
    ctx.fillStyle='#e0709a'; ctx.beginPath(); ctx.arc(cx+7*s,topY+5*s,2.2*s,0,7); ctx.fill();
  } else if (kind==='beanie'){
    ctx.fillStyle='#4a86c0'; ctx.beginPath(); ctx.arc(cx,topY+6*s,10*s,Math.PI,0); ctx.fill(); ctx.fillRect(cx-10*s,topY+5*s,20*s,3.5*s);
    ctx.fillStyle='#eaf2ff'; ctx.fillRect(cx-10*s,topY+7*s,20*s,2.5*s);
    ctx.beginPath(); ctx.arc(cx,topY-5*s,2.8*s,0,7); ctx.fill();
  } else if (kind==='flower'){
    const cols=['#e0709a','#f2c14e','#8a5fd0','#5aa0e0','#e0709a'];
    for(let i=-2;i<=2;i++){ ctx.fillStyle=cols[i+2]; ctx.beginPath(); ctx.arc(cx+i*5*s,topY+5*s+Math.abs(i)*1.4*s,3*s,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx+i*5*s,topY+5*s+Math.abs(i)*1.4*s,1.1*s,0,7); ctx.fill(); }
  } else if (kind==='bow'){
    const bx=cx+6*s, by=topY+5*s; ctx.fillStyle='#e0556a';
    ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx-6*s,by-4*s); ctx.lineTo(bx-6*s,by+4*s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+6*s,by-4*s); ctx.lineTo(bx+6*s,by+4*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#c03a52'; ctx.beginPath(); ctx.arc(bx,by,2*s,0,7); ctx.fill();
  } else if (kind==='crown'){
    ctx.fillStyle='#f2c14e';
    ctx.beginPath();
    ctx.moveTo(cx-9*s,topY+6*s); ctx.lineTo(cx-9*s,topY-2*s); ctx.lineTo(cx-4.5*s,topY+2*s);
    ctx.lineTo(cx,topY-4*s); ctx.lineTo(cx+4.5*s,topY+2*s); ctx.lineTo(cx+9*s,topY-2*s);
    ctx.lineTo(cx+9*s,topY+6*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#e0556a'; ctx.beginPath(); ctx.arc(cx,topY+3.4*s,1.6*s,0,7); ctx.fill();
    ctx.fillStyle='#5aa0e0'; ctx.beginPath(); ctx.arc(cx-9*s,topY-2*s,1.4*s,0,7); ctx.arc(cx+9*s,topY-2*s,1.4*s,0,7); ctx.fill();
  } else if (kind==='tiara'){
    ctx.strokeStyle='#f2d060'; ctx.lineWidth=2*s;
    ctx.beginPath(); ctx.moveTo(cx-8*s,topY+6*s); ctx.quadraticCurveTo(cx,topY-2*s,cx+8*s,topY+6*s); ctx.stroke();
    ctx.fillStyle='#8a5fd0'; ctx.beginPath(); ctx.arc(cx,topY+1*s,2.2*s,0,7); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx-0.6*s,topY+0.4*s,0.7*s,0,7); ctx.fill();
  } else if (kind==='chef'){
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(cx-5*s,topY-1*s,4*s,0,7); ctx.arc(cx,topY-3*s,5*s,0,7); ctx.arc(cx+5*s,topY-1*s,4*s,0,7); ctx.fill();
    ctx.fillRect(cx-7*s,topY+2*s,14*s,5*s);
    ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1; ctx.strokeRect(cx-7*s,topY+2*s,14*s,5*s);
  } else if (kind==='halo'){
    ctx.strokeStyle='rgba(255,240,160,.5)'; ctx.lineWidth=4*s;
    ctx.beginPath(); ctx.ellipse(cx,topY-3*s,7*s,2.6*s,0,0,7); ctx.stroke();
    ctx.strokeStyle='#f2d060'; ctx.lineWidth=2.2*s;
    ctx.beginPath(); ctx.ellipse(cx,topY-3*s,7*s,2.6*s,0,0,7); ctx.stroke();
  } else if (kind==='catears'){
    ctx.fillStyle='#6b4a34';
    ctx.beginPath(); ctx.moveTo(cx-8*s,topY+4*s); ctx.lineTo(cx-11*s,topY-4*s); ctx.lineTo(cx-3*s,topY+1*s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx+8*s,topY+4*s); ctx.lineTo(cx+11*s,topY-4*s); ctx.lineTo(cx+3*s,topY+1*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#e0709a';
    ctx.beginPath(); ctx.moveTo(cx-7.6*s,topY+3*s); ctx.lineTo(cx-9.6*s,topY-1.6*s); ctx.lineTo(cx-4.6*s,topY+1*s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx+7.6*s,topY+3*s); ctx.lineTo(cx+9.6*s,topY-1.6*s); ctx.lineTo(cx+4.6*s,topY+1*s); ctx.closePath(); ctx.fill();
  } else if (kind==='winterhat'){
    ctx.fillStyle='#c8506a'; ctx.beginPath(); ctx.arc(cx,topY+6*s,10*s,Math.PI,0); ctx.fill();
    ctx.fillStyle='#ffe8ef'; ctx.fillRect(cx-10*s,topY+5*s,20*s,3.5*s);
    ctx.beginPath(); ctx.arc(cx,topY-6*s,3*s,0,7); ctx.fill();
  } else if (kind==='earmuffs'){
    ctx.strokeStyle='#a06fd0'; ctx.lineWidth=2.2*s;
    ctx.beginPath(); ctx.arc(cx,topY+7*s,9*s,Math.PI*1.15,Math.PI*1.85); ctx.stroke();
    ctx.fillStyle='#c89af0'; ctx.beginPath(); ctx.arc(cx-9*s,topY+7*s,3.4*s,0,7); ctx.arc(cx+9*s,topY+7*s,3.4*s,0,7); ctx.fill();
  } else if (kind==='headphones'){
    ctx.strokeStyle='#3a3a44'; ctx.lineWidth=2.4*s;
    ctx.beginPath(); ctx.arc(cx,topY+5*s,9*s,Math.PI,0); ctx.stroke();
    ctx.fillStyle='#e0556a';
    roundRect(cx-11*s,topY+5*s,4*s,7*s,1.5*s); ctx.fill();
    roundRect(cx+7*s,topY+5*s,4*s,7*s,1.5*s); ctx.fill();
  } else if (kind==='laurel'){
    ctx.fillStyle='#6cb356';
    for(let i=0;i<5;i++){ const t=i/4, ang=Math.PI*(0.5+0.42*t);
      for(const side of [-1,1]){
        const lx=cx+side*Math.cos(ang)*10*s, ly=topY+6*s-Math.sin(ang)*8*s;
        ctx.save(); ctx.translate(lx,ly); ctx.rotate(side*ang);
        ctx.beginPath(); ctx.ellipse(0,0,2.4*s,1.2*s,0,0,7); ctx.fill(); ctx.restore();
      }
    }
  } else if (kind==='gradcap'){
    ctx.fillStyle='#2a2a34';
    ctx.beginPath(); ctx.moveTo(cx-6*s,topY+4*s); ctx.lineTo(cx+6*s,topY+4*s); ctx.lineTo(cx+5*s,topY+8*s); ctx.lineTo(cx-5*s,topY+8*s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx,topY-1*s); ctx.lineTo(cx+11*s,topY+3*s); ctx.lineTo(cx,topY+7*s); ctx.lineTo(cx-11*s,topY+3*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#f2c14e'; ctx.beginPath(); ctx.arc(cx,topY+3*s,1.3*s,0,7); ctx.fill();
    ctx.strokeStyle='#f2c14e'; ctx.lineWidth=1.2*s;
    ctx.beginPath(); ctx.moveTo(cx,topY+3*s); ctx.lineTo(cx+9*s,topY+3*s); ctx.lineTo(cx+9*s,topY+8*s); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx+9*s,topY+9*s,1.4*s,0,7); ctx.fill();
  }
  ctx.restore();
}

/* ---- love notes from Paul, unlocking as the days together add up ---- */
const LOVE_NOTES = [
  {day:1,  text:'Happy birthday, my love. I made this whole little world just for you — every place, every hug. 💛 —Paul'},
  {day:2,  text:'Every day with you is my favorite day. Even the quiet ones. 💗'},
  {day:3,  text:'Thank you for your drawings, your laugh, and for always sharing your cookies (mostly). 🍪'},
  {day:5,  text:'You make ordinary moments feel like magic. I don’t know how you do it. ✨'},
  {day:7,  text:'A whole week of us in here — and a lifetime of us out there. 🥰'},
  {day:10, text:'I’d wander all 123 of these places just to hold your hand in one of them. 🗺️'},
  {day:14, text:'Two weeks, and I still get butterflies when you smile at me. 🦋'},
  {day:21, text:'Wherever we are, you’re home to me. 🏡'},
  {day:30, text:'A month in, and I love you more than the day we started. Always will. 💍'},
  {day:40, text:'Forty little days of you saying hello to me in here. I never get tired of it. 💛'},
  {day:50, text:'Fifty days. If loving you is a habit, it\'s the only one I never want to break. 🥰'},
  {day:60, text:'Two months of visits. You keep showing up for the small stuff — that\'s the whole miracle. ✨'},
  {day:75, text:'Some days I just open this to see you smile. You\'re my little pocket of sunshine. 🌞'},
  {day:90, text:'A whole season together in here. Spring, summer, or snow — you\'re my favorite weather. 🍃'},
  {day:120, text:'Four months, and I\'d still walk into any of these places just to find you waiting. 🚶'},
  {day:150, text:'One hundred and fifty hellos. Thank you for being someone worth coming back to. 💗'},
  {day:200, text:'Two hundred days. I keep count the way you keep my heart — carefully, and for keeps. 💞'},
  {day:250, text:'Somewhere past two hundred and fifty, and you\'re still the best decision I ever made. 💫'},
  {day:300, text:'Three hundred days of us. My love for you doesn\'t age; it just deepens. 🌿'},
  {day:365, text:'A whole year, my love. Thank you for a lifetime of tiny todays. Here\'s to a thousand more. 🎂💛 —Paul'},
];
function notesUnlocked(){ const d=(meta&&meta.totalDays)||0; return LOVE_NOTES.filter(n=>d>=n.day).length; }
function buildNotes(){
  const list=document.getElementById('noteList'); if(!list) return; list.innerHTML='';
  const d=(meta&&meta.totalDays)||0;
  document.getElementById('noteHead').firstElementChild.textContent=`💌 Notes from Paul ${notesUnlocked()}/${LOVE_NOTES.length}`;
  LOVE_NOTES.forEach(n=>{
    if (d>=n.day){ const c=document.createElement('div'); c.className='noteCard';
      c.innerHTML=`<div class="nd">Day ${n.day}</div>${n.text}`; list.appendChild(c); }
    else { const c=document.createElement('div'); c.className='noteLocked';
      c.innerHTML=`<span>🔒</span><span>Unlocks on day ${n.day} together</span>`; list.appendChild(c); }
  });
}
function openNotes(){ buildNotes(); document.getElementById('notePanel').classList.remove('hide'); }
function closeNotes(){ document.getElementById('notePanel').classList.add('hide'); }

/* ---- draw-together pad + saved gallery ---- */
const PAD_COLORS = ['#2a2a30','#e0402a','#e0902a','#f2c14a','#3a8a5a','#2a86c0','#8a4ac0','#e0709a','#8a5a34','#ffffff'];
let padColor = '#2a2a30', padCtx = null, padDrawing = false, padInited = false;
let gallery = (function(){ try{ const r=localStorage.getItem('bpet_gallery'); if(r) return JSON.parse(r); }catch(e){} return []; })();
function saveGallery(){ try{ localStorage.setItem('bpet_gallery', JSON.stringify(gallery)); }catch(e){} }
function padInit(){
  const cv=document.getElementById('padCanvas'); padCtx=cv.getContext('2d');
  padCtx.fillStyle='#fff'; padCtx.fillRect(0,0,cv.width,cv.height);
  padCtx.lineCap='round'; padCtx.lineJoin='round';
  const pos=(e)=>{ const r=cv.getBoundingClientRect(); return { x:(e.clientX-r.left)/r.width*cv.width, y:(e.clientY-r.top)/r.height*cv.height }; };
  cv.addEventListener('pointerdown',(e)=>{ padDrawing=true; const p=pos(e); padCtx.strokeStyle=padColor; padCtx.lineWidth=(padColor==='#ffffff')?16:3.5; padCtx.beginPath(); padCtx.moveTo(p.x,p.y); padCtx.lineTo(p.x+0.1,p.y+0.1); padCtx.stroke(); try{cv.setPointerCapture(e.pointerId);}catch(_){} });
  cv.addEventListener('pointermove',(e)=>{ if(!padDrawing) return; const p=pos(e); padCtx.lineTo(p.x,p.y); padCtx.stroke(); });
  cv.addEventListener('pointerup',()=>{ padDrawing=false; });
  cv.addEventListener('pointercancel',()=>{ padDrawing=false; });
  padInited=true;
}
function buildPadColors(){ const c=document.getElementById('padColors'); if(!c) return; c.innerHTML='';
  PAD_COLORS.forEach(col=>{ const s=document.createElement('div'); s.className='sw'+(col===padColor?' sel':''); s.style.background=col;
    if(col==='#ffffff'){ s.style.border='2px solid #bbb'; s.title='Eraser'; } s.addEventListener('click',()=>{ padColor=col; buildPadColors(); }); c.appendChild(s); });
}
function buildGallery(){ const g=document.getElementById('padGallery'); if(!g) return; g.innerHTML='';
  if(!gallery.length){ g.innerHTML='<span class="empty">No drawings yet — make one! 🎨</span>'; return; }
  gallery.forEach((data,i)=>{ const w=document.createElement('div'); w.className='gthumb';
    const img=document.createElement('img'); img.src=data; img.alt='drawing';
    const del=document.createElement('span'); del.className='gdel'; del.textContent='✕';
    del.addEventListener('click',()=>{ gallery.splice(i,1); saveGallery(); buildGallery(); });
    w.appendChild(img); w.appendChild(del); g.appendChild(w); });
}
function padSaveDrawing(){ const cv=document.getElementById('padCanvas'); let data; try{ data=cv.toDataURL('image/png'); }catch(e){ return; }
  gallery.unshift(data); if(gallery.length>6) gallery.length=6; saveGallery(); buildGallery();
  say('I made you a drawing! 🎨💛'); hearts(); state.fun=clamp(state.fun+10); state.love=clamp(state.love+6); refreshHUD(); if(typeof sfx==='function') sfx('draw');
}
function padClearCanvas(){ if(!padCtx) return; const cv=document.getElementById('padCanvas'); padCtx.fillStyle='#fff'; padCtx.fillRect(0,0,cv.width,cv.height); }
function openPad(){ if(!padInited) padInit(); buildPadColors(); buildGallery(); document.getElementById('padPanel').classList.remove('hide'); }
function closePad(){ document.getElementById('padPanel').classList.add('hide'); }

/* ---- "days together": distinct days visited + consecutive-day streak ---- */
function todayStr(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function daysBetween(a,b){ return Math.round((new Date(b+'T00:00') - new Date(a+'T00:00'))/86400000); }
let meta = (function(){ try{ const r=localStorage.getItem('bpet_meta'); if(r) return JSON.parse(r); }catch(e){} return null; })()
  || { firstDay:null, lastDay:null, totalDays:0, streak:0 };
function saveMeta(){ try{ localStorage.setItem('bpet_meta', JSON.stringify(meta)); }catch(e){} }
function updateDaysChip(){ const el=document.getElementById('daysChip'); if(el){ el.textContent='💛 '+meta.totalDays; el.title=`${meta.totalDays} day${meta.totalDays===1?'':'s'} together`+(meta.streak>1?` · ${meta.streak}-day streak`:''); } }
let greetedNewDay = false;   // set by initDaysTogether so welcomeBack won't double-greet
function initDaysTogether(){
  const t = todayStr();
  const firstEver = !meta.firstDay;
  if (firstEver) meta.firstDay = t;
  const isNewDay = meta.lastDay !== t;
  greetedNewDay = isNewDay;
  if (isNewDay){
    meta.streak = (meta.lastDay && daysBetween(meta.lastDay, t) === 1) ? (meta.streak||0)+1 : 1;
    meta.lastDay = t;
    meta.totalDays = (meta.totalDays||0) + 1;
    saveMeta();
    // gentle new-day greeting + a small "good morning" gift (skip the very first ever)
    if (!firstEver){
      setTimeout(()=>{
        say(meta.streak>1 ? `Day ${meta.totalDays} together! 💛 (${meta.streak}-day streak)` : `Day ${meta.totalDays} together! 💛`);
        hearts(); sfx('day');
        state.hunger=clamp(state.hunger+10); state.fun=clamp(state.fun+10); state.love=clamp(state.love+10); state.energy=clamp(state.energy+10);
        refreshHUD();
        if (LOVE_NOTES.some(n=> n.day === meta.totalDays)) showToast('💌','A new note from Paul','Tap 💛 to read it');
      }, 1400);
    } else {
      setTimeout(()=>{ say('Hi! 💛'); }, 1200);
    }
  }
  updateDaysChip();
}
// If you were away a while (same day — a new day is already greeted above), she lights up on your return.
function welcomeBack(){
  if (greetedNewDay) return;              // the day-greeting already welcomed her
  const last = state.lastSeen || 0;
  if (!last) return;
  const awayMin = (Date.now() - last) / 60000;
  if (awayMin < 25) return;               // only after a real gap, not a quick refresh
  const long = awayMin > 240;             // gone more than ~4 hours
  setTimeout(()=>{
    say(long ? pick(['You were gone so long… I missed you 🥺💛','There you are! I kept the light on 💛','I missed you more than cookies 🍪💛'])
             : pick(['Welcome back! I missed you 💛','You\'re back! 🥰','Hi again! I hoped you\'d visit 💛']));
    hearts(); if (pet) pet.blush = Math.max(pet.blush||0, 2.2);
    state.love = clamp(state.love + (long?9:6)); refreshHUD();
  }, 1500);
}
function markVisited(name){
  if (visited.has(name)) return;
  const before = visited.size;
  visited.add(name); saveVisited();
  // celebrate crossing a badge threshold (or collecting them all)
  const crossed = PASSPORT_BADGES.find(b=>before<b.n && visited.size>=b.n);
  if (crossed){ say(`${crossed.icon} ${crossed.name}! (${crossed.n} places)`); burst(crossed.icon); }
  else if (visited.size === SCENES.length){ say('🗺️ Every place, together! 💛'); hearts(); }
}
function sceneEnabled(n){ return !disabledScenes.has(n); }
// advance currentScene to the next/prev enabled scene, skipping hidden ones
function stepScene(dir){
  let i = currentScene;
  for (let k=0;k<SCENES.length;k++){ i=(i+dir+SCENES.length)%SCENES.length; if (sceneEnabled(SCENES[i])){ currentScene=i; return; } }
}
// list of currently-enabled scene indices
function enabledIndices(){ const out=[]; for (let i=0;i<SCENES.length;i++){ if (sceneEnabled(SCENES[i])) out.push(i); } return out; }
// jump to a random enabled scene, avoiding an immediate repeat when possible
function randomScene(){
  const en = enabledIndices();
  if (!en.length) return;
  if (en.length === 1) { currentScene = en[0]; return; }
  let pick; do { pick = en[Math.floor(Math.random()*en.length)]; } while (pick === currentScene);
  currentScene = pick;
}

/* Scene registry — to add a scene, write a draw function and call
   registerScene('name', drawFn[, selfPet]). It's appended to the rotation and
   rendered automatically. Scenes in SCENE_SELF_PET draw Krystal themselves
   (depth-sorted); every other scene gets drawPet() drawn on top for free. */
const SCENE_RENDERERS = {};
const SCENE_SELF_PET = new Set();
function registerScene(name, drawFn, selfPet){
  if (!SCENES.includes(name)) SCENES.push(name);
  SCENE_RENDERERS[name] = drawFn;
  if (selfPet) SCENE_SELF_PET.add(name);
}
// beach/backyard/river register in scenes/scenes-1.js (next to their draw functions)

// Debug: press 1/2/3 to switch scenes, c to toggle crying
document.addEventListener('keydown', e => {
  if (e.key === '1') { currentScene = 0; sceneChangeTimer = 60; }
  if (e.key === '2') { currentScene = 1; sceneChangeTimer = 60; }
  if (e.key === '3') { currentScene = 2; sceneChangeTimer = 60; }
  if (e.key === 'n' || e.key === 'N') { randomScene(); sceneChangeTimer = 60; }
  if (e.key === 'p' || e.key === 'P') { randomScene(); sceneChangeTimer = 60; }
  if (e.key === 'm' || e.key === 'M') { toggleMap(); }
  if (e.key === 'c' || e.key === 'C') {
    debugCry = !debugCry;
    say(debugCry ? '(debug: crying on)' : '(debug: crying off)');
  }
  if (e.key === 'b' || e.key === 'B') { if (!birthday) startBirthday(); }   // debug: birthday scene
  if (e.key === 'Escape' && birthday) endBirthday();
});

function updateScene(dt) {
  sceneChangeTimer -= dt;
  if (sceneChangeTimer <= 0) { randomScene(); sceneChangeTimer = 60; }
}

