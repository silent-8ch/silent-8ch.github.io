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

/* ── FARMERS MARKET (outdoor · sunny morning) ── */
function drawFarmersMarket(){
  const t = sceneTime, groundY = H*0.68;

  // bright morning sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#8fc9ee'); sky.addColorStop(1,'#dcefdc');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='#fff4b0'; ctx.beginPath(); ctx.arc(W*0.14,H*0.12,20,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,244,176,.3)'; ctx.beginPath(); ctx.arc(W*0.14,H*0.12,32,0,7); ctx.fill();
  drawCloud(W*0.55+Math.sin(t*0.1)*8,H*0.10,0.7); drawCloud(W*0.82+Math.sin(t*0.12+2)*6,H*0.16,0.5);

  // rolling green hills behind
  ctx.fillStyle='#6aa84a'; ctx.beginPath(); ctx.moveTo(0,groundY); for(let x=0;x<=W;x+=20){ ctx.lineTo(x,groundY-26-16*Math.sin(x*0.018+1)); } ctx.lineTo(W,groundY); ctx.fill();
  ctx.fillStyle='#5a9a3e'; ctx.beginPath(); ctx.moveTo(0,groundY); for(let x=0;x<=W;x+=20){ ctx.lineTo(x,groundY-10-10*Math.sin(x*0.03+3)); } ctx.lineTo(W,groundY); ctx.fill();

  // cobble/dirt path ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#b89a6a'); gr.addColorStop(1,'#94764a');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='rgba(120,95,60,.25)'; for (let i=0;i<40;i++){ const px=(i*67+11)%W, py=groundY+8+((i*43+7)%(H-groundY-8)); ctx.fillRect(px,py,2,2); }

  // market stalls with striped canopy + produce crates (sides)
  function stall(cx, awn){
    const topY=groundY-96, w=100;
    // posts + back
    ctx.fillStyle='#7a5a38'; ctx.fillRect(cx-w/2,topY,4,groundY-topY); ctx.fillRect(cx+w/2-4,topY,4,groundY-topY);
    // striped canopy (scalloped edge)
    for (let i=0;i<8;i++){ ctx.fillStyle= i%2?'#f2ece0':awn;
      ctx.beginPath(); ctx.moveTo(cx-w/2+i*(w/8),topY); ctx.lineTo(cx-w/2+(i+1)*(w/8),topY);
      ctx.lineTo(cx-w/2+(i+1)*(w/8),topY+16); ctx.lineTo(cx-w/2+(i+0.5)*(w/8),topY+22); ctx.lineTo(cx-w/2+i*(w/8),topY+16); ctx.closePath(); ctx.fill(); }
    // table
    ctx.fillStyle='#6a4a2e'; ctx.fillRect(cx-w/2-2,groundY-30,w+4,10);
    ctx.fillStyle='#4a3320'; ctx.fillRect(cx-w/2-2,groundY-20,w+4,20);
    // produce crates on table
    const veg=[['#e2482e',5],['#e0a020',4],['#7ab040',5],['#c04a8a',4]];
    for (let c=0;c<4;c++){ const bx=cx-w/2+8+c*24, by=groundY-34;
      ctx.fillStyle='#8a6038'; ctx.fillRect(bx-2,by,22,10);
      ctx.fillStyle=veg[c][0]; for (let k=0;k<veg[c][1];k++){ ctx.beginPath(); ctx.arc(bx+3+k*4,by-1,3,0,7); ctx.fill(); } }
    // hanging price flag
    ctx.fillStyle='#c04a3a'; ctx.fillRect(cx-8,topY+22,16,10);
  }
  stall(W*0.20,'#c0392b');
  stall(W*0.80,'#2a7a5a');

  // bunting between stalls
  ctx.strokeStyle='rgba(120,90,60,.6)'; ctx.lineWidth=1; ctx.beginPath();
  for (let x=0;x<=W;x+=8){ const y=H*0.30+Math.sin(x*0.05)*8; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  for (let x=6;x<W;x+=18){ const y=H*0.30+Math.sin(x*0.05)*8; ctx.fillStyle=['#e05a5a','#e0b040','#5ab0e0','#60c060'][(x/18|0)%4];
    ctx.beginPath(); ctx.moveTo(x-4,y); ctx.lineTo(x+4,y); ctx.lineTo(x,y+8); ctx.closePath(); ctx.fill(); }

  // a basket of flowers in the foreground-left
  const fbx=W*0.10, fby=groundY+24;
  ctx.fillStyle='#a9742e'; ctx.beginPath(); ctx.moveTo(fbx-14,fby); ctx.lineTo(fbx+14,fby); ctx.lineTo(fbx+10,fby+16); ctx.lineTo(fbx-10,fby+16); ctx.closePath(); ctx.fill();
  for (let k=0;k<7;k++){ ctx.fillStyle=['#e26fb0','#f2d04a','#e0603a','#a06fe0'][k%4]; ctx.beginPath(); ctx.arc(fbx-10+k*3.4,fby-4-Math.sin(k+ t)*2,3,0,7); ctx.fill(); }
}
registerScene('farmersmarket', drawFarmersMarket);

/* ── SKI LODGE (indoor · fireplace · cozy winter) ── */
function drawSkiLodge(){
  const t = sceneTime, floorY = H*0.72;

  // timber wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#6a4a30'); wall.addColorStop(1,'#563a24');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  ctx.strokeStyle='rgba(0,0,0,.22)'; ctx.lineWidth=1; for (let y=20;y<floorY;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // snowy window (left) with night mountains
  const wx=W*0.14, wy=H*0.14, ww=W*0.30, wh=H*0.34;
  ctx.fillStyle='#1e2a44'; ctx.fillRect(wx,wy,ww,wh);
  ctx.fillStyle='#e8eef6'; ctx.beginPath(); ctx.moveTo(wx,wy+wh); for(let x=0;x<=ww;x+=10){ ctx.lineTo(wx+x,wy+wh-18-14*Math.sin(x*0.06)); } ctx.lineTo(wx+ww,wy+wh); ctx.fill();
  for (let i=0;i<20;i++){ const sx=wx+((i*37+t*6)%ww), sy=wy+((i*29+t*10)%wh); ctx.fillStyle='rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(sx,sy,1.4,0,7); ctx.fill(); }
  ctx.strokeStyle='#3a2818'; ctx.lineWidth=4; ctx.strokeRect(wx,wy,ww,wh); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(wx+ww/2,wy); ctx.lineTo(wx+ww/2,wy+wh); ctx.moveTo(wx,wy+wh/2); ctx.lineTo(wx+ww,wy+wh/2); ctx.stroke();

  // stone fireplace (right) with animated flames
  const fx=W*0.72, fy=H*0.20, fw=W*0.34, fh=floorY-fy;
  ctx.fillStyle='#8a8078'; ctx.fillRect(fx,fy,fw,fh);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1;
  for (let y=fy;y<floorY;y+=14){ for (let x=fx+((y/14|0)%2)*12; x<fx+fw; x+=24){ ctx.strokeRect(x,y,24,14); } }
  // firebox
  const bx=fx+8, by=fy+fh-46, bw=fw-16, bh=42;
  ctx.fillStyle='#1a0e08'; ctx.fillRect(bx,by,bw,bh);
  // logs
  ctx.fillStyle='#5a3a20'; ctx.fillRect(bx+6,by+bh-10,bw-12,6); ctx.fillRect(bx+12,by+bh-16,bw-28,6);
  // flames
  for (let i=0;i<7;i++){ const flx=bx+8+i*(bw-16)/6; const fl=1+0.4*Math.sin(t*6+i*1.4); const fh2=(14+8*Math.sin(t*5+i))*fl;
    ctx.fillStyle='#e05a1a'; ctx.beginPath(); ctx.moveTo(flx-5,by+bh-6); ctx.quadraticCurveTo(flx,by+bh-6-fh2,flx+5,by+bh-6); ctx.fill();
    ctx.fillStyle='#f2b02a'; ctx.beginPath(); ctx.moveTo(flx-3,by+bh-6); ctx.quadraticCurveTo(flx,by+bh-6-fh2*0.6,flx+3,by+bh-6); ctx.fill(); }
  ctx.fillStyle=`rgba(255,150,60,${0.14+0.05*Math.sin(t*4)})`; ctx.beginPath(); ctx.ellipse(bx+bw/2,by+bh,bw*0.7,30,0,0,7); ctx.fill();
  // mantel with candles + a garland
  ctx.fillStyle='#4a3420'; ctx.fillRect(fx-4,by-12,fw+8,10);
  for (const cx of [fx+16,fx+fw-16]){ ctx.fillStyle='#efe6d0'; ctx.fillRect(cx-2,by-24,4,12); ctx.fillStyle=`rgba(255,200,90,${0.8+0.15*Math.sin(t*3+cx)})`; ctx.beginPath(); ctx.arc(cx,by-26,2.4,0,7); ctx.fill(); }

  // hanging skis on the back wall (center-top)
  const skX=W*0.46;
  for (const off of [-6,6]){ ctx.fillStyle= off<0?'#c0392b':'#2a6ab0'; ctx.save(); ctx.translate(skX+off,H*0.10); ctx.rotate(0.2);
    roundRect(-4,-2,8,70,4); ctx.fill(); ctx.restore(); }

  // wood-plank floor + cozy rug
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#8a6038'); fl.addColorStop(1,'#6a482a');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let x=0;x<W;x+=28){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-6,H); ctx.stroke(); }
  ctx.fillStyle='#b0442e'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.90,110,26,0,0,7); ctx.fill();
  ctx.fillStyle='#efe0c8'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.90,80,18,0,0,7); ctx.fill();
  ctx.fillStyle='#b0442e'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.90,44,10,0,0,7); ctx.fill();
}
registerScene('skilodge', drawSkiLodge);

