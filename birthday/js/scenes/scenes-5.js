/* scenes 5/5 (new scenes)  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */
/*
  New scenes go here. Pattern for each scene (matches scenes-1..4):
    function drawXxx(){ const t = sceneTime; ... paint W×H using ctx ... }
    registerScene('xxx', drawXxx);            // add selfPet=true only if the fn draws her itself
  Optionally add a nice label in js/map.js SCENE_LABELS (otherwise the name is title-cased).
  Keep strong variety (mix indoor/outdoor); indoor scenes need a clear theme.
*/

/* ── NIGHT MARKET (outdoor · night · food stalls) ── */
function drawNightMarket(){
  const t = sceneTime, groundY = H*0.66;

  // deep night sky
  const sky=ctx.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,'#160f28'); sky.addColorStop(0.6,'#2a1a3e'); sky.addColorStop(1,'#4a2a44');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // stars
  for (let i=0;i<50;i++){ const sx=(i*79+11)%W, sy=(i*37+5)%(groundY*0.55);
    ctx.fillStyle=`rgba(255,250,220,${0.25+0.35*Math.abs(Math.sin(t*1.5+i))})`; ctx.fillRect(sx,sy,1.2,1.2); }
  // silhouetted rooftops behind
  ctx.fillStyle='#20142e';
  let bx=0, s2=7; const rr=()=>{ s2=(s2*9301+49297)%233280; return s2/233280; };
  while (bx<W){ const bw=26+Math.floor(rr()*24), bh=26+Math.floor(rr()*40); ctx.fillRect(bx,groundY-bh,bw,bh); bx+=bw+3; }

  // strung lights across the top
  ctx.strokeStyle='rgba(120,90,60,.7)'; ctx.lineWidth=1;
  ctx.beginPath(); for (let x=0;x<=W;x+=8){ const y=14+Math.sin(x*0.04)*9; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  for (let x=12;x<W;x+=24){ const y=20+Math.sin(x*0.04)*9; const c=['#ff6b6b','#ffd166','#6bd5ff','#c98bff'][(x/24|0)%4];
    ctx.globalAlpha=0.8+0.2*Math.sin(t*3+x); ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,2.6,0,7); ctx.fill(); ctx.globalAlpha=1; }

  // ground — cobbled street
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#3a2f2a'); gr.addColorStop(1,'#241d19');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=1;
  for (let y=groundY+8;y<H;y+=9){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  for (let y=groundY+8;y<H;y+=9){ for (let x=((y/9|0)%2)*11; x<W; x+=22){ ctx.beginPath(); ctx.moveTo(x,y-9); ctx.lineTo(x,y); ctx.stroke(); } }
  // warm glow pools on the street from stalls
  for (const gx of [W*0.16,W*0.84]){ const g=ctx.createRadialGradient(gx,groundY+10,4,gx,groundY+10,70);
    g.addColorStop(0,'rgba(255,190,110,.35)'); g.addColorStop(1,'rgba(255,190,110,0)'); ctx.fillStyle=g; ctx.fillRect(gx-70,groundY,140,80); }

  // a food stall with striped awning
  function stall(cx, awn){
    const topY=groundY-92, w=104;
    // stall body / back
    ctx.fillStyle='#4a3626'; ctx.fillRect(cx-w/2,topY+20,w,groundY-topY-20);
    // counter
    ctx.fillStyle='#6a4a30'; roundRect(cx-w/2-4,groundY-30,w+8,12,2); ctx.fill();
    ctx.fillStyle='#3a2a1c'; ctx.fillRect(cx-w/2-2,groundY-18,w+4,18);
    // posts
    ctx.fillStyle='#2a1e14'; ctx.fillRect(cx-w/2,topY,5,groundY-topY); ctx.fillRect(cx+w/2-5,topY,5,groundY-topY);
    // striped awning
    for (let i=0;i<8;i++){ ctx.fillStyle= i%2 ? '#e8e2d4' : awn;
      ctx.beginPath(); ctx.moveTo(cx-w/2 + i*(w/8), topY); ctx.lineTo(cx-w/2 + (i+1)*(w/8), topY);
      ctx.lineTo(cx-w/2 + (i+1)*(w/8), topY+14); ctx.lineTo(cx-w/2 + (i+0.5)*(w/8), topY+20);
      ctx.lineTo(cx-w/2 + i*(w/8), topY+14); ctx.closePath(); ctx.fill(); }
    // warm interior light
    ctx.fillStyle='rgba(255,200,120,.25)'; ctx.fillRect(cx-w/2+5,topY+20,w-10,groundY-topY-38);
    // hanging paper lantern
    const lY=topY+30, lsw=Math.sin(t*1.5+cx)*3;
    ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx+lsw*0.5,topY+20); ctx.lineTo(cx+lsw,lY); ctx.stroke();
    ctx.fillStyle='rgba(255,120,90,.3)'; ctx.beginPath(); ctx.arc(cx+lsw,lY+7,16,0,7); ctx.fill();
    ctx.fillStyle=`rgba(230,90,70,${0.8+0.15*Math.sin(t*2)})`; roundRect(cx+lsw-9,lY,18,20,8); ctx.fill();
    // steaming pots on the counter
    ctx.fillStyle='#2a2a2e'; ctx.beginPath(); ctx.ellipse(cx-24,groundY-30,10,4,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+22,groundY-30,9,4,0,0,7); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=2;
    for (const sx of [cx-24,cx+22]){ ctx.beginPath(); for (let k=0;k<=7;k++){ const yy=groundY-34-k*4, xx=sx+Math.sin(t*3+k*0.7+sx)*3; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);} ctx.stroke(); }
  }
  stall(W*0.16,'#c0392b');
  stall(W*0.84,'#2a7a5a');
}
registerScene('nightmarket', drawNightMarket);

