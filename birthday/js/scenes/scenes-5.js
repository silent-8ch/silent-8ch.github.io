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