/* ── CRYSTAL CAVE (underground · glowing geodes) ── */
function drawCrystalCave(){
  const t = sceneTime, floorY = H*0.70;

  // deep cave darkness
  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#140f26'); bg.addColorStop(0.6,'#1c1636'); bg.addColorStop(1,'#0e0a1c');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // ceiling rock with stalactites
  ctx.fillStyle='#241a3a'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W,0); ctx.lineTo(W,40);
  for (let x=W; x>=0; x-=30){ ctx.lineTo(x-15, 40+30*Math.abs(Math.sin(x*0.3))); ctx.lineTo(x-30,40); }
  ctx.closePath(); ctx.fill();

  // cave wall glow pools
  for (const gx of [W*0.25,W*0.75]){ const g=ctx.createRadialGradient(gx,H*0.4,10,gx,H*0.4,120);
    g.addColorStop(0,'rgba(90,140,230,.16)'); g.addColorStop(1,'rgba(90,140,230,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); }

  // glowing crystal clusters function
  function crystal(cx,cy,sc,hue){
    ctx.save(); ctx.translate(cx,cy); ctx.scale(sc,sc);
    const glow=0.6+0.35*Math.sin(t*1.5+cx*0.1);
    const shards=[[0,-40,10],[ -12,-26,8],[12,-30,8],[-6,-20,6],[7,-18,7]];
    for (const [dx,ty,w] of shards){
      ctx.fillStyle=`hsla(${hue},70%,${55+15*glow}%,0.9)`;
      ctx.beginPath(); ctx.moveTo(dx-w,0); ctx.lineTo(dx,ty); ctx.lineTo(dx+w,0); ctx.closePath(); ctx.fill();
      ctx.fillStyle=`hsla(${hue},80%,80%,0.5)`; ctx.beginPath(); ctx.moveTo(dx-1,0); ctx.lineTo(dx,ty); ctx.lineTo(dx+3,ty*0.5); ctx.closePath(); ctx.fill();
    }
    // ambient glow
    ctx.fillStyle=`hsla(${hue},80%,60%,${0.16*glow})`; ctx.beginPath(); ctx.arc(0,-20,30,0,7); ctx.fill();
    ctx.restore();
  }

  // ground with underground pool reflecting crystals
  ctx.fillStyle='#181228'; ctx.fillRect(0,floorY,W,H-floorY);
  // still water pool (center back-ish, kept low so pet floor stays clear near y=H*0.72)
  const poolY=floorY+8;
  ctx.fillStyle='#0e1a34'; ctx.beginPath(); ctx.ellipse(W*0.5,poolY,130,14,0,0,7); ctx.fill();
  ctx.strokeStyle='rgba(120,170,240,.2)'; ctx.lineWidth=1;
  for (let i=0;i<3;i++){ ctx.beginPath(); ctx.ellipse(W*0.5,poolY,80-i*20+Math.sin(t*2+i)*3,9-i*2,0,0,7); ctx.stroke(); }

  // crystal clusters (sides + a small one back-center)
  crystal(W*0.12,floorY+18,1.4,215);
  crystal(W*0.26,floorY+8,0.8,270);
  crystal(W*0.88,floorY+20,1.5,190);
  crystal(W*0.74,floorY+6,0.85,300);
  crystal(W*0.5,floorY-30,0.55,235);
  // small ceiling crystals hanging
  crystal(W*0.35,44,0.5,260); crystal(W*0.62,50,0.45,205);

  // floating glowing dust motes
  for (let i=0;i<22;i++){ const mx=(i*61+ Math.sin(t*0.4+i)*16)%W; const my=(i*53 + t*8)%H;
    ctx.fillStyle=`rgba(150,190,255,${0.2+0.3*Math.abs(Math.sin(t*2+i))})`; ctx.beginPath(); ctx.arc(mx,my,1.3,0,7); ctx.fill(); }
}
registerScene('crystalcave', drawCrystalCave);

/* ── LANTERN FESTIVAL (outdoor · night · floating sky/water lanterns) ── */
function drawLanternFestival(){
  const t = sceneTime, waterY = H*0.60;

  // warm night sky
  const sky=ctx.createLinearGradient(0,0,0,waterY);
  sky.addColorStop(0,'#1a1030'); sky.addColorStop(0.6,'#3a1a3a'); sky.addColorStop(1,'#6a2a3a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  // stars
  for (let i=0;i<40;i++){ const sx=(i*79+7)%W, sy=(i*31+4)%(waterY*0.7);
    ctx.fillStyle=`rgba(255,240,210,${0.2+0.3*Math.abs(Math.sin(t*1.2+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }
  // crescent moon
  ctx.fillStyle='#f2ecc8'; ctx.beginPath(); ctx.arc(W*0.82,H*0.12,16,0,7); ctx.fill();
  ctx.fillStyle='#1a1030'; ctx.beginPath(); ctx.arc(W*0.86,H*0.10,15,0,7); ctx.fill();

  // distant town silhouette on far bank
  ctx.fillStyle='#170c22';
  let bx=0,s2=13; const rr=()=>{ s2=(s2*9301+49297)%233280; return s2/233280; };
  while (bx<W){ const bw=18+Math.floor(rr()*20), bh=16+Math.floor(rr()*26); ctx.fillRect(bx,waterY-bh,bw,bh);
    if (rr()>0.5){ ctx.fillStyle='rgba(255,200,120,.5)'; ctx.fillRect(bx+bw*0.3,waterY-bh*0.6,3,4); ctx.fillStyle='#170c22'; } bx+=bw+2; }

  // floating sky lanterns drifting upward
  function skyLantern(lx,ly,sc,glow){
    ctx.save(); ctx.translate(lx,ly); ctx.scale(sc,sc);
    ctx.fillStyle=`rgba(255,170,90,${0.25*glow})`; ctx.beginPath(); ctx.arc(0,0,16,0,7); ctx.fill();
    ctx.fillStyle=`rgba(240,140,70,${0.9})`; ctx.beginPath(); ctx.moveTo(-7,-8); ctx.lineTo(7,-8); ctx.lineTo(5,7); ctx.lineTo(-5,7); ctx.closePath(); ctx.fill();
    ctx.fillStyle=`rgba(255,220,120,${0.8+0.15*Math.sin(t*3+lx)})`; ctx.fillRect(-3,3,6,5);
    ctx.fillStyle='#5a2a1a'; ctx.fillRect(-5,7,10,2);
    ctx.restore();
  }
  for (let i=0;i<9;i++){ const lx=(i*47+ Math.sin(t*0.3+i)*24)%W; const ly=waterY-30-((t*7+i*45)%(waterY)); const sc=0.6+((i*7)%5)*0.14;
    skyLantern(lx,ly,sc,0.7+0.3*Math.sin(t+i)); }

  // river water
  const wat=ctx.createLinearGradient(0,waterY,0,H); wat.addColorStop(0,'#3a1830'); wat.addColorStop(1,'#160a1c');
  ctx.fillStyle=wat; ctx.fillRect(0,waterY,W,H-waterY);
  // shimmering reflections of lantern light
  ctx.strokeStyle='rgba(255,170,90,.12)'; ctx.lineWidth=1;
  for (let y=waterY+6;y<H;y+=8){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.06+t*1.5+y)*1.6; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }

  // floating water lanterns drifting across the surface
  function waterLantern(lx,ly,col){
    const bob=Math.sin(t*1.5+lx)*1.5;
    ctx.fillStyle='#efe6d0'; ctx.beginPath(); ctx.ellipse(lx,ly+bob,10,4,0,0,7); ctx.fill();
    ctx.fillStyle=col; roundRect(lx-5,ly-8+bob,10,9,2); ctx.fill();
    ctx.fillStyle=`rgba(255,220,140,${0.85+0.12*Math.sin(t*4+lx)})`; ctx.beginPath(); ctx.arc(lx,ly-3+bob,2.2,0,7); ctx.fill();
    // glow on water
    ctx.fillStyle='rgba(255,180,90,.14)'; ctx.beginPath(); ctx.ellipse(lx,ly+6+bob,14,3,0,0,7); ctx.fill();
  }
  const cols=['#c0392b','#e0a020','#e26fb0','#5ab0e0'];
  for (let i=0;i<6;i++){ const lx=((i*63 + t*10)%(W+40))-20; const ly=waterY+16+ (i%3)*20; waterLantern(lx,ly,cols[i%cols.length]); }
}
registerScene('lanternfestival', drawLanternFestival);

/* ── SUSHI BAR (indoor · counter · itamae station) ── */
function drawSushiBar(){
  const t = sceneTime, counterY = H*0.66;

  // indigo plaster wall
  const wall=ctx.createLinearGradient(0,0,0,counterY); wall.addColorStop(0,'#1f3a4a'); wall.addColorStop(1,'#2f556a');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,counterY);
  // horizontal shiplap seams
  ctx.strokeStyle='rgba(0,0,0,.16)'; ctx.lineWidth=1; for (let y=18;y<counterY;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // noren curtain (top)
  const norH=44;
  ctx.fillStyle='#243b6a'; ctx.fillRect(0,0,W,norH);
  ctx.fillStyle='#1a2b50'; for (let i=1;i<5;i++){ ctx.fillRect(i*(W/5)-1,0,2,norH); }
  // white brush glyphs
  ctx.strokeStyle='rgba(240,244,255,.9)'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.arc(W*0.30,24,9,0.3,5.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W*0.60,12); ctx.lineTo(W*0.60,34); ctx.moveTo(W*0.54,20); ctx.lineTo(W*0.66,20); ctx.stroke();

  // hanging paper lanterns
  for (const lx of [W*0.14,W*0.86]){ ctx.strokeStyle='#1a2b40'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx,norH); ctx.lineTo(lx,norH+8); ctx.stroke();
    ctx.fillStyle='rgba(255,180,90,.22)'; ctx.beginPath(); ctx.arc(lx,norH+20,18,0,7); ctx.fill();
    ctx.fillStyle=`rgba(240,150,80,${0.82+0.12*Math.sin(t*2+lx)})`; roundRect(lx-10,norH+8,20,26,9); ctx.fill();
    ctx.strokeStyle='#a04020'; for (let k=1;k<4;k++){ ctx.beginPath(); ctx.moveTo(lx-10,norH+8+k*6.5); ctx.lineTo(lx+10,norH+8+k*6.5); ctx.stroke(); } }

  // a framed wave print (center back)
  const px=W*0.5-40, py=norH+18;
  ctx.fillStyle='#e8dcc4'; ctx.fillRect(px,py,80,50); ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=3; ctx.strokeRect(px,py,80,50);
  ctx.strokeStyle='#2a6a9a'; ctx.lineWidth=2; ctx.beginPath();
  for (let x=0;x<=80;x+=6){ const yy=py+34+Math.sin(x*0.12)*8; x===0?ctx.moveTo(px+x,yy):ctx.lineTo(px+x,yy);} ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(px+64,py+22,8,Math.PI,0.2); ctx.fill();

  // light wood counter
  const cnt=ctx.createLinearGradient(0,counterY,0,H); cnt.addColorStop(0,'#e0c088'); cnt.addColorStop(1,'#c2a066');
  ctx.fillStyle=cnt; ctx.fillRect(0,counterY,W,H-counterY);
  ctx.fillStyle='rgba(255,250,220,.18)'; ctx.fillRect(0,counterY,W,4);
  ctx.strokeStyle='rgba(150,110,60,.3)'; ctx.lineWidth=1; for (let x=0;x<W;x+=34){ ctx.beginPath(); ctx.moveTo(x,counterY); ctx.lineTo(x-8,H); ctx.stroke(); }

  // sushi geta (wooden plates) with nigiri — kept to the sides
  function nigiri(nx,ny,fish){ ctx.fillStyle='#f4efe6'; ctx.beginPath(); ctx.ellipse(nx,ny,9,5,0,0,7); ctx.fill();
    ctx.fillStyle=fish; ctx.beginPath(); ctx.ellipse(nx,ny-3,9,3.4,0,0,7); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=0.7; ctx.beginPath(); ctx.moveTo(nx-6,ny-3); ctx.lineTo(nx+6,ny-3); ctx.stroke(); }
  function geta(gx){ ctx.fillStyle='#6a4a2e'; roundRect(gx-34,counterY+16,68,20,3); ctx.fill();
    ctx.fillStyle='#4a3320'; ctx.fillRect(gx-30,counterY+34,8,6); ctx.fillRect(gx+22,counterY+34,8,6);
    nigiri(gx-18,counterY+22,'#e8794a'); nigiri(gx,counterY+22,'#e2a0a8'); nigiri(gx+18,counterY+22,'#dfe0d4');
    // wasabi + ginger dab
    ctx.fillStyle='#7ab040'; ctx.beginPath(); ctx.arc(gx-30,counterY+22,2.4,0,7); ctx.fill();
    ctx.fillStyle='#f0c0c8'; ctx.beginPath(); ctx.arc(gx+30,counterY+22,3,0,7); ctx.fill(); }
  geta(W*0.20); geta(W*0.80);

  // soy bottle + chopstick rest center-back on counter (small, high)
  ctx.fillStyle='#222'; roundRect(W*0.5-4,counterY+6,8,14,2); ctx.fill(); ctx.fillStyle='#c0392b'; ctx.fillRect(W*0.5-4,counterY+6,8,3);

  // steam-free but a green plant in a vase (right)
  ctx.fillStyle='#3a6a9a'; roundRect(W*0.62,counterY+20,10,16,2); ctx.fill();
  ctx.fillStyle='#4a8a4a'; for (const a of [-0.5,0,0.5]){ ctx.save(); ctx.translate(W*0.62+5,counterY+20); ctx.rotate(a); ctx.fillRect(-1.5,-22,3,22); ctx.restore(); }
}
registerScene('sushibar', drawSushiBar);

/* ── SEASIDE CAROUSEL (outdoor · sunny boardwalk) ── */
function drawSeasideCarousel(){
  const t = sceneTime, boardY = H*0.72, seaY = H*0.44;

  // bright sky
  const sky=ctx.createLinearGradient(0,0,0,seaY); sky.addColorStop(0,'#63b4ea'); sky.addColorStop(1,'#bfe6f5');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,seaY);
  ctx.fillStyle='#fff4b0'; ctx.beginPath(); ctx.arc(W*0.85,H*0.11,20,0,7); ctx.fill();
  drawCloud(W*0.2+Math.sin(t*0.1)*8,H*0.09,0.7); drawCloud(W*0.5+Math.sin(t*0.08+2)*6,H*0.15,0.5);

  // sea
  const sea=ctx.createLinearGradient(0,seaY,0,boardY); sea.addColorStop(0,'#2e8bc0'); sea.addColorStop(1,'#4aa8c8');
  ctx.fillStyle=sea; ctx.fillRect(0,seaY,W,boardY-seaY);
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1;
  for (let y=seaY+6;y<boardY;y+=8){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.07+t*1.5+y)*1.6; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }

  // the carousel (center, slightly back)
  const cx=W*0.5, topY=seaY-6, roofR=70, baseY=boardY-6;
  // center pole
  ctx.fillStyle='#c9a24a'; ctx.fillRect(cx-3,topY,6,baseY-topY);
  // striped conical roof
  for (let i=0;i<10;i++){ ctx.fillStyle= i%2?'#e2482e':'#f2ece0';
    ctx.beginPath(); ctx.moveTo(cx,topY-30); ctx.lineTo(cx-roofR+i*(2*roofR/10),topY+6); ctx.lineTo(cx-roofR+(i+1)*(2*roofR/10),topY+6); ctx.closePath(); ctx.fill(); }
  // finial
  ctx.fillStyle='#e0b040'; ctx.beginPath(); ctx.arc(cx,topY-32,4,0,7); ctx.fill();
  // roof rim with bulbs
  ctx.fillStyle='#c9a24a'; ctx.fillRect(cx-roofR,topY+4,2*roofR,5);
  for (let i=0;i<=10;i++){ const bx=cx-roofR+i*(2*roofR/10); ctx.fillStyle=`rgba(255,240,150,${0.6+0.4*Math.sin(t*4+i)})`; ctx.beginPath(); ctx.arc(bx,topY+11,2,0,7); ctx.fill(); }
  // rotating horses on poles (3 visible, sinusoidal bob + horizontal sway = rotation feel)
  const horseCols=['#f2d0d8','#d0e0f2','#f2e6c0'];
  for (let i=0;i<3;i++){ const ph=t*0.8+i*2.094; const hx=cx+Math.sin(ph)*(roofR-16); const depth=(Math.cos(ph)+1)/2; const sc=0.7+depth*0.5;
    const hy=(topY+baseY)/2 + Math.sin(ph)*8 + Math.sin(t*3+i)*3;
    ctx.globalAlpha=0.5+depth*0.5;
    // brass pole
    ctx.strokeStyle='#e0b040'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(hx,topY+9); ctx.lineTo(hx,hy+14*sc); ctx.stroke();
    // horse body
    ctx.save(); ctx.translate(hx,hy); ctx.scale(sc,sc);
    ctx.fillStyle=horseCols[i]; roundRect(-12,-6,24,12,5); ctx.fill();
    ctx.fillStyle=horseCols[i]; ctx.beginPath(); ctx.moveTo(10,-4); ctx.lineTo(18,-12); ctx.lineTo(20,-6); ctx.lineTo(12,2); ctx.closePath(); ctx.fill(); // head/neck
    ctx.fillStyle='#c07a3a'; ctx.beginPath(); ctx.moveTo(-12,-4); ctx.lineTo(-18,-10); ctx.lineTo(-12,2); ctx.fill(); // tail
    ctx.strokeStyle='#8a5a2a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-6,6); ctx.lineTo(-8,14); ctx.moveTo(6,6); ctx.lineTo(8,14); ctx.stroke(); // legs
    ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(16,-8,1.2,0,7); ctx.fill();
    ctx.restore(); ctx.globalAlpha=1; }

  // boardwalk deck (foreground)
  const deck=ctx.createLinearGradient(0,boardY,0,H); deck.addColorStop(0,'#c9a878'); deck.addColorStop(1,'#a2825a');
  ctx.fillStyle=deck; ctx.fillRect(0,boardY,W,H-boardY);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1; for (let y=boardY+6;y<H;y+=10){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // railing posts along the sea edge
  ctx.fillStyle='#e8e2d4'; for (let x=6;x<W;x+=40){ ctx.fillRect(x,boardY-16,4,16); } ctx.fillRect(0,boardY-8,W,3);
}
registerScene('seasidecarousel', drawSeasideCarousel);

/* ── POTION KITCHEN (indoor · witchy apothecary lab) ── */
function drawPotionKitchen(){
  const t = sceneTime, floorY = H*0.70;

  // moody stone wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#241a2e'); wall.addColorStop(1,'#3a2a44');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1;
  for (let y=16;y<floorY;y+=18){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    for (let x=((y/18|0)%2)*18; x<W; x+=36){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+18); ctx.stroke(); } }

  // green cauldron-glow ambience
  const glowc=ctx.createRadialGradient(W*0.5,floorY-6,10,W*0.5,floorY-6,150);
  glowc.addColorStop(0,'rgba(120,230,140,.22)'); glowc.addColorStop(1,'rgba(120,230,140,0)');
  ctx.fillStyle=glowc; ctx.fillRect(0,0,W,floorY);

  // shelves of glowing potion bottles (top, across)
  for (let s=0;s<2;s++){ const sy=H*0.10+s*H*0.14;
    ctx.fillStyle='#4a3420'; ctx.fillRect(W*0.06,sy+22,W*0.88,5);
    const potcols=['#7ae0c0','#e07ab0','#e0c04a','#7a9ae0','#c07ae0','#e08a4a','#8ae04a'];
    for (let i=0;i<7;i++){ const bx=W*0.10+i*W*0.115, bh=14+((i*3+s)%4)*4;
      // bottle
      ctx.fillStyle='#2a2436'; ctx.fillRect(bx-5,sy+22-bh,10,bh);
      ctx.fillStyle=potcols[(i+s*3)%potcols.length]; ctx.fillRect(bx-4,sy+22-bh+3,8,bh-4);
      // liquid glow shimmer
      ctx.fillStyle=`rgba(255,255,255,${0.2+0.2*Math.sin(t*2+i+s)})`; ctx.fillRect(bx-4,sy+22-bh+3,8,3);
      // cork
      ctx.fillStyle='#8a5a3a'; ctx.fillRect(bx-2.5,sy+22-bh-4,5,4); }
  }

  // hanging dried herbs (corners)
  for (const hx of [W*0.10,W*0.90]){ ctx.strokeStyle='#6a5a3a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(hx,0); ctx.lineTo(hx,26); ctx.stroke();
    ctx.fillStyle='#5a7a3a'; for (let k=0;k<5;k++){ ctx.beginPath(); ctx.ellipse(hx+(k%2?4:-4),26+k*5,3,7,k%2?0.4:-0.4,0,7); ctx.fill(); } }

  // stone floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#3a2f3a'); fl.addColorStop(1,'#251d28');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; for (let y=floorY+10;y<H;y+=14){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // bubbling cauldron (left side, off-center to keep pet floor clear)
  const cx=W*0.20, cy=floorY+18;
  // fire under it
  for (let i=0;i<5;i++){ const flx=cx-12+i*6; const fh=8+5*Math.sin(t*6+i); ctx.fillStyle='#e0641a'; ctx.beginPath(); ctx.moveTo(flx-3,cy+18); ctx.quadraticCurveTo(flx,cy+18-fh,flx+3,cy+18); ctx.fill();
    ctx.fillStyle='#f2b02a'; ctx.beginPath(); ctx.moveTo(flx-1.5,cy+18); ctx.quadraticCurveTo(flx,cy+18-fh*0.6,flx+1.5,cy+18); ctx.fill(); }
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(cx-16,cy+16,32,4); ctx.fillRect(cx-14,cy+14,4,6); ctx.fillRect(cx+10,cy+14,4,6);
  // pot
  ctx.fillStyle='#1a1a20'; ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI); ctx.fill(); ctx.fillRect(cx-18,cy-4,36,4);
  ctx.fillStyle='#5ad08a'; ctx.beginPath(); ctx.ellipse(cx,cy-4,16,5,0,0,7); ctx.fill();
  // bubbles
  for (let i=0;i<5;i++){ const bx=cx-10+ (i*5); const by=cy-4-((t*20+i*13)%22); const br=1.4+Math.sin(t*3+i)*0.8;
    ctx.fillStyle=`rgba(150,240,170,${0.7-((t*20+i*13)%22)/30})`; ctx.beginPath(); ctx.arc(bx,by,Math.max(0.4,br),0,7); ctx.fill(); }
  // green vapor
  ctx.strokeStyle='rgba(150,240,170,.25)'; ctx.lineWidth=2; ctx.beginPath();
  for (let k=0;k<=9;k++){ const yy=cy-8-k*5, xx=cx+Math.sin(t*2+k*0.6)*5; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);} ctx.stroke();

  // open spellbook on a small table (right side)
  const bx=W*0.82, by=floorY+22;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(bx-24,by+8,48,6); ctx.fillRect(bx-20,by+14,4,14); ctx.fillRect(bx+16,by+14,4,14);
  ctx.fillStyle='#6a4a2e'; ctx.beginPath(); ctx.moveTo(bx-24,by+8); ctx.lineTo(bx,by+2); ctx.lineTo(bx+24,by+8); ctx.lineTo(bx,by+12); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#efe6d0'; ctx.beginPath(); ctx.moveTo(bx-22,by+7); ctx.lineTo(bx,by+2); ctx.lineTo(bx,by+9); ctx.lineTo(bx-22,by+11); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(bx+22,by+7); ctx.lineTo(bx,by+2); ctx.lineTo(bx,by+9); ctx.lineTo(bx+22,by+11); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(120,80,40,.6)'; ctx.lineWidth=0.6; for (let k=1;k<4;k++){ ctx.beginPath(); ctx.moveTo(bx-18,by+5+k*1.5); ctx.lineTo(bx-3,by+3+k*1.5); ctx.stroke(); }
  // floating sparkle above the book
  for (let i=0;i<5;i++){ const sx=bx+Math.sin(t*1.5+i)*10; const sy=by-6-((t*14+i*10)%26); ctx.fillStyle=`rgba(200,255,210,${0.6-((t*14+i*10)%26)/40})`; ctx.fillRect(sx,sy,1.6,1.6); }
}
registerScene('potionkitchen', drawPotionKitchen);

/* ── KITE HILL (outdoor · breezy afternoon) ── */
function drawKiteHill(){
  const t = sceneTime, hillY = H*0.64;

  // wide breezy sky
  const sky=ctx.createLinearGradient(0,0,0,hillY); sky.addColorStop(0,'#5fa8e6'); sky.addColorStop(1,'#c4e6f2');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,hillY);
  ctx.fillStyle='#fff4b0'; ctx.beginPath(); ctx.arc(W*0.16,H*0.13,18,0,7); ctx.fill();
  // fast-moving puffy clouds
  drawCloud((W*0.4 + t*6)%(W+80)-40,H*0.10,0.7);
  drawCloud((W*0.8 + t*4)%(W+80)-40,H*0.20,0.55);
  drawCloud((W*0.1 + t*5)%(W+80)-40,H*0.28,0.45);

  // flying kites with tails
  function kite(kx,ky,col,sway){
    const a=Math.sin(t*1.2+sway)*0.3;
    ctx.save(); ctx.translate(kx,ky); ctx.rotate(a);
    // diamond
    ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(11,0); ctx.lineTo(0,16); ctx.lineTo(-11,0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(0,16); ctx.moveTo(-11,0); ctx.lineTo(11,0); ctx.stroke();
    // highlight panel
    ctx.fillStyle='rgba(255,255,255,.3)'; ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(11,0); ctx.lineTo(0,0); ctx.closePath(); ctx.fill();
    ctx.restore();
    // wavy tail with bows
    ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.beginPath();
    for (let k=0;k<=8;k++){ const yy=ky+16+k*7; const xx=kx+Math.sin(t*3+k*0.7+sway)*8; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);} ctx.stroke();
    for (let k=1;k<8;k+=2){ const yy=ky+16+k*7; const xx=kx+Math.sin(t*3+k*0.7+sway)*8; ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(xx-4,yy-2); ctx.lineTo(xx+4,yy+2); ctx.lineTo(xx+4,yy-2); ctx.lineTo(xx-4,yy+2); ctx.closePath(); ctx.fill(); }
    // string down toward the hill
    ctx.strokeStyle='rgba(80,80,80,.4)'; ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(kx,ky+16); ctx.quadraticCurveTo((kx+W*0.5)/2, hillY-20, W*0.5, hillY+6); ctx.stroke();
  }
  kite(W*0.30,H*0.20,'#e2482e',0);
  kite(W*0.66,H*0.15,'#3a7ad0',2);
  kite(W*0.82,H*0.32,'#e0b040',4);

  // birds far off
  ctx.strokeStyle='rgba(60,70,90,.5)'; ctx.lineWidth=1;
  for (let i=0;i<3;i++){ const bx=(W*0.5+i*30 + t*8)%W, by=H*0.09+i*6; ctx.beginPath(); ctx.moveTo(bx-4,by); ctx.quadraticCurveTo(bx,by-3,bx+4,by); ctx.stroke(); }

  // grassy hill
  const gr=ctx.createLinearGradient(0,hillY,0,H); gr.addColorStop(0,'#6aae42'); gr.addColorStop(1,'#4a8a2e');
  ctx.fillStyle=gr; ctx.beginPath(); ctx.moveTo(0,hillY+14); ctx.quadraticCurveTo(W*0.5,hillY-14,W,hillY+14); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  // wind-swept grass blades leaning one way
  ctx.strokeStyle='rgba(40,90,20,.4)'; ctx.lineWidth=1;
  for (let i=0;i<60;i++){ const gx=(i*61+9)%W; const gy=hillY+18+((i*37+7)%(H-hillY-18)); const lean=6+Math.sin(t*2+i)*2;
    ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+lean,gy-7); ctx.stroke(); }
  // little wildflowers (sides)
  for (const [fx,fc] of [[W*0.10,'#e2d04a'],[W*0.90,'#e26fb0'],[W*0.16,'#ffffff']]){ ctx.fillStyle=fc; for (let k=0;k<4;k++){ const a=k/4*6.28; ctx.beginPath(); ctx.arc(fx+Math.cos(a)*2.5,H*0.86+Math.sin(a)*2.5,1.6,0,7); ctx.fill(); } ctx.fillStyle='#e0b040'; ctx.beginPath(); ctx.arc(fx,H*0.86,1.4,0,7); ctx.fill(); }
  // a picnic blanket corner (foreground-left, low)
  ctx.save(); ctx.translate(W*0.14,H*0.92); ctx.rotate(-0.1);
  ctx.fillStyle='rgba(210,80,80,.5)'; roundRect(-26,-8,52,16,3); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.3)'; for (let x=-26;x<26;x+=8){ ctx.fillRect(x,-8,2,16); } ctx.restore();
}
registerScene('kitehill', drawKiteHill);

/* ── FLOWER MARKET (outdoor · sunny street stalls) ── */
function drawFlowerMarket(){
  const t = sceneTime, groundY = H*0.70;

  // soft morning sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#9ed0ee'); sky.addColorStop(1,'#f0e4ee');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='#fff6c8'; ctx.beginPath(); ctx.arc(W*0.82,H*0.12,18,0,7); ctx.fill();
  drawCloud(W*0.2+Math.sin(t*0.09)*8,H*0.10,0.6); drawCloud(W*0.55+Math.sin(t*0.07+2)*6,H*0.16,0.45);

  // pastel shopfronts behind
  const fronts=['#e7b7c4','#c4d7b0','#b9c8e2','#e6d2a6'];
  for (let i=0;i<4;i++){ const bx=i*(W/4); ctx.fillStyle=fronts[i]; ctx.fillRect(bx,H*0.22,W/4,groundY-H*0.22);
    // door + window
    ctx.fillStyle='rgba(90,70,60,.5)'; ctx.fillRect(bx+W/4*0.2,groundY-40,W/4*0.24,40);
    ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(bx+W/4*0.55,groundY-40,W/4*0.28,26);
    // little pitched roof band
    ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(bx,H*0.22,W/4,6); }

  // striped awning strip across the shopfronts
  for (let i=0;i<12;i++){ ctx.fillStyle= i%2?'#f2ece0':'#d05a6a'; ctx.beginPath();
    ctx.moveTo(i*(W/12),H*0.30); ctx.lineTo((i+1)*(W/12),H*0.30); ctx.lineTo((i+1)*(W/12),H*0.30+14); ctx.lineTo((i+0.5)*(W/12),H*0.30+20); ctx.lineTo(i*(W/12),H*0.30+14); ctx.closePath(); ctx.fill(); }

  // cobble ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#b0a598'); gr.addColorStop(1,'#8c8074');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.strokeStyle='rgba(0,0,0,.14)'; ctx.lineWidth=1;
  for (let y=groundY+8;y<H;y+=9){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    for (let x=((y/9|0)%2)*11; x<W; x+=22){ ctx.beginPath(); ctx.moveTo(x,y-9); ctx.lineTo(x,y); ctx.stroke(); } }

  // flower bucket rows (sides + a low center row), lots of color
  function bucket(bx,by,fc){
    ctx.fillStyle='#8a9aa4'; ctx.beginPath(); ctx.moveTo(bx-9,by); ctx.lineTo(bx+9,by); ctx.lineTo(bx+7,by+16); ctx.lineTo(bx-7,by+16); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#7a8a94'; ctx.fillRect(bx-9,by,18,3);
    // blooms
    for (let k=0;k<6;k++){ const a=k/6*6.28; const fx2=bx+Math.cos(a)*6, fy2=by-8+Math.sin(a)*4 - (k%2)*3 + Math.sin(t*1.5+k+bx)*1;
      ctx.strokeStyle='#3a7a3a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(fx2,fy2); ctx.stroke();
      ctx.fillStyle=fc; ctx.beginPath(); ctx.arc(fx2,fy2,3.2,0,7); ctx.fill();
      ctx.fillStyle='#fff2b0'; ctx.beginPath(); ctx.arc(fx2,fy2,1,0,7); ctx.fill(); }
  }
  const fc=['#e2482e','#e0b040','#e26fb0','#a06fe0','#f2f2f2','#e08a4a','#d04a8a'];
  // left cluster
  bucket(W*0.10,groundY+12,fc[0]); bucket(W*0.20,groundY+16,fc[2]); bucket(W*0.15,groundY+30,fc[4]);
  // right cluster
  bucket(W*0.90,groundY+12,fc[3]); bucket(W*0.80,groundY+16,fc[1]); bucket(W*0.85,groundY+30,fc[6]);
  // a wooden crate of potted tulips on a small table (right-back, high)
  ctx.fillStyle='#8a6038'; ctx.fillRect(W*0.66,groundY-6,42,10);
  for (let k=0;k<5;k++){ const px=W*0.66+6+k*8; ctx.strokeStyle='#3a7a3a'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(px,groundY-6); ctx.lineTo(px,groundY-18); ctx.stroke();
    ctx.fillStyle=fc[k%fc.length]; ctx.beginPath(); ctx.ellipse(px,groundY-20,3,4,0,0,7); ctx.fill(); }

  // hanging flower baskets from the awning
  for (const hx of [W*0.34,W*0.62]){ ctx.strokeStyle='#6a5a3a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(hx,H*0.30+18); ctx.lineTo(hx,H*0.30+30); ctx.stroke();
    ctx.fillStyle='#8a6038'; ctx.beginPath(); ctx.arc(hx,H*0.30+34,8,0,Math.PI); ctx.fill();
    for (let k=0;k<5;k++){ ctx.fillStyle=fc[(k+2)%fc.length]; ctx.beginPath(); ctx.arc(hx-6+k*3,H*0.30+34+Math.sin(t+k)*1.5,2.4,0,7); ctx.fill(); } }
}
registerScene('flowermarket', drawFlowerMarket);

/* ── SNOW GLOBE SHOP (indoor · whimsical curio store) ── */
function drawSnowGlobeShop(){
  const t = sceneTime, floorY = H*0.72;

  // cozy teal wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#22485a'); wall.addColorStop(1,'#2f6272');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  // wainscot stripe
  ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(0,floorY-24,W,24);
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,floorY-24); ctx.lineTo(W,floorY-24); ctx.stroke();

  // warm pendant light
  ctx.strokeStyle='#1a2a30'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.5,0); ctx.lineTo(W*0.5,H*0.08); ctx.stroke();
  ctx.fillStyle='rgba(255,220,150,.18)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.13,40,0,7); ctx.fill();
  ctx.fillStyle='#2a2018'; ctx.beginPath(); ctx.moveTo(W*0.5-14,H*0.08); ctx.lineTo(W*0.5+14,H*0.08); ctx.lineTo(W*0.5+8,H*0.13); ctx.lineTo(W*0.5-8,H*0.13); ctx.closePath(); ctx.fill();
  ctx.fillStyle=`rgba(255,220,140,${0.85+0.1*Math.sin(t*2)})`; ctx.beginPath(); ctx.arc(W*0.5,H*0.135,4,0,7); ctx.fill();

  // wooden display shelves with snow globes
  function globe(gx,gy,r,scene){
    // globe glass
    const g=ctx.createRadialGradient(gx-r*0.3,gy-r*0.3,1,gx,gy,r);
    g.addColorStop(0,'rgba(210,235,245,.9)'); g.addColorStop(1,'rgba(150,200,220,.75)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(gx,gy,r,0,7); ctx.fill();
    // mini scene inside
    ctx.save(); ctx.beginPath(); ctx.arc(gx,gy,r-1,0,7); ctx.clip();
    if (scene==='tree'){ ctx.fillStyle='#2f7a3a'; ctx.beginPath(); ctx.moveTo(gx,gy-r*0.6); ctx.lineTo(gx-r*0.5,gy+r*0.4); ctx.lineTo(gx+r*0.5,gy+r*0.4); ctx.closePath(); ctx.fill(); }
    else if (scene==='house'){ ctx.fillStyle='#c05a4a'; ctx.fillRect(gx-r*0.4,gy-r*0.1,r*0.8,r*0.5); ctx.fillStyle='#7a3a2a'; ctx.beginPath(); ctx.moveTo(gx-r*0.5,gy-r*0.1); ctx.lineTo(gx,gy-r*0.5); ctx.lineTo(gx+r*0.5,gy-r*0.1); ctx.fill(); }
    else { ctx.fillStyle='#dfe8ee'; ctx.beginPath(); ctx.arc(gx,gy+r*0.1,r*0.35,0,7); ctx.arc(gx-r*0.25,gy+r*0.3,r*0.25,0,7); ctx.arc(gx+r*0.25,gy+r*0.3,r*0.25,0,7); ctx.fill(); }
    // snow base
    ctx.fillStyle='#eef4f8'; ctx.beginPath(); ctx.ellipse(gx,gy+r*0.55,r,r*0.35,0,0,7); ctx.fill();
    // swirling snowflakes
    for (let k=0;k<10;k++){ const a=t*1.2+k*0.63; const sr=(r*0.7)*((k%5)/5); const sx=gx+Math.cos(a)*sr; const sy=gy+r*0.4 - ((t*10+k*7)%(r*1.3));
      ctx.fillStyle='rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(sx,sy,1,0,7); ctx.fill(); }
    ctx.restore();
    // glass shine
    ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(gx-r*0.35,gy-r*0.35,r*0.22,r*0.12,-0.6,0,7); ctx.fill();
    // base
    ctx.fillStyle='#6a4a2e'; roundRect(gx-r*0.8,gy+r*0.7,r*1.6,r*0.5,2); ctx.fill();
    ctx.fillStyle='#8a5a3a'; ctx.fillRect(gx-r*0.8,gy+r*0.7,r*1.6,2);
  }
  // two shelves
  for (const sy of [H*0.30,H*0.50]){ ctx.fillStyle='#5a3a24'; ctx.fillRect(W*0.06,sy+14,W*0.88,6); ctx.fillStyle='#3a2418'; ctx.fillRect(W*0.06,sy+20,W*0.88,3);
    const scenes=['tree','house','snowman'];
    for (let i=0;i<4;i++){ const gx=W*0.16+i*W*0.22; globe(gx,sy,13,scenes[(i+ (sy>H*0.4?1:0))%3]); } }

  // plank floor + rug
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#8a6038'); fl.addColorStop(1,'#6a482a');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1; for (let x=0;x<W;x+=28){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-6,H); ctx.stroke(); }
  ctx.fillStyle='#2f6272'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.90,100,22,0,0,7); ctx.fill();
  ctx.fillStyle='#3f7282'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.90,64,14,0,0,7); ctx.fill();

  // a big feature globe on a small counter (left, low)
  globe(W*0.16,floorY+18,20,'house');
}
registerScene('snowglobeshop', drawSnowGlobeShop);

/* ── NIGHT GARDEN (outdoor · illuminated flowers at night) ── */
function drawNightGarden(){
  const t = sceneTime, groundY = H*0.62;

  // deep blue night sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#101838'); sky.addColorStop(1,'#243a5a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  for (let i=0;i<40;i++){ const sx=(i*79+5)%W, sy=(i*29+3)%(groundY*0.7); ctx.fillStyle=`rgba(230,240,255,${0.2+0.3*Math.abs(Math.sin(t*1.2+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }
  // soft moon
  ctx.fillStyle='rgba(240,244,220,.2)'; ctx.beginPath(); ctx.arc(W*0.8,H*0.13,30,0,7); ctx.fill();
  ctx.fillStyle='#eef0d8'; ctx.beginPath(); ctx.arc(W*0.8,H*0.13,17,0,7); ctx.fill();

  // dark hedge silhouette + a lit pergola arch
  ctx.fillStyle='#0e2018'; ctx.fillRect(0,groundY-26,W,30);
  ctx.fillStyle='#12281c'; for (let x=0;x<W;x+=16){ ctx.beginPath(); ctx.arc(x,groundY-26,9,Math.PI,0); ctx.fill(); }
  // string lights on a wire arch
  ctx.strokeStyle='rgba(120,90,60,.5)'; ctx.lineWidth=1; ctx.beginPath();
  for (let x=0;x<=W;x+=8){ const y=H*0.20+Math.sin(x*0.02)*Math.sin(1)*10 - Math.sin(x/W*Math.PI)*30; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  for (let x=10;x<W;x+=20){ const y=H*0.20 - Math.sin(x/W*Math.PI)*30; ctx.fillStyle=`rgba(255,220,150,${0.6+0.4*Math.sin(t*3+x)})`; ctx.beginPath(); ctx.arc(x,y,2.4,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,220,150,.12)'; ctx.beginPath(); ctx.arc(x,y,6,0,7); ctx.fill(); }

  // garden ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#1a3020'); gr.addColorStop(1,'#0f1e14');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  // a lantern-lit stone path down the middle (kept dark/low so pet reads)
  ctx.fillStyle='#2a3a32'; ctx.beginPath(); ctx.moveTo(W*0.5-14,groundY); ctx.lineTo(W*0.5+14,groundY); ctx.lineTo(W*0.5+40,H); ctx.lineTo(W*0.5-40,H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=1; for (let y=groundY+12;y<H;y+=14){ ctx.beginPath(); ctx.moveTo(W*0.5-14-(y-groundY)*0.22,y); ctx.lineTo(W*0.5+14+(y-groundY)*0.22,y); ctx.stroke(); }

  // glowing luminaria flowers along the beds (sides)
  function glowFlower(fx,fy,col,sc){
    ctx.strokeStyle='#25402a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(fx,fy+10*sc); ctx.lineTo(fx,fy); ctx.stroke();
    const glow=0.6+0.35*Math.sin(t*1.5+fx);
    ctx.fillStyle=col.replace('rgb','rgba').replace(')',`,${0.18*glow})`); ctx.beginPath(); ctx.arc(fx,fy,14*sc,0,7); ctx.fill();
    ctx.save(); ctx.translate(fx,fy); ctx.scale(sc,sc);
    for (let k=0;k<6;k++){ const a=k/6*6.28; ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(Math.cos(a)*5,Math.sin(a)*5,4,2.6,a,0,7); ctx.fill(); }
    ctx.fillStyle='#fff2c0'; ctx.beginPath(); ctx.arc(0,0,2.2,0,7); ctx.fill();
    ctx.restore();
  }
  glowFlower(W*0.10,groundY+14,'rgb(230,120,190)',1.3);
  glowFlower(W*0.20,groundY+30,'rgb(150,150,255)',1.0);
  glowFlower(W*0.90,groundY+14,'rgb(120,220,200)',1.3);
  glowFlower(W*0.82,groundY+32,'rgb(255,180,120)',1.0);
  glowFlower(W*0.30,groundY+8,'rgb(200,140,255)',0.7);
  glowFlower(W*0.72,groundY+8,'rgb(255,220,120)',0.7);

  // fireflies / floating glints
  for (let i=0;i<16;i++){ const fx=(i*61+ Math.sin(t*0.5+i)*20)%W; const fy=groundY-20+Math.sin(t*1.5+i)*18 - (i%4)*8;
    ctx.fillStyle=`rgba(200,255,150,${0.2+0.4*Math.abs(Math.sin(t*3+i))})`; ctx.beginPath(); ctx.arc(fx,fy,1.4,0,7); ctx.fill(); }

  // a small garden lantern on a post (left, low)
  const px=W*0.12, py=groundY+40;
  ctx.fillStyle='#241a14'; ctx.fillRect(px-2,py-40,4,40);
  ctx.fillStyle='rgba(255,200,120,.25)'; ctx.beginPath(); ctx.arc(px,py-46,16,0,7); ctx.fill();
  ctx.fillStyle=`rgba(255,205,120,${0.85+0.1*Math.sin(t*2.5)})`; roundRect(px-6,py-52,12,14,2); ctx.fill();
  ctx.fillStyle='#241a14'; ctx.fillRect(px-7,py-54,14,3);
}
registerScene('nightgarden', drawNightGarden);

/* ── MOCHI SHOP (indoor · pastel wagashi sweets) ── */
function drawMochiShop(){
  const t = sceneTime, counterY = H*0.66;

  // soft pink pastel wall
  const wall=ctx.createLinearGradient(0,0,0,counterY); wall.addColorStop(0,'#f6dbe4'); wall.addColorStop(1,'#f0c9d8');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,counterY);
  // gentle polka pattern
  ctx.fillStyle='rgba(255,255,255,.35)'; for (let y=20;y<counterY;y+=26){ for (let x=((y/26|0)%2)*13; x<W; x+=26){ ctx.beginPath(); ctx.arc(x,y,2.4,0,7); ctx.fill(); } }

  // fabric banner sign with a little mochi emblem
  ctx.fillStyle='#c85a7a'; roundRect(W*0.32,H*0.06,W*0.36,26,4); ctx.fill();
  ctx.fillStyle='#fff2f6'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.06+13,10,7,0,0,7); ctx.fill();
  ctx.fillStyle='#e2607a'; ctx.beginPath(); ctx.arc(W*0.5,H*0.06+13,3,0,7); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(W*0.40,H*0.06+13); ctx.lineTo(W*0.44,H*0.06+13); ctx.moveTo(W*0.56,H*0.06+13); ctx.lineTo(W*0.60,H*0.06+13); ctx.stroke();
  // little bobbing paper garland
  for (let i=0;i<9;i++){ const gx=i*(W/8); ctx.fillStyle=['#f2a0b8','#f2d0a0','#a0d8c0','#c0b0e0'][i%4];
    ctx.beginPath(); ctx.moveTo(gx,H*0.14); ctx.lineTo(gx+8,H*0.14); ctx.lineTo(gx+4,H*0.14+8+Math.sin(t*2+i)*1.5); ctx.closePath(); ctx.fill(); }

  // wall shelf with jars of colored mochi
  ctx.fillStyle='#c89a6a'; ctx.fillRect(W*0.08,H*0.30,W*0.84,6);
  for (let i=0;i<5;i++){ const jx=W*0.16+i*W*0.16;
    ctx.fillStyle='rgba(255,255,255,.5)'; roundRect(jx-11,H*0.30-24,22,24,4); ctx.fill();
    const mc=['#f2a0b8','#a0d8b0','#f2e2a0','#c0b0e0','#f2c0a0'][i];
    for (let k=0;k<4;k++){ ctx.fillStyle=mc; ctx.beginPath(); ctx.arc(jx-6+(k%2)*12, H*0.30-6-(k>1?8:0), 4,0,7); ctx.fill(); }
    ctx.fillStyle='#b07a4a'; ctx.fillRect(jx-11,H*0.30-28,22,4); }

  // wood display counter
  const cnt=ctx.createLinearGradient(0,counterY,0,H); cnt.addColorStop(0,'#dcbf94'); cnt.addColorStop(1,'#c0a06e');
  ctx.fillStyle=cnt; ctx.fillRect(0,counterY,W,H-counterY);
  ctx.fillStyle='rgba(255,250,230,.2)'; ctx.fillRect(0,counterY,W,4);
  // glass case front
  ctx.fillStyle='rgba(200,230,240,.18)'; ctx.fillRect(0,counterY,W,H*0.16);
  ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=1; ctx.strokeRect(2,counterY+2,W-4,H*0.16-2);

  // trays of mochi/wagashi in the case (sides, leaving center a bit open)
  function mochi(mx,my,col,top){ ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(mx,my,8,6,0,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(mx-2,my-2,3,2,0,0,7); ctx.fill();
    if (top==='dot'){ ctx.fillStyle='#e2607a'; ctx.beginPath(); ctx.arc(mx,my-1,2,0,7); ctx.fill(); }
    else if (top==='leaf'){ ctx.fillStyle='#5a9a4a'; ctx.beginPath(); ctx.ellipse(mx,my-4,3,1.6,0.5,0,7); ctx.fill(); } }
  function tray(tx,cols){ ctx.fillStyle='#6a4a2e'; roundRect(tx-30,counterY+22,60,18,3); ctx.fill();
    for (let i=0;i<3;i++){ for (let j=0;j<2;j++){ mochi(tx-18+i*18, counterY+28+j*8, cols[(i+j)%cols.length], ['dot','leaf','none'][(i+j)%3]); } } }
  tray(W*0.20,['#f2a0b8','#a0d8b0','#f2e2a0']);
  tray(W*0.80,['#c0b0e0','#f2c0a0','#a0c8e0']);

  // a dango skewer standing in a small cup (center-back, high)
  const dx=W*0.5, dy=counterY+8;
  ctx.strokeStyle='#c8a060'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(dx,dy+18); ctx.lineTo(dx,dy-14); ctx.stroke();
  for (let k=0;k<3;k++){ ctx.fillStyle=['#f2e2c0','#c8e0b0','#f2b8c8'][k]; ctx.beginPath(); ctx.arc(dx,dy-10+k*10,5,0,7); ctx.fill(); }
}
registerScene('mochishop', drawMochiShop);

/* ── AQUARIUM TUNNEL (indoor · walk-through glass tunnel) ── */
function drawAquariumTunnel(){
  const t = sceneTime, floorY = H*0.78;

  // deep blue water all around (fills whole canvas)
  const water=ctx.createLinearGradient(0,0,0,H); water.addColorStop(0,'#0a3a5a'); water.addColorStop(0.5,'#13567e'); water.addColorStop(1,'#0a2f48');
  ctx.fillStyle=water; ctx.fillRect(0,0,W,H);

  // arched glass tunnel framing — concentric arches receding to a bright end
  for (let i=6;i>=0;i--){ const s=i/6; const aw=W*0.5*(0.3+s*0.9), ah=H*0.46*(0.3+s*0.9); const ay=H*0.42;
    ctx.strokeStyle=`rgba(200,235,255,${0.10+0.06*(1-s)})`; ctx.lineWidth=2+ (1-s)*2;
    ctx.beginPath(); ctx.ellipse(W*0.5,ay,aw,ah,0,Math.PI,0); ctx.stroke();
    // side rails down from arch ends
    ctx.beginPath(); ctx.moveTo(W*0.5-aw,ay); ctx.lineTo(W*0.5-aw,floorY); ctx.moveTo(W*0.5+aw,ay); ctx.lineTo(W*0.5+aw,floorY); ctx.stroke(); }
  // bright far end of tunnel
  const endg=ctx.createRadialGradient(W*0.5,H*0.40,4,W*0.5,H*0.40,60); endg.addColorStop(0,'rgba(180,240,255,.4)'); endg.addColorStop(1,'rgba(180,240,255,0)');
  ctx.fillStyle=endg; ctx.fillRect(0,0,W,H);

  // wavering caustic light from the surface
  ctx.strokeStyle='rgba(150,220,255,.12)'; ctx.lineWidth=2;
  for (let i=0;i<6;i++){ ctx.beginPath(); for (let x=0;x<=W;x+=8){ const y=20+i*14+Math.sin(x*0.05+t*1.5+i)*5; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke(); }

  // rising bubbles
  for (let i=0;i<20;i++){ const bx=(i*61+9)%W; const by=(H - ((t*18+i*40)%H)); const br=1+ (i%3);
    ctx.fillStyle='rgba(220,245,255,.25)'; ctx.beginPath(); ctx.arc(bx,by,br,0,7); ctx.fill(); }

  // swimming fish (school + a couple big ones)
  function fish(fx,fy,sc,col,dir){ ctx.save(); ctx.translate(fx,fy); ctx.scale(dir*sc,sc);
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(0,0,10,5,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(-16,-5); ctx.lineTo(-16,5); ctx.closePath(); ctx.fill(); // tail
    ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(5,-1,1.4,0,7); ctx.fill();
    ctx.restore(); }
  for (let i=0;i<6;i++){ const fx=((t*24+i*40)%(W+60))-30; const fy=H*0.18+i*10+Math.sin(t*2+i)*6; fish(fx,fy,0.7,'#f2a83a',1); }
  for (let i=0;i<5;i++){ const fx=W+30-((t*20+i*50)%(W+60)); const fy=H*0.30+i*8+Math.sin(t*1.7+i)*5; fish(fx,fy,0.6,'#5ad0d0',-1); }
  fish((t*16)%(W+80)-40, H*0.24, 1.4, '#e2604a', 1);
  // a drifting jellyfish
  const jx=W*0.24, jy=H*0.16+Math.sin(t*0.8)*10;
  ctx.fillStyle='rgba(220,160,220,.55)'; ctx.beginPath(); ctx.arc(jx,jy,10,Math.PI,0); ctx.fill();
  ctx.strokeStyle='rgba(220,160,220,.4)'; ctx.lineWidth=1.5; for (let k=-3;k<=3;k++){ ctx.beginPath(); ctx.moveTo(jx+k*2.4,jy); ctx.quadraticCurveTo(jx+k*2.4+Math.sin(t*2+k)*3,jy+12,jx+k*2.4,jy+20); ctx.stroke(); }

  // sandy tunnel floor + a few plants/coral at the base sides
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#3a5a6a'); fl.addColorStop(1,'#243c48');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(0,floorY,W,4);
  // seaweed (sides)
  ctx.strokeStyle='#2f7a5a'; ctx.lineWidth=3;
  for (const sx of [W*0.08,W*0.14,W*0.88,W*0.93]){ ctx.beginPath(); ctx.moveTo(sx,H); for (let k=0;k<=6;k++){ const yy=H-k*8; const xx=sx+Math.sin(t*1.5+k*0.6+sx)*5; ctx.lineTo(xx,yy);} ctx.stroke(); }
  // coral clumps
  ctx.fillStyle='#e2607a'; ctx.beginPath(); ctx.arc(W*0.10,floorY+10,6,0,7); ctx.arc(W*0.90,floorY+12,7,0,7); ctx.fill();
}
registerScene('aquariumtunnel', drawAquariumTunnel);

/* ── STARRY MEADOW (outdoor · night field under the milky way) ── */
function drawStarryMeadow(){
  const t = sceneTime, groundY = H*0.66;

  // deep night sky with gradient
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#0a0e26'); sky.addColorStop(0.6,'#1a1a44'); sky.addColorStop(1,'#3a2a54');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // milky way band (diagonal soft glow)
  ctx.save(); ctx.translate(W*0.5,groundY*0.4); ctx.rotate(-0.5);
  const mw=ctx.createLinearGradient(0,-16,0,16); mw.addColorStop(0,'rgba(180,190,255,0)'); mw.addColorStop(0.5,'rgba(190,200,255,.14)'); mw.addColorStop(1,'rgba(180,190,255,0)');
  ctx.fillStyle=mw; ctx.fillRect(-260,-16,520,32); ctx.restore();
  // dense stars, some twinkling
  for (let i=0;i<110;i++){ const sx=(i*57+7)%W, sy=(i*89+3)%(groundY*0.95); const tw=0.3+0.5*Math.abs(Math.sin(t*1.5+i*0.7));
    ctx.fillStyle=`rgba(255,255,${230+((i*13)%25)},${tw})`; const r=(i%17===0)?1.6:0.9; ctx.fillRect(sx,sy,r,r); }
  // a slow shooting star
  const shp=(t*0.4)%6; if (shp<1){ const sx=W*0.2+shp*W*0.6, sy=H*0.10+shp*40;
    ctx.strokeStyle=`rgba(255,255,255,${1-shp})`; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx-22,sy-9); ctx.stroke(); }
  // low crescent moon
  ctx.fillStyle='#f2ecc8'; ctx.beginPath(); ctx.arc(W*0.16,H*0.14,13,0,7); ctx.fill();
  ctx.fillStyle='#1a1a44'; ctx.beginPath(); ctx.arc(W*0.20,H*0.12,12,0,7); ctx.fill();

  // rolling meadow silhouette
  ctx.fillStyle='#16241a'; ctx.beginPath(); ctx.moveTo(0,groundY); for (let x=0;x<=W;x+=16){ ctx.lineTo(x,groundY-14-10*Math.sin(x*0.02+1)); } ctx.lineTo(W,groundY); ctx.fill();
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#1e3222'); gr.addColorStop(1,'#101c12');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);

  // grass tufts catching starlight (sides)
  ctx.strokeStyle='rgba(120,150,110,.5)'; ctx.lineWidth=1;
  for (let i=0;i<70;i++){ const gx=(i*53+9)%W; const gy=groundY+8+((i*37+7)%(H-groundY-8)); ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+Math.sin(t+i)*2,gy-6); ctx.stroke(); }

  // fireflies/glow specks drifting over the field
  for (let i=0;i<18;i++){ const fx=(i*61+ Math.sin(t*0.5+i)*22)%W; const fy=groundY-10+Math.sin(t*1.3+i)*16 - (i%5)*7;
    ctx.fillStyle=`rgba(220,255,170,${0.15+0.4*Math.abs(Math.sin(t*3+i))})`; ctx.beginPath(); ctx.arc(fx,fy,1.4,0,7); ctx.fill(); }

  // a cozy lantern + folded blanket in the foreground-left (low, off-center)
  const lx=W*0.12, ly=H*0.90;
  ctx.fillStyle='rgba(255,200,120,.2)'; ctx.beginPath(); ctx.arc(lx,ly-6,18,0,7); ctx.fill();
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(lx-6,ly-2,12,3); ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx,ly-18); ctx.lineTo(lx,ly-12); ctx.stroke();
  ctx.fillStyle=`rgba(255,205,120,${0.85+0.1*Math.sin(t*2.5)})`; roundRect(lx-6,ly-14,12,12,3); ctx.fill();
  // telescope silhouette (right, low)
  const tx=W*0.86, ty=H*0.92;
  ctx.strokeStyle='#2a2a34'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(tx-8,ty); ctx.lineTo(tx,ty-14); ctx.moveTo(tx+8,ty); ctx.lineTo(tx,ty-14); ctx.moveTo(tx,ty); ctx.lineTo(tx,ty-14); ctx.stroke();
  ctx.save(); ctx.translate(tx,ty-16); ctx.rotate(-0.6); ctx.fillStyle='#3a3a48'; roundRect(-3,-12,6,20,2); ctx.fill(); ctx.fillStyle='#5a5a68'; ctx.fillRect(-4,-14,8,4); ctx.restore();
}
registerScene('starrymeadow', drawStarryMeadow);

/* ── HARBOR AT NIGHT (outdoor · boats & lit quay) ── */
function drawHarborNight(){
  const t = sceneTime, waterY = H*0.52, quayY = H*0.72;

  // dusk-night sky
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#13203e'); sky.addColorStop(0.6,'#2a3358'); sky.addColorStop(1,'#5a4a5e');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  for (let i=0;i<34;i++){ const sx=(i*71+7)%W, sy=(i*29+3)%(waterY*0.7); ctx.fillStyle=`rgba(230,238,255,${0.2+0.3*Math.abs(Math.sin(t*1.2+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }

  // far shore town with warm lit windows
  ctx.fillStyle='#0e1424';
  let bx=0,s2=29; const rr=()=>{ s2=(s2*9301+49297)%233280; return s2/233280; };
  while (bx<W){ const bw=20+Math.floor(rr()*22), bh=22+Math.floor(rr()*34); ctx.fillStyle='#0e1424'; ctx.fillRect(bx,waterY-bh,bw,bh);
    for (let wy=waterY-bh+5; wy<waterY-4; wy+=8) for (let wx=bx+4; wx<bx+bw-4; wx+=7){ if (rr()>0.55){ ctx.fillStyle=`rgba(255,205,120,${0.5+0.4*rr()})`; ctx.fillRect(wx,wy,2.5,3); } }
    bx+=bw+2; }
  // small lighthouse on the far right point
  ctx.fillStyle='#e8e2d4'; ctx.fillRect(W*0.92,waterY-46,8,46); ctx.fillStyle='#c0392b'; ctx.fillRect(W*0.92,waterY-38,8,6); ctx.fillRect(W*0.92,waterY-24,8,6);
  ctx.fillStyle=`rgba(255,240,180,${0.5+0.5*Math.sin(t*2)})`; ctx.beginPath(); ctx.arc(W*0.94,waterY-50,3,0,7); ctx.fill();

  // harbor water with reflected light columns
  const wat=ctx.createLinearGradient(0,waterY,0,quayY); wat.addColorStop(0,'#16294a'); wat.addColorStop(1,'#0c1a30');
  ctx.fillStyle=wat; ctx.fillRect(0,waterY,W,quayY-waterY);
  for (const [rx,rc] of [[W*0.2,'255,205,120'],[W*0.5,'200,220,255'],[W*0.94,'255,240,180']]){
    for (let y=waterY; y<quayY; y+=3){ const p=(y-waterY)/(quayY-waterY); const wob=Math.sin(y*0.5+t*2)*(2+p*8);
      ctx.fillStyle=`rgba(${rc},${0.18*(1-p)})`; ctx.fillRect(rx-3+wob,y,6+p*4,2); } }
  ctx.strokeStyle='rgba(150,180,220,.12)'; ctx.lineWidth=1; for (let y=waterY+6;y<quayY;y+=9){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.06+t*1.4+y)*1.5; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }

  // moored sailboats bobbing
  function boat(bx0,scale,hull){ const bob=Math.sin(t*1.1+bx0)*2; ctx.save(); ctx.translate(bx0,waterY+10+bob); ctx.scale(scale,scale);
    ctx.fillStyle=hull; ctx.beginPath(); ctx.moveTo(-20,0); ctx.quadraticCurveTo(0,12,20,0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#cfd6e0'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-30); ctx.stroke();
    ctx.fillStyle='rgba(240,244,250,.9)'; ctx.beginPath(); ctx.moveTo(0,-28); ctx.lineTo(0,-4); ctx.lineTo(14,-6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,-28); ctx.lineTo(0,-4); ctx.lineTo(-12,-6); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,210,130,.9)'; ctx.beginPath(); ctx.arc(0,-2,1.6,0,7); ctx.fill(); ctx.restore(); }
  boat(W*0.24,1.0,'#3a5a8a'); boat(W*0.7,0.8,'#7a3a4a'); boat(W*0.5,0.6,'#3a6a5a');

  // stone quay in foreground with lampposts and bollards
  const quay=ctx.createLinearGradient(0,quayY,0,H); quay.addColorStop(0,'#4a4a52'); quay.addColorStop(1,'#2e2e36');
  ctx.fillStyle=quay; ctx.fillRect(0,quayY,W,H-quayY);
  ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; for (let x=0;x<W;x+=30){ ctx.beginPath(); ctx.moveTo(x,quayY); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y=quayY+10;y<H;y+=12){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // edge highlight
  ctx.fillStyle='rgba(255,235,200,.10)'; ctx.fillRect(0,quayY,W,3);
  // lampposts (sides, tall)
  function lamppost(px){ ctx.fillStyle='#20202a'; ctx.fillRect(px-2,quayY-56,4,56); ctx.fillRect(px-6,quayY-58,12,5);
    ctx.fillStyle='rgba(255,210,130,.22)'; ctx.beginPath(); ctx.arc(px,quayY-62,14,0,7); ctx.fill();
    ctx.fillStyle=`rgba(255,215,135,${0.85+0.1*Math.sin(t*2.5+px)})`; roundRect(px-5,quayY-68,10,12,3); ctx.fill(); }
  lamppost(W*0.10); lamppost(W*0.90);
  // bollards with rope
  ctx.fillStyle='#1a1a22'; ctx.beginPath(); ctx.arc(W*0.30,quayY-4,5,Math.PI,0); ctx.fill(); ctx.fillRect(W*0.30-5,quayY-4,10,8);
  ctx.beginPath(); ctx.arc(W*0.70,quayY-4,5,Math.PI,0); ctx.fill(); ctx.fillRect(W*0.70-5,quayY-4,10,8);
  ctx.strokeStyle='#5a4a34'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(W*0.30,quayY-6); ctx.quadraticCurveTo(W*0.5,quayY+8,W*0.70,quayY-6); ctx.stroke();
}
registerScene('harbornight', drawHarborNight);

/* ── GIFT WRAP SHOP (indoor · cozy paper & ribbon boutique) ── */
function drawGiftWrapShop(){
  const t = sceneTime, floorY = H*0.72;

  // warm cream wall with subtle stripes
  ctx.fillStyle='#f3e8d8'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='rgba(210,180,150,.18)'; for (let x=0;x<W;x+=18){ ctx.fillRect(x,0,9,floorY); }

  // bunting of little triangular flags near ceiling
  ctx.strokeStyle='rgba(150,110,90,.5)'; ctx.lineWidth=1; ctx.beginPath();
  for (let x=0;x<=W;x+=8){ const y=14+Math.sin(x*0.05)*6; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  for (let x=6;x<W;x+=18){ const y=14+Math.sin(x*0.05)*6; ctx.fillStyle=['#e26f8a','#e0b040','#6fbfe0','#7ac86a'][(x/18|0)%4]; ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+5,y); ctx.lineTo(x,y+9); ctx.closePath(); ctx.fill(); }

  // wall rack of vertical wrapping-paper rolls (patterned)
  const rackY=H*0.20;
  ctx.fillStyle='#c9a06a'; ctx.fillRect(W*0.06,rackY-6,W*0.5,6); ctx.fillRect(W*0.06,rackY+56,W*0.5,6);
  const rollPat=['dots','stripes','stars','check','dots','stripes'];
  const rollCol=['#e26f8a','#6fbfe0','#e0b040','#7ac86a','#c07ae0','#e08a5a'];
  for (let i=0;i<6;i++){ const rx=W*0.10+i*W*0.078; ctx.fillStyle=rollCol[i]; roundRect(rx-6,rackY,12,56,3); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.55)';
    if (rollPat[i]==='dots'){ for (let k=0;k<8;k++){ ctx.beginPath(); ctx.arc(rx-3+(k%2)*6, rackY+6+((k/2)|0)*14, 1.6,0,7); ctx.fill(); } }
    else if (rollPat[i]==='stripes'){ for (let k=0;k<7;k++){ ctx.fillRect(rx-6,rackY+4+k*8,12,2); } }
    else if (rollPat[i]==='stars'){ for (let k=0;k<5;k++){ ctx.fillRect(rx-2,rackY+8+k*11,3,3); } }
    else { for (let k=0;k<24;k++){ if ((k+((k/4)|0))%2===0){ ctx.fillRect(rx-6+(k%4)*3, rackY+4+((k/4)|0)*9, 3,3); } } }
    // paper roll open end (top)
    ctx.fillStyle='rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(rx,rackY,6,2.4,0,0,7); ctx.fill(); }

  // spools of ribbon on a wall peg (right)
  for (let i=0;i<3;i++){ const sx=W*0.72+ (i%2)*W*0.14, sy=H*0.16+((i/2)|0)*0.0 + i*H*0.10;
    ctx.fillStyle=['#d04a6a','#4aa0d0','#e0b040'][i]; ctx.beginPath(); ctx.arc(sx,sy,12,0,7); ctx.fill();
    ctx.fillStyle='#f3e8d8'; ctx.beginPath(); ctx.arc(sx,sy,4,0,7); ctx.fill();
    // dangling ribbon
    ctx.strokeStyle=['#d04a6a','#4aa0d0','#e0b040'][i]; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(sx,sy+12); for (let k=0;k<=5;k++){ ctx.lineTo(sx+Math.sin(t*1.5+k+i)*4, sy+12+k*6); } ctx.stroke(); }

  // wood counter/worktable
  const cnt=ctx.createLinearGradient(0,floorY,0,H); cnt.addColorStop(0,'#b98a58'); cnt.addColorStop(1,'#966b3e');
  ctx.fillStyle=cnt; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='rgba(255,245,225,.15)'; ctx.fillRect(0,floorY,W,4);
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; for (let x=0;x<W;x+=32){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-8,H); ctx.stroke(); }

  // wrapped present with a bow on the counter (left, low, off-center)
  function present(px,py,box,rib){ ctx.fillStyle=box; roundRect(px-18,py-18,36,18,2); ctx.fill();
    ctx.fillStyle=rib; ctx.fillRect(px-3,py-18,6,18); ctx.fillRect(px-18,py-11,36,5);
    // bow
    ctx.fillStyle=rib; ctx.beginPath(); ctx.ellipse(px-6,py-20,6,4,-0.5,0,7); ctx.ellipse(px+6,py-20,6,4,0.5,0,7); ctx.fill();
    ctx.beginPath(); ctx.arc(px,py-20,2.4,0,7); ctx.fill(); }
  present(W*0.16,floorY+22,'#e26f8a','#f2e2a0');
  present(W*0.30,floorY+26,'#6fbfe0','#d04a6a');
  // a pair of scissors + ribbon curl on the right
  ctx.strokeStyle='#8a8a92'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.8,floorY+18); ctx.lineTo(W*0.86,floorY+26); ctx.moveTo(W*0.8,floorY+26); ctx.lineTo(W*0.86,floorY+18); ctx.stroke();
  ctx.fillStyle='#c04a6a'; ctx.beginPath(); ctx.arc(W*0.79,floorY+16,2.4,0,7); ctx.arc(W*0.79,floorY+28,2.4,0,7); ctx.fill();
  ctx.strokeStyle='#e0b040'; ctx.lineWidth=2; ctx.beginPath(); for (let k=0;k<=8;k++){ const cx=W*0.7+k*3; ctx.lineTo(cx, floorY+30+Math.sin(k*1.2)*3);} ctx.stroke();
}
registerScene('giftwrapshop', drawGiftWrapShop);

/* ── GINGERBREAD KITCHEN (indoor · holiday baking) ── */
function drawGingerbreadKitchen(){
  const t = sceneTime, counterY = H*0.66;

  // warm spiced wall
  const wall=ctx.createLinearGradient(0,0,0,counterY); wall.addColorStop(0,'#b5723e'); wall.addColorStop(1,'#8a5228');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,counterY);
  ctx.strokeStyle='rgba(0,0,0,.14)'; ctx.lineWidth=1; for (let y=18;y<counterY;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // checkered wall trim near ceiling
  for (let x=0;x<W;x+=14){ ctx.fillStyle=(x/14|0)%2?'#e8c9a0':'#a05a2e'; ctx.fillRect(x,10,14,10); }

  // window (left) showing a snowy night
  const wx=W*0.10, wy=H*0.16, ww=W*0.28, wh=H*0.30;
  ctx.fillStyle='#1e2a42'; ctx.fillRect(wx,wy,ww,wh);
  for (let i=0;i<16;i++){ const sx=wx+((i*31+t*6)%ww), sy=wy+((i*23+t*9)%wh); ctx.fillStyle='rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(sx,sy,1.3,0,7); ctx.fill(); }
  ctx.fillStyle='#e8eef6'; ctx.fillRect(wx,wy+wh-8,ww,8);
  ctx.strokeStyle='#efe0c8'; ctx.lineWidth=4; ctx.strokeRect(wx,wy,ww,wh); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(wx+ww/2,wy); ctx.lineTo(wx+ww/2,wy+wh); ctx.moveTo(wx,wy+wh/2); ctx.lineTo(wx+ww,wy+wh/2); ctx.stroke();

  // hanging utensils + garland (center-right)
  ctx.strokeStyle='#5a3a20'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.5,H*0.10); ctx.quadraticCurveTo(W*0.72,H*0.16,W*0.94,H*0.10); ctx.stroke();
  ctx.fillStyle='#3a6a3a'; for (let k=0;k<8;k++){ const p=k/7; const gx=W*0.5+p*(W*0.44); const gy=H*0.10+Math.sin(p*Math.PI)*6*1.0+ (0.16-0.10)*H*Math.sin(p*Math.PI); ctx.beginPath(); ctx.arc(gx,gy,4,0,7); ctx.fill(); ctx.fillStyle=k%2?'#c0392b':'#3a6a3a'; }
  ctx.fillStyle='#c9c9d0'; for (const [ux,uy] of [[W*0.58,H*0.18],[W*0.68,H*0.20],[W*0.80,H*0.19]]){ ctx.fillRect(ux-1,uy,2,16); ctx.beginPath(); ctx.arc(ux,uy+18,4,0,Math.PI); ctx.fill(); }

  // wood counter
  const cnt=ctx.createLinearGradient(0,counterY,0,H); cnt.addColorStop(0,'#d8b483'); cnt.addColorStop(1,'#b8945f');
  ctx.fillStyle=cnt; ctx.fillRect(0,counterY,W,H-counterY);
  ctx.fillStyle='rgba(255,250,230,.18)'; ctx.fillRect(0,counterY,W,4);
  // flour dusting
  ctx.fillStyle='rgba(255,255,255,.3)'; for (let i=0;i<30;i++){ const fx=(i*67+11)%W, fy=counterY+8+((i*41+7)%(H-counterY-8)); ctx.fillRect(fx,fy,2,2); }

  // gingerbread house centerpiece (center-back, high so pet floor clear)
  const hx=W*0.5, hy=counterY+8;
  ctx.fillStyle='#a86a34'; ctx.fillRect(hx-20,hy-24,40,24);
  ctx.beginPath(); ctx.moveTo(hx-24,hy-24); ctx.lineTo(hx,hy-42); ctx.lineTo(hx+24,hy-24); ctx.closePath(); ctx.fill();
  // icing trim
  ctx.strokeStyle='#fff6ee'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(hx-24,hy-24); ctx.lineTo(hx,hy-42); ctx.lineTo(hx+24,hy-24); ctx.stroke();
  for (let k=-4;k<=4;k++){ ctx.beginPath(); ctx.arc(hx+k*5,hy-24,1.4,0,7); ctx.fill(); }
  ctx.fillStyle='#fff6ee'; ctx.beginPath(); ctx.moveTo(hx-20,hy); for (let k=0;k<=8;k++){ ctx.lineTo(hx-20+k*5,hy-2-(k%2)*2);} ctx.lineTo(hx+20,hy); ctx.fill();
  // door + gumdrops
  ctx.fillStyle='#6a3a1a'; ctx.fillRect(hx-4,hy-12,8,12);
  ctx.fillStyle='#e2607a'; ctx.beginPath(); ctx.arc(hx-12,hy-8,2.4,0,7); ctx.fill(); ctx.fillStyle='#5ad08a'; ctx.beginPath(); ctx.arc(hx+12,hy-8,2.4,0,7); ctx.fill();

  // cooling rack of gingerbread people (left, low)
  ctx.fillStyle='#c9c9d0'; ctx.fillRect(W*0.14-22,counterY+30,44,4); for (let g=0;g<3;g++){ const gx=W*0.14-14+g*14, gy=counterY+26;
    ctx.fillStyle='#a86a34'; ctx.beginPath(); ctx.arc(gx,gy-6,3.5,0,7); ctx.fill(); roundRect(gx-3,gy-3,6,8,2); ctx.fill();
    ctx.fillRect(gx-6,gy-2,12,2.4); ctx.fillRect(gx-2.5,gy+5,2.4,4); ctx.fillRect(gx,gy+5,2.4,4);
    ctx.fillStyle='#fff6ee'; ctx.fillRect(gx-2,gy-1,4,1); }

  // icing piping bag + mixing bowl (right, low)
  const bx=W*0.84, by=counterY+30;
  ctx.fillStyle='#e8e2d4'; ctx.beginPath(); ctx.arc(bx,by,12,0,Math.PI); ctx.fill(); ctx.fillStyle='#efe6d8'; ctx.beginPath(); ctx.ellipse(bx,by,12,4,0,0,7); ctx.fill();
  ctx.fillStyle='#c9a24a'; ctx.beginPath(); ctx.ellipse(bx,by,8,2.6,0,0,7); ctx.fill();
  ctx.fillStyle='#f2c04a'; ctx.beginPath(); ctx.moveTo(bx-16,by-16); ctx.lineTo(bx-8,by-6); ctx.lineTo(bx-20,by-8); ctx.closePath(); ctx.fill();
}
registerScene('gingerbreadkitchen', drawGingerbreadKitchen);

/* ── SUNFLOWER MAZE (outdoor · sunny towering blooms) ── */
function drawSunflowerMaze(){
  const t = sceneTime, pathY = H*0.62;

  // bright summer sky
  const sky=ctx.createLinearGradient(0,0,0,pathY); sky.addColorStop(0,'#5fb0ea'); sky.addColorStop(1,'#cbe9c0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,pathY);
  ctx.fillStyle='#fff6b0'; ctx.beginPath(); ctx.arc(W*0.5,H*0.12,22,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,246,176,.3)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.12,34,0,7); ctx.fill();
  drawCloud(W*0.18+Math.sin(t*0.1)*8,H*0.10,0.6); drawCloud(W*0.82+Math.sin(t*0.08+2)*6,H*0.16,0.5);

  // distant sunflower tops on the horizon (a green-gold band)
  ctx.fillStyle='#6a8a2e'; ctx.fillRect(0,pathY-30,W,34);
  for (let x=6;x<W;x+=16){ ctx.fillStyle='#e0b020'; ctx.beginPath(); ctx.arc(x,pathY-30,4,0,7); ctx.fill(); ctx.fillStyle='#8a5a1a'; ctx.beginPath(); ctx.arc(x,pathY-30,1.6,0,7); ctx.fill(); }

  // dirt path receding up the middle (kept for pet)
  const path=ctx.createLinearGradient(0,pathY,0,H); path.addColorStop(0,'#c2a06a'); path.addColorStop(1,'#9a7844');
  ctx.fillStyle=path; ctx.beginPath(); ctx.moveTo(W*0.5-16,pathY); ctx.lineTo(W*0.5+16,pathY); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(120,95,60,.25)'; for (let i=0;i<30;i++){ const px=(i*67+11)%W, py=pathY+10+((i*43+7)%(H-pathY-10)); ctx.fillRect(px,py,2,2); }

  // tall sunflower walls on both sides (foreground, big)
  function sunflower(sx,sy,sc,sway){ const a=Math.sin(t*1.2+sway)*0.08;
    ctx.save(); ctx.translate(sx,sy); ctx.rotate(a); ctx.scale(sc,sc);
    // stem + leaves
    ctx.strokeStyle='#3a7a2a'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(0,60); ctx.lineTo(0,0); ctx.stroke();
    ctx.fillStyle='#4a8a2e'; ctx.beginPath(); ctx.ellipse(-8,34,9,4,-0.5,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(8,44,9,4,0.5,0,7); ctx.fill();
    // petals
    ctx.fillStyle='#f2b81e'; for (let k=0;k<14;k++){ const pa=k/14*6.28; ctx.save(); ctx.rotate(pa); ctx.beginPath(); ctx.ellipse(0,-14,4,9,0,0,7); ctx.fill(); ctx.restore(); }
    // center
    ctx.fillStyle='#7a4a1a'; ctx.beginPath(); ctx.arc(0,0,9,0,7); ctx.fill();
    ctx.fillStyle='#5a3410'; for (let k=0;k<12;k++){ const pa=k/12*6.28; ctx.beginPath(); ctx.arc(Math.cos(pa)*5,Math.sin(pa)*5,1.2,0,7); ctx.fill(); }
    ctx.restore();
  }
  // left wall (three, varying)
  sunflower(W*0.10,pathY+40,1.5,0); sunflower(W*0.24,pathY+20,1.1,1); sunflower(W*0.02,pathY+70,1.7,2);
  // right wall
  sunflower(W*0.90,pathY+40,1.5,3); sunflower(W*0.76,pathY+22,1.1,4); sunflower(W*0.98,pathY+72,1.7,5);

  // busy bees near the blooms
  for (let i=0;i<4;i++){ const bx=W*0.2+i*W*0.18+Math.sin(t*3+i)*14; const by=pathY-6+Math.sin(t*4+i*2)*10;
    ctx.fillStyle='#e0a020'; ctx.beginPath(); ctx.ellipse(bx,by,2.6,1.8,0,0,7); ctx.fill(); ctx.fillStyle='#333'; ctx.fillRect(bx-1,by-1.4,1,2.8);
    ctx.fillStyle='rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(bx,by-2,2,1,0,0,7); ctx.fill(); }
  // a wooden signpost at the path mouth (left, low)
  ctx.fillStyle='#6a4a2e'; ctx.fillRect(W*0.14-2,H*0.80,4,H*0.14); ctx.fillStyle='#8a6038'; roundRect(W*0.14-16,H*0.80,20,10,2); ctx.fill();
  ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.14-12,H*0.80+5); ctx.lineTo(W*0.14+0,H*0.80+5); ctx.stroke();
}
registerScene('sunflowermaze', drawSunflowerMaze);

/* ── JELLYFISH TANK (indoor · dark glowing exhibit) ── */
function drawJellyfishTank(){
  const t = sceneTime, floorY = H*0.82;

  // dark exhibit room
  ctx.fillStyle='#080a14'; ctx.fillRect(0,0,W,H);

  // big cylindrical tank glowing (fills most of the canvas)
  const tankX=W*0.5, tankTop=H*0.06, tankBot=floorY-4, tankW=W*0.86;
  const tg=ctx.createLinearGradient(0,tankTop,0,tankBot); tg.addColorStop(0,'#123a6a'); tg.addColorStop(0.5,'#1a5a8a'); tg.addColorStop(1,'#0e2a4a');
  ctx.fillStyle=tg; roundRect(tankX-tankW/2,tankTop,tankW,tankBot-tankTop,14); ctx.fill();
  // colored ambient light shift (blue↔violet)
  const hue=200+40*Math.sin(t*0.4);
  ctx.fillStyle=`hsla(${hue},70%,50%,0.18)`; roundRect(tankX-tankW/2,tankTop,tankW,tankBot-tankTop,14); ctx.fill();

  // clip drawings to inside the tank
  ctx.save(); roundRect(tankX-tankW/2+3,tankTop+3,tankW-6,tankBot-tankTop-6,12); ctx.clip();
  // shafts of light from the top
  ctx.fillStyle='rgba(180,230,255,.06)'; for (let i=0;i<4;i++){ ctx.save(); ctx.translate(tankX-tankW*0.3+i*tankW*0.2,tankTop); ctx.rotate(0.12); ctx.fillRect(0,0,20,tankBot-tankTop); ctx.restore(); }
  // rising bubbles
  for (let i=0;i<22;i++){ const bx=tankX-tankW/2+ ((i*53+9)%tankW); const by=tankBot-((t*16+i*33)%(tankBot-tankTop)); ctx.fillStyle='rgba(200,240,255,.2)'; ctx.beginPath(); ctx.arc(bx,by,1+ (i%3),0,7); ctx.fill(); }
  // drifting jellyfish (pulsing bells + tentacles)
  function jelly(jx,jy,sc,hue2){ const pulse=1+0.18*Math.sin(t*2+jx); ctx.save(); ctx.translate(jx,jy); ctx.scale(sc*pulse,sc/pulse);
    // glow
    ctx.fillStyle=`hsla(${hue2},80%,70%,0.16)`; ctx.beginPath(); ctx.arc(0,0,22,0,7); ctx.fill();
    // bell
    const bg=ctx.createLinearGradient(0,-16,0,6); bg.addColorStop(0,`hsla(${hue2},80%,78%,0.85)`); bg.addColorStop(1,`hsla(${hue2},70%,55%,0.55)`);
    ctx.fillStyle=bg; ctx.beginPath(); ctx.ellipse(0,0,15,13,0,Math.PI,0); ctx.fill();
    ctx.fillStyle=`hsla(${hue2},80%,85%,0.5)`; ctx.beginPath(); ctx.ellipse(0,-2,15,13,0,Math.PI,0.1*Math.PI); ctx.fill();
    // frilly rim
    ctx.fillStyle=`hsla(${hue2},80%,80%,0.7)`; for (let k=-3;k<=3;k++){ ctx.beginPath(); ctx.arc(k*4.5,0,2,0,Math.PI); ctx.fill(); }
    // tentacles
    ctx.strokeStyle=`hsla(${hue2},70%,75%,0.6)`; ctx.lineWidth=1.4;
    for (let k=-4;k<=4;k++){ ctx.beginPath(); ctx.moveTo(k*2.6,2); ctx.quadraticCurveTo(k*2.6+Math.sin(t*2+k)*4,20,k*2.6+Math.sin(t+k)*3,36); ctx.stroke(); }
    // oral arms (thicker)
    ctx.strokeStyle=`hsla(${hue2},75%,82%,0.7)`; ctx.lineWidth=2.4;
    for (let k=-1;k<=1;k++){ ctx.beginPath(); ctx.moveTo(k*4,2); ctx.quadraticCurveTo(k*4+Math.sin(t*1.5+k)*5,18,k*3,30); ctx.stroke(); }
    ctx.restore();
  }
  jelly(W*0.30, H*0.34+Math.sin(t*0.6)*14, 1.3, 300);
  jelly(W*0.66, H*0.50+Math.sin(t*0.5+2)*16, 1.6, 200);
  jelly(W*0.50, H*0.24+Math.sin(t*0.7+1)*10, 0.9, 260);
  jelly(W*0.20, H*0.60+Math.sin(t*0.55+3)*12, 1.0, 330);
  jelly(W*0.80, H*0.30+Math.sin(t*0.65+4)*12, 0.8, 180);
  ctx.restore();

  // tank glass frame + reflections
  ctx.strokeStyle='rgba(180,220,255,.25)'; ctx.lineWidth=3; roundRect(tankX-tankW/2,tankTop,tankW,tankBot-tankTop,14); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.06)'; roundRect(tankX-tankW/2+6,tankTop+6,10,tankBot-tankTop-12,5); ctx.fill();

  // dark reflective exhibit floor with tank glow spill
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#10141e'); fl.addColorStop(1,'#080a12');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle=`hsla(${hue},70%,50%,0.10)`; ctx.beginPath(); ctx.ellipse(W*0.5,floorY+8,tankW*0.5,10,0,0,7); ctx.fill();
}
registerScene('jellyfishtank', drawJellyfishTank);

/* ── CAVE HOT SPRING (indoor/underground · steaming rock pool) ── */
function drawCaveHotSpring(){
  const t = sceneTime, poolY = H*0.50;

  // dim warm cavern
  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#241820'); bg.addColorStop(0.5,'#332028'); bg.addColorStop(1,'#1a1016');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // rock ceiling with stalactites + a light shaft opening
  ctx.fillStyle='#1c1218'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W,0); ctx.lineTo(W,44);
  for (let x=W; x>=0; x-=26){ ctx.lineTo(x-13, 44+26*Math.abs(Math.sin(x*0.31))); ctx.lineTo(x-26,44); }
  ctx.closePath(); ctx.fill();
  // opening in the ceiling letting moonlight in
  ctx.fillStyle='rgba(180,210,255,.10)'; ctx.beginPath(); ctx.moveTo(W*0.44,0); ctx.lineTo(W*0.56,0); ctx.lineTo(W*0.66,poolY); ctx.lineTo(W*0.34,poolY); ctx.closePath(); ctx.fill();
  // a few stars visible through the gap
  for (let i=0;i<5;i++){ ctx.fillStyle='rgba(230,240,255,.8)'; ctx.fillRect(W*0.46+i*6, 4+(i%3)*4, 1.4,1.4); }

  // cave back walls (side masses)
  ctx.fillStyle='#2a1c22'; ctx.beginPath(); ctx.moveTo(0,poolY); ctx.lineTo(0,44); ctx.quadraticCurveTo(W*0.16,poolY-40,W*0.30,poolY); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W,poolY); ctx.lineTo(W,44); ctx.quadraticCurveTo(W*0.84,poolY-40,W*0.70,poolY); ctx.closePath(); ctx.fill();

  // steaming hot spring pool (turquoise, glowing)
  const pool=ctx.createLinearGradient(0,poolY,0,H); pool.addColorStop(0,'#2a8a8a'); pool.addColorStop(0.5,'#1e6a6e'); pool.addColorStop(1,'#124a50');
  ctx.fillStyle=pool; ctx.fillRect(0,poolY,W,H-poolY);
  // warm underglow
  ctx.fillStyle='rgba(120,240,220,.10)'; ctx.beginPath(); ctx.ellipse(W*0.5,poolY+30,W*0.5,26,0,0,7); ctx.fill();
  // rippling water lines
  ctx.strokeStyle='rgba(180,255,240,.18)'; ctx.lineWidth=1;
  for (let y=poolY+8;y<H;y+=9){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.06+t*1.4+y)*1.8; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }
  // moonlight reflection on the pool
  for (let y=poolY; y<H; y+=3){ const p=(y-poolY)/(H-poolY); const wob=Math.sin(y*0.4+t*2)*(3+p*8); ctx.fillStyle=`rgba(200,225,255,${0.12*(1-p)})`; ctx.fillRect(W*0.5-8+wob,y,16+p*10,2); }

  // rocky rim around the pool
  ctx.fillStyle='#3a2620'; ctx.beginPath(); ctx.moveTo(0,poolY+6); for (let x=0;x<=W;x+=14){ ctx.lineTo(x,poolY-2+Math.sin(x*0.3)*4); } ctx.lineTo(W,poolY+6); ctx.closePath(); ctx.fill();
  // scattered boulders (sides)
  ctx.fillStyle='#4a342c'; ctx.beginPath(); ctx.arc(W*0.10,poolY+2,14,0,7); ctx.arc(W*0.90,poolY+4,16,0,7); ctx.fill();
  ctx.fillStyle='#3a2620'; ctx.beginPath(); ctx.arc(W*0.20,poolY+4,9,0,7); ctx.arc(W*0.80,poolY+2,8,0,7); ctx.fill();

  // rising steam veils
  for (let i=0;i<7;i++){ const hx=(i*58+t*6)%(W+60)-30; const hy=poolY-((t*8+i*26)%150); ctx.fillStyle=`rgba(230,255,250,${0.07+0.04*Math.sin(t+i)})`; ctx.beginPath(); ctx.ellipse(hx,hy,38,14,0,0,7); ctx.fill(); }

  // a small stone lantern on the rim (left) + folded towels (right)
  const lx=W*0.12, ly=poolY-2;
  ctx.fillStyle='#5a4a44'; ctx.fillRect(lx-6,ly-16,12,14); ctx.fillRect(lx-8,ly-20,16,5);
  ctx.fillStyle=`rgba(255,200,120,${0.8+0.15*Math.sin(t*2.5)})`; ctx.fillRect(lx-3,ly-13,6,7);
  ctx.fillStyle='#3a2620'; ctx.fillRect(lx-8,ly-2,16,4);
  // towels
  ctx.fillStyle='#e8e2d4'; roundRect(W*0.84,poolY-10,22,8,2); ctx.fill(); ctx.fillStyle='#d8c8b8'; roundRect(W*0.85,poolY-16,20,7,2); ctx.fill();
}
registerScene('cavehotspring', drawCaveHotSpring);

/* ── ICE SKATING RINK (outdoor · winter evening) ── */
function drawIceRink(){
  const t = sceneTime, iceY = H*0.50;

  // twilight winter sky
  const sky=ctx.createLinearGradient(0,0,0,iceY); sky.addColorStop(0,'#2a3a6a'); sky.addColorStop(0.6,'#5a5a8a'); sky.addColorStop(1,'#b090a0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,iceY);
  // early stars + moon
  for (let i=0;i<26;i++){ const sx=(i*71+7)%W, sy=(i*29+3)%(iceY*0.6); ctx.fillStyle=`rgba(255,255,235,${0.2+0.3*Math.abs(Math.sin(t*1.2+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }
  ctx.fillStyle='#f4eecf'; ctx.beginPath(); ctx.arc(W*0.82,H*0.12,14,0,7); ctx.fill();

  // snowy evergreens behind the rink
  function pine(px,py,sc){ ctx.save(); ctx.translate(px,py); ctx.scale(sc,sc);
    ctx.fillStyle='#20402a'; for (let t2=0;t2<3;t2++){ const yy=-t2*14; ctx.beginPath(); ctx.moveTo(0,yy-22); ctx.lineTo(-14+t2*3,yy); ctx.lineTo(14-t2*3,yy); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle='rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(0,-52); ctx.lineTo(-4,-46); ctx.lineTo(4,-46); ctx.fill();
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(-2,0,4,6); ctx.restore(); }
  for (let i=0;i<7;i++){ pine(20+i*54, iceY-2, 0.8+ (i%3)*0.15); }
  // snowbank strip at horizon
  ctx.fillStyle='#e8eef6'; ctx.beginPath(); ctx.moveTo(0,iceY); for (let x=0;x<=W;x+=16){ ctx.lineTo(x,iceY-6-4*Math.sin(x*0.05)); } ctx.lineTo(W,iceY); ctx.fill();

  // string of festival lights on posts around the rink
  for (const px of [W*0.06,W*0.94]){ ctx.fillStyle='#4a3a2a'; ctx.fillRect(px-2,iceY-40,4,40); }
  ctx.strokeStyle='rgba(120,90,60,.6)'; ctx.lineWidth=1; ctx.beginPath();
  for (let x=W*0.06;x<=W*0.94;x+=8){ const y=iceY-40+Math.sin(x*0.05)*6; x===W*0.06?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  for (let x=W*0.10;x<W*0.94;x+=20){ const y=iceY-40+Math.sin(x*0.05)*6; ctx.fillStyle=['#e05a5a','#e0b040','#5ab0e0','#60c060'][(x/20|0)%4]; ctx.beginPath(); ctx.arc(x,y,2.4,0,7); ctx.fill(); }

  // the ice surface
  const ice=ctx.createLinearGradient(0,iceY,0,H); ice.addColorStop(0,'#cfe6f2'); ice.addColorStop(1,'#a8cbe0');
  ctx.fillStyle=ice; ctx.fillRect(0,iceY,W,H-iceY);
  // sheen bands
  ctx.fillStyle='rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(W*0.4,iceY+40,120,16,0,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.10)'; ctx.beginPath(); ctx.ellipse(W*0.7,iceY+90,140,20,0,0,7); ctx.fill();
  // skate-mark arcs etched in the ice
  ctx.strokeStyle='rgba(120,160,190,.4)'; ctx.lineWidth=1;
  for (let i=0;i<7;i++){ const cx=(i*61+20)%W, cy=iceY+20+(i*23)%((H-iceY)-20); ctx.beginPath(); ctx.arc(cx,cy,10+ (i%4)*6, 0.2, 2.6); ctx.stroke(); }
  // reflection of moon on ice
  for (let y=iceY; y<H; y+=3){ const p=(y-iceY)/(H-iceY); const wob=Math.sin(y*0.4+t*1.5)*(2+p*6); ctx.fillStyle=`rgba(244,238,207,${0.10*(1-p)})`; ctx.fillRect(W*0.82-5+wob,y,10+p*4,2); }

  // falling snow over everything
  for (let i=0;i<40;i++){ const sx=(i*47 + t*8*(1+(i%3)))%W; const sy=(i*53 + t*22*(1+(i%2)*0.4))%H; ctx.fillStyle='rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(sx,sy,1+(i%3)*0.5,0,7); ctx.fill(); }

  // a snowman off to the side (right, low)
  const mx=W*0.86, my=H*0.90;
  ctx.fillStyle='#f4f8fc'; ctx.beginPath(); ctx.arc(mx,my,14,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(mx,my-16,10,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(mx,my-30,7,0,7); ctx.fill();
  ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(mx-2,my-32,1,0,7); ctx.arc(mx+3,my-32,1,0,7); ctx.fill();
  ctx.fillStyle='#e07a2a'; ctx.beginPath(); ctx.moveTo(mx+2,my-30); ctx.lineTo(mx+9,my-29); ctx.lineTo(mx+2,my-28); ctx.fill();
  ctx.strokeStyle='#5a3a20'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(mx-10,my-16); ctx.lineTo(mx-20,my-22); ctx.moveTo(mx+10,my-16); ctx.lineTo(mx+20,my-22); ctx.stroke();
}
registerScene('iceskatingrink', drawIceRink);

/* ── CANDY FACTORY (indoor · whimsical sweets machinery) ── */
function drawCandyFactory(){
  const t = sceneTime, floorY = H*0.74;

  // pastel mint walls
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#cdeee0'); wall.addColorStop(1,'#b6e0d4');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  // candy-stripe wainscot
  for (let x=0;x<W;x+=12){ ctx.fillStyle=(x/12|0)%2?'#f2b8c8':'#fff'; ctx.fillRect(x,floorY-20,12,20); }

  // big glass vat of bubbling candy syrup (left-back)
  const vx=W*0.24, vTop=H*0.16, vBot=floorY-6, vW=64;
  ctx.fillStyle='rgba(255,255,255,.35)'; roundRect(vx-vW/2,vTop,vW,vBot-vTop,10); ctx.fill();
  const syr=ctx.createLinearGradient(0,vTop+20,0,vBot); syr.addColorStop(0,'#f28ab0'); syr.addColorStop(1,'#e2607a');
  ctx.save(); roundRect(vx-vW/2+3,vTop+3,vW-6,vBot-vTop-6,8); ctx.clip();
  ctx.fillStyle=syr; ctx.fillRect(vx-vW/2, vTop+ (vBot-vTop)*0.34, vW, vBot-vTop);
  // wobbly surface
  ctx.fillStyle='#f7a0c0'; ctx.beginPath(); ctx.moveTo(vx-vW/2,vTop+(vBot-vTop)*0.34); for (let x=0;x<=vW;x+=6){ ctx.lineTo(vx-vW/2+x, vTop+(vBot-vTop)*0.34+Math.sin(x*0.2+t*3)*3);} ctx.lineTo(vx+vW/2,vBot); ctx.lineTo(vx-vW/2,vBot); ctx.fill();
  // bubbles
  for (let i=0;i<6;i++){ const bx=vx-vW/2+8+ (i*9); const by=vBot-((t*14+i*17)%((vBot-vTop)*0.6)); ctx.fillStyle='rgba(255,220,235,.7)'; ctx.beginPath(); ctx.arc(bx,by,1.6+ (i%2),0,7); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle='rgba(180,220,220,.4)'; ctx.lineWidth=3; roundRect(vx-vW/2,vTop,vW,vBot-vTop,10); ctx.stroke();
  ctx.fillStyle='#c8a24a'; ctx.fillRect(vx-vW/2-4,vTop-6,vW+8,8);

  // overhead pipe carrying candy + conveyor belt with candies
  ctx.fillStyle='#a8c0d0'; ctx.fillRect(vx,vTop-2,W*0.5,10); ctx.fillRect(vx+W*0.5-10,vTop-2,10,H*0.16);
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; for (let x=vx;x<vx+W*0.5;x+=10){ ctx.beginPath(); ctx.moveTo(x,vTop-2); ctx.lineTo(x,vTop+8); ctx.stroke(); }
  // conveyor
  const beltY=H*0.44, beltX=W*0.44, beltW=W*0.5;
  ctx.fillStyle='#5a5a66'; ctx.fillRect(beltX,beltY,beltW,10);
  ctx.fillStyle='#3a3a44'; ctx.beginPath(); ctx.arc(beltX,beltY+5,7,0,7); ctx.arc(beltX+beltW,beltY+5,7,0,7); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=1; for (let x=0;x<beltW;x+=8){ const xx=beltX+((x+ t*20)%beltW); ctx.beginPath(); ctx.moveTo(xx,beltY); ctx.lineTo(xx,beltY+10); ctx.stroke(); }
  // wrapped candies riding the belt
  const cc=['#e05a5a','#e0b040','#5ab0e0','#a06fe0','#60c060'];
  for (let i=0;i<6;i++){ const cx=beltX+8+((i*40 + t*20)%(beltW-16)); ctx.fillStyle=cc[i%cc.length]; ctx.beginPath(); ctx.ellipse(cx,beltY-4,5,3.4,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx-5,beltY-4); ctx.lineTo(cx-9,beltY-6); ctx.lineTo(cx-9,beltY-2); ctx.closePath(); ctx.moveTo(cx+5,beltY-4); ctx.lineTo(cx+9,beltY-6); ctx.lineTo(cx+9,beltY-2); ctx.closePath(); ctx.fill(); }

  // giant lollipop machinery (right)
  const lx=W*0.84, ly=H*0.30;
  ctx.strokeStyle='#c9c9d0'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx,floorY-6); ctx.stroke();
  ctx.save(); ctx.translate(lx,ly); ctx.rotate(t*0.6);
  for (let k=0;k<6;k++){ ctx.fillStyle= k%2?'#f28ab0':'#fff'; ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,16,k/6*6.28,(k+1)/6*6.28); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(lx,ly,16,0,7); ctx.stroke();

  // gumball dispenser (center-back, high)
  const gx=W*0.5, gy=H*0.30;
  ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(gx,gy,16,0,7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(gx,gy,15,0,7); ctx.clip();
  for (let i=0;i<14;i++){ ctx.fillStyle=cc[i%cc.length]; ctx.beginPath(); ctx.arc(gx-10+ (i%5)*5, gy-10+((i/5)|0)*6, 3.4,0,7); ctx.fill(); } ctx.restore();
  ctx.strokeStyle='rgba(180,200,210,.5)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(gx,gy,16,0,7); ctx.stroke();
  ctx.fillStyle='#c0392b'; ctx.fillRect(gx-14,gy+14,28,10);

  // checkerboard floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#e8e2d4'); fl.addColorStop(1,'#d0c8ba');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  for (let y=floorY;y<H;y+=14){ for (let x=((y/14|0)%2)*14; x<W; x+=28){ ctx.fillStyle='rgba(240,150,180,.25)'; ctx.fillRect(x,y,14,14); } }
}
registerScene('candyfactory', drawCandyFactory);

/* ── MOON BEACH (outdoor · night tide under a full moon) ── */
function drawMoonBeach(){
  const t = sceneTime, seaTop = H*0.40, sandTop = H*0.62;

  // night sky gradient
  const sky=ctx.createLinearGradient(0,0,0,seaTop); sky.addColorStop(0,'#0c1230'); sky.addColorStop(0.6,'#1c2450'); sky.addColorStop(1,'#3a3a68');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,seaTop);
  for (let i=0;i<50;i++){ const sx=(i*67+5)%W, sy=(i*37+3)%(seaTop*0.85); ctx.fillStyle=`rgba(230,238,255,${0.2+0.35*Math.abs(Math.sin(t*1.3+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }
  // big full moon with halo
  const mX=W*0.5, mY=H*0.16;
  ctx.fillStyle='rgba(240,244,220,.16)'; ctx.beginPath(); ctx.arc(mX,mY,44,0,7); ctx.fill();
  ctx.fillStyle='#f2f0d8'; ctx.beginPath(); ctx.arc(mX,mY,28,0,7); ctx.fill();
  ctx.fillStyle='rgba(210,214,190,.5)'; ctx.beginPath(); ctx.arc(mX-9,mY-6,5,0,7); ctx.arc(mX+8,mY+5,6,0,7); ctx.arc(mX+3,mY-10,3,0,7); ctx.fill();
  // wispy cloud crossing the moon
  ctx.fillStyle='rgba(200,205,225,.18)'; ctx.beginPath(); ctx.ellipse(mX+ Math.sin(t*0.15)*20, mY+6, 40,7,0,0,7); ctx.fill();

  // sea
  const sea=ctx.createLinearGradient(0,seaTop,0,sandTop); sea.addColorStop(0,'#16294a'); sea.addColorStop(1,'#22406a');
  ctx.fillStyle=sea; ctx.fillRect(0,seaTop,W,sandTop-seaTop);
  // moonlight glitter column on the sea
  for (let y=seaTop; y<sandTop; y+=3){ const p=(y-seaTop)/(sandTop-seaTop); const wob=Math.sin(y*0.5+t*2)*(3+p*12); const w=8+p*26;
    ctx.fillStyle=`rgba(240,242,215,${0.24*(1-p)})`; ctx.fillRect(mX-w/2+wob,y,w,2); }
  // gentle swell lines
  ctx.strokeStyle='rgba(150,180,220,.14)'; ctx.lineWidth=1; for (let y=seaTop+8;y<sandTop;y+=9){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.05+t*1.4+y)*1.6; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }

  // wet sand with a foamy tide line that gently advances/recedes
  const tide=sandTop + 8 + Math.sin(t*0.6)*6;
  ctx.fillStyle='#4a4658'; ctx.fillRect(0,sandTop,W,H-sandTop);
  // moist reflective band just below waterline
  ctx.fillStyle='rgba(120,140,180,.25)'; ctx.fillRect(0,sandTop,W,tide-sandTop+6);
  // foam edge
  ctx.strokeStyle='rgba(230,240,255,.7)'; ctx.lineWidth=2; ctx.beginPath();
  for (let x=0;x<=W;x+=5){ const yy=tide+Math.sin(x*0.08+t*2)*3; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.35)'; for (let i=0;i<24;i++){ const fx=(i*53+7)%W; const fy=tide+Math.sin(fx*0.08+t*2)*3 - Math.random()*3; ctx.beginPath(); ctx.arc(fx,fy,1.2,0,7); ctx.fill(); }
  // dry sand lower
  const sand=ctx.createLinearGradient(0,tide+6,0,H); sand.addColorStop(0,'#5a5468'); sand.addColorStop(1,'#48435a');
  ctx.fillStyle=sand; ctx.fillRect(0,tide+6,W,H-tide-6);

  // a couple of seashells + starfish on the sand (sides, low)
  ctx.fillStyle='#e0c0c0'; ctx.beginPath(); ctx.arc(W*0.14,H*0.90,6,Math.PI,0); ctx.fill();
  ctx.strokeStyle='#c0a0a0'; ctx.lineWidth=1; for (let k=-2;k<=2;k++){ ctx.beginPath(); ctx.moveTo(W*0.14,H*0.90); ctx.lineTo(W*0.14+k*2.4,H*0.90-6); ctx.stroke(); }
  ctx.fillStyle='#d88a5a'; ctx.save(); ctx.translate(W*0.88,H*0.92); for (let k=0;k<5;k++){ ctx.rotate(6.28/5); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-8); ctx.lineTo(2.4,-3); ctx.closePath(); ctx.fill(); } ctx.restore();
  // small tiki-style lantern on a stick (left, low)
  const px=W*0.10, py=H*0.88;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(px-2,py-4,4,H*0.10);
  ctx.fillStyle='rgba(255,180,90,.25)'; ctx.beginPath(); ctx.arc(px,py-10,14,0,7); ctx.fill();
  ctx.fillStyle=`rgba(255,190,110,${0.85+0.12*Math.sin(t*2.5)})`; roundRect(px-5,py-16,10,12,3); ctx.fill();
}
registerScene('moonbeach', drawMoonBeach);

/* ── PAPERCRAFT STUDIO (indoor · origami & paper art) ── */
function drawPapercraftStudio(){
  const t = sceneTime, deskY = H*0.68;

  // soft sage wall
  const wall=ctx.createLinearGradient(0,0,0,deskY); wall.addColorStop(0,'#dfe6d4'); wall.addColorStop(1,'#cdd8c0');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,deskY);

  // a window with soft daylight (left)
  const wx=W*0.09, wy=H*0.12, ww=W*0.30, wh=H*0.34;
  const wg=ctx.createLinearGradient(0,wy,0,wy+wh); wg.addColorStop(0,'#bfe0ee'); wg.addColorStop(1,'#e8f2ea');
  ctx.fillStyle=wg; ctx.fillRect(wx,wy,ww,wh);
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(wx+ww*0.7,wy+wh*0.3,10,6,0,0,7); ctx.fill();
  ctx.strokeStyle='#b8a888'; ctx.lineWidth=4; ctx.strokeRect(wx,wy,ww,wh); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(wx+ww/2,wy); ctx.lineTo(wx+ww/2,wy+wh); ctx.moveTo(wx,wy+wh/2); ctx.lineTo(wx+ww,wy+wh/2); ctx.stroke();

  // hanging origami mobile — cranes on threads, gently swaying
  function crane(cx,cy,col,ph){ const sw=Math.sin(t*1.2+ph)*3; ctx.save(); ctx.translate(cx+sw,cy);
    ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(-8,0); ctx.lineTo(0,-4); ctx.lineTo(8,0); ctx.lineTo(0,4); ctx.closePath(); ctx.fill(); // body
    ctx.beginPath(); ctx.moveTo(-8,0); ctx.lineTo(-16,-6); ctx.lineTo(-6,-2); ctx.closePath(); ctx.fill(); // wing
    ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(16,-7); ctx.lineTo(6,-2); ctx.closePath(); ctx.fill(); // neck/head
    ctx.fillStyle='rgba(0,0,0,.15)'; ctx.beginPath(); ctx.moveTo(0,4); ctx.lineTo(-3,9); ctx.lineTo(3,9); ctx.fill(); // tail hint
    ctx.restore(); }
  const cols=['#e2708a','#7ab0e0','#e0b850','#7ac86a','#b088e0'];
  for (let i=0;i<5;i++){ const cx=W*0.5+ (i-2)*W*0.10; const thread=18+ (i%3)*14;
    ctx.strokeStyle='rgba(120,120,120,.4)'; ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,thread); ctx.stroke();
    crane(cx,thread+6,cols[i],i*1.3); }

  // shelf with folded paper stacks + paper flowers (right)
  ctx.fillStyle='#b8946a'; ctx.fillRect(W*0.66,H*0.20,W*0.30,6);
  for (let i=0;i<5;i++){ const sx=W*0.68+i*W*0.055; ctx.fillStyle=cols[i%cols.length]; ctx.fillRect(sx,H*0.20-8-(i%3)*2,9,8+(i%3)*2); }
  // paper flowers in a vase on the shelf
  ctx.fillStyle='#cdd8c0'; roundRect(W*0.90,H*0.20-16,10,16,2); ctx.fill();
  for (let k=0;k<4;k++){ const a=k/4*6.28; ctx.fillStyle=cols[k]; ctx.beginPath(); ctx.arc(W*0.905+Math.cos(a)*5,H*0.20-18+Math.sin(a)*5,2.4,0,7); ctx.fill(); }

  // a wall garland of paper triangles
  ctx.strokeStyle='rgba(150,140,120,.5)'; ctx.lineWidth=1; ctx.beginPath();
  for (let x=0;x<=W;x+=8){ const y=H*0.09+Math.sin(x*0.05)*5; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();

  // wooden desk
  const desk=ctx.createLinearGradient(0,deskY,0,H); desk.addColorStop(0,'#c49a68'); desk.addColorStop(1,'#a2794c');
  ctx.fillStyle=desk; ctx.fillRect(0,deskY,W,H-deskY);
  ctx.fillStyle='rgba(255,245,225,.15)'; ctx.fillRect(0,deskY,W,4);

  // scattered origami paper squares + finished pieces on the desk (sides, low)
  const sq=['#e2708a','#7ab0e0','#e0b850','#7ac86a'];
  for (let i=0;i<4;i++){ ctx.save(); ctx.translate(W*0.14+i*10,deskY+22+ (i%2)*6); ctx.rotate((i-1.5)*0.2); ctx.fillStyle=sq[i]; ctx.fillRect(-8,-8,16,16); ctx.strokeStyle='rgba(0,0,0,.1)'; ctx.strokeRect(-8,-8,16,16); ctx.restore(); }
  // a finished origami boat (center-back, high)
  const bx=W*0.5, by=deskY+14;
  ctx.fillStyle='#e08a5a'; ctx.beginPath(); ctx.moveTo(bx-14,by); ctx.lineTo(bx+14,by); ctx.lineTo(bx+8,by-6); ctx.lineTo(bx-8,by-6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(bx-8,by-6); ctx.lineTo(bx,by-16); ctx.lineTo(bx+8,by-6); ctx.closePath(); ctx.fill();
  // a folded crane displayed (right, low)
  crane(W*0.84,deskY+20,'#7ab0e0',0);
  // scissors + bone folder
  ctx.strokeStyle='#8a8a92'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.72,deskY+24); ctx.lineTo(W*0.78,deskY+30); ctx.moveTo(W*0.72,deskY+30); ctx.lineTo(W*0.78,deskY+24); ctx.stroke();
}
registerScene('papercraftstudio', drawPapercraftStudio);

/* ── POPPY FIELD (outdoor · breezy red poppies) ── */
function drawPoppyField(){
  const t = sceneTime, fieldY = H*0.50;

  // bright open sky
  const sky=ctx.createLinearGradient(0,0,0,fieldY); sky.addColorStop(0,'#5fb0ea'); sky.addColorStop(1,'#d8eecf');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,fieldY);
  ctx.fillStyle='#fff6b0'; ctx.beginPath(); ctx.arc(W*0.80,H*0.13,20,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,246,176,.3)'; ctx.beginPath(); ctx.arc(W*0.80,H*0.13,32,0,7); ctx.fill();
  drawCloud(W*0.2+Math.sin(t*0.1)*8,H*0.10,0.7); drawCloud(W*0.5+Math.sin(t*0.08+2)*6,H*0.18,0.5); drawCloud(W*0.9+Math.sin(t*0.12+4)*5,H*0.08,0.4);

  // distant rolling hills
  ctx.fillStyle='#7aa84a'; ctx.beginPath(); ctx.moveTo(0,fieldY); for(let x=0;x<=W;x+=20){ ctx.lineTo(x,fieldY-24-16*Math.sin(x*0.016+1)); } ctx.lineTo(W,fieldY); ctx.fill();
  ctx.fillStyle='#6a9a3e'; ctx.beginPath(); ctx.moveTo(0,fieldY); for(let x=0;x<=W;x+=20){ ctx.lineTo(x,fieldY-8-10*Math.sin(x*0.03+3)); } ctx.lineTo(W,fieldY); ctx.fill();
  // a lone tree on a hill (left)
  ctx.fillStyle='#5a3a20'; ctx.fillRect(W*0.18-2,fieldY-30,4,18); ctx.fillStyle='#3a8a3a'; ctx.beginPath(); ctx.arc(W*0.18,fieldY-34,12,0,7); ctx.fill();

  // green field base
  const grr=ctx.createLinearGradient(0,fieldY,0,H); grr.addColorStop(0,'#5a9e3a'); grr.addColorStop(1,'#3f7a26');
  ctx.fillStyle=grr; ctx.fillRect(0,fieldY,W,H-fieldY);

  // layers of poppies — smaller/paler far, bigger/brighter near, swaying in wind
  function poppy(px,py,sc,shade){ const sway=Math.sin(t*1.6+px*0.05)*3*sc;
    ctx.strokeStyle='#3a7a2a'; ctx.lineWidth=1.4*sc; ctx.beginPath(); ctx.moveTo(px,py+14*sc); ctx.quadraticCurveTo(px+sway*0.5,py+4*sc,px+sway,py); ctx.stroke();
    ctx.save(); ctx.translate(px+sway,py); ctx.scale(sc,sc);
    ctx.fillStyle=shade; for (let k=0;k<5;k++){ const a=k/5*6.28; ctx.beginPath(); ctx.ellipse(Math.cos(a)*4,Math.sin(a)*4,5,4,a,0,7); ctx.fill(); }
    ctx.fillStyle='#2a1a10'; ctx.beginPath(); ctx.arc(0,0,2.4,0,7); ctx.fill();
    ctx.fillStyle='#1a1008'; for (let k=0;k<6;k++){ const a=k/6*6.28; ctx.beginPath(); ctx.arc(Math.cos(a)*2.4,Math.sin(a)*2.4,0.7,0,7); ctx.fill(); }
    ctx.restore();
  }
  // far layer
  for (let i=0;i<16;i++){ const px=(i*47+10)%W; const py=fieldY+10+ (i%3)*6; poppy(px,py,0.5,'#d84a3a'); }
  // mid layer
  for (let i=0;i<14;i++){ const px=(i*61+24)%W; const py=fieldY+34+ (i%4)*8; poppy(px,py,0.8,'#e2482e'); }
  // near layer (bottom, big) — kept along the sides so center floor reads
  for (let i=0;i<10;i++){ const px=(i*79+8)%W; if (px>W*0.34 && px<W*0.66) continue; const py=H*0.82+ (i%3)*10; poppy(px,py,1.3,'#e2402a'); }
  // a few white daisies mixed in (sides)
  for (const [dx,dy] of [[W*0.10,H*0.88],[W*0.90,H*0.86],[W*0.22,H*0.80]]){ ctx.fillStyle='#fff'; for (let k=0;k<7;k++){ const a=k/7*6.28; ctx.beginPath(); ctx.ellipse(dx+Math.cos(a)*4,dy+Math.sin(a)*4,2.4,1.4,a,0,7); ctx.fill(); } ctx.fillStyle='#e0b040'; ctx.beginPath(); ctx.arc(dx,dy,2,0,7); ctx.fill(); }

  // butterflies fluttering
  for (let i=0;i<3;i++){ const bx=W*0.3+i*W*0.22+Math.sin(t*1.5+i)*20; const by=fieldY-10+Math.sin(t*2+i*2)*14; const flap=Math.abs(Math.sin(t*8+i))*0.6+0.2;
    ctx.fillStyle=['#e0902a','#c05a90','#5a90d0'][i]; ctx.save(); ctx.translate(bx,by);
    ctx.beginPath(); ctx.ellipse(-2,0,3,flap*4,0.4,0,7); ctx.ellipse(2,0,3,flap*4,-0.4,0,7); ctx.fill();
    ctx.fillStyle='#333'; ctx.fillRect(-0.5,-3,1,6); ctx.restore(); }
}
registerScene('poppyfield', drawPoppyField);

/* ── TREEHOUSE (outdoor · cozy platform in the canopy) ── */
function drawTreehouse(){
  const t = sceneTime, deckY = H*0.70;

  // warm afternoon sky through leaves
  const sky=ctx.createLinearGradient(0,0,0,deckY); sky.addColorStop(0,'#8fc9ee'); sky.addColorStop(1,'#f0e6c8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,deckY);
  ctx.fillStyle='#fff6c0'; ctx.beginPath(); ctx.arc(W*0.5,H*0.16,60,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,246,192,.25)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.16,90,0,7); ctx.fill();

  // dense canopy framing the top & corners (dark green leaf masses)
  function leafMass(cx,cy,r,col){ ctx.fillStyle=col; for (let k=0;k<7;k++){ const a=k/7*6.28; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r*0.6,cy+Math.sin(a)*r*0.6,r*0.5,0,7); ctx.fill(); } ctx.beginPath(); ctx.arc(cx,cy,r*0.6,0,7); ctx.fill(); }
  leafMass(W*0.12,H*0.06,54,'#2f7a34'); leafMass(W*0.5,-10,70,'#379038'); leafMass(W*0.9,H*0.05,58,'#2a7030');
  leafMass(W*0.04,H*0.34,40,'#347f36'); leafMass(W*0.97,H*0.30,44,'#2f7a34');
  // sun dapples flickering in the leaves
  for (let i=0;i<14;i++){ const dx=(i*53+9)%W; const dy=(i*37+5)%(H*0.30); ctx.fillStyle=`rgba(255,246,180,${0.1+0.12*Math.sin(t*2+i)})`; ctx.beginPath(); ctx.arc(dx,dy,4,0,7); ctx.fill(); }

  // big tree trunk on the right supporting the house
  ctx.fillStyle='#6a4626'; ctx.fillRect(W*0.78,H*0.10,W*0.16,H-H*0.10);
  ctx.strokeStyle='#4a2e16'; ctx.lineWidth=1.5; for (let i=0;i<8;i++){ const ly=H*0.14+i*36; ctx.beginPath(); ctx.moveTo(W*0.79,ly); ctx.quadraticCurveTo(W*0.86,ly+8,W*0.93,ly+2); ctx.stroke(); }
  // a thick branch under the deck
  ctx.fillStyle='#5a3a1e'; ctx.fillRect(W*0.10,deckY+6,W*0.72,10);

  // the little wooden cabin behind the deck
  const hx=W*0.2, hy=H*0.30, hw=W*0.5, hh=deckY-hy;
  ctx.fillStyle='#a5764a'; ctx.fillRect(hx,hy,hw,hh);
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; for (let y=hy+8;y<deckY;y+=10){ ctx.beginPath(); ctx.moveTo(hx,y); ctx.lineTo(hx+hw,y); ctx.stroke(); }
  // pitched roof
  ctx.fillStyle='#7a4a2a'; ctx.beginPath(); ctx.moveTo(hx-10,hy); ctx.lineTo(hx+hw*0.5,hy-34); ctx.lineTo(hx+hw+10,hy); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#8a5a34'; for (let x=hx-6;x<hx+hw;x+=8){ ctx.fillRect(x,hy-4,3,4); }
  // round window with warm glow
  ctx.fillStyle='#ffe6a0'; ctx.beginPath(); ctx.arc(hx+hw*0.5,hy+hh*0.4,14,0,7); ctx.fill();
  ctx.strokeStyle='#5a3a1e'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(hx+hw*0.5,hy+hh*0.4,14,0,7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx+hw*0.5-14,hy+hh*0.4); ctx.lineTo(hx+hw*0.5+14,hy+hh*0.4); ctx.moveTo(hx+hw*0.5,hy+hh*0.4-14); ctx.lineTo(hx+hw*0.5,hy+hh*0.4+14); ctx.stroke();
  // bunting flags along the roof edge
  for (let x=hx-4;x<hx+hw;x+=16){ ctx.fillStyle=['#e05a5a','#e0b040','#5ab0e0'][((x/16)|0)%3]; ctx.beginPath(); ctx.moveTo(x,hy); ctx.lineTo(x+10,hy); ctx.lineTo(x+5,hy+8); ctx.closePath(); ctx.fill(); }

  // rope ladder hanging down (left)
  ctx.strokeStyle='#8a6a3a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.16,deckY); ctx.lineTo(W*0.16,H); ctx.moveTo(W*0.24,deckY); ctx.lineTo(W*0.24,H); ctx.stroke();
  ctx.lineWidth=3; for (let y=deckY+10;y<H;y+=16){ ctx.beginPath(); ctx.moveTo(W*0.16,y); ctx.lineTo(W*0.24,y); ctx.stroke(); }

  // wooden deck platform
  const deck=ctx.createLinearGradient(0,deckY,0,H); deck.addColorStop(0,'#c19a62'); deck.addColorStop(1,'#a2794c');
  ctx.fillStyle=deck; ctx.fillRect(0,deckY,W,H-deckY);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1; for (let x=0;x<W;x+=22){ ctx.beginPath(); ctx.moveTo(x,deckY); ctx.lineTo(x,H); ctx.stroke(); }
  // simple railing along the front
  ctx.fillStyle='#8a6038'; ctx.fillRect(0,deckY+2,W,4); for (let x=10;x<W;x+=34){ ctx.fillRect(x,deckY+2,4,14); }
  // a paper lantern hanging from the branch (left) + a potted plant (right, low)
  const lx=W*0.30;
  ctx.strokeStyle='#5a3a1e'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx,deckY+8); ctx.lineTo(lx,deckY+18); ctx.stroke();
  ctx.fillStyle=`rgba(240,150,80,${0.82+0.12*Math.sin(t*2)})`; roundRect(lx-7,deckY+18,14,18,7); ctx.fill();
  ctx.fillStyle='#b56a44'; ctx.beginPath(); ctx.moveTo(W*0.7,H-4); ctx.lineTo(W*0.78,H-4); ctx.lineTo(W*0.76,H-20); ctx.lineTo(W*0.72,H-20); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a8a3a'; for (const a of [-0.5,0,0.5]){ ctx.save(); ctx.translate(W*0.74,H-20); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-8,4,10,0,0,7); ctx.fill(); ctx.restore(); }
}
registerScene('treehouse', drawTreehouse);

/* ── DESERT OASIS (outdoor · palms & pool at golden hour) ── */
function drawDesertOasis(){
  const t = sceneTime, duneY = H*0.52, poolY = H*0.66;

  // warm golden-hour sky
  const sky=ctx.createLinearGradient(0,0,0,duneY); sky.addColorStop(0,'#f5b96a'); sky.addColorStop(0.5,'#f0d09a'); sky.addColorStop(1,'#f6e6c0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,duneY);
  // low sun with glow
  const sunX=W*0.72, sunY=H*0.24;
  ctx.fillStyle='rgba(255,220,150,.35)'; ctx.beginPath(); ctx.arc(sunX,sunY,40,0,7); ctx.fill();
  ctx.fillStyle='#fff0c0'; ctx.beginPath(); ctx.arc(sunX,sunY,24,0,7); ctx.fill();
  // heat shimmer birds
  ctx.strokeStyle='rgba(120,90,60,.4)'; ctx.lineWidth=1; for (let i=0;i<3;i++){ const bx=(W*0.2+i*30+t*6)%W, by=H*0.10+i*6; ctx.beginPath(); ctx.moveTo(bx-4,by); ctx.quadraticCurveTo(bx,by-3,bx+4,by); ctx.stroke(); }

  // far dunes (layered)
  ctx.fillStyle='#e0b070'; ctx.beginPath(); ctx.moveTo(0,duneY); for(let x=0;x<=W;x+=18){ ctx.lineTo(x,duneY-20-14*Math.sin(x*0.014+1)); } ctx.lineTo(W,duneY); ctx.fill();
  ctx.fillStyle='#d49a54'; ctx.beginPath(); ctx.moveTo(0,duneY); for(let x=0;x<=W;x+=18){ ctx.lineTo(x,duneY-6-10*Math.sin(x*0.025+3)); } ctx.lineTo(W,duneY); ctx.fill();

  // sand foreground
  const sand=ctx.createLinearGradient(0,duneY,0,H); sand.addColorStop(0,'#e8c184'); sand.addColorStop(1,'#c9a060');
  ctx.fillStyle=sand; ctx.fillRect(0,duneY,W,H-duneY);
  ctx.fillStyle='rgba(180,140,90,.2)'; for (let i=0;i<30;i++){ const sx=(i*67+11)%W, sy=duneY+8+((i*41+7)%(H-duneY-8)); ctx.fillRect(sx,sy,2,2); }

  // the oasis pool (center, glassy blue reflecting sky)
  const pool=ctx.createLinearGradient(0,poolY,0,H*0.82); pool.addColorStop(0,'#3aa0c0'); pool.addColorStop(1,'#2a7a9a');
  ctx.fillStyle=pool; ctx.beginPath(); ctx.ellipse(W*0.5,poolY+14,W*0.42,26,0,0,7); ctx.fill();
  // ripples + sun reflection
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1; for (let i=0;i<3;i++){ ctx.beginPath(); ctx.ellipse(W*0.5,poolY+14,W*0.3-i*30+Math.sin(t*2+i)*3,18-i*4,0,0,7); ctx.stroke(); }
  ctx.fillStyle='rgba(255,235,180,.3)'; ctx.beginPath(); ctx.ellipse(sunX-W*0.1,poolY+10,26,5,0,0,7); ctx.fill();
  // sandy rim
  ctx.strokeStyle='#b88a50'; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(W*0.5,poolY+14,W*0.42,26,0,0,7); ctx.stroke();

  // palm trees (sides, arching over) — drawn after pool so they frame it
  function palm(px,baseY,h,lean){ ctx.save(); ctx.translate(px,baseY);
    ctx.strokeStyle='#7a5a34'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(lean*0.5,-h*0.6,lean,-h); ctx.stroke();
    // frond crown
    ctx.strokeStyle='#3a8a4a'; ctx.lineWidth=3;
    for (let k=0;k<7;k++){ const a=Math.PI + k/6*Math.PI; const sway=Math.sin(t*1.2+k+px)*4;
      ctx.beginPath(); ctx.moveTo(lean,-h); ctx.quadraticCurveTo(lean+Math.cos(a)*20, -h+Math.sin(a)*16, lean+Math.cos(a)*36+sway, -h+Math.sin(a)*24+8); ctx.stroke(); }
    // coconuts
    ctx.fillStyle='#5a3a1a'; ctx.beginPath(); ctx.arc(lean-3,-h+4,3,0,7); ctx.arc(lean+4,-h+5,3,0,7); ctx.fill();
    ctx.restore(); }
  palm(W*0.14, duneY+18, 120, 18);
  palm(W*0.88, duneY+22, 140, -22);
  palm(W*0.30, duneY+10, 90, 10);

  // a couple of desert shrubs + a small striped cushion by the pool (low, sides)
  ctx.fillStyle='#5a7a3a'; for (const gx of [W*0.10,W*0.90]){ for (let k=-2;k<=2;k++){ ctx.beginPath(); ctx.moveTo(gx,H*0.92); ctx.lineTo(gx+k*3,H*0.92-8); ctx.stroke(); } ctx.beginPath(); ctx.arc(gx,H*0.90,5,0,7); ctx.fill(); }
  ctx.save(); ctx.translate(W*0.20,H*0.90); ctx.rotate(-0.1); ctx.fillStyle='#c04a6a'; roundRect(-16,-6,32,12,3); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.3)'; for (let x=-16;x<16;x+=8){ ctx.fillRect(x,-6,2,12);} ctx.restore();
}
registerScene('desertoasis', drawDesertOasis);

/* ── DUMPLING HOUSE (indoor · steamy bamboo-steamer kitchen) ── */
function drawDumplingHouse(){
  const t = sceneTime, counterY = H*0.66;

  // warm red-lacquer wall
  const wall=ctx.createLinearGradient(0,0,0,counterY); wall.addColorStop(0,'#7a2a2a'); wall.addColorStop(1,'#a03a34');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,counterY);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1; for (let y=18;y<counterY;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // gold trim band
  ctx.fillStyle='#e0b84a'; ctx.fillRect(0,H*0.30,W,4);

  // round window with lattice (left)
  const wx=W*0.16, wy=H*0.16;
  ctx.fillStyle='#e8d8b0'; ctx.beginPath(); ctx.arc(wx,wy,26,0,7); ctx.fill();
  ctx.strokeStyle='#8a2a2a'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(wx,wy,26,0,7); ctx.stroke();
  for (let k=-2;k<=2;k++){ ctx.beginPath(); ctx.moveTo(wx+k*10,wy-24); ctx.lineTo(wx+k*10,wy+24); ctx.moveTo(wx-24,wy+k*10); ctx.lineTo(wx+24,wy+k*10); ctx.stroke(); }

  // hanging red lanterns with tassels
  for (const lx of [W*0.52,W*0.74,W*0.90]){ ctx.strokeStyle='#3a1a1a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx,0); ctx.lineTo(lx,H*0.08); ctx.stroke();
    ctx.fillStyle='rgba(255,120,90,.3)'; ctx.beginPath(); ctx.arc(lx,H*0.12,18,0,7); ctx.fill();
    ctx.fillStyle=`rgba(220,60,50,${0.85+0.1*Math.sin(t*2+lx)})`; roundRect(lx-11,H*0.08,22,24,10); ctx.fill();
    ctx.fillStyle='#e0b84a'; ctx.fillRect(lx-11,H*0.08,22,3); ctx.fillRect(lx-11,H*0.08+24,22,3);
    ctx.strokeStyle='#e0b84a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx,H*0.08+27); ctx.lineTo(lx,H*0.08+38); ctx.stroke(); }

  // menu board on the wall (center-right, high)
  ctx.fillStyle='#2a1a14'; ctx.fillRect(W*0.40,H*0.14,W*0.16,H*0.14);
  ctx.strokeStyle='rgba(240,220,180,.8)'; ctx.lineWidth=1; for (let k=0;k<4;k++){ ctx.beginPath(); ctx.moveTo(W*0.42,H*0.17+k*10); ctx.lineTo(W*0.53,H*0.17+k*10); ctx.stroke(); }

  // wood counter with a bamboo steamer stack (center) and dumpling plates
  const cnt=ctx.createLinearGradient(0,counterY,0,H); cnt.addColorStop(0,'#c49a68'); cnt.addColorStop(1,'#a2794c');
  ctx.fillStyle=cnt; ctx.fillRect(0,counterY,W,H-counterY);
  ctx.fillStyle='rgba(255,245,220,.15)'; ctx.fillRect(0,counterY,W,4);

  // bamboo steamer stack (center-back, high, with rising steam)
  const sx=W*0.5, sTopY=counterY+2;
  for (let tier=2;tier>=0;tier--){ const ty=sTopY+tier*10; ctx.fillStyle= tier===0?'#d8b878':'#c8a868'; ctx.beginPath(); ctx.ellipse(sx,ty,30,9,0,0,7); ctx.fill();
    ctx.fillStyle='#b89858'; ctx.fillRect(sx-30,ty,60,10);
    ctx.strokeStyle='rgba(120,90,50,.5)'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(sx,ty,30,9,0,0,7); ctx.stroke(); }
  // domed lid
  ctx.fillStyle='#cdae70'; ctx.beginPath(); ctx.ellipse(sx,sTopY-4,30,12,0,Math.PI,0); ctx.fill();
  ctx.fillStyle='#8a6a3a'; ctx.beginPath(); ctx.arc(sx,sTopY-14,3,0,7); ctx.fill();
  // steam plumes
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=2;
  for (const ox of [-10,0,10]){ ctx.beginPath(); for (let k=0;k<=9;k++){ const yy=sTopY-16-k*5, xx=sx+ox+Math.sin(t*3+k*0.6+ox)*4; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);} ctx.stroke(); }

  // plates of dumplings on the counter (sides, low)
  function dumplings(px,py){ ctx.fillStyle='#e9e2d6'; ctx.beginPath(); ctx.ellipse(px,py,24,8,0,0,7); ctx.fill();
    for (let k=0;k<4;k++){ const dx=px-15+k*10; ctx.fillStyle='#f0e6cf'; ctx.beginPath(); ctx.ellipse(dx,py-3,6,4,0,Math.PI,0); ctx.fill();
      ctx.strokeStyle='rgba(180,160,120,.7)'; ctx.lineWidth=0.7; for (let p=-2;p<=2;p++){ ctx.beginPath(); ctx.moveTo(dx+p*1.5,py-3); ctx.lineTo(dx+p*1.5,py-6); ctx.stroke(); } } }
  dumplings(W*0.18,counterY+26); dumplings(W*0.82,counterY+28);
  // a little dipping-sauce dish + chopsticks (center-low)
  ctx.fillStyle='#3a2a24'; ctx.beginPath(); ctx.ellipse(W*0.5,counterY+34,9,3.4,0,0,7); ctx.fill();
  ctx.strokeStyle='#6a4326'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(W*0.5+12,counterY+24); ctx.lineTo(W*0.5+28,counterY+18); ctx.moveTo(W*0.5+12,counterY+27); ctx.lineTo(W*0.5+28,counterY+22); ctx.stroke();
}
registerScene('dumplinghouse', drawDumplingHouse);

/* ── SAKURA TUNNEL (outdoor · archway of cherry blossoms) ── */
function drawSakuraTunnel(){
  const t = sceneTime, pathY = H*0.58;

  // soft spring sky
  const sky=ctx.createLinearGradient(0,0,0,pathY); sky.addColorStop(0,'#bfe0f0'); sky.addColorStop(1,'#f6e2ec');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,pathY);
  ctx.fillStyle='rgba(255,246,200,.5)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.16,50,0,7); ctx.fill();

  // path receding into the tunnel (kept center for pet)
  const path=ctx.createLinearGradient(0,pathY,0,H); path.addColorStop(0,'#d8c6a6'); path.addColorStop(1,'#b49a70');
  ctx.fillStyle=path; ctx.beginPath(); ctx.moveTo(W*0.42,pathY); ctx.lineTo(W*0.58,pathY); ctx.lineTo(W*0.84,H); ctx.lineTo(W*0.16,H); ctx.closePath(); ctx.fill();
  // grass either side of the path
  ctx.fillStyle='#8ab04a'; ctx.beginPath(); ctx.moveTo(0,pathY); ctx.lineTo(W*0.42,pathY); ctx.lineTo(W*0.16,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W,pathY); ctx.lineTo(W*0.58,pathY); ctx.lineTo(W*0.84,H); ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
  // fallen petals on the path
  ctx.fillStyle='rgba(245,180,205,.7)'; for (let i=0;i<40;i++){ const px=W*0.2+((i*53)%(W*0.6)); const py=pathY+10+((i*37)%(H-pathY-10)); ctx.beginPath(); ctx.ellipse(px,py,2.2,1.4,i,0,7); ctx.fill(); }

  // rows of cherry trees forming an arch — near trees big, arching branches meeting overhead
  function blossomMass(cx,cy,r){ ctx.fillStyle='#f5b7cd'; for (let k=0;k<8;k++){ const a=k/8*6.28; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r*0.6,cy+Math.sin(a)*r*0.6,r*0.5,0,7); ctx.fill(); }
    ctx.fillStyle='#f9cddd'; for (let k=0;k<6;k++){ const a=k/6*6.28+0.4; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r*0.4,cy+Math.sin(a)*r*0.4,r*0.35,0,7); ctx.fill(); } }
  // overhead canopy arch across the top
  blossomMass(W*0.5,-6,80);
  blossomMass(W*0.18,H*0.06,56); blossomMass(W*0.82,H*0.06,58);
  // trunks + arching branches on both sides
  function tree(bx,dir){ ctx.strokeStyle='#6a4a30'; ctx.lineWidth=10; ctx.beginPath(); ctx.moveTo(bx,pathY+4); ctx.lineTo(bx,H*0.20); ctx.stroke();
    ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(bx,H*0.24); ctx.quadraticCurveTo(bx+dir*30,H*0.10,bx+dir*70,H*0.04); ctx.stroke();
    blossomMass(bx,H*0.18,30); blossomMass(bx+dir*44,H*0.08,34); }
  tree(W*0.10,1); tree(W*0.90,-1); tree(W*0.30,1); tree(W*0.70,-1);

  // drifting falling petals (animated)
  for (let i=0;i<28;i++){ const px=(i*47 + t*10 + Math.sin(t*0.8+i)*20)%W; const py=(i*53 + t*24)%H; const rot=t*2+i;
    ctx.fillStyle=`rgba(248,188,210,${0.6+0.3*Math.sin(t+i)})`; ctx.save(); ctx.translate(px,py); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0,0,2.6,1.5,0,0,7); ctx.fill(); ctx.restore(); }

  // a small wooden bench off to the side (left, low)
  const bx=W*0.12, by=H*0.86;
  ctx.fillStyle='#8a6038'; ctx.fillRect(bx-16,by,32,4); ctx.fillRect(bx-16,by-10,32,3); ctx.fillRect(bx-14,by+4,3,10); ctx.fillRect(bx+11,by+4,3,10);
  // a stone lantern (right, low)
  const lx=W*0.88, ly=H*0.88;
  ctx.fillStyle='#9a9088'; ctx.fillRect(lx-3,ly,6,10); ctx.fillRect(lx-7,ly-8,14,8); ctx.beginPath(); ctx.moveTo(lx-8,ly-8); ctx.lineTo(lx,ly-16); ctx.lineTo(lx+8,ly-8); ctx.fill();
  ctx.fillStyle='rgba(255,210,130,.6)'; ctx.fillRect(lx-2,ly-6,4,4);
}
registerScene('sakuratunnel', drawSakuraTunnel);