/* ── RAMEN SHOP (indoor · cozy counter) ── */
function drawRamenShop(){
  const t = sceneTime, counterY = H*0.68;

  // warm wooden wall
  const wall=ctx.createLinearGradient(0,0,0,counterY); wall.addColorStop(0,'#3a2418'); wall.addColorStop(1,'#563623');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,counterY);
  // horizontal plank seams
  ctx.strokeStyle='rgba(0,0,0,.22)'; ctx.lineWidth=1;
  for (let y=16;y<counterY;y+=22){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // noren curtain across the top
  const norH=52;
  for (let i=0;i<5;i++){ const cx0=i*(W/5); ctx.fillStyle= i%2? '#b03a3a':'#9a2f2f';
    ctx.fillRect(cx0+2,0,W/5-4,norH); }
  ctx.fillStyle='#6a1e1e'; ctx.fillRect(0,0,W,6);
  // a couple of kanji-like marks on curtain
  ctx.strokeStyle='rgba(255,240,220,.85)'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(W*0.28,16); ctx.lineTo(W*0.36,16); ctx.moveTo(W*0.32,12); ctx.lineTo(W*0.32,40); ctx.stroke();
  ctx.beginPath(); ctx.arc(W*0.66,26,9,0.2,6); ctx.stroke();

  // hanging lantern (right)
  const lX=W*0.86, lY=norH+14;
  ctx.strokeStyle='#2a1a10'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lX,norH); ctx.lineTo(lX,lY); ctx.stroke();
  ctx.fillStyle='rgba(255,170,90,.25)'; ctx.beginPath(); ctx.arc(lX,lY+16,24,0,7); ctx.fill();
  ctx.fillStyle=`rgba(240,150,80,${0.82+0.12*Math.sin(t*2)})`; roundRect(lX-13,lY,26,34,11); ctx.fill();
  ctx.strokeStyle='#a04020'; for (let i=1;i<4;i++){ ctx.beginPath(); ctx.moveTo(lX-13,lY+i*8); ctx.lineTo(lX+13,lY+i*8); ctx.stroke(); }

  // menu strips on the wall (left)
  for (let i=0;i<4;i++){ const mx=W*0.10+i*22, my=norH+16;
    ctx.fillStyle='#efe6d0'; ctx.fillRect(mx,my,14,72);
    ctx.strokeStyle='rgba(120,40,40,.7)'; ctx.lineWidth=1;
    for (let k=0;k<4;k++){ ctx.beginPath(); ctx.moveTo(mx+3,my+10+k*15); ctx.lineTo(mx+11,my+14+k*15); ctx.stroke(); } }

  // counter surface
  const cnt=ctx.createLinearGradient(0,counterY,0,H); cnt.addColorStop(0,'#8a6038'); cnt.addColorStop(1,'#6a482a');
  ctx.fillStyle=cnt; ctx.fillRect(0,counterY,W,H-counterY);
  ctx.fillStyle='rgba(255,240,210,.15)'; ctx.fillRect(0,counterY,W,4);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=30){ ctx.beginPath(); ctx.moveTo(x,counterY); ctx.lineTo(x-8,H); ctx.stroke(); }

  // a steaming ramen bowl (left of center so pet space stays clear-ish)
  function bowl(bx,by,scale){
    ctx.save(); ctx.translate(bx,by); ctx.scale(scale,scale);
    // bowl
    ctx.fillStyle='#c0392b'; ctx.beginPath(); ctx.moveTo(-26,0); ctx.quadraticCurveTo(0,26,26,0); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#e8e2d4'; ctx.beginPath(); ctx.ellipse(0,0,26,8,0,0,7); ctx.fill();
    // broth
    ctx.fillStyle='#d9a441'; ctx.beginPath(); ctx.ellipse(0,0,22,6,0,0,7); ctx.fill();
    // toppings
    ctx.fillStyle='#f3e6c8'; ctx.beginPath(); ctx.ellipse(-8,-1,6,4,0,0,7); ctx.fill(); // narutomaki-ish
    ctx.fillStyle='#f76b5c'; ctx.beginPath(); ctx.arc(-8,-1,2,0,7); ctx.fill();
    ctx.fillStyle='#8a5a2a'; ctx.beginPath(); ctx.ellipse(8,-2,6,4,0,0,7); ctx.fill(); // chashu
    ctx.fillStyle='#2f6a2f'; ctx.fillRect(-2,-4,10,3); // nori/scallion
    // chopsticks
    ctx.strokeStyle='#6a4326'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(14,-6); ctx.lineTo(30,-16); ctx.moveTo(16,-3); ctx.lineTo(32,-12); ctx.stroke();
    ctx.restore();
    // steam
    ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=2; ctx.beginPath();
    for (let k=0;k<=9;k++){ const yy=by-8*scale-k*5, xx=bx+Math.sin(t*3+k*0.6)*4; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);} ctx.stroke();
  }
  bowl(W*0.24,counterY+18,1.0);
  bowl(W*0.80,counterY+22,0.8);
}
registerScene('ramenshop', drawRamenShop);

