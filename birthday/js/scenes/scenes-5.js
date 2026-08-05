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

  // sprite lanterns hanging between stalls
  SpriteRenderer.submit({sprite:'lantern',phase:'foreground',x:W*0.38,y:H*0.18,anchorY:0.5,frame:Math.floor(t*3)%4});
  SpriteRenderer.submit({sprite:'lantern',phase:'foreground',x:W*0.62,y:H*0.16,anchorY:0.5,frame:Math.floor(t*3+1)%4});
  // NPC browsing the stalls
  SpriteRenderer.submit({sprite:'npcAdult',phase:'actors',x:W*0.50,y:H*0.88,anchorY:1,frame:Math.floor(t*8)%4});
  SpriteRenderer.submit({sprite:'npcChild',phase:'actors',x:W*0.42,y:H*0.86,anchorY:1,frame:Math.floor(t*8+2)%4});
  // streetlamp illuminating the market
  SpriteRenderer.submit({sprite:'streetlamp',x:W*0.10,y:H*0.78,frame:Math.floor(sceneTime*3)%4});
  // market awning over a stall
  SpriteRenderer.submit({sprite:'marketAwning',x:W*0.50,y:H*0.56,frame:Math.floor(sceneTime*3)%4});
  SpriteRenderer.submit({sprite:'cobblestone',x:W*0.50,y:H*0.82,frame:1});
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
  drawSpriteCloud(W*0.55+Math.sin(t*0.1)*8,H*0.10,0.7); drawSpriteCloud(W*0.82+Math.sin(t*0.12+2)*6,H*0.16,0.5);

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

  // NPC shoppers
  SpriteRenderer.submit({sprite:'npcAdult',phase:'actors',x:W*0.50,y:H*0.88,anchorY:1,frame:Math.floor(t*8)%4});
  SpriteRenderer.submit({sprite:'npcChild',phase:'actors',x:W*0.58,y:H*0.86,anchorY:1,frame:Math.floor(t*8+2)%4});
  // bush on the side
  SpriteRenderer.submit({sprite:'bush',phase:'ground',x:W*0.92,y:groundY+18,anchorY:1,frame:0});
  // pennant flags strung across the market
  SpriteRenderer.submit({sprite:'pennantFlags',x:W*0.50,y:groundY-16,frame:Math.floor(sceneTime*4)%4});
  // market awning over a booth
  SpriteRenderer.submit({sprite:'marketAwning',x:W*0.28,y:groundY+6,frame:Math.floor(sceneTime*3)%4});
  SpriteRenderer.submit({sprite:'grassDirtEdge',x:W*0.50,y:groundY+40,frame:2});
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

  // sprite lanterns in the sky
  for (let i=0;i<3;i++){
    SpriteRenderer.submit({sprite:'lantern',phase:'background',x:W*(0.2+i*0.3)+Math.sin(t*0.5+i)*14,y:H*0.12+i*H*0.06+Math.sin(t*0.8+i)*6,anchorY:0.5,frame:Math.floor(t*3+i)%4});
  }
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
  drawSpriteCloud(W*0.2+Math.sin(t*0.1)*8,H*0.09,0.7); drawSpriteCloud(W*0.5+Math.sin(t*0.08+2)*6,H*0.15,0.5);

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
  drawSpriteCloud((W*0.4 + t*6)%(W+80)-40,H*0.10,0.7);
  drawSpriteCloud((W*0.8 + t*4)%(W+80)-40,H*0.20,0.55);
  drawSpriteCloud((W*0.1 + t*5)%(W+80)-40,H*0.28,0.45);

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
  drawSpriteCloud(W*0.2+Math.sin(t*0.09)*8,H*0.10,0.6); drawSpriteCloud(W*0.55+Math.sin(t*0.07+2)*6,H*0.16,0.45);

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

  // sprite butterfly near the flowers
  SpriteRenderer.submit({sprite:'butterfly',phase:'actors',x:W*0.50+Math.sin(t*1.2)*20,y:H*0.60+Math.cos(t*1.5)*10,anchorY:0.5,frame:Math.floor(t*8)%4});
  // NPC shopper
  SpriteRenderer.submit({sprite:'npcAdult',phase:'actors',x:W*0.48,y:H*0.90,anchorY:1,frame:Math.floor(t*8)%4});
  // pennant flags across the flower market
  SpriteRenderer.submit({sprite:'pennantFlags',x:W*0.50,y:groundY-18,frame:Math.floor(sceneTime*4)%4});
  // flowering bush by the stalls
  SpriteRenderer.submit({sprite:'floweringBush',x:W*0.08,y:groundY+22,frame:Math.floor(sceneTime*2.5)%4});
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
  // fireflies sprite among the glowing flowers
  SpriteRenderer.submit({sprite:'fireflies',phase:'actors',x:W*0.60+Math.sin(t*0.6)*16,y:groundY+6+Math.sin(t*0.9)*10,anchorY:0.5,frame:Math.floor(t*5)%4});
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
  // jellyfish drifting past the tunnel glass
  SpriteRenderer.submit({sprite:'jellyfish',phase:'actors',x:W*0.72+Math.sin(t*0.4)*18,y:H*0.28+Math.sin(t*0.6)*14,anchorY:0.5,frame:Math.floor(t*5)%4});
  // whale shark gliding overhead
  SpriteRenderer.submit({sprite:'whaleShark',phase:'background',x:W*0.5+Math.sin(t*0.3)*30,y:H*0.10+Math.sin(t*0.4)*6,anchorY:0.5,frame:Math.floor(t*5)%4});
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

  // sprite lanterns on the quay lampposts
  SpriteRenderer.submit({sprite:'lantern',phase:'foreground',x:W*0.10,y:quayY-54,anchorY:0.5,frame:Math.floor(t*3)%4});
  SpriteRenderer.submit({sprite:'lantern',phase:'foreground',x:W*0.90,y:quayY-54,anchorY:0.5,frame:Math.floor(t*3+1)%4});
  // a cat on the quay
  SpriteRenderer.submit({sprite:'cat',phase:'actors',x:W*0.55,y:quayY+12,width:55,height:55,anchorY:1,frame:Math.floor(t*7)%4}); /* large — prominent */
  // streetlamp on the quay
  SpriteRenderer.submit({sprite:'streetlamp',x:W*0.30,y:quayY+14,frame:Math.floor(sceneTime*3)%4});
  SpriteRenderer.submit({sprite:'cobblestone',x:W*0.50,y:quayY+30,frame:2});
  SpriteRenderer.submit({sprite:'dockEdge',x:W*0.50,y:quayY+6,frame:3});
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

  // extra gift box on the counter
  SpriteRenderer.submit({sprite:'giftBox',phase:'ground',x:W*0.50,y:floorY+20,anchorY:1,frame:0});
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
  drawSpriteCloud(W*0.18+Math.sin(t*0.1)*8,H*0.10,0.6); drawSpriteCloud(W*0.82+Math.sin(t*0.08+2)*6,H*0.16,0.5);

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
  // crab scuttling on the moonlit sand
  SpriteRenderer.submit({sprite:'crab',phase:'actors',x:W*0.68+Math.sin(t*1.0)*14,y:H*0.86,anchorY:1,frame:Math.floor(t*7)%4});
  SpriteRenderer.submit({sprite:'beachSand',x:W*0.50,y:H*0.76,frame:1});
  SpriteRenderer.submit({sprite:'sandShoreline',x:W*0.50,y:sandTop+6,frame:3});
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
  drawSpriteCloud(W*0.2+Math.sin(t*0.1)*8,H*0.10,0.7); drawSpriteCloud(W*0.5+Math.sin(t*0.08+2)*6,H*0.18,0.5); drawSpriteCloud(W*0.9+Math.sin(t*0.12+4)*5,H*0.08,0.4);

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
  // wildflowers along the field edge
  SpriteRenderer.submit({sprite:'wildflowers',x:W*0.12,y:H*0.82,frame:Math.floor(sceneTime*3)%4});
  SpriteRenderer.submit({sprite:'wildflowers',x:W*0.88,y:H*0.86,frame:Math.floor(sceneTime*3+2)%4});
  SpriteRenderer.submit({sprite:'meadowGrass',x:W*0.50,y:fieldY+30,frame:2});
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
  // parrot perched on the railing
  SpriteRenderer.submit({sprite:'parrot',phase:'foreground',x:W*0.56,y:deckY+4,anchorY:1,frame:Math.floor(t*7)%4});
  SpriteRenderer.submit({sprite:'woodStairs',x:W*0.20,y:H*0.92,frame:1});
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

/* ── ALCHEMY LAB (indoor · bubbling apparatus & distillation) ── */
function drawAlchemyLab(){
  const t = sceneTime, benchY = H*0.66;

  // aged parchment-stone wall
  const wall=ctx.createLinearGradient(0,0,0,benchY); wall.addColorStop(0,'#2e2a1e'); wall.addColorStop(1,'#453c28');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,benchY);
  ctx.strokeStyle='rgba(0,0,0,.16)'; ctx.lineWidth=1; for (let y=18;y<benchY;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // amber lamp glow
  const glow=ctx.createRadialGradient(W*0.5,benchY-10,10,W*0.5,benchY-10,150); glow.addColorStop(0,'rgba(230,180,90,.18)'); glow.addColorStop(1,'rgba(230,180,90,0)'); ctx.fillStyle=glow; ctx.fillRect(0,0,W,benchY);

  // a wall chart with zodiac/alchemical symbols (center-back, high)
  ctx.fillStyle='#e6d8b4'; ctx.fillRect(W*0.40,H*0.10,W*0.20,H*0.20); ctx.strokeStyle='#5a4a2a'; ctx.lineWidth=2; ctx.strokeRect(W*0.40,H*0.10,W*0.20,H*0.20);
  ctx.strokeStyle='#6a5230'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(W*0.5,H*0.18,14,0,7); ctx.stroke();
  for (let k=0;k<8;k++){ const a=k/8*6.28; ctx.beginPath(); ctx.moveTo(W*0.5+Math.cos(a)*10,H*0.18+Math.sin(a)*10); ctx.lineTo(W*0.5+Math.cos(a)*14,H*0.18+Math.sin(a)*14); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(W*0.44,H*0.26); ctx.lineTo(W*0.5,H*0.22); ctx.lineTo(W*0.56,H*0.26); ctx.stroke(); // triangle (fire)

  // shelves of ingredient jars (sides)
  for (const sx of [W*0.12,W*0.88]){ ctx.fillStyle='#3a2a18'; ctx.fillRect(sx-24,H*0.24,48,4);
    for (let i=0;i<4;i++){ const jx=sx-18+i*12; ctx.fillStyle='rgba(200,220,210,.35)'; roundRect(jx-4,H*0.24-14,8,14,2); ctx.fill(); ctx.fillStyle=['#7ae0c0','#e07a5a','#c0b040','#a06fe0'][i]; ctx.fillRect(jx-3,H*0.24-8,6,8); ctx.fillStyle='#5a3a1a'; ctx.fillRect(jx-3,H*0.24-16,6,3); } }

  // wooden bench
  const bench=ctx.createLinearGradient(0,benchY,0,H); bench.addColorStop(0,'#6a4a2e'); bench.addColorStop(1,'#4a3320'); ctx.fillStyle=bench; ctx.fillRect(0,benchY,W,H-benchY);
  ctx.fillStyle='rgba(255,240,200,.1)'; ctx.fillRect(0,benchY,W,3);

  // central distillation apparatus: retort + coiled condenser + collecting flask
  const ax=W*0.5, ay=benchY+2;
  // burner + flame under the round-bottom flask
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(ax-40,ay+24,20,4); ctx.fillRect(ax-34,ay+18,3,6); ctx.fillRect(ax-26,ay+18,3,6);
  for (let i=0;i<4;i++){ const fx=ax-36+i*4; const fh=6+4*Math.sin(t*7+i); ctx.fillStyle='#5ab0e0'; ctx.beginPath(); ctx.moveTo(fx-2,ay+18); ctx.quadraticCurveTo(fx,ay+18-fh,fx+2,ay+18); ctx.fill(); }
  // round flask with green brew
  const rx=ax-30, ry=ay+8;
  ctx.fillStyle='rgba(200,230,220,.3)'; ctx.beginPath(); ctx.arc(rx,ry,12,0,7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(rx,ry,11,0,7); ctx.clip(); ctx.fillStyle='#4ad07a'; ctx.fillRect(rx-12,ry-2,24,14);
  for (let i=0;i<4;i++){ const bx=rx-6+i*4; const by=ry+8-((t*16+i*11)%14); ctx.fillStyle='rgba(180,255,200,.7)'; ctx.beginPath(); ctx.arc(bx,by,1.4,0,7); ctx.fill(); } ctx.restore();
  ctx.fillStyle='rgba(200,230,220,.4)'; ctx.fillRect(rx-2,ry-20,4,10);
  // glass tube arcing to a coiled condenser
  ctx.strokeStyle='rgba(200,230,240,.5)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(rx,ry-18); ctx.quadraticCurveTo(ax,ay-24,ax+24,ay-10); ctx.stroke();
  // spiral condenser
  ctx.save(); ctx.translate(ax+24,ay+2); ctx.strokeStyle='rgba(180,210,230,.6)'; ctx.lineWidth=2; ctx.beginPath(); for (let a=0;a<Math.PI*5;a+=0.3){ const r=3+a*1.1; const x=Math.cos(a)*4; const y=-a*2; a===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke(); ctx.restore();
  // collecting flask with amber drops
  const cxx=ax+40, cyy=ay+16; ctx.fillStyle='rgba(200,220,220,.3)'; ctx.beginPath(); ctx.moveTo(cxx-8,cyy-14); ctx.lineTo(cxx-8,cyy-6); ctx.lineTo(cxx-14,cyy+6); ctx.lineTo(cxx+2,cyy+6); ctx.lineTo(cxx-4,cyy-6); ctx.lineTo(cxx-4,cyy-14); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#e0a040'; ctx.beginPath(); ctx.moveTo(cxx-12,cyy+6); ctx.lineTo(cxx,cyy+6); ctx.lineTo(cxx-6,cyy-1); ctx.closePath(); ctx.fill();
  const dropY=cyy-14+ ((t*20)%18); ctx.fillStyle='#e0b040'; ctx.beginPath(); ctx.arc(cxx-6,dropY,1.4,0,7); ctx.fill();

  // an open tome + scattered runestones on the bench (left, low)
  ctx.fillStyle='#7a2a2a'; roundRect(W*0.14-16,H*0.86,32,10,2); ctx.fill(); ctx.fillStyle='#e8dcc4'; ctx.beginPath(); ctx.moveTo(W*0.14-14,H*0.86); ctx.lineTo(W*0.14,H*0.855); ctx.lineTo(W*0.14,H*0.86+8); ctx.lineTo(W*0.14-14,H*0.86+9); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(W*0.14+14,H*0.86); ctx.lineTo(W*0.14,H*0.855); ctx.lineTo(W*0.14,H*0.86+8); ctx.lineTo(W*0.14+14,H*0.86+9); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#8a8078'; for (const rx2 of [W*0.80,W*0.86,W*0.83]){ ctx.beginPath(); ctx.arc(rx2,H*0.90,4,0,7); ctx.fill(); ctx.strokeStyle='#4ad0c0'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(rx2,H*0.90-2); ctx.lineTo(rx2,H*0.90+2); ctx.stroke(); }
}
registerScene('alchemylab', drawAlchemyLab);

/* ── WITCH COTTAGE (indoor · cozy hearth & hanging herbs) ── */
function drawWitchCottage(){
  const t = sceneTime, floorY = H*0.70;

  // warm timber & plaster wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#4a3826'); wall.addColorStop(1,'#5e4630');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  // exposed beams
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(0,H*0.08,W,8); ctx.fillRect(0,H*0.30,W,6);
  for (let x=20;x<W;x+=70){ ctx.fillRect(x,0,8,H*0.30); }

  // stone hearth with a bubbling cauldron (right)
  const hx=W*0.70, hy=H*0.16, hw=W*0.32, hh=floorY-hy;
  ctx.fillStyle='#7a7068'; ctx.fillRect(hx,hy,hw,hh);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let y=hy;y<floorY;y+=14){ for (let x=hx+((y/14|0)%2)*12; x<hx+hw; x+=24){ ctx.strokeRect(x,y,24,14); } }
  const fbY=floorY-40; ctx.fillStyle='#1a0e08'; ctx.fillRect(hx+8,fbY,hw-16,40);
  // fire
  for (let i=0;i<6;i++){ const fx=hx+16+i*(hw-32)/5; const fh=12+7*Math.sin(t*6+i); ctx.fillStyle='#e0641a'; ctx.beginPath(); ctx.moveTo(fx-4,floorY-4); ctx.quadraticCurveTo(fx,floorY-4-fh,fx+4,floorY-4); ctx.fill(); ctx.fillStyle='#f2b02a'; ctx.beginPath(); ctx.moveTo(fx-2,floorY-4); ctx.quadraticCurveTo(fx,floorY-4-fh*0.6,fx+2,floorY-4); ctx.fill(); }
  // cauldron on a hook
  const cx=hx+hw*0.5, cy=fbY-2; ctx.fillStyle='#1a1a20'; ctx.beginPath(); ctx.arc(cx,cy,16,0,Math.PI); ctx.fill(); ctx.fillRect(cx-16,cy-4,32,4);
  ctx.strokeStyle='#2a2a30'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cx,cy-4,14,Math.PI,0); ctx.stroke();
  ctx.fillStyle='#7a4ad0'; ctx.beginPath(); ctx.ellipse(cx,cy-4,14,5,0,0,7); ctx.fill();
  for (let i=0;i<5;i++){ const bx=cx-8+i*4; const by=cy-4-((t*14+i*13)%18); ctx.fillStyle='rgba(190,150,255,.7)'; ctx.beginPath(); ctx.arc(bx,by,1.6,0,7); ctx.fill(); }
  ctx.strokeStyle='rgba(200,170,255,.3)'; ctx.lineWidth=2; ctx.beginPath(); for (let k=0;k<=8;k++){ const yy=cy-10-k*5, xx=cx+Math.sin(t*2+k*0.6)*5; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);} ctx.stroke();

  // small round window with moon (left)
  ctx.fillStyle='#1a2440'; ctx.beginPath(); ctx.arc(W*0.16,H*0.20,22,0,7); ctx.fill();
  ctx.fillStyle='#e8ecc8'; ctx.beginPath(); ctx.arc(W*0.20,H*0.16,8,0,7); ctx.fill();
  ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(W*0.16,H*0.20,22,0,7); ctx.stroke(); ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(W*0.16-22,H*0.20); ctx.lineTo(W*0.16+22,H*0.20); ctx.moveTo(W*0.16,H*0.20-22); ctx.lineTo(W*0.16,H*0.20+22); ctx.stroke();

  // hanging bundles of dried herbs + garlic from a beam (left/center)
  for (const [bx,bc] of [[W*0.30,'#5a7a3a'],[W*0.40,'#7a6a3a'],[W*0.10,'#8a8a7a']]){ ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(bx,H*0.08); ctx.lineTo(bx,H*0.14); ctx.stroke(); ctx.fillStyle=bc; for (let k=0;k<5;k++){ ctx.beginPath(); ctx.ellipse(bx+(k%2?4:-4),H*0.14+k*5,3,8,k%2?0.4:-0.4,0,7); ctx.fill(); } }

  // shelf with a spell book, candle & a black cat curled up (left)
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(W*0.06,H*0.42,W*0.34,5);
  ctx.fillStyle='#5a2a4a'; ctx.fillRect(W*0.10,H*0.42-14,10,14); ctx.fillStyle='#3a5a8a'; ctx.fillRect(W*0.14,H*0.42-12,9,12);
  const ccx=W*0.20, ccy=H*0.42; ctx.fillStyle='#efe6d0'; ctx.fillRect(ccx-1.5,ccy-16,3,16); ctx.fillStyle=`rgba(242,176,42,${0.85+0.1*Math.sin(t*3)})`; ctx.beginPath(); ctx.ellipse(ccx,ccy-18,2,4,0,0,7); ctx.fill();
  // black cat
  const catX=W*0.32; ctx.fillStyle='#1a1a20'; ctx.beginPath(); ctx.ellipse(catX,ccy-4,10,5,0,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(catX+8,ccy-8,4,0,7); ctx.fill(); ctx.beginPath(); ctx.moveTo(catX+6,ccy-11); ctx.lineTo(catX+7,ccy-15); ctx.lineTo(catX+9,ccy-12); ctx.closePath(); ctx.moveTo(catX+10,ccy-11); ctx.lineTo(catX+11,ccy-15); ctx.lineTo(catX+12,ccy-11); ctx.fill();
  ctx.fillStyle=`rgba(120,230,140,${0.6+0.3*Math.sin(t*2)})`; ctx.fillRect(catX+7,ccy-9,1.4,1.4); ctx.fillRect(catX+10,ccy-9,1.4,1.4);
  // curl tail
  ctx.strokeStyle='#1a1a20'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(catX-9,ccy-3); ctx.quadraticCurveTo(catX-16,ccy-8,catX-12,ccy-1); ctx.stroke();

  // plank floor + braided rug
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#6a4a2e'); fl.addColorStop(1,'#4a3320'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let x=0;x<W;x+=26){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-6,H); ctx.stroke(); }
  ctx.fillStyle='#7a3a4a'; ctx.beginPath(); ctx.ellipse(W*0.4,H*0.90,80,18,0,0,7); ctx.fill(); ctx.fillStyle='#5a6a3a'; ctx.beginPath(); ctx.ellipse(W*0.4,H*0.90,52,12,0,0,7); ctx.fill(); ctx.fillStyle='#7a3a4a'; ctx.beginPath(); ctx.ellipse(W*0.4,H*0.90,28,7,0,0,7); ctx.fill();
  // a broom leaning (left, low)
  ctx.strokeStyle='#8a6038'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W*0.08,floorY-4); ctx.lineTo(W*0.14,H); ctx.stroke(); ctx.fillStyle='#c9a24a'; ctx.beginPath(); ctx.moveTo(W*0.14,H-2); ctx.lineTo(W*0.10,H-16); ctx.lineTo(W*0.18,H-16); ctx.closePath(); ctx.fill();
}
registerScene('witchcottage', drawWitchCottage);

/* ── MOON TEMPLE (outdoor · moonlit marble ruins) ── */
function drawMoonTemple(){
  const t = sceneTime, floorY = H*0.66;

  // deep night sky
  const sky=ctx.createLinearGradient(0,0,0,floorY); sky.addColorStop(0,'#0e1436'); sky.addColorStop(0.6,'#1e2450'); sky.addColorStop(1,'#3a3868');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,floorY);
  for (let i=0;i<50;i++){ const sx=(i*61+5)%W, sy=(i*37+3)%(floorY*0.85); ctx.fillStyle=`rgba(230,240,255,${0.2+0.35*Math.abs(Math.sin(t*1.3+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }
  // large full moon centered behind the temple
  const mX=W*0.5, mY=H*0.24;
  ctx.fillStyle='rgba(235,240,225,.14)'; ctx.beginPath(); ctx.arc(mX,mY,58,0,7); ctx.fill();
  ctx.fillStyle='#eef0dc'; ctx.beginPath(); ctx.arc(mX,mY,38,0,7); ctx.fill();
  ctx.fillStyle='rgba(205,210,190,.5)'; ctx.beginPath(); ctx.arc(mX-12,mY-8,7,0,7); ctx.arc(mX+11,mY+7,8,0,7); ctx.arc(mX+4,mY-14,4,0,7); ctx.fill();

  // silhouetted mountains
  ctx.fillStyle='#141a30'; ctx.beginPath(); ctx.moveTo(0,floorY); for (let x=0;x<=W;x+=24){ ctx.lineTo(x,floorY-30-24*Math.abs(Math.sin(x*0.01+1))); } ctx.lineTo(W,floorY); ctx.fill();

  // temple: a pediment on columns, moon shining through
  const colY=floorY, colTop=H*0.34;
  // stylobate steps
  ctx.fillStyle='#8890a0'; ctx.fillRect(W*0.10,floorY,W*0.80,8); ctx.fillStyle='#767e8e'; ctx.fillRect(W*0.06,floorY+8,W*0.88,8);
  // columns (silhouette pale marble)
  const cols=[0.18,0.34,0.5,0.66,0.82];
  for (const c of cols){ const cxp=W*c; const grd=ctx.createLinearGradient(cxp-8,0,cxp+8,0); grd.addColorStop(0,'#5a627a'); grd.addColorStop(0.5,'#9aa2b6'); grd.addColorStop(1,'#5a627a'); ctx.fillStyle=grd; ctx.fillRect(cxp-8,colTop,16,colY-colTop);
    // fluting
    ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; for (let k=-2;k<=2;k++){ ctx.beginPath(); ctx.moveTo(cxp+k*3,colTop); ctx.lineTo(cxp+k*3,colY); ctx.stroke(); }
    // capital
    ctx.fillStyle='#aab0c0'; ctx.fillRect(cxp-11,colTop-6,22,6); }
  // some columns broken (ruin feel) — one shorter with rubble
  ctx.fillStyle='#0e1436'; ctx.fillRect(W*0.66-8,colTop,16,H*0.10); // erase top of 4th column
  ctx.fillStyle='#7a8294'; ctx.fillRect(W*0.66-8,colTop+H*0.10,16,colY-colTop-H*0.10);
  // pediment / architrave across the top
  ctx.fillStyle='#8890a0'; ctx.fillRect(W*0.12,colTop-14,W*0.56,10);
  ctx.beginPath(); ctx.moveTo(W*0.10,colTop-14); ctx.lineTo(W*0.40,colTop-40); ctx.lineTo(W*0.70,colTop-14); ctx.closePath(); ctx.fill();
  // crescent emblem in the pediment
  ctx.fillStyle='#eef0dc'; ctx.beginPath(); ctx.arc(W*0.40,colTop-22,6,0.6,5.7); ctx.fill();

  // moonlit marble floor with reflection
  const fl=ctx.createLinearGradient(0,floorY+16,0,H); fl.addColorStop(0,'#3a4258'); fl.addColorStop(1,'#242a3a'); ctx.fillStyle=fl; ctx.fillRect(0,floorY+16,W,H-floorY-16);
  ctx.strokeStyle='rgba(180,200,230,.12)'; ctx.lineWidth=1; for (let x=-2;x<=8;x++){ ctx.beginPath(); ctx.moveTo(W*0.5+x*24,floorY+16); ctx.lineTo(W*0.5+x*70,H); ctx.stroke(); }
  // moon reflection column on the polished floor
  for (let y=floorY+16; y<H; y+=3){ const p=(y-floorY-16)/(H-floorY-16); const wob=Math.sin(y*0.4+t*1.5)*(3+p*10); ctx.fillStyle=`rgba(235,240,220,${0.10*(1-p)})`; ctx.fillRect(mX-8+wob,y,16+p*8,2); }

  // glowing offering braziers on the steps (sides, low)
  for (const bx of [W*0.16,W*0.84]){ ctx.fillStyle='#3a3444'; ctx.fillRect(bx-2,floorY-4,4,20); ctx.beginPath(); ctx.ellipse(bx,floorY-6,9,4,0,0,7); ctx.fill();
    for (let i=0;i<4;i++){ const fx=bx-4+i*3; const fh=6+4*Math.sin(t*6+i+bx); ctx.fillStyle='#7ac0f0'; ctx.beginPath(); ctx.moveTo(fx-2,floorY-8); ctx.quadraticCurveTo(fx,floorY-8-fh,fx+2,floorY-8); ctx.fill(); }
    ctx.fillStyle='rgba(120,200,255,.12)'; ctx.beginPath(); ctx.arc(bx,floorY-12,18,0,7); ctx.fill(); }
  SpriteRenderer.submit({sprite:'stoneStairs',x:W*0.50,y:floorY+18,frame:2});
}
registerScene('moontemple', drawMoonTemple);

/* ── WILL-O'-WISP MARSH (outdoor · eerie glowing swamp at night) ── */
function drawWillOWispMarsh(){
  const t = sceneTime, waterY = H*0.56;

  // sickly green-blue night sky with mist
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#0e1a1e'); sky.addColorStop(0.6,'#16302c'); sky.addColorStop(1,'#22463a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  for (let i=0;i<34;i++){ const sx=(i*67+5)%W, sy=(i*31+3)%(waterY*0.7); ctx.fillStyle=`rgba(200,230,220,${0.15+0.25*Math.abs(Math.sin(t*1.2+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }
  // hazy low moon
  ctx.fillStyle='rgba(180,220,180,.16)'; ctx.beginPath(); ctx.arc(W*0.74,H*0.16,26,0,7); ctx.fill(); ctx.fillStyle='#cfe0c0'; ctx.beginPath(); ctx.arc(W*0.74,H*0.16,15,0,7); ctx.fill();

  // dead twisted trees silhouettes
  function deadTree(bx,h){ ctx.strokeStyle='#0e1814'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(bx,waterY); ctx.lineTo(bx,waterY-h); ctx.stroke();
    ctx.lineWidth=2; for (const br of [[-1,0.5],[1,0.6],[-1,0.8]]){ ctx.beginPath(); ctx.moveTo(bx,waterY-h*br[1]); ctx.quadraticCurveTo(bx+br[0]*14,waterY-h*br[1]-6,bx+br[0]*22,waterY-h*br[1]-16); ctx.stroke(); } }
  deadTree(W*0.14,90); deadTree(W*0.42,70); deadTree(W*0.90,100); deadTree(W*0.62,60);

  // drifting mist bands
  for (let i=0;i<4;i++){ const fy=H*0.34+i*H*0.09; const fx=(t*(5+i*3))%(W+120)-60; ctx.fillStyle=`rgba(150,200,180,${0.12-i*0.02})`; ctx.beginPath(); ctx.ellipse(fx,fy,120,16,0,0,7); ctx.fill(); }

  // marsh water
  const wat=ctx.createLinearGradient(0,waterY,0,H); wat.addColorStop(0,'#14322a'); wat.addColorStop(1,'#0a1c18'); ctx.fillStyle=wat; ctx.fillRect(0,waterY,W,H-waterY);
  // reeds sticking out (sides)
  ctx.strokeStyle='#1e3a28'; ctx.lineWidth=2; for (const gx of [W*0.06,W*0.12,W*0.90,W*0.96,W*0.20]){ for (let k=-1;k<=1;k++){ ctx.beginPath(); ctx.moveTo(gx+k*3,H); ctx.quadraticCurveTo(gx+k*3+Math.sin(t*1.5+k+gx)*3,waterY+10,gx+k*3,waterY-6); ctx.stroke(); } }
  // lily pads
  ctx.fillStyle='#1e4a34'; for (const [px,py] of [[W*0.3,waterY+30],[W*0.7,waterY+50],[W*0.5,waterY+70]]){ ctx.beginPath(); ctx.ellipse(px,py,10,4,0,0.4,6.6); ctx.fill(); }

  // the will-o'-wisps — glowing floating orbs with reflections on the water
  for (let i=0;i<6;i++){ const wx=W*0.16+i*W*0.13 + Math.sin(t*0.7+i*1.3)*30; const wy=waterY-20+Math.sin(t*1.1+i*2)*24; const gl=0.6+0.4*Math.sin(t*3+i);
    const col=i%2? '160,255,180':'150,220,255';
    // halo
    ctx.fillStyle=`rgba(${col},${0.14*gl})`; ctx.beginPath(); ctx.arc(wx,wy,14,0,7); ctx.fill();
    ctx.fillStyle=`rgba(${col},${0.3*gl})`; ctx.beginPath(); ctx.arc(wx,wy,7,0,7); ctx.fill();
    ctx.fillStyle=`rgba(230,255,240,${gl})`; ctx.beginPath(); ctx.arc(wx,wy,2.6,0,7); ctx.fill();
    // reflection streak on the water below
    if (wy<waterY){ ctx.fillStyle=`rgba(${col},${0.12*gl})`; ctx.fillRect(wx-2, waterY, 4, (waterY-wy)*0.4+6); }
  }
  // fireflies-like tiny glints
  for (let i=0;i<12;i++){ const fx=(i*53+ Math.sin(t*0.6+i)*20)%W; const fy=waterY-8+Math.sin(t*1.5+i)*20 - (i%3)*6; ctx.fillStyle=`rgba(180,255,200,${0.2+0.4*Math.abs(Math.sin(t*3+i))})`; ctx.beginPath(); ctx.arc(fx,fy,1.2,0,7); ctx.fill(); }
}
registerScene('willowispmarsh', drawWillOWispMarsh);

/* ── ENCHANTED MIRROR HALL (indoor · gallery of magic mirrors) ── */
function drawMirrorHall(){
  const t = sceneTime, floorY = H*0.72;

  // dim violet gallery
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#1c1630'); wall.addColorStop(1,'#2c2246');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  // faint damask pattern
  ctx.fillStyle='rgba(150,120,200,.05)'; for (let y=24;y<floorY;y+=30){ for (let x=((y/30|0)%2)*20; x<W; x+=40){ ctx.beginPath(); ctx.arc(x,y,7,0,7); ctx.fill(); } }

  // ornate ceiling arch + hanging chandelier
  ctx.strokeStyle='rgba(200,170,240,.2)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,H*0.06); ctx.quadraticCurveTo(W*0.5,H*0.12,W,H*0.06); ctx.stroke();
  const chx=W*0.5; ctx.strokeStyle='#3a2a4a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(chx,0); ctx.lineTo(chx,H*0.10); ctx.stroke();
  for (let k=0;k<5;k++){ const a=k/5*6.28; ctx.fillStyle=`rgba(255,220,150,${0.6+0.3*Math.sin(t*3+k)})`; ctx.beginPath(); ctx.arc(chx+Math.cos(a)*10,H*0.12+Math.sin(a)*5,2,0,7); ctx.fill(); }
  ctx.fillStyle='rgba(255,220,150,.12)'; ctx.beginPath(); ctx.arc(chx,H*0.12,20,0,7); ctx.fill();

  // a row of ornate magic mirrors, each showing a different otherworldly view
  function mirror(mx,mw,mh,view){ const my=H*0.20;
    // gold ornate frame
    ctx.fillStyle='#c9a24a'; roundRect(mx-mw/2-6,my-6,mw+12,mh+12,10); ctx.fill();
    ctx.fillStyle='#e0c070'; ctx.beginPath(); ctx.arc(mx,my-6,6,Math.PI,0); ctx.fill(); // crest
    // glass with a magical scene
    ctx.save(); roundRect(mx-mw/2,my,mw,mh,6); ctx.clip();
    if (view==='forest'){ const g=ctx.createLinearGradient(0,my,0,my+mh); g.addColorStop(0,'#1a3a4a'); g.addColorStop(1,'#0e2a1e'); ctx.fillStyle=g; ctx.fillRect(mx-mw/2,my,mw,mh);
      ctx.fillStyle='#123a28'; for (let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(mx-mw/2+i*mw/3,my+mh); ctx.lineTo(mx-mw/2+i*mw/3+6,my+mh*0.4); ctx.lineTo(mx-mw/2+i*mw/3+12,my+mh); ctx.fill(); }
      ctx.fillStyle=`rgba(150,255,190,${0.4+0.3*Math.sin(t*2)})`; ctx.beginPath(); ctx.arc(mx,my+mh*0.4,3,0,7); ctx.fill(); }
    else if (view==='fire'){ const g=ctx.createLinearGradient(0,my,0,my+mh); g.addColorStop(0,'#3a1010'); g.addColorStop(1,'#e05a1a'); ctx.fillStyle=g; ctx.fillRect(mx-mw/2,my,mw,mh);
      for (let i=0;i<5;i++){ const fx=mx-mw/2+6+i*(mw-12)/4; const fh=mh*0.4+8*Math.sin(t*6+i); ctx.fillStyle='#f2b02a'; ctx.beginPath(); ctx.moveTo(fx-4,my+mh); ctx.quadraticCurveTo(fx,my+mh-fh,fx+4,my+mh); ctx.fill(); } }
    else { const g=ctx.createLinearGradient(0,my,0,my+mh); g.addColorStop(0,'#0a1030'); g.addColorStop(1,'#2a1a54'); ctx.fillStyle=g; ctx.fillRect(mx-mw/2,my,mw,mh);
      for (let i=0;i<16;i++){ const sx=mx-mw/2+((i*29)%mw); const sy=my+((i*37)%mh); ctx.fillStyle=`rgba(230,230,255,${0.4+0.5*Math.abs(Math.sin(t*1.5+i))})`; ctx.fillRect(sx,sy,1.4,1.4); }
      ctx.fillStyle='#e8ecc8'; ctx.beginPath(); ctx.arc(mx+mw*0.2,my+mh*0.3,6,0,7); ctx.fill(); }
    // glass sheen sweep
    ctx.fillStyle='rgba(255,255,255,.10)'; ctx.save(); ctx.translate(mx,my); ctx.rotate(-0.5); ctx.fillRect(-mw*0.1+Math.sin(t*0.7)*mw*0.3,-mh,mw*0.14,mh*2.5); ctx.restore();
    ctx.restore();
    // magic glow around the frame
    ctx.strokeStyle=`rgba(180,140,255,${0.25+0.15*Math.sin(t*2+mx)})`; ctx.lineWidth=2; roundRect(mx-mw/2-6,my-6,mw+12,mh+12,10); ctx.stroke();
  }
  mirror(W*0.22,54,120,'forest');
  mirror(W*0.5,64,140,'stars');
  mirror(W*0.78,54,120,'fire');

  // reflective checkered floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#2a2240'); fl.addColorStop(1,'#181228'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  for (let y=floorY;y<H;y+=14){ for (let x=((y/14|0)%2)*14; x<W; x+=28){ ctx.fillStyle='rgba(150,120,200,.12)'; ctx.fillRect(x,y,14,14); } }
  // faint mirror-glow reflections on floor
  for (const [mx,col] of [[W*0.22,'150,255,190'],[W*0.5,'200,200,255'],[W*0.78,'242,176,42']]){ ctx.fillStyle=`rgba(${col},0.06)`; ctx.beginPath(); ctx.ellipse(mx,floorY+18,30,8,0,0,7); ctx.fill(); }
  // floating candelabra flames (sides, low)
  for (const cx of [W*0.08,W*0.92]){ const cy=floorY-10+Math.sin(t*1.2+cx)*3; ctx.fillStyle='#3a2a4a'; ctx.fillRect(cx-2,cy,4,H-cy-4); ctx.fillStyle=`rgba(255,200,120,.2)`; ctx.beginPath(); ctx.arc(cx,cy-4,10,0,7); ctx.fill(); ctx.fillStyle=`rgba(242,176,42,${0.85+0.1*Math.sin(t*3+cx)})`; ctx.beginPath(); ctx.ellipse(cx,cy-4,2.4,5,0,0,7); ctx.fill(); }
}
registerScene('enchantedmirrorhall', drawMirrorHall);

/* ── HUMMINGBIRD GARDEN (outdoor · flowers & darting hummingbirds) ── */
function drawHummingbirdGarden(){
  const t = sceneTime, groundY = H*0.62;

  // bright sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#6fbce8'); sky.addColorStop(1,'#dbeecf');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='#fff6b0'; ctx.beginPath(); ctx.arc(W*0.82,H*0.12,18,0,7); ctx.fill();
  drawSpriteCloud(W*0.2+Math.sin(t*0.1)*8,H*0.10,0.6); drawSpriteCloud(W*0.55+Math.sin(t*0.08+2)*6,H*0.16,0.45);

  // leafy hedge backdrop
  ctx.fillStyle='#3a7a3a'; ctx.fillRect(0,groundY-30,W,34);
  ctx.fillStyle='#4a8f42'; for (let x=0;x<W;x+=16){ ctx.beginPath(); ctx.arc(x,groundY-30,10,Math.PI,0); ctx.fill(); }
  // a climbing trellis with vines (left)
  ctx.strokeStyle='#8a6038'; ctx.lineWidth=2; for (let x=W*0.06;x<W*0.24;x+=8){ ctx.beginPath(); ctx.moveTo(x,H*0.14); ctx.lineTo(x,groundY); ctx.stroke(); }
  for (let y=H*0.16;y<groundY;y+=10){ ctx.beginPath(); ctx.moveTo(W*0.06,y); ctx.lineTo(W*0.24,y); ctx.stroke(); }
  ctx.fillStyle='#c05a8a'; for (let i=0;i<8;i++){ const vx=W*0.06+ (i*13)%(W*0.18); const vy=H*0.16+ (i*29)%(groundY-H*0.16); ctx.beginPath(); ctx.arc(vx,vy,3,0,7); ctx.fill(); }

  // garden bed ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#5a9e3a'); gr.addColorStop(1,'#3f7a26'); ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);

  // tall tubular flowers (trumpet/fuchsia) that hummingbirds love — sides
  function trumpetFlower(fx,baseY,h,col){ ctx.strokeStyle='#3a7a2a'; ctx.lineWidth=2; const sway=Math.sin(t*1.4+fx*0.05)*3;
    ctx.beginPath(); ctx.moveTo(fx,baseY); ctx.quadraticCurveTo(fx+sway,baseY-h*0.6,fx+sway,baseY-h); ctx.stroke();
    // hanging trumpet blossoms
    for (let k=0;k<3;k++){ const bx=fx+sway+ (k-1)*7, by=baseY-h+6+k*4; ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx-4,by+10); ctx.lineTo(bx+4,by+10); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(bx,by+10,4,1.6,0,0,7); ctx.fill(); }
    // leaves
    ctx.fillStyle='#4a8a2e'; ctx.beginPath(); ctx.ellipse(fx-4,baseY-h*0.4,8,4,-0.4,0,7); ctx.fill(); }
  trumpetFlower(W*0.10,H*0.90,70,'#e2482e'); trumpetFlower(W*0.20,H*0.86,54,'#e26fb0'); trumpetFlower(W*0.90,H*0.90,72,'#a06fe0'); trumpetFlower(W*0.80,H*0.86,52,'#e2a02e');
  // low daisy clumps (sides)
  for (const [dx,dy] of [[W*0.16,H*0.80],[W*0.86,H*0.82]]){ for (let d=0;d<3;d++){ const cx2=dx+d*8-8, cy2=dy+ (d%2)*4; ctx.fillStyle='#fff'; for (let k=0;k<7;k++){ const a=k/7*6.28; ctx.beginPath(); ctx.ellipse(cx2+Math.cos(a)*4,cy2+Math.sin(a)*4,2.2,1.2,a,0,7); ctx.fill(); } ctx.fillStyle='#e0b040'; ctx.beginPath(); ctx.arc(cx2,cy2,1.8,0,7); ctx.fill(); } }

  // hummingbirds darting (fast wing blur, hovering near flowers)
  function hummingbird(hx,hy,dir,col){ ctx.save(); ctx.translate(hx,hy); ctx.scale(dir,1);
    // wing blur
    const wingSpread=4+Math.abs(Math.sin(t*20))*4; ctx.fillStyle='rgba(200,220,230,.35)'; ctx.beginPath(); ctx.ellipse(-1,-1,9,wingSpread,0.5,0,7); ctx.fill();
    // body
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(0,0,7,3.4,0.1,0,7); ctx.fill();
    // iridescent throat
    ctx.fillStyle='#d43a5a'; ctx.beginPath(); ctx.arc(4,1,2,0,7); ctx.fill();
    // head + long beak
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(5,-1,2.6,0,7); ctx.fill();
    ctx.strokeStyle='#333'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(7,-1); ctx.lineTo(15,-2); ctx.stroke();
    // tail
    ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-12,-3); ctx.lineTo(-12,3); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(5.6,-1.4,0.7,0,7); ctx.fill();
    ctx.restore(); }
  hummingbird(W*0.28+Math.sin(t*1.5)*10, H*0.34+Math.cos(t*1.2)*8, 1, '#2f9a6a');
  hummingbird(W*0.68+Math.sin(t*1.1+2)*14, H*0.44+Math.cos(t*1.6)*10, -1, '#3a7ad0');
  hummingbird(W*0.5+Math.sin(t*0.9+1)*20, H*0.26+Math.cos(t*1.3)*6, 1, '#7a9a2a');
  // a hanging nectar feeder (center-back, high)
  const nfx=W*0.5, nfy=H*0.16;
  ctx.strokeStyle='#8a6038'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(nfx,0); ctx.lineTo(nfx,nfy); ctx.stroke();
  ctx.fillStyle='rgba(230,90,90,.7)'; roundRect(nfx-8,nfy,16,16,4); ctx.fill(); ctx.fillStyle='#d43a5a'; for (let k=0;k<3;k++){ ctx.beginPath(); ctx.arc(nfx-5+k*5,nfy+16,2,0,7); ctx.fill(); }
}
registerScene('hummingbirdgarden', drawHummingbirdGarden);

/* ── GELATERIA (indoor · Italian gelato parlor) ── */
function drawGelateria(){
  const t = sceneTime, counterY = H*0.60;

  // sunny mint-and-cream wall
  const wall=ctx.createLinearGradient(0,0,0,counterY); wall.addColorStop(0,'#f2ead6'); wall.addColorStop(1,'#e6dcc2');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,counterY);
  // pistachio wainscot
  ctx.fillStyle='#a8ce8a'; ctx.fillRect(0,counterY-22,W,22);
  ctx.strokeStyle='rgba(0,0,0,.1)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,counterY-22); ctx.lineTo(W,counterY-22); ctx.stroke();

  // striped awning across the top (café style)
  for (let i=0;i<12;i++){ ctx.fillStyle= i%2?'#f2ece0':'#4aa060'; ctx.beginPath(); ctx.moveTo(i*(W/12),0); ctx.lineTo((i+1)*(W/12),0); ctx.lineTo((i+1)*(W/12),16); ctx.lineTo((i+0.5)*(W/12),22); ctx.lineTo(i*(W/12),16); ctx.closePath(); ctx.fill(); }

  // chalkboard menu (left)
  ctx.fillStyle='#2a2a24'; ctx.fillRect(W*0.06,H*0.14,W*0.22,H*0.22); ctx.strokeStyle='#8a6038'; ctx.lineWidth=3; ctx.strokeRect(W*0.06,H*0.14,W*0.22,H*0.22);
  ctx.fillStyle='rgba(240,230,210,.8)'; ctx.font='9px sans-serif';
  ctx.strokeStyle='rgba(240,230,210,.7)'; ctx.lineWidth=1; for (let k=0;k<5;k++){ ctx.beginPath(); ctx.moveTo(W*0.09,H*0.18+k*8); ctx.lineTo(W*0.24,H*0.18+k*8); ctx.stroke(); }
  ctx.fillStyle='#e0b0c0'; ctx.beginPath(); ctx.arc(W*0.10,H*0.16,3,0,7); ctx.fill();

  // hanging pendant lights
  for (const lx of [W*0.5,W*0.78]){ ctx.strokeStyle='#8a7a5a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx,22); ctx.lineTo(lx,H*0.12); ctx.stroke();
    ctx.fillStyle='rgba(255,220,150,.2)'; ctx.beginPath(); ctx.arc(lx,H*0.15,14,0,7); ctx.fill();
    ctx.fillStyle='#e8c060'; ctx.beginPath(); ctx.moveTo(lx-8,H*0.12); ctx.lineTo(lx+8,H*0.12); ctx.lineTo(lx+5,H*0.16); ctx.lineTo(lx-5,H*0.16); ctx.closePath(); ctx.fill();
    ctx.fillStyle=`rgba(255,220,140,${0.85+0.1*Math.sin(t*2+lx)})`; ctx.beginPath(); ctx.arc(lx,H*0.16,3,0,7); ctx.fill(); }

  // gelato display case (glass front) with mounded tubs of colorful gelato
  const caseY=counterY, caseH=H*0.16;
  ctx.fillStyle='#d8cdb8'; ctx.fillRect(0,caseY,W,caseH+ (H-caseY-caseH));
  // glass case
  ctx.fillStyle='rgba(200,230,240,.2)'; ctx.fillRect(0,caseY-4,W,caseH);
  ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1; ctx.strokeRect(2,caseY-4,W-4,caseH);
  // tubs of gelato with rounded mounds + a scoop/label sign in each
  const flav=[['#f2c0a0','choc'],['#a8ce8a','pist'],['#f2a0b8','strw'],['#f2e2a0','mango'],['#c0a0e0','grape'],['#8a5a3a','coff']];
  for (let i=0;i<6;i++){ const tx=W*0.08+i*W*0.155; const ty=caseY+caseH*0.55;
    ctx.fillStyle='#c9c9d0'; roundRect(tx-16,ty,32,caseH*0.4,2); ctx.fill(); // metal tub
    ctx.fillStyle=flav[i][0]; ctx.beginPath(); ctx.moveTo(tx-16,ty+2); ctx.quadraticCurveTo(tx-8,ty-10,tx,ty-4); ctx.quadraticCurveTo(tx+8,ty-12,tx+16,ty+2); ctx.closePath(); ctx.fill();
    // a little scoop-ball on top
    ctx.beginPath(); ctx.arc(tx,ty-8,5,0,7); ctx.fill();
    // paper flavor tag
    ctx.fillStyle='#fff'; ctx.fillRect(tx-6,ty-2,12,5); ctx.fillStyle='#8a5a3a'; ctx.fillRect(tx-4,ty,8,1); }

  // a display cone stack + a served cone on the counter (sides, low)
  const cx=W*0.9, cy=H-8;
  for (let k=0;k<3;k++){ ctx.fillStyle='#d8a86a'; ctx.beginPath(); ctx.moveTo(cx-8,cy-30-k*6); ctx.lineTo(cx,cy-10-k*6); ctx.lineTo(cx+8,cy-30-k*6); ctx.closePath(); ctx.fill(); }
  // served cone (left, low)
  const sx=W*0.12, sy=H-10;
  ctx.fillStyle='#d8a86a'; ctx.beginPath(); ctx.moveTo(sx-7,sy-20); ctx.lineTo(sx,sy); ctx.lineTo(sx+7,sy-20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(150,100,50,.5)'; ctx.lineWidth=0.7; ctx.beginPath(); ctx.moveTo(sx-5,sy-16); ctx.lineTo(sx+3,sy-6); ctx.moveTo(sx+5,sy-16); ctx.lineTo(sx-3,sy-6); ctx.stroke();
  ctx.fillStyle='#f2a0b8'; ctx.beginPath(); ctx.arc(sx-3,sy-22,5,0,7); ctx.fill(); ctx.fillStyle='#a8ce8a'; ctx.beginPath(); ctx.arc(sx+3,sy-24,5,0,7); ctx.fill(); ctx.fillStyle='#f2e2a0'; ctx.beginPath(); ctx.arc(sx,sy-30,5,0,7); ctx.fill();
  ctx.fillStyle='#c0392b'; ctx.beginPath(); ctx.arc(sx,sy-34,1.6,0,7); ctx.fill();
}
registerScene('gelateria', drawGelateria);

/* ── LOTUS POND (outdoor · serene lotus water garden) ── */
function drawLotusPond(){
  const t = sceneTime, waterY = H*0.34;

  // soft warm sky
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#bfe0ee'); sky.addColorStop(1,'#f2e6d6');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  ctx.fillStyle='rgba(255,240,200,.5)'; ctx.beginPath(); ctx.arc(W*0.24,H*0.12,26,0,7); ctx.fill();
  drawSpriteCloud(W*0.7+Math.sin(t*0.08)*8,H*0.09,0.6);

  // distant reeds/bank at horizon
  ctx.fillStyle='#4a6a3a'; ctx.fillRect(0,waterY-14,W,18);
  ctx.strokeStyle='#5a7a3a'; ctx.lineWidth=2; for (let x=6;x<W;x+=12){ ctx.beginPath(); ctx.moveTo(x,waterY-14); ctx.lineTo(x+Math.sin(t*1.2+x)*2,waterY-30); ctx.stroke(); }

  // pond water (fills lower canvas)
  const wat=ctx.createLinearGradient(0,waterY,0,H); wat.addColorStop(0,'#5a9aa8'); wat.addColorStop(0.5,'#3a7a8a'); wat.addColorStop(1,'#2a5a6a');
  ctx.fillStyle=wat; ctx.fillRect(0,waterY,W,H-waterY);
  // sky reflection shimmer + ripple lines
  ctx.fillStyle='rgba(240,230,200,.10)'; ctx.fillRect(0,waterY,W,10);
  ctx.strokeStyle='rgba(200,230,235,.14)'; ctx.lineWidth=1; for (let y=waterY+10;y<H;y+=10){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.05+t*1.3+y)*1.6; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }
  // expanding ripple rings where dew drops fall
  for (let i=0;i<3;i++){ const rp=((t*0.5+i*0.7)%1); const rr=8+rp*40; const rx=W*(0.3+i*0.25), ry=waterY+40+i*30; ctx.strokeStyle=`rgba(220,240,240,${0.3*(1-rp)})`; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(rx,ry,rr,rr*0.35,0,0,7); ctx.stroke(); }

  // lily pads scattered (varied sizes, sides + back)
  function pad(px,py,r){ ctx.fillStyle='#2e7a4a'; ctx.beginPath(); ctx.ellipse(px,py,r,r*0.4,0,0.5,6.5); ctx.closePath(); ctx.fill(); ctx.fillStyle='#3a8a54'; ctx.beginPath(); ctx.ellipse(px,py,r*0.7,r*0.28,0,0.5,6.4); ctx.fill(); ctx.strokeStyle='rgba(20,60,30,.4)'; ctx.lineWidth=0.6; for (let k=0;k<4;k++){ ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+Math.cos(k*1.4)*r*0.8,py+Math.sin(k*1.4)*r*0.35); ctx.stroke(); } }
  pad(W*0.2,waterY+30,20); pad(W*0.8,waterY+40,22); pad(W*0.5,waterY+18,16); pad(W*0.12,H*0.80,26); pad(W*0.9,H*0.84,24);

  // lotus blooms (pink layered petals) — sides + back, keeping center-lower clear
  function lotus(px,py,sc){ ctx.save(); ctx.translate(px,py); ctx.scale(sc,sc);
    // outer petals
    ctx.fillStyle='#e589b0'; for (let k=0;k<7;k++){ const a=k/7*6.28; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-9,4,10,0,0,7); ctx.fill(); ctx.restore(); }
    // inner petals
    ctx.fillStyle='#f2b8d2'; for (let k=0;k<5;k++){ const a=k/5*6.28+0.4; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-5,3,7,0,0,7); ctx.fill(); ctx.restore(); }
    // seed pod center
    ctx.fillStyle='#e0c04a'; ctx.beginPath(); ctx.arc(0,0,3,0,7); ctx.fill(); ctx.fillStyle='#8a7a2a'; for (let k=0;k<5;k++){ const a=k/5*6.28; ctx.beginPath(); ctx.arc(Math.cos(a)*1.4,Math.sin(a)*1.4,0.6,0,7); ctx.fill(); }
    ctx.restore(); }
  lotus(W*0.24,waterY+28,1.2); lotus(W*0.82,waterY+38,1.3); lotus(W*0.5,waterY+14,0.8);
  // a couple of buds on stems
  for (const [bx,by] of [[W*0.14,waterY+50],[W*0.9,waterY+56]]){ ctx.strokeStyle='#3a7a4a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(bx,by+14); ctx.lineTo(bx,by); ctx.stroke(); ctx.fillStyle='#e589b0'; ctx.beginPath(); ctx.ellipse(bx,by-4,4,8,0,0,7); ctx.fill(); ctx.fillStyle='#3a7a4a'; ctx.beginPath(); ctx.ellipse(bx,by-2,3,4,0,0,7); ctx.fill(); }

  // a dragonfly hovering
  const dx=W*0.4+Math.sin(t*1.2)*40, dy=waterY-4+Math.cos(t*1.6)*8;
  ctx.fillStyle='#3aa0c0'; ctx.fillRect(dx-1,dy-1,10,2); const wf=Math.abs(Math.sin(t*16))*2+2; ctx.fillStyle='rgba(200,230,240,.5)'; ctx.beginPath(); ctx.ellipse(dx+2,dy,6,wf,0.4,0,7); ctx.ellipse(dx+2,dy,6,wf,-0.4,0,7); ctx.fill();
  // water ripples on the pond
  SpriteRenderer.submit({sprite:'waterRipple',x:W*0.32,y:waterY+54,frame:Math.floor(sceneTime*5)%4});
  SpriteRenderer.submit({sprite:'waterRipple',x:W*0.72,y:H*0.72,frame:Math.floor(sceneTime*5+2)%4});
}
registerScene('lotuspond', drawLotusPond);

/* ── VINTAGE TRAIN STATION (indoor · covered platform, steam era) ── */
function drawTrainStation(){
  const t = sceneTime, platformY = H*0.72;

  // iron-and-glass roof + morning light
  const roof=ctx.createLinearGradient(0,0,0,H*0.20); roof.addColorStop(0,'#3a4048'); roof.addColorStop(1,'#5a6068');
  ctx.fillStyle=roof; ctx.fillRect(0,0,W,H*0.14);
  // glazed roof panels with sky glow between girders
  ctx.fillStyle='#cfe0ea'; ctx.fillRect(0,H*0.14,W,H*0.10);
  ctx.strokeStyle='#2a3038'; ctx.lineWidth=3; for (let x=0;x<=W;x+=W/8){ ctx.beginPath(); ctx.moveTo(x,H*0.14); ctx.lineTo(x,H*0.24); ctx.stroke(); }
  // arched girder trusses
  ctx.strokeStyle='#2a3038'; ctx.lineWidth=2; ctx.beginPath(); for (let x=0;x<=W;x+=8){ const y=H*0.14+Math.abs(Math.sin(x/W*Math.PI*4))*6; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();

  // back wall with a big station clock + departure board
  const wall=ctx.createLinearGradient(0,H*0.24,0,platformY); wall.addColorStop(0,'#8a7258'); wall.addColorStop(1,'#6e5842');
  ctx.fillStyle=wall; ctx.fillRect(0,H*0.24,W,platformY-H*0.24);
  ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=1; for (let y=H*0.24;y<platformY;y+=16){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // station clock (center-high)
  const clx=W*0.5, cly=H*0.34;
  ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.arc(clx,cly,20,0,7); ctx.fill(); ctx.fillStyle='#f2ead2'; ctx.beginPath(); ctx.arc(clx,cly,17,0,7); ctx.fill();
  ctx.strokeStyle='#2a2a2a'; ctx.lineWidth=1; for (let k=0;k<12;k++){ const a=k/12*6.28; ctx.beginPath(); ctx.moveTo(clx+Math.cos(a)*14,cly+Math.sin(a)*14); ctx.lineTo(clx+Math.cos(a)*16,cly+Math.sin(a)*16); ctx.stroke(); }
  const mm=t*0.5; ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(clx,cly); ctx.lineTo(clx+Math.cos(mm-1.57)*8,cly+Math.sin(mm-1.57)*8); ctx.stroke(); ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(clx,cly); ctx.lineTo(clx+Math.cos(mm*12-1.57)*13,cly+Math.sin(mm*12-1.57)*13); ctx.stroke();
  // departure board (left)
  ctx.fillStyle='#101a14'; ctx.fillRect(W*0.08,H*0.30,W*0.22,H*0.14); ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=2; ctx.strokeRect(W*0.08,H*0.30,W*0.22,H*0.14);
  for (let k=0;k<4;k++){ ctx.fillStyle=`rgba(240,200,90,${0.6+0.2*Math.sin(t*3+k)})`; ctx.fillRect(W*0.10,H*0.32+k*8,W*0.10,3); ctx.fillStyle='rgba(120,230,150,.7)'; ctx.fillRect(W*0.22,H*0.32+k*8,W*0.05,3); }
  // hanging lamp + arched window (right) with a lit platform-lamp glow
  ctx.fillStyle='#b8d0dc'; ctx.beginPath(); ctx.moveTo(W*0.72,H*0.30); ctx.lineTo(W*0.72,H*0.44); ctx.lineTo(W*0.90,H*0.44); ctx.lineTo(W*0.90,H*0.30); ctx.arc(W*0.81,H*0.30,W*0.09,0,Math.PI,true); ctx.fill();
  ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.81,H*0.21); ctx.lineTo(W*0.81,H*0.44); ctx.moveTo(W*0.72,H*0.34); ctx.lineTo(W*0.90,H*0.34); ctx.stroke();

  // the steam train at the platform edge (right side, drifting steam)
  const trY=platformY-6;
  ctx.fillStyle='#3a2a2a'; ctx.fillRect(W*0.42,trY-46,W*0.6,46); // body extends off right
  ctx.fillStyle='#5a3030'; ctx.fillRect(W*0.42,trY-46,W*0.6,6);
  // windows
  ctx.fillStyle='#c9dbe4'; for (let x=W*0.46;x<W;x+=W*0.12){ ctx.fillRect(x,trY-38,W*0.07,14); ctx.strokeStyle='#e0b060'; ctx.lineWidth=1; ctx.strokeRect(x,trY-38,W*0.07,14); }
  // gold trim line
  ctx.fillStyle='#e0b060'; ctx.fillRect(W*0.42,trY-20,W*0.6,2);
  // wheels
  ctx.fillStyle='#1a1a1a'; for (let x=W*0.5;x<W;x+=W*0.14){ ctx.beginPath(); ctx.arc(x,trY-2,7,0,7); ctx.fill(); ctx.fillStyle='#5a5a5a'; ctx.beginPath(); ctx.arc(x,trY-2,3,0,7); ctx.fill(); ctx.fillStyle='#1a1a1a'; }
  // steam/smoke drifting up from the front
  for (let i=0;i<6;i++){ const px=W*0.44 - i*4; const py=trY-46-((t*14+i*20)%80); const r=6+i*2; ctx.fillStyle=`rgba(230,230,235,${0.18-i*0.02})`; ctx.beginPath(); ctx.arc(px + Math.sin(t+i)*4, py, r,0,7); ctx.fill(); }

  // platform floor (paved) with a bench + luggage (left, low)
  const fl=ctx.createLinearGradient(0,platformY,0,H); fl.addColorStop(0,'#9a8a76'); fl.addColorStop(1,'#7a6a56'); ctx.fillStyle=fl; ctx.fillRect(0,platformY,W,H-platformY);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1; for (let y=platformY+10;y<H;y+=12){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // yellow platform edge line
  ctx.fillStyle='#e0b040'; ctx.fillRect(0,platformY,W,3);
  // bench
  const bx=W*0.16, by=H*0.86; ctx.fillStyle='#3a6a4a'; ctx.fillRect(bx-22,by,44,4); ctx.fillRect(bx-22,by-12,44,3); ctx.fillStyle='#2a4a34'; ctx.fillRect(bx-20,by+4,4,10); ctx.fillRect(bx+16,by+4,4,10);
  // vintage suitcases
  ctx.fillStyle='#8a5a34'; roundRect(W*0.30,H*0.90,22,14,2); ctx.fill(); ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=1; ctx.strokeRect(W*0.30,H*0.90,22,14); ctx.fillStyle='#6a4326'; roundRect(W*0.33,H*0.86,16,10,2); ctx.fill();
}
registerScene('trainstation', drawTrainStation);

/* ── BIRCH GROVE (outdoor · autumn white birches) ── */
function drawBirchGrove(){
  const t = sceneTime, groundY = H*0.68;

  // crisp autumn sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#8fc4e8'); sky.addColorStop(1,'#e8dcc0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='rgba(255,244,200,.5)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.14,40,0,7); ctx.fill();

  // soft golden foliage canopy across the top (dappled)
  function canopy(cx,cy,r,col){ ctx.fillStyle=col; for (let k=0;k<7;k++){ const a=k/7*6.28; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r*0.6,cy+Math.sin(a)*r*0.6,r*0.5,0,7); ctx.fill(); } ctx.beginPath(); ctx.arc(cx,cy,r*0.6,0,7); ctx.fill(); }
  canopy(W*0.16,H*0.06,60,'#e2b83a'); canopy(W*0.5,-6,72,'#e8a838'); canopy(W*0.84,H*0.05,62,'#dcae44'); canopy(W*0.34,H*0.02,44,'#efc85a'); canopy(W*0.68,H*0.04,46,'#e0b040');

  // ground with fallen leaves
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#8a7a4a'); gr.addColorStop(1,'#6a5a34'); ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  const leafCol=['#e2a02e','#d06a2a','#c0402a','#e0b84a'];
  for (let i=0;i<44;i++){ const lx=(i*53+7)%W; const ly=groundY+8+((i*37+5)%(H-groundY-8)); ctx.fillStyle=leafCol[i%4]; ctx.save(); ctx.translate(lx,ly); ctx.rotate(i); ctx.beginPath(); ctx.ellipse(0,0,3,1.6,0,0,7); ctx.fill(); ctx.restore(); }

  // birch trunks — white bark with dark scars, receding sizes
  function birch(bx,w,topY){ const grd=ctx.createLinearGradient(bx-w/2,0,bx+w/2,0); grd.addColorStop(0,'#d8d4c8'); grd.addColorStop(0.4,'#f4f2ea'); grd.addColorStop(1,'#c8c4b6');
    ctx.fillStyle=grd; ctx.fillRect(bx-w/2,topY,w,groundY-topY+6);
    // dark bark scars/notches
    ctx.fillStyle='#2a2620'; for (let i=0;i<7;i++){ const sy=topY+20+i*((groundY-topY)/7); const sw=w*(0.3+ (i%3)*0.2); ctx.fillRect(bx-sw/2,sy,sw,2.5); }
    ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(bx+w*0.2,topY,w*0.3,groundY-topY); }
  // back row (thin)
  birch(W*0.30,8,H*0.14); birch(W*0.44,7,H*0.16); birch(W*0.62,9,H*0.13); birch(W*0.74,7,H*0.17);
  // front framing trunks (thick, sides)
  birch(W*0.10,20,H*0.06); birch(W*0.90,22,H*0.05); birch(W*0.22,14,H*0.10);

  // falling autumn leaves drifting down
  for (let i=0;i<20;i++){ const lx=(i*47 + t*8 + Math.sin(t*0.7+i)*24)%W; const ly=(i*53 + t*20)%H; ctx.fillStyle=leafCol[i%4]; ctx.save(); ctx.translate(lx,ly); ctx.rotate(t*2+i); ctx.beginPath(); ctx.ellipse(0,0,3.2,1.6,0,0,7); ctx.fill(); ctx.restore(); }

  // sun rays slanting through the trunks
  ctx.fillStyle='rgba(255,244,190,.06)'; for (let i=0;i<3;i++){ ctx.save(); ctx.translate(W*0.5,H*0.14); ctx.rotate(0.4+i*0.22); ctx.fillRect(0,0,20,H*0.7); ctx.restore(); }
  // a small mushroom cluster + a log (sides, low)
  ctx.fillStyle='#8a5a34'; roundRect(W*0.82,H*0.90,30,8,4); ctx.fill(); ctx.fillStyle='#c9a878'; ctx.beginPath(); ctx.arc(W*0.82,H*0.90+4,4,Math.PI,0); ctx.fill();
  for (const mx of [W*0.14,W*0.18]){ ctx.fillStyle='#e8e0d0'; ctx.fillRect(mx-1.5,H*0.92,3,5); ctx.fillStyle='#c05a3a'; ctx.beginPath(); ctx.ellipse(mx,H*0.92,4,2.4,0,Math.PI,0); ctx.fill(); }
  // park bench under the birches
  SpriteRenderer.submit({sprite:'parkBench',x:W*0.56,y:H*0.88,frame:Math.floor(sceneTime*2.5)%4});
  // grass tuft among the fallen leaves
  SpriteRenderer.submit({sprite:'grassTuft',x:W*0.34,y:H*0.94,frame:Math.floor(sceneTime*3)%4});
  SpriteRenderer.submit({sprite:'forestGrass',x:W*0.50,y:groundY+10,frame:2});
}
registerScene('birchgrove', drawBirchGrove);

/* ── HOT AIR BALLOON RIDE (outdoor · aerial view from the basket) ── */
function drawBalloonRide(){
  const t = sceneTime, horizonY = H*0.52;

  // high-altitude sky (deeper blue up top)
  const sky=ctx.createLinearGradient(0,0,0,horizonY); sky.addColorStop(0,'#3a80c8'); sky.addColorStop(0.6,'#7ab4e2'); sky.addColorStop(1,'#c8e2f0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,horizonY);
  ctx.fillStyle='#fff6c0'; ctx.beginPath(); ctx.arc(W*0.14,H*0.10,16,0,7); ctx.fill();
  // clouds at/below eye level (we're up high)
  drawSpriteCloud(W*0.7+Math.sin(t*0.1)*10,H*0.16,0.9); drawSpriteCloud(W*0.3+Math.sin(t*0.08+2)*8,H*0.26,0.7); drawSpriteCloud(W*0.9+Math.sin(t*0.12+4)*6,H*0.34,0.6);

  // patchwork landscape far below (fields, river, tiny roads)
  const land=ctx.createLinearGradient(0,horizonY,0,H); land.addColorStop(0,'#8ab06a'); land.addColorStop(1,'#6a9a4a'); ctx.fillStyle=land; ctx.fillRect(0,horizonY,W,H-horizonY);
  // field patches (perspective quilt)
  const fcol=['#9ac06a','#c0b060','#7aa84a','#b8a850','#8ab85a'];
  for (let r=0;r<5;r++){ const y0=horizonY+r*(H-horizonY)/5; const y1=horizonY+(r+1)*(H-horizonY)/5; for (let c=0;c<6;c++){ const x0=c*W/6 - r*4; ctx.fillStyle=fcol[(r+c)%5]; ctx.fillRect(x0,y0,W/6+8,y1-y0); ctx.strokeStyle='rgba(90,120,60,.3)'; ctx.lineWidth=1; ctx.strokeRect(x0,y0,W/6+8,y1-y0); } }
  // winding river
  ctx.strokeStyle='#5aa0c0'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(W*0.1,horizonY); for (let y=horizonY;y<H;y+=10){ ctx.lineTo(W*0.4+Math.sin(y*0.05)*40, y);} ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.2)'; ctx.lineWidth=2; ctx.stroke();

  // other balloons floating in the distance
  function farBalloon(bx,by,sc,c1,c2){ ctx.save(); ctx.translate(bx,by); ctx.scale(sc,sc);
    for (let k=0;k<6;k++){ ctx.fillStyle= k%2?c1:c2; ctx.beginPath(); ctx.moveTo(0,14); ctx.arc(0,0,12,Math.PI*0.5+k*Math.PI/6*2,Math.PI*0.5+(k+1)*Math.PI/6*2); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle='#8a6038'; ctx.fillRect(-3,14,6,4); ctx.strokeStyle='#5a4a30'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(-8,4); ctx.lineTo(-3,14); ctx.moveTo(8,4); ctx.lineTo(3,14); ctx.stroke(); ctx.restore(); }
  farBalloon(W*0.66,H*0.22,0.9,'#e05a5a','#f2e2c0'); farBalloon(W*0.42,H*0.12,0.6,'#5ab0e0','#f2e2c0'); farBalloon(W*0.82,H*0.40,0.7,'#e0b040','#c05a8a');

  // OUR balloon envelope filling the top (we look up at it) — big canopy overhead
  const bx=W*0.5, bTop=-30;
  for (let k=0;k<8;k++){ const a0=k/8, a1=(k+1)/8; ctx.fillStyle= k%2?'#d83a5a':'#f2c84a';
    ctx.beginPath(); ctx.moveTo(bx,bTop+130); ctx.quadraticCurveTo(bx-90+a0*180, bTop, bx-90+a0*180+ (a0<0.5?10:-10), bTop+40);
    ctx.lineTo(bx-90+a1*180, bTop+40); ctx.quadraticCurveTo(bx-90+a1*180, bTop, bx, bTop+130); ctx.closePath(); ctx.fill(); }
  // simpler: overlay a big rounded envelope with vertical gore stripes
  ctx.save(); ctx.beginPath(); ctx.ellipse(bx,H*0.06,96,86,0,0,7); ctx.clip();
  for (let i=0;i<10;i++){ ctx.fillStyle= i%2?'#d83a5a':'#f2c84a'; ctx.fillRect(bx-96+i*19.2,H*0.06-90,20,180); }
  ctx.fillStyle='rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(bx-30,H*0.02,30,50,0,0,7); ctx.fill();
  ctx.restore();
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(bx-14,H*0.06+82,28,8); // skirt/burner base
  // burner flame glow
  ctx.fillStyle=`rgba(255,170,60,${0.4+0.3*Math.sin(t*8)})`; ctx.beginPath(); ctx.moveTo(bx-6,H*0.06+90); ctx.quadraticCurveTo(bx,H*0.06+90-14-6*Math.sin(t*10),bx+6,H*0.06+90); ctx.fill();
  // suspension ropes down to the basket
  ctx.strokeStyle='#6a5a3a'; ctx.lineWidth=1.5; for (const rx of [-40,-14,14,40]){ ctx.beginPath(); ctx.moveTo(bx+rx*0.5,H*0.06+86); ctx.lineTo(bx+rx,H*0.80); ctx.stroke(); }

  // the basket rim in the immediate foreground (we stand in it)
  const rimY=H*0.82;
  ctx.fillStyle='#8a6038'; ctx.fillRect(0,rimY,W,H-rimY);
  // wicker weave
  ctx.strokeStyle='rgba(90,60,30,.5)'; ctx.lineWidth=1; for (let y=rimY+6;y<H;y+=7){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  for (let x=8;x<W;x+=14){ for (let y=rimY+6;y<H;y+=7){ ctx.fillStyle= ((x/14+ (y-rimY)/7)|0)%2? 'rgba(120,80,40,.4)':'rgba(160,110,60,.4)'; ctx.fillRect(x-3,y-3,6,4); } }
  ctx.fillStyle='#6a4a2e'; ctx.fillRect(0,rimY-6,W,8); // padded rim top
}
registerScene('balloonride', drawBalloonRide);

/* ── BONSAI GARDEN (indoor · nursery of miniature trees) ── */
function drawBonsaiGarden(){
  const t = sceneTime, benchY = H*0.62;

  // calm paper-screen wall with soft daylight
  const wall=ctx.createLinearGradient(0,0,0,benchY); wall.addColorStop(0,'#eee6d2'); wall.addColorStop(1,'#e0d6bc');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,benchY);
  // shoji lattice on the upper wall
  ctx.strokeStyle='rgba(150,130,100,.4)'; ctx.lineWidth=1.5; for (let x=0;x<=W;x+=W/8){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,benchY*0.7); ctx.stroke(); } for (let y=20;y<benchY*0.7;y+=28){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.fillStyle='rgba(255,250,220,.16)'; ctx.fillRect(0,0,W,benchY*0.7);
  // a hanging scroll (center-back, high)
  ctx.fillStyle='#efe6d2'; ctx.fillRect(W*0.46,H*0.06,28,54); ctx.fillStyle='#8a5a3a'; ctx.fillRect(W*0.45,H*0.05,30,4); ctx.fillRect(W*0.45,H*0.06+54,30,4);
  ctx.strokeStyle='#3a5a3a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.5,H*0.09); ctx.quadraticCurveTo(W*0.53,H*0.14,W*0.48,H*0.18); ctx.stroke();

  // long display bench
  const bench=ctx.createLinearGradient(0,benchY,0,H); bench.addColorStop(0,'#7a5a3a'); bench.addColorStop(1,'#5a4028'); ctx.fillStyle=bench; ctx.fillRect(0,benchY,W,H-benchY);
  ctx.fillStyle='rgba(255,240,200,.12)'; ctx.fillRect(0,benchY,W,4);
  ctx.strokeStyle='rgba(0,0,0,.16)'; ctx.lineWidth=1; for (let x=0;x<W;x+=30){ ctx.beginPath(); ctx.moveTo(x,benchY); ctx.lineTo(x-8,H); ctx.stroke(); }

  // several bonsai in shallow pots — varied styles (sides + back, center kept lower-open)
  function bonsai(cx,baseY,sc,style){ ctx.save(); ctx.translate(cx,baseY); ctx.scale(sc,sc);
    // shallow pot
    ctx.fillStyle='#7a4a3a'; roundRect(-20,0,40,10,2); ctx.fill(); ctx.fillStyle='#5a3428'; ctx.fillRect(-20,8,40,3);
    // soil + moss
    ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.ellipse(0,1,17,3,0,0,7); ctx.fill(); ctx.fillStyle='#4a7a3a'; ctx.beginPath(); ctx.ellipse(-6,0,5,2,0,0,7); ctx.ellipse(7,0,4,1.6,0,0,7); ctx.fill();
    // trunk
    ctx.strokeStyle='#5a3a22'; ctx.lineWidth=4;
    if (style==='slant'){ ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(-8,-14,-14,-24); ctx.stroke(); var foliage=[[-16,-28],[-6,-30],[-22,-22]]; }
    else if (style==='cascade'){ ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(6,-10,14,-6); ctx.quadraticCurveTo(20,-2,16,6); ctx.stroke(); var foliage=[[16,4],[10,-6],[2,-12]]; }
    else { ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(-2,-16,2,-28); ctx.stroke(); var foliage=[[2,-30],[-8,-24],[12,-24]]; }
    // canopy pads
    for (const [fx,fy] of foliage){ const sway=Math.sin(t*1.2+cx+fx)*1.5; ctx.fillStyle='#3a7a3a'; ctx.beginPath(); ctx.ellipse(fx+sway,fy,10,6,0,0,7); ctx.fill(); ctx.fillStyle='#4a9a44'; ctx.beginPath(); ctx.ellipse(fx+sway-2,fy-2,6,3.5,0,0,7); ctx.fill(); }
    ctx.restore(); }
  bonsai(W*0.16,benchY+22,1.2,'slant');
  bonsai(W*0.84,benchY+24,1.25,'cascade');
  bonsai(W*0.5,benchY+10,0.8,'upright');
  bonsai(W*0.32,benchY+8,0.7,'upright');
  bonsai(W*0.70,benchY+8,0.7,'slant');

  // pruning shears + a watering can on the bench (sides, low)
  ctx.strokeStyle='#8a8a92'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.24,H-14); ctx.lineTo(W*0.30,H-8); ctx.moveTo(W*0.24,H-8); ctx.lineTo(W*0.30,H-14); ctx.stroke();
  ctx.fillStyle='#5a8a9a'; roundRect(W*0.78,H-20,20,14,3); ctx.fill(); ctx.strokeStyle='#5a8a9a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W*0.78,H-18); ctx.lineTo(W*0.72,H-22); ctx.stroke(); ctx.fillStyle='#5a8a9a'; ctx.beginPath(); ctx.moveTo(W*0.72,H-22); ctx.lineTo(W*0.70,H-18); ctx.lineTo(W*0.74,H-19); ctx.fill();

  // a tiny raked-gravel tray + stone (center-back, high)
  ctx.fillStyle='#d8cdb2'; roundRect(W*0.42,benchY+6,W*0.16,10,2); ctx.fill(); ctx.strokeStyle='rgba(150,130,100,.4)'; ctx.lineWidth=0.6; for (let k=0;k<4;k++){ ctx.beginPath(); ctx.moveTo(W*0.43,benchY+8+k*2.4); ctx.lineTo(W*0.57,benchY+8+k*2.4); ctx.stroke(); } ctx.fillStyle='#7a7a72'; ctx.beginPath(); ctx.arc(W*0.46,benchY+11,3,0,7); ctx.fill();
  SpriteRenderer.submit({sprite:'pathBorder',x:W*0.50,y:H*0.92,frame:3});
}
registerScene('bonsaigarden', drawBonsaiGarden);

/* ── HARVEST BARN (indoor · rustic autumn barn interior) ── */
function drawHarvestBarn(){
  const t = sceneTime, floorY = H*0.72;

  // weathered red-plank barn wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#7a3428'); wall.addColorStop(1,'#5e281e');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  ctx.strokeStyle='rgba(0,0,0,.24)'; ctx.lineWidth=1; for (let x=0;x<W;x+=20){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,floorY); ctx.stroke(); }
  // A-frame rafters up top with a hayloft opening
  ctx.fillStyle='#3a1e16'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.5,H*0.02); ctx.lineTo(W,0); ctx.lineTo(W,H*0.14); ctx.lineTo(0,H*0.14); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#2a140e'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(W*0.1,H*0.14); ctx.lineTo(W*0.5,H*0.02); ctx.lineTo(W*0.9,H*0.14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W*0.5,H*0.02); ctx.lineTo(W*0.5,H*0.14); ctx.stroke();
  // hayloft window with warm daylight + hanging hay
  ctx.fillStyle='#f0d78a'; ctx.fillRect(W*0.42,H*0.05,W*0.16,H*0.08);
  ctx.fillStyle='rgba(255,220,120,.2)'; ctx.beginPath(); ctx.moveTo(W*0.42,H*0.13); ctx.lineTo(W*0.58,H*0.13); ctx.lineTo(W*0.66,floorY); ctx.lineTo(W*0.34,floorY); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#c8a850'; ctx.lineWidth=1; for (let i=0;i<8;i++){ ctx.beginPath(); ctx.moveTo(W*0.44+i*3,H*0.13); ctx.lineTo(W*0.44+i*3+2,H*0.16); ctx.stroke(); }

  // hanging lantern (left) + string of dried corn/gourds
  ctx.strokeStyle='#2a140e'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.16,H*0.14); ctx.lineTo(W*0.16,H*0.20); ctx.stroke();
  ctx.fillStyle='rgba(255,200,110,.25)'; ctx.beginPath(); ctx.arc(W*0.16,H*0.24,14,0,7); ctx.fill();
  ctx.fillStyle=`rgba(255,205,120,${0.85+0.1*Math.sin(t*2)})`; roundRect(W*0.16-5,H*0.20,10,12,2); ctx.fill();
  ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=1; ctx.beginPath(); for (let x=W*0.3;x<W*0.7;x+=6){ const y=H*0.16+Math.sin(x*0.05)*4; x===W*0.3?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  for (let x=W*0.32;x<W*0.7;x+=14){ ctx.fillStyle=['#e0a030','#d06a2a','#c8a040'][(x/14|0)%3]; ctx.beginPath(); ctx.ellipse(x,H*0.16+Math.sin(x*0.05)*4+6,4,6,0,0,7); ctx.fill(); }

  // stacked hay bales (right)
  function bale(bx,by,w,h){ ctx.fillStyle='#d8b85a'; ctx.fillRect(bx,by,w,h); ctx.strokeStyle='rgba(150,120,50,.6)'; ctx.lineWidth=1; for (let y=by+3;y<by+h;y+=4){ ctx.beginPath(); ctx.moveTo(bx,y); ctx.lineTo(bx+w,y); ctx.stroke(); } ctx.fillStyle='#8a6a30'; ctx.fillRect(bx+w*0.25,by,2,h); ctx.fillRect(bx+w*0.72,by,2,h); }
  bale(W*0.70,floorY-24,44,24); bale(W*0.78,floorY-46,44,22); bale(W*0.66,floorY-42,30,18);

  // wooden floor scattered with straw
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#8a6a44'); fl.addColorStop(1,'#6a4e30'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let y=floorY+10;y<H;y+=12){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.strokeStyle='rgba(210,180,90,.5)'; for (let i=0;i<24;i++){ const sx=(i*61+9)%W, sy=floorY+8+((i*29)%(H-floorY-8)); ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+rand(-4,4),sy-rand(2,4)); ctx.stroke(); }

  // pumpkins + a basket of apples in the foreground (sides, low)
  function pumpkin(px,py,r){ ctx.fillStyle='#e0781e'; ctx.beginPath(); ctx.ellipse(px,py,r,r*0.8,0,0,7); ctx.fill(); ctx.strokeStyle='rgba(150,70,10,.5)'; ctx.lineWidth=1; for (let k=-2;k<=2;k++){ ctx.beginPath(); ctx.ellipse(px,py,Math.abs(k)*r*0.25+1,r*0.8,0,0,7); ctx.stroke(); } ctx.strokeStyle='#4a7a2a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(px,py-r*0.8); ctx.lineTo(px+2,py-r*0.8-5); ctx.stroke(); }
  pumpkin(W*0.14,H*0.90,16); pumpkin(W*0.26,H*0.93,11); pumpkin(W*0.06,H*0.94,10);
  // apple basket (right, low)
  const abx=W*0.88, aby=H*0.90; ctx.fillStyle='#a9742e'; ctx.beginPath(); ctx.moveTo(abx-16,aby); ctx.lineTo(abx+16,aby); ctx.lineTo(abx+12,aby+16); ctx.lineTo(abx-12,aby+16); ctx.closePath(); ctx.fill();
  for (let k=0;k<5;k++){ ctx.fillStyle='#c0392b'; ctx.beginPath(); ctx.arc(abx-10+k*5,aby-3-(k%2)*3,4,0,7); ctx.fill(); }
}
registerScene('harvestbarn', drawHarvestBarn);

/* ── PEONY GARDEN (outdoor · lush spring peony beds) ── */
function drawPeonyGarden(){
  const t = sceneTime, groundY = H*0.58;

  // gentle spring sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#8fcdea'); sky.addColorStop(1,'#f0e4ec');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='rgba(255,246,200,.5)'; ctx.beginPath(); ctx.arc(W*0.78,H*0.13,24,0,7); ctx.fill();
  drawSpriteCloud(W*0.22+Math.sin(t*0.1)*8,H*0.10,0.6); drawSpriteCloud(W*0.55+Math.sin(t*0.08+2)*6,H*0.16,0.45);

  // manicured hedge + a white lattice arch at back
  ctx.fillStyle='#3a7a3a'; ctx.fillRect(0,groundY-26,W,30);
  ctx.fillStyle='#4a8f42'; for (let x=0;x<W;x+=14){ ctx.beginPath(); ctx.arc(x,groundY-26,8,Math.PI,0); ctx.fill(); }
  // lattice arch (center-back)
  ctx.strokeStyle='#eae4d6'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W*0.40,groundY); ctx.lineTo(W*0.40,H*0.30); ctx.arc(W*0.5,H*0.30,W*0.10,Math.PI,0); ctx.lineTo(W*0.60,groundY); ctx.stroke();
  ctx.lineWidth=1; for (let y=H*0.30;y<groundY;y+=10){ ctx.beginPath(); ctx.moveTo(W*0.40,y); ctx.lineTo(W*0.60,y); ctx.stroke(); }
  // climbing roses on the arch
  ctx.fillStyle='#e58bb0'; for (let i=0;i<10;i++){ const a=Math.PI+ (i/9)*Math.PI; ctx.beginPath(); ctx.arc(W*0.5+Math.cos(a)*W*0.10, H*0.30+Math.sin(a)*W*0.10, 3,0,7); ctx.fill(); }

  // garden bed ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#5a9e3a'); gr.addColorStop(1,'#3f7a26'); ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  // a curved stone path down the middle (kept for pet)
  ctx.fillStyle='#c9c2b2'; ctx.beginPath(); ctx.moveTo(W*0.5-14,groundY); ctx.lineTo(W*0.5+14,groundY); ctx.lineTo(W*0.5+40,H); ctx.lineTo(W*0.5-40,H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(150,140,120,.5)'; ctx.lineWidth=1; for (let y=groundY+14;y<H;y+=16){ ctx.beginPath(); ctx.moveTo(W*0.5-14-(y-groundY)*0.24,y); ctx.lineTo(W*0.5+14+(y-groundY)*0.24,y); ctx.stroke(); }

  // big lush peony bushes flanking the beds (sides, layered pom-pom blooms)
  function peony(px,py,sc,col){ ctx.save(); ctx.translate(px,py); ctx.scale(sc,sc);
    // leafy bush base
    ctx.fillStyle='#3a7a34'; for (let k=0;k<5;k++){ const a=k/5*6.28; ctx.beginPath(); ctx.ellipse(Math.cos(a)*10,6+Math.sin(a)*5,7,4,a,0,7); ctx.fill(); }
    // several ruffled blooms
    const spots=[[-9,-4],[8,-6],[0,-12],[-4,2],[10,4]];
    for (const [bx,by] of spots){ const sway=Math.sin(t*1.2+px+bx)*1.2; ctx.save(); ctx.translate(bx+sway,by);
      ctx.fillStyle=col; for (let r=0;r<8;r++){ const a=r/8*6.28; ctx.beginPath(); ctx.ellipse(Math.cos(a)*3.5,Math.sin(a)*3.5,3,2.2,a,0,7); ctx.fill(); }
      ctx.fillStyle='rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(0,0,2.4,0,7); ctx.fill();
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,0,1.6,0,7); ctx.fill(); ctx.restore(); }
    ctx.restore(); }
  peony(W*0.14,H*0.78,1.5,'#e26f9a'); peony(W*0.26,H*0.70,1.1,'#f2c0d2'); peony(W*0.86,H*0.80,1.6,'#e05a7a'); peony(W*0.74,H*0.70,1.1,'#f0a8c0'); peony(W*0.5,H*0.66,0.8,'#f2d0dc');
  // low tufts near the front sides
  peony(W*0.08,H*0.92,1.0,'#e8a0b8'); peony(W*0.92,H*0.92,1.0,'#e07a98');

  // drifting petals + a couple butterflies
  for (let i=0;i<14;i++){ const px=(i*47 + t*8 + Math.sin(t*0.7+i)*20)%W; const py=(i*53 + t*16)%H; ctx.fillStyle=`rgba(245,190,212,${0.5+0.3*Math.sin(t+i)})`; ctx.save(); ctx.translate(px,py); ctx.rotate(t*2+i); ctx.beginPath(); ctx.ellipse(0,0,2.4,1.4,0,0,7); ctx.fill(); ctx.restore(); }
  // sprite butterflies among the peonies (replacing hand-drawn ones)
  SpriteRenderer.submit({sprite:'butterfly',phase:'actors',x:W*0.35+Math.sin(t*1.4)*16,y:groundY-10+Math.cos(t*1.7)*12,anchorY:0.5,frame:Math.floor(t*8)%4});
  SpriteRenderer.submit({sprite:'butterfly',phase:'actors',x:W*0.65+Math.sin(t*1.4+1)*16,y:groundY-4+Math.cos(t*1.7+1)*12,anchorY:0.5,frame:Math.floor(t*8+2)%4,flipX:true});
  // bunny nibbling near the peony beds
  SpriteRenderer.submit({sprite:'bunny',phase:'actors',x:W*0.18+Math.sin(t*0.5)*6,y:H*0.86,anchorY:1,frame:Math.floor(t*7)%4});
  // flowering bush among the peonies
  SpriteRenderer.submit({sprite:'floweringBush',x:W*0.88,y:groundY+22,frame:Math.floor(sceneTime*2.5)%4});
  // park bench for garden visitors
  SpriteRenderer.submit({sprite:'parkBench',x:W*0.50,y:H*0.92,frame:Math.floor(sceneTime*2.5)%4});
}
registerScene('peonygarden', drawPeonyGarden);

/* ── ROOFTOP POOL (outdoor · city infinity pool by day) ── */
function drawRooftopPool(){
  const t = sceneTime, deckY = H*0.52, poolFar = H*0.54;

  // clear summer sky
  const sky=ctx.createLinearGradient(0,0,0,deckY); sky.addColorStop(0,'#4a9ae0'); sky.addColorStop(1,'#bfe4f4');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,deckY);
  ctx.fillStyle='#fff6b0'; ctx.beginPath(); ctx.arc(W*0.18,H*0.12,18,0,7); ctx.fill();
  drawSpriteCloud(W*0.6+Math.sin(t*0.09)*8,H*0.10,0.6); drawSpriteCloud(W*0.85+Math.sin(t*0.11+2)*6,H*0.18,0.45);

  // city skyline behind an infinity edge (buildings rising to the deck line)
  let seed=5; const rnd=()=>{ seed=(seed*9301+49297)%233280; return seed/233280; };
  let bx=0; while (bx<W){ const bw=22+Math.floor(rnd()*26), bh=30+Math.floor(rnd()*70), bTop=deckY-bh;
    ctx.fillStyle=`rgb(${150+rnd()*40|0},${170+rnd()*30|0},${190+rnd()*30|0})`; ctx.fillRect(bx,bTop,bw,bh);
    // windows
    for (let wy=bTop+5; wy<deckY-4; wy+=8) for (let wx=bx+3; wx<bx+bw-3; wx+=7){ ctx.fillStyle= rnd()>0.5?'rgba(255,255,255,.5)':'rgba(120,150,180,.4)'; ctx.fillRect(wx,wy,3,4); }
    bx+=bw+3; }
  // hazy distance overlay
  ctx.fillStyle='rgba(200,225,240,.25)'; ctx.fillRect(0,deckY-30,W,30);

  // the infinity pool — water meets the sky at the far edge
  const pool=ctx.createLinearGradient(0,poolFar,0,H*0.80); pool.addColorStop(0,'#3ab0d8'); pool.addColorStop(1,'#2a8ab8');
  ctx.fillStyle=pool; ctx.fillRect(0,poolFar,W,H*0.80-poolFar);
  // infinity edge shimmer
  ctx.fillStyle='rgba(255,255,255,.4)'; ctx.fillRect(0,poolFar,W,2);
  // caustic ripple net
  ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=1;
  for (let y=poolFar+8;y<H*0.80;y+=8){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.08+t*1.6+y)*2; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }
  for (let x=10;x<W;x+=18){ ctx.beginPath(); for (let y=poolFar+6;y<H*0.80;y+=6){ const xx=x+Math.sin(y*0.1+t*1.4)*3; ctx.lineTo(xx,y);} ctx.stroke(); }
  // a floating ring + beach ball drifting
  const rx=W*0.30+Math.sin(t*0.6)*20, ry=H*0.66+Math.cos(t*0.8)*4; ctx.fillStyle='#f2e2a0'; ctx.beginPath(); ctx.arc(rx,ry,10,0,7); ctx.fill(); ctx.fillStyle=pool; ctx.beginPath(); ctx.arc(rx,ry,5,0,7); ctx.fill();
  const ba=W*0.7+Math.sin(t*0.5+2)*16; ctx.fillStyle='#e05a5a'; ctx.beginPath(); ctx.arc(ba,H*0.62,7,0,7); ctx.fill(); ctx.fillStyle='#f2f2f2'; ctx.beginPath(); ctx.arc(ba,H*0.62,7,-0.4,0.4); ctx.fill();

  // wood/stone deck in the foreground
  const deck=ctx.createLinearGradient(0,H*0.80,0,H); deck.addColorStop(0,'#d8cbb0'); deck.addColorStop(1,'#bcae90'); ctx.fillStyle=deck; ctx.fillRect(0,H*0.80,W,H*0.20);
  ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=1; for (let x=0;x<W;x+=26){ ctx.beginPath(); ctx.moveTo(x,H*0.80); ctx.lineTo(x-6,H); ctx.stroke(); }
  ctx.fillStyle='rgba(255,255,255,.15)'; ctx.fillRect(0,H*0.80,W,3);
  // pool coping edge
  ctx.fillStyle='#e8e2d4'; ctx.fillRect(0,H*0.80-4,W,5);

  // a lounge chair + palm in a planter (sides, low)
  ctx.save(); ctx.translate(W*0.14,H*0.90); ctx.rotate(-0.05); ctx.fillStyle='#e8e2d4'; roundRect(-22,-4,44,6,2); ctx.fill(); ctx.fillStyle='#c0d0d8'; roundRect(-22,-16,14,14,2); ctx.fill(); ctx.fillStyle='#8a8a92'; ctx.fillRect(-20,2,3,10); ctx.fillRect(16,2,3,10); ctx.restore();
  // striped towel on it
  ctx.fillStyle='rgba(220,90,110,.5)'; ctx.save(); ctx.translate(W*0.14,H*0.87); ctx.rotate(-0.05); roundRect(-16,-3,32,5,1); ctx.fill(); ctx.restore();
  // planter palm (right)
  ctx.fillStyle='#7a5a3a'; ctx.fillRect(W*0.86,H*0.86,18,H*0.14); ctx.strokeStyle='#3a8a4a'; ctx.lineWidth=3; for (let k=0;k<6;k++){ const a=Math.PI+ k/5*Math.PI; const sway=Math.sin(t*1.2+k)*4; ctx.beginPath(); ctx.moveTo(W*0.86+9,H*0.86); ctx.quadraticCurveTo(W*0.86+9+Math.cos(a)*16,H*0.86-14+Math.sin(a)*10,W*0.86+9+Math.cos(a)*30+sway,H*0.86-8+Math.sin(a)*16); ctx.stroke(); }
}
registerScene('rooftoppool', drawRooftopPool);

/* ── SUGAR SHACK (indoor · maple syrup boiling cabin) ── */
function drawSugarShack(){
  const t = sceneTime, floorY = H*0.72;

  // warm log-cabin wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#7a5636'); wall.addColorStop(1,'#5e4228');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  // round-log courses
  ctx.strokeStyle='rgba(0,0,0,.22)'; ctx.lineWidth=1; for (let y=16;y<floorY;y+=18){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); ctx.fillStyle='rgba(255,240,210,.06)'; ctx.fillRect(0,y,W,2); }

  // snowy window (left) — it's sugaring season, late winter
  const wx=W*0.10, wy=H*0.14, ww=W*0.28, wh=H*0.30;
  ctx.fillStyle='#bcd8ea'; ctx.fillRect(wx,wy,ww,wh);
  // maple trees with taps outside
  ctx.fillStyle='#6a4a2e'; ctx.fillRect(wx+ww*0.3,wy+wh*0.3,5,wh*0.7); ctx.fillRect(wx+ww*0.7,wy+wh*0.35,5,wh*0.65);
  ctx.fillStyle='#e8eef6'; ctx.fillRect(wx,wy+wh-10,ww,10);
  ctx.fillStyle='#c0c0c0'; ctx.fillRect(wx+ww*0.3+5,wy+wh*0.5,4,2); ctx.fillRect(wx+ww*0.7+5,wy+wh*0.55,4,2); // buckets/taps
  ctx.strokeStyle='#3a2818'; ctx.lineWidth=4; ctx.strokeRect(wx,wy,ww,wh); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(wx+ww/2,wy); ctx.lineTo(wx+ww/2,wy+wh); ctx.moveTo(wx,wy+wh/2); ctx.lineTo(wx+ww,wy+wh/2); ctx.stroke();

  // hanging maple-leaf sign + strings of drying herbs
  ctx.fillStyle='#c0402a'; ctx.save(); ctx.translate(W*0.5,H*0.10); for (let k=0;k<5;k++){ ctx.rotate(6.28/5); ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(3,-3); ctx.lineTo(9,-2); ctx.lineTo(4,2); ctx.lineTo(0,0); ctx.closePath(); ctx.fill(); } ctx.restore();

  // the big evaporator pan on a brick firebox (right of center) with rising steam
  const ex=W*0.66, ey=floorY-6;
  // firebox
  ctx.fillStyle='#7a4a3a'; ctx.fillRect(ex-40,ey-22,80,22); ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let y=ey-22;y<ey;y+=7){ for (let x=ex-40+((y/7|0)%2)*10; x<ex+40; x+=20){ ctx.strokeRect(x,y,20,7); } }
  // fire door glow
  ctx.fillStyle=`rgba(255,140,50,${0.5+0.3*Math.sin(t*6)})`; ctx.fillRect(ex-10,ey-16,20,12);
  ctx.fillStyle='#2a1a10'; ctx.strokeRect(ex-10,ey-16,20,12);
  // steel evaporator pan
  ctx.fillStyle='#b8bcc4'; ctx.fillRect(ex-44,ey-34,88,14); ctx.fillStyle='#8a8e96'; ctx.fillRect(ex-44,ey-22,88,4);
  // boiling amber sap in the pan
  ctx.fillStyle='#c98a2a'; ctx.fillRect(ex-42,ey-32,84,9);
  for (let i=0;i<7;i++){ const bx=ex-38+i*11; const by=ey-24-((t*16+i*9)%8); ctx.fillStyle='rgba(240,200,120,.8)'; ctx.beginPath(); ctx.arc(bx,by,1.4,0,7); ctx.fill(); }
  // billowing steam
  ctx.fillStyle='rgba(240,235,225,.14)'; for (let i=0;i<5;i++){ const px=ex-30+i*15; const py=ey-40-((t*12+i*24)%90); ctx.beginPath(); ctx.arc(px+Math.sin(t+i)*5,py,10+i*2,0,7); ctx.fill(); }

  // shelf of syrup jars/bottles (left)
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(W*0.06,H*0.50,W*0.28,5);
  for (let i=0;i<5;i++){ const jx=W*0.09+i*W*0.055; ctx.fillStyle='rgba(210,140,50,.85)'; roundRect(jx-4,H*0.50-16,8,16,2); ctx.fill(); ctx.fillStyle='#e8b060'; ctx.fillRect(jx-4,H*0.50-14,8,4); ctx.fillStyle='#5a3a1a'; ctx.fillRect(jx-2.5,H*0.50-20,5,4); }

  // plank floor + a sap bucket & firewood (sides, low)
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#6a4a2e'); fl.addColorStop(1,'#4a3320'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let x=0;x<W;x+=26){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-6,H); ctx.stroke(); }
  // metal sap bucket (left, low)
  ctx.fillStyle='#c0c4cc'; ctx.beginPath(); ctx.moveTo(W*0.14-12,H*0.88); ctx.lineTo(W*0.14+12,H*0.88); ctx.lineTo(W*0.14+9,H*0.88+18); ctx.lineTo(W*0.14-9,H*0.88+18); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#8a8e96'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(W*0.14,H*0.88,12,Math.PI,0); ctx.stroke();
  ctx.fillStyle='#d8a840'; ctx.beginPath(); ctx.ellipse(W*0.14,H*0.90,9,3,0,0,7); ctx.fill();
  // firewood stack (right, low)
  ctx.fillStyle='#8a5a34'; for (let i=0;i<4;i++){ ctx.beginPath(); ctx.arc(W*0.88+ (i%2)*10, H*0.94-(i>1?8:0), 5,0,7); ctx.fill(); ctx.fillStyle='#c9a878'; ctx.beginPath(); ctx.arc(W*0.88+ (i%2)*10, H*0.94-(i>1?8:0), 2,0,7); ctx.fill(); ctx.fillStyle='#8a5a34'; }
}
registerScene('sugarshack', drawSugarShack);

/* ── SUNROOM (indoor · bright plant-filled conservatory nook) ── */
function drawSunroom(){
  const t = sceneTime, floorY = H*0.72;

  // walls are mostly glass — bright garden view beyond
  const outside=ctx.createLinearGradient(0,0,0,floorY); outside.addColorStop(0,'#9ed8f0'); outside.addColorStop(0.6,'#cfe8d8'); outside.addColorStop(1,'#bcdcc0');
  ctx.fillStyle=outside; ctx.fillRect(0,0,W,floorY);
  // soft garden shapes outside (blurred bushes)
  ctx.fillStyle='rgba(110,170,110,.5)'; for (let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(i*W*0.24, floorY-20, 30,0,7); ctx.fill(); }
  ctx.fillStyle='rgba(255,246,190,.3)'; ctx.beginPath(); ctx.arc(W*0.80,H*0.12,26,0,7); ctx.fill();
  // window mullions (white frame grid)
  ctx.fillStyle='#f4f0e6'; ctx.fillRect(0,0,W,10);
  for (let x=0;x<=W;x+=W/4){ ctx.fillRect(x-3,0,6,floorY); }
  ctx.fillRect(0,H*0.30,W,6);
  // gentle sunbeams
  ctx.fillStyle='rgba(255,250,210,.10)'; for (let i=0;i<3;i++){ ctx.save(); ctx.translate(W*0.7,0); ctx.rotate(0.3); ctx.fillRect(-i*30,0,20,floorY); ctx.restore(); }
  // dust motes floating in the light
  for (let i=0;i<14;i++){ const mx=(i*61+t*4)%W; const my=(i*47+Math.sin(t*0.6+i)*20)%floorY; ctx.fillStyle=`rgba(255,255,230,${0.12+0.12*Math.sin(t+i)})`; ctx.beginPath(); ctx.arc(mx,my,1.4,0,7); ctx.fill(); }

  // hanging trailing plants from the top (sides)
  function hangingPlant(hx){ ctx.fillStyle='#6a4a2a'; roundRect(hx-10,H*0.10,20,10,2); ctx.fill(); ctx.strokeStyle='#3a8a4a'; ctx.lineWidth=2;
    for (const dx of [-7,-2,3,8]){ ctx.beginPath(); ctx.moveTo(hx+dx,H*0.20); ctx.quadraticCurveTo(hx+dx+Math.sin(t+dx)*4,H*0.30,hx+dx*1.4,H*0.40); ctx.stroke();
      ctx.fillStyle='#4a9a44'; for (let k=1;k<4;k++){ ctx.beginPath(); ctx.ellipse(hx+dx+Math.sin(t+dx)*2, H*0.20+k*7, 3,1.6,0.5,0,7); ctx.fill(); } } }
  hangingPlant(W*0.14); hangingPlant(W*0.88);

  // a shelf of potted plants (center-back, high)
  ctx.fillStyle='#c9a878'; ctx.fillRect(W*0.30,H*0.44,W*0.40,6);
  function pot(px,col,leaf){ ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(px-7,H*0.44); ctx.lineTo(px+7,H*0.44); ctx.lineTo(px+5,H*0.44-11); ctx.lineTo(px-5,H*0.44-11); ctx.closePath(); ctx.fill();
    ctx.fillStyle=leaf; if (leaf){ for (const a of [-0.6,-0.2,0.2,0.6]){ ctx.save(); ctx.translate(px,H*0.44-11); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-10,4,11,0,0,7); ctx.fill(); ctx.restore(); } } }
  pot(W*0.36,'#c0603a','#3a8a4a'); pot(W*0.46,'#d88a4a','#4a9a44'); pot(W*0.56,'#b56a44','#5aa04a'); pot(W*0.64,'#c0603a','#3a8a4a');
  // a small succulent in a white pot
  ctx.fillStyle='#eee'; roundRect(W*0.40,H*0.44-9,9,9,1); ctx.fill(); ctx.fillStyle='#6ab06a'; for (let k=0;k<5;k++){ const a=k/5*6.28; ctx.beginPath(); ctx.ellipse(W*0.405+Math.cos(a)*2,H*0.44-9+Math.sin(a)*2,2,3.4,a,0,7); ctx.fill(); }

  // terracotta tile floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#d8a878'); fl.addColorStop(1,'#b8875a'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  for (let y=floorY;y<H;y+=16){ for (let x=((y/16|0)%2)*16; x<W; x+=32){ ctx.fillStyle='rgba(150,90,50,.15)'; ctx.fillRect(x,y,15,15); } }
  ctx.strokeStyle='rgba(120,70,40,.25)'; ctx.lineWidth=1; for (let y=floorY;y<H;y+=16){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // a comfy wicker chair + big floor plant (sides, low)
  ctx.fillStyle='#c9a86a'; ctx.beginPath(); ctx.arc(W*0.16,H*0.86,20,Math.PI,0); ctx.fill(); ctx.fillRect(W*0.16-20,H*0.86,40,14);
  ctx.strokeStyle='rgba(120,90,50,.4)'; ctx.lineWidth=1; for (let a=0.2;a<Math.PI;a+=0.4){ ctx.beginPath(); ctx.moveTo(W*0.16,H*0.86); ctx.lineTo(W*0.16+Math.cos(a+Math.PI)*20,H*0.86-Math.sin(a)*20); ctx.stroke(); }
  ctx.fillStyle='#efe0c8'; ctx.beginPath(); ctx.ellipse(W*0.16,H*0.84,14,6,0,0,7); ctx.fill();
  // big monstera-ish floor plant (right, low)
  ctx.fillStyle='#b56a44'; ctx.fillRect(W*0.84,H*0.90,20,H*0.10); ctx.fillStyle='#3a8a44'; for (const a of [-0.7,-0.2,0.3,0.8]){ ctx.save(); ctx.translate(W*0.84+10,H*0.90); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-22,9,16,0,0,7); ctx.fill(); ctx.restore(); }
}
registerScene('sunroom', drawSunroom);

/* ── DUCK POND (outdoor · park pond with ducks) ── */
function drawDuckPond(){
  const t = sceneTime, waterY = H*0.44;

  // pleasant sky
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#7ab8e6'); sky.addColorStop(1,'#d8ecd8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  ctx.fillStyle='#fff6b0'; ctx.beginPath(); ctx.arc(W*0.80,H*0.12,18,0,7); ctx.fill();
  drawSpriteCloud(W*0.2+Math.sin(t*0.1)*8,H*0.09,0.6); drawSpriteCloud(W*0.55+Math.sin(t*0.08+2)*6,H*0.15,0.45);

  // grassy far bank with a weeping willow (left)
  ctx.fillStyle='#5a9a3a'; ctx.fillRect(0,waterY-18,W,22);
  ctx.fillStyle='#4a8a2e'; for (let x=0;x<W;x+=12){ ctx.beginPath(); ctx.arc(x,waterY-18,7,Math.PI,0); ctx.fill(); }
  // willow trunk + drooping fronds
  ctx.fillStyle='#5a3a20'; ctx.fillRect(W*0.14-4,waterY-70,8,54);
  ctx.strokeStyle='#4a8a3a'; ctx.lineWidth=1.5; for (let k=-5;k<=5;k++){ const fx=W*0.14+k*5; ctx.beginPath(); ctx.moveTo(fx,waterY-64); ctx.quadraticCurveTo(fx+Math.sin(t*1.2+k)*3,waterY-40,fx+k*1.4+Math.sin(t*1.5+k)*4,waterY-14); ctx.stroke(); }
  ctx.fillStyle='#3a8a3a'; ctx.beginPath(); ctx.arc(W*0.14,waterY-70,20,0,7); ctx.fill();
  // cattails (right bank)
  for (const cx of [W*0.86,W*0.92,W*0.80]){ ctx.strokeStyle='#4a7a3a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,waterY); ctx.lineTo(cx+Math.sin(t*1.2+cx)*2,waterY-30); ctx.stroke(); ctx.fillStyle='#7a4a2a'; roundRect(cx-2,waterY-38,4,10,2); ctx.fill(); }

  // pond water
  const wat=ctx.createLinearGradient(0,waterY,0,H); wat.addColorStop(0,'#5a9ab0'); wat.addColorStop(1,'#3a7288'); ctx.fillStyle=wat; ctx.fillRect(0,waterY,W,H-waterY);
  // reflections + ripples
  ctx.fillStyle='rgba(255,255,255,.1)'; ctx.fillRect(0,waterY,W,8);
  ctx.strokeStyle='rgba(210,235,235,.14)'; ctx.lineWidth=1; for (let y=waterY+8;y<H;y+=9){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.05+t*1.3+y)*1.5; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }
  // lily pads
  ctx.fillStyle='#2e7a4a'; for (const [px,py] of [[W*0.3,waterY+40],[W*0.72,waterY+60]]){ ctx.beginPath(); ctx.ellipse(px,py,10,4,0,0.5,6.5); ctx.fill(); }

  // ducks paddling (each leaves a V-wake)
  function duck(dx,dy,dir,mallard){ ctx.save(); ctx.translate(dx,dy); ctx.scale(dir,1);
    // wake
    ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-14,4); ctx.lineTo(-30,10); ctx.moveTo(-14,4); ctx.lineTo(-28,-2); ctx.stroke();
    // body
    ctx.fillStyle= mallard?'#8a7a5a':'#efe8d8'; ctx.beginPath(); ctx.ellipse(0,0,11,6,0,0,7); ctx.fill();
    // tail tip
    ctx.beginPath(); ctx.moveTo(-9,-1); ctx.lineTo(-15,-4); ctx.lineTo(-10,1); ctx.fill();
    // neck + head
    ctx.fillStyle= mallard?'#2f7a4a':'#efe8d8'; ctx.beginPath(); ctx.ellipse(9,-6,4,5,0.2,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(11,-9,4,0,7); ctx.fill();
    // bill
    ctx.fillStyle='#e0a030'; ctx.beginPath(); ctx.moveTo(14,-9); ctx.lineTo(20,-8); ctx.lineTo(14,-6); ctx.fill();
    // eye
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(12,-10,1,0,7); ctx.fill();
    ctx.restore(); }
  duck(W*0.35+Math.sin(t*0.4)*30, waterY+30, 1, true);
  duck(W*0.62+Math.sin(t*0.3+2)*26, waterY+52, -1, false);
  duck(W*0.5+Math.sin(t*0.5+1)*20, waterY+70, 1, true);
  // three ducklings following the first
  for (let i=0;i<3;i++){ const lx=W*0.35+Math.sin(t*0.4-0.3-i*0.25)*30 - (i+1)*10; ctx.fillStyle='#e8d86a'; ctx.beginPath(); ctx.ellipse(lx,waterY+34+i*2,4,3,0,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(lx+3,waterY+31+i*2,2.2,0,7); ctx.fill(); ctx.fillStyle='#e0a030'; ctx.fillRect(lx+5,waterY+30+i*2,2,1.4); }

  // a park bench + breadcrumbs area on the near shore (left, low) — small
  const bx=W*0.14, by=H*0.90; ctx.fillStyle='#6a8a4a'; ctx.fillRect(bx-20,by,40,4); ctx.fillRect(bx-20,by-10,40,3); ctx.fillStyle='#4a6a34'; ctx.fillRect(bx-18,by+4,3,8); ctx.fillRect(bx+15,by+4,3,8);
  ctx.fillStyle='rgba(230,210,160,.7)'; for (let i=0;i<6;i++){ ctx.fillRect(W*0.3+i*4+Math.sin(i)*3, H*0.93+ (i%2)*3, 2,2); }
  // park bench by the pond
  SpriteRenderer.submit({sprite:'parkBench',x:W*0.82,y:H*0.86,frame:Math.floor(sceneTime*2.5)%4});
  // water ripple on the pond surface
  SpriteRenderer.submit({sprite:'waterRipple',x:W*0.48,y:waterY+42,frame:Math.floor(sceneTime*5)%4});
}
registerScene('duckpond', drawDuckPond);

/* ── BEEKEEPER'S GARDEN (outdoor · hives & wildflower meadow) ── */
function drawBeekeeperGarden(){
  const t = sceneTime, groundY = H*0.58;

  // warm summer sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#79c0ea'); sky.addColorStop(1,'#eae6c8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='#fff2a8'; ctx.beginPath(); ctx.arc(W*0.5,H*0.13,22,0,7); ctx.fill(); ctx.fillStyle='rgba(255,242,168,.3)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.13,34,0,7); ctx.fill();
  drawSpriteCloud(W*0.2+Math.sin(t*0.1)*8,H*0.10,0.55); drawSpriteCloud(W*0.82+Math.sin(t*0.09+2)*6,H*0.17,0.45);

  // green hills + a hedgerow
  ctx.fillStyle='#6aa84a'; ctx.beginPath(); ctx.moveTo(0,groundY); for(let x=0;x<=W;x+=20){ ctx.lineTo(x,groundY-22-14*Math.sin(x*0.016+1)); } ctx.lineTo(W,groundY); ctx.fill();
  ctx.fillStyle='#5a9a3e'; ctx.beginPath(); ctx.moveTo(0,groundY); for(let x=0;x<=W;x+=20){ ctx.lineTo(x,groundY-8-10*Math.sin(x*0.03+3)); } ctx.lineTo(W,groundY); ctx.fill();

  // meadow ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#6aae42'); gr.addColorStop(1,'#4a8a2e'); ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  // grass texture
  ctx.strokeStyle='rgba(40,90,20,.3)'; ctx.lineWidth=1; for (let i=0;i<50;i++){ const gx=(i*67+9)%W; const gy=groundY+8+((i*37+7)%(H-groundY-8)); ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+Math.sin(t+i)*2,gy-6); ctx.stroke(); }

  // white box beehives (Langstroth stacks) — sides so center stays clear
  function hive(hx,baseY){ ctx.fillStyle='#efe8d8'; for (let b=0;b<3;b++){ ctx.fillRect(hx-18,baseY-16-b*16,36,16); ctx.strokeStyle='rgba(150,140,120,.5)'; ctx.lineWidth=1; ctx.strokeRect(hx-18,baseY-16-b*16,36,16);
    // entrance slot on lowest box
    if (b===0){ ctx.fillStyle='#3a2a1a'; ctx.fillRect(hx-10,baseY-4,20,3); ctx.fillStyle='#efe8d8'; } }
    // gabled roof
    ctx.fillStyle='#8a5a3a'; ctx.beginPath(); ctx.moveTo(hx-22,baseY-48); ctx.lineTo(hx,baseY-60); ctx.lineTo(hx+22,baseY-48); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#efe8d8'; ctx.fillRect(hx-20,baseY-50,40,4); }
  hive(W*0.16,groundY+40); hive(W*0.86,groundY+44);
  // a small stone birdbath/water dish (right-back)
  ctx.fillStyle='#9a9088'; ctx.fillRect(W*0.66-3,groundY+6,6,18); ctx.beginPath(); ctx.ellipse(W*0.66,groundY+6,12,4,0,0,7); ctx.fill(); ctx.fillStyle='#7ab0c0'; ctx.beginPath(); ctx.ellipse(W*0.66,groundY+5,9,2.6,0,0,7); ctx.fill();

  // wildflowers all over the meadow (bee-friendly) — kept along sides/low
  function wf(fx,fy,col){ ctx.strokeStyle='#3a7a2a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(fx,fy+8); ctx.lineTo(fx,fy); ctx.stroke(); ctx.fillStyle=col; for (let k=0;k<5;k++){ const a=k/5*6.28; ctx.beginPath(); ctx.ellipse(fx+Math.cos(a)*3,fy+Math.sin(a)*3,2.4,1.4,a,0,7); ctx.fill(); } ctx.fillStyle='#e0b040'; ctx.beginPath(); ctx.arc(fx,fy,1.6,0,7); ctx.fill(); }
  const wfc=['#e26f9a','#e0b040','#a06fe0','#ffffff','#e0602a'];
  for (let i=0;i<18;i++){ const fx=(i*53+8)%W; if (fx>W*0.36 && fx<W*0.64) continue; const fy=H*0.72+ (i*29)%(H*0.24); wf(fx,fy,wfc[i%5]); }
  // tall lavender/clover spikes (sides)
  for (const lx of [W*0.28,W*0.72]){ ctx.strokeStyle='#3a7a2a'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(lx,H*0.86); ctx.lineTo(lx,H*0.72); ctx.stroke(); ctx.fillStyle='#9a6fd0'; for (let k=0;k<5;k++){ ctx.beginPath(); ctx.arc(lx,H*0.72+k*3,2.4,0,7); ctx.fill(); } }

  // bees flying between hives and flowers (little figure-8 paths)
  for (let i=0;i<6;i++){ const bx=W*0.5+Math.sin(t*1.5+i*1.1)*W*0.42; const by=groundY-4+Math.sin(t*2.4+i*2)*18; ctx.fillStyle='#e0a020'; ctx.beginPath(); ctx.ellipse(bx,by,2.4,1.7,0,0,7); ctx.fill(); ctx.fillStyle='#2a2018'; ctx.fillRect(bx-0.8,by-1.4,0.9,2.8); ctx.fillStyle='rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(bx,by-2,2,1,0,0,7); ctx.fill(); }
  // a honey jar on a little stump (left, low)
  ctx.fillStyle='#6a4a2e'; ctx.fillRect(W*0.10-6,H*0.90,12,10); ctx.fillStyle='#e0a828'; roundRect(W*0.10-5,H*0.90-12,10,12,2); ctx.fill(); ctx.fillStyle='#c98a1a'; ctx.fillRect(W*0.10-5,H*0.90-12,10,3); ctx.fillStyle='#fff'; ctx.fillRect(W*0.10-3,H*0.90-8,6,4);
  // wildflowers in the meadow
  SpriteRenderer.submit({sprite:'wildflowers',x:W*0.50,y:H*0.80,frame:Math.floor(sceneTime*3)%4});
  // grass tuft near the hives
  SpriteRenderer.submit({sprite:'grassTuft',x:W*0.38,y:groundY+32,frame:Math.floor(sceneTime*3+1)%4});
}
registerScene('beekeepergarden', drawBeekeeperGarden);

/* ── KELP FOREST (underwater · sea otters & swaying kelp) ── */
function drawKelpForest(){
  const t = sceneTime, floorY = H*0.86;

  // deep ocean water column (fills canvas), lighter near surface
  const water=ctx.createLinearGradient(0,0,0,H); water.addColorStop(0,'#2a7a9a'); water.addColorStop(0.5,'#186078'); water.addColorStop(1,'#0c3a4c');
  ctx.fillStyle=water; ctx.fillRect(0,0,W,H);
  // dappled sunlight from the surface
  ctx.fillStyle='rgba(200,240,255,.10)'; for (let i=0;i<5;i++){ ctx.save(); ctx.translate(W*0.1+i*W*0.2,0); ctx.rotate(0.14); ctx.fillRect(0,0,18,H*0.7); ctx.restore(); }
  ctx.strokeStyle='rgba(180,235,255,.10)'; ctx.lineWidth=2; for (let i=0;i<5;i++){ ctx.beginPath(); for (let x=0;x<=W;x+=8){ const y=10+i*12+Math.sin(x*0.05+t*1.2+i)*4; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke(); }

  // towering kelp fronds swaying (rooted at the floor, reaching to surface)
  function kelp(bx,sway,thick,leaves){ ctx.strokeStyle='#3a6a2a'; ctx.lineWidth=thick; ctx.beginPath(); ctx.moveTo(bx,floorY);
    for (let s=0;s<=10;s++){ const y=floorY-(floorY)*s/10; const x=bx+Math.sin(t*0.8+s*0.5+sway)*(s*1.6); s===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
    // blade leaves
    ctx.fillStyle='#4a8a3a'; for (let s=1;s<=9;s+=1){ const y=floorY-(floorY)*s/10; const x=bx+Math.sin(t*0.8+s*0.5+sway)*(s*1.6); ctx.save(); ctx.translate(x,y); ctx.rotate(Math.sin(t+s)*0.3+ (leaves?0.6:-0.6)); ctx.beginPath(); ctx.ellipse(leaves?7:-7,0,8,2.4,0,0,7); ctx.fill(); ctx.restore(); }
    // gas bladders (little floats)
    ctx.fillStyle='#6a9a4a'; for (let s=2;s<=8;s+=2){ const y=floorY-(floorY)*s/10; const x=bx+Math.sin(t*0.8+s*0.5+sway)*(s*1.6); ctx.beginPath(); ctx.arc(x+(leaves?4:-4),y-2,2,0,7); ctx.fill(); } }
  kelp(W*0.10,0,4,true); kelp(W*0.24,1.2,3,false); kelp(W*0.90,0.6,4,false); kelp(W*0.78,2.0,3,true); kelp(W*0.5,1.6,3,true);

  // rising bubbles
  for (let i=0;i<20;i++){ const bx=(i*61+9)%W; const by=(H-((t*16+i*33)%H)); ctx.fillStyle='rgba(210,245,255,.2)'; ctx.beginPath(); ctx.arc(bx,by,1+(i%3),0,7); ctx.fill(); }

  // a couple of fish schooling through
  for (let i=0;i<5;i++){ const fx=((t*22+i*30)%(W+50))-25; const fy=H*0.30+i*8+Math.sin(t*2+i)*6; ctx.save(); ctx.translate(fx,fy); ctx.fillStyle='#c8b060'; ctx.beginPath(); ctx.ellipse(0,0,7,3,0,0,7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-11,-3); ctx.lineTo(-11,3); ctx.fill(); ctx.restore(); }

  // sea otter floating near the surface (on its back, paws up)
  const ox=W*0.4+Math.sin(t*0.4)*30, oy=H*0.16+Math.sin(t*0.8)*4;
  ctx.fillStyle='#6a4a30'; ctx.beginPath(); ctx.ellipse(ox,oy,18,8,0,0,7); ctx.fill(); // body floating
  ctx.beginPath(); ctx.arc(ox+16,oy-2,6,0,7); ctx.fill(); // head
  ctx.fillStyle='#8a6a4a'; ctx.beginPath(); ctx.arc(ox+16,oy-1,4,0,7); ctx.fill(); // face
  ctx.fillStyle='#2a1a10'; ctx.beginPath(); ctx.arc(ox+18,oy-3,1,0,7); ctx.arc(ox+14,oy-3,1,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(ox+19,oy-1,1,0,7); ctx.fill();
  // paws on belly (holding a shell)
  ctx.fillStyle='#5a3a24'; ctx.beginPath(); ctx.arc(ox-2,oy-5,3,0,7); ctx.arc(ox+4,oy-6,3,0,7); ctx.fill();
  ctx.fillStyle='#c9b0a0'; ctx.beginPath(); ctx.arc(ox+1,oy-8,3,Math.PI,0); ctx.fill();
  // a second otter pup nearby
  const px=ox-30+Math.sin(t*0.5+1)*10, py=oy+6; ctx.fillStyle='#7a5a3a'; ctx.beginPath(); ctx.ellipse(px,py,10,5,0,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(px+9,py-1,4,0,7); ctx.fill(); ctx.fillStyle='#2a1a10'; ctx.beginPath(); ctx.arc(px+10,py-2,0.8,0,7); ctx.fill();

  // rocky seabed with anemones/urchins
  const bed=ctx.createLinearGradient(0,floorY,0,H); bed.addColorStop(0,'#3a4a4a'); bed.addColorStop(1,'#243434'); ctx.fillStyle=bed; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='#2e3e3e'; for (let i=0;i<6;i++){ ctx.beginPath(); ctx.arc((i*67+20)%W,floorY+ (i%2)*4,8+ (i%3)*3,Math.PI,0); ctx.fill(); }
  // purple urchins
  for (const ux of [W*0.2,W*0.8,W*0.55]){ ctx.fillStyle='#7a3a8a'; ctx.beginPath(); ctx.arc(ux,floorY+4,4,0,7); ctx.fill(); ctx.strokeStyle='#7a3a8a'; ctx.lineWidth=1; for (let k=0;k<8;k++){ const a=k/8*6.28; ctx.beginPath(); ctx.moveTo(ux,floorY+4); ctx.lineTo(ux+Math.cos(a)*7,floorY+4+Math.sin(a)*7); ctx.stroke(); } }
  // anemone
  ctx.fillStyle='#e07a8a'; for (let k=0;k<9;k++){ const a=Math.PI+ k/8*Math.PI; ctx.beginPath(); ctx.moveTo(W*0.35,floorY+4); ctx.lineTo(W*0.35+Math.cos(a)*8,floorY+4+Math.sin(a)*8+Math.sin(t*2+k)*2); ctx.lineWidth=2; ctx.strokeStyle='#e07a8a'; ctx.stroke(); }
}
registerScene('kelpforest', drawKelpForest);

/* ── CHEESE CAVE (indoor · aging cellar with wheels of cheese) ── */
function drawCheeseCave(){
  const t = sceneTime, floorY = H*0.74;

  // cool stone cellar (fills canvas), dim
  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#3a352e'); bg.addColorStop(0.6,'#4a4238'); bg.addColorStop(1,'#2e2822');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // vaulted brick ceiling arch
  ctx.fillStyle='#2e2820'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W,0); ctx.lineTo(W,H*0.14); ctx.quadraticCurveTo(W*0.5,H*0.02,0,H*0.14); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; for (let i=0;i<7;i++){ const a=i/6; ctx.beginPath(); ctx.moveTo(a*W,H*0.14 - Math.sin(a*Math.PI)*H*0.10); ctx.lineTo(a*W,0); ctx.stroke(); }
  // stone-block back wall
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let y=H*0.16;y<floorY;y+=18){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); for (let x=((y/18|0)%2)*24; x<W; x+=48){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+18); ctx.stroke(); } }

  // warm lantern glow
  const glow=ctx.createRadialGradient(W*0.5,H*0.20,10,W*0.5,H*0.20,160); glow.addColorStop(0,'rgba(240,200,120,.14)'); glow.addColorStop(1,'rgba(240,200,120,0)'); ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
  // hanging bulb
  ctx.strokeStyle='#2a2018'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.5,H*0.10); ctx.lineTo(W*0.5,H*0.16); ctx.stroke();
  ctx.fillStyle=`rgba(255,210,130,${0.85+0.08*Math.sin(t*2)})`; ctx.beginPath(); ctx.arc(W*0.5,H*0.18,5,0,7); ctx.fill(); ctx.fillStyle='rgba(255,210,130,.2)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.18,14,0,7); ctx.fill();

  // wooden shelving stacked with cheese wheels (both sides + back)
  function cheeseShelf(sx,sw,rows){ for (let r=0;r<rows;r++){ const sy=H*0.24+r*H*0.16;
    ctx.fillStyle='#4a3420'; ctx.fillRect(sx,sy+22,sw,5);
    // wheels resting on the plank
    const n=Math.floor(sw/26);
    for (let i=0;i<n;i++){ const wx=sx+14+i*26; const rind=['#e6c878','#d8a84a','#e8d090','#c89a58'][(i+r)%4];
      ctx.fillStyle=rind; ctx.beginPath(); ctx.arc(wx,sy+12,12,0,7); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.12)'; ctx.beginPath(); ctx.arc(wx,sy+12,12,0.4,2.4); ctx.fill();
      ctx.strokeStyle='rgba(120,90,40,.5)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(wx,sy+12,12,0,7); ctx.stroke();
      // wax stamp
      ctx.fillStyle='#a03030'; ctx.beginPath(); ctx.arc(wx,sy+12,3,0,7); ctx.fill(); } } }
  cheeseShelf(W*0.02,W*0.30,3); cheeseShelf(W*0.68,W*0.30,3);

  // a cut wedge display + a couple of stacked wheels center-back (high)
  ctx.fillStyle='#4a3420'; ctx.fillRect(W*0.40,H*0.30,W*0.20,5);
  ctx.fillStyle='#e8d090'; ctx.beginPath(); ctx.arc(W*0.5,H*0.30-10,14,0,7); ctx.fill(); // wheel
  ctx.fillStyle='#f2e2a8'; ctx.beginPath(); ctx.moveTo(W*0.5,H*0.30-10); ctx.arc(W*0.5,H*0.30-10,14,-0.4,0.8); ctx.closePath(); ctx.fill(); // cut wedge lighter
  ctx.fillStyle='rgba(255,255,255,.5)'; for (let k=0;k<5;k++){ ctx.beginPath(); ctx.arc(W*0.5+2+k*1.5,H*0.30-12+k*1.2,0.8,0,7); ctx.fill(); } // holes

  // stone floor + a barrel and a crate (sides, low)
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#3a3228'); fl.addColorStop(1,'#26201a'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.22)'; ctx.lineWidth=1; for (let y=floorY+10;y<H;y+=14){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // oak barrel (left, low)
  const bxx=W*0.14, byy=H*0.90; ctx.fillStyle='#6a4326'; roundRect(bxx-16,byy-20,32,30,6); ctx.fill(); ctx.strokeStyle='#3a2414'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(bxx-16,byy-12); ctx.lineTo(bxx+16,byy-12); ctx.moveTo(bxx-16,byy+2); ctx.lineTo(bxx+16,byy+2); ctx.stroke(); ctx.fillStyle='#8a6038'; roundRect(bxx-16,byy-22,32,4,2); ctx.fill();
  // wooden crate with small cheeses (right, low)
  const cxx=W*0.86, cyy=H*0.92; ctx.fillStyle='#8a6038'; ctx.fillRect(cxx-16,cyy-14,32,20); ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=1; ctx.strokeRect(cxx-16,cyy-14,32,20); ctx.beginPath(); ctx.moveTo(cxx-16,cyy-4); ctx.lineTo(cxx+16,cyy-4); ctx.stroke();
  ctx.fillStyle='#e8d090'; ctx.beginPath(); ctx.arc(cxx-7,cyy-16,5,0,7); ctx.arc(cxx+6,cyy-16,5,0,7); ctx.fill();
}
registerScene('cheesecave', drawCheeseCave);

/* ── CITRUS GROVE (outdoor · sunny orange orchard) ── */
function drawCitrusGrove(){
  const t = sceneTime, groundY = H*0.66;

  // warm mediterranean sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#6fbce8'); sky.addColorStop(1,'#f2ecc8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='#fff2a8'; ctx.beginPath(); ctx.arc(W*0.80,H*0.13,20,0,7); ctx.fill(); ctx.fillStyle='rgba(255,242,168,.3)'; ctx.beginPath(); ctx.arc(W*0.80,H*0.13,32,0,7); ctx.fill();
  drawSpriteCloud(W*0.22+Math.sin(t*0.1)*8,H*0.10,0.55); drawSpriteCloud(W*0.55+Math.sin(t*0.08+2)*6,H*0.16,0.4);

  // distant hills with rows of trees
  ctx.fillStyle='#7aa84a'; ctx.beginPath(); ctx.moveTo(0,groundY); for(let x=0;x<=W;x+=20){ ctx.lineTo(x,groundY-22-14*Math.sin(x*0.016+1)); } ctx.lineTo(W,groundY); ctx.fill();
  ctx.fillStyle='#5a8a3a'; for (let x=6;x<W;x+=20){ ctx.beginPath(); ctx.arc(x,groundY-24,5,0,7); ctx.fill(); }

  // grove ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#6aa842'); gr.addColorStop(1,'#4a842e'); ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  // fallen oranges + dappled shade
  ctx.fillStyle='rgba(30,70,15,.18)'; for (const [sx,sr] of [[W*0.3,40],[W*0.7,44],[W*0.5,30]]){ ctx.beginPath(); ctx.ellipse(sx,groundY+30,sr,10,0,0,7); ctx.fill(); }
  ctx.fillStyle='#e8843a'; for (const [fx,fy] of [[W*0.34,H*0.86],[W*0.62,H*0.90],[W*0.5,H*0.94]]){ ctx.beginPath(); ctx.arc(fx,fy,4,0,7); ctx.fill(); ctx.fillStyle='#3a7a2a'; ctx.fillRect(fx-1,fy-5,2,2); ctx.fillStyle='#e8843a'; }

  // big orange trees framing the sides (glossy leaves + oranges)
  function citrusTree(cx,baseY,sc){ ctx.save(); ctx.translate(cx,baseY); ctx.scale(sc,sc);
    // trunk
    ctx.fillStyle='#6a4a2e'; ctx.fillRect(-6,-40,12,40);
    ctx.strokeStyle='#5a3a1e'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(0,-30); ctx.lineTo(-14,-46); ctx.moveTo(0,-34); ctx.lineTo(16,-50); ctx.stroke();
    // canopy — layered green mounds
    ctx.fillStyle='#2f7a34'; for (let k=0;k<7;k++){ const a=k/7*6.28; ctx.beginPath(); ctx.arc(Math.cos(a)*26,-56+Math.sin(a)*20,20,0,7); ctx.fill(); }
    ctx.fillStyle='#3a9a3e'; for (let k=0;k<5;k++){ const a=k/5*6.28+0.5; ctx.beginPath(); ctx.arc(Math.cos(a)*16,-56+Math.sin(a)*12,15,0,7); ctx.fill(); }
    // oranges dotted in the canopy
    for (let i=0;i<9;i++){ const a=i/9*6.28; const ox2=Math.cos(a)*24 + Math.sin(t+i)*1.5; const oy2=-56+Math.sin(a)*20; ctx.fillStyle='#f0842a'; ctx.beginPath(); ctx.arc(ox2,oy2,4,0,7); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(ox2-1,oy2-1,1.2,0,7); ctx.fill(); }
    // white blossoms
    ctx.fillStyle='#fff'; for (let i=0;i<5;i++){ const a=i/5*6.28+1; ctx.beginPath(); ctx.arc(Math.cos(a)*22,-56+Math.sin(a)*16,1.8,0,7); ctx.fill(); }
    ctx.restore(); }
  citrusTree(W*0.14,groundY+30,1.5); citrusTree(W*0.88,groundY+34,1.6); citrusTree(W*0.5,groundY+8,0.8);

  // a wooden crate of picked oranges (right-back, high) + a ladder against a tree (left)
  ctx.fillStyle='#8a6038'; ctx.fillRect(W*0.64,groundY-4,40,14); ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=1; ctx.strokeRect(W*0.64,groundY-4,40,14);
  for (let i=0;i<6;i++){ ctx.fillStyle='#f0842a'; ctx.beginPath(); ctx.arc(W*0.64+7+ (i%3)*13, groundY-2-(i>2?6:0), 5,0,7); ctx.fill(); }
  ctx.strokeStyle='#a9885a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W*0.22,groundY+10); ctx.lineTo(W*0.16,groundY-70); ctx.moveTo(W*0.30,groundY+10); ctx.lineTo(W*0.24,groundY-70); ctx.stroke(); ctx.lineWidth=2; for (let k=0;k<7;k++){ const yy=groundY+6-k*11; ctx.beginPath(); ctx.moveTo(W*0.22-k*0.8,yy); ctx.lineTo(W*0.30-k*0.8,yy); ctx.stroke(); }

  // butterflies/bees in the sun
  for (let i=0;i<3;i++){ const bx=W*0.35+i*W*0.2+Math.sin(t*1.5+i)*16; const by=groundY-14+Math.cos(t*1.8+i)*12; ctx.fillStyle=i%2?'#e0a020':'#f2c84a'; ctx.beginPath(); ctx.ellipse(bx,by,2.4,1.6,0,0,7); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(bx,by-2,2,1,0,0,7); ctx.fill(); }
}
registerScene('citrusgrove', drawCitrusGrove);

/* ── WATERMILL (outdoor · turning wheel by a stream) ── */
function drawWatermill(){
  const t = sceneTime, groundY = H*0.40;

  // soft countryside sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#7ab8e6'); sky.addColorStop(1,'#d8ecd0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  drawSpriteCloud(W*0.25+Math.sin(t*0.09)*8,H*0.08,0.6); drawSpriteCloud(W*0.7+Math.sin(t*0.07+2)*6,H*0.12,0.5);

  // green hillside behind
  ctx.fillStyle='#5a9a3e'; ctx.fillRect(0,groundY-14,W,H-groundY+14);
  ctx.fillStyle='#4a8a2e'; ctx.beginPath(); ctx.moveTo(0,groundY); for(let x=0;x<=W;x+=20){ ctx.lineTo(x,groundY-6-8*Math.sin(x*0.03+1)); } ctx.lineTo(W,groundY); ctx.fill();
  // trees on the hill
  for (const [tx,ty] of [[W*0.1,groundY-10],[W*0.9,groundY-16],[W*0.78,groundY-8]]){ ctx.fillStyle='#5a3a20'; ctx.fillRect(tx-2,ty,4,14); ctx.fillStyle='#3a8a3a'; ctx.beginPath(); ctx.arc(tx,ty-4,10,0,7); ctx.fill(); }

  // the stone-and-timber mill house (left-center)
  const mx=W*0.30, my=H*0.24, mw=W*0.40, mh=H*0.44;
  ctx.fillStyle='#b8a888'; ctx.fillRect(mx,my,mw,mh);
  ctx.strokeStyle='rgba(0,0,0,.14)'; ctx.lineWidth=1; for (let y=my;y<my+mh;y+=12){ for (let x=mx+((y/12|0)%2)*10; x<mx+mw; x+=20){ ctx.strokeRect(x,y,20,12); } }
  // timber framing
  ctx.strokeStyle='#5a3a24'; ctx.lineWidth=3; ctx.strokeRect(mx,my,mw,mh); ctx.beginPath(); ctx.moveTo(mx,my+mh*0.5); ctx.lineTo(mx+mw,my+mh*0.5); ctx.moveTo(mx+mw*0.5,my); ctx.lineTo(mx+mw*0.5,my+mh); ctx.stroke();
  // pitched roof
  ctx.fillStyle='#7a4a2a'; ctx.beginPath(); ctx.moveTo(mx-10,my); ctx.lineTo(mx+mw*0.5,my-34); ctx.lineTo(mx+mw+10,my); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#8a5a34'; for (let x=mx-6;x<mx+mw;x+=8){ ctx.fillRect(x,my-4,3,4); }
  // window with warm glow
  ctx.fillStyle='#ffe6a0'; ctx.fillRect(mx+mw*0.18,my+mh*0.3,16,16); ctx.strokeStyle='#5a3a24'; ctx.lineWidth=2; ctx.strokeRect(mx+mw*0.18,my+mh*0.3,16,16);
  // a small door
  ctx.fillStyle='#5a3a24'; ctx.fillRect(mx+mw*0.6,my+mh-24,16,24);

  // the water wheel on the right side of the mill, turning
  const wcx=mx+mw+2, wcy=my+mh*0.55, wr=42;
  ctx.fillStyle='#2a1a10'; ctx.beginPath(); ctx.arc(wcx,wcy,wr,0,7); ctx.fill();
  ctx.fillStyle='#5a3a24'; ctx.beginPath(); ctx.arc(wcx,wcy,wr,0,7); ctx.arc(wcx,wcy,wr-6,0,7,true); ctx.fill();
  ctx.strokeStyle='#3a2414'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(wcx,wcy,wr-6,0,7); ctx.stroke();
  const rot=t*0.9;
  for (let k=0;k<12;k++){ const a=rot + k/12*6.28; ctx.strokeStyle='#4a3020'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(wcx,wcy); ctx.lineTo(wcx+Math.cos(a)*(wr-4),wcy+Math.sin(a)*(wr-4)); ctx.stroke();
    // paddle
    ctx.fillStyle='#6a4a2e'; ctx.save(); ctx.translate(wcx+Math.cos(a)*(wr-3),wcy+Math.sin(a)*(wr-3)); ctx.rotate(a); ctx.fillRect(-6,-2,12,4); ctx.restore(); }
  ctx.fillStyle='#3a2414'; ctx.beginPath(); ctx.arc(wcx,wcy,5,0,7); ctx.fill();
  // water pouring off the wheel + splashes
  ctx.strokeStyle='rgba(220,240,245,.5)'; ctx.lineWidth=1.5; for (let i=0;i<5;i++){ const sx=wcx+wr-6+i*2; ctx.beginPath(); ctx.moveTo(sx,wcy+ ((t*30+i*8)%20)-4); ctx.lineTo(sx,wcy+ ((t*30+i*8)%20)+4); ctx.stroke(); }

  // the stream / millpond (fills lower canvas)
  const wat=ctx.createLinearGradient(0,H*0.62,0,H); wat.addColorStop(0,'#5a9ab0'); wat.addColorStop(1,'#3a7288'); ctx.fillStyle=wat; ctx.fillRect(0,H*0.62,W,H-H*0.62);
  // moving current lines
  ctx.strokeStyle='rgba(230,245,248,.18)'; ctx.lineWidth=1; for (let y=H*0.64;y<H;y+=8){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.06+t*2+y)*2; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }
  // foam where the wheel meets the water
  ctx.fillStyle='rgba(255,255,255,.4)'; for (let i=0;i<10;i++){ const fx=wcx-10+ (i*4); const fy=H*0.62+2+Math.sin(t*4+i)*2; ctx.beginPath(); ctx.arc(fx,fy,1.6,0,7); ctx.fill(); }
  // reeds on the near bank (sides)
  ctx.strokeStyle='#3a7a3a'; ctx.lineWidth=2; for (const gx of [W*0.06,W*0.1,W*0.92]){ for (let k=-1;k<=1;k++){ ctx.beginPath(); ctx.moveTo(gx+k*3,H); ctx.quadraticCurveTo(gx+k*3+Math.sin(t*1.5+k+gx)*3,H*0.72,gx+k*3,H*0.62); ctx.stroke(); } }
  // a lily pad + a duck
  ctx.fillStyle='#2e7a4a'; ctx.beginPath(); ctx.ellipse(W*0.24,H*0.80,10,4,0,0.5,6.5); ctx.fill();
  // water ripple on the millpond
  SpriteRenderer.submit({sprite:'waterRipple',x:W*0.55,y:H*0.74,frame:Math.floor(sceneTime*5)%4});
  // fence near the mill
  SpriteRenderer.submit({sprite:'fence',x:W*0.14,y:groundY+6,frame:Math.floor(sceneTime*2)%4});
  SpriteRenderer.submit({sprite:'riverbankEdge',x:W*0.50,y:H*0.64,frame:2});
}
registerScene('watermill', drawWatermill);

/* ── QUILT SHOP (indoor · cozy patchwork & fabric store) ── */
function drawQuiltShop(){
  const t = sceneTime, floorY = H*0.72;

  // warm cream wall
  ctx.fillStyle='#f0e6d2'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='rgba(200,170,140,.14)'; for (let x=0;x<W;x+=20){ ctx.fillRect(x,0,10,floorY); }

  // a big patchwork quilt hung on the back wall (grid of colored patches)
  const qx=W*0.30, qy=H*0.10, qw=W*0.44, qh=H*0.34, cellsX=6, cellsY=5;
  ctx.fillStyle='#8a5a3a'; ctx.fillRect(qx-4,qy-4,qw+8,qh+8);
  const pcol=['#d0607a','#e0b040','#5a9ac0','#7ab06a','#c07ae0','#e0885a','#e6d0a0'];
  for (let r=0;r<cellsY;r++){ for (let c=0;c<cellsX;c++){ const px=qx+c*qw/cellsX, py=qy+r*qh/cellsY; const cw=qw/cellsX, ch=qh/cellsY;
    ctx.fillStyle=pcol[(r*cellsX+c)%pcol.length]; ctx.fillRect(px,py,cw,ch);
    // simple patch motif (alternating triangles / dots)
    ctx.fillStyle='rgba(255,255,255,.3)'; if ((r+c)%2){ ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+cw,py); ctx.lineTo(px,py+ch); ctx.closePath(); ctx.fill(); } else { ctx.beginPath(); ctx.arc(px+cw/2,py+ch/2,cw*0.18,0,7); ctx.fill(); }
    ctx.strokeStyle='rgba(90,60,40,.3)'; ctx.lineWidth=1; ctx.strokeRect(px,py,cw,ch); } }
  // stitching border
  ctx.strokeStyle='#efe6d0'; ctx.lineWidth=1; ctx.setLineDash([3,3]); ctx.strokeRect(qx,qy,qw,qh); ctx.setLineDash([]);

  // shelves of folded fabric bolts (left) + spools (right)
  for (let s=0;s<3;s++){ const sy=H*0.16+s*H*0.16; ctx.fillStyle='#8a6038'; ctx.fillRect(W*0.02,sy+16,W*0.20,5);
    for (let i=0;i<5;i++){ const fx=W*0.03+i*W*0.037; ctx.fillStyle=pcol[(i+s)%pcol.length]; ctx.fillRect(fx,sy,7,16); ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(fx,sy+3,7,1); } }
  // thread spool rack (right)
  ctx.fillStyle='#8a6038'; ctx.fillRect(W*0.80,H*0.16,4,H*0.30);
  for (let i=0;i<8;i++){ const sy=H*0.18+i*H*0.035; ctx.fillStyle=pcol[i%pcol.length]; roundRect(W*0.80+4,sy,16,8,2); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(W*0.80+4,sy+3,16,1.5); }

  // hanging sign + a garland of fabric triangles
  ctx.strokeStyle='rgba(150,110,90,.5)'; ctx.lineWidth=1; ctx.beginPath(); for (let x=0;x<=W;x+=8){ const y=10+Math.sin(x*0.05)*5; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  for (let x=6;x<W;x+=18){ const y=10+Math.sin(x*0.05)*5; ctx.fillStyle=pcol[(x/18|0)%pcol.length]; ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+5,y); ctx.lineTo(x,y+9); ctx.closePath(); ctx.fill(); }

  // wood floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#b98a58'); fl.addColorStop(1,'#966b3e'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; for (let x=0;x<W;x+=30){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-8,H); ctx.stroke(); }

  // an old sewing machine on a table (left, low) + a basket of yarn (right, low)
  const smx=W*0.16, smy=H*0.86;
  ctx.fillStyle='#5a3a2a'; ctx.fillRect(smx-24,smy+6,48,6); ctx.fillRect(smx-20,smy+12,4,14); ctx.fillRect(smx+16,smy+12,4,14);
  ctx.fillStyle='#1a1a20'; ctx.beginPath(); ctx.moveTo(smx-18,smy+6); ctx.lineTo(smx-18,smy-6); ctx.lineTo(smx-2,smy-6); ctx.lineTo(smx+2,smy+6); ctx.closePath(); ctx.fill(); // machine body arm
  ctx.fillRect(smx-18,smy,22,6); ctx.fillStyle='#c9a24a'; ctx.fillRect(smx-16,smy-4,3,3); // detail
  ctx.strokeStyle='#8a8a92'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(smx-4,smy-6); ctx.lineTo(smx-4,smy); ctx.stroke();
  // yarn basket (right, low)
  const ybx=W*0.86, yby=H*0.92; ctx.fillStyle='#a9742e'; ctx.beginPath(); ctx.moveTo(ybx-14,yby); ctx.lineTo(ybx+14,yby); ctx.lineTo(ybx+11,yby+14); ctx.lineTo(ybx-11,yby+14); ctx.closePath(); ctx.fill();
  for (let i=0;i<4;i++){ ctx.fillStyle=pcol[i]; ctx.beginPath(); ctx.arc(ybx-8+ (i%2)*14, yby-2-(i>1?7:0), 5,0,7); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=0.6; ctx.beginPath(); ctx.arc(ybx-8+ (i%2)*14, yby-2-(i>1?7:0), 3,0,7); ctx.stroke(); }
}
registerScene('quiltshop', drawQuiltShop);

/* ── MOSS GARDEN (outdoor · serene shaded Japanese moss garden) ── */
function drawMossGarden(){
  const t = sceneTime, groundY = H*0.44;

  // soft overcast light filtering through trees
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#cfe0d4'); sky.addColorStop(1,'#dce8d0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // dense green canopy across the top
  ctx.fillStyle='#2f5a34'; for (let i=0;i<7;i++){ const cx=i*60-10; ctx.beginPath(); ctx.arc(cx,10,44,0,7); ctx.fill(); }
  ctx.fillStyle='#3a6a3e'; for (let i=0;i<6;i++){ const cx=i*66+20; ctx.beginPath(); ctx.arc(cx,26,34,0,7); ctx.fill(); }
  // shafts of soft light
  ctx.fillStyle='rgba(240,250,220,.10)'; for (let i=0;i<3;i++){ ctx.save(); ctx.translate(W*0.3+i*50,0); ctx.rotate(0.2); ctx.fillRect(0,0,26,groundY+40); ctx.restore(); }

  // tree trunks (maple/cedar) rising into the canopy — sides
  ctx.fillStyle='#5a4030'; ctx.fillRect(W*0.06,0,14,groundY+20); ctx.fillRect(W*0.90,0,16,groundY+10);
  ctx.strokeStyle='rgba(30,20,10,.4)'; ctx.lineWidth=1; for (let y=20;y<groundY;y+=26){ ctx.beginPath(); ctx.moveTo(W*0.065,y); ctx.quadraticCurveTo(W*0.10,y+8,W*0.13,y+2); ctx.stroke(); }

  // undulating moss-covered ground (rich velvety greens)
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#4a8a3a'); gr.addColorStop(0.5,'#3a7a30'); gr.addColorStop(1,'#2e6428'); ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  // mossy mounds (soft bumps)
  for (let i=0;i<7;i++){ const mx=(i*57+20)%W; const my=groundY+18+ (i*29)%(H-groundY-20); const mr=14+ (i%3)*8; ctx.fillStyle= i%2?'#4a9a3e':'#3f8a34'; ctx.beginPath(); ctx.ellipse(mx,my,mr,mr*0.5,0,0,7); ctx.fill(); ctx.fillStyle='rgba(180,230,150,.12)'; ctx.beginPath(); ctx.ellipse(mx-mr*0.3,my-mr*0.2,mr*0.4,mr*0.2,0,0,7); ctx.fill(); }
  // moss speckle texture
  ctx.fillStyle='rgba(150,210,120,.2)'; for (let i=0;i<60;i++){ const sx=(i*53+7)%W, sy=groundY+8+((i*37+5)%(H-groundY-8)); ctx.fillRect(sx,sy,1.4,1.4); }

  // a curved stepping-stone path (center, low, for the pet)
  ctx.fillStyle='#8a8880'; for (let i=0;i<5;i++){ const sy=groundY+30+i*((H-groundY-30)/5); const sxc=W*0.5+Math.sin(i*0.8)*18; ctx.beginPath(); ctx.ellipse(sxc,sy,16-i*0.5,7,0,0,7); ctx.fill(); ctx.fillStyle='#767468'; ctx.beginPath(); ctx.ellipse(sxc,sy+1,13,5,0,0,7); ctx.fill(); ctx.fillStyle='#8a8880'; }

  // a stone lantern (right) + a small water basin (tsukubai, left)
  const lx=W*0.82, ly=groundY+40;
  ctx.fillStyle='#8a8880'; ctx.fillRect(lx-4,ly,8,20); ctx.fillRect(lx-9,ly-10,18,10); ctx.beginPath(); ctx.moveTo(lx-11,ly-10); ctx.lineTo(lx,ly-22); ctx.lineTo(lx+11,ly-10); ctx.fill(); ctx.fillStyle='#6a6860'; ctx.fillRect(lx-6,ly+20,12,6);
  ctx.fillStyle='rgba(255,220,140,.5)'; ctx.fillRect(lx-2,ly-7,4,4);
  // moss on the lantern
  ctx.fillStyle='rgba(90,150,70,.6)'; ctx.beginPath(); ctx.arc(lx-6,ly+18,3,0,7); ctx.fill();
  // tsukubai basin with a bamboo spout dripping
  const tx=W*0.16, ty=groundY+50; ctx.fillStyle='#6a6860'; ctx.beginPath(); ctx.arc(tx,ty,12,0,7); ctx.fill(); ctx.fillStyle='#4a7a8a'; ctx.beginPath(); ctx.arc(tx,ty,8,0,7); ctx.fill();
  ctx.strokeStyle='#8a9a4a'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(tx-2,ty-30); ctx.lineTo(tx-2,ty-12); ctx.stroke(); ctx.strokeStyle='#7a8a3a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(tx-2,ty-14); ctx.lineTo(tx+4,ty-12); ctx.stroke();
  // water drip
  const drop=(t*40)%20; ctx.fillStyle='rgba(180,220,235,.7)'; ctx.beginPath(); ctx.arc(tx+4,ty-12+drop,1.2,0,7); ctx.fill();
  ctx.strokeStyle='rgba(200,230,235,.4)'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.arc(tx,ty,5+ (drop/20)*4,0,7); ctx.stroke();

  // a red maple sapling accent (center-back, high)
  ctx.fillStyle='#5a3a20'; ctx.fillRect(W*0.5-2,groundY,4,-16+groundY-groundY); ctx.fillRect(W*0.5-2,groundY-14,4,14);
  ctx.fillStyle='#c0402a'; for (let k=0;k<5;k++){ const a=k/5*6.28; ctx.beginPath(); ctx.arc(W*0.5+Math.cos(a)*7,groundY-18+Math.sin(a)*5,4,0,7); ctx.fill(); }
}
registerScene('mossgarden', drawMossGarden);

/* ── WINTER CHALET (indoor · alpine cabin with a fire & big view) ── */
function drawWinterChalet(){
  const t = sceneTime, floorY = H*0.74;

  // warm knotty-pine walls
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#8a6238'); wall.addColorStop(1,'#6e4c2a');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1; for (let y=18;y<floorY;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); ctx.fillStyle='rgba(255,240,210,.05)'; ctx.fillRect(0,y,W,2); }
  // wood knots
  ctx.fillStyle='rgba(60,40,20,.3)'; for (const [kx,ky] of [[W*0.2,H*0.22],[W*0.55,H*0.4],[W*0.8,H*0.16]]){ ctx.beginPath(); ctx.ellipse(kx,ky,3,5,0,0,7); ctx.fill(); }
  // sloped ceiling beam
  ctx.fillStyle='#4a3420'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W,0); ctx.lineTo(W,10); ctx.lineTo(0,H*0.06); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#5a3e26'; ctx.save(); ctx.translate(0,0); ctx.transform(1,0.05,0,1,0,0); ctx.fillRect(-4,H*0.20,W+8,8); ctx.restore();

  // huge picture window with snowy alpine peaks (center-left)
  const wx=W*0.08, wy=H*0.12, ww=W*0.42, wh=H*0.42;
  const wg=ctx.createLinearGradient(0,wy,0,wy+wh); wg.addColorStop(0,'#9cc4e2'); wg.addColorStop(1,'#e6eef4'); ctx.fillStyle=wg; ctx.fillRect(wx,wy,ww,wh);
  // mountains
  ctx.fillStyle='#8a9ab0'; ctx.beginPath(); ctx.moveTo(wx,wy+wh); for (let x=0;x<=ww;x+=10){ ctx.lineTo(wx+x,wy+wh-30-30*Math.abs(Math.sin(x*0.03+1))); } ctx.lineTo(wx+ww,wy+wh); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(wx,wy+wh); for (let x=0;x<=ww;x+=10){ const peak=wy+wh-30-30*Math.abs(Math.sin(x*0.03+1)); ctx.lineTo(wx+x,peak+ (Math.abs(Math.sin(x*0.03+1))<0.7?100:14)); } ctx.lineTo(wx+ww,wy+wh); ctx.fill();
  // falling snow in the window
  for (let i=0;i<18;i++){ const sx=wx+((i*31+t*5)%ww); const sy=wy+((i*27+t*12)%wh); ctx.fillStyle='rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(sx,sy,1.3,0,7); ctx.fill(); }
  ctx.strokeStyle='#3a2818'; ctx.lineWidth=5; ctx.strokeRect(wx,wy,ww,wh); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(wx+ww/2,wy); ctx.lineTo(wx+ww/2,wy+wh); ctx.moveTo(wx,wy+wh/2); ctx.lineTo(wx+ww,wy+wh/2); ctx.stroke();

  // stone fireplace (right) with fire
  const fx=W*0.60, fy=H*0.16, fw=W*0.36, fh=floorY-fy;
  ctx.fillStyle='#8a8078'; ctx.fillRect(fx,fy,fw,fh);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let y=fy;y<floorY;y+=14){ for (let x=fx+((y/14|0)%2)*12; x<fx+fw; x+=24){ ctx.strokeRect(x,y,24,14); } }
  const bx=fx+10, by=fy+fh-42, bw=fw-20, bh=38; ctx.fillStyle='#1a0e08'; ctx.fillRect(bx,by,bw,bh);
  ctx.fillStyle='#5a3a20'; ctx.fillRect(bx+6,by+bh-8,bw-12,5); ctx.fillRect(bx+12,by+bh-13,bw-28,5);
  for (let i=0;i<6;i++){ const flx=bx+8+i*(bw-16)/5; const fl2=(12+7*Math.sin(t*6+i)); ctx.fillStyle='#e0641a'; ctx.beginPath(); ctx.moveTo(flx-4,by+bh-6); ctx.quadraticCurveTo(flx,by+bh-6-fl2,flx+4,by+bh-6); ctx.fill(); ctx.fillStyle='#f2b02a'; ctx.beginPath(); ctx.moveTo(flx-2,by+bh-6); ctx.quadraticCurveTo(flx,by+bh-6-fl2*0.6,flx+2,by+bh-6); ctx.fill(); }
  ctx.fillStyle=`rgba(255,150,60,${0.14+0.05*Math.sin(t*4)})`; ctx.beginPath(); ctx.ellipse(bx+bw/2,by+bh,bw*0.7,26,0,0,7); ctx.fill();
  // mantel with a clock + stockings
  ctx.fillStyle='#4a3420'; ctx.fillRect(fx-4,by-12,fw+8,10);
  ctx.fillStyle='#efe6d0'; ctx.beginPath(); ctx.arc(fx+fw*0.5,by-24,7,0,7); ctx.fill(); ctx.strokeStyle='#333'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(fx+fw*0.5,by-24); ctx.lineTo(fx+fw*0.5,by-29); ctx.stroke();
  for (let i=0;i<3;i++){ ctx.fillStyle=['#c0392b','#3a7a3a','#c0392b'][i]; ctx.beginPath(); ctx.moveTo(fx+10+i*22,by-12); ctx.lineTo(fx+10+i*22,by-4); ctx.lineTo(fx+16+i*22,by+2); ctx.lineTo(fx+18+i*22,by-2); ctx.lineTo(fx+16+i*22,by-12); ctx.closePath(); ctx.fill(); ctx.fillStyle='#fff'; ctx.fillRect(fx+10+i*22,by-12,8,2); }

  // plank floor + fur rug + snowshoes on the wall
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#8a6038'); fl.addColorStop(1,'#6a482a'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let x=0;x<W;x+=28){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-6,H); ctx.stroke(); }
  ctx.fillStyle='#e8e0d0'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.90,100,22,0,0,7); ctx.fill(); ctx.strokeStyle='rgba(180,170,150,.5)'; ctx.lineWidth=1; for (let i=0;i<24;i++){ const rx=W*0.5-94+i*8; ctx.beginPath(); ctx.moveTo(rx,H*0.90-16); ctx.lineTo(rx+2,H*0.90-20); ctx.stroke(); }
  // steaming cocoa mug on the rug (left, low)
  const mx=W*0.20, my=H*0.90; ctx.fillStyle='#c0392b'; roundRect(mx-7,my-8,14,12,2); ctx.fill(); ctx.fillStyle='#3a2418'; ctx.beginPath(); ctx.ellipse(mx,my-8,7,2.4,0,0,7); ctx.fill(); ctx.strokeStyle='#c0392b'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(mx+9,my-2,3,-1,1.4); ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=1.5; ctx.beginPath(); for (let k=0;k<=6;k++){ const yy=my-10-k*4, xx=mx+Math.sin(t*3+k*0.6)*3; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);} ctx.stroke();
}
registerScene('winterchalet', drawWinterChalet);

/* ── PENGUIN COVE (outdoor · icy antarctic shore) ── */
function drawPenguinCove(){
  const t = sceneTime, iceY = H*0.56, waterY = H*0.44;

  // cold pale sky
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#a8cfe6'); sky.addColorStop(1,'#e0eef2');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  ctx.fillStyle='rgba(255,250,235,.7)'; ctx.beginPath(); ctx.arc(W*0.78,H*0.14,16,0,7); ctx.fill();
  drawSpriteCloud(W*0.2+Math.sin(t*0.08)*8,H*0.09,0.6); drawSpriteCloud(W*0.55+Math.sin(t*0.07+2)*6,H*0.15,0.45);

  // distant icebergs on the horizon
  ctx.fillStyle='#cfe2ee'; for (const [bx,bw,bh] of [[W*0.1,60,30],[W*0.5,80,40],[W*0.82,50,26]]){ ctx.beginPath(); ctx.moveTo(bx-bw/2,waterY); ctx.lineTo(bx-bw*0.2,waterY-bh); ctx.lineTo(bx+bw*0.1,waterY-bh*0.7); ctx.lineTo(bx+bw/2,waterY); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle='#b8d4e2'; for (const [bx,bw] of [[W*0.1,60],[W*0.5,80],[W*0.82,50]]){ ctx.fillRect(bx-bw/2,waterY-3,bw,3); }

  // cold sea between horizon and ice shelf
  const sea=ctx.createLinearGradient(0,waterY,0,iceY); sea.addColorStop(0,'#3a7a9a'); sea.addColorStop(1,'#2a6284'); ctx.fillStyle=sea; ctx.fillRect(0,waterY,W,iceY-waterY);
  ctx.strokeStyle='rgba(220,240,245,.2)'; ctx.lineWidth=1; for (let y=waterY+4;y<iceY;y+=6){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.06+t*1.4+y)*1.4; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }
  // a penguin swimming/porpoising in the water
  const swx=(t*40)%(W+40)-20; ctx.fillStyle='#1a2028'; ctx.beginPath(); ctx.ellipse(swx,waterY+16+Math.sin(t*4)*4,9,4,0.3,0,7); ctx.fill();

  // icy shelf foreground (fills lower canvas)
  const ice=ctx.createLinearGradient(0,iceY,0,H); ice.addColorStop(0,'#e8f2f8'); ice.addColorStop(1,'#c4dae6'); ctx.fillStyle=ice; ctx.fillRect(0,iceY,W,H-iceY);
  // ice cracks + sheen
  ctx.strokeStyle='rgba(150,190,215,.4)'; ctx.lineWidth=1; for (let i=0;i<6;i++){ const cx=(i*61+15)%W; ctx.beginPath(); ctx.moveTo(cx,iceY+6); ctx.lineTo(cx+ (i%2?18:-14), iceY+40+ (i*10)%40); ctx.stroke(); }
  ctx.fillStyle='rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(W*0.4,iceY+30,120,14,0,0,7); ctx.fill();
  // a small snow mound + ice hole
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(W*0.86,iceY+10,26,10,0,Math.PI,0); ctx.fill();
  ctx.fillStyle='#2a6284'; ctx.beginPath(); ctx.ellipse(W*0.2,H*0.86,16,6,0,0,7); ctx.fill();

  // waddling penguins on the ice (sides + a couple mid) with tiny wing wobble
  function penguin(px,py,sc,facing){ ctx.save(); ctx.translate(px,py); ctx.scale(sc*facing,sc);
    // body
    ctx.fillStyle='#1a2028'; ctx.beginPath(); ctx.ellipse(0,-10,10,15,0,0,7); ctx.fill();
    // white belly
    ctx.fillStyle='#f4f6f4'; ctx.beginPath(); ctx.ellipse(1,-8,6,12,0,0,7); ctx.fill();
    // head
    ctx.fillStyle='#1a2028'; ctx.beginPath(); ctx.arc(0,-26,7,0,7); ctx.fill();
    ctx.fillStyle='#f4f6f4'; ctx.beginPath(); ctx.arc(1,-25,4,-0.4,1.6); ctx.fill();
    // beak + eye
    ctx.fillStyle='#e0902a'; ctx.beginPath(); ctx.moveTo(6,-26); ctx.lineTo(12,-25); ctx.lineTo(6,-23); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(3,-28,1.4,0,7); ctx.fill(); ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(3.4,-28,0.7,0,7); ctx.fill();
    // flipper (wobbling)
    ctx.fillStyle='#1a2028'; ctx.save(); ctx.translate(-8,-12); ctx.rotate(Math.sin(t*4+px)*0.3); ctx.beginPath(); ctx.ellipse(0,4,3,10,0,0,7); ctx.fill(); ctx.restore();
    // feet
    ctx.fillStyle='#e0902a'; ctx.beginPath(); ctx.ellipse(-3,4,3,1.6,0,0,7); ctx.ellipse(4,4,3,1.6,0,0,7); ctx.fill();
    ctx.restore(); }
  penguin(W*0.16,H*0.80,1.2,1); penguin(W*0.30,H*0.72,0.9,-1); penguin(W*0.84,H*0.82,1.3,-1); penguin(W*0.70,H*0.74,0.9,1);
  // a fluffy grey chick beside the big one
  ctx.fillStyle='#8a9098'; ctx.beginPath(); ctx.ellipse(W*0.22,H*0.82,6,8,0,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(W*0.22,H*0.76,4,0,7); ctx.fill(); ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(W*0.225,H*0.76,0.8,0,7); ctx.fill();
  // gentle snow flurries
  for (let i=0;i<24;i++){ const sx=(i*47+t*6)%W; const sy=(i*53+t*16)%H; ctx.fillStyle='rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(sx,sy,1+(i%2)*0.6,0,7); ctx.fill(); }
}
registerScene('penguincove', drawPenguinCove);

/* ── FIREFLY PIER (outdoor · lakeside dock at dusk) ── */
function drawFireflyPier(){
  const t = sceneTime, waterY = H*0.48, dockY = H*0.74;

  // dusk gradient sky
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#2a3a6a'); sky.addColorStop(0.5,'#6a5a8a'); sky.addColorStop(1,'#e0a878');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  // early stars up high
  for (let i=0;i<24;i++){ const sx=(i*71+5)%W, sy=(i*23+3)%(waterY*0.5); ctx.fillStyle=`rgba(255,250,235,${0.2+0.3*Math.abs(Math.sin(t*1.2+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }
  // setting sun low on the horizon
  ctx.fillStyle='rgba(255,200,120,.4)'; ctx.beginPath(); ctx.arc(W*0.5,waterY-4,30,0,7); ctx.fill(); ctx.fillStyle='#ffce8a'; ctx.beginPath(); ctx.arc(W*0.5,waterY-4,18,0,7); ctx.fill();

  // dark tree-lined far shore
  ctx.fillStyle='#1e2a2e'; ctx.beginPath(); ctx.moveTo(0,waterY); for (let x=0;x<=W;x+=14){ ctx.lineTo(x,waterY-10-8*Math.abs(Math.sin(x*0.05))); } ctx.lineTo(W,waterY); ctx.fill();

  // calm lake with sunset reflection
  const wat=ctx.createLinearGradient(0,waterY,0,dockY); wat.addColorStop(0,'#3a4a6a'); wat.addColorStop(1,'#2a3450'); ctx.fillStyle=wat; ctx.fillRect(0,waterY,W,dockY-waterY);
  for (let y=waterY; y<dockY; y+=3){ const p=(y-waterY)/(dockY-waterY); const wob=Math.sin(y*0.5+t*1.8)*(2+p*8); ctx.fillStyle=`rgba(255,190,110,${0.22*(1-p)})`; ctx.fillRect(W*0.5-8+wob,y,16+p*6,2); }
  ctx.strokeStyle='rgba(180,200,225,.12)'; ctx.lineWidth=1; for (let y=waterY+8;y<dockY;y+=9){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.06+t*1.3+y)*1.5; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }

  // wooden pier extending toward the viewer (foreground)
  const deck=ctx.createLinearGradient(0,dockY,0,H); deck.addColorStop(0,'#5a4028'); deck.addColorStop(1,'#3a2818'); ctx.fillStyle=deck; ctx.fillRect(0,dockY,W,H-dockY);
  ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=1; for (let i=-3;i<=8;i++){ const x0=W*0.5+i*26, x1=W*0.5+i*72; ctx.beginPath(); ctx.moveTo(x0,dockY); ctx.lineTo(x1,H); ctx.stroke(); }
  ctx.strokeStyle='rgba(255,225,180,.08)'; for (let y=dockY+6;y<H;y+=10){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.fillStyle='rgba(255,225,180,.12)'; ctx.fillRect(0,dockY,W,3);
  // a couple of pier posts with a lantern (left)
  const px=W*0.12; ctx.fillStyle='#241810'; ctx.fillRect(px-3,dockY-54,6,54); ctx.fillStyle='#3a2a1a'; ctx.fillRect(px-8,dockY-66,16,14);
  ctx.fillStyle='rgba(255,200,120,.3)'; ctx.beginPath(); ctx.arc(px,dockY-58,18,0,7); ctx.fill();
  ctx.fillStyle=`rgba(255,205,120,${0.85+0.12*Math.sin(t*2.5)})`; roundRect(px-5,dockY-64,10,12,2); ctx.fill();
  // right post
  ctx.fillStyle='#241810'; ctx.fillRect(W*0.9-3,dockY-40,6,40);

  // MANY fireflies drifting over the water and pier (blinking)
  for (let i=0;i<26;i++){ const fx=(i*53 + Math.sin(t*0.5+i)*30)%W; const fy=waterY+10 + ((i*37)% (dockY-waterY+20)) + Math.sin(t*1.2+i)*10; const blink=Math.sin(t*3+i*1.3);
    if (blink>0){ ctx.fillStyle=`rgba(190,255,140,${blink*0.9})`; ctx.beginPath(); ctx.arc(fx,fy,1.6,0,7); ctx.fill(); ctx.fillStyle=`rgba(190,255,140,${blink*0.25})`; ctx.beginPath(); ctx.arc(fx,fy,5,0,7); ctx.fill(); } }
  // a jar of caught fireflies glowing on the pier (right, low)
  const jx=W*0.86, jy=H*0.90; ctx.fillStyle='rgba(200,230,235,.25)'; roundRect(jx-8,jy-16,16,18,4); ctx.fill(); ctx.fillStyle='#8a6038'; ctx.fillRect(jx-8,jy-18,16,3);
  for (let i=0;i<4;i++){ const bl=Math.max(0,Math.sin(t*4+i*2)); ctx.fillStyle=`rgba(190,255,140,${0.4+bl*0.5})`; ctx.beginPath(); ctx.arc(jx-4+ (i%2)*7, jy-10+ (i>1?6:0), 1.6,0,7); ctx.fill(); }
  // fireflies sprite cluster over the water
  SpriteRenderer.submit({sprite:'fireflies',phase:'actors',x:W*0.40+Math.sin(t*0.5)*22,y:waterY+20+Math.sin(t*0.7)*10,anchorY:0.5,frame:Math.floor(t*5)%4});
  SpriteRenderer.submit({sprite:'dockEdge',x:W*0.50,y:dockY+10,frame:2});
}
registerScene('fireflypier', drawFireflyPier);

/* ── HERB DRYING SHED (indoor · rustic botanical workshop) ── */
function drawHerbShed(){
  const t = sceneTime, benchY = H*0.66;

  // weathered plank wall
  const wall=ctx.createLinearGradient(0,0,0,benchY); wall.addColorStop(0,'#8a7a58'); wall.addColorStop(1,'#6e5e40');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,benchY);
  ctx.strokeStyle='rgba(0,0,0,.16)'; ctx.lineWidth=1; for (let x=0;x<W;x+=22){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,benchY); ctx.stroke(); }

  // small window with green outside (right) letting in light
  const wx=W*0.72, wy=H*0.10, ww=W*0.22, wh=H*0.24;
  ctx.fillStyle='#bcd8b0'; ctx.fillRect(wx,wy,ww,wh); ctx.fillStyle='rgba(255,250,200,.3)'; ctx.fillRect(wx,wy,ww,wh*0.4);
  ctx.strokeStyle='#4a3420'; ctx.lineWidth=3; ctx.strokeRect(wx,wy,ww,wh); ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(wx+ww/2,wy); ctx.lineTo(wx+ww/2,wy+wh); ctx.moveTo(wx,wy+wh/2); ctx.lineTo(wx+ww,wy+wh/2); ctx.stroke();
  // dusty light beam from the window
  ctx.fillStyle='rgba(255,245,200,.08)'; ctx.beginPath(); ctx.moveTo(wx,wy+wh); ctx.lineTo(wx+ww,wy+wh); ctx.lineTo(wx+ww-30,benchY); ctx.lineTo(wx-40,benchY); ctx.closePath(); ctx.fill();

  // ceiling beam with MANY hanging bundles of drying herbs (the theme)
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(0,H*0.08,W,7);
  const herbCols=['#5a7a3a','#7a8a3a','#8a6a3a','#6a8a4a','#9a7a4a','#5a8a5a','#a08a4a'];
  for (let i=0;i<11;i++){ const bx=W*0.05+i*W*0.09; const len=20+ (i%4)*10; const sway=Math.sin(t*1.1+i)*2;
    ctx.strokeStyle='#5a4a30'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(bx,H*0.08+7); ctx.lineTo(bx+sway,H*0.08+12); ctx.stroke();
    // tied stem top
    ctx.fillStyle='#8a6a3a'; ctx.fillRect(bx+sway-2,H*0.08+12,4,4);
    // drooping leaves (bundle hanging down)
    ctx.strokeStyle=herbCols[i%herbCols.length]; ctx.lineWidth=1.4; ctx.fillStyle=herbCols[i%herbCols.length];
    for (let k=-3;k<=3;k++){ ctx.beginPath(); ctx.moveTo(bx+sway,H*0.08+16); ctx.quadraticCurveTo(bx+sway+k*3, H*0.08+16+len*0.6, bx+sway+k*2.4, H*0.08+16+len); ctx.stroke(); }
    // little flower/seed heads
    if (i%3===0){ ctx.fillStyle='#c07ab0'; ctx.beginPath(); ctx.arc(bx+sway,H*0.08+16+len,2.4,0,7); ctx.fill(); } }

  // a shelf of labeled jars (left)
  ctx.fillStyle='#4a3420'; ctx.fillRect(W*0.04,H*0.42,W*0.30,5);
  for (let i=0;i<5;i++){ const jx=W*0.07+i*W*0.055; ctx.fillStyle='rgba(210,225,215,.5)'; roundRect(jx-5,H*0.42-16,10,16,2); ctx.fill(); ctx.fillStyle=herbCols[i%herbCols.length]; ctx.fillRect(jx-4,H*0.42-9,8,9); ctx.fillStyle='#efe6d0'; ctx.fillRect(jx-4,H*0.42-6,8,4); ctx.fillStyle='#5a3a1a'; ctx.fillRect(jx-5,H*0.42-18,10,3); }

  // wooden work bench
  const bench=ctx.createLinearGradient(0,benchY,0,H); bench.addColorStop(0,'#7a5a3a'); bench.addColorStop(1,'#5a4028'); ctx.fillStyle=bench; ctx.fillRect(0,benchY,W,H-benchY);
  ctx.fillStyle='rgba(255,240,200,.1)'; ctx.fillRect(0,benchY,W,3);
  ctx.strokeStyle='rgba(0,0,0,.16)'; ctx.lineWidth=1; for (let x=0;x<W;x+=30){ ctx.beginPath(); ctx.moveTo(x,benchY); ctx.lineTo(x-8,H); ctx.stroke(); }

  // a mortar & pestle (center-back, high) + cut herbs + twine (sides, low)
  const px2=W*0.5, py2=benchY+14; ctx.fillStyle='#9a9088'; ctx.beginPath(); ctx.ellipse(px2,py2,14,7,0,0,Math.PI); ctx.fill(); ctx.fillStyle='#b0a89c'; ctx.beginPath(); ctx.ellipse(px2,py2-1,14,4,0,0,7); ctx.fill(); ctx.fillStyle='#5a7a3a'; ctx.beginPath(); ctx.ellipse(px2,py2-1,8,2.4,0,0,7); ctx.fill();
  ctx.strokeStyle='#7a6a5a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(px2+6,py2-2); ctx.lineTo(px2+16,py2-14); ctx.stroke();
  // scattered cut herbs on the bench (left, low)
  ctx.strokeStyle='#5a8a3a'; ctx.lineWidth=1; for (let i=0;i<8;i++){ const hx=W*0.16+ (i*5); ctx.beginPath(); ctx.moveTo(hx,H*0.90); ctx.lineTo(hx+rand(-4,4),H*0.90-rand(2,6)); ctx.stroke(); }
  // ball of twine (right, low)
  ctx.fillStyle='#d8c088'; ctx.beginPath(); ctx.arc(W*0.86,H*0.90,8,0,7); ctx.fill(); ctx.strokeStyle='rgba(150,120,70,.6)'; ctx.lineWidth=0.7; for (let k=0;k<5;k++){ ctx.beginPath(); ctx.arc(W*0.86,H*0.90,8-k*1.4,k,k+3); ctx.stroke(); }
  // a hanging scale (center-left, mid)
  ctx.strokeStyle='#8a8a92'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.36,H*0.30); ctx.lineTo(W*0.36,H*0.40); ctx.moveTo(W*0.30,H*0.40); ctx.lineTo(W*0.42,H*0.40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W*0.30,H*0.40); ctx.lineTo(W*0.30,H*0.44); ctx.moveTo(W*0.42,H*0.40); ctx.lineTo(W*0.42,H*0.44); ctx.stroke();
  ctx.fillStyle='#b0a89c'; ctx.beginPath(); ctx.ellipse(W*0.30,H*0.44,6,2,0,0,7); ctx.ellipse(W*0.42,H*0.44,6,2,0,0,7); ctx.fill();
}
registerScene('herbshed', drawHerbShed);

/* ── CRANBERRY HARVEST (outdoor · flooded bog of floating berries) ── */
function drawCranberryHarvest(){
  const t = sceneTime, bogY = H*0.44;

  // crisp autumn sky
  const sky=ctx.createLinearGradient(0,0,0,bogY); sky.addColorStop(0,'#7ab8e6'); sky.addColorStop(1,'#e6dcc0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,bogY);
  ctx.fillStyle='rgba(255,244,200,.6)'; ctx.beginPath(); ctx.arc(W*0.78,H*0.13,18,0,7); ctx.fill();
  drawSpriteCloud(W*0.22+Math.sin(t*0.1)*8,H*0.10,0.55); drawSpriteCloud(W*0.5+Math.sin(t*0.08+2)*6,H*0.16,0.4);

  // autumn tree line + low hills on the far bank
  ctx.fillStyle='#c06a2a'; ctx.fillRect(0,bogY-20,W,24);
  for (let x=0;x<W;x+=18){ ctx.fillStyle=['#d0842a','#c0402a','#e0a83a','#b85a2a'][(x/18|0)%4]; ctx.beginPath(); ctx.arc(x,bogY-20,9,Math.PI,0); ctx.fill(); }
  // a small red harvest barn on the bank (left)
  ctx.fillStyle='#a03828'; ctx.fillRect(W*0.08,bogY-38,34,22); ctx.fillStyle='#6a241a'; ctx.beginPath(); ctx.moveTo(W*0.08-4,bogY-38); ctx.lineTo(W*0.08+17,bogY-50); ctx.lineTo(W*0.08+38,bogY-38); ctx.fill(); ctx.fillStyle='#3a1a12'; ctx.fillRect(W*0.08+13,bogY-30,8,14);

  // the flooded bog water (fills lower canvas) — deep with reflections
  const wat=ctx.createLinearGradient(0,bogY,0,H); wat.addColorStop(0,'#4a6a5a'); wat.addColorStop(1,'#2e4a44'); ctx.fillStyle=wat; ctx.fillRect(0,bogY,W,H-bogY);
  ctx.strokeStyle='rgba(210,230,225,.10)'; ctx.lineWidth=1; for (let y=bogY+8;y<H;y+=10){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.05+t*1.2+y)*1.4; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }

  // vast rafts of floating red cranberries drifting on the surface (the theme)
  for (let i=0;i<240;i++){ const bx=(i*37 + t*4 + Math.sin(i)*10)%W; const by=bogY+8 + (i*53 % (H-bogY-8)); const shade=['#c0261e','#d83a2a','#a01e18','#e0503a'][i%4]; ctx.fillStyle=shade; ctx.beginPath(); ctx.arc(bx,by,2.4,0,7); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(bx-0.7,by-0.7,0.8,0,7); ctx.fill(); }
  // corralled clusters — denser berry patches gathered by floating booms
  ctx.strokeStyle='#5a4028'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.3,bogY+40); ctx.quadraticCurveTo(W*0.5,bogY+30,W*0.72,bogY+46); ctx.stroke();
  ctx.fillStyle='rgba(180,30,24,.35)'; ctx.beginPath(); ctx.ellipse(W*0.5,bogY+70,W*0.42,40,0,0,7); ctx.fill();

  // a wader/harvester silhouette pushing berries (right, mid) — simple, off to side
  const hx=W*0.82, hy=bogY+40; ctx.fillStyle='#3a4a5a'; ctx.fillRect(hx-4,hy-24,8,20); ctx.beginPath(); ctx.arc(hx,hy-28,5,0,7); ctx.fill();
  ctx.fillStyle='#e0b040'; ctx.beginPath(); ctx.arc(hx,hy-28,5,Math.PI,0); ctx.fill(); // hat brim
  ctx.strokeStyle='#8a6038'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(hx+3,hy-20); ctx.lineTo(hx+18,hy-2); ctx.stroke();
  ctx.fillStyle='#b0483a'; ctx.beginPath(); ctx.ellipse(hx+20,hy+2,10,3,0,0,7); ctx.fill();

  // wooden crates of collected berries on a dock (left, low)
  const dx=W*0.14; ctx.fillStyle='#6a4a2e'; ctx.fillRect(0,H*0.88,W*0.28,6);
  for (let c=0;c<2;c++){ const cxx=dx-6+c*22; ctx.fillStyle='#8a6038'; ctx.fillRect(cxx-12,H*0.88-14,22,14); ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=1; ctx.strokeRect(cxx-12,H*0.88-14,22,14);
    for (let k=0;k<5;k++){ ctx.fillStyle='#c0261e'; ctx.beginPath(); ctx.arc(cxx-8+k*4,H*0.88-16,2.4,0,7); ctx.fill(); } }
}
registerScene('cranberryharvest', drawCranberryHarvest);

/* ── TIDAL CAVE (outdoor · sea cave with a glowing mouth) ── */
function drawTidalCave(){
  const t = sceneTime, waterY = H*0.60;

  // dark rock all around (fills canvas)
  const rock=ctx.createLinearGradient(0,0,0,H); rock.addColorStop(0,'#1a1620'); rock.addColorStop(0.5,'#2a2430'); rock.addColorStop(1,'#14101a');
  ctx.fillStyle=rock; ctx.fillRect(0,0,W,H);

  // bright cave mouth opening to a turquoise sea + sky (center)
  const mx=W*0.5, mTop=H*0.16, mBot=H*0.66, mw=W*0.44;
  ctx.save(); ctx.beginPath(); ctx.moveTo(mx-mw/2,mBot); ctx.lineTo(mx-mw/2,mTop+40); ctx.quadraticCurveTo(mx-mw*0.3,mTop,mx,mTop); ctx.quadraticCurveTo(mx+mw*0.3,mTop,mx+mw/2,mTop+40); ctx.lineTo(mx+mw/2,mBot); ctx.closePath(); ctx.clip();
  // sky through the mouth
  const osky=ctx.createLinearGradient(0,mTop,0,waterY); osky.addColorStop(0,'#8fd0ea'); osky.addColorStop(1,'#d8f0ec'); ctx.fillStyle=osky; ctx.fillRect(mx-mw/2,mTop,mw,waterY-mTop);
  ctx.fillStyle='rgba(255,250,220,.6)'; ctx.beginPath(); ctx.arc(mx+mw*0.2,mTop+30,14,0,7); ctx.fill();
  // bright sea through the mouth
  const osea=ctx.createLinearGradient(0,waterY,0,mBot); osea.addColorStop(0,'#3ac0c8'); osea.addColorStop(1,'#2a9aa8'); ctx.fillStyle=osea; ctx.fillRect(mx-mw/2,waterY,mw,mBot-waterY);
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=1; for (let y=waterY+4;y<mBot;y+=6){ ctx.beginPath(); for (let x=mx-mw/2;x<=mx+mw/2;x+=6){ const yy=y+Math.sin(x*0.08+t*1.6+y)*1.6; x===mx-mw/2?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }
  // a sailboat far out through the opening
  ctx.fillStyle='#5a6a7a'; ctx.beginPath(); ctx.moveTo(mx+8,waterY-2); ctx.lineTo(mx+18,waterY-2); ctx.lineTo(mx+13,waterY+3); ctx.fill(); ctx.fillStyle='#efe6d0'; ctx.beginPath(); ctx.moveTo(mx+13,waterY-2); ctx.lineTo(mx+13,waterY-12); ctx.lineTo(mx+20,waterY-3); ctx.fill();
  ctx.restore();

  // cave mouth rim highlight (backlit rock edge)
  ctx.strokeStyle='rgba(150,220,230,.4)'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(mx-mw/2,mBot); ctx.lineTo(mx-mw/2,mTop+40); ctx.quadraticCurveTo(mx-mw*0.3,mTop,mx,mTop); ctx.quadraticCurveTo(mx+mw*0.3,mTop,mx+mw/2,mTop+40); ctx.lineTo(mx+mw/2,mBot); ctx.stroke();

  // stalactites hanging from the cave ceiling (framing)
  ctx.fillStyle='#0e0a14'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W,0); ctx.lineTo(W,40);
  for (let x=W; x>=0; x-=24){ ctx.lineTo(x-12, 40+26*Math.abs(Math.sin(x*0.3))); ctx.lineTo(x-24,40); } ctx.closePath(); ctx.fill();

  // the water inside the cave (dark reflective, fills bottom) with the mouth-glow spilling in
  const inWat=ctx.createLinearGradient(0,waterY,0,H); inWat.addColorStop(0,'#1a3a40'); inWat.addColorStop(1,'#0c1e22'); ctx.fillStyle=inWat; ctx.fillRect(0,waterY,W,H-waterY);
  // turquoise glow reflection under the mouth
  const gg=ctx.createRadialGradient(mx,waterY,10,mx,waterY,120); gg.addColorStop(0,'rgba(80,220,220,.22)'); gg.addColorStop(1,'rgba(80,220,220,0)'); ctx.fillStyle=gg; ctx.fillRect(0,waterY,W,H-waterY);
  // rippling reflection column
  for (let y=waterY; y<H; y+=3){ const p=(y-waterY)/(H-waterY); const wob=Math.sin(y*0.4+t*2)*(3+p*10); ctx.fillStyle=`rgba(150,235,235,${0.14*(1-p)})`; ctx.fillRect(mx-14+wob,y,28+p*10,2); }
  ctx.strokeStyle='rgba(120,200,210,.14)'; ctx.lineWidth=1; for (let y=waterY+8;y<H;y+=9){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.05+t*1.3+y)*1.6; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }

  // wet rocky ledges in the foreground (sides) with a starfish + glisten
  ctx.fillStyle='#241f2a'; ctx.beginPath(); ctx.moveTo(0,H); ctx.lineTo(0,waterY+10); ctx.quadraticCurveTo(W*0.14,waterY+30,W*0.2,H); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W,H); ctx.lineTo(W,waterY+6); ctx.quadraticCurveTo(W*0.86,waterY+34,W*0.80,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(150,220,230,.15)'; ctx.beginPath(); ctx.ellipse(W*0.08,H*0.86,10,4,0.3,0,7); ctx.fill();
  // starfish on the left ledge
  ctx.fillStyle='#d86a4a'; ctx.save(); ctx.translate(W*0.12,H*0.90); for (let k=0;k<5;k++){ ctx.rotate(6.28/5); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-8); ctx.lineTo(2.4,-3); ctx.closePath(); ctx.fill(); } ctx.restore();
  // drips from a stalactite
  const drip=(t*40)%40; ctx.fillStyle='rgba(150,220,230,.6)'; ctx.beginPath(); ctx.arc(W*0.3, 30+drip, 1.4,0,7); ctx.fill();
}
registerScene('tidalcave', drawTidalCave);

/* ── BAMBOO TEAROOM (indoor · minimalist bamboo tea space) ── */
function drawBambooTearoom(){
  const t = sceneTime, floorY = H*0.62;

  // pale warm wall
  ctx.fillStyle='#efe6d0'; ctx.fillRect(0,0,W,floorY);
  // a glowing paper screen behind (green garden light beyond)
  const shX=W*0.06, shW=W*0.88, shY=H*0.06, shH=floorY-shY-4;
  const shg=ctx.createLinearGradient(0,shY,0,shY+shH); shg.addColorStop(0,'#eef2dc'); shg.addColorStop(1,'#dce8c8'); ctx.fillStyle=shg; ctx.fillRect(shX,shY,shW,shH);
  // silhouettes of bamboo stalks behind the screen (soft)
  ctx.strokeStyle='rgba(90,130,70,.35)'; ctx.lineWidth=4; for (let i=0;i<7;i++){ const bx=shX+16+i*(shW/7); ctx.beginPath(); ctx.moveTo(bx+Math.sin(t*0.6+i)*2,shY); ctx.lineTo(bx,shY+shH); ctx.stroke(); ctx.strokeStyle='rgba(70,110,55,.3)'; ctx.lineWidth=1; for (let k=1;k<6;k++){ ctx.beginPath(); ctx.moveTo(bx-4,shY+k*shH/6); ctx.lineTo(bx+4,shY+k*shH/6); ctx.stroke(); } ctx.strokeStyle='rgba(90,130,70,.35)'; ctx.lineWidth=4; }
  // soft leaf shadows
  ctx.fillStyle='rgba(70,110,55,.2)'; for (let i=0;i<10;i++){ const lx=shX+ (i*67%shW); const ly=shY+ (i*41% (shH*0.7)); ctx.save(); ctx.translate(lx,ly); ctx.rotate(i); ctx.beginPath(); ctx.ellipse(0,0,10,2.6,0,0,7); ctx.fill(); ctx.restore(); }
  // shoji lattice frame over the screen
  ctx.strokeStyle='#7a5a3a'; ctx.lineWidth=3; ctx.strokeRect(shX,shY,shW,shH); ctx.lineWidth=1.4; for (let x=shX;x<=shX+shW+1;x+=shW/5){ ctx.beginPath(); ctx.moveTo(x,shY); ctx.lineTo(x,shY+shH); ctx.stroke(); } for (let y=shY;y<=shY+shH+1;y+=shH/4){ ctx.beginPath(); ctx.moveTo(shX,y); ctx.lineTo(shX+shW,y); ctx.stroke(); }

  // a hanging bamboo wind chime (left)
  ctx.strokeStyle='#5a4a30'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.14,0); ctx.lineTo(W*0.14,H*0.10); ctx.stroke();
  for (let i=0;i<3;i++){ const cx=W*0.14-6+i*6; const sw=Math.sin(t*2+i)*2; ctx.fillStyle='#9aae6a'; roundRect(cx-1.5+sw,H*0.10,3,12,1); ctx.fill(); }

  // tatami floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#c2b47a'); fl.addColorStop(1,'#a89a66'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(120,110,70,.25)'; ctx.lineWidth=1; for (let y=floorY+4;y<H;y+=4){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.strokeStyle='#3a4a2a'; ctx.lineWidth=2; for (let x=0;x<=W;x+=W/3){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x,H); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0,floorY+(H-floorY)/2); ctx.lineTo(W,floorY+(H-floorY)/2); ctx.stroke();

  // low bamboo tea table with a cast-iron pot + cups + steam (center-back, high)
  const tx=W*0.5, ty=floorY+22;
  ctx.fillStyle='#7a5a34'; roundRect(tx-42,ty,84,9,2); ctx.fill(); ctx.fillStyle='#5a3f22'; ctx.fillRect(tx-36,ty+9,5,12); ctx.fillRect(tx+31,ty+9,5,12);
  // iron teapot
  ctx.fillStyle='#2a2a30'; ctx.beginPath(); ctx.ellipse(tx-10,ty-8,13,10,0,0,7); ctx.fill(); ctx.beginPath(); ctx.moveTo(tx-22,ty-10); ctx.lineTo(tx-30,ty-16); ctx.lineTo(tx-26,ty-6); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#2a2a30'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(tx-10,ty-20,6,Math.PI,0); ctx.stroke();
  // cups
  ctx.fillStyle='#d8c8a8'; ctx.beginPath(); ctx.arc(tx+12,ty-3,4,0,7); ctx.arc(tx+24,ty-3,4,0,7); ctx.fill(); ctx.fillStyle='#7a8a4a'; ctx.beginPath(); ctx.arc(tx+12,ty-4,2.4,0,7); ctx.arc(tx+24,ty-4,2.4,0,7); ctx.fill();
  // steam
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=2; ctx.beginPath(); for (let k=0;k<=8;k++){ const yy=ty-18-k*4, xx=tx-10+Math.sin(t*3+k*0.6)*3; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);} ctx.stroke();

  // a bamboo vase with a single branch (right, low) + a floor cushion (left, low)
  ctx.fillStyle='#9aae6a'; roundRect(W*0.84,H*0.86,10,H*0.14-6,2); ctx.fill(); ctx.strokeStyle='#5a3a22'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.845,H*0.86); ctx.quadraticCurveTo(W*0.82,H*0.74,W*0.87,H*0.68); ctx.stroke(); ctx.fillStyle='#e589b0'; for (let k=0;k<4;k++){ ctx.beginPath(); ctx.arc(W*0.86+ (k%2?4:-2),H*0.70+k*3,2.4,0,7); ctx.fill(); }
  ctx.fillStyle='#b0483a'; ctx.beginPath(); ctx.ellipse(W*0.16,H*0.92,20,7,0,0,7); ctx.fill(); ctx.fillStyle='#c0584a'; ctx.beginPath(); ctx.ellipse(W*0.16,H*0.90,18,5,0,0,7); ctx.fill();
}
registerScene('bambootearoom', drawBambooTearoom);

/* ── REINDEER BARN (indoor · rustic winter stable) ── */
function drawReindeerBarn(){
  const t = sceneTime, floorY = H*0.72;

  // dark timber barn wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#5a4632'); wall.addColorStop(1,'#43331f');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  ctx.strokeStyle='rgba(0,0,0,.24)'; ctx.lineWidth=1; for (let x=0;x<W;x+=22){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,floorY); ctx.stroke(); }
  // A-frame rafters + hayloft
  ctx.fillStyle='#2e2216'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.5,H*0.02); ctx.lineTo(W,0); ctx.lineTo(W,H*0.12); ctx.lineTo(0,H*0.12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#1e140c'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(W*0.1,H*0.12); ctx.lineTo(W*0.5,H*0.02); ctx.lineTo(W*0.9,H*0.12); ctx.moveTo(W*0.5,H*0.02); ctx.lineTo(W*0.5,H*0.12); ctx.stroke();

  // snowy window (left) — night outside with stars
  const wx=W*0.08, wy=H*0.16, ww=W*0.24, wh=H*0.24;
  ctx.fillStyle='#16223e'; ctx.fillRect(wx,wy,ww,wh);
  for (let i=0;i<10;i++){ ctx.fillStyle='rgba(230,240,255,.8)'; ctx.fillRect(wx+ (i*23)%ww, wy+ (i*17)%wh, 1.2,1.2); }
  ctx.fillStyle='#e8eef6'; ctx.fillRect(wx,wy+wh-8,ww,8);
  ctx.strokeStyle='#2a1c10'; ctx.lineWidth=4; ctx.strokeRect(wx,wy,ww,wh); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(wx+ww/2,wy); ctx.lineTo(wx+ww/2,wy+wh); ctx.moveTo(wx,wy+wh/2); ctx.lineTo(wx+ww,wy+wh/2); ctx.stroke();

  // hanging lantern (center) + a garland of pine + a horseshoe
  ctx.strokeStyle='#1e140c'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.5,H*0.12); ctx.lineTo(W*0.5,H*0.18); ctx.stroke();
  ctx.fillStyle='rgba(255,200,110,.25)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.22,16,0,7); ctx.fill();
  ctx.fillStyle=`rgba(255,205,120,${0.85+0.1*Math.sin(t*2)})`; roundRect(W*0.5-6,H*0.18,12,14,2); ctx.fill();
  ctx.strokeStyle='#3a6a3a'; ctx.lineWidth=3; ctx.beginPath(); for (let x=W*0.6;x<W*0.94;x+=6){ const y=H*0.14+Math.sin(x*0.05)*4; x===W*0.6?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  ctx.strokeStyle='#9a9088'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(W*0.86,H*0.20,7,0.4,Math.PI-0.4); ctx.stroke();

  // wooden stall dividers
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(W*0.34,H*0.40,6,floorY-H*0.40); ctx.fillRect(W*0.66,H*0.40,6,floorY-H*0.40);
  ctx.fillStyle='#4a3420'; ctx.fillRect(W*0.34,H*0.40,W*0.32,5);
  // hay in a manger (center-back)
  ctx.fillStyle='#d8b85a'; ctx.beginPath(); ctx.moveTo(W*0.44,floorY-6); ctx.lineTo(W*0.56,floorY-6); ctx.lineTo(W*0.53,floorY-18); ctx.lineTo(W*0.47,floorY-18); ctx.closePath(); ctx.fill();
  for (let k=0;k<6;k++){ ctx.strokeStyle='#c8a840'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.46+k*2.5,floorY-16); ctx.lineTo(W*0.46+k*2.5+2,floorY-22); ctx.stroke(); }

  // the reindeer standing in its stall (center-right)
  const rx=W*0.62, ry=floorY-4;
  // legs
  ctx.strokeStyle='#6a4a30'; ctx.lineWidth=4; for (const lx of [-14,-6,6,14]){ ctx.beginPath(); ctx.moveTo(rx+lx,ry-22); ctx.lineTo(rx+lx,ry); ctx.stroke(); }
  // body
  ctx.fillStyle='#7a5636'; ctx.beginPath(); ctx.ellipse(rx,ry-30,22,13,0,0,7); ctx.fill();
  // neck + head
  ctx.fillStyle='#6a4a2e'; ctx.beginPath(); ctx.moveTo(rx+16,ry-38); ctx.lineTo(rx+30,ry-54); ctx.lineTo(rx+36,ry-50); ctx.lineTo(rx+22,ry-32); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(rx+34,ry-54,8,6,0.4,0,7); ctx.fill();
  // nose + eye
  ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.arc(rx+41,ry-52,2.4,0,7); ctx.fill();
  ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(rx+34,ry-56,1.4,0,7); ctx.fill();
  // antlers
  ctx.strokeStyle='#c9b89a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(rx+30,ry-58); ctx.lineTo(rx+26,ry-72); ctx.moveTo(rx+27,ry-66); ctx.lineTo(rx+20,ry-70); ctx.moveTo(rx+27,ry-64); ctx.lineTo(rx+33,ry-72);
  ctx.moveTo(rx+36,ry-58); ctx.lineTo(rx+40,ry-72); ctx.moveTo(rx+38,ry-66); ctx.lineTo(rx+45,ry-70); ctx.moveTo(rx+38,ry-64); ctx.lineTo(rx+33,ry-70); ctx.stroke();
  // ear
  ctx.fillStyle='#5a3f26'; ctx.beginPath(); ctx.ellipse(rx+28,ry-54,3,5,-0.6,0,7); ctx.fill();
  // a red harness bell (blinking)
  ctx.fillStyle=`rgba(230,200,90,${0.7+0.3*Math.sin(t*3)})`; ctx.beginPath(); ctx.arc(rx+26,ry-40,2.4,0,7); ctx.fill();

  // straw-strewn plank floor + a feed bucket & a small sack (sides, low)
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#8a6a44'); fl.addColorStop(1,'#6a4e30'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let y=floorY+10;y<H;y+=12){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.strokeStyle='rgba(210,180,90,.5)'; for (let i=0;i<20;i++){ const sx=(i*61+9)%W, sy=floorY+8+((i*29)%(H-floorY-8)); ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+rand(-4,4),sy-rand(2,4)); ctx.stroke(); }
  // metal feed bucket (left, low)
  const bxx=W*0.14, byy=H*0.90; ctx.fillStyle='#8a8e96'; ctx.beginPath(); ctx.moveTo(bxx-10,byy); ctx.lineTo(bxx+10,byy); ctx.lineTo(bxx+8,byy+16); ctx.lineTo(bxx-8,byy+16); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#6a6e76'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(bxx,byy,10,Math.PI,0); ctx.stroke(); ctx.fillStyle='#d8b85a'; ctx.beginPath(); ctx.ellipse(bxx,byy,8,2.6,0,0,7); ctx.fill();
  // burlap sack (right, low)
  ctx.fillStyle='#b8a074'; ctx.beginPath(); ctx.moveTo(W*0.84,H); ctx.lineTo(W*0.84,H*0.90); ctx.quadraticCurveTo(W*0.87,H*0.87,W*0.90,H*0.90); ctx.lineTo(W*0.90,H); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#8a7454'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.845,H*0.90); ctx.lineTo(W*0.895,H*0.90); ctx.stroke();
  // sprite reindeer in the left stall
  SpriteRenderer.submit({sprite:'reindeer',phase:'actors',x:W*0.22,y:floorY,anchorY:1,frame:Math.floor(t*6)%4});
}
registerScene('reindeerbarn', drawReindeerBarn);

/* ── MAPLE FOREST (outdoor · blazing autumn maples) ── */
function drawMapleForest(){
  const t = sceneTime, groundY = H*0.68;

  // hazy autumn sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#8fc4e8'); sky.addColorStop(1,'#f0e2c4');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='rgba(255,244,200,.55)'; ctx.beginPath(); ctx.arc(W*0.5,H*0.14,38,0,7); ctx.fill();

  // blazing canopy across the top (reds, oranges, golds — layered mounds)
  function canopy(cx,cy,r,col){ ctx.fillStyle=col; for (let k=0;k<7;k++){ const a=k/7*6.28; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r*0.6,cy+Math.sin(a)*r*0.6,r*0.5,0,7); ctx.fill(); } ctx.beginPath(); ctx.arc(cx,cy,r*0.6,0,7); ctx.fill(); }
  canopy(W*0.12,H*0.05,58,'#c0301e'); canopy(W*0.38,-8,66,'#e07020'); canopy(W*0.62,-4,60,'#d84a20'); canopy(W*0.86,H*0.04,60,'#e0a028'); canopy(W*0.5,H*0.02,44,'#e85a24'); canopy(W*0.26,H*0.03,42,'#e0902a');

  // background trunks receding
  ctx.fillStyle='#6a4a30'; for (const [tx,tw] of [[W*0.30,7],[W*0.5,8],[W*0.7,7]]){ ctx.fillRect(tx-tw/2,H*0.10,tw,groundY-H*0.10); }
  // sun rays through the canopy
  ctx.fillStyle='rgba(255,240,190,.08)'; for (let i=0;i<4;i++){ ctx.save(); ctx.translate(W*0.5,H*0.14); ctx.rotate(-0.5+i*0.3); ctx.fillRect(0,0,22,H*0.6); ctx.restore(); }

  // leaf-covered forest floor
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#a06a34'); gr.addColorStop(1,'#7a4e28'); ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  const leafCol=['#c0301e','#e07020','#e0a028','#d84a20','#b8842a'];
  for (let i=0;i<60;i++){ const lx=(i*47+7)%W; const ly=groundY+6+((i*37+5)%(H-groundY-6)); ctx.fillStyle=leafCol[i%5]; ctx.save(); ctx.translate(lx,ly); ctx.rotate(i);
    // maple-ish leaf: small pointed blob
    ctx.beginPath(); ctx.moveTo(0,-3); ctx.lineTo(2,0); ctx.lineTo(0,3); ctx.lineTo(-2,0); ctx.closePath(); ctx.fill(); ctx.restore(); }

  // big foreground maple trunks framing the sides with reachable low branches
  function mapleTrunk(bx,dir,sc){ ctx.save(); ctx.translate(bx,groundY); ctx.scale(1,1);
    ctx.fillStyle='#5a3a22'; ctx.fillRect(-9*sc,-(groundY-H*0.05),18*sc,groundY-H*0.05+6);
    ctx.strokeStyle='#4a2e18'; ctx.lineWidth=1; for (let i=0;i<7;i++){ const ly=-i*30-10; ctx.beginPath(); ctx.moveTo(-8*sc,ly); ctx.quadraticCurveTo(0,ly+8,8*sc,ly+2); ctx.stroke(); }
    // a low branch reaching in with clustered leaves
    ctx.strokeStyle='#5a3a22'; ctx.lineWidth=5*sc; ctx.beginPath(); ctx.moveTo(0,-groundY*0.4); ctx.quadraticCurveTo(dir*30,-groundY*0.42,dir*66,-groundY*0.3); ctx.stroke();
    ctx.fillStyle='#d84a20'; for (let k=0;k<6;k++){ ctx.beginPath(); ctx.arc(dir*(40+k*6),-groundY*0.34+Math.sin(t*1.2+k)*2,8,0,7); ctx.fill(); } ctx.restore(); }
  mapleTrunk(W*0.06,1,1.3); mapleTrunk(W*0.94,-1,1.4);

  // drifting falling leaves
  for (let i=0;i<22;i++){ const lx=(i*47 + t*9 + Math.sin(t*0.7+i)*24)%W; const ly=(i*53 + t*22)%H; ctx.fillStyle=leafCol[i%5]; ctx.save(); ctx.translate(lx,ly); ctx.rotate(t*2.4+i); ctx.beginPath(); ctx.moveTo(0,-3.5); ctx.lineTo(2.4,0); ctx.lineTo(0,3.5); ctx.lineTo(-2.4,0); ctx.closePath(); ctx.fill(); ctx.restore(); }

  // a small wooden footbridge over a leaf-filled ditch (center-back, low)
  ctx.strokeStyle='#8a6038'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W*0.36,groundY+20); ctx.quadraticCurveTo(W*0.5,groundY+8,W*0.64,groundY+20); ctx.stroke(); ctx.lineWidth=1; for (let x=W*0.37;x<W*0.64;x+=6){ const p=(x-W*0.36)/(W*0.28); const y=groundY+20-Math.sin(p*Math.PI)*12; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+6); ctx.stroke(); }
}
registerScene('mapleforest', drawMapleForest);

/* ── SKY GONDOLA (outdoor · mountain cable car ride) ── */
function drawSkyGondola(){
  const t = sceneTime, horizonY = H*0.46;

  // crisp alpine sky
  const sky=ctx.createLinearGradient(0,0,0,horizonY); sky.addColorStop(0,'#4a9ae2'); sky.addColorStop(1,'#bfe4f2');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,horizonY);
  ctx.fillStyle='#fff6b0'; ctx.beginPath(); ctx.arc(W*0.2,H*0.11,16,0,7); ctx.fill();
  drawSpriteCloud(W*0.6+Math.sin(t*0.09)*10,H*0.10,0.7); drawSpriteCloud(W*0.85+Math.sin(t*0.11+2)*6,H*0.20,0.5);

  // snow-capped mountain range below the cable
  ctx.fillStyle='#7a90a8'; ctx.beginPath(); ctx.moveTo(0,horizonY); for (let x=0;x<=W;x+=16){ ctx.lineTo(x,horizonY-46-40*Math.abs(Math.sin(x*0.012+1))); } ctx.lineTo(W,horizonY); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(0,horizonY); for (let x=0;x<=W;x+=16){ const peak=horizonY-46-40*Math.abs(Math.sin(x*0.012+1)); ctx.lineTo(x,peak+(Math.abs(Math.sin(x*0.012+1))>0.65?18:120)); } ctx.lineTo(W,horizonY); ctx.fill();
  // a second nearer ridge, forested green
  ctx.fillStyle='#3a6a3a'; ctx.beginPath(); ctx.moveTo(0,H*0.62); for (let x=0;x<=W;x+=14){ ctx.lineTo(x,H*0.62-24-18*Math.abs(Math.sin(x*0.02+3))); } ctx.lineTo(W,H*0.62); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  // pine texture on the near ridge
  ctx.fillStyle='#2f5a30'; for (let x=6;x<W;x+=16){ const ty=H*0.62-24-18*Math.abs(Math.sin(x*0.02+3)); ctx.beginPath(); ctx.moveTo(x,ty+10); ctx.lineTo(x-4,ty+20); ctx.lineTo(x+4,ty+20); ctx.fill(); }
  // deep valley haze
  ctx.fillStyle='rgba(220,235,245,.25)'; ctx.fillRect(0,H*0.58,W,20);

  // the support cables + a tower
  ctx.strokeStyle='#3a3a44'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(0,H*0.16); ctx.lineTo(W,H*0.26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,H*0.20); ctx.lineTo(W,H*0.30); ctx.stroke();
  // a pylon tower on the near ridge
  ctx.fillStyle='#5a5a64'; ctx.fillRect(W*0.78,H*0.30,5,H*0.28); ctx.fillStyle='#6a6a74'; ctx.fillRect(W*0.72,H*0.28,18,5);

  // OUR gondola cabin hanging in the foreground (we ride in it)
  const gx=W*0.42, gTop=H*0.24;
  // hanger arm to the cable
  ctx.strokeStyle='#2a2a34'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(gx,H*0.205); ctx.lineTo(gx,gTop+6); ctx.stroke();
  ctx.fillStyle='#3a3a44'; ctx.fillRect(gx-14,gTop,28,6); // grip/trolley
  ctx.beginPath(); ctx.arc(gx-8,H*0.205,3,0,7); ctx.arc(gx+8,H*0.205,3,0,7); ctx.fill();
  // cabin body (rounded, colorful) with a gentle sway
  const sway=Math.sin(t*0.8)*0.05;
  ctx.save(); ctx.translate(gx,gTop+6); ctx.rotate(sway);
  ctx.fillStyle='#c0392b'; roundRect(-40,0,80,68,12); ctx.fill();
  ctx.fillStyle='#a02a20'; roundRect(-40,54,80,14,6); ctx.fill(); // lower band
  // big windows
  ctx.fillStyle='#bfe0ea'; roundRect(-34,8,68,40,8); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.3)'; ctx.beginPath(); ctx.moveTo(-30,12); ctx.lineTo(-10,12); ctx.lineTo(-24,44); ctx.lineTo(-38,44); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#7a2018'; ctx.lineWidth=2; ctx.strokeRect(-34,8,68,40); ctx.beginPath(); ctx.moveTo(0,8); ctx.lineTo(0,48); ctx.stroke();
  // roof
  ctx.fillStyle='#e0b040'; roundRect(-42,-4,84,8,4); ctx.fill();
  ctx.restore();

  // a second gondola further down the line (small)
  const g2x=W*0.86, g2y=H*0.30; ctx.strokeStyle='#2a2a34'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(g2x,H*0.278); ctx.lineTo(g2x,g2y); ctx.stroke();
  ctx.fillStyle='#2a7ab0'; roundRect(g2x-14,g2y,28,22,4); ctx.fill(); ctx.fillStyle='#bfe0ea'; roundRect(g2x-10,g2y+4,20,12,2); ctx.fill();

  // a couple of birds gliding below
  ctx.strokeStyle='rgba(60,70,90,.5)'; ctx.lineWidth=1; for (let i=0;i<3;i++){ const bx=(W*0.3+i*40+t*10)%W, by=H*0.40+i*8; ctx.beginPath(); ctx.moveTo(bx-4,by); ctx.quadraticCurveTo(bx,by-3,bx+4,by); ctx.stroke(); }
}
registerScene('skygondola', drawSkyGondola);

/* ── CIDER MILL (indoor · apple pressing barn) ── */
function drawCiderMill(){
  const t = sceneTime, floorY = H*0.72;

  // warm barn-board wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#8a6a44'); wall.addColorStop(1,'#6a4c2c');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1; for (let x=0;x<W;x+=22){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,floorY); ctx.stroke(); }
  // rafter beam
  ctx.fillStyle='#4a3420'; ctx.fillRect(0,H*0.10,W,8);

  // open barn door (left) with an orchard view outside
  const dx=W*0.06, dy=H*0.16, dw=W*0.26, dh=floorY-dy;
  const og=ctx.createLinearGradient(0,dy,0,dy+dh); og.addColorStop(0,'#a8d4ea'); og.addColorStop(0.5,'#bcdca0'); og.addColorStop(1,'#8ab060'); ctx.fillStyle=og; ctx.fillRect(dx,dy,dw,dh);
  // an apple tree outside
  ctx.fillStyle='#5a3a20'; ctx.fillRect(dx+dw*0.5-3,dy+dh*0.4,6,dh*0.6); ctx.fillStyle='#3a8a3a'; ctx.beginPath(); ctx.arc(dx+dw*0.5,dy+dh*0.35,18,0,7); ctx.fill(); ctx.fillStyle='#c0392b'; for (let k=0;k<5;k++){ const a=k/5*6.28; ctx.beginPath(); ctx.arc(dx+dw*0.5+Math.cos(a)*12,dy+dh*0.35+Math.sin(a)*10,2.4,0,7); ctx.fill(); }
  ctx.strokeStyle='#3a2818'; ctx.lineWidth=4; ctx.strokeRect(dx,dy,dw,dh);

  // barrels stacked (right)
  function barrel(bx,by,w,h){ ctx.fillStyle='#8a5a34'; roundRect(bx-w/2,by-h,w,h,6); ctx.fill(); ctx.strokeStyle='#3a2414'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(bx-w/2,by-h*0.7); ctx.lineTo(bx+w/2,by-h*0.7); ctx.moveTo(bx-w/2,by-h*0.3); ctx.lineTo(bx+w/2,by-h*0.3); ctx.stroke(); ctx.fillStyle='#6a4326'; ctx.fillRect(bx-w/2,by-h,w,3); }
  barrel(W*0.86,floorY,34,30); barrel(W*0.80,floorY-32,32,26); barrel(W*0.92,floorY-30,30,24);

  // the central cider press (screw press with a wooden tub) — high, center-back
  const px=W*0.5, py=floorY-4;
  // base + tub
  ctx.fillStyle='#6a4326'; ctx.fillRect(px-26,py-30,52,30); ctx.strokeStyle='#3a2414'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(px-26,py-20); ctx.lineTo(px+26,py-20); ctx.moveTo(px-26,py-8); ctx.lineTo(px+26,py-8); ctx.stroke();
  // apples/pomace in the tub top
  ctx.fillStyle='#c0392b'; for (let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(px-18+i*9,py-30,4,0,7); ctx.fill(); }
  // frame posts + top beam
  ctx.fillStyle='#5a3f26'; ctx.fillRect(px-30,py-84,6,84); ctx.fillRect(px+24,py-84,6,84); ctx.fillRect(px-30,py-88,60,8);
  // the screw + turning wheel handle
  ctx.fillStyle='#8a8a92'; ctx.fillRect(px-2,py-80,4,44);
  ctx.strokeStyle='#8a8a92'; ctx.lineWidth=3; ctx.save(); ctx.translate(px,py-80); ctx.rotate(t*0.8); ctx.beginPath(); ctx.moveTo(-14,0); ctx.lineTo(14,0); ctx.moveTo(0,-14); ctx.lineTo(0,14); ctx.stroke(); for (let k=0;k<4;k++){ ctx.beginPath(); const a=k/4*6.28; ctx.arc(Math.cos(a)*14,Math.sin(a)*14,2.4,0,7); ctx.fillStyle='#6a6a72'; ctx.fill(); } ctx.restore();
  // pressing plate
  ctx.fillStyle='#7a5636'; ctx.fillRect(px-24,py-40,48,6);
  // cider stream + collecting jug at the spout
  ctx.strokeStyle='rgba(210,150,50,.8)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(px+26,py-14); ctx.lineTo(px+30,py-2+ ((t*30)%6)); ctx.stroke();
  ctx.fillStyle='#c98a2a'; roundRect(px+26,py-2,12,14,2); ctx.fill(); ctx.fillStyle='#e0a840'; ctx.beginPath(); ctx.ellipse(px+32,py-2,6,2,0,0,7); ctx.fill();

  // hanging string of dried apple slices
  ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=1; ctx.beginPath(); for (let x=W*0.32;x<W*0.66;x+=6){ const y=H*0.14+Math.sin(x*0.06)*4; x===W*0.32?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  for (let x=W*0.34;x<W*0.66;x+=12){ ctx.fillStyle='#e8c890'; ctx.beginPath(); ctx.arc(x,H*0.14+Math.sin(x*0.06)*4+6,3.4,0,7); ctx.fill(); ctx.fillStyle='#c8a860'; ctx.beginPath(); ctx.arc(x,H*0.14+Math.sin(x*0.06)*4+6,1.2,0,7); ctx.fill(); }

  // plank floor + a basket & crate of apples (sides, low)
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#8a6a44'); fl.addColorStop(1,'#6a4e30'); ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let y=floorY+10;y<H;y+=12){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // bushel basket of apples (left, low)
  const abx=W*0.16, aby=H*0.90; ctx.fillStyle='#a9742e'; ctx.beginPath(); ctx.moveTo(abx-16,aby); ctx.lineTo(abx+16,aby); ctx.lineTo(abx+13,aby+16); ctx.lineTo(abx-13,aby+16); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#7a5424'; ctx.lineWidth=1; for (let k=0;k<3;k++){ ctx.beginPath(); ctx.moveTo(abx-16,aby+4+k*5); ctx.lineTo(abx+16,aby+4+k*5); ctx.stroke(); }
  for (let k=0;k<6;k++){ ctx.fillStyle= k%2?'#c0392b':'#d05a2a'; ctx.beginPath(); ctx.arc(abx-11+k*4.4,aby-3-(k%2)*4,4,0,7); ctx.fill(); }
  // a jug of cider (right, low)
  ctx.fillStyle='#c98a2a'; roundRect(W*0.7,H*0.90,14,18,3); ctx.fill(); ctx.fillStyle='#8a5a1a'; ctx.fillRect(W*0.7+4,H*0.90-4,6,5); ctx.fillStyle='#fff'; ctx.fillRect(W*0.7+2,H*0.94,10,4);
}
registerScene('cidermill', drawCiderMill);

/* ── DRIFTWOOD BEACH (outdoor · windswept shore with driftwood) ── */
function drawDriftwoodBeach(){
  const t = sceneTime, seaY = H*0.40, sandY = H*0.58;

  // breezy overcast-blue sky
  const sky=ctx.createLinearGradient(0,0,0,seaY); sky.addColorStop(0,'#8ab4d2'); sky.addColorStop(1,'#dce8ea');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,seaY);
  ctx.fillStyle='rgba(255,250,235,.5)'; ctx.beginPath(); ctx.arc(W*0.24,H*0.14,20,0,7); ctx.fill();
  drawSpriteCloud(W*0.5+Math.sin(t*0.12)*14,H*0.10,0.8); drawSpriteCloud(W*0.82+Math.sin(t*0.1+2)*10,H*0.18,0.6);

  // gulls
  ctx.strokeStyle='rgba(70,80,90,.6)'; ctx.lineWidth=1.4; for (let i=0;i<4;i++){ const bx=(W*0.2+i*40+t*12)%W, by=H*0.12+i*7; ctx.beginPath(); ctx.moveTo(bx-5,by); ctx.quadraticCurveTo(bx,by-4,bx+5,by); ctx.stroke(); }

  // grey-green sea with rows of small waves
  const sea=ctx.createLinearGradient(0,seaY,0,sandY); sea.addColorStop(0,'#4a7a86'); sea.addColorStop(1,'#5a92a0'); ctx.fillStyle=sea; ctx.fillRect(0,seaY,W,sandY-seaY);
  ctx.strokeStyle='rgba(230,240,240,.3)'; ctx.lineWidth=1.5; for (let y=seaY+6;y<sandY;y+=7){ ctx.beginPath(); for (let x=0;x<=W;x+=6){ const yy=y+Math.sin(x*0.07+t*1.8+y)*2; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }
  // foamy wash line where sea meets sand
  const tide=sandY+2+Math.sin(t*0.7)*4;
  ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=2.5; ctx.beginPath(); for (let x=0;x<=W;x+=5){ const yy=tide+Math.sin(x*0.09+t*2)*3; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke();

  // pale windswept sand (fills lower canvas)
  const sand=ctx.createLinearGradient(0,sandY,0,H); sand.addColorStop(0,'#cdbf9e'); sand.addColorStop(1,'#b3a480'); ctx.fillStyle=sand; ctx.fillRect(0,sandY,W,H-sandY);
  // wind-ripple lines in the sand
  ctx.strokeStyle='rgba(150,135,100,.25)'; ctx.lineWidth=1; for (let y=sandY+14;y<H;y+=10){ ctx.beginPath(); for (let x=0;x<=W;x+=8){ const yy=y+Math.sin(x*0.08+y)*2; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }

  // big bleached driftwood logs (the theme) — foreground, sides
  function driftlog(cx,cy,len,ang,r){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(ang);
    ctx.fillStyle='#cfc4ac'; roundRect(-len/2,-r,len,r*2,r); ctx.fill();
    // grain + cracks
    ctx.strokeStyle='rgba(140,125,95,.5)'; ctx.lineWidth=1; for (let k=-2;k<=2;k++){ ctx.beginPath(); ctx.moveTo(-len/2+4,k*r*0.4); ctx.lineTo(len/2-4,k*r*0.4+Math.sin(k)*2); ctx.stroke(); }
    ctx.fillStyle='#a89877'; ctx.beginPath(); ctx.ellipse(len/2-2,0,2,r,0,0,7); ctx.fill(); // end grain
    // a couple of stubby broken branches
    ctx.strokeStyle='#cfc4ac'; ctx.lineWidth=r*0.7; ctx.beginPath(); ctx.moveTo(-len*0.1,-r*0.6); ctx.lineTo(-len*0.1+6,-r*2); ctx.stroke();
    ctx.restore(); }
  driftlog(W*0.72,H*0.86,120,-0.12,7);
  driftlog(W*0.22,H*0.92,90,0.15,6);
  driftlog(W*0.5,H*0.80,60,-0.4,4);

  // beach grass tufts leaning in the wind (sides)
  ctx.strokeStyle='#8a9a5a'; ctx.lineWidth=1; for (const gx of [W*0.08,W*0.14,W*0.9,W*0.96]){ for (let k=-3;k<=3;k++){ ctx.beginPath(); ctx.moveTo(gx,sandY+14); ctx.quadraticCurveTo(gx+8+k, sandY+2, gx+16+k*2+Math.sin(t*1.5+k)*2, sandY-8); ctx.stroke(); } }
  // scattered shells + a starfish + a stranded bit of kelp (low)
  ctx.fillStyle='#e0d0d0'; ctx.beginPath(); ctx.arc(W*0.36,H*0.90,5,Math.PI,0); ctx.fill(); ctx.strokeStyle='#c0a8a8'; ctx.lineWidth=1; for (let k=-2;k<=2;k++){ ctx.beginPath(); ctx.moveTo(W*0.36,H*0.90); ctx.lineTo(W*0.36+k*2,H*0.90-5); ctx.stroke(); }
  ctx.fillStyle='#d88a5a'; ctx.save(); ctx.translate(W*0.6,H*0.92); for (let k=0;k<5;k++){ ctx.rotate(6.28/5); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-7); ctx.lineTo(2.2,-3); ctx.closePath(); ctx.fill(); } ctx.restore();
  ctx.strokeStyle='#6a7a3a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.44,H*0.94); ctx.quadraticCurveTo(W*0.48,H*0.90,W*0.52,H*0.93); ctx.stroke();
  // crab near the driftwood
  SpriteRenderer.submit({sprite:'crab',phase:'actors',x:W*0.52+Math.sin(t*1.1)*10,y:H*0.84,anchorY:1,frame:Math.floor(t*7)%4});
  SpriteRenderer.submit({sprite:'beachSand',x:W*0.50,y:sandY+20,frame:2});
  SpriteRenderer.submit({sprite:'sandShoreline',x:W*0.50,y:sandY+6,frame:0});
}
registerScene('driftwoodbeach', drawDriftwoodBeach);

/* ── TAROT PARLOR (indoor · mystic reading room · candlelit) ── */
function drawTarotParlor(){
  const t = sceneTime, floorY = H*0.68;

  // deep velvet wall
  const wall=ctx.createLinearGradient(0,0,0,floorY);
  wall.addColorStop(0,'#1a0a20'); wall.addColorStop(0.5,'#2a1230'); wall.addColorStop(1,'#3a1a3a');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // ornate wallpaper pattern — faint repeating moons + stars
  ctx.globalAlpha=0.08;
  for (let y=16;y<floorY;y+=36){ for (let x=14;x<W;x+=36){
    ctx.fillStyle='#c0a0d0'; ctx.beginPath(); ctx.arc(x,y,5,0.4*Math.PI,1.6*Math.PI); ctx.fill(); // crescent
    ctx.fillStyle='#e0c060'; ctx.beginPath(); ctx.arc(x+16,y+16,2,0,7); ctx.fill(); // tiny star
  }}
  ctx.globalAlpha=1;

  // heavy curtain drapes at the sides
  for (const side of [-1,1]){
    const cx0=side<0?0:W-50;
    const cg=ctx.createLinearGradient(cx0,0,cx0+50*side,0);
    cg.addColorStop(0,'rgba(80,20,60,.85)'); cg.addColorStop(1,'rgba(80,20,60,0)');
    ctx.fillStyle=cg; ctx.fillRect(cx0,0,50,floorY);
    // fold lines
    ctx.strokeStyle='rgba(40,10,30,.5)'; ctx.lineWidth=1;
    for (let k=0;k<3;k++){ const fx=cx0+8+k*14*side; ctx.beginPath(); ctx.moveTo(fx,0); ctx.quadraticCurveTo(fx+Math.sin(t*0.5+k)*3,floorY*0.5,fx,floorY); ctx.stroke(); }
  }

  // round table in the center
  const tX=W*0.5, tY=floorY-8;
  // tablecloth
  ctx.fillStyle='#2a1040'; ctx.beginPath(); ctx.ellipse(tX,tY,68,20,0,0,7); ctx.fill();
  // embroidered border
  ctx.strokeStyle='#c9a040'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.ellipse(tX,tY,68,20,0,0,7); ctx.stroke();
  // gold embroidery dots on cloth
  for (let i=0;i<16;i++){ const a=i/16*Math.PI*2; ctx.fillStyle='#c9a040'; ctx.beginPath(); ctx.arc(tX+Math.cos(a)*60,tY+Math.sin(a)*17,1.6,0,7); ctx.fill(); }
  // table surface highlight
  ctx.fillStyle='rgba(160,100,180,.15)'; ctx.beginPath(); ctx.ellipse(tX,tY-2,60,16,0,0,7); ctx.fill();

  // tarot cards fanned on the table
  for (let i=0;i<5;i++){
    const ang=-0.3+i*0.15, cx=tX-30+i*15, cy=tY-6;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(ang);
    // card back
    ctx.fillStyle='#3a1a5a'; roundRect(-8,-13,16,26,2); ctx.fill();
    ctx.strokeStyle='#c9a040'; ctx.lineWidth=0.8; roundRect(-8,-13,16,26,2); ctx.stroke();
    // card face detail — central star/moon icon
    ctx.fillStyle='#c9a040';
    if (i===2){ // center card face-up
      ctx.fillStyle='#e8e0d0'; roundRect(-7,-12,14,24,1.5); ctx.fill();
      ctx.fillStyle='#5a2a8a'; ctx.beginPath(); ctx.arc(0,-2,4,0,7); ctx.fill(); // central orb
      ctx.strokeStyle='#c9a040'; ctx.lineWidth=0.6;
      for (let r=0;r<6;r++){ const ra=r/6*Math.PI*2; ctx.beginPath(); ctx.moveTo(0,-2); ctx.lineTo(Math.cos(ra)*7,Math.sin(ra)*7-2); ctx.stroke(); }
    } else {
      // decorative pattern on card backs
      ctx.beginPath(); ctx.arc(0,0,4,0,7); ctx.fill();
      ctx.strokeStyle='rgba(200,160,64,.5)'; ctx.lineWidth=0.6; roundRect(-5,-9,10,18,1); ctx.stroke();
    }
    ctx.restore();
  }

  // crystal ball on table (right of center)
  const cbX=tX+36, cbY=tY-10;
  // pedestal
  ctx.fillStyle='#2a1a10'; ctx.beginPath(); ctx.ellipse(cbX,cbY+6,10,4,0,0,7); ctx.fill();
  ctx.fillStyle='#4a3020'; ctx.fillRect(cbX-7,cbY+2,14,4);
  // ball
  const bg=ctx.createRadialGradient(cbX-3,cbY-4,2,cbX,cbY,12);
  bg.addColorStop(0,'rgba(180,160,220,.9)'); bg.addColorStop(0.5,'rgba(100,60,140,.7)'); bg.addColorStop(1,'rgba(40,20,60,.5)');
  ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(cbX,cbY-4,11,0,7); ctx.fill();
  // inner swirl
  ctx.strokeStyle=`rgba(200,180,255,${0.3+0.2*Math.sin(t*2)})`; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(cbX+Math.sin(t)*3,cbY-4+Math.cos(t*1.3)*2,4,0,7); ctx.stroke();
  // highlight
  ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(cbX-4,cbY-8,2.5,0,7); ctx.fill();

  // candelabra (left of center)
  const caX=tX-40, caY=tY-6;
  ctx.fillStyle='#c9a040'; ctx.fillRect(caX-1,caY-18,3,18);
  ctx.fillRect(caX-8,caY-24,2,10); ctx.fillRect(caX+7,caY-24,2,10);
  ctx.fillRect(caX-8,caY-14,17,2); // crossbar
  // candle cups
  for (const dx of [-8,0,8]){
    ctx.fillStyle='#e8d8c0'; ctx.fillRect(caX+dx-2,caY-30,5,6);
    // flames
    const fh=Math.sin(t*4+dx)*2;
    ctx.fillStyle=`rgba(255,200,80,${0.8+0.2*Math.sin(t*5+dx)})`;
    ctx.beginPath(); ctx.moveTo(caX+dx,caY-30); ctx.quadraticCurveTo(caX+dx-2,caY-36+fh,caX+dx,caY-40+fh); ctx.quadraticCurveTo(caX+dx+2,caY-36+fh,caX+dx,caY-30); ctx.fill();
    // warm glow around each flame
    ctx.fillStyle='rgba(255,180,60,.12)'; ctx.beginPath(); ctx.arc(caX+dx,caY-34,14,0,7); ctx.fill();
  }

  // incense smoke curling up from the left side
  ctx.strokeStyle='rgba(180,160,200,.2)'; ctx.lineWidth=2;
  for (let s=0;s<2;s++){
    ctx.beginPath();
    const sx=W*0.12+s*16;
    for (let k=0;k<=12;k++){ const yy=floorY-20-k*12, xx=sx+Math.sin(t*1.5+k*0.8+s)*8;
      k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);} ctx.stroke();
  }

  // zodiac wheel painted on the wall (behind, upper center)
  const zX=W*0.5, zY=H*0.18, zR=32;
  ctx.strokeStyle='rgba(200,160,64,.35)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(zX,zY,zR,0,7); ctx.stroke();
  ctx.beginPath(); ctx.arc(zX,zY,zR-8,0,7); ctx.stroke();
  // zodiac symbols (simplified marks around the ring)
  ctx.fillStyle='rgba(200,160,64,.3)';
  for (let i=0;i<12;i++){ const a=i/12*Math.PI*2-Math.PI/2;
    ctx.beginPath(); ctx.arc(zX+Math.cos(a)*(zR-4),zY+Math.sin(a)*(zR-4),2,0,7); ctx.fill(); }

  // hanging beaded curtain at far right
  ctx.strokeStyle='rgba(160,120,180,.3)'; ctx.lineWidth=1;
  for (let i=0;i<6;i++){ const bx=W*0.92+i*4;
    ctx.beginPath(); for (let k=0;k<8;k++){ const by=k*18; bx===W*0.92&&k===0?ctx.moveTo(bx,by):ctx.lineTo(bx,by+Math.sin(t*0.8+i)*2); }
    ctx.stroke();
    for (let k=0;k<8;k++){ ctx.fillStyle=['#a060c0','#c9a040','#e060a0'][k%3]; ctx.beginPath(); ctx.arc(bx,k*18+Math.sin(t*0.8+i)*2,1.8,0,7); ctx.fill(); }
  }

  // ornate rug / floor
  const fl=ctx.createLinearGradient(0,floorY,0,H);
  fl.addColorStop(0,'#3a1a28'); fl.addColorStop(1,'#2a1018');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  // rug pattern — faint gold border
  ctx.strokeStyle='rgba(200,160,64,.25)'; ctx.lineWidth=1;
  ctx.strokeRect(W*0.1,floorY+4,W*0.8,H-floorY-8);
  ctx.strokeRect(W*0.14,floorY+8,W*0.72,H-floorY-16);
  // rug central motif
  ctx.fillStyle='rgba(200,160,64,.12)'; ctx.beginPath(); ctx.arc(W*0.5,floorY+(H-floorY)*0.5,20,0,7); ctx.fill();
  for (let i=0;i<8;i++){ const a=i/8*Math.PI*2; ctx.beginPath(); ctx.moveTo(W*0.5,floorY+(H-floorY)*0.5); ctx.lineTo(W*0.5+Math.cos(a)*28,floorY+(H-floorY)*0.5+Math.sin(a)*10); ctx.stroke(); }

  // floating arcane runes drifting slowly upward
  ctx.font='12px serif'; ctx.textAlign='center';
  const runeChars=['\u2640','\u2642','\u2609','\u263D','\u2641','\u2643','\u2644'];
  for (let i=0;i<6;i++){
    const rx=(i*53+17)%W, ry=((i*71+t*12)%(floorY+40))-20;
    const rAlpha=0.06+0.06*Math.sin(t*1.2+i*1.7);
    ctx.fillStyle=`rgba(200,160,255,${rAlpha})`;
    ctx.fillText(runeChars[i%runeChars.length],rx,ry);
  }

  // pulsing energy rings around the crystal ball
  const cbPX=tX+36, cbPY=tY-14;
  for (let ring=0;ring<3;ring++){
    const rr=14+ring*6+Math.sin(t*3+ring*2)*2;
    ctx.strokeStyle=`rgba(180,140,255,${0.12-ring*0.03+0.06*Math.sin(t*2.5+ring)})`;
    ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.arc(cbPX,cbPY,rr,0,7); ctx.stroke();
  }

  // bubbling potion bottle on the floor (near left curtain)
  const pbX=W*0.16, pbY=floorY+10;
  // bottle body
  ctx.fillStyle='rgba(40,80,60,.7)'; roundRect(pbX-5,pbY-16,10,16,2); ctx.fill();
  ctx.fillStyle='rgba(40,80,60,.7)'; ctx.fillRect(pbX-2,pbY-22,4,6); // neck
  // liquid inside
  ctx.fillStyle=`rgba(80,220,160,${0.5+0.2*Math.sin(t*2)})`;
  roundRect(pbX-4,pbY-10,8,10,1); ctx.fill();
  // bubbles rising inside
  for (let b=0;b<3;b++){
    const bby=pbY-8-b*4-((t*20+b*30)%12);
    const bbx=pbX+Math.sin(t*3+b*2)*2;
    ctx.fillStyle=`rgba(120,255,200,${0.3+0.2*Math.sin(t*4+b)})`;
    ctx.beginPath(); ctx.arc(bbx,bby,1.2+Math.sin(t*3+b)*0.4,0,7); ctx.fill();
  }
  // potion glow
  ctx.fillStyle=`rgba(80,220,160,${0.06+0.04*Math.sin(t*2)})`;
  ctx.beginPath(); ctx.arc(pbX,pbY-6,18,0,7); ctx.fill();

  // mystical pendulum swinging from above (right of zodiac wheel)
  const penX=W*0.72, penAnchorY=0;
  const penAngle=Math.sin(t*0.8)*0.35;
  const penLen=floorY*0.35;
  const penBobX=penX+Math.sin(penAngle)*penLen;
  const penBobY=penAnchorY+Math.cos(penAngle)*penLen;
  ctx.strokeStyle='rgba(200,160,64,.3)'; ctx.lineWidth=0.8;
  ctx.beginPath(); ctx.moveTo(penX,penAnchorY); ctx.lineTo(penBobX,penBobY); ctx.stroke();
  // pendulum crystal
  ctx.fillStyle=`rgba(180,120,220,${0.6+0.2*Math.sin(t*1.6)})`;
  ctx.beginPath(); ctx.moveTo(penBobX,penBobY-6); ctx.lineTo(penBobX-4,penBobY); ctx.lineTo(penBobX,penBobY+8); ctx.lineTo(penBobX+4,penBobY); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(220,180,255,.2)'; ctx.beginPath(); ctx.arc(penBobX,penBobY,12,0,7); ctx.fill();

  // ambient sparkles drifting in candlelight
  for (let i=0;i<10;i++){
    const sx=(i*67+t*6)%W, sy=(i*43+Math.sin(t*0.4+i)*20)%(floorY*0.8)+10;
    ctx.fillStyle=`rgba(220,200,160,${0.1+0.15*Math.sin(t*2+i)})`;
    ctx.beginPath(); ctx.arc(sx,sy,1,0,7); ctx.fill();
  }

  // flickering warm ambient glow across the whole room from candles
  ctx.fillStyle=`rgba(255,200,100,${0.02+0.015*Math.sin(t*3)})`;
  ctx.fillRect(0,0,W,floorY);
}
registerScene('tarotparlor', drawTarotParlor);

/* ── ENCHANTED FOREST (outdoor · magical twilight · glowing flora) ── */
function drawEnchantedForest(){
  const t = sceneTime, groundY = H*0.64;

  // deep twilight sky through enchanted canopy
  const sky=ctx.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,'#0c0a1e'); sky.addColorStop(0.4,'#1a1240'); sky.addColorStop(1,'#2a1a4a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);

  // faint stars peeking through the canopy
  for (let i=0;i<30;i++){ const sx=(i*73+13)%W, sy=(i*31+7)%(groundY*0.4);
    ctx.fillStyle=`rgba(220,210,255,${0.15+0.25*Math.abs(Math.sin(t*1.3+i))})`; ctx.fillRect(sx,sy,1,1); }

  // moon glow filtering through trees (upper right)
  const mg=ctx.createRadialGradient(W*0.78,H*0.08,6,W*0.78,H*0.08,100);
  mg.addColorStop(0,'rgba(180,200,255,.18)'); mg.addColorStop(1,'rgba(180,200,255,0)');
  ctx.fillStyle=mg; ctx.fillRect(0,0,W,groundY);

  // moonbeam shafts through the canopy
  ctx.fillStyle='rgba(160,180,220,.04)';
  for (let i=0;i<4;i++){ ctx.save(); ctx.translate(W*0.15+i*60,0); ctx.rotate(0.08+i*0.04);
    ctx.fillRect(0,0,18,groundY); ctx.restore(); }

  // massive ancient trees (background silhouettes)
  ctx.fillStyle='#0a0814';
  for (const tx of [W*0.08,W*0.32,W*0.68,W*0.92]){
    const tw=18+Math.abs(Math.sin(tx))*10;
    ctx.fillRect(tx-tw/2,groundY-160,tw,160);
    // gnarled canopy
    ctx.beginPath(); ctx.arc(tx-10,groundY-150,28,0,7); ctx.arc(tx+12,groundY-140,32,0,7); ctx.arc(tx,groundY-160,24,0,7); ctx.fill();
    // exposed roots
    ctx.strokeStyle='#0a0814'; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(tx-tw/2,groundY); ctx.quadraticCurveTo(tx-tw-8,groundY+6,tx-tw-14,groundY+2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx+tw/2,groundY); ctx.quadraticCurveTo(tx+tw+8,groundY+6,tx+tw+14,groundY+2); ctx.stroke();
  }

  // mid-ground trees (slightly lighter)
  ctx.fillStyle='#12101e';
  for (const tx of [W*0.20,W*0.50,W*0.80]){
    ctx.fillRect(tx-8,groundY-110,16,110);
    ctx.beginPath(); ctx.arc(tx,groundY-100,22,0,7); ctx.fill();
  }

  // glowing magical flowers on the trees (bioluminescent blooms)
  function glowFlower(fx,fy,col,r){
    ctx.fillStyle=`rgba(${col},${0.15+0.1*Math.sin(t*2+fx+fy)})`;
    ctx.beginPath(); ctx.arc(fx,fy,r*3,0,7); ctx.fill(); // outer glow
    ctx.fillStyle=`rgba(${col},${0.6+0.3*Math.sin(t*2.5+fx)})`;
    ctx.beginPath(); ctx.arc(fx,fy,r,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(fx-r*0.3,fy-r*0.3,r*0.3,0,7); ctx.fill();
  }
  glowFlower(W*0.10,groundY-80,'120,180,255',4);
  glowFlower(W*0.35,groundY-120,'200,140,255',3.5);
  glowFlower(W*0.55,groundY-90,'100,220,200',4);
  glowFlower(W*0.75,groundY-130,'180,120,255',3);
  glowFlower(W*0.90,groundY-70,'140,200,255',3.5);

  // forest floor — mossy, soft
  const gr=ctx.createLinearGradient(0,groundY,0,H);
  gr.addColorStop(0,'#1a2a1a'); gr.addColorStop(1,'#0e1a0e');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);

  // glowing moss patches on the ground
  for (const mx of [W*0.15,W*0.40,W*0.65,W*0.85]){
    const my=groundY+6;
    ctx.fillStyle=`rgba(80,200,120,${0.08+0.05*Math.sin(t*1.5+mx)})`;
    ctx.beginPath(); ctx.ellipse(mx,my+8,22,6,0,0,7); ctx.fill();
    ctx.fillStyle=`rgba(100,220,140,${0.25+0.15*Math.sin(t*2+mx)})`;
    ctx.beginPath(); ctx.ellipse(mx,my+6,14,3,0,0,7); ctx.fill();
  }

  // glowing mushrooms on the ground (small cluster left & right)
  function glowShroom(sx,sy,h,col){
    // stem
    ctx.fillStyle='#c8c0b0'; ctx.fillRect(sx-2,sy-h,4,h);
    // cap
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(sx,sy-h,8,5,0,Math.PI,0); ctx.fill();
    // glow
    ctx.fillStyle=`rgba(${col==='#6a40c0'?'106,64,192':'60,180,160'},${0.12+0.08*Math.sin(t*2.5+sx)})`;
    ctx.beginPath(); ctx.arc(sx,sy-h-2,16,0,7); ctx.fill();
    // spots on cap
    ctx.fillStyle='rgba(255,255,255,.4)';
    ctx.beginPath(); ctx.arc(sx-3,sy-h-2,1.5,0,7); ctx.arc(sx+4,sy-h-1,1.2,0,7); ctx.fill();
  }
  glowShroom(W*0.12,groundY+20,16,'#6a40c0');
  glowShroom(W*0.18,groundY+24,12,'#3ab4a0');
  glowShroom(W*0.82,groundY+18,14,'#6a40c0');
  glowShroom(W*0.88,groundY+22,10,'#3ab4a0');

  // floating magical motes / fireflies (different from the mushroom glade — these are blue/purple)
  for (let i=0;i<20;i++){
    const mx=(i*47+t*8+Math.sin(t*0.3+i)*30)%W;
    const my=(i*67+Math.sin(t*0.5+i*2)*40)%(groundY+30)+20;
    const c=i%3===0?'160,140,255':i%3===1?'100,220,200':'200,160,255';
    ctx.fillStyle=`rgba(${c},${0.15+0.2*Math.abs(Math.sin(t*1.8+i*1.4))})`;
    ctx.beginPath(); ctx.arc(mx,my,2+Math.sin(t*2+i)*0.8,0,7); ctx.fill();
  }

  // a stone fairy-door in a tree trunk (center-left, charming detail)
  const dX=W*0.34, dY=groundY-6;
  ctx.fillStyle='#3a3a3a'; roundRect(dX-8,dY-22,16,22,3); ctx.fill();
  ctx.strokeStyle='#c9a040'; ctx.lineWidth=1; roundRect(dX-8,dY-22,16,22,3); ctx.stroke();
  ctx.fillStyle='#c9a040'; ctx.beginPath(); ctx.arc(dX+4,dY-11,1.5,0,7); ctx.fill(); // tiny doorknob
  // faint glow from behind the door
  ctx.fillStyle=`rgba(255,220,120,${0.08+0.06*Math.sin(t*1.5)})`;
  ctx.beginPath(); ctx.arc(dX,dY-11,18,0,7); ctx.fill();

  // old stone lantern (right side, mossy)
  const lX=W*0.72, lY=groundY+4;
  ctx.fillStyle='#5a5a5a'; ctx.fillRect(lX-5,lY-30,10,30);
  ctx.fillRect(lX-10,lY-34,20,5);
  ctx.fillRect(lX-8,lY-40,16,6);
  // moss on the lantern
  ctx.fillStyle='rgba(60,120,60,.5)';
  ctx.beginPath(); ctx.ellipse(lX,lY-34,11,3,0,0,7); ctx.fill();
  // lantern flame
  ctx.fillStyle=`rgba(180,220,160,${0.5+0.3*Math.sin(t*2)})`;
  ctx.beginPath(); ctx.arc(lX,lY-37,4,0,7); ctx.fill();
  ctx.fillStyle=`rgba(160,200,140,${0.1+0.06*Math.sin(t*2)})`;
  ctx.beginPath(); ctx.arc(lX,lY-37,14,0,7); ctx.fill();

  // pulsing crystals embedded in the ground
  function groundCrystal(cx,cy,h,col){
    const pulse=0.7+0.3*Math.sin(t*2+cx);
    // crystal body
    ctx.fillStyle=col;
    ctx.globalAlpha=pulse*0.8;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx-4,cy+h*0.4);
    ctx.lineTo(cx-2,cy-h); ctx.lineTo(cx+3,cy-h*0.7);
    ctx.lineTo(cx+5,cy+h*0.3); ctx.closePath(); ctx.fill();
    // crystal glow
    ctx.globalAlpha=pulse*0.15;
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.arc(cx,cy-h*0.4,h*1.2,0,7); ctx.fill();
    // inner highlight
    ctx.globalAlpha=pulse*0.5;
    ctx.fillStyle='rgba(255,255,255,.4)';
    ctx.beginPath(); ctx.moveTo(cx-1,cy-h*0.3); ctx.lineTo(cx,cy-h+2); ctx.lineTo(cx+1,cy-h*0.4); ctx.closePath(); ctx.fill();
    ctx.globalAlpha=1;
  }
  groundCrystal(W*0.25,groundY+12,18,'#a060e0');
  groundCrystal(W*0.58,groundY+16,14,'#60c0d0');
  groundCrystal(W*0.78,groundY+20,12,'#c080f0');

  // will-o'-wisps with trailing glow
  for (let i=0;i<3;i++){
    const wx=W*0.2+i*W*0.3+Math.sin(t*0.6+i*2.5)*40;
    const wy=groundY-30+Math.sin(t*0.8+i*1.7)*25;
    // trail
    for (let tr=0;tr<5;tr++){
      const trx=wx-Math.sin(t*0.6+i*2.5-tr*0.15)*40+Math.sin(t*0.6+i*2.5)*40-wx+wx;
      const trDelay=tr*0.12;
      const twx=wx-Math.cos(t*0.5+i+tr*0.3)*tr*4;
      const twy=wy+tr*3;
      ctx.fillStyle=`rgba(180,220,255,${0.08-tr*0.015})`;
      ctx.beginPath(); ctx.arc(twx,twy,3-tr*0.4,0,7); ctx.fill();
    }
    // core
    ctx.fillStyle=`rgba(180,220,255,${0.4+0.2*Math.sin(t*3+i)})`;
    ctx.beginPath(); ctx.arc(wx,wy,3,0,7); ctx.fill();
    // bright center
    ctx.fillStyle=`rgba(220,240,255,${0.6+0.3*Math.sin(t*3.5+i)})`;
    ctx.beginPath(); ctx.arc(wx,wy,1.5,0,7); ctx.fill();
    // outer glow
    ctx.fillStyle=`rgba(140,200,255,${0.06+0.04*Math.sin(t*2+i)})`;
    ctx.beginPath(); ctx.arc(wx,wy,14,0,7); ctx.fill();
  }

  // swirling mist near the ground
  for (let i=0;i<5;i++){
    const mx=(i*W/5+t*4+Math.sin(t*0.3+i)*20)%W;
    const my=groundY+2+Math.sin(t*0.5+i*0.8)*4;
    const mr=24+Math.sin(t*0.4+i)*6;
    ctx.fillStyle=`rgba(140,160,180,${0.04+0.02*Math.sin(t*0.7+i*1.3)})`;
    ctx.beginPath(); ctx.ellipse(mx,my,mr,8,0,0,7); ctx.fill();
  }

  // a winding path through the forest floor (faint, leading into the trees)
  ctx.strokeStyle='rgba(120,100,80,.2)'; ctx.lineWidth=16;
  ctx.beginPath(); ctx.moveTo(W*0.3,H); ctx.quadraticCurveTo(W*0.45,groundY+20,W*0.5,groundY+4);
  ctx.quadraticCurveTo(W*0.55,groundY-10,W*0.6,groundY-30); ctx.stroke();
  ctx.strokeStyle='rgba(100,80,60,.1)'; ctx.lineWidth=20;
  ctx.beginPath(); ctx.moveTo(W*0.3,H); ctx.quadraticCurveTo(W*0.45,groundY+20,W*0.5,groundY+4); ctx.stroke();

  // fallen leaves drifting gently
  const leafCols=['rgba(180,120,40,.3)','rgba(140,80,30,.25)','rgba(100,160,60,.2)'];
  for (let i=0;i<6;i++){
    const lx=(i*61+t*5)%W;
    const ly=groundY+8+i*4+Math.sin(t*0.6+i*2)*3;
    const lr=Math.sin(t*0.4+i)*0.3;
    ctx.save(); ctx.translate(lx,ly); ctx.rotate(lr);
    ctx.fillStyle=leafCols[i%3];
    ctx.beginPath(); ctx.ellipse(0,0,4,2,0,0,7); ctx.fill();
    ctx.restore();
  }

  // ambient magical shimmer across the whole scene
  ctx.fillStyle=`rgba(140,120,200,${0.015+0.01*Math.sin(t*1.5)})`;
  ctx.fillRect(0,0,W,H);
  // fireflies sprite among the glowing trees
  SpriteRenderer.submit({sprite:'fireflies',phase:'actors',x:W*0.44+Math.sin(t*0.5)*24,y:groundY-20+Math.sin(t*0.7)*16,anchorY:0.5,frame:Math.floor(t*5)%4});
  SpriteRenderer.submit({sprite:'forestGrass',x:W*0.50,y:groundY+10,frame:3});
}
registerScene('enchantedforest', drawEnchantedForest);

/* ── CRYSTAL GROTTO (underground · glowing geodes · underground lake · bioluminescent) ── */
function drawCrystalGrotto(){
  const t = sceneTime, floorY = H*0.68;

  // deep underground darkness
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0a0818'); bg.addColorStop(0.4,'#10102a'); bg.addColorStop(1,'#080614');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // ambient cave glow — cool purple-blue tones from crystal light
  const ag1=ctx.createRadialGradient(W*0.3,H*0.35,10,W*0.3,H*0.35,160);
  ag1.addColorStop(0,'rgba(100,60,200,.08)'); ag1.addColorStop(1,'rgba(100,60,200,0)');
  ctx.fillStyle=ag1; ctx.fillRect(0,0,W,H);
  const ag2=ctx.createRadialGradient(W*0.75,H*0.3,10,W*0.75,H*0.3,140);
  ag2.addColorStop(0,'rgba(60,180,200,.06)'); ag2.addColorStop(1,'rgba(60,180,200,0)');
  ctx.fillStyle=ag2; ctx.fillRect(0,0,W,H);

  // rough cave ceiling with stalactites
  ctx.fillStyle='#16103a';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W,0); ctx.lineTo(W,36);
  for (let x=W;x>=0;x-=22){
    const h=20+28*Math.abs(Math.sin(x*0.18+2.3));
    ctx.lineTo(x-11,36+h); ctx.lineTo(x-22,36+8*Math.abs(Math.cos(x*0.25)));
  }
  ctx.closePath(); ctx.fill();

  // dripping stalactites (detail)
  ctx.fillStyle='#1e1848';
  for (const sx of [W*0.18,W*0.42,W*0.58,W*0.78,W*0.92]){
    const sh=30+20*Math.abs(Math.sin(sx*0.4));
    ctx.beginPath(); ctx.moveTo(sx-5,30); ctx.lineTo(sx,30+sh); ctx.lineTo(sx+5,30); ctx.fill();
    // water drip animation
    const dripPhase=(t*0.8+sx*0.1)%4;
    if (dripPhase<1.5){
      ctx.fillStyle=`rgba(120,180,255,${0.4-dripPhase*0.25})`;
      ctx.beginPath(); ctx.arc(sx,30+sh+dripPhase*20,1.5,0,7); ctx.fill();
    }
    ctx.fillStyle='#1e1848';
  }

  // cave walls — rough layered texture on sides
  ctx.fillStyle='#12102e';
  ctx.beginPath(); ctx.moveTo(0,36); ctx.quadraticCurveTo(30,H*0.3,24,floorY);
  ctx.lineTo(0,floorY); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W,36); ctx.quadraticCurveTo(W-28,H*0.3,W-20,floorY);
  ctx.lineTo(W,floorY); ctx.closePath(); ctx.fill();

  // bioluminescent moss patches on walls
  for (const [mx,my] of [[W*0.04,H*0.30],[W*0.08,H*0.45],[W*0.92,H*0.35],[W*0.96,H*0.50]]){
    const pulse=0.3+0.2*Math.sin(t*1.2+mx+my);
    ctx.fillStyle=`rgba(80,220,120,${pulse*0.35})`;
    ctx.beginPath(); ctx.ellipse(mx,my,18,8,0.2,0,7); ctx.fill();
    ctx.fillStyle=`rgba(100,240,140,${pulse*0.6})`;
    ctx.beginPath(); ctx.ellipse(mx,my,10,4,0.2,0,7); ctx.fill();
  }

  // bioluminescent moss on the ground
  for (const mx of [W*0.15,W*0.35,W*0.55,W*0.80]){
    const my=floorY+4, pulse=0.25+0.18*Math.sin(t*1.5+mx);
    ctx.fillStyle=`rgba(60,200,100,${pulse*0.3})`;
    ctx.beginPath(); ctx.ellipse(mx,my,20,5,0,0,7); ctx.fill();
    ctx.fillStyle=`rgba(80,230,120,${pulse*0.55})`;
    ctx.beginPath(); ctx.ellipse(mx,my,12,3,0,0,7); ctx.fill();
  }

  // large crystal formations — pulsing glow
  function bigCrystal(cx,cy,sc,hue,angle){
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(angle||0); ctx.scale(sc,sc);
    const glow=0.5+0.4*Math.sin(t*1.2+cx*0.05+hue*0.02);
    // ambient glow halo
    ctx.fillStyle=`hsla(${hue},70%,55%,${0.12*glow})`;
    ctx.beginPath(); ctx.arc(0,-24,40,0,7); ctx.fill();
    // main crystal shards
    const shards=[[0,-48,11],[-14,-32,8],[14,-36,9],[-8,-22,6],[10,-20,7],[-18,-18,5]];
    for (const [dx,dy,w] of shards){
      ctx.fillStyle=`hsla(${hue},65%,${50+18*glow}%,0.85)`;
      ctx.beginPath(); ctx.moveTo(dx-w,0); ctx.lineTo(dx-1,dy); ctx.lineTo(dx+1,dy); ctx.lineTo(dx+w,0); ctx.closePath(); ctx.fill();
      // inner highlight facet
      ctx.fillStyle=`hsla(${hue},80%,80%,${0.35+0.2*glow})`;
      ctx.beginPath(); ctx.moveTo(dx-1,0); ctx.lineTo(dx,dy); ctx.lineTo(dx+w*0.4,dy*0.4); ctx.closePath(); ctx.fill();
    }
    // sparkle at tip
    ctx.fillStyle=`rgba(255,255,255,${0.3+0.4*glow})`;
    ctx.beginPath(); ctx.arc(0,-48,2,0,7); ctx.fill();
    ctx.restore();
  }
  bigCrystal(W*0.10,floorY+16,1.3,260,0.08);
  bigCrystal(W*0.28,floorY+6,0.9,200,-0.06);
  bigCrystal(W*0.88,floorY+18,1.4,280,0.05);
  bigCrystal(W*0.72,floorY+4,0.85,310,-0.1);
  // small ceiling crystals hanging down
  bigCrystal(W*0.38,52,0.45,230,Math.PI);
  bigCrystal(W*0.65,48,0.4,250,Math.PI+0.15);

  // underground lake — center-bottom
  const lakeY=floorY+10;
  ctx.fillStyle='#0a0e24'; ctx.beginPath(); ctx.ellipse(W*0.5,lakeY,140,18,0,0,7); ctx.fill();
  // ripple rings
  ctx.strokeStyle='rgba(100,160,240,.15)'; ctx.lineWidth=0.8;
  for (let i=0;i<4;i++){
    const rr=30+i*24+Math.sin(t*1.5+i*1.2)*6;
    ctx.beginPath(); ctx.ellipse(W*0.5,lakeY,rr,rr*0.13,0,0,7); ctx.stroke();
  }
  // crystal reflections on water surface
  for (const [rx,hue] of [[W*0.28,200],[W*0.72,310],[W*0.5,240]]){
    const pulse=0.15+0.1*Math.sin(t*1.8+rx);
    ctx.fillStyle=`hsla(${hue},60%,60%,${pulse})`;
    ctx.beginPath(); ctx.ellipse(rx,lakeY+2,12,3,0,0,7); ctx.fill();
  }

  // cave floor — dark stone
  const gf=ctx.createLinearGradient(0,floorY,0,H);
  gf.addColorStop(0,'#14102a'); gf.addColorStop(1,'#0c0a1a');
  ctx.fillStyle=gf; ctx.fillRect(0,floorY,W,H-floorY);

  // small loose gemstones scattered on the ground
  for (let i=0;i<8;i++){
    const gx=W*0.1+((i*47+23)%240), gy=floorY+14+(i%3)*6;
    const hue=(i*45+180)%360;
    ctx.fillStyle=`hsla(${hue},70%,60%,${0.6+0.2*Math.sin(t*2+i)})`;
    ctx.beginPath(); ctx.moveTo(gx,gy-3); ctx.lineTo(gx+3,gy); ctx.lineTo(gx,gy+2); ctx.lineTo(gx-3,gy); ctx.closePath(); ctx.fill();
  }

  // floating luminous motes — drifting slowly upward
  for (let i=0;i<18;i++){
    const mx=(i*53+Math.sin(t*0.3+i*2)*20)%W;
    const my=(i*41+200-t*6)%H;
    const c=i%3===0?'160,120,255':i%3===1?'80,200,180':'200,140,220';
    ctx.fillStyle=`rgba(${c},${0.12+0.2*Math.abs(Math.sin(t*1.6+i*1.3))})`;
    ctx.beginPath(); ctx.arc(mx,my,1.5+Math.sin(t*2+i)*0.5,0,7); ctx.fill();
  }
}
registerScene('crystalgrotto', drawCrystalGrotto);

/* ── POTION LAB (indoor · witch's workshop · bubbling cauldrons · floating bottles) ── */
function drawPotionLab(){
  const t = sceneTime, floorY = H*0.70;

  // stone dungeon walls
  const wall=ctx.createLinearGradient(0,0,0,floorY);
  wall.addColorStop(0,'#1a1418'); wall.addColorStop(0.5,'#221a1e'); wall.addColorStop(1,'#2a2024');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // stone block pattern on walls
  ctx.strokeStyle='rgba(60,50,55,.25)'; ctx.lineWidth=0.8;
  for (let y=0;y<floorY;y+=18){ for (let x=(y/18%2)*24;x<W;x+=48){
    ctx.strokeRect(x,y,48,18);
  }}

  // warm ambient glow from the cauldron fire
  const cauldronGlow=ctx.createRadialGradient(W*0.35,floorY-10,10,W*0.35,floorY-10,120);
  cauldronGlow.addColorStop(0,'rgba(200,100,40,.12)'); cauldronGlow.addColorStop(1,'rgba(200,100,40,0)');
  ctx.fillStyle=cauldronGlow; ctx.fillRect(0,0,W,H);

  // ingredient shelves on the back wall (upper area)
  ctx.fillStyle='#3a2820'; ctx.fillRect(W*0.55,H*0.10,W*0.38,6); // top shelf
  ctx.fillRect(W*0.55,H*0.28,W*0.38,6); // mid shelf
  ctx.fillRect(W*0.55,H*0.44,W*0.38,6); // lower shelf
  // shelf brackets
  ctx.fillStyle='#4a3830';
  for (const sy of [H*0.10,H*0.28,H*0.44]){
    ctx.fillRect(W*0.56,sy,3,10); ctx.fillRect(W*0.92,sy,3,10);
  }

  // potion bottles on the shelves
  function potionBottle(bx,by,col,shape){
    // bottle body
    ctx.fillStyle=col;
    if (shape===0){ // round flask
      ctx.beginPath(); ctx.arc(bx,by-6,6,0,7); ctx.fill();
      ctx.fillRect(bx-2,by-14,4,8);
    } else if (shape===1){ // tall thin
      ctx.fillRect(bx-3,by-18,6,18);
      roundRect(bx-4,by-4,8,4,1); ctx.fill();
    } else { // wide squat
      roundRect(bx-6,by-10,12,10,2); ctx.fill();
      ctx.fillRect(bx-2,by-14,4,4);
    }
    // cork
    ctx.fillStyle='#b89060'; ctx.fillRect(bx-2,by-16,4,3);
    // liquid glow
    ctx.fillStyle=col.replace('0.8','0.3').replace('0.9','0.3');
    ctx.beginPath(); ctx.arc(bx,by-6,8,0,7); ctx.fill();
    // highlight
    ctx.fillStyle='rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(bx-2,by-10,1.5,0,7); ctx.fill();
  }
  // top shelf bottles
  potionBottle(W*0.60,H*0.10,'rgba(80,200,120,0.8)',0);
  potionBottle(W*0.68,H*0.10,'rgba(200,80,200,0.8)',1);
  potionBottle(W*0.76,H*0.10,'rgba(80,160,220,0.8)',2);
  potionBottle(W*0.84,H*0.10,'rgba(220,180,60,0.9)',0);
  // mid shelf bottles
  potionBottle(W*0.58,H*0.28,'rgba(220,60,80,0.8)',1);
  potionBottle(W*0.66,H*0.28,'rgba(100,220,200,0.8)',2);
  potionBottle(W*0.74,H*0.28,'rgba(180,100,220,0.8)',0);
  potionBottle(W*0.82,H*0.28,'rgba(60,200,100,0.9)',1);
  potionBottle(W*0.90,H*0.28,'rgba(220,160,80,0.8)',2);
  // lower shelf — jars of ingredients
  for (let i=0;i<4;i++){
    const jx=W*0.58+i*28, jy=H*0.44;
    ctx.fillStyle=['rgba(80,120,60,0.6)','rgba(160,100,60,0.5)','rgba(100,60,120,0.5)','rgba(60,100,80,0.6)'][i];
    roundRect(jx-7,jy-14,14,14,3); ctx.fill();
    ctx.strokeStyle='rgba(180,160,140,.4)'; ctx.lineWidth=0.6; roundRect(jx-7,jy-14,14,14,3); ctx.stroke();
    ctx.fillStyle='#c0a080'; ctx.fillRect(jx-8,jy-16,16,3); // lid
  }

  // floating potion bottles (animated — bobbing in mid-air)
  for (let i=0;i<3;i++){
    const fbx=W*0.15+i*60, fby=H*0.18+Math.sin(t*1.5+i*2.1)*12;
    const rot=Math.sin(t*0.8+i)*0.2;
    ctx.save(); ctx.translate(fbx,fby); ctx.rotate(rot);
    // bottle glow trail
    ctx.fillStyle=`rgba(${i===0?'180,100,255':i===1?'100,220,180':'220,160,80'},${0.08+0.06*Math.sin(t*2+i)})`;
    ctx.beginPath(); ctx.arc(0,4,18,0,7); ctx.fill();
    // bottle
    const bcol=i===0?'rgba(160,80,240,0.85)':i===1?'rgba(80,200,160,0.85)':'rgba(200,140,60,0.85)';
    ctx.fillStyle=bcol;
    ctx.beginPath(); ctx.arc(0,0,5,0,7); ctx.fill();
    ctx.fillRect(-1.5,-8,3,8);
    ctx.fillStyle='#b89060'; ctx.fillRect(-2,-10,4,3);
    // sparkle
    ctx.fillStyle=`rgba(255,255,255,${0.4+0.4*Math.sin(t*3+i)})`;
    ctx.beginPath(); ctx.arc(1,-2,1,0,7); ctx.fill();
    ctx.restore();
  }

  // large cauldron — center-left
  const cX=W*0.32, cY=floorY-4;
  // fire under cauldron
  for (let i=0;i<5;i++){
    const fx=cX-16+i*8, fh=8+Math.sin(t*4+i*1.4)*4;
    ctx.fillStyle=`rgba(255,${140+i*20},40,${0.6+0.3*Math.sin(t*5+i)})`;
    ctx.beginPath(); ctx.moveTo(fx-3,cY+14); ctx.quadraticCurveTo(fx,cY+14-fh,fx+3,cY+14); ctx.fill();
  }
  // embers
  for (let i=0;i<4;i++){
    const ex=cX-10+i*7, ey=cY+6-Math.abs(Math.sin(t*3+i))*16;
    ctx.fillStyle=`rgba(255,160,40,${0.3+0.3*Math.sin(t*4+i)})`;
    ctx.beginPath(); ctx.arc(ex,ey,1,0,7); ctx.fill();
  }
  // cauldron body — iron pot
  ctx.fillStyle='#2a2a2a';
  ctx.beginPath(); ctx.ellipse(cX,cY+10,30,10,0,0,Math.PI); ctx.fill();
  ctx.fillRect(cX-30,cY-8,60,18);
  ctx.beginPath(); ctx.ellipse(cX,cY-8,30,10,0,0,7); ctx.fill();
  // rim highlight
  ctx.strokeStyle='#4a4a4a'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(cX,cY-8,30,10,0,0,7); ctx.stroke();
  // bubbling potion inside
  const potionCol=`hsla(${(t*20)%360},70%,55%,`;
  ctx.fillStyle=potionCol+'0.7)';
  ctx.beginPath(); ctx.ellipse(cX,cY-7,27,8,0,0,7); ctx.fill();
  // bubbles rising from cauldron
  for (let i=0;i<6;i++){
    const bx=cX-18+((i*13+t*20)%36), by=cY-10-((t*30+i*17)%40);
    const br=2+Math.sin(t*2+i)*1.2;
    ctx.fillStyle=potionCol+(0.3+0.2*Math.sin(t*3+i))+')';
    ctx.beginPath(); ctx.arc(bx,by,br,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.2)'; ctx.beginPath(); ctx.arc(bx-br*0.3,by-br*0.3,br*0.3,0,7); ctx.fill();
  }
  // steam / fumes rising
  ctx.strokeStyle='rgba(160,120,200,.15)'; ctx.lineWidth=3;
  for (let s=0;s<3;s++){
    ctx.beginPath();
    for (let k=0;k<=8;k++){
      const yy=cY-16-k*10, xx=cX-8+s*8+Math.sin(t*1.2+k*0.7+s)*10;
      k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);
    }
    ctx.stroke();
  }

  // large spell book — open on a stand, left side
  const bkX=W*0.08, bkY=floorY-14;
  // book stand
  ctx.fillStyle='#3a2818'; ctx.fillRect(bkX-2,bkY+6,4,22);
  ctx.fillRect(bkX-12,bkY+26,24,4);
  // open book pages
  ctx.fillStyle='#e8e0d0'; ctx.fillRect(bkX-18,bkY-16,18,28); ctx.fillRect(bkX,bkY-16,18,28);
  // spine
  ctx.fillStyle='#6a3020'; ctx.fillRect(bkX-1,bkY-17,2,30);
  // text lines on pages
  ctx.fillStyle='rgba(60,40,30,.3)';
  for (let ln=0;ln<5;ln++){ ctx.fillRect(bkX-16,bkY-12+ln*5,14,1); ctx.fillRect(bkX+2,bkY-12+ln*5,14,1); }
  // glowing rune on the right page
  ctx.fillStyle=`rgba(180,100,255,${0.4+0.3*Math.sin(t*2)})`;
  ctx.font='10px serif'; ctx.fillText('✦',bkX+4,bkY+6);

  // second smaller cauldron — right side, simmering
  const c2X=W*0.78, c2Y=floorY+2;
  ctx.fillStyle='#2e2e2e';
  ctx.beginPath(); ctx.ellipse(c2X,c2Y+6,20,7,0,0,Math.PI); ctx.fill();
  ctx.fillRect(c2X-20,c2Y-4,40,10);
  ctx.beginPath(); ctx.ellipse(c2X,c2Y-4,20,7,0,0,7); ctx.fill();
  ctx.strokeStyle='#484848'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(c2X,c2Y-4,20,7,0,0,7); ctx.stroke();
  // green simmering liquid
  ctx.fillStyle='rgba(80,200,100,0.6)'; ctx.beginPath(); ctx.ellipse(c2X,c2Y-3,17,5,0,0,7); ctx.fill();
  // tiny bubbles
  for (let i=0;i<3;i++){
    const bx2=c2X-10+((i*9+t*15)%20), by2=c2Y-6-((t*20+i*11)%18);
    ctx.fillStyle=`rgba(100,220,120,${0.3+0.2*Math.sin(t*3+i)})`;
    ctx.beginPath(); ctx.arc(bx2,by2,1.5,0,7); ctx.fill();
  }

  // hanging dried herbs from the ceiling
  for (let i=0;i<5;i++){
    const hx=W*0.05+i*56, hy=10;
    ctx.strokeStyle='#6a5040'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(hx,0); ctx.lineTo(hx,hy); ctx.stroke();
    // herb bundle
    ctx.fillStyle=['#4a7a3a','#7a6a30','#5a4a6a','#3a6a5a','#6a5a3a'][i];
    ctx.beginPath(); ctx.ellipse(hx,hy+8,5,10,0,0,7); ctx.fill();
  }

  // candles on the wall — flickering
  for (const [cx,cy] of [[W*0.46,H*0.22],[W*0.46,H*0.44]]){
    // wall bracket
    ctx.fillStyle='#5a4a3a'; ctx.fillRect(cx-1,cy,6,3); ctx.fillRect(cx+4,cy-8,2,8);
    // candle
    ctx.fillStyle='#e8d8c0'; ctx.fillRect(cx,cy-16,4,8);
    // flame
    const fh=Math.sin(t*5+cx)*2;
    ctx.fillStyle=`rgba(255,200,80,${0.8+0.2*Math.sin(t*6+cx)})`;
    ctx.beginPath(); ctx.moveTo(cx+2,cy-16); ctx.quadraticCurveTo(cx,cy-22+fh,cx+2,cy-26+fh);
    ctx.quadraticCurveTo(cx+4,cy-22+fh,cx+2,cy-16); ctx.fill();
    // glow
    ctx.fillStyle='rgba(255,180,60,.08)'; ctx.beginPath(); ctx.arc(cx+2,cy-20,16,0,7); ctx.fill();
  }

  // floor — worn stone tiles
  const fl=ctx.createLinearGradient(0,floorY,0,H);
  fl.addColorStop(0,'#2a2228'); fl.addColorStop(1,'#1e1820');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  // tile lines
  ctx.strokeStyle='rgba(80,70,75,.2)'; ctx.lineWidth=0.6;
  for (let x=0;x<W;x+=30) ctx.strokeRect(x,floorY,30,H-floorY);

  // spilled potion stain on the floor
  ctx.fillStyle='rgba(120,60,180,.12)';
  ctx.beginPath(); ctx.ellipse(W*0.55,floorY+16,18,6,0.3,0,7); ctx.fill();

  // ambient magical sparkles drifting around the lab
  for (let i=0;i<12;i++){
    const sx=(i*59+t*8)%W, sy=(i*37+Math.sin(t*0.5+i)*18)%(floorY*0.85)+8;
    const c=i%3===0?'200,140,255':i%3===1?'120,220,160':'220,200,80';
    ctx.fillStyle=`rgba(${c},${0.1+0.15*Math.sin(t*2.2+i)})`;
    ctx.beginPath(); ctx.arc(sx,sy,1.2,0,7); ctx.fill();
  }
}
registerScene('potionlab', drawPotionLab);

/* ── SPIRIT SHRINE (outdoor · dusk · Shinto-inspired spirit house) ── */
function drawSpiritShrine(){
  const t = sceneTime, groundY = H*0.68;

  // twilight sky — deep violet to warm peach at the horizon
  const sky=ctx.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,'#1a0e2e'); sky.addColorStop(0.35,'#2e1a48');
  sky.addColorStop(0.7,'#6a3466'); sky.addColorStop(1,'#d4826a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);

  // stars in upper sky
  for (let i=0;i<40;i++){
    const sx=(i*67+13)%W, sy=(i*31+7)%(groundY*0.45);
    ctx.fillStyle=`rgba(255,250,230,${0.2+0.3*Math.abs(Math.sin(t*1.3+i))})`;
    ctx.fillRect(sx,sy,1.2,1.2);
  }

  // distant mountains — layered silhouettes
  ctx.fillStyle='#1e1230';
  ctx.beginPath(); ctx.moveTo(0,groundY);
  for (let x=0;x<=W;x+=12) ctx.lineTo(x, groundY-40-20*Math.sin(x*0.015+0.5));
  ctx.lineTo(W,groundY); ctx.fill();
  ctx.fillStyle='#2a1a3e';
  ctx.beginPath(); ctx.moveTo(0,groundY);
  for (let x=0;x<=W;x+=10) ctx.lineTo(x, groundY-22-12*Math.sin(x*0.02+2));
  ctx.lineTo(W,groundY); ctx.fill();

  // sacred tree behind the shrine (right side)
  const treeX=W*0.78, treeBase=groundY;
  ctx.fillStyle='#3a2a1e'; ctx.fillRect(treeX-6,treeBase-90,12,90);
  // branches
  ctx.strokeStyle='#3a2a1e'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(treeX,treeBase-70); ctx.quadraticCurveTo(treeX+30,treeBase-85,treeX+45,treeBase-95); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(treeX,treeBase-80); ctx.quadraticCurveTo(treeX-25,treeBase-95,treeX-40,treeBase-100); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(treeX,treeBase-55); ctx.quadraticCurveTo(treeX+20,treeBase-60,treeX+35,treeBase-70); ctx.stroke();
  // canopy — dark green with mystical shimmer
  for (const [ox,oy,r] of [[-30,-95,28],[0,-100,32],[30,-90,26],[10,-80,24],[-15,-75,22]]){
    ctx.fillStyle=`rgba(30,60,40,${0.85+0.1*Math.sin(t*0.8+ox)})`;
    ctx.beginPath(); ctx.arc(treeX+ox,treeBase+oy,r,0,7); ctx.fill();
  }
  // shimenawa rope on tree trunk
  ctx.strokeStyle='#c9a24a'; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.moveTo(treeX-10,treeBase-42); ctx.quadraticCurveTo(treeX,treeBase-38,treeX+10,treeBase-42); ctx.stroke();
  // shide (zigzag paper streamers)
  for (const sx of [treeX-6,treeX+6]){
    ctx.fillStyle='#f0ece0';
    ctx.beginPath(); ctx.moveTo(sx,treeBase-40); ctx.lineTo(sx-3,treeBase-34); ctx.lineTo(sx+3,treeBase-28);
    ctx.lineTo(sx-3,treeBase-22); ctx.lineTo(sx+1,treeBase-22); ctx.lineTo(sx+3,treeBase-28+2);
    ctx.lineTo(sx-1,treeBase-34+2); ctx.lineTo(sx+2,treeBase-40); ctx.closePath(); ctx.fill();
  }

  // stone torii gate (left-center)
  const torX=W*0.32, torY=groundY;
  // pillars
  ctx.fillStyle='#8a3030'; ctx.fillRect(torX-42,torY-82,8,82); ctx.fillRect(torX+34,torY-82,8,82);
  // top crossbar (kasagi) — slightly curved
  ctx.fillStyle='#a03838';
  ctx.beginPath(); ctx.moveTo(torX-52,torY-80); ctx.quadraticCurveTo(torX,torY-88,torX+52,torY-80);
  ctx.lineTo(torX+52,torY-74); ctx.quadraticCurveTo(torX,torY-82,torX-52,torY-74); ctx.closePath(); ctx.fill();
  // secondary bar (nuki)
  ctx.fillStyle='#922e2e'; ctx.fillRect(torX-44,torY-66,88,5);
  // small tablet in center (gakuzuka)
  ctx.fillStyle='#f0ece0'; ctx.fillRect(torX-10,torY-72,20,12);
  ctx.fillStyle='#8a3030'; ctx.font='7px serif'; ctx.textAlign='center';
  ctx.fillText('神', torX, torY-63);

  // spirit house / hokora (small wooden shrine)
  const shX=W*0.50, shY=groundY-6;
  // stone base
  ctx.fillStyle='#6a6a6a'; ctx.fillRect(shX-28,shY,56,8);
  ctx.fillStyle='#808080'; ctx.fillRect(shX-24,shY-4,48,6);
  // wooden body
  ctx.fillStyle='#5a3a22'; ctx.fillRect(shX-20,shY-34,40,32);
  // dark interior
  ctx.fillStyle='#1a0e0a'; ctx.fillRect(shX-14,shY-26,28,24);
  // little offering inside (glowing)
  ctx.fillStyle=`rgba(255,200,100,${0.7+0.2*Math.sin(t*2)})`;
  ctx.beginPath(); ctx.arc(shX,shY-14,4,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,200,100,.12)'; ctx.beginPath(); ctx.arc(shX,shY-14,12,0,7); ctx.fill();
  // miniature roof
  ctx.fillStyle='#3a2a1a';
  ctx.beginPath(); ctx.moveTo(shX-26,shY-34); ctx.lineTo(shX,shY-50); ctx.lineTo(shX+26,shY-34); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#2a1a10';
  ctx.beginPath(); ctx.moveTo(shX-28,shY-32); ctx.lineTo(shX,shY-48); ctx.lineTo(shX+28,shY-32); ctx.closePath(); ctx.fill();

  // glowing ofuda (paper talismans) hanging on either side
  for (const [ox,c] of [[-18,'rgba(255,240,200,A)'],[18,'rgba(200,220,255,A)']]) {
    const swing=Math.sin(t*1.5+ox)*2;
    const fx=shX+ox+swing, fy=shY-50;
    ctx.fillStyle=c.replace('A',String(0.8+0.15*Math.sin(t*2.5+ox)));
    ctx.fillRect(fx-3,fy,6,16);
    // glow
    ctx.fillStyle=c.replace('A','0.08');
    ctx.beginPath(); ctx.arc(fx,fy+8,12,0,7); ctx.fill();
    // calligraphy marks
    ctx.strokeStyle='rgba(100,60,30,.6)'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.moveTo(fx,fy+3); ctx.lineTo(fx,fy+12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx-1.5,fy+6); ctx.lineTo(fx+1.5,fy+6); ctx.stroke();
  }

  // floating spirit orbs — gentle, bobbing lights
  for (let i=0;i<7;i++){
    const phase=i*0.9+t*0.4;
    const ox=(i*47+20)%((W-40))+20;
    const oy=groundY*0.3 + Math.sin(phase)*20 + (i*23)%(groundY*0.4);
    const hue=[210,180,50,300,120,40,260][i];
    const a=0.3+0.25*Math.sin(t*1.8+i*1.1);
    // outer glow
    ctx.fillStyle=`hsla(${hue},70%,75%,${a*0.3})`;
    ctx.beginPath(); ctx.arc(ox,oy,14,0,7); ctx.fill();
    // core
    ctx.fillStyle=`hsla(${hue},80%,85%,${a})`;
    ctx.beginPath(); ctx.arc(ox,oy,4+Math.sin(t*2+i)*1.2,0,7); ctx.fill();
    // bright center
    ctx.fillStyle=`hsla(${hue},60%,95%,${a*0.7})`;
    ctx.beginPath(); ctx.arc(ox,oy,1.6,0,7); ctx.fill();
  }

  // ground — mossy stone path
  const gr=ctx.createLinearGradient(0,groundY,0,H);
  gr.addColorStop(0,'#2a3a2a'); gr.addColorStop(0.4,'#1e2e1e'); gr.addColorStop(1,'#162016');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  // stone path down the center
  ctx.fillStyle='rgba(120,115,100,.3)';
  for (let y=groundY+2;y<H;y+=12){
    const w=14+Math.sin(y*0.3)*4;
    ctx.beginPath(); ctx.ellipse(W*0.42,y+5,w,5,0.1,0,7); ctx.fill();
  }
  // moss patches
  ctx.fillStyle='rgba(60,100,50,.15)';
  for (let i=0;i<8;i++){
    const mx=(i*41+10)%W, my=groundY+6+(i*17)%(H-groundY-12);
    ctx.beginPath(); ctx.ellipse(mx,my,12+i%3*4,4,0,0,7); ctx.fill();
  }

  // stone lantern at front left
  const lnX=W*0.12, lnY=groundY;
  ctx.fillStyle='#7a7a72'; ctx.fillRect(lnX-5,lnY-30,10,30);
  ctx.fillStyle='#8a8a80'; ctx.fillRect(lnX-8,lnY-34,16,6);
  ctx.beginPath(); ctx.moveTo(lnX-10,lnY-34); ctx.lineTo(lnX,lnY-44); ctx.lineTo(lnX+10,lnY-34); ctx.closePath(); ctx.fill();
  // lantern glow
  ctx.fillStyle=`rgba(255,200,100,${0.5+0.2*Math.sin(t*2.2)})`;
  ctx.beginPath(); ctx.arc(lnX,lnY-38,3,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,200,100,.1)'; ctx.beginPath(); ctx.arc(lnX,lnY-38,14,0,7); ctx.fill();

  // subtle fireflies near ground
  for (let i=0;i<6;i++){
    const fx=(i*53+t*12)%W, fy=groundY-4+Math.sin(t*1.2+i*2)*8+(i*7)%18;
    ctx.fillStyle=`rgba(200,230,120,${0.15+0.2*Math.sin(t*3+i*1.5)})`;
    ctx.beginPath(); ctx.arc(fx,fy,1.6,0,7); ctx.fill();
  }
}
registerScene('spiritshrine', drawSpiritShrine);

/* ── SHADOW THEATER (indoor · dark · magical shadow puppet stage) ── */
function drawShadowTheater(){
  const t = sceneTime, stageY = H*0.62;

  // dark room background — deep indigo
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0e0a18'); bg.addColorStop(0.5,'#14101e'); bg.addColorStop(1,'#100c16');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // the shadow screen — a warm, glowing panel (backlit fabric)
  const scrL=W*0.12, scrR=W*0.88, scrT=H*0.06, scrB=stageY-6;
  // wooden frame
  ctx.fillStyle='#3a2818'; ctx.fillRect(scrL-6,scrT-6,scrR-scrL+12,scrB-scrT+12);
  ctx.fillStyle='#2a1c10'; ctx.fillRect(scrL-8,scrT-8,scrR-scrL+16,6);
  ctx.fillRect(scrL-8,scrB+2,scrR-scrL+16,6);
  ctx.fillRect(scrL-8,scrT-8,6,scrB-scrT+16);
  ctx.fillRect(scrR+2,scrT-8,6,scrB-scrT+16);
  // carved corner decorations
  for (const [cx,cy] of [[scrL-2,scrT-2],[scrR+2,scrT-2],[scrL-2,scrB+2],[scrR+2,scrB+2]]){
    ctx.fillStyle='#c9a24a'; ctx.beginPath(); ctx.arc(cx,cy,3.5,0,7); ctx.fill();
  }
  // screen glow (warm parchment)
  const scrGlow=ctx.createRadialGradient(W*0.5,H*0.30,20,W*0.5,H*0.30,W*0.45);
  scrGlow.addColorStop(0,'#f5e4c4'); scrGlow.addColorStop(0.6,'#e8d0a8');
  scrGlow.addColorStop(1,'#d4b888');
  ctx.fillStyle=scrGlow; ctx.fillRect(scrL,scrT,scrR-scrL,scrB-scrT);

  // shadow puppet figures on the screen — they sway and move
  ctx.save();
  ctx.globalAlpha=0.7;

  // shadow figure 1: a dancer (left side)
  const d1x=W*0.30+Math.sin(t*0.7)*8, d1y=scrB-10;
  ctx.fillStyle='#3a2a18';
  // body
  ctx.beginPath(); ctx.ellipse(d1x,d1y-40,8,12,Math.sin(t*1.2)*0.15,0,7); ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(d1x+Math.sin(t*1.2)*2,d1y-56,7,0,7); ctx.fill();
  // arms — graceful arcs
  ctx.strokeStyle='#3a2a18'; ctx.lineWidth=3; ctx.lineCap='round';
  const armA=Math.sin(t*1.5)*0.5;
  ctx.beginPath(); ctx.moveTo(d1x-4,d1y-44);
  ctx.quadraticCurveTo(d1x-20,d1y-55+Math.sin(t*1.8)*8, d1x-28,d1y-50+Math.sin(t*1.3)*10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(d1x+4,d1y-44);
  ctx.quadraticCurveTo(d1x+18,d1y-60+Math.cos(t*1.6)*6, d1x+26,d1y-52+Math.cos(t*1.1)*8); ctx.stroke();
  // skirt / lower body
  ctx.beginPath(); ctx.moveTo(d1x-6,d1y-30); ctx.lineTo(d1x-14+Math.sin(t*1.4)*3,d1y);
  ctx.lineTo(d1x+14+Math.sin(t*1.4+1)*3,d1y); ctx.lineTo(d1x+6,d1y-30); ctx.closePath(); ctx.fill();

  // shadow figure 2: a bird/dragon (right side, flying)
  const d2x=W*0.68+Math.sin(t*0.6+1)*12, d2y=scrT+50+Math.sin(t*0.9)*15;
  ctx.fillStyle='#3a2a18';
  // body
  ctx.beginPath(); ctx.ellipse(d2x,d2y,14,6,Math.sin(t*0.8)*0.1,0,7); ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(d2x+16,d2y-4,5,0,7); ctx.fill();
  // beak
  ctx.beginPath(); ctx.moveTo(d2x+20,d2y-5); ctx.lineTo(d2x+26,d2y-3); ctx.lineTo(d2x+20,d2y-2); ctx.closePath(); ctx.fill();
  // wings flapping
  const wingA=Math.sin(t*3)*0.4;
  ctx.beginPath(); ctx.moveTo(d2x-4,d2y-4);
  ctx.quadraticCurveTo(d2x-14,d2y-20-Math.sin(t*3)*12, d2x-24,d2y-14-Math.sin(t*3)*10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(d2x-4,d2y+2);
  ctx.quadraticCurveTo(d2x-14,d2y+16+Math.sin(t*3+0.5)*10, d2x-22,d2y+12+Math.sin(t*3+0.5)*8); ctx.stroke();
  // tail
  ctx.beginPath(); ctx.moveTo(d2x-12,d2y);
  ctx.quadraticCurveTo(d2x-22,d2y+Math.sin(t*1.2)*4, d2x-30,d2y+6+Math.sin(t*0.8)*3); ctx.stroke();

  // shadow figure 3: a small tree/plant (center-right, still with gentle sway)
  const d3x=W*0.54, d3y=scrB-8;
  ctx.fillStyle='#3a2a18';
  ctx.fillRect(d3x-2,d3y-18,4,18);
  // branches swaying
  for (const [bx,by,a0] of [[-8,-22,0.3],[6,-26,-0.2],[-4,-30,0.1],[10,-20,-0.15]]){
    const sw=Math.sin(t*1.0+a0*10)*0.12;
    ctx.save(); ctx.translate(d3x,d3y); ctx.rotate(sw);
    ctx.beginPath(); ctx.moveTo(0,-18);
    ctx.quadraticCurveTo(bx*0.5,by*0.7,bx,by); ctx.stroke();
    ctx.beginPath(); ctx.arc(bx,by,4+Math.abs(bx)*0.2,0,7); ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // enchanted lantern (center, above the stage)
  const lanX=W*0.50, lanY=stageY+14;
  // chain/cord from ceiling
  ctx.strokeStyle='#4a3a2a'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(lanX,0); ctx.lineTo(lanX,stageY-6); ctx.stroke();
  // lantern body — ornate
  ctx.fillStyle=`rgba(255,200,100,${0.2+0.08*Math.sin(t*1.5)})`;
  ctx.beginPath(); ctx.arc(lanX,lanY,28,0,7); ctx.fill();
  ctx.fillStyle=`rgba(255,190,80,${0.75+0.15*Math.sin(t*2)})`;
  roundRect(lanX-10,lanY-14,20,28,8); ctx.fill();
  // flame inside
  const fh=Math.sin(t*5)*2;
  ctx.fillStyle=`rgba(255,220,120,${0.9+0.1*Math.sin(t*6)})`;
  ctx.beginPath();
  ctx.moveTo(lanX,lanY+4); ctx.quadraticCurveTo(lanX-4,lanY-6+fh,lanX,lanY-12+fh);
  ctx.quadraticCurveTo(lanX+4,lanY-6+fh,lanX,lanY+4); ctx.fill();
  // lantern cap & base
  ctx.fillStyle='#5a4030'; ctx.fillRect(lanX-12,lanY-16,24,4); ctx.fillRect(lanX-12,lanY+12,24,4);
  // decorative filigree rings
  ctx.strokeStyle='#c9a24a'; ctx.lineWidth=0.8;
  ctx.beginPath(); ctx.arc(lanX,lanY,11,0,7); ctx.stroke();

  // stage floor — dark wooden boards
  const fl=ctx.createLinearGradient(0,stageY,0,H);
  fl.addColorStop(0,'#1e1610'); fl.addColorStop(1,'#140e0a');
  ctx.fillStyle=fl; ctx.fillRect(0,stageY,W,H-stageY);
  // plank seams
  ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=0.6;
  for (let x=0;x<W;x+=28){ ctx.beginPath(); ctx.moveTo(x,stageY); ctx.lineTo(x,H); ctx.stroke(); }
  ctx.strokeStyle='rgba(255,220,160,.04)';
  for (let y=stageY+8;y<H;y+=14){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // warm light spill from the screen onto the floor
  const spill=ctx.createRadialGradient(W*0.5,stageY,10,W*0.5,stageY,W*0.4);
  spill.addColorStop(0,'rgba(255,220,160,.18)'); spill.addColorStop(1,'rgba(255,220,160,0)');
  ctx.fillStyle=spill; ctx.fillRect(0,stageY,W,H-stageY);

  // audience cushions at the very front (small colored shapes)
  const cushions=[[W*0.18,'#8a3040'],[W*0.34,'#3a5080'],[W*0.66,'#6a4a80'],[W*0.82,'#3a7060']];
  for (const [cx,col] of cushions){
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.ellipse(cx,H-10,12,5,0,0,7); ctx.fill();
    // tassel
    ctx.fillStyle='#c9a24a';
    ctx.beginPath(); ctx.arc(cx,H-14,2,0,7); ctx.fill();
  }

  // dancing shadow cast on the side walls — subtle flickers
  for (let i=0;i<4;i++){
    const wx=(i<2)?W*0.04:W*0.94+i%2*6;
    const wy=H*0.2+i*32+Math.sin(t*1.5+i)*10;
    ctx.fillStyle=`rgba(60,40,20,${0.06+0.04*Math.sin(t*2+i)})`;
    ctx.beginPath(); ctx.ellipse(wx,wy,8,18+Math.sin(t*1.2+i)*4,0.2*i,0,7); ctx.fill();
  }

  // tiny magical sparkles drifting around the lantern
  for (let i=0;i<8;i++){
    const angle=t*0.5+i*Math.PI/4;
    const dist=18+8*Math.sin(t*1.5+i);
    const sx=lanX+Math.cos(angle)*dist, sy=lanY+Math.sin(angle)*dist*0.6;
    ctx.fillStyle=`rgba(255,220,140,${0.15+0.15*Math.sin(t*3+i*0.8)})`;
    ctx.beginPath(); ctx.arc(sx,sy,1,0,7); ctx.fill();
  }
}
registerScene('shadowtheater', drawShadowTheater);

/* ── DREAMWEAVER'S LOOM (indoor · mystical weaving room · threads of light) ── */
function drawDreamweaverLoom(){
  const t = sceneTime, floorY = H*0.72;

  // deep indigo walls with subtle shimmer
  const wall=ctx.createLinearGradient(0,0,0,floorY);
  wall.addColorStop(0,'#12082a'); wall.addColorStop(0.5,'#1e1040'); wall.addColorStop(1,'#2a1650');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // faint constellation patterns etched into the walls
  ctx.strokeStyle='rgba(160,140,220,.12)'; ctx.lineWidth=0.8;
  const consts=[[0.08,0.14,0.14,0.22,0.20,0.16,0.26,0.24],[0.72,0.10,0.78,0.18,0.84,0.12,0.80,0.26],[0.90,0.34,0.94,0.42,0.88,0.50]];
  for (const c of consts){ ctx.beginPath(); for (let i=0;i<c.length;i+=2){ i===0?ctx.moveTo(c[i]*W,c[i+1]*floorY):ctx.lineTo(c[i]*W,c[i+1]*floorY); } ctx.stroke();
    for (let i=0;i<c.length;i+=2){ ctx.fillStyle=`rgba(200,180,255,${0.3+0.2*Math.sin(t*1.2+i)})`; ctx.beginPath(); ctx.arc(c[i]*W,c[i+1]*floorY,1.6,0,7); ctx.fill(); } }

  // soft ambient glow from the loom center
  const glow=ctx.createRadialGradient(W*0.50,H*0.40,10,W*0.50,H*0.40,160);
  glow.addColorStop(0,'rgba(180,140,255,.12)'); glow.addColorStop(0.5,'rgba(120,80,200,.05)'); glow.addColorStop(1,'rgba(120,80,200,0)');
  ctx.fillStyle=glow; ctx.fillRect(0,0,W,floorY);

  // the great loom — wooden frame
  const lx=W*0.26, rx=W*0.74, ly=H*0.16, by=H*0.62;
  ctx.strokeStyle='#4a3228'; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx,by); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rx,ly); ctx.lineTo(rx,by); ctx.stroke();
  // top and bottom crossbars
  ctx.lineWidth=4; ctx.strokeStyle='#5a3e2e';
  ctx.beginPath(); ctx.moveTo(lx-6,ly); ctx.lineTo(rx+6,ly); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lx-4,by); ctx.lineTo(rx+4,by); ctx.stroke();
  // decorative carved ends on posts
  ctx.fillStyle='#6a4a34'; ctx.beginPath(); ctx.arc(lx,ly-4,6,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(rx,ly-4,6,0,7); ctx.fill();

  // warp threads — glowing vertical lines of light
  for (let i=0;i<16;i++){
    const tx=lx+12+i*((rx-lx-24)/15);
    const hue=(i*23+t*15)%360;
    ctx.strokeStyle=`hsla(${hue},70%,70%,${0.3+0.15*Math.sin(t*2+i*0.5)})`;
    ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(tx,ly+6); ctx.lineTo(tx,by-4); ctx.stroke();
    // tiny sparkle traveling along each thread
    const sparkY=ly+10+((t*30+i*37)%(by-ly-20));
    ctx.fillStyle=`hsla(${hue},80%,85%,${0.6+0.4*Math.sin(t*4+i)})`;
    ctx.beginPath(); ctx.arc(tx,sparkY,1.8,0,7); ctx.fill();
  }

  // woven tapestry forming in the center — constellation pattern in fabric
  const tapW=(rx-lx)*0.6, tapH=(by-ly)*0.5;
  const tapX=W*0.5-tapW/2, tapY=H*0.28;
  ctx.fillStyle='rgba(30,15,60,.6)'; ctx.fillRect(tapX,tapY,tapW,tapH);
  // woven horizontal bands with subtle color
  for (let y=0;y<tapH;y+=3){
    const prog=y/tapH;
    ctx.fillStyle=`hsla(${260+prog*60},50%,${40+20*Math.sin(t+y*0.1)}%,${prog<0.9?0.25:0.05})`;
    ctx.fillRect(tapX,tapY+y,tapW,2);
  }
  // constellation pattern appearing in the tapestry
  const stars=[[0.2,0.2],[0.4,0.15],[0.6,0.3],[0.35,0.5],[0.7,0.55],[0.5,0.7],[0.8,0.4],[0.15,0.65],[0.55,0.45]];
  ctx.strokeStyle=`rgba(220,200,255,${0.2+0.15*Math.sin(t*0.8)})`; ctx.lineWidth=0.8;
  ctx.beginPath(); for (let i=0;i<stars.length;i++){ const sx=tapX+stars[i][0]*tapW, sy=tapY+stars[i][1]*tapH; i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy); } ctx.stroke();
  for (const s of stars){
    const sx=tapX+s[0]*tapW, sy=tapY+s[1]*tapH;
    ctx.fillStyle=`rgba(230,210,255,${0.5+0.3*Math.sin(t*1.5+s[0]*10+s[1]*7)})`;
    ctx.beginPath(); ctx.arc(sx,sy,2,0,7); ctx.fill();
  }

  // floating thread spools on shelves along the walls
  function spool(sx,sy,hue){
    // spool body
    ctx.fillStyle=`hsl(${hue},50%,35%)`; ctx.fillRect(sx-6,sy-8,12,16);
    // thread wound around it
    ctx.fillStyle=`hsla(${hue},65%,65%,${0.7+0.2*Math.sin(t*1.8+sx)})`;
    ctx.fillRect(sx-5,sy-6,10,12);
    // top and bottom caps
    ctx.fillStyle='#5a4030'; ctx.fillRect(sx-7,sy-9,14,3); ctx.fillRect(sx-7,sy+6,14,3);
    // glow
    ctx.fillStyle=`hsla(${hue},60%,70%,.15)`;
    ctx.beginPath(); ctx.arc(sx,sy,14,0,7); ctx.fill();
  }
  // left shelf
  ctx.fillStyle='#3a2820'; ctx.fillRect(W*0.04,H*0.30,W*0.14,4);
  spool(W*0.07,H*0.24,280); spool(W*0.14,H*0.24,220);
  // right shelf
  ctx.fillStyle='#3a2820'; ctx.fillRect(W*0.82,H*0.30,W*0.14,4);
  spool(W*0.86,H*0.24,320); spool(W*0.93,H*0.24,180);

  // floating spools drifting gently in the air (magical)
  for (let i=0;i<3;i++){
    const fx=W*0.3+i*W*0.2+Math.sin(t*0.6+i*2)*12;
    const fy=H*0.08+Math.sin(t*0.8+i*1.5)*8+i*6;
    ctx.save(); ctx.translate(fx,fy); ctx.rotate(Math.sin(t*0.5+i)*0.2);
    const hue=(i*90+160)%360;
    ctx.fillStyle=`hsla(${hue},55%,60%,0.7)`; ctx.fillRect(-4,-6,8,12);
    ctx.fillStyle='#4a3428'; ctx.fillRect(-5,-7,10,2); ctx.fillRect(-5,5,10,2);
    // trailing thread wisps
    ctx.strokeStyle=`hsla(${hue},65%,70%,${0.4+0.2*Math.sin(t*2+i)})`;
    ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(0,6);
    for (let k=1;k<=8;k++){ ctx.lineTo(Math.sin(t*2+k*0.5+i)*6, 6+k*5); } ctx.stroke();
    ctx.restore();
  }

  // drifting light motes
  for (let i=0;i<20;i++){
    const mx=(i*67+t*12)%(W*0.9)+W*0.05, my=(i*43+Math.sin(t*0.7+i)*18)%(floorY*0.85);
    const hue=(i*30+t*10)%360;
    ctx.fillStyle=`hsla(${hue},60%,75%,${0.12+0.1*Math.sin(t*1.5+i)})`;
    ctx.beginPath(); ctx.arc(mx,my,1.2,0,7); ctx.fill();
  }

  // stone floor with a warm rug
  const fl=ctx.createLinearGradient(0,floorY,0,H);
  fl.addColorStop(0,'#2a2038'); fl.addColorStop(1,'#1a1228');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  // flagstone seams
  ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=1;
  for (let y=floorY+12;y<H;y+=14){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  for (let y=floorY+12;y<H;y+=14){ for (let x=((y/14|0)%2)*18;x<W;x+=36){ ctx.beginPath(); ctx.moveTo(x,y-14); ctx.lineTo(x,y); ctx.stroke(); } }
  // woven rug on the floor (center)
  ctx.fillStyle='rgba(80,40,100,.35)'; roundRect(W*0.28,floorY+4,W*0.44,H-floorY-8,3); ctx.fill();
  ctx.strokeStyle='rgba(180,140,220,.2)'; ctx.lineWidth=1;
  roundRect(W*0.30,floorY+6,W*0.40,H-floorY-12,2); ctx.stroke();
  // rug pattern — simple repeating diamonds
  for (let x=W*0.34;x<W*0.66;x+=16){ for (let y=floorY+10;y<H-8;y+=12){
    ctx.fillStyle=`rgba(160,120,200,${0.12+0.06*Math.sin(x+y)})`;
    ctx.beginPath(); ctx.moveTo(x,y-4); ctx.lineTo(x+5,y); ctx.lineTo(x,y+4); ctx.lineTo(x-5,y); ctx.closePath(); ctx.fill();
  }}

  // soft warm light from a candle on the floor near the loom
  const cX=W*0.18, cY=floorY+8;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(cX-3,cY-10,6,10);
  ctx.fillStyle=`rgba(255,200,100,${0.8+0.15*Math.sin(t*3)})`;
  ctx.beginPath(); ctx.ellipse(cX,cY-12,3,5,0,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,190,90,.15)'; ctx.beginPath(); ctx.arc(cX,cY-6,28,0,7); ctx.fill();
}
registerScene('dreamweaverloom', drawDreamweaverLoom);

/* ── ASTRAL GARDEN (outdoor · garden floating in space · nebula sky) ── */
function drawAstralGarden(){
  const t = sceneTime, groundY = H*0.60;

  // deep space / nebula sky
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#0a0418'); sky.addColorStop(0.3,'#160830'); sky.addColorStop(0.6,'#1a0c38'); sky.addColorStop(1,'#0e0620');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

  // nebula clouds — soft color washes
  const neb1=ctx.createRadialGradient(W*0.25,H*0.20,10,W*0.25,H*0.20,120);
  neb1.addColorStop(0,'rgba(140,60,180,.12)'); neb1.addColorStop(0.5,'rgba(100,40,160,.06)'); neb1.addColorStop(1,'rgba(100,40,160,0)');
  ctx.fillStyle=neb1; ctx.fillRect(0,0,W,H);
  const neb2=ctx.createRadialGradient(W*0.78,H*0.14,10,W*0.78,H*0.14,100);
  neb2.addColorStop(0,'rgba(60,120,200,.10)'); neb2.addColorStop(0.5,'rgba(40,80,180,.05)'); neb2.addColorStop(1,'rgba(40,80,180,0)');
  ctx.fillStyle=neb2; ctx.fillRect(0,0,W,H);
  const neb3=ctx.createRadialGradient(W*0.55,H*0.42,10,W*0.55,H*0.42,90);
  neb3.addColorStop(0,'rgba(200,80,120,.08)'); neb3.addColorStop(0.5,'rgba(180,60,100,.03)'); neb3.addColorStop(1,'rgba(180,60,100,0)');
  ctx.fillStyle=neb3; ctx.fillRect(0,0,W,H);

  // stars — many small points
  for (let i=0;i<80;i++){
    const sx=(i*73+17)%W, sy=(i*41+7)%H;
    const bright=0.2+0.5*Math.abs(Math.sin(t*1.3+i*0.9));
    ctx.fillStyle=`rgba(255,250,240,${bright})`; ctx.fillRect(sx,sy,1+((i%3===0)?0.5:0),1+((i%5===0)?0.5:0));
  }
  // a few brighter stars with tiny cross flares
  for (let i=0;i<6;i++){
    const sx=(i*127+31)%W, sy=(i*89+13)%(H*0.5);
    const b=0.5+0.4*Math.sin(t*2+i*1.7);
    ctx.fillStyle=`rgba(255,250,230,${b})`; ctx.beginPath(); ctx.arc(sx,sy,1.6,0,7); ctx.fill();
    ctx.strokeStyle=`rgba(255,250,230,${b*0.4})`; ctx.lineWidth=0.6;
    ctx.beginPath(); ctx.moveTo(sx-5,sy); ctx.lineTo(sx+5,sy); ctx.moveTo(sx,sy-5); ctx.lineTo(sx,sy+5); ctx.stroke();
  }

  // distant floating islands / asteroids silhouettes
  ctx.fillStyle='rgba(30,15,50,.5)';
  ctx.beginPath(); ctx.ellipse(W*0.12,H*0.30,18,8,0.3,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W*0.90,H*0.22,14,6,-0.2,0,7); ctx.fill();

  // floating stepping stones forming a path across the void
  function steppingStone(sx,sy,w,h,phase){
    const bob=Math.sin(t*0.8+phase)*3;
    ctx.fillStyle='rgba(60,40,80,.7)';
    ctx.beginPath(); ctx.ellipse(sx,sy+bob,w,h,0,0,7); ctx.fill();
    // mossy surface
    ctx.fillStyle='rgba(80,140,100,.4)';
    ctx.beginPath(); ctx.ellipse(sx,sy+bob-1,w*0.8,h*0.6,0,0,7); ctx.fill();
    // soft glow underneath
    ctx.fillStyle='rgba(140,100,200,.08)';
    ctx.beginPath(); ctx.ellipse(sx,sy+bob+h+6,w*1.2,h*0.8,0,0,7); ctx.fill();
    return sy+bob; // return current y for planting things on it
  }
  steppingStone(W*0.10,H*0.56,22,7,0);
  steppingStone(W*0.28,H*0.52,18,5,1.2);
  steppingStone(W*0.72,H*0.54,20,6,2.4);
  steppingStone(W*0.90,H*0.50,16,5,3.6);

  // the main garden island — a large floating platform
  const islandCx=W*0.50, islandCy=groundY;
  // underside rocky mass
  ctx.fillStyle='rgba(40,25,60,.6)';
  ctx.beginPath(); ctx.moveTo(W*0.14,islandCy+4); ctx.quadraticCurveTo(W*0.30,islandCy+50,W*0.50,islandCy+60);
  ctx.quadraticCurveTo(W*0.70,islandCy+50,W*0.86,islandCy+4); ctx.closePath(); ctx.fill();
  // dangling roots / vines from the underside
  ctx.strokeStyle='rgba(60,100,80,.3)'; ctx.lineWidth=1.5;
  for (let i=0;i<5;i++){
    const vx=W*0.28+i*W*0.11;
    ctx.beginPath(); ctx.moveTo(vx,islandCy+10+i*4);
    ctx.quadraticCurveTo(vx+Math.sin(t*0.5+i)*8, islandCy+30+i*3, vx+Math.sin(t*0.7+i)*5, islandCy+45+i*5);
    ctx.stroke();
  }
  // glowing particles falling from the underside
  for (let i=0;i<8;i++){
    const px=W*0.25+i*W*0.065;
    const py=islandCy+20+((t*18+i*23)%50);
    ctx.fillStyle=`rgba(180,140,255,${0.15+0.1*Math.sin(t*2+i)})`;
    ctx.beginPath(); ctx.arc(px,py,1,0,7); ctx.fill();
  }
  // island surface
  ctx.fillStyle='rgba(35,50,45,.85)';
  ctx.beginPath(); ctx.ellipse(islandCx,islandCy,W*0.38,12,0,0,7); ctx.fill();
  // soft garden soil / grass on top
  const grass=ctx.createLinearGradient(0,islandCy-10,0,islandCy+6);
  grass.addColorStop(0,'#2a5a40'); grass.addColorStop(1,'#1e4030');
  ctx.fillStyle=grass;
  ctx.beginPath(); ctx.ellipse(islandCx,islandCy-2,W*0.36,8,0,0,7); ctx.fill();

  // crystalline flowers growing on the island
  function crystalFlower(fx,fy,hue,scale){
    ctx.save(); ctx.translate(fx,fy); ctx.scale(scale,scale);
    // stem
    ctx.strokeStyle='rgba(100,180,140,.6)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(2,-14,-1,-26); ctx.stroke();
    // crystal petals
    const glow=0.6+0.3*Math.sin(t*2+fx*0.1);
    for (let p=0;p<5;p++){
      const a=p/5*Math.PI*2-Math.PI/2+Math.sin(t*0.5+fx)*0.1;
      ctx.fillStyle=`hsla(${hue},60%,70%,${glow*0.5})`;
      ctx.beginPath();
      ctx.moveTo(-1,-26);
      ctx.lineTo(Math.cos(a)*10,-26+Math.sin(a)*10);
      ctx.lineTo(Math.cos(a)*6,-26+Math.sin(a)*6-4);
      ctx.closePath(); ctx.fill();
    }
    // bright center
    ctx.fillStyle=`hsla(${hue},70%,85%,${glow})`;
    ctx.beginPath(); ctx.arc(-1,-26,3,0,7); ctx.fill();
    // small leaves at the base
    ctx.fillStyle='rgba(80,160,120,.5)';
    ctx.beginPath(); ctx.ellipse(-5,-4,5,2,-0.4,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5,-4,5,2,0.4,0,7); ctx.fill();
    ctx.restore();
  }
  crystalFlower(W*0.22,islandCy-6,280,1.0);
  crystalFlower(W*0.34,islandCy-8,200,0.85);
  crystalFlower(W*0.60,islandCy-7,320,0.9);
  crystalFlower(W*0.74,islandCy-6,240,1.0);
  // smaller background flowers
  crystalFlower(W*0.28,islandCy-4,260,0.6);
  crystalFlower(W*0.52,islandCy-5,180,0.65);
  crystalFlower(W*0.68,islandCy-4,300,0.55);

  // a small crystalline tree on the right side
  const treeX=W*0.82, treeY=islandCy-6;
  ctx.strokeStyle='rgba(100,70,140,.6)'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(treeX,treeY); ctx.lineTo(treeX-2,treeY-34); ctx.stroke();
  ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(treeX-2,treeY-20); ctx.quadraticCurveTo(treeX-14,treeY-28,treeX-18,treeY-36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(treeX-2,treeY-28); ctx.quadraticCurveTo(treeX+10,treeY-36,treeX+14,treeY-42); ctx.stroke();
  // crystal leaves
  const leafHues=[260,300,220];
  for (let i=0;i<3;i++){
    const lhue=leafHues[i];
    const lx=treeX-18+i*16+Math.sin(t*0.6+i)*2, ly=treeY-36-i*4+Math.cos(t*0.7+i)*1.5;
    ctx.fillStyle=`hsla(${lhue},55%,65%,${0.4+0.2*Math.sin(t*1.5+i)})`;
    ctx.beginPath(); ctx.ellipse(lx,ly,8,5,0.3*i,0,7); ctx.fill();
  }

  // cosmic butterflies drifting around
  for (let i=0;i<4;i++){
    const bx=W*0.15+i*W*0.22+Math.sin(t*0.5+i*2.1)*30;
    const by=H*0.25+Math.sin(t*0.7+i*1.6)*25+i*10;
    const wingFlap=Math.sin(t*6+i*2)*0.35;
    const hue=(i*70+200+t*8)%360;
    ctx.save(); ctx.translate(bx,by);
    // wings
    ctx.fillStyle=`hsla(${hue},60%,65%,${0.45+0.15*Math.sin(t*2+i)})`;
    ctx.beginPath(); ctx.ellipse(-4,0,5+wingFlap*2,3,wingFlap-0.3,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4,0,5+wingFlap*2,3,-wingFlap+0.3,0,7); ctx.fill();
    // body
    ctx.fillStyle=`hsla(${hue},50%,80%,.7)`;
    ctx.fillRect(-0.8,-2,1.6,4);
    // sparkle trail
    for (let k=1;k<=3;k++){
      ctx.fillStyle=`hsla(${hue},50%,75%,${0.2/k})`;
      ctx.beginPath(); ctx.arc(-Math.sin(t*0.5+i*2.1)*k*4, k*3, 0.8, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  // a small arch / gateway on the left side of the island
  const archX=W*0.18, archY=islandCy-6;
  ctx.strokeStyle='rgba(140,120,180,.5)'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(archX-12,archY); ctx.lineTo(archX-10,archY-28);
  ctx.quadraticCurveTo(archX,archY-38,archX+10,archY-28); ctx.lineTo(archX+12,archY); ctx.stroke();
  // runes on the arch
  for (let i=0;i<3;i++){
    const rx=archX-6+i*6, ry=archY-14-i*6;
    ctx.fillStyle=`rgba(200,180,255,${0.3+0.2*Math.sin(t*1.8+i)})`;
    ctx.beginPath(); ctx.arc(rx,ry,1.5,0,7); ctx.fill();
  }

  // shooting star occasionally
  const shootPhase=(t*0.3)%6;
  if (shootPhase<0.5){
    const sp=shootPhase/0.5;
    const sx0=W*0.7, sy0=H*0.06, sx1=W*0.4, sy1=H*0.22;
    const sx=sx0+(sx1-sx0)*sp, sy=sy0+(sy1-sy0)*sp;
    ctx.strokeStyle=`rgba(255,250,220,${0.7*(1-sp)})`; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+(sx0-sx1)*0.15,sy+(sy0-sy1)*0.15); ctx.stroke();
    ctx.fillStyle=`rgba(255,250,220,${0.8*(1-sp)})`; ctx.beginPath(); ctx.arc(sx,sy,2,0,7); ctx.fill();
  }

  // foreground: more stepping stones and small flowers at the bottom
  steppingStone(W*0.20,H*0.82,24,7,4.8);
  steppingStone(W*0.50,H*0.86,20,6,0.7);
  steppingStone(W*0.80,H*0.80,22,7,2.1);
  // tiny crystal flowers on foreground stones
  crystalFlower(W*0.20,H*0.78,290,0.5);
  crystalFlower(W*0.80,H*0.76,210,0.45);
}
registerScene('astralgarden', drawAstralGarden);

/* ── STAR POOL (outdoor · night · sacred reflecting pool) ── */
function drawStarPool(){
  const t = sceneTime, waterY = H*0.52;

  // deep night sky
  const sky=ctx.createLinearGradient(0,0,0,waterY);
  sky.addColorStop(0,'#06061a'); sky.addColorStop(0.4,'#0e0e30'); sky.addColorStop(0.8,'#161640'); sky.addColorStop(1,'#1a1a48');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);

  // milky way band — a soft diagonal wash
  ctx.save(); ctx.translate(W*0.3,0); ctx.rotate(0.35);
  const mw=ctx.createLinearGradient(-30,0,30,0);
  mw.addColorStop(0,'rgba(140,130,200,0)'); mw.addColorStop(0.4,'rgba(160,150,220,.06)');
  mw.addColorStop(0.5,'rgba(180,170,240,.09)'); mw.addColorStop(0.6,'rgba(160,150,220,.06)');
  mw.addColorStop(1,'rgba(140,130,200,0)');
  ctx.fillStyle=mw; ctx.fillRect(-60,-20,120,H);
  ctx.restore();

  // stars in sky
  for (let i=0;i<70;i++){
    const sx=(i*67+19)%W, sy=(i*43+11)%(waterY*0.85);
    const br=0.2+0.45*Math.abs(Math.sin(t*1.2+i*0.8));
    ctx.fillStyle=`rgba(255,250,230,${br})`; ctx.fillRect(sx,sy,1+((i%4===0)?0.4:0),1+((i%6===0)?0.4:0));
  }

  // constellations — connect-the-dot patterns
  ctx.strokeStyle='rgba(200,200,255,.12)'; ctx.lineWidth=0.8;
  const consts=[
    [[W*0.15,H*0.08],[W*0.22,H*0.12],[W*0.26,H*0.06],[W*0.32,H*0.10]],
    [[W*0.60,H*0.05],[W*0.65,H*0.14],[W*0.72,H*0.10],[W*0.68,H*0.03]],
    [[W*0.42,H*0.18],[W*0.48,H*0.22],[W*0.52,H*0.16],[W*0.56,H*0.24]],
  ];
  for (const c of consts){
    ctx.beginPath();
    for (let j=0;j<c.length;j++){ j===0?ctx.moveTo(c[j][0],c[j][1]):ctx.lineTo(c[j][0],c[j][1]); }
    ctx.stroke();
    for (const [cx,cy] of c){
      const b=0.5+0.4*Math.sin(t*1.5+cx*0.02+cy*0.03);
      ctx.fillStyle=`rgba(255,250,230,${b})`; ctx.beginPath(); ctx.arc(cx,cy,1.8,0,7); ctx.fill();
      ctx.strokeStyle=`rgba(255,250,230,${b*0.3})`; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(cx-4,cy); ctx.lineTo(cx+4,cy); ctx.moveTo(cx,cy-4); ctx.lineTo(cx,cy+4); ctx.stroke();
      ctx.strokeStyle='rgba(200,200,255,.12)'; ctx.lineWidth=0.8;
    }
  }

  // crescent moon
  const moonX=W*0.82, moonY=H*0.10;
  ctx.fillStyle='rgba(255,250,220,.9)'; ctx.beginPath(); ctx.arc(moonX,moonY,12,0,7); ctx.fill();
  ctx.fillStyle='#0e0e30'; ctx.beginPath(); ctx.arc(moonX+5,moonY-3,10,0,7); ctx.fill();
  // moon glow
  const mg=ctx.createRadialGradient(moonX,moonY,8,moonX,moonY,50);
  mg.addColorStop(0,'rgba(200,200,255,.08)'); mg.addColorStop(1,'rgba(200,200,255,0)');
  ctx.fillStyle=mg; ctx.fillRect(moonX-50,moonY-50,100,100);

  // ancient columns flanking the pool
  function column(cx, h, broken){
    const baseY=waterY-4;
    // shadow
    ctx.fillStyle='rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(cx,baseY+2,12,3,0,0,7); ctx.fill();
    // shaft
    const colG=ctx.createLinearGradient(cx-8,0,cx+8,0);
    colG.addColorStop(0,'#4a4a6a'); colG.addColorStop(0.5,'#6a6a8a'); colG.addColorStop(1,'#4a4a6a');
    ctx.fillStyle=colG; ctx.fillRect(cx-7,baseY-h,14,h);
    // fluting lines
    ctx.strokeStyle='rgba(0,0,0,.1)'; ctx.lineWidth=0.6;
    for (let i=-1;i<=1;i+=2){ ctx.beginPath(); ctx.moveTo(cx+i*3,baseY-h); ctx.lineTo(cx+i*3,baseY); ctx.stroke(); }
    // capital
    if (!broken){
      ctx.fillStyle='#6a6a8a'; ctx.fillRect(cx-10,baseY-h-5,20,5);
      ctx.fillRect(cx-12,baseY-h-8,24,3);
    }
    // base
    ctx.fillStyle='#5a5a7a'; ctx.fillRect(cx-10,baseY-3,20,3);
    // moss accents
    ctx.fillStyle='rgba(80,120,80,.3)';
    ctx.beginPath(); ctx.ellipse(cx+5,baseY-2,4,2,0,0,7); ctx.fill();
  }
  column(W*0.06,70,false);
  column(W*0.18,55,true);  // broken column
  column(W*0.82,60,true);
  column(W*0.94,72,false);

  // the sacred pool — still water reflecting sky
  const poolG=ctx.createLinearGradient(0,waterY,0,H);
  poolG.addColorStop(0,'#10103a'); poolG.addColorStop(0.3,'#0c0c30'); poolG.addColorStop(1,'#080828');
  ctx.fillStyle=poolG; ctx.fillRect(0,waterY,W,H-waterY);

  // stone edge of pool
  ctx.strokeStyle='#3a3a5a'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,waterY); ctx.lineTo(W,waterY); ctx.stroke();
  ctx.fillStyle='#2a2a4a';
  for (let x=0;x<W;x+=18){ ctx.fillRect(x,waterY-2,16,4); }

  // reflected constellations in water (vertically flipped, slightly distorted)
  ctx.save(); ctx.globalAlpha=0.15;
  for (const c of consts){
    ctx.strokeStyle='rgba(200,200,255,.20)'; ctx.lineWidth=0.6;
    ctx.beginPath();
    for (let j=0;j<c.length;j++){
      const rx=c[j][0]+Math.sin(t*0.8+c[j][0]*0.02)*3;
      const ry=waterY+(waterY-c[j][1])*0.6+Math.sin(t*1.2+j)*1.5;
      j===0?ctx.moveTo(rx,ry):ctx.lineTo(rx,ry);
    }
    ctx.stroke();
    for (const [cx,cy] of c){
      const rx=cx+Math.sin(t*0.8+cx*0.02)*3;
      const ry=waterY+(waterY-cy)*0.6+Math.sin(t*1.2)*1.5;
      ctx.fillStyle='rgba(255,250,230,.4)'; ctx.beginPath(); ctx.arc(rx,ry,1.2,0,7); ctx.fill();
    }
  }
  ctx.restore();

  // reflected moon
  const rmY=waterY+(waterY-moonY)*0.5;
  ctx.fillStyle='rgba(255,250,220,.12)';
  ctx.beginPath(); ctx.ellipse(moonX+Math.sin(t*0.6)*2,rmY,10,5+Math.sin(t*1.5)*1,0,0,7); ctx.fill();

  // gentle water ripples
  ctx.strokeStyle='rgba(180,180,220,.06)'; ctx.lineWidth=0.8;
  for (let i=0;i<4;i++){
    const ry=waterY+12+i*18+Math.sin(t*0.5+i)*3;
    ctx.beginPath();
    for (let x=0;x<=W;x+=6){ const y=ry+Math.sin(x*0.03+t*0.8+i)*2; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
    ctx.stroke();
  }

  // floating candles on the water
  for (let i=0;i<7;i++){
    const cx=W*0.10+i*W*0.13+Math.sin(t*0.4+i*1.7)*8;
    const cy=waterY+8+i*6+Math.sin(t*0.6+i*2.3)*3;
    // candle body (small rectangle floating)
    ctx.fillStyle='#e8dcc8'; roundRect(cx-3,cy-4,6,6,1); ctx.fill();
    // flame
    const flicker=Math.sin(t*5+i*3)*1.5;
    ctx.fillStyle=`rgba(255,200,80,${0.8+0.15*Math.sin(t*4+i)})`;
    ctx.beginPath(); ctx.moveTo(cx,cy-4); ctx.quadraticCurveTo(cx-2+flicker,cy-12,cx,cy-16);
    ctx.quadraticCurveTo(cx+2+flicker,cy-12,cx,cy-4); ctx.fill();
    // warm glow on water
    const fg=ctx.createRadialGradient(cx,cy,2,cx,cy,22);
    fg.addColorStop(0,'rgba(255,190,100,.12)'); fg.addColorStop(1,'rgba(255,190,100,0)');
    ctx.fillStyle=fg; ctx.fillRect(cx-22,cy-22,44,44);
    // tiny reflection streak below candle
    ctx.fillStyle='rgba(255,200,100,.06)';
    ctx.fillRect(cx-1,cy+6,2,8+Math.sin(t*0.9+i)*3);
  }

  // fireflies drifting above the pool
  for (let i=0;i<12;i++){
    const fx=W*0.05+i*W*0.08+Math.sin(t*0.3+i*2.5)*20;
    const fy=waterY-30-i*8+Math.sin(t*0.5+i*1.9)*15;
    const fb=0.15+0.35*Math.abs(Math.sin(t*2+i*1.3));
    ctx.fillStyle=`rgba(200,255,150,${fb})`;
    ctx.beginPath(); ctx.arc(fx,fy,1.5,0,7); ctx.fill();
    // tiny glow
    ctx.fillStyle=`rgba(200,255,150,${fb*0.2})`;
    ctx.beginPath(); ctx.arc(fx,fy,5,0,7); ctx.fill();
  }

  // foreground: low stone steps and scattered petals
  ctx.fillStyle='#2a2a4a';
  ctx.fillRect(0,H*0.88,W,H*0.12);
  ctx.fillStyle='#323258';
  for (let x=0;x<W;x+=20){ ctx.fillRect(x+1,H*0.88,18,3); }

  // a few fallen petals on the stone
  for (let i=0;i<5;i++){
    const px=(i*73+20)%W, py=H*0.90+(i*17)%10;
    ctx.fillStyle=`rgba(200,180,220,${0.2+0.1*Math.sin(t+i)})`;
    ctx.beginPath(); ctx.ellipse(px,py,3,1.5,i*0.8,0,7); ctx.fill();
  }
}
registerScene('starpool', drawStarPool);

/* ── ENCHANTED CLOCK (indoor · giant clocktower interior) ── */
function drawEnchantedClock(){
  const t = sceneTime, floorY = H*0.78;

  // dark stone interior walls
  const wall=ctx.createLinearGradient(0,0,0,floorY);
  wall.addColorStop(0,'#1a1520'); wall.addColorStop(0.5,'#221c28'); wall.addColorStop(1,'#2a2430');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // stone block texture
  ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=0.6;
  for (let y=0;y<floorY;y+=18){
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    const off=(y/18|0)%2*14;
    for (let x=off;x<W;x+=28){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+18); ctx.stroke(); }
  }

  // tall arched window in the back (center) — dim blue light
  const winCx=W*0.50, winTop=H*0.06, winBot=H*0.44, winW=36;
  ctx.fillStyle='rgba(30,40,80,.6)';
  ctx.beginPath(); ctx.moveTo(winCx-winW,winBot); ctx.lineTo(winCx-winW,winTop+winW);
  ctx.quadraticCurveTo(winCx-winW,winTop,winCx,winTop);
  ctx.quadraticCurveTo(winCx+winW,winTop,winCx+winW,winTop+winW);
  ctx.lineTo(winCx+winW,winBot); ctx.closePath(); ctx.fill();
  // moonlight through window
  const wg=ctx.createRadialGradient(winCx,winTop+30,5,winCx,winTop+30,80);
  wg.addColorStop(0,'rgba(150,160,220,.12)'); wg.addColorStop(1,'rgba(150,160,220,0)');
  ctx.fillStyle=wg; ctx.fillRect(winCx-80,0,160,winBot+20);
  // window panes
  ctx.strokeStyle='#1a1520'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(winCx,winTop); ctx.lineTo(winCx,winBot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(winCx-winW,winTop+40); ctx.lineTo(winCx+winW,winTop+40); ctx.stroke();

  // giant clock face on the upper wall
  const clkCx=W*0.50, clkCy=H*0.28, clkR=38;
  // clock backing
  const clockG=ctx.createRadialGradient(clkCx,clkCy,0,clkCx,clkCy,clkR);
  clockG.addColorStop(0,'#3a3040'); clockG.addColorStop(0.7,'#2a2430'); clockG.addColorStop(1,'#201a28');
  ctx.fillStyle=clockG; ctx.beginPath(); ctx.arc(clkCx,clkCy,clkR,0,7); ctx.fill();
  // rim
  ctx.strokeStyle='#8a7a60'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.arc(clkCx,clkCy,clkR,0,7); ctx.stroke();
  ctx.strokeStyle='#6a5a40'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(clkCx,clkCy,clkR-3,0,7); ctx.stroke();

  // glowing numerals (Roman-style dots around the rim)
  for (let i=0;i<12;i++){
    const a=i/12*Math.PI*2-Math.PI/2;
    const nx=clkCx+Math.cos(a)*(clkR-10), ny=clkCy+Math.sin(a)*(clkR-10);
    const glow=0.5+0.3*Math.sin(t*1.5+i*0.5);
    ctx.fillStyle=`rgba(220,200,150,${glow})`;
    ctx.beginPath(); ctx.arc(nx,ny,i%3===0?3:1.8,0,7); ctx.fill();
    // glow halo on the hour marks
    if (i%3===0){
      ctx.fillStyle=`rgba(220,200,150,${glow*0.15})`;
      ctx.beginPath(); ctx.arc(nx,ny,8,0,7); ctx.fill();
    }
  }

  // clock hands — slowly turning
  // hour hand
  const hourA=t*0.02-Math.PI/2;
  ctx.strokeStyle='#c0a870'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(clkCx,clkCy);
  ctx.lineTo(clkCx+Math.cos(hourA)*(clkR*0.5),clkCy+Math.sin(hourA)*(clkR*0.5)); ctx.stroke();
  // minute hand
  const minA=t*0.15-Math.PI/2;
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(clkCx,clkCy);
  ctx.lineTo(clkCx+Math.cos(minA)*(clkR*0.7),clkCy+Math.sin(minA)*(clkR*0.7)); ctx.stroke();
  // center cap
  ctx.fillStyle='#c0a870'; ctx.beginPath(); ctx.arc(clkCx,clkCy,3.5,0,7); ctx.fill();
  ctx.lineCap='butt';

  // enormous turning gears
  function gear(gx,gy,r,teeth,phase,color){
    const angle=t*0.3*phase;
    ctx.save(); ctx.translate(gx,gy); ctx.rotate(angle);
    // teeth
    ctx.fillStyle=color;
    for (let i=0;i<teeth;i++){
      const a=i/teeth*Math.PI*2;
      ctx.save(); ctx.rotate(a);
      ctx.fillRect(-3,r-4,6,8); ctx.restore();
    }
    // body ring
    ctx.strokeStyle=color; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(0,0,r,0,7); ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(0,0,r-5,0,7); ctx.stroke();
    // spokes
    ctx.strokeStyle=color; ctx.lineWidth=1.5;
    for (let i=0;i<4;i++){
      const a=i/4*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*(r-5),Math.sin(a)*(r-5)); ctx.stroke();
    }
    // axle
    ctx.fillStyle=color; ctx.beginPath(); ctx.arc(0,0,4,0,7); ctx.fill();
    ctx.restore();
  }
  gear(W*0.14, H*0.38, 32, 10, 1.0, 'rgba(150,130,90,.5)');
  gear(W*0.86, H*0.40, 28, 8, -1.3, 'rgba(140,120,85,.45)');
  gear(W*0.22, H*0.58, 22, 7, 0.8, 'rgba(130,110,80,.4)');
  gear(W*0.78, H*0.60, 20, 6, -0.9, 'rgba(130,110,80,.4)');
  // small interlocking gears near the big ones
  gear(W*0.26, H*0.38, 14, 6, -1.6, 'rgba(160,140,100,.35)');
  gear(W*0.74, H*0.40, 12, 5, 1.7, 'rgba(160,140,100,.35)');

  // swinging pendulum
  const pendAngle=Math.sin(t*1.2)*0.35;
  const pendPivotX=clkCx, pendPivotY=clkCy+clkR+4;
  const pendLen=H*0.34;
  const pendBobX=pendPivotX+Math.sin(pendAngle)*pendLen;
  const pendBobY=pendPivotY+Math.cos(pendAngle)*pendLen;
  // rod
  ctx.strokeStyle='#a0904a'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(pendPivotX,pendPivotY); ctx.lineTo(pendBobX,pendBobY); ctx.stroke();
  // bob (lens shape)
  ctx.fillStyle='#c8b060';
  ctx.beginPath(); ctx.ellipse(pendBobX,pendBobY,12,16,pendAngle,0,7); ctx.fill();
  ctx.strokeStyle='#a09040'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.ellipse(pendBobX,pendBobY,12,16,pendAngle,0,7); ctx.stroke();
  // glint on bob
  ctx.fillStyle='rgba(255,240,180,.3)';
  ctx.beginPath(); ctx.ellipse(pendBobX-3,pendBobY-4,4,6,pendAngle,0,7); ctx.fill();

  // hourglasses on the floor
  function hourglass(hx,hy,scale){
    ctx.save(); ctx.translate(hx,hy); ctx.scale(scale,scale);
    // frame
    ctx.strokeStyle='#a09060'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(-10,-22); ctx.lineTo(10,-22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10,22); ctx.lineTo(10,22); ctx.stroke();
    // posts
    ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(-8,-22); ctx.lineTo(-8,22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8,-22); ctx.lineTo(8,22); ctx.stroke();
    // glass body — two triangles meeting at center
    ctx.fillStyle='rgba(180,200,220,.15)';
    ctx.beginPath(); ctx.moveTo(-7,-20); ctx.lineTo(7,-20); ctx.lineTo(1,0); ctx.lineTo(-1,0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7,20); ctx.lineTo(7,20); ctx.lineTo(1,0); ctx.lineTo(-1,0); ctx.closePath(); ctx.fill();
    // sand in bottom — pile
    const sandH=10+Math.sin(t*0.2+hx)*2;
    ctx.fillStyle='rgba(220,190,130,.5)';
    ctx.beginPath(); ctx.moveTo(-6,20); ctx.lineTo(6,20); ctx.lineTo(1,20-sandH); ctx.lineTo(-1,20-sandH); ctx.closePath(); ctx.fill();
    // falling sand stream
    ctx.fillStyle='rgba(220,190,130,.4)'; ctx.fillRect(-0.5,0,1,20-sandH);
    // sand in top (less)
    const topSand=6-Math.sin(t*0.2+hx)*2;
    ctx.fillStyle='rgba(220,190,130,.35)';
    ctx.beginPath(); ctx.moveTo(-5,-20); ctx.lineTo(5,-20); ctx.lineTo(1,-20+topSand); ctx.lineTo(-1,-20+topSand); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  hourglass(W*0.30,floorY-22,0.8);
  hourglass(W*0.70,floorY-20,0.7);
  hourglass(W*0.88,floorY-18,0.6);

  // floor — polished dark stone
  const floorG=ctx.createLinearGradient(0,floorY,0,H);
  floorG.addColorStop(0,'#2a2430'); floorG.addColorStop(1,'#1e1824');
  ctx.fillStyle=floorG; ctx.fillRect(0,floorY,W,H-floorY);
  // tile pattern
  ctx.strokeStyle='rgba(60,50,70,.4)'; ctx.lineWidth=0.6;
  for (let y=floorY;y<H;y+=12){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  for (let y=floorY;y<H;y+=12){ const off=(((y-floorY)/12|0)%2)*14; for (let x=off;x<W;x+=28){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+12); ctx.stroke(); } }

  // pendulum shadow on the floor
  const shadowX=pendBobX, shadowW=14+Math.abs(Math.sin(pendAngle))*8;
  ctx.fillStyle='rgba(0,0,0,.1)';
  ctx.beginPath(); ctx.ellipse(shadowX,floorY+4,shadowW,3,0,0,7); ctx.fill();

  // floating dust motes in light beam
  for (let i=0;i<10;i++){
    const dx=winCx-20+i*5+Math.sin(t*0.2+i*1.7)*12;
    const dy=winTop+20+((t*8+i*37)%((floorY-winTop)*0.8));
    const db=0.08+0.06*Math.sin(t*1.5+i);
    ctx.fillStyle=`rgba(200,200,230,${db})`;
    ctx.beginPath(); ctx.arc(dx,dy,1,0,7); ctx.fill();
  }

  // warm ambient glow from gears (implies magical energy)
  for (const [gx,gy] of [[W*0.14,H*0.38],[W*0.86,H*0.40]]){
    const gg=ctx.createRadialGradient(gx,gy,5,gx,gy,45);
    gg.addColorStop(0,'rgba(200,180,120,.06)'); gg.addColorStop(1,'rgba(200,180,120,0)');
    ctx.fillStyle=gg; ctx.fillRect(gx-45,gy-45,90,90);
  }

  // a few small ticking cogs on the walls (decorative)
  for (let i=0;i<4;i++){
    const cx=(i*W*0.22+W*0.12), cy=H*0.14+i*8;
    const ca=t*0.5*(i%2?1:-1)+i;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(ca);
    ctx.strokeStyle='rgba(140,120,80,.25)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(0,0,6,0,7); ctx.stroke();
    for (let j=0;j<5;j++){ const a2=j/5*Math.PI*2; ctx.fillStyle='rgba(140,120,80,.2)'; ctx.fillRect(Math.cos(a2)*6-1.5,-1,3,2); }
    ctx.restore();
  }
}
registerScene('enchantedclock', drawEnchantedClock);

/* ── GAS STATION (outdoor · dusk · pumps + convenience store) ── */
function drawGasStation(){
  const t = sceneTime, groundY = H*0.68;

  // dusk sky
  const sky=ctx.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,'#2a2040'); sky.addColorStop(0.4,'#5a3060'); sky.addColorStop(0.7,'#c06040'); sky.addColorStop(1,'#e8a060');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // early stars
  for (let i=0;i<20;i++){ const sx=(i*79+11)%W, sy=(i*37+5)%(groundY*0.4);
    ctx.fillStyle=`rgba(255,250,220,${0.15+0.25*Math.abs(Math.sin(t*1.5+i))})`; ctx.fillRect(sx,sy,1.1,1.1); }

  // convenience store (right side back wall)
  const stX=W*0.62, stW=W*0.34, stH=H*0.38, stY=groundY-stH;
  ctx.fillStyle='#4a4442'; ctx.fillRect(stX,stY,stW,stH);
  // glass front
  ctx.fillStyle='rgba(180,220,240,.3)'; ctx.fillRect(stX+6,stY+10,stW-12,stH-18);
  // interior glow
  ctx.fillStyle=`rgba(255,240,200,${0.18+0.04*Math.sin(t*2)})`; ctx.fillRect(stX+6,stY+10,stW-12,stH-18);
  // shelves visible inside
  ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1;
  for (let y=stY+20;y<groundY-14;y+=16){ ctx.beginPath(); ctx.moveTo(stX+10,y); ctx.lineTo(stX+stW-10,y); ctx.stroke(); }
  // product blobs on shelves
  const prodCols=['#e04040','#4090e0','#e0c040','#40c060'];
  for (let y=stY+24;y<groundY-18;y+=16){ for (let x=stX+14;x<stX+stW-14;x+=10){
    ctx.fillStyle=prodCols[((x+y)|0)%4]; ctx.fillRect(x,y-4,6,6); } }
  // door
  ctx.fillStyle='rgba(120,180,200,.4)'; ctx.fillRect(stX+stW*0.4,stY+stH*0.3,stW*0.2,stH*0.7);
  ctx.strokeStyle='#888'; ctx.lineWidth=1; ctx.strokeRect(stX+stW*0.4,stY+stH*0.3,stW*0.2,stH*0.7);
  // store sign
  ctx.fillStyle='#e04040'; ctx.fillRect(stX,stY-8,stW,8);
  ctx.fillStyle=`rgba(255,200,150,${0.8+0.15*Math.sin(t*2.5)})`; ctx.fillRect(stX+stW*0.2,stY-6,stW*0.6,4);

  // canopy over pumps (left/center)
  const canX=W*0.06, canW=W*0.52, canY=groundY-H*0.46;
  // canopy posts
  ctx.fillStyle='#666'; ctx.fillRect(canX+10,canY,4,groundY-canY); ctx.fillRect(canX+canW-14,canY,4,groundY-canY);
  // canopy roof
  ctx.fillStyle='#555'; ctx.fillRect(canX,canY,canW,10);
  ctx.fillStyle='#444'; ctx.fillRect(canX,canY+10,canW,4);
  // canopy underside lights
  for (let x=canX+20;x<canX+canW-10;x+=30){
    ctx.fillStyle=`rgba(255,240,200,${0.7+0.2*Math.sin(t*3+x)})`; ctx.beginPath(); ctx.arc(x,canY+16,3,0,7); ctx.fill(); }
  // warm light pool on ground from canopy
  const glow=ctx.createRadialGradient(canX+canW/2,groundY,10,canX+canW/2,groundY,canW*0.6);
  glow.addColorStop(0,'rgba(255,220,150,.25)'); glow.addColorStop(1,'rgba(255,220,150,0)');
  ctx.fillStyle=glow; ctx.fillRect(canX-20,groundY-40,canW+40,80);

  // gas pumps
  function pump(px){
    ctx.fillStyle='#d8d0c8'; ctx.fillRect(px-10,groundY-48,20,48);
    ctx.fillStyle='#c0b8a8'; ctx.fillRect(px-12,groundY-50,24,6);
    // screen
    ctx.fillStyle='#1a1a2a'; ctx.fillRect(px-6,groundY-42,12,10);
    ctx.fillStyle=`rgba(100,200,100,${0.6+0.3*Math.sin(t*2+px)})`; ctx.fillRect(px-4,groundY-40,8,6);
    // hose
    ctx.strokeStyle='#222'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(px+10,groundY-28); ctx.quadraticCurveTo(px+20,groundY-18,px+14,groundY-8); ctx.stroke();
    // nozzle
    ctx.fillStyle='#333'; ctx.fillRect(px+12,groundY-12,4,8);
  }
  pump(canX+canW*0.28); pump(canX+canW*0.62);

  // price sign (tall pole, left edge)
  const pX=W*0.04, pY=H*0.08;
  ctx.fillStyle='#555'; ctx.fillRect(pX,pY,4,groundY-pY);
  ctx.fillStyle='#1a4a1a'; ctx.fillRect(pX-14,pY,32,42);
  ctx.fillStyle='#2a8a2a'; ctx.fillRect(pX-12,pY+2,28,38);
  // price numbers
  ctx.fillStyle='#dde8aa'; ctx.fillRect(pX-6,pY+8,16,6); ctx.fillRect(pX-6,pY+20,16,6); ctx.fillRect(pX-6,pY+30,16,6);

  // parked car (foreground right)
  const carX=W*0.82, carY=groundY+6;
  ctx.fillStyle='#3a5a8a'; roundRect(carX-24,carY-14,48,16,4); ctx.fill();
  ctx.fillStyle='#2a4a6a'; roundRect(carX-18,carY-24,36,14,3); ctx.fill();
  ctx.fillStyle='rgba(180,220,240,.5)'; ctx.fillRect(carX-14,carY-22,12,10); ctx.fillRect(carX+2,carY-22,12,10);
  // wheels
  ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(carX-14,carY+2,5,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(carX+14,carY+2,5,0,7); ctx.fill();
  // headlights
  ctx.fillStyle=`rgba(255,240,180,${0.7+0.2*Math.sin(t*3)})`; ctx.beginPath(); ctx.arc(carX+24,carY-8,3,0,7); ctx.fill();

  // concrete ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#7a7670'); gr.addColorStop(1,'#5a5650');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  // asphalt seams
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=40){ ctx.beginPath(); ctx.moveTo(x,groundY); ctx.lineTo(x,H); ctx.stroke(); }
  // yellow lane line
  ctx.fillStyle='rgba(200,180,60,.5)'; ctx.fillRect(0,H-6,W,2);

  // NPC customer by the pumps
  SpriteRenderer.submit({sprite:'npcAdult',phase:'actors',x:W*0.36,y:H*0.86,anchorY:1,frame:Math.floor(t*8)%4});
  // signpost near the price sign
  SpriteRenderer.submit({sprite:'signpost',x:W*0.14,y:groundY+18,frame:Math.floor(sceneTime*3)%4});
  // trash can near the store
  SpriteRenderer.submit({sprite:'trashCan',x:W*0.58,y:groundY+16,frame:Math.floor(sceneTime*3)%4});
  SpriteRenderer.submit({sprite:'grassCurbEdge',x:W*0.50,y:groundY+40,frame:0});
}
registerScene('gasstation', drawGasStation);

/* ── GROCERY STORE (indoor · produce section + aisles) ── */
function drawGroceryStore(){
  const t = sceneTime, floorY = H*0.70;

  // white-ish ceiling/wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#e8e6e0'); wall.addColorStop(1,'#d8d4cc');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // fluorescent light panels
  for (let x=W*0.15;x<W;x+=W*0.35){
    ctx.fillStyle='#f0ece4'; ctx.fillRect(x-30,6,60,8);
    ctx.fillStyle=`rgba(255,255,240,${0.85+0.1*Math.sin(t*4+x)})`; ctx.fillRect(x-26,8,52,4);
    // light haze below
    const lz=ctx.createRadialGradient(x,10,4,x,10,80);
    lz.addColorStop(0,'rgba(255,255,240,.12)'); lz.addColorStop(1,'rgba(255,255,240,0)');
    ctx.fillStyle=lz; ctx.fillRect(x-80,0,160,floorY*0.5);
  }

  // aisle shelves (right side, receding)
  for (let i=0;i<3;i++){
    const sx=W*0.62+i*32, topY=H*0.20, shH=floorY-topY-4;
    ctx.fillStyle='#c8c0b4'; ctx.fillRect(sx,topY,18,shH);
    // shelf dividers
    ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1;
    for (let y=topY;y<floorY;y+=20){ ctx.beginPath(); ctx.moveTo(sx,y); ctx.lineTo(sx+18,y); ctx.stroke(); }
    // products on shelves
    const cols=['#e04040','#4060c0','#40a060','#e0a020','#c040a0'];
    for (let y=topY+4;y<floorY-8;y+=20){ for (let x2=sx+2;x2<sx+16;x2+=5){
      ctx.fillStyle=cols[((x2+y)|0)%5]; ctx.fillRect(x2,y+2,4,10); } }
  }

  // produce section (left side)
  const prodX=W*0.06, prodW=W*0.44, prodY=floorY-40;
  // produce display table
  ctx.fillStyle='#8a7a60'; ctx.fillRect(prodX,prodY,prodW,12);
  ctx.fillStyle='#6a5a44'; ctx.fillRect(prodX+4,prodY+12,prodW-8,28);
  // dividers
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1;
  for (let x=prodX+prodW*0.25;x<prodX+prodW;x+=prodW*0.25){ ctx.beginPath(); ctx.moveTo(x,prodY-2); ctx.lineTo(x,prodY+10); ctx.stroke(); }
  // fruit heaps
  function fruitHeap(fx,fy,col,count){
    for (let i=0;i<count;i++){ const dx=(i%4)*5-8, dy=-Math.floor(i/4)*5;
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(fx+dx,fy+dy,3.5,0,7); ctx.fill(); } }
  fruitHeap(prodX+prodW*0.12, prodY-2,'#e04040',8);   // red apples
  fruitHeap(prodX+prodW*0.35, prodY-2,'#f0c020',7);   // lemons
  fruitHeap(prodX+prodW*0.58, prodY-2,'#40a840',8);   // limes
  fruitHeap(prodX+prodW*0.82, prodY-2,'#e08020',6);   // oranges
  // leaf garnishes
  ctx.fillStyle='#3a8a3a';
  for (let x=prodX+8;x<prodX+prodW-8;x+=18){ ctx.beginPath(); ctx.ellipse(x,prodY-8,4,2,0.3,0,7); ctx.fill(); }

  // hanging banner / sale sign
  ctx.fillStyle='#e04040'; roundRect(W*0.30,H*0.08,W*0.24,16,3); ctx.fill();
  ctx.fillStyle='#fff'; ctx.fillRect(W*0.34,H*0.10,W*0.16,8);

  // shopping cart (center-foreground)
  const cx=W*0.44, cy=floorY+16;
  ctx.strokeStyle='#999'; ctx.lineWidth=1.5;
  // basket
  ctx.strokeRect(cx-14,cy-10,28,14);
  // handle
  ctx.beginPath(); ctx.moveTo(cx+14,cy-10); ctx.lineTo(cx+22,cy-20); ctx.lineTo(cx+26,cy-20); ctx.stroke();
  // wheels
  ctx.fillStyle='#666'; ctx.beginPath(); ctx.arc(cx-10,cy+6,3,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(cx+10,cy+6,3,0,7); ctx.fill();
  // items in cart
  ctx.fillStyle='#e06040'; ctx.fillRect(cx-8,cy-14,8,6);
  ctx.fillStyle='#40a0e0'; ctx.fillRect(cx+2,cy-14,6,6);

  // checkout counter (far right back)
  ctx.fillStyle='#6a5a44'; ctx.fillRect(W*0.86,floorY-50,W*0.12,50);
  ctx.fillStyle='#444'; ctx.fillRect(W*0.88,floorY-46,W*0.08,8);
  // register screen
  ctx.fillStyle=`rgba(100,200,120,${0.6+0.3*Math.sin(t*2.5)})`; ctx.fillRect(W*0.90,floorY-44,W*0.04,4);

  // linoleum floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#c8c0b0'); fl.addColorStop(1,'#b0a898');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  // tile grid
  ctx.strokeStyle='rgba(0,0,0,.1)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=30){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y=floorY+10;y<H;y+=14){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // floor shine
  ctx.fillStyle='rgba(255,255,255,.06)'; ctx.beginPath(); ctx.ellipse(W*0.4,floorY+30,100,20,0,0,7); ctx.fill();

  // shoppers in the aisles
  SpriteRenderer.submit({sprite:'npcAdult',phase:'actors',x:W*0.60,y:H*0.88,anchorY:1,frame:Math.floor(t*8)%4});
  SpriteRenderer.submit({sprite:'npcChild',phase:'actors',x:W*0.68,y:H*0.86,anchorY:1,frame:Math.floor(t*8+2)%4});
}
registerScene('grocerystore', drawGroceryStore);

/* ── BEDROOM (indoor · cozy · bed + nightstand + window) ── */
function drawBedroom(){
  const t = sceneTime, floorY = H*0.72;

  // warm painted wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#c8b8a0'); wall.addColorStop(1,'#b8a890');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // window with curtains (center-left)
  const winX=W*0.28, winY=H*0.10, winW=W*0.26, winH=H*0.34;
  // night sky through window
  ctx.fillStyle='#2a3a5a'; ctx.fillRect(winX,winY,winW,winH);
  // stars through window
  for (let i=0;i<8;i++){ const sx=winX+6+(i*23)%((winW-12)|1), sy=winY+4+(i*17)%(winH*0.6);
    ctx.fillStyle=`rgba(255,250,220,${0.4+0.3*Math.sin(t*1.5+i)})`; ctx.fillRect(sx,sy,1.2,1.2); }
  // moon
  ctx.fillStyle='#f0ecd0'; ctx.beginPath(); ctx.arc(winX+winW*0.7,winY+winH*0.3,8,0,7); ctx.fill();
  // window frame
  ctx.strokeStyle='#f0ece4'; ctx.lineWidth=3; ctx.strokeRect(winX,winY,winW,winH);
  ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(winX+winW/2,winY); ctx.lineTo(winX+winW/2,winY+winH); ctx.moveTo(winX,winY+winH/2); ctx.lineTo(winX+winW,winY+winH/2); ctx.stroke();
  // curtains
  ctx.fillStyle='#8a5a5a';
  for (let s=0;s<2;s++){
    const cx=s===0?winX-8:winX+winW; const dir=s===0?1:-1;
    ctx.beginPath(); ctx.moveTo(cx,winY-4);
    for (let y=winY-4;y<=winY+winH+4;y+=6){ ctx.lineTo(cx+dir*(14+4*Math.sin(y*0.08+t*0.5)),y); }
    ctx.lineTo(cx,winY+winH+4); ctx.closePath(); ctx.fill();
  }
  // curtain rod
  ctx.fillStyle='#c9a24a'; ctx.fillRect(winX-16,winY-6,winW+32,3);
  ctx.beginPath(); ctx.arc(winX-16,winY-5,3,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(winX+winW+16,winY-5,3,0,7); ctx.fill();

  // bed (right side, large)
  const bedX=W*0.58, bedY=floorY-6, bedW=W*0.38, bedH=30;
  // bed frame
  ctx.fillStyle='#6a4a30'; ctx.fillRect(bedX,bedY-bedH,bedW,bedH+6);
  // headboard
  ctx.fillStyle='#5a3a22'; roundRect(bedX+bedW-8,bedY-bedH-20,8,bedH+20,2); ctx.fill();
  // mattress
  ctx.fillStyle='#e8e0d4'; ctx.fillRect(bedX+2,bedY-bedH+4,bedW-12,bedH-2);
  // blanket
  ctx.fillStyle='#6a8aaa'; ctx.fillRect(bedX+2,bedY-bedH+14,bedW-12,bedH-12);
  ctx.fillStyle='#5a7a9a'; ctx.fillRect(bedX+2,bedY-6,bedW-12,6);
  // fold line
  ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(bedX+2,bedY-bedH+14); ctx.lineTo(bedX+bedW-10,bedY-bedH+14); ctx.stroke();
  // pillows
  ctx.fillStyle='#f2ece0'; roundRect(bedX+bedW-28,bedY-bedH+2,10,12,3); ctx.fill();
  roundRect(bedX+bedW-16,bedY-bedH+4,10,10,3); ctx.fill();

  // nightstand with lamp (left of bed)
  const nsX=W*0.52, nsY=floorY;
  ctx.fillStyle='#5a4a34'; ctx.fillRect(nsX-12,nsY-26,24,26);
  // lamp
  ctx.fillStyle='#c9a24a'; ctx.fillRect(nsX-2,nsY-34,4,8);
  // lampshade
  ctx.fillStyle=`rgba(240,220,170,${0.8+0.1*Math.sin(t*2)})`; ctx.beginPath(); ctx.moveTo(nsX-10,nsY-34); ctx.lineTo(nsX+10,nsY-34); ctx.lineTo(nsX+7,nsY-46); ctx.lineTo(nsX-7,nsY-46); ctx.closePath(); ctx.fill();
  // lamp glow
  ctx.fillStyle='rgba(255,220,150,.15)'; ctx.beginPath(); ctx.arc(nsX,nsY-40,40,0,7); ctx.fill();

  // bookshelf (far left)
  const bsX=W*0.04, bsY=H*0.18, bsW=W*0.16, bsH=floorY-bsY;
  ctx.fillStyle='#6a5a44'; ctx.fillRect(bsX,bsY,bsW,bsH);
  // shelves
  ctx.fillStyle='#5a4a34';
  for (let y=bsY;y<floorY;y+=bsH/4){ ctx.fillRect(bsX,y,bsW,3); }
  // books
  const bookCols=['#c04040','#4060a0','#40a060','#a06040','#8040a0','#e0a020'];
  for (let row=0;row<4;row++){
    const sy=bsY+4+row*(bsH/4);
    for (let b=0;b<5;b++){
      ctx.fillStyle=bookCols[(row*5+b)%bookCols.length];
      ctx.fillRect(bsX+3+b*(bsW/5-1),sy,bsW/5-3,bsH/4-6);
    }
  }

  // wooden floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#a08060'); fl.addColorStop(1,'#8a6a4a');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=28){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-6,H); ctx.stroke(); }
  // area rug
  ctx.fillStyle='#a04a4a'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.88,90,20,0,0,7); ctx.fill();
  ctx.fillStyle='#c0786a'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.88,60,13,0,0,7); ctx.fill();
  ctx.fillStyle='#a04a4a'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.88,30,7,0,0,7); ctx.fill();

  // book on the nightstand
  SpriteRenderer.submit({sprite:'book',phase:'ground',x:W*0.54,y:floorY-28,anchorY:1,frame:0});
  // kittens on the rug
  SpriteRenderer.submit({sprite:'kittens',phase:'actors',x:W*0.46,y:H*0.90,anchorY:1,frame:Math.floor(t*6)%4});
}
registerScene('bedroom', drawBedroom);

/* ── OFFICE (indoor · cubicle farm · fluorescent lights) ── */
function drawOffice(){
  const t = sceneTime, floorY = H*0.70;

  // off-white walls
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#d8d4cc'); wall.addColorStop(1,'#ccc8c0');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // drop ceiling panels
  ctx.fillStyle='#e8e4dc'; ctx.fillRect(0,0,W,16);
  ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=W/5){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,16); ctx.stroke(); }
  // fluorescent strips
  for (let x=W*0.1;x<W;x+=W*0.4){
    ctx.fillStyle=`rgba(255,255,240,${0.85+0.1*Math.sin(t*5+x)})`; ctx.fillRect(x,4,W*0.2,6);
    ctx.fillStyle='#e0dcd4'; ctx.fillRect(x-2,2,W*0.2+4,2);
    // light pool
    const lz=ctx.createRadialGradient(x+W*0.1,10,4,x+W*0.1,10,90);
    lz.addColorStop(0,'rgba(255,255,240,.10)'); lz.addColorStop(1,'rgba(255,255,240,0)');
    ctx.fillStyle=lz; ctx.fillRect(x-40,0,W*0.2+80,floorY*0.5);
  }

  // cubicle partition walls
  function cubicleWall(wx,wy,ww,wh){
    ctx.fillStyle='#a09888'; ctx.fillRect(wx,wy,ww,wh);
    ctx.fillStyle='#b0a898'; ctx.fillRect(wx,wy,ww,3);
    ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; ctx.strokeRect(wx,wy,ww,wh);
  }
  // back row of cubicle walls
  cubicleWall(W*0.08,H*0.22,W*0.35,H*0.04);
  cubicleWall(W*0.56,H*0.22,W*0.35,H*0.04);
  // side dividers
  cubicleWall(W*0.08,H*0.22,W*0.02,floorY-H*0.22);
  cubicleWall(W*0.42,H*0.22,W*0.02,floorY-H*0.22);
  cubicleWall(W*0.56,H*0.22,W*0.02,floorY-H*0.22);
  cubicleWall(W*0.90,H*0.22,W*0.02,floorY-H*0.22);

  // desks with monitors (left cubicle)
  function desk(dx,dy){
    ctx.fillStyle='#b0a48a'; ctx.fillRect(dx-26,dy,52,6);
    // monitor
    ctx.fillStyle='#222'; roundRect(dx-14,dy-24,28,20,2); ctx.fill();
    ctx.fillStyle=`rgba(100,160,220,${0.7+0.2*Math.sin(t*2+dx)})`; ctx.fillRect(dx-12,dy-22,24,16);
    // monitor stand
    ctx.fillStyle='#444'; ctx.fillRect(dx-3,dy-4,6,4);
    ctx.fillRect(dx-8,dy-1,16,2);
    // keyboard
    ctx.fillStyle='#3a3a3a'; ctx.fillRect(dx-12,dy+1,18,4);
    // mouse
    ctx.fillStyle='#444'; ctx.beginPath(); ctx.ellipse(dx+10,dy+3,3,2,0,0,7); ctx.fill();
  }
  desk(W*0.24,floorY-18);
  desk(W*0.72,floorY-18);

  // office chairs
  function chair(cx,cy){
    // seat
    ctx.fillStyle='#3a3a3a'; ctx.beginPath(); ctx.ellipse(cx,cy,12,6,0,0,7); ctx.fill();
    // back
    ctx.fillStyle='#333'; roundRect(cx-8,cy-16,16,12,3); ctx.fill();
    // pole + wheel base
    ctx.fillStyle='#555'; ctx.fillRect(cx-1,cy+4,2,6);
    ctx.strokeStyle='#555'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx-8,cy+10); ctx.lineTo(cx+8,cy+10); ctx.stroke();
  }
  chair(W*0.24,floorY+6);
  chair(W*0.72,floorY+6);

  // water cooler (back center)
  const wcX=W*0.49, wcY=H*0.28;
  ctx.fillStyle='#d0d8e0'; ctx.fillRect(wcX-8,wcY,16,floorY-wcY-20);
  ctx.fillStyle='rgba(140,200,240,.5)'; roundRect(wcX-6,wcY-16,12,16,3); ctx.fill();
  ctx.fillStyle='#88c8e8'; ctx.fillRect(wcX-4,wcY-14,8,12);
  // spigot
  ctx.fillStyle='#aaa'; ctx.fillRect(wcX-2,wcY+2,4,3);
  // cups
  ctx.fillStyle='#f0ece4'; ctx.fillRect(wcX+10,wcY+4,6,6);

  // potted plant (far right)
  const plX=W*0.94, plY=floorY;
  ctx.fillStyle='#8a6040'; ctx.beginPath(); ctx.moveTo(plX-8,plY); ctx.lineTo(plX+8,plY); ctx.lineTo(plX+6,plY-16); ctx.lineTo(plX-6,plY-16); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#4a8a4a';
  for (const a of [-0.6,-0.2,0.2,0.6]){ ctx.save(); ctx.translate(plX,plY-16); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-12,4,10,0,0,7); ctx.fill(); ctx.restore(); }

  // carpet floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#8a8478'); fl.addColorStop(1,'#7a7468');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  // carpet texture dots
  ctx.fillStyle='rgba(0,0,0,.05)'; for (let i=0;i<60;i++){ const px=(i*67+11)%W, py=floorY+4+((i*43+7)%(H-floorY-4)); ctx.fillRect(px,py,1.5,1.5); }

  // NPC colleague at the far desk
  SpriteRenderer.submit({sprite:'npcAdult',phase:'actors',x:W*0.24,y:H*0.84,anchorY:1,frame:Math.floor(t*8)%4});
  // trash can by the desk
  SpriteRenderer.submit({sprite:'trashCan',x:W*0.88,y:floorY+14,frame:Math.floor(sceneTime*3)%4});
}
registerScene('office', drawOffice);

/* ── SCHOOL (indoor · elementary classroom · bright & cheerful) ── */
function drawSchool(){
  const t = sceneTime, floorY = H*0.72;

  // bright yellow-cream wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#f5ecd0'); wall.addColorStop(1,'#ede4c4');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // chalkboard (center-back)
  const cbX=W*0.28, cbY=H*0.08, cbW=W*0.44, cbH=H*0.30;
  ctx.fillStyle='#4a3a2a'; ctx.fillRect(cbX-4,cbY-4,cbW+8,cbH+8);
  ctx.fillStyle='#2a5a3a'; ctx.fillRect(cbX,cbY,cbW,cbH);
  // chalk writing
  ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=2;
  // "ABC" in chalk
  ctx.beginPath(); ctx.moveTo(cbX+16,cbY+16); ctx.lineTo(cbX+22,cbY+30); ctx.lineTo(cbX+28,cbY+16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cbX+36,cbY+16); ctx.lineTo(cbX+36,cbY+30); ctx.arc(cbX+36,cbY+20,6,1.57,-1.57,true); ctx.moveTo(cbX+36,cbY+23); ctx.arc(cbX+36,cbY+26,6,4.71,1.57,false); ctx.stroke();
  ctx.beginPath(); ctx.arc(cbX+56,cbY+23,7,0.3,5.98); ctx.stroke();
  // math equation
  ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(cbX+20,cbY+cbH-20); ctx.lineTo(cbX+28,cbY+cbH-20);
  ctx.moveTo(cbX+24,cbY+cbH-24); ctx.lineTo(cbX+24,cbY+cbH-16); ctx.stroke(); // plus sign
  // chalk tray
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(cbX,cbY+cbH,cbW,5);
  // chalk pieces
  ctx.fillStyle='#f0ece0'; ctx.fillRect(cbX+10,cbY+cbH+1,12,3);
  ctx.fillStyle='#f0d050'; ctx.fillRect(cbX+26,cbY+cbH+1,10,3);
  ctx.fillStyle='#e06060'; ctx.fillRect(cbX+40,cbY+cbH+1,10,3);

  // alphabet banner across top
  ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fillRect(0,0,W,12);
  const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lCols=['#e04040','#e08040','#e0c040','#40a040','#4080e0','#8040c0'];
  ctx.font='bold 7px sans-serif'; ctx.textAlign='center';
  for (let i=0;i<26;i++){ ctx.fillStyle=lCols[i%6]; ctx.fillText(letters[i],8+i*(W-16)/25,9); }

  // clock on wall (right)
  const clkX=W*0.82, clkY=H*0.14;
  ctx.fillStyle='#f0ece0'; ctx.beginPath(); ctx.arc(clkX,clkY,14,0,7); ctx.fill();
  ctx.strokeStyle='#444'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(clkX,clkY,14,0,7); ctx.stroke();
  // clock hands
  const ha=t*0.1, ma=t*1.2;
  ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(clkX,clkY); ctx.lineTo(clkX+Math.cos(ha)*7,clkY+Math.sin(ha)*7); ctx.stroke();
  ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(clkX,clkY); ctx.lineTo(clkX+Math.cos(ma)*10,clkY+Math.sin(ma)*10); ctx.stroke();

  // globe on teacher's desk (right side)
  const tdX=W*0.84, tdY=floorY;
  // teacher's desk
  ctx.fillStyle='#8a6a44'; ctx.fillRect(tdX-28,tdY-22,56,22);
  ctx.fillStyle='#7a5a34'; ctx.fillRect(tdX-30,tdY-24,60,4);
  // globe
  ctx.fillStyle='#4a8ac0'; ctx.beginPath(); ctx.arc(tdX-8,tdY-36,10,0,7); ctx.fill();
  ctx.fillStyle='#5aa050'; ctx.beginPath(); ctx.arc(tdX-11,tdY-38,4,0,7); ctx.fill();
  ctx.beginPath(); ctx.arc(tdX-5,tdY-33,3,0,7); ctx.fill();
  // globe stand
  ctx.fillStyle='#8a6a40'; ctx.fillRect(tdX-9,tdY-26,2,4);
  ctx.fillRect(tdX-13,tdY-23,8,2);
  // apple on desk
  ctx.fillStyle='#c03030'; ctx.beginPath(); ctx.arc(tdX+12,tdY-28,5,0,7); ctx.fill();
  ctx.fillStyle='#4a8a40'; ctx.fillRect(tdX+11,tdY-34,2,4);

  // window (far left)
  const winX=W*0.04, winY=H*0.10, winW=W*0.14, winH=H*0.28;
  ctx.fillStyle='#88c8f0'; ctx.fillRect(winX,winY,winW,winH);
  // clouds through window
  ctx.fillStyle='rgba(255,255,255,.6)';
  ctx.beginPath(); ctx.arc(winX+winW*0.3+Math.sin(t*0.3)*4,winY+winH*0.3,6,0,7); ctx.arc(winX+winW*0.4+Math.sin(t*0.3)*4,winY+winH*0.25,7,0,7); ctx.fill();
  // window frame
  ctx.strokeStyle='#e0dcd0'; ctx.lineWidth=3; ctx.strokeRect(winX,winY,winW,winH);
  ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(winX+winW/2,winY); ctx.lineTo(winX+winW/2,winY+winH); ctx.moveTo(winX,winY+winH/2); ctx.lineTo(winX+winW,winY+winH/2); ctx.stroke();

  // student desks in rows
  function studentDesk(dx,dy){
    ctx.fillStyle='#c0a878'; ctx.fillRect(dx-16,dy,32,5);
    ctx.fillStyle='#a08858'; ctx.fillRect(dx-14,dy+5,4,10); ctx.fillRect(dx+10,dy+5,4,10);
    // chair
    ctx.fillStyle='#4080c0'; ctx.fillRect(dx-8,dy+8,16,4);
    ctx.fillStyle='#3070b0'; ctx.fillRect(dx-6,dy+2,12,6);
  }
  studentDesk(W*0.24,floorY-30); studentDesk(W*0.40,floorY-30); studentDesk(W*0.56,floorY-30);
  studentDesk(W*0.32,floorY-12); studentDesk(W*0.48,floorY-12);

  // linoleum floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#c8bca0'); fl.addColorStop(1,'#b8ac90');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=24){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y=floorY+12;y<H;y+=12){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // floor shine
  ctx.fillStyle='rgba(255,255,255,.06)'; ctx.beginPath(); ctx.ellipse(W*0.45,floorY+24,80,16,0,0,7); ctx.fill();

  // background students
  SpriteRenderer.submit({sprite:'npcChild',phase:'actors',x:W*0.18,y:H*0.88,anchorY:1,frame:Math.floor(t*8)%4});
  SpriteRenderer.submit({sprite:'npcChild',phase:'actors',x:W*0.62,y:H*0.90,anchorY:1,frame:Math.floor(t*8+1)%4,flipX:true});
  // book on a desk
  SpriteRenderer.submit({sprite:'book',phase:'ground',x:W*0.40,y:floorY-28,anchorY:1,frame:0});
  // trash can by the teacher's desk
  SpriteRenderer.submit({sprite:'trashCan',x:W*0.76,y:floorY+16,frame:Math.floor(sceneTime*3)%4});
  SpriteRenderer.submit({sprite:'grassCurbEdge',x:W*0.50,y:floorY+40,frame:1});
}
registerScene('school', drawSchool);

/* ── POLICE STATION (indoor · lobby · front desk with glass) ── */
function drawPoliceStation(){
  const t = sceneTime, floorY = H*0.70;

  // institutional beige wall
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#d4cfc4'); wall.addColorStop(1,'#c8c3b8');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);

  // wainscoting (lower wall)
  ctx.fillStyle='#8a7a66'; ctx.fillRect(0,floorY-30,W,30);
  ctx.fillStyle='#9a8a76'; ctx.fillRect(0,floorY-30,W,3);

  // front desk with bulletproof glass (center)
  const dkX=W*0.32, dkY=H*0.38, dkW=W*0.36, dkH=floorY-dkY;
  // desk counter
  ctx.fillStyle='#6a5a44'; ctx.fillRect(dkX,dkY+dkH*0.6,dkW,dkH*0.4);
  ctx.fillStyle='#7a6a54'; ctx.fillRect(dkX-2,dkY+dkH*0.58,dkW+4,4);
  // glass partition
  ctx.fillStyle='rgba(180,210,230,.25)'; ctx.fillRect(dkX+4,dkY,dkW-8,dkH*0.58);
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(dkX+dkW*0.3,dkY+4); ctx.lineTo(dkX+dkW*0.3,dkY+dkH*0.54); ctx.stroke();
  // speaking hole circle
  ctx.strokeStyle='rgba(120,140,160,.4)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(dkX+dkW*0.5,dkY+dkH*0.35,8,0,7); ctx.stroke();
  // tiny holes
  for (let i=0;i<5;i++){ for (let j=0;j<5;j++){
    const hx=dkX+dkW*0.5-4+i*2, hy=dkY+dkH*0.35-4+j*2;
    if (Math.hypot(hx-(dkX+dkW*0.5),hy-(dkY+dkH*0.35))<7){
      ctx.fillStyle='rgba(100,120,140,.3)'; ctx.fillRect(hx,hy,1,1);
    }
  }}
  // frame around glass
  ctx.strokeStyle='#888'; ctx.lineWidth=2; ctx.strokeRect(dkX+2,dkY-2,dkW-4,dkH*0.62);

  // bulletin board with wanted posters (left wall)
  const bbX=W*0.04, bbY=H*0.12, bbW=W*0.20, bbH=H*0.28;
  ctx.fillStyle='#b08a50'; ctx.fillRect(bbX-2,bbY-2,bbW+4,bbH+4);
  ctx.fillStyle='#c0a870'; ctx.fillRect(bbX,bbY,bbW,bbH);
  // papers pinned on
  const paperCols=['#f0ece0','#e8e4d8','#f4f0e4','#ece8dc'];
  for (let i=0;i<3;i++){ for (let j=0;j<2;j++){
    const px=bbX+6+i*(bbW/3), py=bbY+6+j*(bbH/2);
    ctx.fillStyle=paperCols[(i+j)%4]; ctx.fillRect(px,py,bbW/3-8,bbH/2-8);
    // pin
    ctx.fillStyle='#c03030'; ctx.beginPath(); ctx.arc(px+(bbW/3-8)/2,py+2,2,0,7); ctx.fill();
  }}
  // "WANTED" text on one
  ctx.fillStyle='#333'; ctx.font='bold 4px sans-serif'; ctx.textAlign='center';
  ctx.fillText('WANTED',bbX+bbW/6+2,bbY+16);

  // American flag (right wall)
  const flX=W*0.82, flY=H*0.10;
  // pole
  ctx.fillStyle='#c0a040'; ctx.fillRect(flX,flY,2,H*0.32);
  ctx.fillStyle='#d0b050'; ctx.beginPath(); ctx.arc(flX+1,flY,3,0,7); ctx.fill();
  // flag
  const fW=36, fH=22;
  for (let s=0;s<13;s++){ ctx.fillStyle=s%2===0?'#b22234':'#fff'; ctx.fillRect(flX+4,flY+6+s*(fH/13),fW,fH/13+0.5); }
  // blue canton
  ctx.fillStyle='#3c3b6e'; ctx.fillRect(flX+4,flY+6,fW*0.4,fH*0.54);
  // tiny stars
  ctx.fillStyle='#fff';
  for (let i=0;i<9;i++){ const sx=flX+6+i%3*4, sy=flY+9+Math.floor(i/3)*3; ctx.fillRect(sx,sy,1.2,1.2); }

  // badge display case (right of desk)
  const bdX=W*0.74, bdY=H*0.44;
  ctx.fillStyle='#5a4a34'; ctx.fillRect(bdX,bdY,W*0.12,H*0.16);
  ctx.fillStyle='rgba(180,200,220,.2)'; ctx.fillRect(bdX+2,bdY+2,W*0.12-4,H*0.16-4);
  // gold badge shape
  ctx.fillStyle='#d0a030'; ctx.beginPath(); ctx.arc(bdX+W*0.06,bdY+H*0.08,8,0,7); ctx.fill();
  ctx.fillStyle='#c09020'; ctx.beginPath();
  const bcx=bdX+W*0.06, bcy=bdY+H*0.08;
  for (let i=0;i<5;i++){ const a=i*Math.PI*2/5-Math.PI/2; ctx.lineTo(bcx+Math.cos(a)*10,bcy+Math.sin(a)*10);
    const a2=a+Math.PI/5; ctx.lineTo(bcx+Math.cos(a2)*5,bcy+Math.sin(a2)*5); } ctx.fill();

  // waiting chairs (front)
  for (let i=0;i<3;i++){
    const cx=W*0.12+i*28, cy=floorY-4;
    ctx.fillStyle='#4a6a8a'; ctx.fillRect(cx-8,cy-12,16,4); // back
    ctx.fillStyle='#5a7a9a'; ctx.fillRect(cx-8,cy-8,16,6); // seat
    ctx.fillStyle='#444'; ctx.fillRect(cx-6,cy-2,2,6); ctx.fillRect(cx+4,cy-2,2,6); // legs
  }

  // radio crackle (visual — little sound waves near desk)
  ctx.strokeStyle=`rgba(80,120,180,${0.3+0.2*Math.sin(t*4)})`; ctx.lineWidth=1;
  for (let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(dkX+dkW-16,dkY+dkH*0.4,4+i*4,5.5,0.8); ctx.stroke(); }

  // tile floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#a09888'); fl.addColorStop(1,'#908878');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=28){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y=floorY+10;y<H;y+=14){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.fillStyle='rgba(255,255,255,.04)'; ctx.beginPath(); ctx.ellipse(W*0.5,floorY+22,90,18,0,0,7); ctx.fill();
}
registerScene('policestation', drawPoliceStation);

/* ── SEWER (underground · dark tunnel · flowing water) ── */
function drawSewer(){
  const t = sceneTime, waterY = H*0.74;

  // dark brick walls
  const wall=ctx.createLinearGradient(0,0,0,waterY); wall.addColorStop(0,'#1a1a1a'); wall.addColorStop(0.4,'#2a2420'); wall.addColorStop(1,'#322a24');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,waterY);

  // brick pattern
  ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=1;
  for (let y=0;y<waterY;y+=10){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  for (let y=0;y<waterY;y+=10){ const off=(y/10|0)%2*14; for (let x=off;x<W;x+=28){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+10); ctx.stroke(); } }
  // moss/stain patches
  ctx.fillStyle='rgba(60,80,50,.15)';
  ctx.beginPath(); ctx.ellipse(W*0.2,H*0.3,20,8,0,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W*0.7,H*0.5,14,6,0.3,0,7); ctx.fill();

  // arched tunnel ceiling
  ctx.fillStyle='#141210';
  ctx.beginPath(); ctx.moveTo(0,H*0.18); ctx.quadraticCurveTo(W*0.5,H*-0.06,W,H*0.18); ctx.lineTo(W,0); ctx.lineTo(0,0); ctx.fill();

  // pipes overhead
  ctx.strokeStyle='#5a5a5a'; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(0,H*0.22); ctx.lineTo(W,H*0.22+4); ctx.stroke();
  ctx.strokeStyle='#4a4a4a'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(0,H*0.28); ctx.bezierCurveTo(W*0.3,H*0.26,W*0.6,H*0.30,W,H*0.27); ctx.stroke();
  // pipe joints
  ctx.fillStyle='#6a6a6a'; ctx.fillRect(W*0.3-3,H*0.21,6,7); ctx.fillRect(W*0.7-3,H*0.21,6,7);
  // dripping water from pipe
  const dripY=H*0.28+Math.abs(Math.sin(t*2))*20;
  ctx.fillStyle=`rgba(100,140,180,${0.7-Math.abs(Math.sin(t*2))*0.4})`; ctx.beginPath(); ctx.ellipse(W*0.45,dripY,2,3,0,0,7); ctx.fill();
  // drip splash at water surface
  if (Math.sin(t*2)<-0.9){ ctx.strokeStyle='rgba(100,160,200,.3)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(W*0.45,waterY,6,3.5,5.8); ctx.stroke(); }

  // walkway ledge (where pet walks)
  ctx.fillStyle='#3a3428'; ctx.fillRect(0,waterY-6,W,6);
  ctx.fillStyle='#4a4438'; ctx.fillRect(0,waterY-8,W,3);

  // flowing water channel
  const wat=ctx.createLinearGradient(0,waterY,0,H); wat.addColorStop(0,'#2a3a2a'); wat.addColorStop(0.5,'#1a2a1a'); wat.addColorStop(1,'#0a1a0a');
  ctx.fillStyle=wat; ctx.fillRect(0,waterY,W,H-waterY);
  // flow lines
  ctx.strokeStyle='rgba(80,120,80,.2)'; ctx.lineWidth=1;
  for (let y=waterY+4;y<H;y+=6){ ctx.beginPath(); for (let x=0;x<=W;x+=5){ const yy=y+Math.sin(x*0.05+t*2+y*0.3)*1.5; x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);} ctx.stroke(); }
  // reflections / puddle sheen on walkway
  ctx.fillStyle='rgba(60,90,70,.12)'; ctx.beginPath(); ctx.ellipse(W*0.3,waterY-3,30,3,0,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W*0.7,waterY-4,22,2,0,0,7); ctx.fill();

  // rat (left side)
  const ratX=W*0.14, ratY=waterY-10;
  ctx.fillStyle='#5a4a3a'; ctx.beginPath(); ctx.ellipse(ratX,ratY,6,4,0,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(ratX+7,ratY-2,3,3,0,0,7); ctx.fill(); // head
  ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.arc(ratX+8,ratY-4,1.5,0,7); ctx.fill(); // ear
  ctx.fillStyle='#111'; ctx.fillRect(ratX+9,ratY-2,1,1); // eye
  // tail
  ctx.strokeStyle='#4a3a2a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ratX-6,ratY); ctx.quadraticCurveTo(ratX-14,ratY-6,ratX-10,ratY-10); ctx.stroke();

  // mysterious glow further down tunnel (back center)
  const glX=W*0.50, glY=H*0.50;
  const glow=ctx.createRadialGradient(glX,glY,2,glX,glY,60);
  glow.addColorStop(0,`rgba(80,220,120,${0.18+0.08*Math.sin(t*1.5)})`); glow.addColorStop(1,'rgba(80,220,120,0)');
  ctx.fillStyle=glow; ctx.fillRect(glX-60,glY-60,120,120);
}
registerScene('sewer', drawSewer);

/* ── HIGH-RISE (indoor · night city view · modern apartment) ── */
function drawHighrise(){
  const t = sceneTime, floorY = H*0.72;

  // floor-to-ceiling windows — night sky
  const sky=ctx.createLinearGradient(0,0,0,floorY); sky.addColorStop(0,'#0a0e1a'); sky.addColorStop(0.5,'#141a2e'); sky.addColorStop(1,'#1a2240');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,floorY);

  // city skyline buildings
  let bx=0; let s2=13;
  const rr=()=>{ s2=(s2*9301+49297)%233280; return s2/233280; };
  while (bx<W){
    const bw=14+Math.floor(rr()*20), bh=40+Math.floor(rr()*80);
    const by=floorY-bh;
    ctx.fillStyle=`rgb(${20+Math.floor(rr()*20)},${22+Math.floor(rr()*16)},${34+Math.floor(rr()*20)})`;
    ctx.fillRect(bx,by,bw,bh);
    // lit windows
    for (let wy=by+4;wy<floorY-4;wy+=8){
      for (let wx=bx+3;wx<bx+bw-3;wx+=6){
        if (rr()>0.4){
          const warm=rr()>0.5;
          ctx.fillStyle=warm
            ? `rgba(255,220,140,${0.5+0.3*Math.abs(Math.sin(t*0.5+wx+wy))})`
            : `rgba(180,210,240,${0.3+0.2*Math.abs(Math.sin(t*0.7+wx*0.5))})`;
          ctx.fillRect(wx,wy,3,4);
        }
      }
    }
    bx+=bw+2;
  }

  // stars above skyline
  for (let i=0;i<30;i++){ const sx=(i*67+3)%W, sy=(i*31+7)%(floorY*0.35);
    ctx.fillStyle=`rgba(255,250,230,${0.2+0.3*Math.abs(Math.sin(t*1.3+i))})`; ctx.fillRect(sx,sy,1.2,1.2); }

  // window frame dividers
  ctx.strokeStyle='#3a3a42'; ctx.lineWidth=3;
  for (let x=W*0.25;x<W;x+=W*0.25){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,floorY); ctx.stroke(); }
  // horizontal bar
  ctx.beginPath(); ctx.moveTo(0,floorY*0.48); ctx.lineTo(W,floorY*0.48); ctx.stroke();
  // thin window frame at top and sides
  ctx.fillStyle='#3a3a42'; ctx.fillRect(0,0,W,3); ctx.fillRect(0,0,3,floorY); ctx.fillRect(W-3,0,3,floorY);

  // modern sleek floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#3a3634'); fl.addColorStop(1,'#2a2624');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  // floor reflections of city lights
  ctx.fillStyle='rgba(255,220,140,.04)'; ctx.fillRect(0,floorY,W,8);
  ctx.strokeStyle='rgba(255,255,255,.03)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=34){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x-4,H); ctx.stroke(); }

  // kitchen island (left)
  const kiX=W*0.08, kiY=floorY;
  ctx.fillStyle='#4a4a4e'; ctx.fillRect(kiX,kiY-26,W*0.22,26);
  ctx.fillStyle='#5a5a5e'; ctx.fillRect(kiX-2,kiY-28,W*0.22+4,4);
  // sink
  ctx.fillStyle='#3a3a3e'; ctx.beginPath(); ctx.ellipse(kiX+W*0.11,kiY-24,10,4,0,0,7); ctx.fill();
  // faucet
  ctx.fillStyle='#888'; ctx.fillRect(kiX+W*0.11-1,kiY-36,2,12);
  ctx.beginPath(); ctx.arc(kiX+W*0.11+3,kiY-36,3,3.14,0); ctx.fill();
  // pendant light above island
  const plY=H*0.08;
  ctx.strokeStyle='#555'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(kiX+W*0.11,0); ctx.lineTo(kiX+W*0.11,plY); ctx.stroke();
  ctx.fillStyle=`rgba(255,230,180,${0.7+0.15*Math.sin(t*2)})`; ctx.beginPath();
  ctx.moveTo(kiX+W*0.11-10,plY); ctx.lineTo(kiX+W*0.11+10,plY); ctx.lineTo(kiX+W*0.11+6,plY+10); ctx.lineTo(kiX+W*0.11-6,plY+10); ctx.closePath(); ctx.fill();
  // light pool
  const lg=ctx.createRadialGradient(kiX+W*0.11,plY+10,4,kiX+W*0.11,plY+10,60);
  lg.addColorStop(0,'rgba(255,230,180,.12)'); lg.addColorStop(1,'rgba(255,230,180,0)');
  ctx.fillStyle=lg; ctx.fillRect(kiX+W*0.11-60,plY,120,floorY-plY);

  // modern sofa (right)
  const sfX=W*0.68, sfY=floorY;
  ctx.fillStyle='#4a4a52'; roundRect(sfX,sfY-20,W*0.24,14,3); ctx.fill();
  ctx.fillStyle='#3a3a42'; roundRect(sfX+W*0.24-6,sfY-32,6,18,2); ctx.fill(); // arm
  ctx.fillStyle='#3a3a42'; roundRect(sfX,sfY-32,6,18,2); ctx.fill(); // arm
  // cushions
  ctx.fillStyle='#555'; roundRect(sfX+8,sfY-24,W*0.10,10,2); ctx.fill();
  roundRect(sfX+W*0.12,sfY-24,W*0.10,10,2); ctx.fill();

  // potted plant (far right)
  const ptX=W*0.94, ptY=floorY;
  ctx.fillStyle='#3a3a3e'; ctx.beginPath(); ctx.moveTo(ptX-7,ptY); ctx.lineTo(ptX+7,ptY); ctx.lineTo(ptX+5,ptY-16); ctx.lineTo(ptX-5,ptY-16); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a6a3a';
  for (const a of [-0.8,-0.3,0.2,0.7]){ ctx.save(); ctx.translate(ptX,ptY-16); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-14,3,12,0,0,7); ctx.fill(); ctx.restore(); }
}
registerScene('highrise', drawHighrise);

/* ══════════════════════════════════════════════════════════════════════════════
   SPRITE-ONLY SCENES  —  built entirely from the sprite object system.
   Canvas only provides a sky gradient; all ground, props, and characters
   come from SpriteRenderer.submit(). Objects use registry defaults for size,
   phase, and anchor. Static objects freeze on frame 0 unless animated.
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── TOWN SQUARE (outdoor · sprite-only) ── */
function drawTownSquare(){
  const t = sceneTime;
  const groundY = H * 0.62;   // horizon / ground line

  // ---- sky (only canvas drawing — everything else is sprites) ----
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, '#5a9ed6');
  sky.addColorStop(1, '#a8d4f0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, groundY);

  // ---- tiled cobblestone ground — stretch across full width ----
  // Submit multiple cobblestone tiles edge-to-edge to cover the ground
  const tileW = 120;  // display width per tile
  const tileH = 120;
  for (let tx = tileW / 2; tx < W + tileW; tx += tileW) {
    SpriteRenderer.submit({
      sprite:'cobblestone', x:tx, y:groundY,
      width:tileW, height:tileH, anchorY:0, frame:0
    });
  }

  // ---- clouds (background, animated) ----
  drawSpriteCloud(W * 0.20 + Math.sin(t * 0.08) * 10, H * 0.10, 0.9);
  drawSpriteCloud(W * 0.70 + Math.sin(t * 0.06 + 2) * 12, H * 0.14, 0.7);

  // ---- background buildings (canvas — simple silhouettes behind sprites) ----
  ctx.fillStyle = '#c8b8a0';
  ctx.fillRect(0, groundY - 80, 90, 80);
  ctx.fillRect(W - 100, groundY - 70, 100, 70);
  ctx.fillStyle = '#b0a088';
  ctx.fillRect(100, groundY - 60, 70, 60);
  ctx.fillRect(W - 200, groundY - 50, 80, 50);
  // windows
  ctx.fillStyle = '#8ac0e0';
  for (let bx = 10; bx < 80; bx += 22) {
    ctx.fillRect(bx, groundY - 68, 12, 14);
    ctx.fillRect(bx, groundY - 44, 12, 14);
  }
  for (let bx = W - 90; bx < W - 10; bx += 24) {
    ctx.fillRect(bx, groundY - 58, 14, 14);
    ctx.fillRect(bx, groundY - 34, 14, 14);
  }

  // ---- environment sprites (static, frame:0) ----
  // Trees at the edges — tall, behind the action
  SpriteRenderer.submit({sprite:'tree', x:W * 0.06, y:groundY, frame:0});
  SpriteRenderer.submit({sprite:'tree', x:W * 0.94, y:groundY, frame:0});

  // Streetlamps
  SpriteRenderer.submit({sprite:'streetlamp', x:W * 0.22, y:groundY + 20, frame:0});
  SpriteRenderer.submit({sprite:'streetlamp', x:W * 0.78, y:groundY + 20, frame:0});

  // Park bench (left side)
  SpriteRenderer.submit({sprite:'parkBench', x:W * 0.16, y:groundY + 60, frame:0});

  // Cafe table with chairs (right side)
  SpriteRenderer.submit({sprite:'cafeTable', x:W * 0.72, y:groundY + 50, frame:0});

  // Fence segment behind the bench area
  SpriteRenderer.submit({sprite:'fence', x:W * 0.38, y:groundY + 10, frame:0});

  // Signpost near center
  SpriteRenderer.submit({sprite:'signpost', x:W * 0.50, y:groundY + 15, frame:0});

  // Flowering bush near the cafe
  SpriteRenderer.submit({sprite:'floweringBush', x:W * 0.86, y:groundY + 30, frame:Math.floor(t * 2.5) % 4});

  // Mailbox
  SpriteRenderer.submit({sprite:'mailbox', x:W * 0.32, y:groundY + 40, frame:0});

  // Potted plant near cafe
  SpriteRenderer.submit({sprite:'pottedPlant', x:W * 0.64, y:groundY + 55, frame:0});

  // ---- animated sprites ----
  // NPCs walking through (full height, same scale as Krystal)
  SpriteRenderer.submit({sprite:'npcAdult', x:W * 0.42, y:groundY + 70, frame:Math.floor(t * 8) % 4});
  SpriteRenderer.submit({sprite:'npcChild', x:W * 0.56, y:groundY + 80, frame:Math.floor(t * 8 + 2) % 4, flipX:true});

  // Bird perched on the signpost (static until it takes off)
  const birdFlap = (t % 8 > 6.5); // flaps briefly every 8 seconds
  SpriteRenderer.submit({sprite:'bird', x:W * 0.50, y:groundY - 2, frame: birdFlap ? Math.floor(t * 6) % 4 : 1});

  // Butterfly drifting near the flowering bush
  SpriteRenderer.submit({
    sprite:'butterfly',
    x:W * 0.82 + Math.sin(t * 1.2) * 18,
    y:groundY + 20 + Math.cos(t * 1.5) * 10,
    anchorY:0.5,
    frame:Math.floor(t * 8) % 4
  });

  // Cat sitting near the cafe (mostly still, tail flicks occasionally)
  const catMove = (t % 6 > 5);
  SpriteRenderer.submit({sprite:'cat', x:W * 0.68, y:groundY + 65, frame: catMove ? Math.floor(t * 7) % 4 : 0});

  // Puppy near the bench
  const puppyMove = (t % 5 > 3.5);
  SpriteRenderer.submit({sprite:'puppy', x:W * 0.20, y:groundY + 75, frame: puppyMove ? Math.floor(t * 7) % 4 : 0});

  // Krystal — submitted as an actor so she depth-sorts with everything
  SpriteRenderer.submit({ phase:'actors', x:pet.x, y:pet.y, draw:drawPet });
}
registerScene('townsquare', drawTownSquare, true);