/* ── IGLOO (indoor · cozy snow-dome shelter) ── */
function drawIglooInterior(){
  const t = sceneTime, floorY = H*0.72;

  // icy blue dome interior (fills canvas)
  const dome=ctx.createRadialGradient(W*0.5,H*0.86,20,W*0.5,H*0.30,W*0.7);
  dome.addColorStop(0,'#bfe0ee'); dome.addColorStop(0.6,'#8fbfe0'); dome.addColorStop(1,'#5f90c0');
  ctx.fillStyle=dome; ctx.fillRect(0,0,W,H);

  // curved snow-brick courses following the dome
  ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1.5;
  for (let ring=1;ring<=6;ring++){ const ry=H*0.86 - ring*H*0.12; const rw=W*0.5*(1 - ring*0.10);
    ctx.beginPath(); ctx.ellipse(W*0.5,H*0.86,rw*2,ry*0.0+ (H*0.86-ry),0,Math.PI,0); ctx.stroke(); }
  // vertical brick seams between courses
  ctx.strokeStyle='rgba(150,190,220,.4)'; ctx.lineWidth=1;
  for (let ring=0;ring<6;ring++){ const y0=H*0.86-ring*H*0.12, y1=H*0.86-(ring+1)*H*0.12; const rw=W*0.5*(1-ring*0.10)*2;
    for (let a=0.2; a<Math.PI; a+=0.5){ const off=(ring%2)*0.25; const x=W*0.5+Math.cos(a+off)*rw*0.5; ctx.beginPath(); ctx.moveTo(x,y0); ctx.lineTo(W*0.5+Math.cos(a+off)*rw*0.42,y1); ctx.stroke(); } }

  // low entrance tunnel opening (back, showing dark night + stars)
  const ex=W*0.5, ey=floorY-6;
  ctx.fillStyle='#12203a'; ctx.beginPath(); ctx.moveTo(ex-26,ey); ctx.lineTo(ex-26,ey-30); ctx.arc(ex,ey-30,26,Math.PI,0); ctx.lineTo(ex+26,ey); ctx.closePath(); ctx.fill();
  for (let i=0;i<8;i++){ ctx.fillStyle='rgba(230,240,255,.8)'; ctx.fillRect(ex-20+(i*47)%40, ey-44+(i*23)%26, 1.3,1.3); }
  // a hint of aurora through the opening
  ctx.fillStyle=`rgba(120,230,170,${0.15+0.1*Math.sin(t)})`; ctx.fillRect(ex-24,ey-40,48,10);

  // little ice shelf niches with a glowing lantern
  ctx.fillStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(W*0.20,H*0.44,14,0,Math.PI); ctx.fill();
  ctx.fillStyle='rgba(255,220,140,.3)'; ctx.beginPath(); ctx.arc(W*0.20,H*0.44,10,0,7); ctx.fill();
  ctx.fillStyle=`rgba(255,205,120,${0.85+0.1*Math.sin(t*2.5)})`; roundRect(W*0.20-5,H*0.44-6,10,12,3); ctx.fill();
  // string of tiny warm lights along a course
  for (let i=0;i<7;i++){ const a=0.4+i*0.35; const x=W*0.5+Math.cos(a)*W*0.42, y=H*0.86-Math.sin(a)*H*0.34;
    ctx.fillStyle=`rgba(255,220,150,${0.6+0.4*Math.sin(t*3+i)})`; ctx.beginPath(); ctx.arc(x,y,2,0,7); ctx.fill(); }

  // packed snow floor with fur rug + a small fire bowl
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#dfeef6'); fl.addColorStop(1,'#c0d8e8');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(150,190,220,.3)'; ctx.lineWidth=1; for (let i=0;i<20;i++){ const gx=(i*67+9)%W, gy=floorY+6+((i*29)%(H-floorY-6)); ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+4,gy); ctx.stroke(); }
  // fur rug (center-low)
  ctx.fillStyle='#c9a06a'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.90,90,18,0,0,7); ctx.fill();
  ctx.strokeStyle='rgba(160,120,70,.5)'; ctx.lineWidth=1; for (let i=0;i<30;i++){ const rx=W*0.5-84+i*6; ctx.beginPath(); ctx.moveTo(rx,H*0.90-14); ctx.lineTo(rx+2,H*0.90-18); ctx.stroke(); }
  // small brazier/fire bowl (left, low)
  const bx=W*0.16, by=H*0.90;
  ctx.fillStyle='#3a2a24'; ctx.beginPath(); ctx.ellipse(bx,by,10,4,0,0,7); ctx.fill(); ctx.fillRect(bx-10,by-4,20,4);
  for (let i=0;i<5;i++){ const fx=bx-6+i*3; const fh=6+4*Math.sin(t*6+i); ctx.fillStyle='#e0641a'; ctx.beginPath(); ctx.moveTo(fx-2,by-2); ctx.quadraticCurveTo(fx,by-2-fh,fx+2,by-2); ctx.fill();
    ctx.fillStyle='#f2b02a'; ctx.beginPath(); ctx.moveTo(fx-1,by-2); ctx.quadraticCurveTo(fx,by-2-fh*0.6,fx+1,by-2); ctx.fill(); }
  ctx.fillStyle=`rgba(255,150,60,${0.12+0.05*Math.sin(t*4)})`; ctx.beginPath(); ctx.arc(bx,by-6,26,0,7); ctx.fill();
}
registerScene('igloo', drawIglooInterior);

