const PEOPLE = ['krystal','luna','wade','paul','luke','william'];
const LABELS = {krystal:'Krystal',luna:'Luna',wade:'Wade',paul:'Paul',luke:'Luke',william:'William'};
const EXPRESSIONS = ['laugh','scared','surprised','cheer','sad','embarrassed','think','wave','talk','nod','shake','shrug','point','beckon','search','inspect','sit','give','hug','highfive','look','interact','startled','sleep'];
const TITLE = {walk:'Walk',clap:'Clap',laugh:'Laugh',scared:'Scared',surprised:'Surprised',cheer:'Cheer',sad:'Sad / sigh',embarrassed:'Embarrassed',think:'Think / idea',wave:'Wave',talk:'Talk / explain',nod:'Nod / agree',shake:'Shake head',shrug:'Shrug',point:'Point',beckon:'Beckon / follow',search:'Look / search',inspect:'Pick up / inspect',sit:'Sit / stand',give:'Give / receive',hug:'Hug',highfive:'High-five',look:'Look up / down',interact:'Knock / interact',startled:'Startled recovery',sleep:'Sleep / wake',eat:'Eat',draw:'Draw',cry:'Cry'};

function sheetsFor(person){
  const sheets = [
    {id:'walk',src:`sprites/walking-all/${person}-walk.png`,cols:4,rows:4,fps:8},
    {id:'clap',src:`sprites/clapping/${person}-clap-processed.png`,cols:4,rows:1,fps:6},
    ...EXPRESSIONS.map(id=>({id,src:`sprites/expressions/${person}/${id}.png`,cols:4,rows:1,fps:8})),
  ];
  if(person==='krystal') sheets.push(
    {id:'eat',src:'k-eating.png',cols:4,rows:1,fps:7},
    {id:'draw',src:'k-drawing.png',cols:4,rows:1,fps:6},
    {id:'cry',src:'k-crying.png',cols:4,rows:1,fps:5});
  return sheets;
}

const ui = Object.fromEntries(['person','animation','direction','directionWrap','mode','speed','speedOut','scale','scaleOut','baseline','playPause','restart','frame','frameOut','preview','stageTitle','sheetMeta','loadState','sheetGrid','libraryTitle'].map(id=>[id,document.getElementById(id)]));
const ctx=ui.preview.getContext('2d'); ctx.imageSmoothingEnabled=false;
let person='krystal', sheet, image=new Image(), frame=0, elapsed=0, playing=true, pingDirection=1, last=0;

for(const id of PEOPLE){const option=new Option(LABELS[id],id);ui.person.add(option)}
function rebuildAnimations(preferred){
  ui.animation.innerHTML='';
  for(const item of sheetsFor(person)) ui.animation.add(new Option(TITLE[item.id],item.id));
  ui.animation.value=sheetsFor(person).some(s=>s.id===preferred)?preferred:'laugh';
}
function selectSheet(id){
  sheet=sheetsFor(person).find(item=>item.id===id)||sheetsFor(person)[0];
  ui.animation.value=sheet.id; ui.directionWrap.hidden=sheet.rows===1;
  ui.speed.value=sheet.fps; ui.speedOut.value=sheet.fps;
  ui.frame.max=sheet.cols-1; restart();
  ui.stageTitle.textContent=`${LABELS[person]} · ${TITLE[sheet.id]}`;
  ui.sheetMeta.textContent=`${sheet.cols} frames × ${sheet.rows} row${sheet.rows>1?'s':''} · ${sheet.src}`;
  ui.loadState.textContent='Loading…';
  image=new Image(); image.onload=()=>ui.loadState.textContent=`${image.width} × ${image.height}px`; image.onerror=()=>ui.loadState.textContent='Missing asset'; image.src=sheet.src;
  renderLibrary();
}
function restart(){frame=0;elapsed=0;pingDirection=1;playing=true;ui.playPause.textContent='Pause';ui.frame.value=0;updateFrameOut()}
function updateFrameOut(){ui.frameOut.value=`${frame+1} / ${sheet?.cols||4}`}
function renderLibrary(){
  ui.libraryTitle.textContent=`${LABELS[person]} sheets`;ui.sheetGrid.innerHTML='';
  for(const item of sheetsFor(person)){
    const card=document.createElement('article');card.className='sheetCard'+(item.id===sheet?.id?' active':'');card.innerHTML=`<div class="sheetImage"><img src="${item.src}" alt="${TITLE[item.id]} sheet"></div><div class="sheetInfo"><span>${TITLE[item.id]}</span><span>${item.cols}×${item.rows} · ${item.fps} fps</span></div>`;card.addEventListener('click',()=>selectSheet(item.id));ui.sheetGrid.appendChild(card);
  }
}
function advance(){
  const mode=ui.mode.value;
  if(mode==='pingpong'){
    frame+=pingDirection;if(frame>=sheet.cols-1||frame<=0){frame=Math.max(0,Math.min(sheet.cols-1,frame));pingDirection*=-1}
  }else if(frame<sheet.cols-1) frame++; else if(mode==='loop') frame=0; else {playing=false;ui.playPause.textContent='Play'}
  ui.frame.value=frame;updateFrameOut();
}
function draw(){
  ctx.clearRect(0,0,320,320);if(!image.complete||!image.naturalWidth)return;
  const fw=image.width/sheet.cols,fh=image.height/sheet.rows,row=sheet.rows>1?Number(ui.direction.value):0;
  const scale=Number(ui.scale.value)/100, h=260*scale,w=h*(fw/fh),x=(320-w)/2,y=(320-h)/2;
  ctx.drawImage(image,frame*fw,row*fh,fw,fh,x,y,w,h);
  if(ui.baseline.checked){ctx.strokeStyle='#f2c14eaa';ctx.strokeRect(x+.5,y+.5,w-1,h-1);ctx.strokeStyle='#e07a8bcc';ctx.beginPath();ctx.moveTo(x,y+h*.922);ctx.lineTo(x+w,y+h*.922);ctx.stroke()}
}
function tick(now){
  const dt=Math.min(.1,(now-last)/1000||0);last=now;if(playing&&sheet){elapsed+=dt;const step=1/Number(ui.speed.value);while(elapsed>=step){elapsed-=step;advance()}}draw();requestAnimationFrame(tick)
}
ui.person.addEventListener('change',()=>{const previous=ui.animation.value;person=ui.person.value;rebuildAnimations(previous);selectSheet(ui.animation.value)});
ui.animation.addEventListener('change',()=>selectSheet(ui.animation.value));
ui.playPause.addEventListener('click',()=>{playing=!playing;ui.playPause.textContent=playing?'Pause':'Play'});ui.restart.addEventListener('click',restart);
ui.frame.addEventListener('input',()=>{frame=Number(ui.frame.value);playing=false;ui.playPause.textContent='Play';updateFrameOut()});
ui.speed.addEventListener('input',()=>ui.speedOut.value=ui.speed.value);ui.scale.addEventListener('input',()=>ui.scaleOut.value=(Number(ui.scale.value)/100).toFixed(2));
rebuildAnimations('laugh');selectSheet('laugh');requestAnimationFrame(tick);
