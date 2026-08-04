/* scenes 3/4  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */


/* ── MAGIC SHOP (indoor · magic) ── */
function drawMagicShop(){
  const t = sceneTime, floorY = H*0.62;

  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#2a1a4a'); wall.addColorStop(1,'#3a2a5a');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  for (let i=0;i<24;i++){ const sx=(i*61+7)%W, sy=(i*37+3)%floorY; ctx.fillStyle=`rgba(255,240,180,${0.3+0.4*Math.sin(t*2+i)})`; ctx.fillRect(sx,sy,1.4,1.4); }
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#3a2a4a'); fl.addColorStop(1,'#2a1e3a');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='#f2c14e'; ctx.font='bold 13px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('✦ Magic ✦', W*0.5, H*0.09); ctx.textAlign='left';

  // crossed wands
  ctx.save(); ctx.translate(W*0.14,H*0.2); ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-14,-14); ctx.lineTo(14,14); ctx.moveTo(14,-14); ctx.lineTo(-14,14); ctx.stroke(); ctx.fillStyle='#e8dcc4'; ctx.beginPath(); ctx.arc(-14,-14,3,0,7); ctx.arc(14,-14,3,0,7); ctx.fill(); ctx.restore();

  // potion shelf
  ctx.fillStyle='#5a3a6a'; ctx.fillRect(W*0.62,H*0.16,W*0.32,4);
  const pc=['#7ac05a','#e0504a','#5a9ee0','#f2c14e','#c05fd0']; for (let i=0;i<5;i++){ const bx=W*0.66+i*W*0.06; ctx.fillStyle='rgba(220,235,240,.3)'; ctx.fillRect(bx-4,H*0.16-16,8,16); ctx.fillStyle=pc[i]; ctx.fillRect(bx-4,H*0.16-8,8,8); ctx.fillStyle='#8a6a4a'; ctx.fillRect(bx-2,H*0.16-19,4,3); }

  // table
  const cY=floorY-6; ctx.fillStyle='#4a2f5a'; ctx.fillRect(W*0.1,cY-6,W*0.8,6+(H-cY)); ctx.fillStyle='#3a2444'; ctx.fillRect(W*0.1,cY-6,W*0.8,4);

  // crystal ball
  const cbX=W*0.5, cbY=cY-6;
  ctx.fillStyle='#5a3a2a'; ctx.beginPath(); ctx.moveTo(cbX-8,cbY); ctx.lineTo(cbX+8,cbY); ctx.lineTo(cbX+5,cbY-6); ctx.lineTo(cbX-5,cbY-6); ctx.closePath(); ctx.fill();
  ctx.fillStyle=`rgba(200,150,255,${0.2+0.1*Math.sin(t*3)})`; ctx.beginPath(); ctx.arc(cbX,cbY-16,26,0,7); ctx.fill();
  const cg=ctx.createRadialGradient(cbX-3,cbY-20,2,cbX,cbY-16,16); cg.addColorStop(0,'#e0d0ff'); cg.addColorStop(0.6,`hsl(${(t*30)%360},60%,60%)`); cg.addColorStop(1,'#6a4a8a');
  ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cbX,cbY-16,16,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(cbX-5,cbY-21,3,0,7); ctx.fill();

  // top hat with rabbit
  const hX=W*0.24, hY=cY-6;
  ctx.fillStyle='#1a1a2a'; ctx.beginPath(); ctx.ellipse(hX,hY,16,4,0,0,7); ctx.fill(); ctx.fillRect(hX-11,hY-22,22,22);
  ctx.fillStyle='#8e44ad'; ctx.fillRect(hX-11,hY-8,22,3);
  ctx.fillStyle='#f0f0f0'; ctx.beginPath(); ctx.arc(hX,hY-24,6,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(hX-3,hY-32,2,6,0,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(hX+3,hY-32,2,6,0,0,7); ctx.fill();
  ctx.fillStyle='#f2a6b3'; ctx.beginPath(); ctx.arc(hX,hY-23,1.2,0,7); ctx.fill(); ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(hX-2,hY-25,1,0,7); ctx.arc(hX+2,hY-25,1,0,7); ctx.fill();

  // fanned cards
  const cdX=W*0.74, cdY=cY-6; for (let i=0;i<4;i++){ ctx.save(); ctx.translate(cdX,cdY); ctx.rotate((i-1.5)*0.25); ctx.fillStyle='#fff'; ctx.fillRect(-5,-18,10,16); ctx.fillStyle=i%2?'#c0392b':'#333'; ctx.fillRect(-3,-16,3,3); ctx.restore(); }

  // sparkles
  const span=floorY*0.6; for (let i=0;i<8;i++){ const life=(t*20+i*20)%span, sx=(i*53+20)%W, sy=floorY-30-life; ctx.fillStyle=`rgba(255,240,180,${Math.max(0,1-life/span)})`; ctx.beginPath(); ctx.arc(sx,sy,1.4,0,7); ctx.fill(); }
}
registerScene('magicshop', drawMagicShop);

/* ── FISHING DOCK AT DAWN (outdoor · calm) ── */
function drawFishingDock(){
  const t = sceneTime, waterY = H*0.42, dockY = H*0.66;

  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#5a5a8a'); sky.addColorStop(0.5,'#e08a7a'); sky.addColorStop(1,'#f2c890');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  ctx.fillStyle='rgba(255,230,170,.5)'; ctx.beginPath(); ctx.arc(W*0.7,waterY-8,24,0,7); ctx.fill();
  ctx.fillStyle='#ffe6a8'; ctx.beginPath(); ctx.arc(W*0.7,waterY-8,16,0,7); ctx.fill();
  ctx.fillStyle='#5a6a5a'; ctx.beginPath(); ctx.moveTo(0,waterY); ctx.quadraticCurveTo(W*0.3,waterY-20,W*0.6,waterY-4); ctx.quadraticCurveTo(W*0.85,waterY-16,W,waterY-2); ctx.lineTo(W,waterY); ctx.closePath(); ctx.fill();

  const water=ctx.createLinearGradient(0,waterY,0,H); water.addColorStop(0,'#c8a890'); water.addColorStop(0.3,'#8aa0b0'); water.addColorStop(1,'#5a7a8a');
  ctx.fillStyle=water; ctx.fillRect(0,waterY,W,H-waterY);
  ctx.fillStyle='rgba(255,230,170,.2)'; ctx.fillRect(W*0.66,waterY,16,H*0.3);
  ctx.fillStyle='rgba(255,255,255,.15)'; for (let i=0;i<5;i++){ ctx.beginPath(); ctx.ellipse((i*W/4+Math.sin(t*0.2+i)*10),waterY+10+((i%2)*6),40,7,0,0,7); ctx.fill(); }
  ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1; for (let i=0;i<6;i++){ const y=waterY+16+i*8; ctx.beginPath(); for (let x=0;x<=W;x+=8){ x===0?ctx.moveTo(x,y):ctx.lineTo(x,y+Math.sin(x*0.1+t+i)*1.2); } ctx.stroke(); }

  // dock
  ctx.fillStyle='#7a5a3a'; ctx.beginPath(); ctx.moveTo(W*0.3,H); ctx.lineTo(W*0.42,dockY-30); ctx.lineTo(W*0.58,dockY-30); ctx.lineTo(W*0.7,H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let i=1;i<7;i++){ const p=i/7, y=dockY-30 + p*(H-(dockY-30)), xl=W*0.42 - p*(W*0.12), xr=W*0.58 + p*(W*0.12); ctx.beginPath(); ctx.moveTo(xl,y); ctx.lineTo(xr,y); ctx.stroke(); }
  ctx.fillStyle='#5a3a1a'; ctx.fillRect(W*0.4,dockY-30,4,20); ctx.fillRect(W*0.6-4,dockY-30,4,20);

  // rowboat
  const boX=W*0.16, boY=dockY-6;
  ctx.fillStyle='#8a5a3a'; ctx.beginPath(); ctx.moveTo(boX-22,boY); ctx.quadraticCurveTo(boX,boY+10,boX+22,boY); ctx.lineTo(boX+16,boY-6); ctx.lineTo(boX-16,boY-6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(boX-16,boY-6); ctx.lineTo(boX+16,boY-6); ctx.stroke();
  ctx.strokeStyle='#7a5a3a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(boX+4,boY-4); ctx.lineTo(boX+20,boY-16); ctx.stroke();

  // fishing rod
  ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.64,dockY+10); ctx.lineTo(W*0.82,dockY-40); ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.82,dockY-40); ctx.lineTo(W*0.84,dockY-2); ctx.stroke();
}
registerScene('fishingdock', drawFishingDock);

/* ── BUTTERFLY CONSERVATORY (indoor · butterflies) ── */
function drawButterflyDome(){
  const t = sceneTime, floorY = H*0.66;

  const bg=ctx.createLinearGradient(0,0,0,floorY); bg.addColorStop(0,'#d0eede'); bg.addColorStop(1,'#b8dcc0');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,floorY);
  ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=2;
  for (let r=0.7;r>0.2;r-=0.14){ ctx.beginPath(); ctx.arc(W/2,floorY,W*r,Math.PI,0); ctx.stroke(); }
  for (let a=0;a<=6;a++){ const an=Math.PI+a/6*Math.PI; ctx.beginPath(); ctx.moveTo(W/2,floorY); ctx.lineTo(W/2+Math.cos(an)*W*0.7,floorY+Math.sin(an)*W*0.7); ctx.stroke(); }

  // plants + flowers along the floor line
  ctx.fillStyle='#3a7a3a'; for (let i=0;i<10;i++){ const px=(i*40+10)%W; for (let k=-1;k<=1;k++){ ctx.beginPath(); ctx.ellipse(px+k*8,floorY-16,5,16,k*0.3,0,7); ctx.fill(); } }
  const fc=['#e8628c','#f2c14e','#c05fd0','#ff8a5a']; for (let i=0;i<8;i++){ const fx=(i*47+20)%W; ctx.fillStyle=fc[i%4]; ctx.beginPath(); ctx.arc(fx,floorY-6,4,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(fx,floorY-6,1.5,0,7); ctx.fill(); }

  // floor + path
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#7a9a5a'); fl.addColorStop(1,'#5a7a3a');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='#b0a894'; for (const s of [[W*0.5,H*0.8,16],[W*0.44,H*0.9,18]]){ ctx.beginPath(); ctx.ellipse(s[0],s[1],s[2],s[2]*0.4,0,0,7); ctx.fill(); }

  // butterflies
  const bc=['#f2c14e','#e8628c','#5a9ee0','#ff8a5a','#c05fd0','#7ac05a'];
  for (let i=0;i<14;i++){
    const seed=i*53.7;
    const bx=(((seed*1.7 + Math.sin(t*0.6+i)*50 + t*(i%3-1)*8)%W)+W)%W;
    const by=30 + ((seed*2.3 + Math.sin(t*0.8+i*1.3)*20) % (floorY-20));
    const s=0.7+((i%3)*0.3), flap=Math.abs(Math.sin(t*10+i))*4+1;
    ctx.save(); ctx.translate(bx,by); ctx.fillStyle=bc[i%6];
    ctx.beginPath(); ctx.ellipse(-3*s,0,3*s,flap*s,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3*s,0,3*s,flap*s,0,0,7); ctx.fill();
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(-0.5,-flap*s,1,flap*2*s);
    ctx.restore();
  }
}
registerScene('butterflydome', drawButterflyDome);

/* ── SHEEP PASTURE (outdoor · countryside) ── */
function drawPasture(){
  const t = sceneTime, groundY = H*0.42;

  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#7ec0ef'); sky.addColorStop(1,'#cdeaf7');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  drawCloud(W*0.2+Math.sin(t*0.1)*8,H*0.1,0.8); drawCloud(W*0.7+Math.sin(t*0.08+2)*10,H*0.16,0.6);

  ctx.fillStyle='#8ac060'; ctx.beginPath(); ctx.moveTo(0,groundY); ctx.quadraticCurveTo(W*0.3,groundY-24,W*0.6,groundY-4); ctx.quadraticCurveTo(W*0.85,groundY-20,W,groundY-2); ctx.lineTo(W,groundY+20); ctx.lineTo(0,groundY+20); ctx.closePath(); ctx.fill();
  const g=ctx.createLinearGradient(0,groundY,0,H); g.addColorStop(0,'#7ab84a'); g.addColorStop(1,'#5a9a2a');
  ctx.fillStyle=g; ctx.fillRect(0,groundY,W,H-groundY);

  // fence
  ctx.strokeStyle='#8a6a4a'; ctx.lineWidth=3; const fY=groundY+16;
  ctx.beginPath(); ctx.moveTo(0,fY); ctx.lineTo(W,fY-4); ctx.moveTo(0,fY+8); ctx.lineTo(W,fY+4); ctx.stroke();
  for (let x=10;x<W;x+=40){ ctx.beginPath(); ctx.moveTo(x,fY-8); ctx.lineTo(x,fY+14); ctx.stroke(); }

  // distant tree
  ctx.fillStyle='#5a3a22'; ctx.fillRect(W*0.85-2,groundY-2,4,16); ctx.fillStyle='#4a8a3a'; ctx.beginPath(); ctx.arc(W*0.85,groundY-8,14,0,7); ctx.fill();

  // sheep
  function sheep(x,y,bob){
    ctx.fillStyle='#f0f0ea'; ctx.beginPath(); ctx.arc(x-6,y,7,0,7); ctx.arc(x,y-2,8,0,7); ctx.arc(x+6,y,7,0,7); ctx.arc(x,y+3,7,0,7); ctx.fill();
    ctx.fillStyle='#3a3a3a'; ctx.beginPath(); ctx.ellipse(x-11,y+bob,4,5,-0.3,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(x-14,y-3+bob,2,0,7); ctx.arc(x-10,y-4+bob,2,0,7); ctx.fill();
    ctx.strokeStyle='#3a3a3a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x-3,y+7); ctx.lineTo(x-3,y+12); ctx.moveTo(x+3,y+7); ctx.lineTo(x+3,y+12); ctx.stroke();
  }
  sheep(W*0.3,H*0.6,Math.sin(t*2)*2); sheep(W*0.55,H*0.72,0); sheep(W*0.72,H*0.62,Math.sin(t*1.5+1)*2); sheep(W*0.18,H*0.82,0); sheep(W*0.85,H*0.84,Math.sin(t*2+2)*2);
}
registerScene('pasture', drawPasture);

/* ── PERFUMERY (indoor · perfume) ── */
function drawPerfumery(){
  const floorY = H*0.62;

  ctx.fillStyle='#f4dce0'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#d4af37'; ctx.fillRect(0,floorY-26,W,3); ctx.fillRect(0,H*0.1,W,2);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#d8c0b0'); fl.addColorStop(1,'#c0a898');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  for (let r=0;r<5;r++) for (let c=0;c<10;c++){ if ((r+c)%2){ ctx.fillStyle='rgba(180,140,120,.15)'; ctx.fillRect(c*W/10,floorY+r/5*(H-floorY),W/10,(H-floorY)/5); } }

  ctx.fillStyle='#b0708a'; ctx.font='italic bold 14px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('Parfum', W*0.5, H*0.08); ctx.textAlign='left';

  function bottle(x,y,col,shape){
    ctx.fillStyle=col;
    if (shape===0){ ctx.fillRect(x-5,y-14,10,14); }
    else if (shape===1){ ctx.beginPath(); ctx.moveTo(x-6,y); ctx.lineTo(x+6,y); ctx.lineTo(x+4,y-12); ctx.lineTo(x-4,y-12); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(x,y-8,7,0,7); ctx.fill(); }
    ctx.fillStyle='#d4af37'; ctx.fillRect(x-2,y-20,4,6);
    ctx.fillStyle='rgba(200,120,150,.6)'; ctx.beginPath(); ctx.arc(x+6,y-18,3,0,7); ctx.fill();
  }
  for (let s=0;s<2;s++){ const sy=H*0.16+s*H*0.16; ctx.fillStyle='#c9a24a'; ctx.fillRect(W*0.06,sy+2,W*0.5,3);
    const cols=['#e86a9a','#f2c14e','#9a5fd0','#5a9ee0','#7ac05a','#ff8a5a']; for (let i=0;i<6;i++) bottle(W*0.1+i*W*0.075, sy, cols[(i+s)%6], (i+s)%3); }

  // vanity mirror
  const vX=W*0.82, vTop=H*0.14;
  ctx.fillStyle='#d4af37'; ctx.beginPath(); ctx.ellipse(vX,vTop+30,22,34,0,0,7); ctx.fill();
  ctx.fillStyle='#cfe0e8'; ctx.beginPath(); ctx.ellipse(vX,vTop+30,18,30,0,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.moveTo(vX-10,vTop+16); ctx.lineTo(vX-2,vTop+16); ctx.lineTo(vX-12,vTop+40); ctx.closePath(); ctx.fill();

  // counter + flowers + display bottle
  const cY=floorY-6; ctx.fillStyle='#c9a88a'; ctx.fillRect(W*0.1,cY-8,W*0.8,8+(H-cY)); ctx.fillStyle='#b0906a'; ctx.fillRect(W*0.1,cY-8,W*0.8,4);
  const flX=W*0.4, flY=cY-8;
  ctx.fillStyle='#cfe0e8'; ctx.fillRect(flX-6,flY-14,12,14);
  for (let i=-1;i<=1;i++){ ctx.strokeStyle='#3a7a3a'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(flX,flY-14); ctx.lineTo(flX+i*8,flY-30); ctx.stroke(); ctx.fillStyle=['#e86a9a','#f2c14e','#ff8a5a'][i+1]; ctx.beginPath(); ctx.arc(flX+i*8,flY-32,5,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(flX+i*8,flY-32,1.5,0,7); ctx.fill(); }
  bottle(W*0.62, cY-8, '#e86a9a', 2);
}
registerScene('perfumery', drawPerfumery);

/* ── STAINED GLASS STUDIO (indoor · making leaded-glass windows) ── */
function drawStainedGlass(){
  const t=sceneTime, floorY=H*0.62;
  // warm workshop walls + wood floor
  ctx.fillStyle='#3a3140'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#6b4a30'; ctx.fillRect(0,floorY,W,H-floorY);
  for(let i=0;i<8;i++){ ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(0,floorY+i*((H-floorY)/8),W,1); }
  // big stained-glass window on left, sun streaming colored light through it
  const wx=W*0.06, wy=H*0.08, ww=W*0.34, wh=H*0.46;
  const glass=['#e0455a','#e88a3a','#f2c94c','#4fa564','#4a86c0','#8a5fc0','#e07aa8'];
  ctx.fillStyle='#2a2028'; ctx.fillRect(wx-4,wy-4,ww+8,wh+8);
  const cols=4, rows=6, cw=ww/cols, ch=wh/rows;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const shimmer=0.75+0.25*Math.sin(t*1.5+r*0.7+c*1.1);
    ctx.globalAlpha=shimmer; ctx.fillStyle=glass[(r*cols+c+((r%2)?2:0))%glass.length];
    ctx.fillRect(wx+c*cw+1,wy+r*ch+1,cw-2,ch-2); ctx.globalAlpha=1;
  }
  // lead came grid
  ctx.strokeStyle='#1a141c'; ctx.lineWidth=2;
  for(let c=0;c<=cols;c++){ ctx.beginPath(); ctx.moveTo(wx+c*cw,wy); ctx.lineTo(wx+c*cw,wy+wh); ctx.stroke(); }
  for(let r=0;r<=rows;r++){ ctx.beginPath(); ctx.moveTo(wx,wy+r*ch); ctx.lineTo(wx+ww,wy+r*ch); ctx.stroke(); }
  // colored light pools cast on the floor
  for(let i=0;i<5;i++){ ctx.globalAlpha=0.18; ctx.fillStyle=glass[i%glass.length];
    ctx.beginPath(); ctx.ellipse(wx+ww+20+i*26, floorY+18+ (i%2)*10, 22,9,0,0,7); ctx.fill(); ctx.globalAlpha=1; }
  // workbench on the right
  const bx=W*0.5, bw=W*0.44, by=floorY-4;
  ctx.fillStyle='#7a5638'; ctx.fillRect(bx,by-6,bw,H-by+6);
  ctx.fillStyle='#8a6444'; ctx.fillRect(bx,by-6,bw,5);
  // a small stained panel in progress on the bench (butterfly-ish)
  const px=bx+W*0.06, py=by-40;
  ctx.fillStyle='#2a2028'; ctx.fillRect(px-2,py-2,54,38);
  const pcol=['#e0455a','#f2c94c','#4a86c0','#8a5fc0','#4fa564'];
  for(let i=0;i<10;i++){ ctx.fillStyle=pcol[i%pcol.length];
    ctx.fillRect(px+ (i%5)*10, py+ (i<5?0:18), 9,17); }
  ctx.strokeStyle='#1a141c'; ctx.lineWidth=1.5; ctx.strokeRect(px-2,py-2,54,38);
  // tools: soldering iron with a glowing tip + spools
  const ix=bx+W*0.3, iy=by-8;
  ctx.strokeStyle='#555'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(ix,iy); ctx.lineTo(ix+22,iy-16); ctx.stroke();
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(ix+18,iy-20,10,6);
  const glow=0.5+0.5*Math.abs(Math.sin(t*3));
  ctx.globalAlpha=glow; ctx.fillStyle='#ff8a3a'; ctx.beginPath(); ctx.arc(ix,iy,3.5,0,7); ctx.fill();
  ctx.globalAlpha=glow*0.4; ctx.beginPath(); ctx.arc(ix,iy,7,0,7); ctx.fill(); ctx.globalAlpha=1;
  // solder spool
  ctx.fillStyle='#b8b8c0'; ctx.beginPath(); ctx.arc(bx+W*0.38,by-10,7,0,7); ctx.fill();
  ctx.fillStyle='#7a5638'; ctx.beginPath(); ctx.arc(bx+W*0.38,by-10,2.5,0,7); ctx.fill();
  // glass sheets leaning against the bench
  for(let i=0;i<4;i++){ ctx.globalAlpha=0.55; ctx.fillStyle=glass[(i*2)%glass.length];
    ctx.beginPath(); ctx.moveTo(bx+6+i*7,by-6); ctx.lineTo(bx+18+i*7,by-6); ctx.lineTo(bx+22+i*7,by-52); ctx.lineTo(bx+10+i*7,by-52); ctx.closePath(); ctx.fill(); ctx.globalAlpha=1; }
  // hanging finished sun-catcher, gently swaying
  const sway=Math.sin(t*1.1)*6;
  const scx=W*0.5+sway, scy=H*0.16;
  ctx.strokeStyle='#666'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.5,H*0.05); ctx.lineTo(scx,scy); ctx.stroke();
  for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; ctx.globalAlpha=0.85; ctx.fillStyle=glass[k];
    ctx.beginPath(); ctx.arc(scx+Math.cos(a)*8, scy+Math.sin(a)*8, 5,0,7); ctx.fill(); ctx.globalAlpha=1; }
  ctx.fillStyle='#f2c94c'; ctx.beginPath(); ctx.arc(scx,scy,4,0,7); ctx.fill();
}
registerScene('stainedglass', drawStainedGlass);