/* ── MOONLIT JETTY (outdoor · night · lake dock) ── */
function drawMoonlitJetty(){
  const t = sceneTime, waterY = H*0.42, dockY = H*0.70;

  // night sky
  const sky=ctx.createLinearGradient(0,0,0,waterY);
  sky.addColorStop(0,'#0e1430'); sky.addColorStop(0.6,'#1e2a52'); sky.addColorStop(1,'#33456e');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  // stars
  for (let i=0;i<45;i++){ const sx=(i*71+9)%W, sy=(i*29+4)%(waterY*0.8);
    ctx.fillStyle=`rgba(230,240,255,${0.3+0.4*Math.abs(Math.sin(t*1.4+i))})`; ctx.fillRect(sx,sy,1.2,1.2); }
  // big moon
  const mX=W*0.72, mY=H*0.15;
  ctx.fillStyle='rgba(240,244,220,.18)'; ctx.beginPath(); ctx.arc(mX,mY,42,0,7); ctx.fill();
  ctx.fillStyle='#f2f0d8'; ctx.beginPath(); ctx.arc(mX,mY,26,0,7); ctx.fill();
  ctx.fillStyle='rgba(210,214,190,.5)'; ctx.beginPath(); ctx.arc(mX-8,mY-6,4,0,7); ctx.arc(mX+7,mY+4,5,0,7); ctx.arc(mX+2,mY-9,3,0,7); ctx.fill();

  // distant hills
  ctx.fillStyle='#18203c';
  ctx.beginPath(); ctx.moveTo(0,waterY); for (let x=0;x<=W;x+=20){ ctx.lineTo(x, waterY-18-14*Math.sin(x*0.02+1)); } ctx.lineTo(W,waterY); ctx.fill();

  // lake water
  const wat=ctx.createLinearGradient(0,waterY,0,H); wat.addColorStop(0,'#1c2a4e'); wat.addColorStop(1,'#0e1730');
  ctx.fillStyle=wat; ctx.fillRect(0,waterY,W,H-waterY);
  // moon reflection — shimmering column
  for (let y=waterY; y<dockY; y+=3){ const p=(y-waterY)/(dockY-waterY);
    const wob=Math.sin(y*0.4+t*2)*(4+p*10); const w=10+p*22;
    ctx.fillStyle=`rgba(240,242,215,${0.28*(1-p)})`; ctx.fillRect(mX-w/2+wob, y, w, 2); }
  // gentle horizontal ripples
  ctx.strokeStyle='rgba(150,180,220,.15)'; ctx.lineWidth=1;
  for (let y=waterY+8;y<dockY;y+=10){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.06+t*1.5+y)*1.5; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }

  // wooden jetty deck extending toward viewer (foreground)
  const deck=ctx.createLinearGradient(0,dockY,0,H); deck.addColorStop(0,'#5a4028'); deck.addColorStop(1,'#3a2818');
  ctx.fillStyle=deck; ctx.fillRect(0,dockY,W,H-dockY);
  // planks running toward viewer (perspective)
  ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=1;
  for (let i=-3;i<=8;i++){ const x0=W*0.5 + i*26; const x1=W*0.5 + i*70;
    ctx.beginPath(); ctx.moveTo(x0,dockY); ctx.lineTo(x1,H); ctx.stroke(); }
  ctx.strokeStyle='rgba(255,230,190,.08)'; for (let y=dockY+6;y<H;y+=10){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // dock edge highlight
  ctx.fillStyle='rgba(255,235,200,.12)'; ctx.fillRect(0,dockY,W,3);

  // lantern post at left edge of dock
  const px=W*0.10, py=dockY;
  ctx.fillStyle='#241810'; ctx.fillRect(px-3,py-70,6,70);
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(px-8,py-84,16,16);
  ctx.fillStyle='rgba(255,190,110,.3)'; ctx.beginPath(); ctx.arc(px,py-76,20,0,7); ctx.fill();
  ctx.fillStyle=`rgba(255,200,120,${0.85+0.12*Math.sin(t*2.5)})`; roundRect(px-5,py-82,10,12,2); ctx.fill();

  // a small moored rowboat bobbing at the dock's right
  const boX=W*0.86, boY=dockY-6+Math.sin(t*1.2)*2;
  ctx.fillStyle='#6a4a2e'; ctx.beginPath(); ctx.moveTo(boX-22,boY); ctx.quadraticCurveTo(boX,boY+14,boX+22,boY); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#4a3320'; ctx.fillRect(boX-20,boY-3,40,3);
}
registerScene('moonlitjetty', drawMoonlitJetty);