/* ── MISTY FOREST (outdoor · foggy pine woods at dawn) ── */
function drawMistyForest(){
  const t = sceneTime, groundY = H*0.72;

  // pale dawn sky/fog wash (fills canvas)
  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#d8e2e0'); bg.addColorStop(0.5,'#c2d2ce'); bg.addColorStop(1,'#aebeb6');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  // faint sun disc glowing through fog
  ctx.fillStyle='rgba(255,250,220,.4)'; ctx.beginPath(); ctx.arc(W*0.62,H*0.20,34,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,250,220,.2)'; ctx.beginPath(); ctx.arc(W*0.62,H*0.20,54,0,7); ctx.fill();

  // layers of pine silhouettes receding into fog (far = pale, near = dark)
  function pineRow(baseY,scale,alpha,tint){ ctx.fillStyle=`rgba(${tint},${alpha})`;
    for (let x=-20;x<W+20;x+=Math.round(34*scale)){ const px=x+ (baseY*7)%20; const h=70*scale, w=22*scale;
      ctx.beginPath(); ctx.moveTo(px,baseY);
      for (let tri=0;tri<3;tri++){ const ty=baseY-tri*h*0.32; ctx.lineTo(px-w*(1-tri*0.22),ty); ctx.lineTo(px,ty-h*0.34); ctx.lineTo(px+w*(1-tri*0.22),ty); }
      ctx.lineTo(px,baseY); ctx.closePath(); ctx.fill();
      ctx.fillRect(px-1.5*scale,baseY,3*scale,6*scale); }
  }
  pineRow(H*0.44,0.7,0.28,'90,120,110');
  pineRow(H*0.54,0.9,0.45,'60,95,85');
  pineRow(H*0.66,1.2,0.7,'38,70,58');

  // fog bands drifting between the layers
  for (let i=0;i<4;i++){ const fy=H*0.36+i*H*0.11; const fx=(t*(6+i*3))%(W+120)-60;
    ctx.fillStyle=`rgba(220,230,228,${0.30-i*0.03})`; ctx.beginPath(); ctx.ellipse(fx,fy,120,20,0,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(fx+160,fy+8,100,16,0,0,7); ctx.fill(); }

  // mossy forest floor
  const fl=ctx.createLinearGradient(0,groundY,0,H); fl.addColorStop(0,'#3a5238'); fl.addColorStop(1,'#243a24');
  ctx.fillStyle=fl; ctx.fillRect(0,groundY,W,H-groundY);
  // low ground fog over the floor
  ctx.fillStyle='rgba(210,224,220,.35)'; ctx.beginPath(); ctx.ellipse(W*0.5,groundY+6,W*0.7,16,0,0,7); ctx.fill();
  ctx.fillStyle='rgba(210,224,220,.2)'; ctx.beginPath(); ctx.ellipse((t*8)%W,groundY+20,90,12,0,0,7); ctx.fill();

  // near foreground trunks (dark, framing sides) — trunks only, canopy off-screen
  ctx.fillStyle='#1e2c1e'; ctx.fillRect(W*0.04,H*0.30,16,H); ctx.fillRect(W*0.90,H*0.24,18,H);
  ctx.strokeStyle='rgba(10,20,10,.5)'; ctx.lineWidth=1; for (let y=H*0.34;y<H;y+=30){ ctx.beginPath(); ctx.moveTo(W*0.045,y); ctx.quadraticCurveTo(W*0.09,y+8,W*0.13,y+2); ctx.stroke(); }
  // ferns at the base of the trunks
  ctx.strokeStyle='#4a6a3a'; ctx.lineWidth=1.5; for (const gx of [W*0.10,W*0.90,W*0.16]){ for (let k=-2;k<=2;k++){ ctx.beginPath(); ctx.moveTo(gx,H*0.94); ctx.quadraticCurveTo(gx+k*6,H*0.86,gx+k*12,H*0.84); ctx.stroke(); } }
  // a couple of glowing mushrooms + a small stone marker (sides, low)
  ctx.fillStyle='#c85a4a'; ctx.beginPath(); ctx.ellipse(W*0.20,H*0.92,5,3,0,Math.PI,0); ctx.fill(); ctx.fillStyle='#e8e0d0'; ctx.fillRect(W*0.20-1.5,H*0.92,3,4);
  ctx.fillStyle='#8a8a82'; ctx.beginPath(); ctx.moveTo(W*0.82,H*0.94); ctx.lineTo(W*0.82,H*0.86); ctx.arc(W*0.82,H*0.86,4,Math.PI,0); ctx.lineTo(W*0.86,H*0.94); ctx.closePath(); ctx.fill();
  // soft light rays from the sun through the trees
  ctx.fillStyle='rgba(255,250,220,.06)'; for (let i=0;i<3;i++){ ctx.save(); ctx.translate(W*0.62,H*0.20); ctx.rotate(0.5+i*0.25); ctx.fillRect(0,0,18,H*0.7); ctx.restore(); }
}
registerScene('mistyforest', drawMistyForest);

/* ── PLANETARY PROBE LAB (indoor · space mission control) ── */
function drawPlanetLab(){
  const t = sceneTime, floorY = H*0.74;

  // dark control-room wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#0e1424'); wall.addColorStop(1,'#182238');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // big observation viewport showing a planet + stars (center-back)
  const vx=W*0.5, vy=H*0.30, vr=W*0.30;
  ctx.fillStyle='#050814'; ctx.beginPath(); ctx.arc(vx,vy,vr,0,7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(vx,vy,vr-2,0,7); ctx.clip();
  // starfield
  for (let i=0;i<60;i++){ const sx=vx-vr+((i*53)%(vr*2)); const sy=vy-vr+((i*89)%(vr*2)); ctx.fillStyle=`rgba(230,240,255,${0.3+0.5*Math.abs(Math.sin(t*1.5+i))})`; ctx.fillRect(sx,sy,1.2,1.2); }
  // the planet (banded gas giant) slowly rotating shading
  const pr=vr*0.5, pcx=vx+vr*0.25, pcy=vy+vr*0.2;
  const pg=ctx.createLinearGradient(pcx-pr,pcy,pcx+pr,pcy); pg.addColorStop(0,'#c88a4a'); pg.addColorStop(0.5,'#e0b070'); pg.addColorStop(1,'#8a5a2a');
  ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(pcx,pcy,pr,0,7); ctx.fill();
  // bands
  ctx.save(); ctx.beginPath(); ctx.arc(pcx,pcy,pr,0,7); ctx.clip();
  for (let b=-3;b<=3;b++){ ctx.fillStyle=`rgba(120,70,30,${0.2+0.1*(b%2?1:0)})`; ctx.fillRect(pcx-pr, pcy+b*6 + Math.sin(t*0.5+b)*2, pr*2, 4); }
  // a great red spot
  ctx.fillStyle='rgba(200,80,50,.6)'; ctx.beginPath(); ctx.ellipse(pcx+ (t*6)%(pr*2)-pr, pcy+4, 7,4,0,0,7); ctx.fill();
  ctx.restore();
  // thin ring
  ctx.strokeStyle='rgba(220,220,255,.4)'; ctx.lineWidth=2; ctx.save(); ctx.translate(pcx,pcy); ctx.scale(1,0.3); ctx.beginPath(); ctx.arc(0,0,pr*1.5,0,7); ctx.stroke(); ctx.restore();
  // a tiny probe drifting across the viewport
  const qx=vx-vr+ ((t*20)%(vr*2)); ctx.fillStyle='#cfd6e0'; ctx.fillRect(qx,vy-vr*0.5,4,2); ctx.fillStyle='#5ab0e0'; ctx.fillRect(qx-3,vy-vr*0.5,2,2); ctx.fillRect(qx+4,vy-vr*0.5,2,2);
  ctx.restore();
  // viewport frame
  ctx.strokeStyle='#3a4a64'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(vx,vy,vr,0,7); ctx.stroke();
  ctx.strokeStyle='rgba(120,180,240,.3)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(vx,vy,vr-4,0,7); ctx.stroke();

  // side monitor banks with blinking readouts
  function monitor(mx,my,mw,mh){ ctx.fillStyle='#0a1020'; ctx.fillRect(mx,my,mw,mh); ctx.strokeStyle='#2a3a54'; ctx.lineWidth=2; ctx.strokeRect(mx,my,mw,mh);
    // graph line
    ctx.strokeStyle='#4ae0a0'; ctx.lineWidth=1; ctx.beginPath(); for (let x=0;x<=mw-6;x+=3){ const yy=my+mh*0.5+Math.sin(x*0.3+t*3+mx)*mh*0.22; x===0?ctx.moveTo(mx+3,yy):ctx.lineTo(mx+3+x,yy);} ctx.stroke();
    // blinking status dots
    for (let i=0;i<3;i++){ ctx.fillStyle=`rgba(${i===0?'240,90,80':'90,220,120'},${0.4+0.5*Math.abs(Math.sin(t*2+i+mx))})`; ctx.beginPath(); ctx.arc(mx+6+i*8,my+6,2,0,7); ctx.fill(); }
    // text bars
    ctx.fillStyle='rgba(120,180,240,.5)'; for (let k=0;k<3;k++){ ctx.fillRect(mx+4,my+mh-4-k*5, mw*(0.4+0.4*Math.abs(Math.sin(k+t))),2); } }
  monitor(W*0.03,H*0.16,W*0.20,H*0.16); monitor(W*0.03,H*0.36,W*0.20,H*0.16);
  monitor(W*0.77,H*0.16,W*0.20,H*0.16); monitor(W*0.77,H*0.36,W*0.20,H*0.16);

  // control desk with keyboards + a rotating hologram of a small planet
  const desk=ctx.createLinearGradient(0,floorY,0,H); desk.addColorStop(0,'#243044'); desk.addColorStop(1,'#161e2c');
  ctx.fillStyle=desk; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='rgba(120,180,240,.10)'; ctx.fillRect(0,floorY,W,4);
  // console panels along the desk
  for (let i=0;i<6;i++){ const cx=W*0.10+i*W*0.16; ctx.fillStyle='#1a2438'; roundRect(cx-14,floorY+8,28,10,2); ctx.fill();
    for (let k=0;k<6;k++){ ctx.fillStyle=`rgba(${k%2?'90,220,120':'240,200,80'},${0.5+0.4*Math.sin(t*4+k+i)})`; ctx.fillRect(cx-11+k*4,floorY+11,2,2); } }
  // holographic planet projected above the desk (center, high so pet floor clear)
  const hx=W*0.5, hy=floorY+2;
  ctx.fillStyle=`rgba(90,200,240,${0.12})`; ctx.beginPath(); ctx.moveTo(hx-10,hy+6); ctx.lineTo(hx+10,hy+6); ctx.lineTo(hx+4,hy-4); ctx.lineTo(hx-4,hy-4); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(hx,hy-20); ctx.strokeStyle=`rgba(90,210,240,${0.6+0.2*Math.sin(t*3)})`; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(0,0,12,0,7); ctx.stroke();
  ctx.save(); ctx.rotate(t*0.8); ctx.scale(1,0.35); ctx.beginPath(); ctx.arc(0,0,16,0,7); ctx.stroke(); ctx.restore();
  ctx.fillStyle=`rgba(90,200,240,0.2)`; ctx.beginPath(); ctx.arc(0,0,12,0,7); ctx.fill();
  ctx.restore();
}
registerScene('planetlab', drawPlanetLab);

/* ══════════════════ MAGIC & MYSTICISM ══════════════════ */

/* ── WIZARD TOWER (indoor · astronomer-mage study) ── */
function drawWizardTower(){
  const t = sceneTime, floorY = H*0.72;

  // deep indigo stone tower interior
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#1a1436'); wall.addColorStop(1,'#2a1e44');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  // curved stone-block courses (round room)
  ctx.strokeStyle='rgba(0,0,0,.22)'; ctx.lineWidth=1;
  for (let y=18;y<floorY;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.quadraticCurveTo(W*0.5,y+6,W,y); ctx.stroke();
    for (let x=((y/20|0)%2)*20; x<W; x+=40){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+20); ctx.stroke(); } }

  // arched window showing a starry night + moon
  const wx=W*0.5, wy=H*0.10, ww=64, wh=H*0.34;
  ctx.fillStyle='#0a1030'; ctx.beginPath(); ctx.moveTo(wx-ww/2,wy+wh); ctx.lineTo(wx-ww/2,wy+ww/2); ctx.arc(wx,wy+ww/2,ww/2,Math.PI,0); ctx.lineTo(wx+ww/2,wy+wh); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.moveTo(wx-ww/2,wy+wh); ctx.lineTo(wx-ww/2,wy+ww/2); ctx.arc(wx,wy+ww/2,ww/2,Math.PI,0); ctx.lineTo(wx+ww/2,wy+wh); ctx.closePath(); ctx.clip();
  for (let i=0;i<30;i++){ const sx=wx-ww/2+((i*37)%ww); const sy=wy+((i*53)%wh); ctx.fillStyle=`rgba(230,240,255,${0.3+0.5*Math.abs(Math.sin(t*1.5+i))})`; ctx.fillRect(sx,sy,1.2,1.2); }
  ctx.fillStyle='#e8ecc8'; ctx.beginPath(); ctx.arc(wx+14,wy+30,10,0,7); ctx.fill(); ctx.fillStyle='#0a1030'; ctx.beginPath(); ctx.arc(wx+18,wy+27,9,0,7); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='#4a3a6a'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(wx-ww/2,wy+wh); ctx.lineTo(wx-ww/2,wy+ww/2); ctx.arc(wx,wy+ww/2,ww/2,Math.PI,0); ctx.lineTo(wx+ww/2,wy+wh); ctx.stroke();

  // shelves of potions + books (sides)
  for (const [sx,dir] of [[W*0.12,-1],[W*0.88,1]]){ for (let s=0;s<2;s++){ const sy=H*0.20+s*H*0.20;
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(sx-24,sy+18,48,4);
    for (let i=0;i<4;i++){ const bx=sx-18+i*10; if (i%2){ ctx.fillStyle=['#7ae0c0','#e07ab0','#e0c04a','#7a9ae0'][i]; ctx.fillRect(bx-3,sy+8,6,10); ctx.fillStyle='#8a5a3a'; ctx.fillRect(bx-1.5,sy+5,3,3);} else { ctx.fillStyle=['#8a3a3a','#3a5a8a','#3a7a4a'][i%3]; ctx.fillRect(bx-4,sy+4,8,14);} } } }

  // hanging celestial mobile (orrery-ish)
  const ox=W*0.28, oy=H*0.12;
  ctx.strokeStyle='#5a4a2a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,oy); ctx.stroke();
  ctx.fillStyle='#e0b84a'; ctx.beginPath(); ctx.arc(ox,oy+6,4,0,7); ctx.fill();
  for (let k=0;k<3;k++){ const a=t*0.6+k*2.09; ctx.strokeStyle='rgba(200,180,120,.4)'; ctx.beginPath(); ctx.arc(ox,oy+6,10+k*6,0,7); ctx.stroke();
    const mx=ox+Math.cos(a)*(10+k*6), my=oy+6+Math.sin(a)*(10+k*6)*0.5; ctx.fillStyle=['#7a9ae0','#c85a4a','#5ad0a0'][k]; ctx.beginPath(); ctx.arc(mx,my,2.4,0,7); ctx.fill(); }

  // floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#2e2440'); fl.addColorStop(1,'#1e1730');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; for (let x=0;x<W;x+=30){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-8,H); ctx.stroke(); }
  // glowing arcane rug (star pattern, center-low)
  ctx.fillStyle='rgba(120,90,200,.2)'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.90,90,20,0,0,7); ctx.fill();
  ctx.strokeStyle=`rgba(160,130,240,${0.4+0.2*Math.sin(t*2)})`; ctx.lineWidth=1; ctx.save(); ctx.translate(W*0.5,H*0.90); ctx.scale(1,0.22);
  ctx.beginPath(); for (let k=0;k<5;k++){ const a=k*4*Math.PI/5-Math.PI/2; const r=60; k===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);} ctx.closePath(); ctx.stroke(); ctx.restore();

  // lectern with a glowing open spellbook (left, low, off-center)
  const lx=W*0.18, ly=floorY+18;
  ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.moveTo(lx-16,ly+22); ctx.lineTo(lx-4,ly+22); ctx.lineTo(lx-2,ly); ctx.lineTo(lx-18,ly); ctx.closePath(); ctx.fill(); ctx.fillRect(lx-12,ly+22,4,14);
  ctx.fillStyle='#e8dcc4'; ctx.beginPath(); ctx.moveTo(lx-20,ly); ctx.lineTo(lx-2,ly-4); ctx.lineTo(lx,ly+4); ctx.lineTo(lx-18,ly+8); ctx.closePath(); ctx.fill();
  ctx.fillStyle=`rgba(150,220,255,${0.3+0.2*Math.sin(t*3)})`; ctx.beginPath(); ctx.ellipse(lx-10,ly+1,10,5,0,0,7); ctx.fill();
  for (let i=0;i<5;i++){ const gx=lx-10+Math.sin(t*1.5+i)*8; const gy=ly-((t*14+i*8)%24); ctx.fillStyle=`rgba(180,230,255,${0.7-((t*14+i*8)%24)/34})`; ctx.fillRect(gx,gy,1.6,1.6); }

  // floating candle (right, high)
  const cx=W*0.80, cy=floorY-30+Math.sin(t*1.2)*4;
  ctx.fillStyle='rgba(255,200,120,.2)'; ctx.beginPath(); ctx.arc(cx,cy-4,12,0,7); ctx.fill();
  ctx.fillStyle='#efe6d0'; ctx.fillRect(cx-2,cy,4,12); ctx.fillStyle='#f2b02a'; ctx.beginPath(); ctx.ellipse(cx,cy-3,2,4,0,0,7); ctx.fill();
}
registerScene('wizardtower', drawWizardTower);