/* ── APPLE ORCHARD (outdoor · autumn harvest) ── */
function drawOrchard(){
  const t=sceneTime, groundY=H*0.64;
  // soft dawn sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#bfe0ea'); sky.addColorStop(1,'#eef6d8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // low sun
  ctx.fillStyle='rgba(255,240,190,.8)'; ctx.beginPath(); ctx.arc(W*0.82,H*0.16,26,0,7); ctx.fill();
  // rolling grass
  ctx.fillStyle='#7ba84a'; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#6b9840'; ctx.beginPath(); ctx.moveTo(0,groundY); ctx.quadraticCurveTo(W*0.5,groundY-14,W,groundY); ctx.lineTo(W,groundY+8); ctx.lineTo(0,groundY+8); ctx.fill();
  // rows of apple trees, back row smaller/hazier
  function tree(x,y,s,hazy){
    ctx.save();
    if(hazy) ctx.globalAlpha=0.7;
    // trunk
    ctx.fillStyle='#7a5230'; ctx.fillRect(x-3*s,y-26*s,6*s,26*s);
    // canopy
    ctx.fillStyle=hazy?'#5f8a3e':'#4f8a3a';
    ctx.beginPath(); ctx.arc(x,y-34*s,20*s,0,7); ctx.fill();
    ctx.fillStyle=hazy?'#6f9a48':'#5f9a44';
    ctx.beginPath(); ctx.arc(x-10*s,y-30*s,13*s,0,7); ctx.arc(x+11*s,y-30*s,13*s,0,7); ctx.fill();
    // apples
    if(!hazy){ for(let i=0;i<7;i++){ const a=i*1.3+ x; ctx.fillStyle= i%3? '#e0402a':'#e88a2a';
      ctx.beginPath(); ctx.arc(x+Math.cos(a)*15*s, y-34*s+Math.sin(a*1.7)*13*s, 2.6*s,0,7); ctx.fill(); } }
    ctx.restore();
  }
  // back row
  for(let i=0;i<5;i++) tree(W*0.1+i*W*0.2, groundY+6, 0.6, true);
  // front row
  for(let i=0;i<3;i++) tree(W*0.2+i*W*0.32, groundY+30, 1.0, false);
  // wooden ladder leaning on the middle tree
  const lx=W*0.2+1*W*0.32 - 26, ly=groundY+30;
  ctx.strokeStyle='#b08a4a'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx+14,ly-56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lx+8,ly); ctx.lineTo(lx+22,ly-56); ctx.stroke();
  for(let r=0;r<5;r++){ const ry=ly-8-r*11; ctx.beginPath(); ctx.moveTo(lx+ (r*2.4),ry); ctx.lineTo(lx+8+(r*2.4),ry); ctx.stroke(); }
  // baskets of apples in the foreground
  function basket(x,y){
    ctx.fillStyle='#a5723c'; ctx.beginPath(); ctx.moveTo(x-14,y); ctx.lineTo(x+14,y); ctx.lineTo(x+11,y+14); ctx.lineTo(x-11,y+14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#7a5228'; ctx.lineWidth=1; for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(x+i*6,y); ctx.lineTo(x+i*5,y+14); ctx.stroke(); }
    for(let i=0;i<6;i++){ ctx.fillStyle= i%2?'#e0402a':'#e88a2a'; ctx.beginPath(); ctx.arc(x-9+i*3.6, y-2+ (i%2)*3, 4,0,7); ctx.fill(); }
  }
  basket(W*0.16, H*0.86); basket(W*0.86, H*0.9);
  // a few apples fallen in the grass
  for(let i=0;i<6;i++){ ctx.fillStyle='#d0381f'; ctx.beginPath(); ctx.arc(W*0.3+i*W*0.09, groundY+ (H-groundY)*0.5 + (i%2)*10, 3.2,0,7); ctx.fill(); }
  // gentle falling leaf
  const lf=(t*20)%(H*0.5); ctx.fillStyle='#d98a2a';
  ctx.beginPath(); ctx.ellipse(W*0.5+Math.sin(t*2)*18, H*0.2+lf, 4,2, t, 0,7); ctx.fill();
}
registerScene('orchard', drawOrchard);

/* ── CANDLE WORKSHOP (indoor · hand-dipped candle making) ── */
function drawCandleShop(){
  const t=sceneTime, floorY=H*0.63;
  // warm amber walls, stone floor
  ctx.fillStyle='#4a3428'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#6a5240'; ctx.fillRect(0,floorY,W,H-floorY);
  for(let i=0;i<10;i++){ ctx.fillStyle='rgba(0,0,0,.1)'; ctx.fillRect((i*37)%W, floorY+ (i*13)%(H-floorY),18,1); }
  // warm glow wash from candles
  const glow=ctx.createRadialGradient(W*0.5,floorY,10,W*0.5,floorY,W*0.7);
  glow.addColorStop(0,'rgba(255,190,90,.25)'); glow.addColorStop(1,'rgba(255,190,90,0)');
  ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
  // helper: a lit candle
  function candle(x,y,h,w,flick){
    ctx.fillStyle='#f0e2c0'; ctx.fillRect(x-w/2,y-h,w,h);
    ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(x+w/2-2,y-h,2,h);
    // wick
    ctx.strokeStyle='#333'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,y-h); ctx.lineTo(x,y-h-3); ctx.stroke();
    // flame
    const f=1+0.2*Math.sin(t*8+flick);
    ctx.fillStyle='rgba(255,150,40,.6)'; ctx.beginPath(); ctx.ellipse(x,y-h-6,4*f,7*f,0,0,7); ctx.fill();
    ctx.fillStyle='#ffd86a'; ctx.beginPath(); ctx.ellipse(x,y-h-5,2*f,4*f,0,0,7); ctx.fill();
  }
  // wall shelf with rows of finished candles
  for(let s=0;s<2;s++){ const sy=H*0.14+s*H*0.15;
    ctx.fillStyle='#3a2a1e'; ctx.fillRect(W*0.05,sy+2,W*0.5,4);
    const cols=['#e8c8a0','#d8a878','#e0b890','#c89868','#eac8b0'];
    for(let i=0;i<7;i++){ const cx=W*0.09+i*W*0.065, ch=10+((i*3+s)%4)*4;
      ctx.fillStyle=cols[i%cols.length]; ctx.fillRect(cx-3,sy-ch+2,6,ch); }
  }
  // dipping rack — candles hanging by wicks from a horizontal bar, being dipped
  const rx=W*0.62, ry=H*0.16;
  ctx.strokeStyle='#5a4028'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(rx,ry); ctx.lineTo(W*0.95,ry); ctx.stroke();
  const dip=Math.sin(t*0.8)*10; // rack gently rises/lowers
  for(let i=0;i<5;i++){ const hx=rx+8+i*W*0.06;
    ctx.strokeStyle='#333'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(hx,ry); ctx.lineTo(hx,ry+18+dip); ctx.stroke();
    ctx.fillStyle='#e0b890'; ctx.fillRect(hx-2.5,ry+18+dip,5,26); }
  // wax vat below the rack, steaming
  const vx=rx+W*0.14, vy=floorY-6;
  ctx.fillStyle='#3a2418'; ctx.fillRect(vx-34,vy-24,68,24+(H-vy));
  ctx.fillStyle='#c98a3a'; ctx.fillRect(vx-30,vy-20,60,8); // molten wax surface
  ctx.fillStyle='rgba(230,170,90,.5)'; ctx.fillRect(vx-30,vy-20,60,3);
  for(let i=0;i<3;i++){ ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=2;
    const sxx=vx-16+i*16, ph=t*1.5+i; ctx.beginPath();
    ctx.moveTo(sxx,vy-20); ctx.quadraticCurveTo(sxx+Math.sin(ph)*6, vy-38, sxx+Math.sin(ph)*3, vy-54); ctx.stroke(); }
  // worktable on the left with molds and a lit sample candle
  const tx=W*0.08, ty=floorY-4;
  ctx.fillStyle='#6a4a30'; ctx.fillRect(tx,ty-8,W*0.42,8+(H-ty));
  ctx.fillStyle='#7a5638'; ctx.fillRect(tx,ty-8,W*0.42,4);
  // metal molds
  for(let i=0;i<3;i++){ ctx.fillStyle='#9aa0a8'; ctx.fillRect(tx+10+i*22, ty-26,12,18);
    ctx.fillStyle='#7a8088'; ctx.fillRect(tx+10+i*22, ty-26,12,3); }
  candle(tx+W*0.34, ty-8, 22, 8, 0);
  candle(tx+W*0.28, ty-8, 14, 6, 2.1);
  // a couple of pillar candles on the floor, lit
  candle(W*0.5, H-6, 30, 12, 1.0);
  candle(W*0.5+22, H-6, 20, 9, 3.3);
}
registerScene('candleshop', drawCandleShop);

/* ── WINDMILL (outdoor · countryside, turning sails) ── */
function drawWindmill(){
  const t=sceneTime, groundY=H*0.66;
  // breezy sky with drifting clouds
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#8fc4e8'); sky.addColorStop(1,'#d8ecf4');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  for(let i=0;i<3;i++){ const cx=((t*8+i*140)%(W+120))-60, cy=H*0.12+i*H*0.09;
    ctx.fillStyle='rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(cx,cy,14,0,7); ctx.arc(cx+16,cy+4,11,0,7); ctx.arc(cx-14,cy+4,10,0,7); ctx.arc(cx+4,cy-6,10,0,7); ctx.fill(); }
  // green fields with a path
  ctx.fillStyle='#7bb04a'; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#6aa03e'; ctx.beginPath(); ctx.moveTo(0,groundY+20); ctx.quadraticCurveTo(W*0.5,groundY+6,W,groundY+24); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fill();
  // dirt path curving to the mill
  ctx.fillStyle='#c8a86a'; ctx.beginPath(); ctx.moveTo(W*0.42,H); ctx.lineTo(W*0.5,H); ctx.lineTo(W*0.5,groundY+8); ctx.lineTo(W*0.47,groundY+8); ctx.closePath(); ctx.fill();
  // tulip stripes in the field
  const tc=['#e0455a','#f2c94c','#e88a3a','#d84a8a'];
  for(let r=0;r<3;r++){ const ry=groundY+30+r*22; for(let i=0;i<9;i++){ ctx.fillStyle=tc[(i+r)%4];
    ctx.fillRect(W*0.05+i*W*0.1, ry, 5,5); ctx.fillStyle='#3a7a3a'; ctx.fillRect(W*0.05+i*W*0.1+2, ry+5, 1,6); } }
  // the mill body (tapered tower)
  const mx=W*0.7, baseY=groundY+6, topY=H*0.2;
  ctx.fillStyle='#e6e0d4'; ctx.beginPath(); ctx.moveTo(mx-30,baseY); ctx.lineTo(mx+30,baseY); ctx.lineTo(mx+18,topY); ctx.lineTo(mx-18,topY); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#d0c8b8'; ctx.fillRect(mx-30,baseY-4,60,4);
  // brick stripes
  ctx.strokeStyle='rgba(150,120,90,.4)'; ctx.lineWidth=1;
  for(let i=1;i<5;i++){ const yy=topY+(baseY-topY)*i/5, hw=18+(30-18)*i/5; ctx.beginPath(); ctx.moveTo(mx-hw,yy); ctx.lineTo(mx+hw,yy); ctx.stroke(); }
  // door + windows
  ctx.fillStyle='#7a5230'; ctx.fillRect(mx-8,baseY-26,16,26);
  ctx.fillStyle='#8fbcd8'; ctx.fillRect(mx-6,topY+18,12,12); ctx.strokeStyle='#5a4028'; ctx.lineWidth=1; ctx.strokeRect(mx-6,topY+18,12,12);
  // conical cap
  ctx.fillStyle='#8a4a30'; ctx.beginPath(); ctx.moveTo(mx-22,topY+2); ctx.lineTo(mx+22,topY+2); ctx.lineTo(mx,topY-24); ctx.closePath(); ctx.fill();
  // rotating sails
  const hubX=mx, hubY=topY+8, rot=t*0.9;
  for(let b=0;b<4;b++){ const a=rot+b*Math.PI/2;
    const ex=hubX+Math.cos(a)*52, ey=hubY+Math.sin(a)*52;
    // arm
    ctx.strokeStyle='#5a4028'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(hubX,hubY); ctx.lineTo(ex,ey); ctx.stroke();
    // sail cloth (offset rectangle along the arm)
    const px=-Math.sin(a), py=Math.cos(a);
    ctx.fillStyle='rgba(245,240,225,.9)';
    ctx.beginPath();
    ctx.moveTo(hubX+Math.cos(a)*14, hubY+Math.sin(a)*14);
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex+px*11, ey+py*11);
    ctx.lineTo(hubX+Math.cos(a)*14+px*9, hubY+Math.sin(a)*14+py*9);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#c8b89a'; ctx.lineWidth=1; ctx.stroke();
  }
  ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.arc(hubX,hubY,5,0,7); ctx.fill();
  // a couple of geese wandering the path
  for(let i=0;i<2;i++){ const gx=W*0.46+Math.sin(t*0.6+i*2)*4, gy=H*0.9+i*14;
    ctx.fillStyle='#f4f4f0'; ctx.beginPath(); ctx.ellipse(gx,gy,7,4,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.arc(gx+6,gy-4,3,0,7); ctx.fill();
    ctx.fillStyle='#e0902a'; ctx.beginPath(); ctx.moveTo(gx+8,gy-4); ctx.lineTo(gx+12,gy-3); ctx.lineTo(gx+8,gy-2); ctx.fill(); }
}
registerScene('windmill', drawWindmill);