/* ── ORCHID CONSERVATORY (indoor · botanical glass room) ── */
function drawOrchidRoom(){
  const t = sceneTime, floorY = H*0.70;

  // misty glass-house back wall
  const back=ctx.createLinearGradient(0,0,0,floorY);
  back.addColorStop(0,'#cfe7d8'); back.addColorStop(0.5,'#b6dcc8'); back.addColorStop(1,'#a2cbb4');
  ctx.fillStyle=back; ctx.fillRect(0,0,W,floorY);
  // glass pane grid + roof rafters
  ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.lineWidth=1.5;
  for (let x=0;x<=W;x+=W/6){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,floorY); ctx.stroke(); }
  for (let y=24;y<floorY;y+=42){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // arched roof struts (top)
  ctx.strokeStyle='rgba(120,150,130,.5)'; ctx.lineWidth=2;
  for (let x=0;x<=W;x+=W/6){ ctx.beginPath(); ctx.moveTo(W/2,-8); ctx.lineTo(x,26); ctx.stroke(); }
  // soft sunbeams
  ctx.fillStyle='rgba(255,250,210,.10)';
  for (let i=0;i<3;i++){ ctx.save(); ctx.translate(W*0.3+i*40,0); ctx.rotate(0.2); ctx.fillRect(0,0,26,floorY); ctx.restore(); }
  // drifting pollen/mist motes
  for (let i=0;i<18;i++){ const mx=(i*61+t*8)%W, my=(i*53+ Math.sin(t*0.6+i)*14)% floorY;
    ctx.fillStyle=`rgba(255,255,255,${0.15+0.15*Math.sin(t+i)})`; ctx.beginPath(); ctx.arc(mx,my,1.4,0,7); ctx.fill(); }

  // hanging orchid baskets from the roof
  function hangOrchid(hx, len, col){
    ctx.strokeStyle='#5a4a30'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(hx,0); ctx.lineTo(hx,len); ctx.stroke();
    // basket
    ctx.fillStyle='#6a4a2a'; roundRect(hx-12,len,24,10,2); ctx.fill();
    ctx.fillStyle='#3a6a3a'; ctx.beginPath(); ctx.ellipse(hx,len,12,4,0,0,7); ctx.fill();
    // trailing leaves
    ctx.strokeStyle='#3a7a4a'; ctx.lineWidth=2;
    for (const dx of [-8,0,8]){ ctx.beginPath(); ctx.moveTo(hx+dx,len+8); ctx.quadraticCurveTo(hx+dx+Math.sin(t+dx)*4, len+26, hx+dx*1.3, len+40); ctx.stroke(); }
    // orchid blooms
    for (let k=0;k<3;k++){ const bx=hx-8+k*8, by=len+16+k*10 + Math.sin(t*1.5+k+hx)*1.5; orchidBloom(bx,by,col,0.7); }
  }
  function orchidBloom(bx,by,col,sc){
    ctx.save(); ctx.translate(bx,by); ctx.scale(sc,sc);
    ctx.fillStyle=col;
    for (let a=0;a<5;a++){ ctx.beginPath(); const ang=a/5*Math.PI*2; ctx.ellipse(Math.cos(ang)*5,Math.sin(ang)*5,4,3,ang,0,7); ctx.fill(); }
    ctx.fillStyle='#fff2c0'; ctx.beginPath(); ctx.arc(0,0,2.4,0,7); ctx.fill();
    ctx.fillStyle='#c94aa0'; ctx.beginPath(); ctx.arc(0,0,1.1,0,7); ctx.fill();
    ctx.restore();
  }
  hangOrchid(W*0.20,40,'#e58bc4');
  hangOrchid(W*0.80,30,'#f3c1e0');
  hangOrchid(W*0.52,52,'#d8a0e8');

  // tiled floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#c8b89a'); fl.addColorStop(1,'#a89878');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(90,70,50,.35)'; ctx.lineWidth=1;
  for (let i=-4;i<=8;i++){ const x0=W*0.5+i*30; ctx.beginPath(); ctx.moveTo(x0,floorY); ctx.lineTo(W*0.5+i*70,H); ctx.stroke(); }
  for (let y=floorY+10;y<H;y+=14){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // potted orchids on plant stands (sides, leaving center clear for pet)
  function pottedOrchid(cx, col){
    const py=floorY+6;
    // stand
    ctx.fillStyle='#5a4a34'; ctx.fillRect(cx-16,py,32,8);
    ctx.fillRect(cx-13,py+8,4,26); ctx.fillRect(cx+9,py+8,4,26);
    // pot
    ctx.fillStyle='#b56a44'; ctx.beginPath(); ctx.moveTo(cx-14,py-2); ctx.lineTo(cx+14,py-2); ctx.lineTo(cx+10,py-18); ctx.lineTo(cx-10,py-18); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#8a4a2e'; ctx.fillRect(cx-15,py-22,30,5);
    // leaves
    ctx.fillStyle='#3a7a44'; for (const dx of [-6,6]){ ctx.beginPath(); ctx.ellipse(cx+dx,py-24,6,4,dx>0?0.4:-0.4,0,7); ctx.fill(); }
    // arching stem with blooms
    ctx.strokeStyle='#4a8a52'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,py-24); ctx.quadraticCurveTo(cx+12,py-48,cx-4,py-64); ctx.stroke();
    orchidBloom(cx+9,py-42,col,1); orchidBloom(cx+4,py-54,col,0.9); orchidBloom(cx-4,py-64,col,0.8);
  }
  pottedOrchid(W*0.14,'#e26fb0');
  pottedOrchid(W*0.88,'#c98be8');
}
registerScene('orchidroom', drawOrchidRoom);