/* ── FORTUNE TELLER PARLOR (indoor · crystal-ball reading room) ── */
function drawFortuneTeller(){
  const t = sceneTime, floorY = H*0.70;

  // rich draped fabric walls
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#4a1a3a'); wall.addColorStop(1,'#6a2444');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  // drapery folds
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=2; for (let x=10;x<W;x+=26){ ctx.beginPath(); ctx.moveTo(x,0); ctx.quadraticCurveTo(x+8,floorY*0.5,x,floorY); ctx.stroke(); }
  ctx.strokeStyle='rgba(255,200,220,.08)'; for (let x=22;x<W;x+=26){ ctx.beginPath(); ctx.moveTo(x,0); ctx.quadraticCurveTo(x+8,floorY*0.5,x,floorY); ctx.stroke(); }

  // gold star & moon symbols on the wall
  ctx.fillStyle=`rgba(230,200,90,${0.6+0.2*Math.sin(t*2)})`;
  for (const [mx,my,r] of [[W*0.16,H*0.16,6],[W*0.84,H*0.14,7],[W*0.30,H*0.26,4],[W*0.72,H*0.28,5]]){ ctx.save(); ctx.translate(mx,my); for (let k=0;k<5;k++){ ctx.rotate(6.28/5); ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(r*0.3,-r*0.3); ctx.lineTo(r,0); ctx.lineTo(0,0); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  ctx.fillStyle='rgba(230,200,90,.5)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.12,10,0.6,5.7); ctx.fill();

  // hanging beaded lamp
  ctx.strokeStyle='#3a1a2a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.5,0); ctx.lineTo(W*0.5,H*0.05); ctx.stroke();
  ctx.fillStyle='rgba(230,120,60,.3)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.09,20,0,7); ctx.fill();
  ctx.fillStyle=`rgba(230,140,70,${0.8+0.12*Math.sin(t*2)})`; roundRect(W*0.5-12,H*0.05,24,20,8); ctx.fill();
  for (let i=0;i<7;i++){ ctx.fillStyle='#e0b84a'; ctx.beginPath(); ctx.arc(W*0.5-12+i*4,H*0.05+22,1.6,0,7); ctx.fill(); }

  // patterned floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#3a2030'); fl.addColorStop(1,'#281622');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(200,150,90,.2)'; ctx.lineWidth=1; for (let x=-2;x<=8;x++){ ctx.beginPath(); ctx.moveTo(W*0.5+x*24,floorY); ctx.lineTo(W*0.5+x*60,H); ctx.stroke(); }

  // round table draped in cloth (center-back, high) with a glowing crystal ball
  const tx=W*0.5, ty=floorY+8;
  ctx.fillStyle='#5a2a4a'; ctx.beginPath(); ctx.moveTo(tx-46,ty); ctx.lineTo(tx+46,ty); ctx.lineTo(tx+40,H); ctx.lineTo(tx-40,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a1a30'; ctx.beginPath(); ctx.ellipse(tx,ty,46,10,0,0,7); ctx.fill();
  ctx.fillStyle='#e0b84a'; for (let x=tx-40;x<tx+40;x+=12){ ctx.beginPath(); ctx.moveTo(x,ty+18); ctx.lineTo(x+6,ty+26); ctx.lineTo(x+12,ty+18); ctx.fill(); } // tassel fringe
  // brass stand
  ctx.fillStyle='#c9a24a'; ctx.beginPath(); ctx.moveTo(tx-10,ty-4); ctx.lineTo(tx+10,ty-4); ctx.lineTo(tx+5,ty-12); ctx.lineTo(tx-5,ty-12); ctx.closePath(); ctx.fill();
  // crystal ball with swirling mist inside
  const bx=tx, by=ty-24, br=20;
  ctx.fillStyle='rgba(150,200,240,.2)'; ctx.beginPath(); ctx.arc(bx,by,br+8,0,7); ctx.fill();
  const bg=ctx.createRadialGradient(bx-6,by-6,2,bx,by,br); bg.addColorStop(0,'#eaf4ff'); bg.addColorStop(1,'#8ab0d8');
  ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(bx,by,br,0,7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(bx,by,br-1,0,7); ctx.clip();
  for (let i=0;i<3;i++){ const a=t*0.8+i*2.1; ctx.fillStyle=`rgba(140,110,210,${0.25})`; ctx.beginPath(); ctx.ellipse(bx+Math.cos(a)*7,by+Math.sin(a)*7,10,6,a,0,7); ctx.fill(); }
  // little sparks/future-visions
  for (let i=0;i<5;i++){ ctx.fillStyle=`rgba(255,255,255,${0.4+0.4*Math.sin(t*3+i)})`; ctx.beginPath(); ctx.arc(bx-8+ (i*4), by-6+Math.sin(t*2+i)*6, 1,0,7); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle='rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(bx-7,by-7,4,2.5,-0.6,0,7); ctx.fill();

  // tarot cards fanned on the table (left) + a candle (right)
  for (let i=0;i<4;i++){ ctx.save(); ctx.translate(tx-30,ty-2); ctx.rotate(-0.5+i*0.25); ctx.fillStyle='#2a1a3a'; roundRect(-5,-16,10,16,2); ctx.fill(); ctx.strokeStyle='#e0b84a'; ctx.lineWidth=0.8; ctx.strokeRect(-5,-16,10,16); ctx.fillStyle='#e0b84a'; ctx.beginPath(); ctx.arc(0,-8,1.6,0,7); ctx.fill(); ctx.restore(); }
  const cx=tx+34, cy=ty-6; ctx.fillStyle='rgba(255,200,120,.25)'; ctx.beginPath(); ctx.arc(cx,cy-6,10,0,7); ctx.fill();
  ctx.fillStyle='#efe6d0'; ctx.fillRect(cx-2,cy-4,4,10); ctx.fillStyle='#f2b02a'; ctx.beginPath(); ctx.ellipse(cx,cy-6,2,4,0,0,7); ctx.fill();
}
registerScene('fortuneteller', drawFortuneTeller);

/* ── RUNE CIRCLE (outdoor · glowing standing stones at night) ── */
function drawRuneCircle(){
  const t = sceneTime, groundY = H*0.58;

  // night sky with moon + stars
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#0c1030'); sky.addColorStop(0.6,'#1a1a44'); sky.addColorStop(1,'#2e2a54');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  for (let i=0;i<50;i++){ const sx=(i*67+5)%W, sy=(i*37+3)%(groundY*0.9); ctx.fillStyle=`rgba(230,240,255,${0.2+0.35*Math.abs(Math.sin(t*1.3+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }
  ctx.fillStyle='rgba(230,235,210,.16)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.18,40,0,7); ctx.fill();
  ctx.fillStyle='#e8ecc8'; ctx.beginPath(); ctx.arc(W*0.5,H*0.18,24,0,7); ctx.fill();
  ctx.fillStyle='rgba(200,205,180,.4)'; ctx.beginPath(); ctx.arc(W*0.5-8,H*0.16,5,0,7); ctx.arc(W*0.5+7,H*0.20,4,0,7); ctx.fill();

  // distant dark hills
  ctx.fillStyle='#141a2e'; ctx.beginPath(); ctx.moveTo(0,groundY); for (let x=0;x<=W;x+=18){ ctx.lineTo(x,groundY-16-12*Math.sin(x*0.02+1)); } ctx.lineTo(W,groundY); ctx.fill();

  // moor ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#1e2822'); gr.addColorStop(1,'#101812');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);

  // central glowing rune circle inscribed on the ground (ellipse for perspective)
  const ccx=W*0.5, ccy=H*0.84;
  ctx.save(); ctx.translate(ccx,ccy); ctx.scale(1,0.34);
  const pulse=0.5+0.3*Math.sin(t*2);
  ctx.strokeStyle=`rgba(120,200,255,${pulse})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,120,0,7); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,100,0,7); ctx.stroke();
  // inscribed pentagram-ish lines
  ctx.strokeStyle=`rgba(150,120,240,${0.4+0.2*Math.sin(t*2+1)})`; ctx.lineWidth=1.5; ctx.beginPath();
  for (let k=0;k<=5;k++){ const a=k*4*Math.PI/5-Math.PI/2; const x=Math.cos(a)*100,y=Math.sin(a)*100; k===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  // rune glyphs around the ring
  ctx.strokeStyle=`rgba(120,220,255,${pulse})`; ctx.lineWidth=2;
  for (let k=0;k<12;k++){ const a=k/12*6.28; const x=Math.cos(a)*110, y=Math.sin(a)*110; ctx.beginPath(); ctx.moveTo(x-3,y-4); ctx.lineTo(x+3,y+4); ctx.moveTo(x+2,y-4); ctx.lineTo(x-1,y); ctx.stroke(); }
  ctx.restore();
  // soft glow over the circle
  const cg=ctx.createRadialGradient(ccx,ccy,4,ccx,ccy,90); cg.addColorStop(0,`rgba(120,200,255,${0.12*pulse+0.05})`); cg.addColorStop(1,'rgba(120,200,255,0)'); ctx.fillStyle=cg; ctx.fillRect(0,groundY,W,H-groundY);

  // ring of standing stones (larger toward front, glowing runes on them)
  function stone(px,py,h,w,glow){ ctx.fillStyle='#3a3a44'; roundRect(px-w/2,py-h,w,h,4); ctx.fill();
    ctx.fillStyle='#2a2a34'; ctx.fillRect(px-w/2,py-h,w*0.4,h);
    // glowing rune carving
    ctx.strokeStyle=`rgba(120,210,255,${glow})`; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(px,py-h*0.7); ctx.lineTo(px,py-h*0.3); ctx.moveTo(px,py-h*0.55); ctx.lineTo(px+w*0.2,py-h*0.45); ctx.moveTo(px,py-h*0.45); ctx.lineTo(px-w*0.2,py-h*0.35); ctx.stroke(); }
  // back stones (small)
  stone(W*0.30,groundY+14,26,10,0.5+0.3*Math.sin(t*2)); stone(W*0.70,groundY+14,26,10,0.5+0.3*Math.sin(t*2+1));
  stone(W*0.5,groundY+8,22,9,0.5+0.3*Math.sin(t*2+2));
  // side stones (medium)
  stone(W*0.16,groundY+40,40,14,0.5+0.3*Math.sin(t*2+3)); stone(W*0.84,groundY+40,40,14,0.5+0.3*Math.sin(t*2+4));
  // front stones (big, framing) — kept to far sides so center circle/pet reads
  stone(W*0.06,groundY+78,58,18,0.5+0.3*Math.sin(t*2+5)); stone(W*0.94,groundY+78,58,18,0.5+0.3*Math.sin(t*2+6));

  // floating motes of arcane light rising
  for (let i=0;i<16;i++){ const mx=ccx+Math.sin(t*0.6+i)*80; const my=groundY-6+ ((groundY) - ((t*10+i*20)%(H-groundY+40))); ctx.fillStyle=`rgba(150,220,255,${0.2+0.4*Math.abs(Math.sin(t*2+i))})`; ctx.beginPath(); ctx.arc(mx,my,1.4,0,7); ctx.fill(); }
}
registerScene('runecircle', drawRuneCircle);

/* ── ARCANE LIBRARY (indoor · floating glowing grimoires) ── */
function drawArcaneLibrary(){
  const t = sceneTime, floorY = H*0.74;

  // vast dim library
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#161028'); wall.addColorStop(1,'#241a3a');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // tall bookshelves receding (both sides, perspective)
  function shelf(baseX,dir){ for (let s=0;s<7;s++){ const sy=H*0.06+s*H*0.10; const inset=Math.abs(baseX-W*0.5)*0.0;
    const sx=baseX; const sw=W*0.26;
    ctx.fillStyle='#2a1e14'; ctx.fillRect(sx,sy,sw,5);
    for (let i=0;i<8;i++){ const bx=sx+3+i*(sw-6)/8; const bh=H*0.10-8-((i*3)%4); ctx.fillStyle=['#5a2a3a','#2a4a5a','#4a3a1a','#3a2a4a','#2a4a2a'][(i+s)%5]; ctx.fillRect(bx,sy-bh,(sw-6)/8-1,bh);
      ctx.fillStyle='rgba(220,190,110,.4)'; ctx.fillRect(bx,sy-bh+2,(sw-6)/8-1,1); } } }
  shelf(0,-1); shelf(W*0.74,1);
  // dark central aisle vanishing to a glowing arch
  ctx.fillStyle='#0e0a1a'; ctx.beginPath(); ctx.moveTo(W*0.34,H*0.06); ctx.lineTo(W*0.66,H*0.06); ctx.lineTo(W*0.60,floorY); ctx.lineTo(W*0.40,floorY); ctx.closePath(); ctx.fill();
  const arch=ctx.createRadialGradient(W*0.5,H*0.30,4,W*0.5,H*0.30,70); arch.addColorStop(0,`rgba(150,120,240,${0.3+0.1*Math.sin(t*2)})`); arch.addColorStop(1,'rgba(150,120,240,0)');
  ctx.fillStyle=arch; ctx.fillRect(W*0.3,H*0.10,W*0.4,H*0.5);

  // floating glowing grimoires drifting & flapping
  function grimoire(gx,gy,sc,col){ const flap=Math.sin(t*3+gx)*0.5; ctx.save(); ctx.translate(gx,gy); ctx.scale(sc,sc);
    // glow
    ctx.fillStyle=`rgba(${col},0.18)`; ctx.beginPath(); ctx.arc(0,0,20,0,7); ctx.fill();
    // pages (open book)
    ctx.fillStyle='#e8dcc4'; ctx.beginPath(); ctx.moveTo(0,-2); ctx.quadraticCurveTo(-14,-6-flap*4,-16,4); ctx.quadraticCurveTo(-8,2,0,6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,-2); ctx.quadraticCurveTo(14,-6+flap*4,16,4); ctx.quadraticCurveTo(8,2,0,6); ctx.closePath(); ctx.fill();
    // cover spine
    ctx.fillStyle=`rgb(${col})`; ctx.fillRect(-1.5,-4,3,12);
    // magic sparkle trail
    ctx.fillStyle=`rgba(${col},0.8)`; ctx.beginPath(); ctx.arc(0,-8,1.6,0,7); ctx.fill();
    ctx.restore(); }
  grimoire(W*0.30,H*0.30+Math.sin(t*0.8)*10,1.2,'170,130,240');
  grimoire(W*0.68,H*0.24+Math.sin(t*0.7+2)*12,1.0,'110,200,220');
  grimoire(W*0.5,H*0.44+Math.sin(t*0.9+1)*8,0.9,'230,180,110');
  grimoire(W*0.20,H*0.50+Math.sin(t*0.6+3)*10,0.8,'220,120,180');
  grimoire(W*0.80,H*0.48+Math.sin(t*0.75+4)*10,0.85,'130,220,150');

  // floating candles dotted around
  for (const [cx,cy] of [[W*0.14,H*0.20],[W*0.86,H*0.18],[W*0.5,H*0.14]]){ const fy=cy+Math.sin(t*1.2+cx)*4;
    ctx.fillStyle='rgba(255,200,120,.2)'; ctx.beginPath(); ctx.arc(cx,fy-3,9,0,7); ctx.fill();
    ctx.fillStyle='#efe6d0'; ctx.fillRect(cx-1.5,fy,3,9); ctx.fillStyle='#f2b02a'; ctx.beginPath(); ctx.ellipse(cx,fy-3,1.6,3.4,0,0,7); ctx.fill(); }

  // dark wood floor with a glowing sigil
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#241a30'); fl.addColorStop(1,'#160f22');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=1; for (let x=0;x<W;x+=30){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-8,H); ctx.stroke(); }
  ctx.save(); ctx.translate(W*0.5,H*0.90); ctx.scale(1,0.26); ctx.strokeStyle=`rgba(160,130,240,${0.4+0.2*Math.sin(t*2)})`; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(0,0,70,0,7); ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,54,0,7); ctx.stroke();
  ctx.beginPath(); for (let k=0;k<=6;k++){ const a=k/6*6.28; k===0?ctx.moveTo(Math.cos(a)*62,Math.sin(a)*62):ctx.lineTo(Math.cos(a)*62,Math.sin(a)*62);} ctx.stroke(); ctx.restore();
}
registerScene('arcanelibrary', drawArcaneLibrary);

/* ── FAIRY RING (outdoor · enchanted mushroom ring at night) ── */
function drawFairyRing(){
  const t = sceneTime, groundY = H*0.56;

  // twilight enchanted-forest sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#1a1440'); sky.addColorStop(0.6,'#2a2454'); sky.addColorStop(1,'#3a3a5a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  for (let i=0;i<40;i++){ const sx=(i*71+5)%W, sy=(i*31+3)%(groundY*0.8); ctx.fillStyle=`rgba(230,240,255,${0.2+0.3*Math.abs(Math.sin(t*1.4+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }

  // silhouetted forest with a light-dappled clearing
  ctx.fillStyle='#10201a'; for (let i=0;i<6;i++){ const tx=i*70; ctx.fillRect(tx-8,groundY-100,16,100); ctx.beginPath(); ctx.arc(tx,groundY-100,30,0,7); ctx.fill(); }
  // moonbeam into the clearing
  ctx.fillStyle='rgba(190,210,255,.08)'; ctx.beginPath(); ctx.moveTo(W*0.4,0); ctx.lineTo(W*0.6,0); ctx.lineTo(W*0.7,groundY+40); ctx.lineTo(W*0.3,groundY+40); ctx.closePath(); ctx.fill();

  // grassy clearing floor
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#1e3a26'); gr.addColorStop(1,'#122414');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);

  // the fairy ring — circle of glowing mushrooms (ellipse in perspective)
  const rcx=W*0.5, rcy=H*0.82, rrx=110, rry=34;
  // glowing worn grass ring under it
  ctx.strokeStyle=`rgba(150,255,200,${0.2+0.12*Math.sin(t*2)})`; ctx.lineWidth=6; ctx.save(); ctx.translate(rcx,rcy); ctx.scale(1,rry/rrx); ctx.beginPath(); ctx.arc(0,0,rrx,0,7); ctx.stroke(); ctx.restore();
  const cg=ctx.createRadialGradient(rcx,rcy,6,rcx,rcy,rrx); cg.addColorStop(0,'rgba(120,255,190,0.10)'); cg.addColorStop(1,'rgba(120,255,190,0)'); ctx.fillStyle=cg; ctx.fillRect(0,groundY,W,H-groundY);
  // mushrooms around the ring
  function fmush(mx,my,sc){ ctx.save(); ctx.translate(mx,my); ctx.scale(sc,sc); const glow=0.5+0.3*Math.sin(t*2+mx);
    ctx.fillStyle=`rgba(160,255,210,${0.22*glow})`; ctx.beginPath(); ctx.arc(0,-4,14,0,7); ctx.fill();
    ctx.fillStyle='#e8eee0'; ctx.beginPath(); ctx.moveTo(-3,0); ctx.lineTo(-4,-9); ctx.lineTo(4,-9); ctx.lineTo(3,0); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#c65a8a'; ctx.beginPath(); ctx.ellipse(0,-9,9,6,0,Math.PI,0); ctx.fill();
    ctx.fillStyle='#f0e0ef'; for (let k=0;k<3;k++){ ctx.beginPath(); ctx.arc(-4+k*4,-10,1.4,0,7); ctx.fill(); }
    ctx.restore(); }
  for (let k=0;k<10;k++){ const a=k/10*6.28; const mx=rcx+Math.cos(a)*rrx; const my=rcy+Math.sin(a)*rry; const sc=0.7+ (my-rcy+rry)/(2*rry)*0.8; fmush(mx,my,sc); }

  // dancing fairy lights (wisps) circling above the ring
  for (let i=0;i<10;i++){ const a=t*1.2+i*0.63; const rad=rrx*0.7*(0.6+0.4*Math.sin(t*0.7+i)); const fx=rcx+Math.cos(a)*rad; const fy=rcy-20+Math.sin(a)*rad*0.3 - Math.abs(Math.sin(t+i))*10;
    const gl=0.5+0.5*Math.sin(t*4+i); ctx.fillStyle=`rgba(200,255,210,${gl})`; ctx.beginPath(); ctx.arc(fx,fy,2,0,7); ctx.fill();
    ctx.fillStyle=`rgba(150,255,190,${gl*0.3})`; ctx.beginPath(); ctx.arc(fx,fy,5,0,7); ctx.fill();
    // tiny trailing sparkle
    ctx.fillStyle=`rgba(255,255,255,${gl*0.6})`; ctx.fillRect(fx-Math.cos(a)*4,fy-Math.sin(a)*2,1,1); }

  // glowing wildflowers + toadstool bits (sides, low)
  for (const [fx,fc] of [[W*0.10,'120,220,255'],[W*0.90,'255,180,220'],[W*0.16,'200,160,255']]){ ctx.fillStyle=`rgba(${fc},${0.6+0.3*Math.sin(t*2+fx)})`; for (let k=0;k<5;k++){ const a=k/5*6.28; ctx.beginPath(); ctx.arc(fx+Math.cos(a)*3,H*0.92+Math.sin(a)*3,1.6,0,7); ctx.fill(); } ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(fx,H*0.92,1.2,0,7); ctx.fill(); }
}
registerScene('fairyring', drawFairyRing);