/* ── BLACKSMITH FORGE (indoor · working the anvil) ── */
function drawForge(){
  const t=sceneTime, floorY=H*0.64;
  // dark sooty workshop
  ctx.fillStyle='#241d1a'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#3a3230'; ctx.fillRect(0,floorY,W,H-floorY);
  for(let i=0;i<12;i++){ ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect((i*61)%W, floorY+ (i*17)%(H-floorY),24,2); }
  // forge glow bathing the room
  const flick=0.75+0.25*Math.sin(t*7)+0.1*Math.sin(t*13);
  const wash=ctx.createRadialGradient(W*0.24,floorY-20,10,W*0.24,floorY-20,W*0.8);
  wash.addColorStop(0,`rgba(255,140,40,${0.3*flick})`); wash.addColorStop(1,'rgba(255,140,40,0)');
  ctx.fillStyle=wash; ctx.fillRect(0,0,W,H);
  // stone forge hearth on the left with chimney hood
  const fx=W*0.24, fy=floorY-6;
  ctx.fillStyle='#4a4038'; ctx.fillRect(fx-46,fy-40,92,40+(H-fy));
  ctx.fillStyle='#5a4e44'; ctx.fillRect(fx-46,fy-40,92,6);
  // hood
  ctx.fillStyle='#2e2824'; ctx.beginPath(); ctx.moveTo(fx-40,fy-40); ctx.lineTo(fx+40,fy-40); ctx.lineTo(fx+16,H*0.14); ctx.lineTo(fx-16,H*0.14); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a332e'; ctx.fillRect(fx-14,H*0.1,28,H*0.05);
  // glowing coal bed
  const cbg=ctx.createRadialGradient(fx,fy-30,2,fx,fy-30,34);
  cbg.addColorStop(0,`rgba(255,230,140,${flick})`); cbg.addColorStop(0.5,'#ff6a1a'); cbg.addColorStop(1,'#7a2408');
  ctx.fillStyle=cbg; ctx.beginPath(); ctx.ellipse(fx,fy-28,34,12,0,0,7); ctx.fill();
  // embers rising from the coals
  for(let i=0;i<10;i++){ const life=(t*40+i*37)%80, ex=fx-24+((i*53)%48), ey=fy-28-life;
    ctx.globalAlpha=Math.max(0,1-life/80); ctx.fillStyle= i%2?'#ffcf6a':'#ff8a3a';
    ctx.fillRect(ex+Math.sin(life*0.2+i)*3, ey, 2,2); ctx.globalAlpha=1; }
  // anvil on a stump, center-right
  const ax=W*0.6, ay=floorY+6;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(ax-14,ay-20,28,20+(H-ay)); // stump
  ctx.fillStyle='#4a4a52'; // anvil body
  ctx.beginPath(); ctx.moveTo(ax-20,ay-40); ctx.lineTo(ax+18,ay-40); ctx.lineTo(ax+30,ay-34); ctx.lineTo(ax+18,ay-30);
  ctx.lineTo(ax+12,ay-30); ctx.lineTo(ax+10,ay-22); ctx.lineTo(ax-12,ay-22); ctx.lineTo(ax-14,ay-30); ctx.lineTo(ax-20,ay-30); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#5a5a62'; ctx.fillRect(ax-20,ay-40,38,3);
  // hot workpiece on the anvil (glowing bar)
  const heat=0.6+0.4*Math.sin(t*4);
  ctx.fillStyle=`rgba(255,${120+80*heat},40,1)`; ctx.fillRect(ax-6,ay-44,20,4);
  ctx.globalAlpha=0.5*heat; ctx.fillStyle='#fff0a0'; ctx.fillRect(ax+6,ay-44,8,4); ctx.globalAlpha=1;
  // swinging hammer (arm hinges above the anvil)
  const swing=Math.sin(t*4); // strike when swing near bottom
  const hang=H*0.28, hAng=-0.5+0.9*Math.max(0,swing);
  const hx=ax+8, hy=hang;
  const hox=hx+Math.sin(hAng)*46, hoy=hy+Math.cos(hAng)*46;
  ctx.strokeStyle='#7a5230'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hox,hoy); ctx.stroke();
  ctx.fillStyle='#5a5a62'; ctx.save(); ctx.translate(hox,hoy); ctx.rotate(hAng); ctx.fillRect(-9,-6,18,10); ctx.restore();
  // sparks fly on the downstroke
  if(swing>0.85){ for(let i=0;i<8;i++){ const a=-Math.PI/2+ (i-4)*0.28, sp=6+((i*7)%12);
    ctx.strokeStyle= i%2?'#ffd86a':'#ff8a3a'; ctx.lineWidth=1.5; ctx.beginPath();
    ctx.moveTo(ax+4,ay-44); ctx.lineTo(ax+4+Math.cos(a)*sp, ay-44+Math.sin(a)*sp); ctx.stroke(); } }
  // tool rack on the back wall
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(W*0.78,H*0.16,4,H*0.3);
  const tools=['#6a6a72','#5a4030','#6a6a72'];
  for(let i=0;i<3;i++){ ctx.strokeStyle=tools[i]; ctx.lineWidth=3; ctx.beginPath();
    ctx.moveTo(W*0.82+i*W*0.05,H*0.18); ctx.lineTo(W*0.82+i*W*0.05,H*0.18+ 40+i*8); ctx.stroke();
    ctx.fillStyle=tools[i]; ctx.fillRect(W*0.82+i*W*0.05-4, H*0.18+40+i*8, 8,6); }
  // quench bucket by the anvil
  ctx.fillStyle='#2e2824'; ctx.beginPath(); ctx.moveTo(ax+34,floorY+4); ctx.lineTo(ax+52,floorY+4); ctx.lineTo(ax+48,floorY+24); ctx.lineTo(ax+38,floorY+24); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a5a6a'; ctx.beginPath(); ctx.ellipse(ax+43,floorY+5,9,3,0,0,7); ctx.fill();
}
registerScene('forge', drawForge);