/* ── JAZZ CLUB (indoor · smoky lounge · live music) ── */
function drawJazzClub(){
  const t = sceneTime, stageY = H*0.64;

  // deep plum wall
  const wall=ctx.createLinearGradient(0,0,0,stageY); wall.addColorStop(0,'#1a0e1e'); wall.addColorStop(1,'#33122e');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,stageY);
  // warm spotlight wash behind the stage
  const spot=ctx.createRadialGradient(W*0.5,stageY-10,10,W*0.5,stageY-10,150);
  spot.addColorStop(0,'rgba(255,180,90,.28)'); spot.addColorStop(1,'rgba(255,180,90,0)');
  ctx.fillStyle=spot; ctx.fillRect(0,0,W,stageY);
  // drifting smoke haze
  for (let i=0;i<5;i++){ const hx=(i*90+t*10)%(W+80)-40, hy=H*0.14+i*18+Math.sin(t*0.5+i)*8;
    ctx.fillStyle=`rgba(200,180,200,${0.05+0.03*Math.sin(t+i)})`; ctx.beginPath(); ctx.ellipse(hx,hy,44,16,0,0,7); ctx.fill(); }

  // brick pattern hint
  ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1;
  for (let y=20;y<stageY;y+=16){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    for (let x=((y/16|0)%2)*16; x<W; x+=32){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+16); ctx.stroke(); } }

  // hanging pendant lamps
  for (const lx of [W*0.24,W*0.76]){ ctx.strokeStyle='#0a0510'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx,0); ctx.lineTo(lx,H*0.12); ctx.stroke();
    ctx.fillStyle='rgba(255,190,110,.25)'; ctx.beginPath(); ctx.arc(lx,H*0.15,18,0,7); ctx.fill();
    ctx.fillStyle='#2a1a1a'; ctx.beginPath(); ctx.moveTo(lx-10,H*0.12); ctx.lineTo(lx+10,H*0.12); ctx.lineTo(lx+6,H*0.15); ctx.lineTo(lx-6,H*0.15); ctx.closePath(); ctx.fill();
    ctx.fillStyle=`rgba(255,210,130,${0.8+0.15*Math.sin(t*2+lx)})`; ctx.beginPath(); ctx.arc(lx,H*0.155,4,0,7); ctx.fill(); }

  // grand piano (left of stage)
  const pX=W*0.30, pY=stageY-4;
  ctx.fillStyle='#0d0d10'; ctx.beginPath(); ctx.ellipse(pX,pY-6,44,20,0,0,7); ctx.fill();
  ctx.fillStyle='#1a1a20'; ctx.fillRect(pX-40,pY-6,80,10);
  // open lid
  ctx.fillStyle='#141418'; ctx.beginPath(); ctx.moveTo(pX-40,pY-6); ctx.lineTo(pX-10,pY-40); ctx.lineTo(pX+30,pY-30); ctx.lineTo(pX+40,pY-6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#3a3a44'; ctx.lineWidth=1; ctx.stroke();
  // keys
  ctx.fillStyle='#efe8dc'; ctx.fillRect(pX-30,pY+2,60,5);
  ctx.fillStyle='#111'; for (let k=0;k<12;k++){ ctx.fillRect(pX-28+k*5,pY+2,2,3); }
  // legs
  ctx.fillStyle='#1a1a20'; ctx.fillRect(pX-34,pY+4,4,14); ctx.fillRect(pX+30,pY+4,4,14);

  // upright bass (right)
  const bX=W*0.72, bY=stageY-2;
  ctx.strokeStyle='#4a2e18'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(bX,bY-60); ctx.lineTo(bX,bY-6); ctx.stroke();
  ctx.fillStyle='#7a4a26'; ctx.beginPath(); ctx.ellipse(bX,bY-14,13,22,0,0,7); ctx.fill();
  ctx.fillStyle='#5a3418'; ctx.beginPath(); ctx.ellipse(bX,bY-14,7,14,0,0,7); ctx.fill();
  ctx.fillStyle='#2a1a10'; ctx.beginPath(); ctx.arc(bX,bY-60,4,0,7); ctx.fill();
  ctx.strokeStyle='rgba(240,230,200,.6)'; ctx.lineWidth=0.6; for (let s=-3;s<=3;s+=2){ ctx.beginPath(); ctx.moveTo(bX+s,bY-56); ctx.lineTo(bX+s,bY-8); ctx.stroke(); }

  // floating music notes rising from the stage
  ctx.fillStyle='rgba(255,220,150,.8)';
  for (let i=0;i<6;i++){ const nx=W*0.5+Math.sin(t*0.7+i*1.3)*70; const ny=stageY-20-((t*22+i*40)%160);
    ctx.beginPath(); ctx.ellipse(nx,ny,3,2.2,-0.4,0,7); ctx.fill(); ctx.fillRect(nx+2,ny-10,1.4,10); }

  // wooden stage floor
  const fl=ctx.createLinearGradient(0,stageY,0,H); fl.addColorStop(0,'#4a2e1c'); fl.addColorStop(1,'#301c10');
  ctx.fillStyle=fl; ctx.fillRect(0,stageY,W,H-stageY);
  ctx.fillStyle='rgba(255,190,110,.10)'; ctx.beginPath(); ctx.ellipse(W*0.5,stageY+40,120,26,0,0,7); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; for (let x=0;x<W;x+=26){ ctx.beginPath(); ctx.moveTo(x,stageY); ctx.lineTo(x-6,H); ctx.stroke(); }
}
registerScene('jazzclub', drawJazzClub);