/* ── HOT SPRING (outdoor · steaming onsen in snowy rocks, dusk) ── */
function drawHotSpring(){
  const t=sceneTime, waterY=H*0.5;
  // dusk mountain sky
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#3a4a6a'); sky.addColorStop(1,'#c58a7a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  // a few early stars
  for(let i=0;i<14;i++){ ctx.fillStyle=`rgba(255,255,255,${0.3+0.3*Math.sin(t*2+i)})`; ctx.fillRect((i*53+7)%W, (i*29)%(H*0.28), 1.5,1.5); }
  // snowy mountains behind
  ctx.fillStyle='#8a94b0'; ctx.beginPath(); ctx.moveTo(0,waterY); ctx.lineTo(W*0.22,H*0.2); ctx.lineTo(W*0.42,waterY); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#9aa4c0'; ctx.beginPath(); ctx.moveTo(W*0.3,waterY); ctx.lineTo(W*0.58,H*0.16); ctx.lineTo(W*0.86,waterY); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#eef2f8'; // snow caps
  ctx.beginPath(); ctx.moveTo(W*0.22,H*0.2); ctx.lineTo(W*0.16,H*0.28); ctx.lineTo(W*0.28,H*0.28); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W*0.58,H*0.16); ctx.lineTo(W*0.5,H*0.25); ctx.lineTo(W*0.66,H*0.25); ctx.closePath(); ctx.fill();
  // snowy far bank
  ctx.fillStyle='#e8eef6'; ctx.fillRect(0,waterY-10,W,14);
  // the hot spring pool (teal, warm)
  const pool=ctx.createLinearGradient(0,waterY,0,H); pool.addColorStop(0,'#4fa9a8'); pool.addColorStop(1,'#2e6f74');
  ctx.fillStyle=pool; ctx.fillRect(0,waterY,W,H-waterY);
  // gentle ripples
  for(let i=0;i<6;i++){ const ry=waterY+14+i*((H-waterY)/6); ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1.5;
    ctx.beginPath(); for(let x=0;x<=W;x+=8){ const yy=ry+Math.sin(x*0.05+t*1.5+i)*2; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // snow-dusted rocks ringing the pool
  function rock(x,y,w,h){ ctx.fillStyle='#565660'; ctx.beginPath(); ctx.ellipse(x,y,w,h,0,Math.PI,0); ctx.fill();
    ctx.fillStyle='#eef2f8'; ctx.beginPath(); ctx.ellipse(x,y-h*0.5,w*0.9,h*0.4,0,Math.PI,0); ctx.fill(); }
  rock(W*0.12,waterY+4,26,16); rock(W*0.4,waterY+2,30,14); rock(W*0.72,waterY+5,28,16); rock(W*0.94,waterY+3,24,14);
  // small stone lantern on the near bank
  const lx=W*0.85, ly=waterY+2;
  ctx.fillStyle='#6a6a6a'; ctx.fillRect(lx-3,ly-2,6,4); ctx.fillRect(lx-6,ly-14,12,10);
  ctx.fillStyle='#ffd98a'; ctx.fillRect(lx-4,ly-13,8,8);
  ctx.fillStyle='#555'; ctx.beginPath(); ctx.moveTo(lx-8,ly-14); ctx.lineTo(lx+8,ly-14); ctx.lineTo(lx,ly-22); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(255,210,120,.25)'; ctx.beginPath(); ctx.arc(lx,ly-9,14,0,7); ctx.fill();
  // rising steam wisps off the water
  for(let i=0;i<7;i++){ const sx=W*0.1+i*W*0.13, base=waterY+18+(i%2)*10;
    ctx.strokeStyle=`rgba(255,255,255,${0.12+0.06*Math.sin(t+i)})`; ctx.lineWidth=6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(sx,base);
    for(let k=1;k<=4;k++){ const ph=t*1.2+i+k; ctx.lineTo(sx+Math.sin(ph)*10, base-k*22); }
    ctx.stroke(); }
  ctx.lineCap='butt';
  // gentle snowfall
  for(let i=0;i<24;i++){ const sxx=(i*47+ t*14)%W, syy=(i*31+ t*22)%waterY;
    ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillRect(sxx, syy, 2,2); }
  // a floating wooden tray with a teacup
  const trX=W*0.28+Math.sin(t*1.2)*4, trY=H*0.72;
  ctx.fillStyle='#8a5a34'; ctx.fillRect(trX-12,trY,24,5);
  ctx.fillStyle='#e8e0d0'; ctx.fillRect(trX-3,trY-6,6,6);
  ctx.strokeStyle='rgba(255,255,255,.2)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(trX,trY-6); ctx.quadraticCurveTo(trX+4,trY-14,trX,trY-20); ctx.stroke();
}
registerScene('hotspring', drawHotSpring);

/* ── CINEMA (indoor · a movie playing in a small theater) ── */
function drawCinema(){
  const t=sceneTime, floorY=H*0.7;
  // dark auditorium
  ctx.fillStyle='#12100f'; ctx.fillRect(0,0,W,H);
  // side walls with warm sconces
  ctx.fillStyle='#2a1a1e'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.12,H*0.14); ctx.lineTo(W*0.12,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W,0); ctx.lineTo(W*0.88,H*0.14); ctx.lineTo(W*0.88,H); ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
  for(let i=0;i<3;i++){ const wy=H*0.22+i*H*0.18; const g=0.5+0.15*Math.sin(t*3+i);
    ctx.fillStyle=`rgba(255,180,90,${g})`; ctx.beginPath(); ctx.arc(W*0.06,wy,4,0,7); ctx.fill();
    ctx.beginPath(); ctx.arc(W*0.94,wy,4,0,7); ctx.fill(); }
  // the screen — flickering film content
  const sx=W*0.16, sy=H*0.1, sw=W*0.68, sh=H*0.42;
  ctx.fillStyle='#000'; ctx.fillRect(sx-4,sy-4,sw+8,sh+8);
  // build a shifting scene on the screen (sky gradient + rolling hills + a "sun")
  const hue=0.5+0.5*Math.sin(t*0.4);
  const sc=ctx.createLinearGradient(0,sy,0,sy+sh);
  sc.addColorStop(0,`rgb(${120+80*hue},${150},${200-60*hue})`); sc.addColorStop(1,`rgb(${240},${200-40*hue},${140})`);
  ctx.fillStyle=sc; ctx.fillRect(sx,sy,sw,sh);
  ctx.fillStyle='rgba(255,250,210,.9)'; ctx.beginPath(); ctx.arc(sx+sw*0.5+Math.sin(t*0.5)*sw*0.3, sy+sh*0.35, 16,0,7); ctx.fill();
  ctx.fillStyle='#3f7a4a'; ctx.beginPath(); ctx.moveTo(sx,sy+sh);
  for(let x=0;x<=sw;x+=10){ ctx.lineTo(sx+x, sy+sh*0.68+Math.sin(x*0.03+t)*8); } ctx.lineTo(sx+sw,sy+sh); ctx.closePath(); ctx.fill();
  // a little silhouette figure walking across the film
  const fxp=sx+ ((t*30)%(sw+40))-20;
  ctx.fillStyle='#1a2a1a'; ctx.fillRect(fxp,sy+sh*0.68-10,4,10);
  // film grain flicker overlay
  ctx.globalAlpha=0.06+0.05*Math.abs(Math.sin(t*20)); ctx.fillStyle='#fff'; ctx.fillRect(sx,sy,sw,sh); ctx.globalAlpha=1;
  for(let i=0;i<8;i++){ ctx.globalAlpha=0.05; ctx.fillStyle='#000'; ctx.fillRect(sx+((i*97+t*40)%sw), sy+((i*53)%sh), 1, sh*0.1); ctx.globalAlpha=1; }
  // projector beam from the back (top) widening to the screen
  ctx.save(); ctx.globalAlpha=0.06; ctx.fillStyle='#fff8e0';
  ctx.beginPath(); ctx.moveTo(W*0.5-6,H); ctx.lineTo(W*0.5+6,H); ctx.lineTo(sx+sw,sy+sh); ctx.lineTo(sx,sy+sh); ctx.closePath(); ctx.fill(); ctx.restore();
  // rows of seat silhouettes (foreground), lit faintly by the screen
  for(let r=0;r<3;r++){ const ry=floorY+r*((H-floorY)/3)+6, seatH=16+r*6;
    for(let c=0;c<7;c++){ const cx=W*0.12+c*W*0.11 + (r*W*0.03);
      ctx.fillStyle=`rgb(${30+r*6},${14+r*4},${20+r*4})`;
      ctx.beginPath(); ctx.moveTo(cx-10,ry+seatH); ctx.lineTo(cx-10,ry+4); ctx.quadraticCurveTo(cx,ry-4,cx+10,ry+4); ctx.lineTo(cx+10,ry+seatH); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(120,150,190,.06)'; ctx.fillRect(cx-10,ry+2,20,3); } }
  // aisle floor lights
  for(let i=0;i<5;i++){ ctx.fillStyle='rgba(255,160,80,.5)'; ctx.fillRect(W*0.13, floorY+8+i*((H-floorY)/5), 3,2); ctx.fillRect(W*0.85, floorY+8+i*((H-floorY)/5), 3,2); }
}
registerScene('cinema', drawCinema);

/* ── MARINA (outdoor · sailboats at sunset) ── */
function drawMarina(){
  const t=sceneTime, waterY=H*0.52;
  // sunset sky
  const sky=ctx.createLinearGradient(0,0,0,waterY);
  sky.addColorStop(0,'#f4a24a'); sky.addColorStop(0.5,'#f2c37a'); sky.addColorStop(1,'#f6e0b0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  // low sun
  const sunX=W*0.5, sunY=waterY-10;
  ctx.fillStyle='#ffd97a'; ctx.beginPath(); ctx.arc(sunX,sunY,30,0,7); ctx.fill();
  ctx.globalAlpha=0.3; ctx.beginPath(); ctx.arc(sunX,sunY,44,0,7); ctx.fill(); ctx.globalAlpha=1;
  // hazy far shoreline
  ctx.fillStyle='#c9946a'; ctx.fillRect(0,waterY-8,W,8);
  ctx.fillStyle='rgba(120,90,110,.4)'; for(let i=0;i<6;i++){ ctx.fillRect(W*0.1*i, waterY-8-((i*13)%10), 40, (i*13)%10+2); }
  // harbor water
  const water=ctx.createLinearGradient(0,waterY,0,H); water.addColorStop(0,'#c98a5a'); water.addColorStop(1,'#4a6a8a');
  ctx.fillStyle=water; ctx.fillRect(0,waterY,W,H-waterY);
  // sun glitter path
  for(let i=0;i<12;i++){ const gy=waterY+6+i*((H-waterY)/12); const wob=Math.sin(t*2+i)*8;
    ctx.fillStyle='rgba(255,220,150,.5)'; ctx.fillRect(sunX-10+wob, gy, 20-i, 2); }
  // ripple lines
  for(let i=0;i<7;i++){ const ry=waterY+16+i*((H-waterY)/7); ctx.strokeStyle='rgba(255,255,255,.1)'; ctx.lineWidth=1.5;
    ctx.beginPath(); for(let x=0;x<=W;x+=8){ const yy=ry+Math.sin(x*0.05+t*1.4+i)*2; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // a sailboat (hull + mast + sails), bobbing + reflection
  function boat(x,y,s,sailA,sailB,bob){
    const by=y+Math.sin(t*1.3+bob)*3, tilt=Math.sin(t*1.3+bob)*0.04;
    ctx.save(); ctx.translate(x,by); ctx.rotate(tilt);
    // reflection
    ctx.save(); ctx.globalAlpha=0.22; ctx.scale(1,-1); ctx.translate(0,-4);
    ctx.fillStyle=sailA; ctx.beginPath(); ctx.moveTo(0,-4); ctx.lineTo(-14*s,-4); ctx.lineTo(-2*s,-40*s); ctx.closePath(); ctx.fill();
    ctx.restore();
    // hull
    ctx.fillStyle='#7a4a2a'; ctx.beginPath(); ctx.moveTo(-20*s,0); ctx.lineTo(20*s,0); ctx.lineTo(13*s,10*s); ctx.lineTo(-13*s,10*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#8a5a34'; ctx.fillRect(-20*s,-2,40*s,3);
    // mast
    ctx.strokeStyle='#5a4028'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-44*s); ctx.stroke();
    // sails
    ctx.fillStyle=sailA; ctx.beginPath(); ctx.moveTo(-1,-2); ctx.lineTo(-16*s,-2); ctx.lineTo(-2,-40*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle=sailB; ctx.beginPath(); ctx.moveTo(1,-4); ctx.lineTo(13*s,-2); ctx.lineTo(2,-42*s); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  boat(W*0.2, waterY+28, 1.0, '#f2f0e8','#e8dcc4', 0);
  boat(W*0.78, waterY+22, 0.85, '#e8eef4','#cfe0e8', 1.4);
  boat(W*0.5, waterY+52, 1.15, '#f6ece0','#e0c8a8', 2.6);
  // wooden dock jutting from foreground-left with pilings
  ctx.fillStyle='#6a4a2e'; ctx.fillRect(0,H*0.82,W*0.34,10);
  ctx.fillStyle='#7a5636'; ctx.fillRect(0,H*0.82,W*0.34,3);
  for(let i=0;i<4;i++){ ctx.fillStyle='#4a3320'; ctx.fillRect(W*0.06+i*W*0.08, H*0.82+10, 4, H*0.18-10); }
  // a couple of gulls
  for(let i=0;i<3;i++){ const gx=W*0.2+i*W*0.28+Math.sin(t*0.7+i)*10, gy=H*0.14+i*8;
    ctx.strokeStyle='#5a4a4a'; ctx.lineWidth=1.5; ctx.beginPath();
    ctx.moveTo(gx-5,gy); ctx.quadraticCurveTo(gx,gy-4,gx+5,gy); ctx.stroke(); }
}
registerScene('marina', drawMarina);

/* ── PUPPET THEATER (indoor · marionette stage show) ── */
function drawPuppetTheater(){
  const t=sceneTime, floorY=H*0.72;
  // dim playhouse
  ctx.fillStyle='#241826'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#3a2a1e'; ctx.fillRect(0,floorY,W,H-floorY);
  for(let i=0;i<8;i++){ ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(0,floorY+i*((H-floorY)/8),W,1); }
  // ornate proscenium arch (gold frame)
  const px=W*0.1, py=H*0.1, pw=W*0.8, ph=H*0.5;
  ctx.fillStyle='#8a2a3a'; ctx.fillRect(px-8,py-8,pw+16,ph+16); // red border box
  ctx.fillStyle='#d4af37'; ctx.fillRect(px-8,py-8,pw+16,6); // gold top
  for(let i=0;i<9;i++){ ctx.fillStyle='#d4af37'; ctx.beginPath(); ctx.arc(px-8+ (pw+16)*i/8, py-8, 5,0,7); ctx.fill(); }
  // stage opening (the lit interior)
  const bg=ctx.createLinearGradient(0,py,0,py+ph); bg.addColorStop(0,'#3a5a7a'); bg.addColorStop(1,'#6a4a6a');
  ctx.fillStyle=bg; ctx.fillRect(px,py,pw,ph);
  // painted backdrop: a little moon + hills
  ctx.fillStyle='#f2e8b0'; ctx.beginPath(); ctx.arc(px+pw*0.78,py+ph*0.24,14,0,7); ctx.fill();
  ctx.fillStyle='#2e4a3a'; ctx.beginPath(); ctx.moveTo(px,py+ph); for(let x=0;x<=pw;x+=14){ ctx.lineTo(px+x, py+ph*0.62+Math.sin(x*0.04)*10); } ctx.lineTo(px+pw,py+ph); ctx.closePath(); ctx.fill();
  // stage floorboards
  ctx.fillStyle='#7a5432'; ctx.fillRect(px,py+ph-14,pw,14);
  // red velvet curtains, swagged at the top corners
  ctx.fillStyle='#a52a3a';
  ctx.beginPath(); ctx.moveTo(px,py); ctx.quadraticCurveTo(px+pw*0.18,py+ph*0.2,px+pw*0.1,py+ph*0.42); ctx.lineTo(px,py+ph*0.42); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(px+pw,py); ctx.quadraticCurveTo(px+pw*0.82,py+ph*0.2,px+pw*0.9,py+ph*0.42); ctx.lineTo(px+pw,py+ph*0.42); ctx.closePath(); ctx.fill();
  // curtain folds
  ctx.strokeStyle='#7a1e2a'; ctx.lineWidth=2;
  for(let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(px+2+i*6,py); ctx.quadraticCurveTo(px+pw*0.14+i*4,py+ph*0.2,px+pw*0.07+i*4,py+ph*0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px+pw-2-i*6,py); ctx.quadraticCurveTo(px+pw*0.86-i*4,py+ph*0.2,px+pw*0.93-i*4,py+ph*0.4); ctx.stroke(); }
  // footlights glow along the stage lip
  for(let i=0;i<7;i++){ const lx=px+pw*0.08+i*pw*0.14; ctx.fillStyle=`rgba(255,210,120,${0.5+0.2*Math.sin(t*4+i)})`; ctx.beginPath(); ctx.arc(lx,py+ph-6,4,0,7); ctx.fill(); }
  // two marionettes on strings, swaying/dancing
  function puppet(x,base,col,phase){
    const sway=Math.sin(t*2+phase)*10, lift=Math.abs(Math.sin(t*2+phase))*6;
    const hx=x+sway, hy=base-lift;
    // strings up to a control bar
    ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.moveTo(hx-6,py+4); ctx.lineTo(hx-4,hy-14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx+6,py+4); ctx.lineTo(hx+4,hy-14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx,py+4); ctx.lineTo(hx+10,hy+4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx,py+4); ctx.lineTo(hx-10,hy+4); ctx.stroke();
    // body
    ctx.fillStyle=col; ctx.fillRect(hx-5,hy-8,10,16);
    // head
    ctx.fillStyle='#f0d0a8'; ctx.beginPath(); ctx.arc(hx,hy-14,6,0,7); ctx.fill();
    // hat
    ctx.fillStyle=col; ctx.fillRect(hx-6,hy-20,12,3); ctx.fillRect(hx-3,hy-25,6,5);
    // limbs (swing opposite)
    const s2=Math.sin(t*2+phase+1)*6;
    ctx.strokeStyle=col; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(hx-4,hy-4); ctx.lineTo(hx-10,hy+4+s2*0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx+4,hy-4); ctx.lineTo(hx+10,hy+4-s2*0.2); ctx.stroke();
    ctx.strokeStyle='#5a3a2a'; ctx.beginPath(); ctx.moveTo(hx-3,hy+8); ctx.lineTo(hx-5+s2*0.3,hy+18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx+3,hy+8); ctx.lineTo(hx+5-s2*0.3,hy+18); ctx.stroke();
  }
  puppet(px+pw*0.36, py+ph-24, '#d84a6a', 0);
  puppet(px+pw*0.62, py+ph-24, '#4a86c0', 1.6);
  // a few little audience-head silhouettes in the foreground
  for(let i=0;i<6;i++){ ctx.fillStyle='#160e12'; ctx.beginPath(); ctx.arc(W*0.12+i*W*0.15, H*0.94, 12,Math.PI,0); ctx.fill();
    ctx.beginPath(); ctx.arc(W*0.12+i*W*0.15, H*0.86, 6,0,7); ctx.fill(); }
}
registerScene('puppettheater', drawPuppetTheater);

/* ── SUNFLOWER FIELD (outdoor · golden hour) ── */
function drawSunflowers(){
  const t=sceneTime, groundY=H*0.6;
  // warm golden sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#7ec0e8'); sky.addColorStop(1,'#f6e3a8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // hazy sun
  ctx.fillStyle='rgba(255,240,180,.9)'; ctx.beginPath(); ctx.arc(W*0.2,H*0.18,24,0,7); ctx.fill();
  ctx.globalAlpha=0.25; ctx.beginPath(); ctx.arc(W*0.2,H*0.18,40,0,7); ctx.fill(); ctx.globalAlpha=1;
  // distant hill
  ctx.fillStyle='#8fb060'; ctx.beginPath(); ctx.moveTo(0,groundY); ctx.quadraticCurveTo(W*0.5,groundY-30,W,groundY); ctx.lineTo(W,groundY+6); ctx.lineTo(0,groundY+6); ctx.fill();
  // green field base
  ctx.fillStyle='#5f8a3a'; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#4f7a30'; ctx.fillRect(0,H*0.82,W,H*0.18);
  // a sunflower helper (bloom faces toward the sun with a gentle sway)
  function sunflower(x,y,s,phase){
    const sway=Math.sin(t*1.2+phase)*2;
    // stem
    ctx.strokeStyle='#3f7a2e'; ctx.lineWidth=3*s; ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x+sway, y-30*s, x+sway*1.5, y-52*s); ctx.stroke();
    // leaves
    ctx.fillStyle='#3f8a2e'; ctx.beginPath(); ctx.ellipse(x-6*s,y-24*s,8*s,4*s,-0.6,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+7*s,y-34*s,8*s,4*s,0.6,0,7); ctx.fill();
    const hx=x+sway*1.5, hy=y-54*s;
    // petals
    ctx.fillStyle='#f4b81e';
    for(let p=0;p<14;p++){ const a=p/14*Math.PI*2; ctx.save(); ctx.translate(hx,hy); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0,-11*s,3.2*s,7*s,0,0,7); ctx.fill(); ctx.restore(); }
    // center
    ctx.fillStyle='#6a3a1a'; ctx.beginPath(); ctx.arc(hx,hy,8*s,0,7); ctx.fill();
    ctx.fillStyle='#8a5a2a'; for(let i=0;i<6;i++){ const a=i+t; ctx.beginPath(); ctx.arc(hx+Math.cos(a)*4*s, hy+Math.sin(a)*4*s, 1.4*s,0,7); ctx.fill(); }
  }
  // back rows (small), then front rows (large) for depth
  for(let i=0;i<8;i++) sunflower(W*0.06+i*W*0.13, groundY+18, 0.6, i);
  for(let i=0;i<6;i++) sunflower(W*0.02+i*W*0.19, groundY+56, 0.85, i+2);
  for(let i=0;i<4;i++) sunflower(W*0.1+i*W*0.28, H*0.94, 1.15, i*1.3);
  // a couple of bees drifting
  for(let i=0;i<3;i++){ const bx=W*0.3+Math.sin(t*1.6+i*2)*W*0.25, by=H*0.4+Math.cos(t*1.3+i)*20;
    ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.ellipse(bx,by,3,2,0,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(bx-2,by-1,2,1.2,-0.6,0,7); ctx.fill(); }
  // a few drifting pollen motes catching the light
  for(let i=0;i<16;i++){ const px=(i*61+t*10)%W, py=H*0.2+((i*37+t*6)%(groundY-H*0.2));
    ctx.fillStyle='rgba(255,245,200,.5)'; ctx.fillRect(px,py,2,2); }
}
registerScene('sunflowers', drawSunflowers);

/* ── ICE CREAM PARLOR (indoor · retro sundae shop) ── */
function drawIceCreamParlor(){
  const t=sceneTime, floorY=H*0.66;
  // mint walls + pink wainscot
  ctx.fillStyle='#c8ecdc'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#f4c4d4'; ctx.fillRect(0,floorY-22,W,22);
  // checker floor (pink/white diamonds)
  for(let y=0;y*14<H-floorY+14;y++) for(let x=0;x<W/22+1;x++){
    ctx.fillStyle=((x+y)%2)?'#f6d9e2':'#ffffff'; ctx.fillRect(x*22 - (y%2)*11, floorY+y*14, 22,14); }
  // striped awning valance along the top
  for(let i=0;i<W/20+1;i++){ ctx.fillStyle=(i%2)?'#e0556a':'#fbeff2'; ctx.beginPath();
    ctx.moveTo(i*20,0); ctx.lineTo(i*20+20,0); ctx.lineTo(i*20+10,16); ctx.closePath(); ctx.fill(); }
  // menu board
  ctx.fillStyle='#3a2a2e'; ctx.fillRect(W*0.06,H*0.1,W*0.24,H*0.2);
  ctx.fillStyle='#f6d9e2'; ctx.font='bold 8px Segoe UI, sans-serif'; ctx.textAlign='center';
  ctx.fillText('SCOOPS', W*0.18, H*0.14);
  ctx.fillStyle='#c8ecdc'; ctx.font='7px Segoe UI, sans-serif';
  ['Vanilla','Strawberry','Mint','Choc'].forEach((s,i)=>ctx.fillText(s, W*0.18, H*0.17+i*10));
  ctx.textAlign='left';
  // the counter / display case
  const cy=floorY-4;
  ctx.fillStyle='#e0556a'; ctx.fillRect(W*0.34,cy-30,W*0.6,30+(H-cy));
  ctx.fillStyle='#f6eff2'; ctx.fillRect(W*0.34,cy-30,W*0.6,6);
  // glass display with tubs of ice cream (colored mounds)
  ctx.fillStyle='rgba(210,240,250,.35)'; ctx.fillRect(W*0.36,cy-28,W*0.56,22);
  const flav=['#f6e7b0','#f2a0b8','#a8e0c0','#b98a5a','#d0a8e0','#f2b070'];
  for(let i=0;i<6;i++){ const tx=W*0.4+i*W*0.085;
    ctx.fillStyle='#eaf2f6'; ctx.fillRect(tx-11,cy-12,22,8); // tub
    ctx.fillStyle=flav[i]; ctx.beginPath(); ctx.ellipse(tx,cy-12,11,6,0,Math.PI,0); ctx.fill();
    // a scoop ball sitting on top
    ctx.beginPath(); ctx.arc(tx,cy-16,5,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(tx-2,cy-18,1.6,0,7); ctx.fill(); }
  // a tall sundae glass on the counter with a bobbing cherry
  const sx=W*0.5, sy=cy-30;
  ctx.fillStyle='rgba(230,245,250,.6)'; ctx.beginPath(); ctx.moveTo(sx-8,sy); ctx.lineTo(sx+8,sy); ctx.lineTo(sx+5,sy-16); ctx.lineTo(sx-5,sy-16); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#f6e7b0'; ctx.beginPath(); ctx.arc(sx-3,sy-16,5,0,7); ctx.fill();
  ctx.fillStyle='#f2a0b8'; ctx.beginPath(); ctx.arc(sx+3,sy-18,5,0,7); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(sx,sy-24,4,0,7); ctx.fill(); // whipped
  const cherY=sy-30+Math.sin(t*3)*1.5; ctx.fillStyle='#d0303a'; ctx.beginPath(); ctx.arc(sx,cherY,2.5,0,7); ctx.fill();
  ctx.strokeStyle='#3f7a2e'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(sx,cherY-2); ctx.lineTo(sx+2,cherY-6); ctx.stroke();
  // hanging cone lights
  for(let i=0;i<4;i++){ const lx=W*0.4+i*W*0.15; ctx.strokeStyle='#aaa'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx,0); ctx.lineTo(lx,H*0.08); ctx.stroke();
    ctx.fillStyle='#e8b878'; ctx.beginPath(); ctx.moveTo(lx-5,H*0.08); ctx.lineTo(lx+5,H*0.08); ctx.lineTo(lx,H*0.08+10); ctx.closePath(); ctx.fill();
    ctx.fillStyle=`rgba(255,240,200,${0.6+0.2*Math.sin(t*3+i)})`; ctx.beginPath(); ctx.arc(lx,H*0.08+2,3,0,7); ctx.fill(); }
  // a round soda-fountain stool in the foreground
  ctx.fillStyle='#e0556a'; ctx.beginPath(); ctx.ellipse(W*0.16,H*0.86,16,6,0,0,7); ctx.fill();
  ctx.fillStyle='#c8c8d0'; ctx.fillRect(W*0.155,H*0.86,4,H*0.12);
  ctx.fillStyle='#b0b0b8'; ctx.beginPath(); ctx.ellipse(W*0.16,H*0.98,10,3,0,0,7); ctx.fill();
}
registerScene('icecreamparlor', drawIceCreamParlor);

/* ── TOPIARY GARDEN (outdoor · sculpted hedges + fountain) ── */
function drawTopiary(){
  const t=sceneTime, groundY=H*0.66;
  // bright sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#9fd0ee'); sky.addColorStop(1,'#dcefdd');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  for(let i=0;i<3;i++){ const cx=((t*6+i*130)%(W+120))-60; ctx.fillStyle='rgba(255,255,255,.8)';
    ctx.beginPath(); ctx.arc(cx,H*0.12+i*24,12,0,7); ctx.arc(cx+14,cy2(i),9,0,7); ctx.arc(cx-12,H*0.12+i*24+4,8,0,7); ctx.fill(); }
  function cy2(i){ return H*0.12+i*24+3; }
  // manicured lawn with gravel path
  ctx.fillStyle='#5fa048'; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#548c3e'; for(let i=0;i<W;i+=16){ ctx.fillRect(i, groundY, 8, H-groundY); } // mowing stripes
  ctx.fillStyle='#d8cfae'; ctx.beginPath(); ctx.moveTo(W*0.36,H); ctx.lineTo(W*0.64,H); ctx.lineTo(W*0.56,groundY+4); ctx.lineTo(W*0.44,groundY+4); ctx.closePath(); ctx.fill();
  // low boxwood parterre hedges (back)
  ctx.fillStyle='#3f7a34'; ctx.fillRect(0,groundY-14,W,16);
  ctx.fillStyle='#4f8c40'; for(let i=0;i<W;i+=10){ ctx.beginPath(); ctx.arc(i+5,groundY-14,6,Math.PI,0); ctx.fill(); }
  // topiary helpers
  function ball(x,base,r,col){ ctx.fillStyle=col||'#3f8034'; ctx.beginPath(); ctx.arc(x,base-r,r,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(x-r*0.3,base-r*1.3,r*0.4,0,7); ctx.fill(); }
  function pot(x,base,w){ ctx.fillStyle='#b5885a'; ctx.beginPath(); ctx.moveTo(x-w,base); ctx.lineTo(x+w,base); ctx.lineTo(x+w*0.7,base+14); ctx.lineTo(x-w*0.7,base+14); ctx.closePath(); ctx.fill(); }
  // spiral cone topiary (stacked balls) left
  const lx=W*0.14, lb=groundY+34;
  pot(lx,lb,12); ball(lx,lb,13); ball(lx,lb-18,10); ball(lx,lb-32,7); ball(lx,lb-44,4);
  // topiary "peacock/bird" shape right — body + tail fan + head
  const rx=W*0.84, rb=groundY+34;
  pot(rx,rb,12);
  ctx.fillStyle='#3f8034'; ctx.beginPath(); ctx.ellipse(rx,rb-16,16,13,0,0,7); ctx.fill(); // body
  ctx.beginPath(); ctx.arc(rx-14,rb-30,5,0,7); ctx.fill(); // head
  ctx.strokeStyle='#3f8034'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(rx-14,rb-34); ctx.lineTo(rx-16,rb-40); ctx.stroke();
  // tail fan
  for(let i=0;i<5;i++){ const a=-0.5+i*0.35; ctx.fillStyle=i%2?'#357029':'#4f8c40';
    ctx.save(); ctx.translate(rx+8,rb-18); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-16,4,16,0,0,7); ctx.fill(); ctx.restore(); }
  // central tiered stone fountain with animated water
  const fx=W*0.5, fb=groundY+40;
  ctx.fillStyle='#c8c2b4'; ctx.beginPath(); ctx.ellipse(fx,fb,44,12,0,0,7); ctx.fill(); // basin
  ctx.fillStyle='#9fd8e0'; ctx.beginPath(); ctx.ellipse(fx,fb-2,38,8,0,0,7); ctx.fill(); // water
  ctx.fillStyle='#b0aa9c'; ctx.fillRect(fx-6,fb-26,12,24); // pillar
  ctx.fillStyle='#c8c2b4'; ctx.beginPath(); ctx.ellipse(fx,fb-26,20,6,0,0,7); ctx.fill(); // upper bowl
  ctx.fillStyle='#9fd8e0'; ctx.beginPath(); ctx.ellipse(fx,fb-27,15,4,0,0,7); ctx.fill();
  // spouting water arcs
  ctx.strokeStyle='rgba(180,225,235,.7)'; ctx.lineWidth=2;
  for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, ph=Math.sin(t*3+i)*2;
    ctx.beginPath(); ctx.moveTo(fx,fb-32); ctx.quadraticCurveTo(fx+Math.cos(a)*14, fb-40-ph, fx+Math.cos(a)*22, fb-24); ctx.stroke(); }
  // droplet sparkles in the basin
  for(let i=0;i<6;i++){ ctx.fillStyle=`rgba(255,255,255,${0.3+0.3*Math.sin(t*4+i)})`; ctx.fillRect(fx-20+i*8, fb-3+Math.sin(t*3+i)*1.5, 2,2); }
  // little clipped shrubs lining the path front
  for(let i=0;i<4;i++){ ball(W*0.32+i*W*0.12, H*0.98, 9); }
}
registerScene('topiary', drawTopiary);

/* ── BOWLING ALLEY (indoor · retro lanes) ── */
function drawBowling(){
  const t=sceneTime, horizon=H*0.3;
  // dim room, wood-paneled back wall
  ctx.fillStyle='#241c18'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#3a2a1e'; ctx.fillRect(0,0,W,horizon);
  for(let i=0;i<W;i+=16){ ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(i,0,1,horizon); }
  // neon sign over the pin deck
  ctx.fillStyle=`rgba(255,90,150,${0.7+0.3*Math.sin(t*6)})`; ctx.font='bold 12px Segoe UI, sans-serif'; ctx.textAlign='center';
  ctx.fillText('★ STRIKE ★', W*0.5, H*0.12); ctx.textAlign='left';
  // pin deck (bright) behind
  ctx.fillStyle='#f2ead6'; ctx.fillRect(W*0.28,horizon-6,W*0.44,18);
  // three lanes converging to the horizon (perspective)
  const cx=W*0.5, vanY=horizon+8;
  const laneDefs=[[-1],[0],[1]];
  for(let L=-1;L<=1;L++){
    const nearL=cx+L*W*0.34-W*0.14, nearR=cx+L*W*0.34+W*0.14;
    const farL=cx+L*W*0.05-W*0.03, farR=cx+L*W*0.05+W*0.03;
    // lane surface
    ctx.fillStyle=L===0?'#c99a54':'#b98a48';
    ctx.beginPath(); ctx.moveTo(nearL,H); ctx.lineTo(nearR,H); ctx.lineTo(farR,vanY); ctx.lineTo(farL,vanY); ctx.closePath(); ctx.fill();
    // board lines
    ctx.strokeStyle='rgba(120,80,40,.5)'; ctx.lineWidth=1;
    for(let b=1;b<6;b++){ const nx=nearL+(nearR-nearL)*b/6, fx2=farL+(farR-farL)*b/6; ctx.beginPath(); ctx.moveTo(nx,H); ctx.lineTo(fx2,vanY); ctx.stroke(); }
    // gutters
    ctx.fillStyle='#2a2018'; ctx.beginPath(); ctx.moveTo(nearL,H); ctx.lineTo(nearL-8,H); ctx.lineTo(farL-2,vanY); ctx.lineTo(farL,vanY); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(nearR,H); ctx.lineTo(nearR+8,H); ctx.lineTo(farR+2,vanY); ctx.lineTo(farR,vanY); ctx.closePath(); ctx.fill();
    // pins at the far end (triangle of 10)
    const pinColor='#f4eede';
    let row=0, placed=0;
    for(let r=0;r<4;r++){ for(let c=0;c<=r;c++){ const px=cx+L*W*0.05 + (c-r/2)*5, py=vanY-2-r*2.5;
      ctx.fillStyle=pinColor; ctx.beginPath(); ctx.ellipse(px,py,1.8,3,0,0,7); ctx.fill();
      ctx.strokeStyle='#d0303a'; ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(px-1.4,py-1); ctx.lineTo(px+1.4,py-1); ctx.stroke(); } }
  }
  // a bowling ball rolling down the center lane toward the pins
  const roll=(t*0.5)%1; // 0 near -> 1 far
  const bScale=1-roll*0.8;
  const by=H - roll*(H-vanY);
  const bx=cx + Math.sin(t*0.5)*0 ; // straight for now
  const br=16*bScale;
  ctx.fillStyle='#2a4a8a'; ctx.beginPath(); ctx.arc(bx,by-br,br,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(bx-br*0.3,by-br*1.3,br*0.35,0,7); ctx.fill();
  // finger holes
  ctx.fillStyle='#16284a'; for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(bx-3+i*3, by-br-2, 1.2*bScale+0.4,0,7); ctx.fill(); }
  // ball return + rack on the near right
  ctx.fillStyle='#3a2e24'; ctx.fillRect(W*0.82,H*0.7,W*0.16,H*0.3);
  const rc=['#d0303a','#f2c14e','#2a8a5a','#8a4ac0'];
  for(let i=0;i<4;i++){ ctx.fillStyle=rc[i]; ctx.beginPath(); ctx.arc(W*0.86+ (i%2)*W*0.07, H*0.76+Math.floor(i/2)*H*0.1, 10,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.2)'; ctx.beginPath(); ctx.arc(W*0.86+ (i%2)*W*0.07-3, H*0.76+Math.floor(i/2)*H*0.1-3, 3,0,7); ctx.fill(); }
  // overhead score monitor glow on the left
  ctx.fillStyle='#0a2a3a'; ctx.fillRect(W*0.03,H*0.36,W*0.16,H*0.1);
  ctx.fillStyle=`rgba(120,220,255,${0.6+0.2*Math.sin(t*4)})`; ctx.font='7px monospace';
  ctx.fillText('K  X  9 /', W*0.05, H*0.42);
}
registerScene('bowling', drawBowling);

/* ── REDWOOD FOREST (outdoor · towering trunks, god-rays) ── */
function drawRedwoods(){
  const t=sceneTime, groundY=H*0.78;
  // deep green canopy light
  const air=ctx.createLinearGradient(0,0,0,groundY); air.addColorStop(0,'#2f4a2e'); air.addColorStop(1,'#516b3e');
  ctx.fillStyle=air; ctx.fillRect(0,0,W,groundY);
  // misty forest floor
  ctx.fillStyle='#3a4a2c'; ctx.fillRect(0,groundY,W,H-groundY);
  // slanting god-ray light shafts from upper-left
  ctx.save();
  for(let i=0;i<5;i++){ const x0=W*0.05+i*W*0.16; ctx.globalAlpha=0.06+0.03*Math.sin(t*0.8+i);
    ctx.fillStyle='#f0f4c0'; ctx.beginPath();
    ctx.moveTo(x0,0); ctx.lineTo(x0+30,0); ctx.lineTo(x0+90,groundY); ctx.lineTo(x0+40,groundY); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  // towering trunks — a few big foreground, several thin back ones (parallax by size)
  function trunk(x,w,shade){ const g=ctx.createLinearGradient(x-w,0,x+w,0);
    g.addColorStop(0,shade[0]); g.addColorStop(0.5,shade[1]); g.addColorStop(1,shade[0]);
    ctx.fillStyle=g; ctx.fillRect(x-w,0,w*2,groundY+8);
    // bark furrows
    ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1;
    for(let k=-2;k<=2;k++){ ctx.beginPath(); ctx.moveTo(x+k*w*0.4, 0); ctx.lineTo(x+k*w*0.4+ Math.sin(k)*3, groundY); ctx.stroke(); }
    // root flare
    ctx.fillStyle=shade[0]; ctx.beginPath(); ctx.moveTo(x-w,groundY-8); ctx.lineTo(x-w*1.7,groundY+10); ctx.lineTo(x+w*1.7,groundY+10); ctx.lineTo(x+w,groundY-8); ctx.closePath(); ctx.fill();
  }
  // far trunks
  trunk(W*0.3, 8, ['#4a3020','#6a4a30']);
  trunk(W*0.62, 7, ['#4a3020','#6a4a30']);
  trunk(W*0.82, 6, ['#452e1e','#63452c']);
  // near trunks (big, reddish bark)
  trunk(W*0.12, 26, ['#6a2f1e','#9a4a2e']);
  trunk(W*0.9, 30, ['#66301f','#98492d']);
  // hanging light dust motes in the beams
  for(let i=0;i<22;i++){ const mx=(i*53+ t*4)%W, my=(i*71)% groundY;
    ctx.fillStyle='rgba(240,244,190,.35)'; ctx.fillRect(mx,my,2,2); }
  // ferns and undergrowth on the floor
  function fern(x,base,s,col){ ctx.strokeStyle=col; ctx.lineWidth=1.5;
    for(let f=-2;f<=2;f++){ ctx.beginPath(); ctx.moveTo(x,base); ctx.quadraticCurveTo(x+f*10,base-16*s, x+f*16,base-30*s); ctx.stroke(); } }
  fern(W*0.22,H*0.9,1.0,'#3f6a2e'); fern(W*0.5,H*0.96,1.2,'#457a34'); fern(W*0.74,H*0.9,1.0,'#3f6a2e');
  // a fallen mossy log across the foreground
  ctx.fillStyle='#5a4a30'; ctx.beginPath(); ctx.ellipse(W*0.4,H*0.99,W*0.5,10,0.03,0,7); ctx.fill();
  ctx.fillStyle='#4f7a3a'; for(let i=0;i<12;i++){ ctx.beginPath(); ctx.arc(W*0.1+i*W*0.07, H*0.96+Math.sin(i)*2, 5,Math.PI,0); ctx.fill(); }
  // a couple of mushrooms on the log
  for(let i=0;i<3;i++){ const mx=W*0.24+i*W*0.22; ctx.fillStyle='#e8e0d0'; ctx.fillRect(mx-1,H*0.955,2,6);
    ctx.fillStyle='#c0503a'; ctx.beginPath(); ctx.ellipse(mx,H*0.955,5,3,0,Math.PI,0); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(mx-1,H*0.95,0.8,0,7); ctx.fill(); }
}
registerScene('redwoods', drawRedwoods);

/* ── MODEL TRAIN ROOM (indoor · a running miniature railway) ── */
function drawTrainRoom(){
  const t=sceneTime, tableY=H*0.5;
  // cozy hobby room
  ctx.fillStyle='#d8c9a8'; ctx.fillRect(0,0,W,tableY);
  ctx.fillStyle='#a5895f'; ctx.fillRect(0,tableY,W,H-tableY);
  // window with daylight
  ctx.fillStyle='#8fc4e8'; ctx.fillRect(W*0.06,H*0.08,W*0.22,H*0.24);
  ctx.fillStyle='#cfe4f2'; ctx.fillRect(W*0.06,H*0.08,W*0.22,H*0.06);
  ctx.strokeStyle='#7a5636'; ctx.lineWidth=3; ctx.strokeRect(W*0.06,H*0.08,W*0.22,H*0.24);
  ctx.beginPath(); ctx.moveTo(W*0.17,H*0.08); ctx.lineTo(W*0.17,H*0.32); ctx.moveTo(W*0.06,H*0.2); ctx.lineTo(W*0.28,H*0.2); ctx.stroke();
  // framed pictures + shelf with paint jars
  for(let i=0;i<3;i++){ ctx.fillStyle='#7a5636'; ctx.fillRect(W*0.4+i*W*0.16,H*0.1,W*0.1,H*0.08);
    ctx.fillStyle=['#4a86c0','#c0503a','#4f8c40'][i]; ctx.fillRect(W*0.41+i*W*0.16,H*0.11,W*0.08,H*0.06); }
  ctx.fillStyle='#8a6a44'; ctx.fillRect(W*0.72,H*0.24,W*0.24,3);
  for(let i=0;i<5;i++){ ctx.fillStyle=['#d0303a','#f2c14e','#2a8a5a','#4a86c0','#8a4ac0'][i]; ctx.fillRect(W*0.74+i*W*0.04,H*0.18,5,6); }
  // the layout table (green baize with hills)
  ctx.fillStyle='#4f7a3a'; ctx.fillRect(0,tableY,W,H*0.24);
  ctx.fillStyle='#5f8a44'; ctx.beginPath(); ctx.moveTo(0,tableY+10); ctx.quadraticCurveTo(W*0.3,tableY-14,W*0.55,tableY+14); ctx.quadraticCurveTo(W*0.8,tableY+2,W,tableY+8); ctx.lineTo(W,tableY+30); ctx.lineTo(0,tableY+30); ctx.fill();
  // a little tunnel hill on the right
  ctx.fillStyle='#6a5a3a'; ctx.beginPath(); ctx.ellipse(W*0.82,tableY+22,40,28,0,Math.PI,0); ctx.fill();
  ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.ellipse(W*0.82,tableY+24,12,14,0,Math.PI,0); ctx.fill();
  // tiny trees + a pond + a station
  for(let i=0;i<5;i++){ const tx=W*0.1+i*W*0.14; ctx.fillStyle='#5a3a20'; ctx.fillRect(tx-1,tableY+16,2,8);
    ctx.fillStyle='#3f7a34'; ctx.beginPath(); ctx.arc(tx,tableY+12,6,0,7); ctx.fill(); }
  ctx.fillStyle='#5aa0c0'; ctx.beginPath(); ctx.ellipse(W*0.3,H*0.66,18,7,0,0,7); ctx.fill();
  ctx.fillStyle='#c85a3a'; ctx.fillRect(W*0.5,H*0.6,26,12); ctx.fillStyle='#8a3a24'; ctx.beginPath(); ctx.moveTo(W*0.5-2,H*0.6); ctx.lineTo(W*0.5+28,H*0.6); ctx.lineTo(W*0.5+13,H*0.575); ctx.closePath(); ctx.fill();
  // the oval track (perspective ellipse) with ties
  const ocx=W*0.5, ocy=H*0.78, orx=W*0.42, ory=H*0.13;
  ctx.strokeStyle='#8a7a5a'; ctx.lineWidth=10; ctx.beginPath(); ctx.ellipse(ocx,ocy,orx,ory,0,0,7); ctx.stroke();
  ctx.strokeStyle='#c0c0c8'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(ocx,ocy,orx+3,ory+1,0,0,7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(ocx,ocy,orx-3,ory-1,0,0,7); ctx.stroke();
  // the running train (engine + 2 cars) following the ellipse
  const carCols=['#2a3a6a','#c0503a','#f2c14e'];
  for(let c=0;c<3;c++){ const a=t*1.1 - c*0.32; const x=ocx+Math.cos(a)*orx, y=ocy+Math.sin(a)*ory;
    const depth=(Math.sin(a)+1)/2; const s=0.7+depth*0.5; // bigger at front (bottom)
    ctx.fillStyle=carCols[c]; ctx.fillRect(x-8*s,y-9*s,16*s,9*s);
    if(c===0){ ctx.fillStyle='#1a2440'; ctx.fillRect(x+2*s,y-13*s,6*s,4*s); // cab
      // smoke puffs
      ctx.fillStyle='rgba(220,220,220,.5)'; for(let p=0;p<3;p++){ ctx.beginPath(); ctx.arc(x-6*s, y-12*s-p*5, 2+p,0,7); ctx.fill(); } }
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(x-4*s,y,2*s,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(x+4*s,y,2*s,0,7); ctx.fill();
  }
  // a controller throttle on the near table edge
  ctx.fillStyle='#333'; ctx.fillRect(W*0.06,H*0.92,W*0.16,H*0.06);
  ctx.fillStyle='#d0303a'; ctx.beginPath(); ctx.arc(W*0.1,H*0.95,4,0,7); ctx.fill();
  ctx.strokeStyle='#888'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.16,H*0.95); ctx.lineTo(W*0.16+Math.cos(t)*5,H*0.95-6); ctx.stroke();
}
registerScene('trainroom', drawTrainRoom);

/* ── RICE TERRACES (outdoor · flooded paddies at dawn) ── */
function drawRiceTerraces(){
  const t=sceneTime, skyY=H*0.34;
  // soft dawn sky
  const sky=ctx.createLinearGradient(0,0,0,skyY); sky.addColorStop(0,'#b9d0e6'); sky.addColorStop(1,'#f3d8b0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,skyY);
  // soft sun low behind hills
  ctx.fillStyle='rgba(255,235,190,.85)'; ctx.beginPath(); ctx.arc(W*0.66,skyY-6,20,0,7); ctx.fill();
  // layered misty hills
  ctx.fillStyle='#9fb0a0'; ctx.beginPath(); ctx.moveTo(0,skyY); ctx.quadraticCurveTo(W*0.3,skyY-24,W*0.6,skyY-4); ctx.quadraticCurveTo(W*0.85,skyY-18,W,skyY-2); ctx.lineTo(W,skyY); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(0,skyY-8,W,8); // mist band
  // the stepped terraces descending — each an irrigated paddy that mirrors the sky
  const steps=7;
  for(let i=0;i<steps;i++){
    const y0=skyY + (H-skyY)*i/steps;
    const y1=skyY + (H-skyY)*(i+1)/steps;
    // curved terrace edge (follows the contour of the hill)
    const bend=10+i*3;
    // water surface with a dawn-tinted reflection, lighter near front
    const shade=0.5 - i*0.03;
    const wg=ctx.createLinearGradient(0,y0,0,y1);
    wg.addColorStop(0,`rgba(${180+i*6},${190+i*4},${170+i*2},0.9)`);
    wg.addColorStop(1,`rgba(${150+i*6},${175+i*4},${185+i*2},0.9)`);
    ctx.fillStyle=wg;
    ctx.beginPath(); ctx.moveTo(0,y0);
    for(let x=0;x<=W;x+=12){ ctx.lineTo(x, y0 + Math.sin(x*0.02 + i)*bend*0.4); }
    ctx.lineTo(W,y1);
    for(let x=W;x>=0;x-=12){ ctx.lineTo(x, y1 + Math.sin(x*0.02 + i+0.5)*bend*0.4); }
    ctx.closePath(); ctx.fill();
    // shimmer highlights on the water
    ctx.strokeStyle='rgba(255,240,210,.35)'; ctx.lineWidth=1;
    ctx.beginPath(); for(let x=0;x<=W;x+=10){ const yy=(y0+y1)/2 + Math.sin(x*0.06+t*1.5+i)*2; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke();
    // grassy mud ridge separating this terrace from the next
    ctx.fillStyle='#6a5a34'; ctx.beginPath(); ctx.moveTo(0,y1);
    for(let x=0;x<=W;x+=12){ ctx.lineTo(x, y1 + Math.sin(x*0.02 + i+0.5)*bend*0.4); }
    ctx.lineTo(W,y1+4);
    for(let x=W;x>=0;x-=12){ ctx.lineTo(x, y1+4 + Math.sin(x*0.02 + i+0.5)*bend*0.4); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle='#5f7a3a'; ctx.beginPath(); ctx.moveTo(0,y1);
    for(let x=0;x<=W;x+=8){ ctx.lineTo(x, y1 + Math.sin(x*0.02+i+0.5)*bend*0.4 - 1.5); }
    ctx.stroke?.();
    // little rice sprout tufts poking up along the near ridge
    if(i>=3){ for(let x=6;x<W;x+=18){ const ry=y1 + Math.sin(x*0.02+i+0.5)*bend*0.4; ctx.strokeStyle='#4f7a30'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(x,ry); ctx.lineTo(x-2,ry-5); ctx.moveTo(x,ry); ctx.lineTo(x+2,ry-5); ctx.moveTo(x,ry); ctx.lineTo(x,ry-6); ctx.stroke(); } }
  }
  // a lone farmer's hut on an upper ridge
  const hx=W*0.16, hy=skyY + (H-skyY)*1/steps - 4;
  ctx.fillStyle='#7a5636'; ctx.fillRect(hx-6,hy-8,12,8);
  ctx.fillStyle='#4a3320'; ctx.beginPath(); ctx.moveTo(hx-9,hy-8); ctx.lineTo(hx+9,hy-8); ctx.lineTo(hx,hy-16); ctx.closePath(); ctx.fill();
  // a couple of white egrets gliding low
  for(let i=0;i<2;i++){ const gx=(t*24+i*160)%(W+40)-20, gy=skyY*0.7+i*16;
    ctx.strokeStyle='#f4f4f0'; ctx.lineWidth=2; ctx.beginPath();
    ctx.moveTo(gx-6,gy); ctx.quadraticCurveTo(gx,gy-3+Math.sin(t*6+i),gx+6,gy); ctx.stroke(); }
}
registerScene('riceterraces', drawRiceTerraces);

/* ── BARBERSHOP (indoor · vintage cuts & shaves) ── */
function drawBarbershop(){
  const t=sceneTime, floorY=H*0.68;
  // teal walls + tile floor
  ctx.fillStyle='#2f6a6a'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#e8e4d8'; ctx.fillRect(0,floorY,W,H-floorY);
  for(let y=0;y*16<H-floorY;y++) for(let x=0;x<W/22+1;x++){ ctx.fillStyle=((x+y)%2)?'#dcd6c6':'#efece2'; ctx.fillRect(x*22,floorY+y*16,22,16); }
  ctx.fillStyle='#1e4a4a'; ctx.fillRect(0,floorY-6,W,6);
  // big wall mirror with gold frame
  const mx=W*0.5, mw=W*0.4, mtop=H*0.12, mh=H*0.34;
  ctx.fillStyle='#c8a44a'; ctx.fillRect(mx-mw/2-6,mtop-6,mw+12,mh+12);
  const mg=ctx.createLinearGradient(mx-mw/2,mtop,mx+mw/2,mtop+mh); mg.addColorStop(0,'#b8ccce'); mg.addColorStop(1,'#8fb0b2');
  ctx.fillStyle=mg; ctx.fillRect(mx-mw/2,mtop,mw,mh);
  ctx.fillStyle='rgba(255,255,255,.18)'; ctx.beginPath(); ctx.moveTo(mx-mw/2+6,mtop+6); ctx.lineTo(mx-mw/2+30,mtop+6); ctx.lineTo(mx-mw/2+6,mtop+mh-6); ctx.closePath(); ctx.fill();
  // shelf under the mirror with tonic bottles
  ctx.fillStyle='#6a4a30'; ctx.fillRect(mx-mw/2-6,mtop+mh+8,mw+12,5);
  const bc=['#c0503a','#4a86c0','#5f9a44','#d0a030','#8a4ac0'];
  for(let i=0;i<6;i++){ ctx.fillStyle=bc[i%bc.length]; ctx.fillRect(mx-mw/2+6+i*(mw/6),mtop+mh-6,7,14); ctx.fillStyle='#ddd'; ctx.fillRect(mx-mw/2+6+i*(mw/6)+1,mtop+mh-9,5,3); }
  // rotating barber pole on the left wall
  const px=W*0.1, ptop=H*0.16, ph=H*0.3;
  ctx.fillStyle='#cfcfd6'; ctx.fillRect(px-8,ptop-6,16,6); ctx.fillRect(px-8,ptop+ph,16,6); // caps
  // cylinder with animated diagonal stripes (clip to a rounded rect)
  ctx.save(); ctx.beginPath(); ctx.rect(px-7,ptop,14,ph); ctx.clip();
  ctx.fillStyle='#f4f4f4'; ctx.fillRect(px-7,ptop,14,ph);
  for(let s=-4;s<ph/8+2;s++){ const off=(t*20)%16;
    ctx.fillStyle='#c8202a'; ctx.beginPath(); ctx.moveTo(px-7, ptop+s*16+off); ctx.lineTo(px+7, ptop+s*16-8+off); ctx.lineTo(px+7, ptop+s*16+off); ctx.lineTo(px-7, ptop+s*16+8+off); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#2a4a9a'; ctx.beginPath(); ctx.moveTo(px-7, ptop+s*16+8+off); ctx.lineTo(px+7, ptop+s*16+off); ctx.lineTo(px+7, ptop+s*16+8+off); ctx.lineTo(px-7, ptop+s*16+16+off); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(px-4,ptop); ctx.lineTo(px-4,ptop+ph); ctx.stroke();
  // the barber chair (center, in front of mirror)
  const cx=mx, cy=floorY;
  ctx.fillStyle='#3a3a42'; ctx.fillRect(cx-6,cy-14,12,14+(H-cy)); // pedestal
  ctx.fillStyle='#b0b0b8'; ctx.beginPath(); ctx.ellipse(cx,H-4,20,5,0,0,7); ctx.fill(); // base
  ctx.fillStyle='#8a2a2a'; // red leather seat
  ctx.fillRect(cx-22,cy-24,44,14); // seat
  ctx.fillRect(cx-22,cy-58,10,36); // backrest post left
  ctx.fillRect(cx+12,cy-58,10,36);
  ctx.fillStyle='#9a3535'; ctx.fillRect(cx-20,cy-58,40,34); // backrest
  ctx.fillStyle='#7a2222'; for(let i=0;i<3;i++) ctx.fillRect(cx-16,cy-52+i*10,32,2); // tufting lines
  // chrome armrests
  ctx.strokeStyle='#cfcfd6'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(cx-24,cy-16); ctx.lineTo(cx-24,cy-6); ctx.moveTo(cx+24,cy-16); ctx.lineTo(cx+24,cy-6); ctx.stroke();
  // hot towel steaming on a stand at right
  const sx=W*0.86, sy=floorY-2;
  ctx.fillStyle='#888'; ctx.fillRect(sx-1,sy-40,2,40);
  ctx.fillStyle='#eef2f4'; ctx.fillRect(sx-10,sy-46,20,10);
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=2;
  for(let i=0;i<2;i++){ ctx.beginPath(); ctx.moveTo(sx-4+i*8,sy-46); for(let k=1;k<=3;k++) ctx.lineTo(sx-4+i*8+Math.sin(t*1.5+i+k)*5, sy-46-k*12); ctx.stroke(); }
  // hanging pendant light
  ctx.strokeStyle='#555'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H*0.08); ctx.stroke();
  ctx.fillStyle='#333'; ctx.beginPath(); ctx.moveTo(cx-10,H*0.08); ctx.lineTo(cx+10,H*0.08); ctx.lineTo(cx,H*0.13); ctx.closePath(); ctx.fill();
  ctx.fillStyle=`rgba(255,240,200,${0.6+0.1*Math.sin(t*3)})`; ctx.beginPath(); ctx.arc(cx,H*0.12,3,0,7); ctx.fill();
}
registerScene('barbershop', drawBarbershop);

/* ── KOI POND (outdoor · garden pond with an arched bridge) ── */
function drawKoiPond(){
  const t=sceneTime, bankY=H*0.26;
  // green garden band at top
  ctx.fillStyle='#6a9a4a'; ctx.fillRect(0,0,W,bankY);
  ctx.fillStyle='#5a8a3e'; for(let i=0;i<W;i+=14){ ctx.beginPath(); ctx.arc(i+7,bankY,7,Math.PI,0); ctx.fill(); }
  // a couple of shrubs + a stone lantern on the far bank
  for(let i=0;i<3;i++){ ctx.fillStyle='#4f7a34'; ctx.beginPath(); ctx.arc(W*0.2+i*W*0.3,bankY-10,12,0,7); ctx.fill(); }
  ctx.fillStyle='#8a8a82'; ctx.fillRect(W*0.86,bankY-22,10,10); ctx.beginPath(); ctx.moveTo(W*0.85,bankY-22); ctx.lineTo(W*0.92,bankY-22); ctx.lineTo(W*0.885,bankY-30); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffd98a'; ctx.fillRect(W*0.868,bankY-20,6,6);
  // the pond water
  const water=ctx.createLinearGradient(0,bankY,0,H); water.addColorStop(0,'#3f7a86'); water.addColorStop(1,'#245a68');
  ctx.fillStyle=water; ctx.fillRect(0,bankY,W,H-bankY);
  // soft caustic ripple bands
  for(let i=0;i<8;i++){ const ry=bankY+10+i*((H-bankY)/8); ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=2;
    ctx.beginPath(); for(let x=0;x<=W;x+=10){ const yy=ry+Math.sin(x*0.04+t*1.2+i)*3; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // koi swimming beneath the surface (colored bodies with wavy tails)
  function koi(cx,cy,s,col,spd,phase){
    const x=(cx + t*spd*20) % (W+80) - 40;
    const wig=Math.sin(t*4+phase);
    ctx.save(); ctx.translate(x,cy+Math.sin(t*1.1+phase)*6);
    ctx.globalAlpha=0.9;
    // body
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(0,0,14*s,6*s,0,0,7); ctx.fill();
    // tail (sweeping)
    ctx.beginPath(); ctx.moveTo(-12*s,0); ctx.quadraticCurveTo(-20*s,wig*5*s,-24*s,wig*8*s); ctx.quadraticCurveTo(-20*s,0,-12*s,0); ctx.fill();
    // fins
    ctx.beginPath(); ctx.ellipse(2*s,5*s,5*s,2*s,wig*0.4,0,7); ctx.fill();
    // white/red patches
    ctx.fillStyle= col==='#e86a2a'?'#f4f0e8':'#e86a2a';
    ctx.beginPath(); ctx.arc(2*s,-1*s,3*s,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(-4*s,1*s,2*s,0,7); ctx.fill();
    ctx.restore(); ctx.globalAlpha=1;
  }
  koi(20, H*0.5, 1.0, '#e86a2a', 0.9, 0);
  koi(160, H*0.66, 1.2, '#f4f0e8', 0.6, 1.7);
  koi(90, H*0.82, 1.1, '#e0b030', 1.1, 3.0);
  koi(250, H*0.58, 0.9, '#e86a2a', 0.8, 4.2);
  // lily pads with occasional flowers
  function pad(x,y,r){ ctx.fillStyle='#3f7a4a'; ctx.beginPath(); ctx.ellipse(x,y,r,r*0.5,0,0.5,Math.PI*2+0.2); ctx.fill(); }
  pad(W*0.2,H*0.44,12); pad(W*0.7,H*0.5,14); pad(W*0.5,H*0.74,11); pad(W*0.85,H*0.8,12);
  ctx.fillStyle='#f2b8d0'; for(const[fx,fy] of [[W*0.7,H*0.5],[W*0.85,H*0.8]]){ for(let p=0;p<6;p++){ const a=p/6*Math.PI*2; ctx.beginPath(); ctx.ellipse(fx+Math.cos(a)*4,fy-4+Math.sin(a)*3,3,1.6,a,0,7); ctx.fill(); } ctx.fillStyle='#f6d84a'; ctx.beginPath(); ctx.arc(fx,fy-4,2,0,7); ctx.fill(); ctx.fillStyle='#f2b8d0'; }
  // the red arched bridge crossing the pond
  const bx0=W*0.05, bx1=W*0.95, bTop=bankY+22, bRise=30;
  ctx.strokeStyle='#c0392b'; ctx.lineWidth=8; ctx.beginPath();
  ctx.moveTo(bx0,bTop+bRise); ctx.quadraticCurveTo(W*0.5,bTop-bRise, bx1,bTop+bRise); ctx.stroke();
  // railing posts + rail
  ctx.strokeStyle='#a52f22'; ctx.lineWidth=3; ctx.beginPath();
  ctx.moveTo(bx0,bTop+bRise-14); ctx.quadraticCurveTo(W*0.5,bTop-bRise-14, bx1,bTop+bRise-14); ctx.stroke();
  for(let i=0;i<=8;i++){ const u=i/8; const x=bx0+(bx1-bx0)*u; const y=bTop+bRise + (Math.pow(2*u-1,2)-1)*bRise*2 - 0;
    // point on the quadratic
    const qy=(1-u)*(1-u)*(bTop+bRise)+2*(1-u)*u*(bTop-bRise)+u*u*(bTop+bRise);
    ctx.strokeStyle='#a52f22'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,qy); ctx.lineTo(x,qy-14); ctx.stroke(); }
  // bridge reflection shimmer
  ctx.strokeStyle='rgba(192,57,43,.2)'; ctx.lineWidth=6; ctx.beginPath();
  ctx.moveTo(bx0,bTop+bRise+18); ctx.quadraticCurveTo(W*0.5,bTop-bRise+40, bx1,bTop+bRise+18); ctx.stroke();
}
registerScene('koipond', drawKoiPond);

/* ── GLASSBLOWING STUDIO (indoor · shaping molten glass) ── */
function drawGlassblowing(){
  const t=sceneTime, floorY=H*0.66;
  // dim hot shop
  ctx.fillStyle='#26201c'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#3a322a'; ctx.fillRect(0,floorY,W,H-floorY);
  for(let i=0;i<12;i++){ ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(0,floorY+i*((H-floorY)/12),W,1); }
  // furnace (glory hole) on the right glowing orange
  const fx=W*0.8, fy=floorY-8;
  const flick=0.7+0.3*Math.sin(t*6)+0.1*Math.sin(t*11);
  const wash=ctx.createRadialGradient(fx,fy-24,8,fx,fy-24,W*0.8);
  wash.addColorStop(0,`rgba(255,150,50,${0.28*flick})`); wash.addColorStop(1,'rgba(255,150,50,0)');
  ctx.fillStyle=wash; ctx.fillRect(0,0,W,H);
  // furnace body
  ctx.fillStyle='#4a3a2e'; ctx.fillRect(fx-40,fy-56,80,56+(H-fy));
  ctx.fillStyle='#5a4636'; ctx.fillRect(fx-40,fy-56,80,6);
  // round glowing mouth
  const mg=ctx.createRadialGradient(fx,fy-26,2,fx,fy-26,26);
  mg.addColorStop(0,`rgba(255,245,200,${flick})`); mg.addColorStop(0.5,'#ff7a1a'); mg.addColorStop(1,'#7a2408');
  ctx.fillStyle=mg; ctx.beginPath(); ctx.arc(fx,fy-26,22,0,7); ctx.fill();
  ctx.strokeStyle='#2a1a12'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(fx,fy-26,22,0,7); ctx.stroke();
  // heat shimmer above the furnace
  for(let i=0;i<4;i++){ ctx.strokeStyle=`rgba(255,180,90,${0.1+0.05*Math.sin(t*3+i)})`; ctx.lineWidth=3;
    const hx=fx-14+i*9; ctx.beginPath(); ctx.moveTo(hx,fy-48); for(let k=1;k<=3;k++) ctx.lineTo(hx+Math.sin(t*2+i+k)*5, fy-48-k*14); ctx.stroke(); }
  // the glassblower's bench (center) with rails
  const bx=W*0.16, by=floorY-6, bw=W*0.5;
  ctx.fillStyle='#3a2a1e'; ctx.fillRect(bx,by-4,bw,10+(H-by));
  ctx.strokeStyle='#8a7a5a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(bx+8,by-8); ctx.lineTo(bx+bw-8,by-8); ctx.stroke(); // rail
  ctx.beginPath(); ctx.moveTo(bx+8,by-14); ctx.lineTo(bx+bw-8,by-14); ctx.stroke();
  // blowpipe resting across the rails with a glowing molten gather rotating at the tip
  const pipeY=by-11;
  ctx.strokeStyle='#9a9aa2'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(bx+6,pipeY); ctx.lineTo(bx+bw+40,pipeY); ctx.stroke();
  const gx=bx+bw+44, gy=pipeY;
  const wob=1+0.08*Math.sin(t*8); // rotating gather pulses
  const gg=ctx.createRadialGradient(gx,gy,1,gx,gy,14);
  gg.addColorStop(0,'#fff4c8'); gg.addColorStop(0.5,'#ffb028'); gg.addColorStop(1,'#e0601a');
  ctx.fillStyle=gg; ctx.beginPath(); ctx.ellipse(gx,gy,13*wob,10,0,0,7); ctx.fill();
  // little glow trail dripping
  ctx.globalAlpha=0.5; ctx.fillStyle='#ffcf6a'; ctx.beginPath(); ctx.ellipse(gx,gy+10,3,5+Math.sin(t*4)*2,0,0,7); ctx.fill(); ctx.globalAlpha=1;
  // finished colored vessels cooling on a shelf (left wall)
  ctx.fillStyle='#5a4636'; ctx.fillRect(W*0.04,H*0.2,W*0.22,4);
  const vc=['#3aa0c0','#c04a6a','#4fa564','#d0a030'];
  for(let i=0;i<4;i++){ const vx=W*0.07+i*W*0.05; ctx.globalAlpha=0.85; ctx.fillStyle=vc[i];
    ctx.beginPath(); ctx.moveTo(vx-5,H*0.2); ctx.quadraticCurveTo(vx-8,H*0.16,vx,H*0.13); ctx.quadraticCurveTo(vx+8,H*0.16,vx+5,H*0.2); ctx.closePath(); ctx.fill();
    ctx.globalAlpha=1; ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(vx-3,H*0.15,1.5,4); }
  // jacks and shears hanging on the bench end
  ctx.strokeStyle='#aab'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(bx+bw-20,by-4); ctx.lineTo(bx+bw-24,by+14); ctx.moveTo(bx+bw-14,by-4); ctx.lineTo(bx+bw-10,by+14); ctx.stroke();
  // a bucket of water by the bench, steaming faintly
  ctx.fillStyle='#2a2420'; ctx.beginPath(); ctx.moveTo(bx+10,H-4); ctx.lineTo(bx+30,H-4); ctx.lineTo(bx+27,H-22); ctx.lineTo(bx+13,H-22); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a5a6a'; ctx.beginPath(); ctx.ellipse(bx+20,H-22,7,2.5,0,0,7); ctx.fill();
}
registerScene('glassblowing', drawGlassblowing);

/* ── COASTAL CLIFFS (outdoor · sea cliffs, crashing surf below) ── */
function drawCliffs(){
  const t=sceneTime, seaY=H*0.5;
  // breezy sky
  const sky=ctx.createLinearGradient(0,0,0,seaY); sky.addColorStop(0,'#7ab6dc'); sky.addColorStop(1,'#cfe6ee');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,seaY);
  for(let i=0;i<3;i++){ const cx=((t*7+i*150)%(W+120))-60; ctx.fillStyle='rgba(255,255,255,.8)';
    ctx.beginPath(); ctx.arc(cx,H*0.1+i*20,12,0,7); ctx.arc(cx+14,H*0.1+i*20+3,9,0,7); ctx.arc(cx-12,H*0.1+i*20+4,8,0,7); ctx.fill(); }
  // ocean
  const sea=ctx.createLinearGradient(0,seaY,0,H); sea.addColorStop(0,'#2f6f9a'); sea.addColorStop(1,'#1f5170');
  ctx.fillStyle=sea; ctx.fillRect(0,seaY,W,H-seaY);
  // swell lines
  for(let i=0;i<7;i++){ const ry=seaY+10+i*((H-seaY)/8); ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1.5;
    ctx.beginPath(); for(let x=0;x<=W;x+=10){ const yy=ry+Math.sin(x*0.05+t*1.2+i)*2.5; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // distant headland on the right
  ctx.fillStyle='#4a6a58'; ctx.beginPath(); ctx.moveTo(W,seaY); ctx.lineTo(W,seaY-30); ctx.quadraticCurveTo(W*0.82,seaY-24,W*0.7,seaY); ctx.closePath(); ctx.fill();
  // the main cliff mass on the left (grassy top, rocky face)
  ctx.fillStyle='#7a6a52'; // rock
  ctx.beginPath(); ctx.moveTo(0,seaY-40); ctx.lineTo(W*0.44,seaY-40);
  ctx.lineTo(W*0.5,seaY+30); ctx.lineTo(W*0.34,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  // rock striations
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1.5;
  for(let i=0;i<6;i++){ ctx.beginPath(); ctx.moveTo(0,seaY-30+i*14); ctx.lineTo(W*0.42+i*6,seaY-26+i*16); ctx.stroke(); }
  ctx.fillStyle='#8a7a60'; ctx.beginPath(); ctx.moveTo(W*0.34,H); ctx.lineTo(W*0.5,seaY+30); ctx.lineTo(W*0.5,H); ctx.closePath(); ctx.fill();
  // grassy clifftop
  ctx.fillStyle='#5f9a44'; ctx.beginPath(); ctx.moveTo(0,seaY-40); ctx.lineTo(W*0.44,seaY-40); ctx.lineTo(W*0.44,seaY-52); ctx.quadraticCurveTo(W*0.2,seaY-64,0,seaY-54); ctx.closePath(); ctx.fill();
  // wind-bent grass tufts + a couple of wildflowers on the edge
  for(let i=0;i<10;i++){ const gx=i*W*0.045; ctx.strokeStyle='#4f8a38'; ctx.lineWidth=1; const bend=3+Math.sin(t*2+i);
    ctx.beginPath(); ctx.moveTo(gx,seaY-52); ctx.quadraticCurveTo(gx+bend,seaY-60,gx+bend*2,seaY-64); ctx.stroke(); }
  for(let i=0;i<3;i++){ const fx=W*0.06+i*W*0.1; ctx.fillStyle=['#f2c14e','#e86a9a','#ffffff'][i]; ctx.beginPath(); ctx.arc(fx,seaY-64,2.5,0,7); ctx.fill(); }
  // white lighthouse-less — instead a small trig cairn on top
  ctx.fillStyle='#9a9a92'; ctx.beginPath(); ctx.moveTo(W*0.14,seaY-54); ctx.lineTo(W*0.18,seaY-54); ctx.lineTo(W*0.16,seaY-72); ctx.closePath(); ctx.fill();
  // crashing surf where the waves hit the cliff base — animated foam bursts
  const baseX=W*0.46, baseY=seaY+26;
  const burst=(Math.sin(t*1.6)+1)/2; // 0..1 pulse
  ctx.fillStyle=`rgba(255,255,255,${0.5+0.4*burst})`;
  for(let i=0;i<14;i++){ const a=-Math.PI*0.1 - i*0.12; const r=(10+burst*34)*(0.6+ (i%3)*0.2);
    ctx.beginPath(); ctx.arc(baseX+Math.cos(a)*r*0.7, baseY - Math.sin(-a)*r - burst*20, 4+burst*4,0,7); ctx.fill(); }
  // foam pool at the base
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(baseX+10,baseY+8,30,7,0,0,7); ctx.fill();
  // gulls wheeling over the sea
  for(let i=0;i<4;i++){ const gx=W*0.55+Math.sin(t*0.6+i*1.7)*W*0.3, gy=H*0.2+Math.cos(t*0.8+i)*24+i*6;
    ctx.strokeStyle='#f0f0ec'; ctx.lineWidth=1.5; ctx.beginPath();
    ctx.moveTo(gx-5,gy); ctx.quadraticCurveTo(gx,gy-4,gx+5,gy); ctx.stroke(); }
}
registerScene('cliffs', drawCliffs);

/* ── TERRARIUM SHOP (indoor · little glass-globe ecosystems) ── */
function drawTerrariumShop(){
  const t=sceneTime, floorY=H*0.66;
  // soft eucalyptus-green shop
  ctx.fillStyle='#dfeadd'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#b79a72'; ctx.fillRect(0,floorY,W,H-floorY); // warm wood floor
  for(let i=0;i<7;i++){ ctx.fillStyle='rgba(0,0,0,.06)'; ctx.fillRect(0,floorY+i*((H-floorY)/7),W,1); }
  // window with leafy light
  ctx.fillStyle='#c8e6d0'; ctx.fillRect(W*0.72,H*0.06,W*0.22,H*0.26);
  ctx.strokeStyle='#8a9a7a'; ctx.lineWidth=2; ctx.strokeRect(W*0.72,H*0.06,W*0.22,H*0.26);
  ctx.fillStyle='rgba(120,170,120,.4)'; for(let i=0;i<6;i++){ ctx.beginPath(); ctx.arc(W*0.74+i*W*0.035,H*0.1+(i%2)*10,5,0,7); ctx.fill(); }
  // a terrarium helper — a glass globe holding a tiny landscape
  function terrarium(x,base,r,kind){
    // stand
    ctx.fillStyle='#8a6a44'; ctx.fillRect(x-4,base,8,10); ctx.beginPath(); ctx.ellipse(x,base+10,8,3,0,0,7); ctx.fill();
    // soil + plants inside first (so glass overlays)
    ctx.save(); ctx.beginPath(); ctx.arc(x,base-r+2,r,0,7); ctx.clip();
    // sand/soil layers
    ctx.fillStyle='#d8c088'; ctx.fillRect(x-r,base-r*0.4,r*2,r); // sand
    ctx.fillStyle='#6a4a30'; ctx.fillRect(x-r,base-r*0.2,r*2,r); // soil
    ctx.fillStyle='#8a9a6a'; ctx.fillRect(x-r,base-r*0.28,r*2,3); // moss line
    if(kind===0){ // succulents
      for(let i=-1;i<=1;i++){ ctx.fillStyle='#4f8a4a'; for(let p=0;p<6;p++){ const a=p/6*Math.PI*2; ctx.beginPath(); ctx.ellipse(x+i*7,base-r*0.3+Math.cos(a)*1,2.2,4,a,0,7); ctx.fill(); } } }
    else if(kind===1){ // tiny fern + pebbles
      ctx.strokeStyle='#3f7a34'; ctx.lineWidth=1; for(let f=-2;f<=2;f++){ ctx.beginPath(); ctx.moveTo(x,base-r*0.28); ctx.quadraticCurveTo(x+f*4,base-r*0.6,x+f*6,base-r*0.9); ctx.stroke(); }
      ctx.fillStyle='#9a9a92'; for(let i=0;i<4;i++){ ctx.beginPath(); ctx.arc(x-6+i*4,base-r*0.24,1.5,0,7); ctx.fill(); } }
    else { // a little air plant / cactus
      ctx.fillStyle='#4f8a4a'; ctx.fillRect(x-2,base-r*0.7,4,r*0.4); ctx.beginPath(); ctx.arc(x,base-r*0.7,3,0,7); ctx.fill();
      ctx.fillStyle='#f2c14e'; ctx.beginPath(); ctx.arc(x,base-r*0.75,1.4,0,7); ctx.fill(); }
    ctx.restore();
    // glass globe (reflections)
    ctx.strokeStyle='rgba(180,210,220,.7)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,base-r+2,r,0,7); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.12)'; ctx.beginPath(); ctx.arc(x,base-r+2,r,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(x-r*0.4,base-r*1.3,r*0.16,r*0.3,-0.5,0,7); ctx.fill();
    // condensation droplets that slowly drift
    for(let i=0;i<3;i++){ ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(x-r*0.5+i*r*0.4, base-r*1.1+Math.sin(t*1.5+i+x)*3, 1.2,0,7); ctx.fill(); }
  }
  // two shelves of terrariums
  for(let s=0;s<2;s++){ const sy=H*0.22+s*H*0.2;
    ctx.fillStyle='#a5885f'; ctx.fillRect(W*0.04,sy+14,W*0.62,5);
    terrarium(W*0.13,sy+14,14,(s)%3);
    terrarium(W*0.3,sy+14,16,(s+1)%3);
    terrarium(W*0.48,sy+14,13,(s+2)%3);
    terrarium(W*0.62,sy+14,15,(s)%3);
  }
  // a big hanging glass teardrop terrarium, gently swaying
  const sway=Math.sin(t*1.1)*5;
  ctx.strokeStyle='#888'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.84,0); ctx.lineTo(W*0.84+sway,H*0.34); ctx.stroke();
  ctx.save(); ctx.translate(W*0.84+sway,H*0.4);
  ctx.fillStyle='rgba(200,225,230,.25)'; ctx.beginPath(); ctx.arc(0,0,20,0,7); ctx.fill();
  ctx.fillStyle='#8a9a6a'; ctx.beginPath(); ctx.arc(0,8,14,0,Math.PI); ctx.fill();
  ctx.fillStyle='#4f8a4a'; for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.arc(i*6,4,4,0,7); ctx.fill(); }
  ctx.strokeStyle='rgba(180,210,220,.8)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,20,0,7); ctx.stroke();
  ctx.restore();
  // potting counter with soil bag + scoop + spray bottle in foreground
  const cY=floorY-4; ctx.fillStyle='#9a7a54'; ctx.fillRect(W*0.05,cY-8,W*0.36,8+(H-cY)); ctx.fillStyle='#a5885f'; ctx.fillRect(W*0.05,cY-8,W*0.36,4);
  ctx.fillStyle='#5a4a38'; ctx.fillRect(W*0.1,cY-20,20,12); // soil bag
  ctx.fillStyle='#c0c0c8'; ctx.beginPath(); ctx.ellipse(W*0.2,cY-6,6,3,0,0,7); ctx.fill(); // scoop
  ctx.fillStyle='#4a86c0'; ctx.fillRect(W*0.3,cY-16,6,12); ctx.fillStyle='#333'; ctx.fillRect(W*0.31,cY-22,3,6); // spray bottle
}
registerScene('terrariumshop', drawTerrariumShop);

/* ── SALT FLATS (outdoor · mirror salt pan at dusk) ── */
function drawSaltFlats(){
  const t=sceneTime, horizon=H*0.5;
  // dusk gradient sky
  const sky=ctx.createLinearGradient(0,0,0,horizon);
  sky.addColorStop(0,'#6a5a9a'); sky.addColorStop(0.5,'#d98aa0'); sky.addColorStop(1,'#f6c98a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,horizon);
  // sun near the horizon
  const sunX=W*0.5, sunY=horizon-8;
  ctx.fillStyle='#ffe0a0'; ctx.beginPath(); ctx.arc(sunX,sunY,22,0,7); ctx.fill();
  ctx.globalAlpha=0.3; ctx.beginPath(); ctx.arc(sunX,sunY,36,0,7); ctx.fill(); ctx.globalAlpha=1;
  // clouds
  for(let i=0;i<4;i++){ const cx=((t*4+i*110)%(W+120))-60, cy=H*0.14+i*16;
    ctx.fillStyle=`rgba(255,220,210,${0.5-i*0.08})`; ctx.beginPath(); ctx.ellipse(cx,cy,26,6,0,0,7); ctx.fill(); }
  // distant mountains
  ctx.fillStyle='#7a6a86'; ctx.beginPath(); ctx.moveTo(0,horizon); ctx.lineTo(W*0.18,horizon-22); ctx.lineTo(W*0.34,horizon); ctx.lineTo(W*0.6,horizon-16); ctx.lineTo(W*0.82,horizon); ctx.lineTo(W,horizon-20); ctx.lineTo(W,horizon); ctx.closePath(); ctx.fill();
  // the wet salt pan reflecting everything (mirror)
  const refl=ctx.createLinearGradient(0,horizon,0,H);
  refl.addColorStop(0,'#f0c890'); refl.addColorStop(0.4,'#d68aa0'); refl.addColorStop(1,'#8a7aa8');
  ctx.fillStyle=refl; ctx.fillRect(0,horizon,W,H-horizon);
  // mirrored sun (blurred, wavering column)
  for(let i=0;i<14;i++){ const gy=horizon+2+i*((H-horizon)/14); const wob=Math.sin(t*2+i*0.6)*6;
    ctx.fillStyle=`rgba(255,224,160,${0.5-i*0.03})`; ctx.fillRect(sunX-14+wob, gy, 28, 3); }
  // mirrored mountains (faint, inverted)
  ctx.save(); ctx.globalAlpha=0.3; ctx.fillStyle='#7a6a86';
  ctx.beginPath(); ctx.moveTo(0,horizon); ctx.lineTo(W*0.18,horizon+22); ctx.lineTo(W*0.34,horizon); ctx.lineTo(W*0.6,horizon+16); ctx.lineTo(W*0.82,horizon); ctx.lineTo(W,horizon+20); ctx.lineTo(W,horizon); ctx.closePath(); ctx.fill();
  ctx.restore();
  // the polygonal salt crust pattern emerging in the foreground
  ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1;
  for(let r=0;r<5;r++){ const y=H*0.72+r*((H-H*0.72)/5); const scale=1+r*0.5;
    for(let x=-20;x<W+20;x+=28*scale){ const cx=x+ (r%2)*14*scale;
      ctx.beginPath();
      ctx.moveTo(cx,y); ctx.lineTo(cx+14*scale,y+6*scale); ctx.lineTo(cx+28*scale,y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+14*scale,y+6*scale); ctx.lineTo(cx+14*scale,y+ (14)*scale); ctx.stroke();
    }
  }
  // a thin shimmer of standing water highlights
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1.5;
  for(let i=0;i<4;i++){ const ry=horizon+30+i*24; ctx.beginPath(); for(let x=0;x<=W;x+=12){ const yy=ry+Math.sin(x*0.05+t*1.5+i)*1.5; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // a lone person's tiny silhouette + long reflection near center for scale
  const px=W*0.66;
  ctx.fillStyle='#2a2436'; ctx.fillRect(px-1,horizon-14,2,14); ctx.beginPath(); ctx.arc(px,horizon-16,2,0,7); ctx.fill();
  ctx.globalAlpha=0.3; ctx.fillRect(px-1,horizon,2,12); ctx.globalAlpha=1;
}
registerScene('saltflats', drawSaltFlats);

/* ── BOOKBINDERY (indoor · hand binding & gold tooling) ── */
function drawBookbindery(){
  const t=sceneTime, floorY=H*0.66;
  // warm workshop
  ctx.fillStyle='#c8a86a'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#7a5636'; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='#b89a5c'; ctx.fillRect(0,H*0.12,W,2);
  // leather hides hanging on the back wall (colored)
  const hides=['#8a3a2a','#2f5a3a','#3a4a7a','#7a5a20'];
  for(let i=0;i<4;i++){ const hx=W*0.06+i*W*0.1; ctx.fillStyle=hides[i];
    ctx.beginPath(); ctx.moveTo(hx,H*0.14); ctx.lineTo(hx+30,H*0.14); ctx.quadraticCurveTo(hx+34,H*0.28,hx+24,H*0.34); ctx.quadraticCurveTo(hx+15,H*0.3,hx+6,H*0.34); ctx.quadraticCurveTo(hx-4,H*0.26,hx,H*0.14); ctx.fill();
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(hx+12,H*0.13,2,3); }
  // shelf of finished bound books (spines, gold bands)
  ctx.fillStyle='#5a3e26'; ctx.fillRect(W*0.55,H*0.16,W*0.4,4);
  const spineCols=['#7a2a2a','#2a4a3a','#2a3a6a','#5a3a6a','#7a5a2a','#3a5a5a'];
  for(let i=0;i<9;i++){ const bx=W*0.56+i*W*0.043; ctx.fillStyle=spineCols[i%spineCols.length]; ctx.fillRect(bx,H*0.16-26,W*0.036,26);
    ctx.fillStyle='#d4af37'; ctx.fillRect(bx,H*0.16-22,W*0.036,1.5); ctx.fillRect(bx,H*0.16-10,W*0.036,1.5); }
  // the workbench
  const by=floorY-4;
  ctx.fillStyle='#6a4a30'; ctx.fillRect(0,by-8,W,8+(H-by));
  ctx.fillStyle='#7a5638'; ctx.fillRect(0,by-8,W,4);
  // cast-iron nipping press (center) with a book being pressed + spinning wheel
  const px=W*0.5;
  ctx.fillStyle='#3a3a42'; ctx.fillRect(px-26,by-18,52,10); // top plate
  ctx.fillRect(px-26,by-54,6,44); ctx.fillRect(px+20,by-54,6,44); // side posts
  ctx.fillStyle='#4a4a52'; ctx.fillRect(px-26,by-58,52,8); // top bar
  // the pressed book
  ctx.fillStyle='#e8dcc0'; ctx.fillRect(px-18,by-30,36,12);
  ctx.fillStyle='#8a3a2a'; ctx.fillRect(px-18,by-30,4,12);
  // the big turning wheel/handle on top
  const wy=by-58, wr=12, rot=t*1.5;
  ctx.strokeStyle='#2a2a30'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(px,wy-8,wr,0,7); ctx.stroke();
  for(let s=0;s<4;s++){ const a=rot+s*Math.PI/2; ctx.beginPath(); ctx.moveTo(px,wy-8); ctx.lineTo(px+Math.cos(a)*wr,wy-8+Math.sin(a)*wr); ctx.stroke(); }
  ctx.fillStyle='#5a5a62'; ctx.beginPath(); ctx.arc(px,wy-8,3,0,7); ctx.fill();
  ctx.fillStyle='#3a3a42'; ctx.fillRect(px-2,wy-8,4,8); // screw shaft down to plate
  // sewing frame on the left (threads under tension)
  const sx=W*0.16;
  ctx.fillStyle='#5a3e26'; ctx.fillRect(sx-24,by-46,4,42); ctx.fillRect(sx+20,by-46,4,42); ctx.fillRect(sx-24,by-46,48,4);
  ctx.strokeStyle='#e8e0d0'; ctx.lineWidth=1; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(sx-16+i*8,by-44); ctx.lineTo(sx-16+i*8,by-8); ctx.stroke(); }
  // signatures (folded pages) being sewn at the base of the frame
  ctx.fillStyle='#f0e8d4'; ctx.fillRect(sx-18,by-12,36,8); ctx.strokeStyle='#c8b898'; ctx.strokeRect(sx-18,by-12,36,8);
  // gold-tooling iron heating in a little brazier on the right, glowing tip
  const gx=W*0.84;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(gx-10,by-8,20,8);
  const glow=0.5+0.5*Math.abs(Math.sin(t*3));
  ctx.strokeStyle='#6a5040'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(gx,by-6); ctx.lineTo(gx+16,by-22); ctx.stroke();
  ctx.globalAlpha=glow; ctx.fillStyle='#ff9a3a'; ctx.beginPath(); ctx.arc(gx,by-6,3,0,7); ctx.fill(); ctx.globalAlpha=1;
  // spools of thread + a bone folder on the bench foreground
  for(let i=0;i<3;i++){ ctx.fillStyle=['#c04a6a','#4a86c0','#f2c14e'][i]; ctx.beginPath(); ctx.arc(W*0.34+i*W*0.06,by+6,5,0,7); ctx.fill();
    ctx.fillStyle='#7a5638'; ctx.beginPath(); ctx.arc(W*0.34+i*W*0.06,by+6,1.6,0,7); ctx.fill(); }
  ctx.fillStyle='#efe8d8'; ctx.save(); ctx.translate(W*0.62,by+8); ctx.rotate(0.3); ctx.fillRect(-12,-2,24,4); ctx.restore();
}
registerScene('bookbindery', drawBookbindery);

/* ── METEOR SHOWER (outdoor · night hills, streaking meteors) ── */
function drawMeteorShower(){
  const t=sceneTime, hillY=H*0.72;
  // deep night sky gradient
  const sky=ctx.createLinearGradient(0,0,0,hillY); sky.addColorStop(0,'#0a1430'); sky.addColorStop(1,'#243a5a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,hillY);
  // milky-way band
  ctx.save(); ctx.globalAlpha=0.12; ctx.fillStyle='#cfd8f0';
  ctx.beginPath(); ctx.moveTo(0,H*0.1); ctx.quadraticCurveTo(W*0.5,H*0.32,W,H*0.06); ctx.lineTo(W,H*0.2); ctx.quadraticCurveTo(W*0.5,H*0.46,0,H*0.24); ctx.closePath(); ctx.fill(); ctx.restore();
  // star field (twinkle)
  for(let i=0;i<90;i++){ const sx=(i*47+13)%W, sy=(i*89+7)%hillY; const tw=0.4+0.6*Math.abs(Math.sin(t*2+i));
    ctx.fillStyle=`rgba(255,255,255,${tw*0.9})`; const r=(i%11===0)?1.6:0.9; ctx.fillRect(sx,sy,r,r); }
  // meteors — several streaks at staggered times, top-right to lower-left
  for(let m=0;m<5;m++){ const period=2.2, phase=(t*0.9 + m*0.44) % period; const p=phase/period; // 0..1
    if(p<0.55){ const prog=p/0.55; // active portion
      const x0=W*0.7+m*W*0.12, y0=-10 - m*8;
      const dx=-W*0.5, dy=hillY*0.7;
      const hx=x0+dx*prog, hy=y0+dy*prog;
      const len=40;
      const tx=hx - dx/Math.hypot(dx,dy)*len, ty=hy - dy/Math.hypot(dx,dy)*len;
      const grad=ctx.createLinearGradient(tx,ty,hx,hy); grad.addColorStop(0,'rgba(255,255,255,0)'); grad.addColorStop(1,`rgba(255,250,220,${1-prog*0.4})`);
      ctx.strokeStyle=grad; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(hx,hy); ctx.stroke();
      ctx.fillStyle='rgba(255,255,240,.9)'; ctx.beginPath(); ctx.arc(hx,hy,2,0,7); ctx.fill();
    } }
  // a bright slow "fireball" occasionally crossing
  { const fp=(t*0.25)%1; if(fp<0.5){ const prog=fp/0.5; const fx=W*1.0 - W*1.1*prog, fy=H*0.1+H*0.14*prog;
    const grad=ctx.createLinearGradient(fx+70,fy-30,fx,fy); grad.addColorStop(0,'rgba(120,180,255,0)'); grad.addColorStop(1,'rgba(180,220,255,.8)');
    ctx.strokeStyle=grad; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(fx+70,fy-30); ctx.lineTo(fx,fy); ctx.stroke();
    ctx.fillStyle='rgba(220,235,255,.95)'; ctx.beginPath(); ctx.arc(fx,fy,3,0,7); ctx.fill(); } }
  // silhouetted rolling hills
  ctx.fillStyle='#0d1a24'; ctx.beginPath(); ctx.moveTo(0,hillY);
  for(let x=0;x<=W;x+=12){ ctx.lineTo(x, hillY + Math.sin(x*0.02)*10 - 6); } ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#060f16'; ctx.beginPath(); ctx.moveTo(0,H*0.86);
  for(let x=0;x<=W;x+=12){ ctx.lineTo(x, H*0.86 + Math.sin(x*0.03+2)*8); } ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  // a lone tree on a hill
  ctx.fillStyle='#040a10'; ctx.fillRect(W*0.8-2,hillY-18,4,18); ctx.beginPath(); ctx.arc(W*0.8,hillY-22,10,0,7); ctx.fill();
  // two tiny silhouettes lying on a blanket, stargazing
  const bx=W*0.3;
  ctx.fillStyle='#0a0f14'; ctx.fillRect(bx-16,H*0.9,40,4); // blanket
  ctx.beginPath(); ctx.ellipse(bx-6,H*0.9-2,8,3,-0.2,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(bx+10,H*0.9-2,8,3,0.2,0,7); ctx.fill();
  ctx.beginPath(); ctx.arc(bx-13,H*0.9-4,2.4,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(bx+17,H*0.9-4,2.4,0,7); ctx.fill();
}
registerScene('meteorshower', drawMeteorShower);

/* ── LETTERPRESS SHOP (indoor · printing with a platen press) ── */
function drawLetterpress(){
  const t=sceneTime, floorY=H*0.66;
  // inky workshop
  ctx.fillStyle='#c2b79a'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#6a5a44'; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='#a99a78'; ctx.fillRect(0,H*0.12,W,2);
  // type-case cabinet on the left (grid of little compartments)
  const cx=W*0.06, cy=H*0.14, cw=W*0.26, ch=H*0.34;
  ctx.fillStyle='#5a3e26'; ctx.fillRect(cx-4,cy-4,cw+8,ch+8);
  ctx.fillStyle='#c8b088'; ctx.fillRect(cx,cy,cw,ch);
  ctx.strokeStyle='#8a7452'; ctx.lineWidth=1;
  for(let r=0;r<6;r++) for(let c=0;c<7;c++){ ctx.strokeRect(cx+c*(cw/7),cy+r*(ch/6),cw/7,ch/6);
    if((r*7+c)%3===0){ ctx.fillStyle='#3a3a42'; ctx.fillRect(cx+c*(cw/7)+2,cy+r*(ch/6)+3,3,ch/6-6); } }
  // drying line with fresh prints pinned overhead, gently fluttering
  ctx.strokeStyle='#8a7452'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.38,H*0.08); ctx.lineTo(W*0.98,H*0.06); ctx.stroke();
  const prints=['#f4efe2','#eef2f4','#f6ecec','#eef4ec'];
  for(let i=0;i<5;i++){ const px=W*0.42+i*W*0.12, flap=Math.sin(t*2+i)*3;
    ctx.save(); ctx.translate(px,H*0.07); ctx.rotate(flap*0.02);
    ctx.fillStyle=prints[i%prints.length]; ctx.fillRect(-14,0,28,34);
    ctx.fillStyle='#2a2a30'; ctx.fillRect(-9,6,18,3); ctx.fillRect(-9,13,12,2); ctx.fillRect(-9,18,16,2); // "text"
    ctx.fillStyle='#8a2a2a'; ctx.fillRect(-9,24,8,6);
    ctx.restore();
    ctx.fillStyle='#888'; ctx.fillRect(px-1,H*0.06,2,4); } // clothespin
  // the cast-iron platen press (center) with a big rotating flywheel
  const bx=W*0.5, by=floorY;
  ctx.fillStyle='#2f3a3a'; ctx.fillRect(bx-30,by-70,60,70); // frame body
  ctx.fillStyle='#3a4a4a'; ctx.fillRect(bx-34,by-8,68,8+(H-by)); // base
  // the round ink disk at top
  ctx.fillStyle='#1a1a1e'; ctx.beginPath(); ctx.arc(bx,by-72,16,0,7); ctx.fill();
  ctx.fillStyle='#2a2a30'; ctx.save(); ctx.translate(bx,by-72); ctx.rotate(t*0.6); ctx.beginPath(); ctx.moveTo(-16,0); ctx.lineTo(16,0); ctx.stroke?.(); ctx.restore();
  ctx.fillStyle='rgba(120,120,140,.3)'; ctx.beginPath(); ctx.arc(bx-5,by-77,5,0,7); ctx.fill(); // ink sheen
  // the platen (hinged plate) that opens & closes to print
  const openAmt=(Math.sin(t*1.6)+1)/2; // 0 closed .. 1 open
  ctx.save(); ctx.translate(bx,by-30); ctx.rotate(-openAmt*0.7);
  ctx.fillStyle='#4a5a5a'; ctx.fillRect(-4,-24,8,48); // platen with paper
  ctx.fillStyle='#f4efe2'; ctx.fillRect(-2,-20,10,40);
  ctx.restore();
  // the big flywheel on the right side, spinning
  const wx=bx+44, wy=by-40, wr=26, rot=t*2.4;
  ctx.strokeStyle='#1e1e22'; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(wx,wy,wr,0,7); ctx.stroke();
  ctx.strokeStyle='#3a3a42'; ctx.lineWidth=2; for(let s=0;s<6;s++){ const a=rot+s*Math.PI/3; ctx.beginPath(); ctx.moveTo(wx,wy); ctx.lineTo(wx+Math.cos(a)*wr,wy+Math.sin(a)*wr); ctx.stroke(); }
  ctx.fillStyle='#5a5a62'; ctx.beginPath(); ctx.arc(wx,wy,4,0,7); ctx.fill();
  // the operator's flywheel handle knob
  ctx.fillStyle='#8a3a2a'; ctx.beginPath(); ctx.arc(wx+Math.cos(rot)*(wr-4),wy+Math.sin(rot)*(wr-4),3,0,7); ctx.fill();
  // ink cans + a brayer roller on a side table (right)
  const tx=W*0.86, ty=floorY-2;
  ctx.fillStyle='#5a3e26'; ctx.fillRect(tx-18,ty-6,W*0.16,6+(H-ty));
  const ink=['#c8202a','#2a4a9a','#1a1a1e','#d0a030'];
  for(let i=0;i<4;i++){ ctx.fillStyle=ink[i]; ctx.fillRect(tx-14+i*10,ty-16,8,10); ctx.fillStyle='#aaa'; ctx.fillRect(tx-14+i*10,ty-18,8,2); }
  ctx.fillStyle='#333'; ctx.fillRect(tx-16,ty-24,22,4); ctx.fillStyle='#8a7452'; ctx.fillRect(tx+4,ty-26,2,6); // brayer
}
registerScene('letterpress', drawLetterpress);

/* ── GLOWWORM CAVE (nature · bioluminescent grotto over dark water) ── */
function drawGlowwormCave(){
  const t=sceneTime, waterY=H*0.62;
  // near-black cavern
  ctx.fillStyle='#04060c'; ctx.fillRect(0,0,W,H);
  // faint cave-mouth glow far back on the right
  const mg=ctx.createRadialGradient(W*0.9,waterY*0.6,4,W*0.9,waterY*0.6,W*0.5);
  mg.addColorStop(0,'rgba(40,70,90,.35)'); mg.addColorStop(1,'rgba(40,70,90,0)');
  ctx.fillStyle=mg; ctx.fillRect(0,0,W,H);
  // jagged ceiling silhouette with hanging stalactites
  ctx.fillStyle='#0a0e16'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W,0);
  ctx.lineTo(W,H*0.12);
  for(let x=W;x>=0;x-=W/12){ const drop=H*0.1+ (Math.sin(x*0.7)+1)*H*0.05; ctx.lineTo(x-W/24, H*0.12+drop); ctx.lineTo(x-W/12, H*0.1); }
  ctx.lineTo(0,H*0.12); ctx.closePath(); ctx.fill();
  // long thin stalactites
  ctx.fillStyle='#0c1018'; for(let i=0;i<9;i++){ const sx=W*0.05+i*W*0.11; const len=H*0.06+ (i%3)*H*0.04;
    ctx.beginPath(); ctx.moveTo(sx-4,H*0.14); ctx.lineTo(sx+4,H*0.14); ctx.lineTo(sx,H*0.14+len); ctx.closePath(); ctx.fill(); }
  // constellation of glowworms on the ceiling (blue-green points, gently pulsing)
  const worms=[];
  for(let i=0;i<70;i++){ const wx=(i*53+17)%W; const wy=H*0.06+ ((i*37)% (Math.floor(waterY*0.6)));
    const pulse=0.4+0.6*Math.abs(Math.sin(t*1.5 + i*0.7));
    worms.push([wx,wy,pulse]);
    ctx.fillStyle=`rgba(120,230,210,${pulse})`; const r=(i%9===0)?1.8:1.1; ctx.fillRect(wx,wy,r,r);
    if(i%9===0){ ctx.globalAlpha=pulse*0.4; ctx.beginPath(); ctx.arc(wx+0.5,wy+0.5,4,0,7); ctx.fill(); ctx.globalAlpha=1; }
    // faint silk thread hanging down
    if(i%6===0){ ctx.strokeStyle=`rgba(120,230,210,${pulse*0.15})`; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(wx,wy); ctx.lineTo(wx,wy+14); ctx.stroke(); }
  }
  // still black underground river
  const water=ctx.createLinearGradient(0,waterY,0,H); water.addColorStop(0,'#061218'); water.addColorStop(1,'#020508');
  ctx.fillStyle=water; ctx.fillRect(0,waterY,W,H-waterY);
  // reflection of the glowworms in the water (wavering, dimmer)
  for(const [wx,wy,pulse] of worms){ if(wy<waterY*0.9){ const ry=waterY + (waterY - wy)*0.5 + Math.sin(t*1.2+wx*0.1)*1.5;
    if(ry<H){ ctx.fillStyle=`rgba(90,200,190,${pulse*0.3})`; ctx.fillRect(wx+Math.sin(t+wx)*1, ry, 1.2,1.2); } } }
  // gentle water surface ripple lines
  for(let i=0;i<5;i++){ const ry=waterY+8+i*((H-waterY)/6); ctx.strokeStyle='rgba(120,230,210,.05)'; ctx.lineWidth=1.5;
    ctx.beginPath(); for(let x=0;x<=W;x+=10){ const yy=ry+Math.sin(x*0.05+t*1+i)*1.5; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // a small silhouetted boat drifting with a lantern-less rower
  const bx=(t*10)%(W+80)-40, by=waterY+18;
  ctx.fillStyle='#010304'; ctx.beginPath(); ctx.moveTo(bx-16,by); ctx.lineTo(bx+16,by); ctx.lineTo(bx+11,by+6); ctx.lineTo(bx-11,by+6); ctx.closePath(); ctx.fill();
  ctx.fillRect(bx-2,by-10,4,10); ctx.beginPath(); ctx.arc(bx,by-12,2.4,0,7); ctx.fill(); // rower
  // its reflection
  ctx.globalAlpha=0.3; ctx.beginPath(); ctx.moveTo(bx-16,by+8); ctx.lineTo(bx+16,by+8); ctx.lineTo(bx+11,by+2); ctx.lineTo(bx-11,by+2); ctx.closePath(); ctx.fill(); ctx.globalAlpha=1;
}
registerScene('glowwormcave', drawGlowwormCave);