/* ── FERRIS WHEEL AT NIGHT (outdoor · fairground) ── */
function drawFerrisWheel(){
  const t = sceneTime, groundY = H*0.74;

  // dusk-to-night sky
  const sky=ctx.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,'#241a44'); sky.addColorStop(0.5,'#4a2a54'); sky.addColorStop(1,'#8a4a5a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // early stars
  for (let i=0;i<30;i++){ const sx=(i*83+7)%W, sy=(i*31+3)%(groundY*0.5);
    ctx.fillStyle=`rgba(255,250,230,${0.2+0.3*Math.abs(Math.sin(t*1.2+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }

  // the wheel
  const cx=W*0.5, cy=H*0.34, R=W*0.36, spokes=12, rot=t*0.25;
  // support legs
  ctx.strokeStyle='#2a2030'; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx-40,groundY); ctx.moveTo(cx,cy); ctx.lineTo(cx+40,groundY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx-24,groundY); ctx.moveTo(cx,cy); ctx.lineTo(cx+24,groundY); ctx.stroke();
  // rim glow
  ctx.strokeStyle='rgba(255,210,120,.25)'; ctx.lineWidth=8; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.stroke();
  ctx.strokeStyle='#e8d0a0'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx,cy,R*0.5,0,7); ctx.stroke();
  // spokes + cabins
  const cols=['#e05a5a','#5ab0e0','#e0b040','#60c060','#c060c0'];
  for (let i=0;i<spokes;i++){ const a=rot + i/spokes*Math.PI*2; const rx=cx+Math.cos(a)*R, ry=cy+Math.sin(a)*R;
    ctx.strokeStyle='#c9b088'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(rx,ry); ctx.stroke();
    // cabin hangs below the rim point
    const col=cols[i%cols.length];
    ctx.fillStyle=col; roundRect(rx-7,ry+2,14,11,3); ctx.fill();
    ctx.fillStyle='#fff2c0'; ctx.fillRect(rx-4,ry+4,8,4);
    // twinkling bulb at each rim node
    ctx.fillStyle=`rgba(255,240,180,${0.6+0.4*Math.sin(t*4+i)})`; ctx.beginPath(); ctx.arc(rx,ry,2,0,7); ctx.fill(); }
  // hub
  ctx.fillStyle='#3a2e40'; ctx.beginPath(); ctx.arc(cx,cy,7,0,7); ctx.fill();
  ctx.fillStyle='#ffe08a'; ctx.beginPath(); ctx.arc(cx,cy,3,0,7); ctx.fill();

  // fairground ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#3a5a3a'); gr.addColorStop(1,'#24401f');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  // glowing ground reflection of the wheel
  ctx.fillStyle='rgba(255,210,120,.06)'; ctx.beginPath(); ctx.ellipse(cx,groundY+18,90,14,0,0,7); ctx.fill();
  // little striped booth on the side
  const boX=W*0.14, boY=groundY;
  ctx.fillStyle='#efe6d0'; ctx.fillRect(boX-20,boY-24,40,24);
  for (let i=0;i<5;i++){ ctx.fillStyle= i%2?'#c0392b':'#efe6d0'; ctx.beginPath(); ctx.moveTo(boX-20+i*8,boY-24); ctx.lineTo(boX-16+i*8,boY-30); ctx.lineTo(boX-12+i*8,boY-24); ctx.fill(); }
  ctx.fillStyle='#6a4a2e'; ctx.fillRect(boX-20,boY-6,40,6);
  // string lights along the ground line
  ctx.strokeStyle='rgba(120,90,60,.6)'; ctx.lineWidth=1; ctx.beginPath();
  for (let x=0;x<=W;x+=10){ const y=groundY-6+Math.sin(x*0.05)*4; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  for (let x=8;x<W;x+=20){ const y=groundY-6+Math.sin(x*0.05)*4; ctx.fillStyle=`rgba(255,220,140,${0.7+0.3*Math.sin(t*3+x)})`; ctx.beginPath(); ctx.arc(x,y,2,0,7); ctx.fill(); }
}
registerScene('ferriswheel', drawFerrisWheel);

/* ── GLOWING MUSHROOM GLADE (outdoor · magical forest at night) ── */
function drawMushroomGlade(){
  const t = sceneTime, groundY = H*0.66;

  // dark enchanted sky through the canopy
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#0c1a1e'); sky.addColorStop(1,'#123028');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // moon shafts of teal light
  ctx.fillStyle='rgba(120,220,190,.06)';
  for (let i=0;i<3;i++){ ctx.save(); ctx.translate(W*0.2+i*70,0); ctx.rotate(0.15); ctx.fillRect(0,0,30,groundY); ctx.restore(); }

  // background tree silhouettes
  ctx.fillStyle='#0a1c16';
  for (let i=0;i<5;i++){ const tx=i*80+20; ctx.fillRect(tx-6,groundY-120,12,120);
    ctx.beginPath(); ctx.arc(tx,groundY-120,26,0,7); ctx.fill(); }

  // floating spores / fireflies drifting up
  for (let i=0;i<26;i++){ const fx=(i*53+ Math.sin(t*0.4+i)*20)%W; const fy=(groundY - ((t*12+i*30)%(groundY)));
    ctx.fillStyle=`rgba(150,255,210,${0.25+0.4*Math.abs(Math.sin(t*2+i))})`; ctx.beginPath(); ctx.arc(fx,fy,1.6,0,7); ctx.fill(); }

  // mossy ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#1e3a24'); gr.addColorStop(1,'#122414');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  // glow patches on the ground
  for (const gx of [W*0.2,W*0.5,W*0.8]){ const g=ctx.createRadialGradient(gx,groundY+14,4,gx,groundY+14,54);
    g.addColorStop(0,'rgba(90,220,180,.22)'); g.addColorStop(1,'rgba(90,220,180,0)'); ctx.fillStyle=g; ctx.fillRect(gx-54,groundY,108,70); }

  // glowing mushrooms of varying size (kept toward the sides)
  function mushroom(mx,my,sc,cap){
    ctx.save(); ctx.translate(mx,my); ctx.scale(sc,sc);
    const glow=0.6+0.3*Math.sin(t*1.5+mx);
    // under-cap glow
    ctx.fillStyle=`rgba(150,255,210,${0.25*glow})`; ctx.beginPath(); ctx.arc(0,-2,20,0,7); ctx.fill();
    // stem
    ctx.fillStyle='#dfe8d8'; ctx.beginPath(); ctx.moveTo(-4,0); ctx.lineTo(-6,-16); ctx.lineTo(6,-16); ctx.lineTo(4,0); ctx.closePath(); ctx.fill();
    // cap
    ctx.fillStyle=cap; ctx.beginPath(); ctx.ellipse(0,-16,15,10,0,Math.PI,0); ctx.fill();
    ctx.fillStyle='#eaffef'; for (let k=0;k<4;k++){ const dx=-9+k*6; ctx.beginPath(); ctx.arc(dx,-18-Math.abs(dx)*0.15,2,0,7); ctx.fill(); }
    // rim light
    ctx.strokeStyle=`rgba(180,255,230,${glow})`; ctx.lineWidth=1.4; ctx.beginPath(); ctx.ellipse(0,-16,15,10,0,Math.PI,0); ctx.stroke();
    ctx.restore();
  }
  mushroom(W*0.12,groundY+30,1.5,'#7a4ac0');
  mushroom(W*0.24,groundY+16,0.9,'#c04a90');
  mushroom(W*0.86,groundY+32,1.6,'#4a7ac0');
  mushroom(W*0.74,groundY+14,0.85,'#c07a3a');
  mushroom(W*0.5,groundY+8,0.6,'#5ac09a');

  // a couple of glowing pebbles
  ctx.fillStyle='rgba(140,240,200,.5)';
  for (const px of [W*0.4,W*0.62]){ ctx.beginPath(); ctx.arc(px,groundY+34,3,0,7); ctx.fill(); }
}
registerScene('mushroomglade', drawMushroomGlade);

/* ── HAMMAM (indoor · tiled steam bathhouse) ── */
function drawHammam(){
  const t = sceneTime, floorY = H*0.70;

  // warm tiled wall
  ctx.fillStyle='#d9c9a8'; ctx.fillRect(0,0,W,floorY);
  // domed ceiling with star cut-outs (top band)
  const domeH=H*0.20;
  const dome=ctx.createLinearGradient(0,0,0,domeH); dome.addColorStop(0,'#3a5a6a'); dome.addColorStop(1,'#6a8a94');
  ctx.fillStyle=dome; ctx.beginPath(); ctx.moveTo(0,domeH); ctx.quadraticCurveTo(W*0.5,-domeH*0.6,W,domeH); ctx.closePath(); ctx.fill();
  // star-shaped light holes glowing
  for (let i=0;i<9;i++){ const sx=W*0.12+i*W*0.095, sy=domeH*0.4+Math.sin(i*1.3)*10;
    ctx.fillStyle=`rgba(255,240,190,${0.6+0.3*Math.sin(t*2+i)})`;
    ctx.save(); ctx.translate(sx,sy); for (let k=0;k<8;k++){ ctx.rotate(Math.PI/4); ctx.fillRect(-1,0,2,4); } ctx.beginPath(); ctx.arc(0,0,2.4,0,7); ctx.fill(); ctx.restore(); }

  // ornate tile pattern on the wall
  ctx.strokeStyle='rgba(90,120,130,.4)'; ctx.lineWidth=1;
  for (let y=domeH;y<floorY;y+=26){ for (let x=0;x<W;x+=26){
    ctx.strokeRect(x,y,26,26);
    ctx.fillStyle= ((x/26+y/26)|0)%2 ? 'rgba(70,130,140,.18)':'rgba(200,120,80,.14)';
    ctx.beginPath(); ctx.moveTo(x+13,y+3); ctx.lineTo(x+23,y+13); ctx.lineTo(x+13,y+23); ctx.lineTo(x+3,y+13); ctx.closePath(); ctx.fill(); } }

  // arched niche/doorway (center back)
  const aX=W*0.5, aY=domeH+8, aW=54, aH=floorY-aY-6;
  ctx.fillStyle='#b89878'; ctx.beginPath(); ctx.moveTo(aX-aW/2,floorY-6); ctx.lineTo(aX-aW/2,aY+aW/2); ctx.arc(aX,aY+aW/2,aW/2,Math.PI,0); ctx.lineTo(aX+aW/2,floorY-6); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(60,50,40,.5)'; ctx.beginPath(); ctx.moveTo(aX-aW/2+6,floorY-6); ctx.lineTo(aX-aW/2+6,aY+aW/2); ctx.arc(aX,aY+aW/2,aW/2-6,Math.PI,0); ctx.lineTo(aX+aW/2-6,floorY-6); ctx.closePath(); ctx.fill();

  // rising steam veils
  for (let i=0;i<6;i++){ const hx=(i*70+t*8)%(W+60)-30, hy=floorY-30-((t*10+i*30)%160);
    ctx.fillStyle=`rgba(255,255,255,${0.06+0.04*Math.sin(t+i)})`; ctx.beginPath(); ctx.ellipse(hx,hy,40,14,0,0,7); ctx.fill(); }

  // marble floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#cdbfa8'); fl.addColorStop(1,'#b0a088');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  // radiating floor tiles
  ctx.strokeStyle='rgba(120,100,80,.3)'; ctx.lineWidth=1;
  for (let i=-4;i<=8;i++){ ctx.beginPath(); ctx.moveTo(W*0.5+i*24,floorY); ctx.lineTo(W*0.5+i*60,H); ctx.stroke(); }
  for (let y=floorY+10;y<H;y+=14){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // central octagonal göbektaşı (heated stone slab)
  const gx=W*0.5, gy=floorY+40;
  ctx.fillStyle='#c8b088'; ctx.beginPath();
  for (let k=0;k<8;k++){ const a=k/8*Math.PI*2+Math.PI/8; const px=gx+Math.cos(a)*44, py=gy+Math.sin(a)*14; k===0?ctx.moveTo(px,py):ctx.lineTo(px,py);} ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(150,120,90,.6)'; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle='rgba(180,150,110,.5)'; ctx.beginPath();
  for (let k=0;k<8;k++){ const a=k/8*Math.PI*2+Math.PI/8; const px=gx+Math.cos(a)*22, py=gy+Math.sin(a)*7; k===0?ctx.moveTo(px,py):ctx.lineTo(px,py);} ctx.closePath(); ctx.fill();

  // brass hammam bowls on the sides
  function bowl(bx,by){ ctx.fillStyle='#c9a24a'; ctx.beginPath(); ctx.ellipse(bx,by,12,6,0,0,Math.PI); ctx.fill();
    ctx.fillStyle='#e8c96a'; ctx.beginPath(); ctx.ellipse(bx,by-1,12,3,0,0,7); ctx.fill();
    ctx.fillStyle='#a8842e'; ctx.beginPath(); ctx.arc(bx,by-1,3,0,7); ctx.fill(); }
  bowl(W*0.14,floorY+20); bowl(W*0.88,floorY+24);
}
registerScene('hammam', drawHammam);
