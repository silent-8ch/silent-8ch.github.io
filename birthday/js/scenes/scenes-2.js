/* scenes 2/4  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */


/* ── ROOFTOP GARDEN AT NIGHT (outdoor · urban) ── */
function drawRooftop(){
  const t = sceneTime, deckY = H*0.66;

  // night sky + stars + moon
  const sky=ctx.createLinearGradient(0,0,0,deckY); sky.addColorStop(0,'#1a1a3a'); sky.addColorStop(1,'#3a2a4a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,deckY);
  for (let i=0;i<40;i++){ const sx=(i*83+5)%W, sy=(i*41+3)%(deckY*0.6); ctx.fillStyle=`rgba(255,255,255,${0.3+0.4*Math.sin(t*2+i)})`; ctx.fillRect(sx,sy,1.2,1.2); }
  ctx.fillStyle='#f0ecd0'; ctx.beginPath(); ctx.arc(W*0.85,H*0.12,14,0,7); ctx.fill();

  // city skyline with lit windows (deterministic PRNG)
  let seed=1; const rnd=()=>{ seed=(seed*9301+49297)%233280; return seed/233280; };
  let bx=0;
  while (bx<W){
    const bw=20+Math.floor(rnd()*26), bh=40+Math.floor(rnd()*90), bTop=deckY-bh;
    ctx.fillStyle='#12101e'; ctx.fillRect(bx,bTop,bw,bh);
    for (let wy=bTop+6; wy<deckY-6; wy+=8) for (let wx=bx+4; wx<bx+bw-4; wx+=7){ if (rnd()>0.55){ ctx.fillStyle=`rgba(255,210,120,${0.5+0.4*rnd()})`; ctx.fillRect(wx,wy,3,4); } }
    bx+=bw+2;
  }

  // deck floor
  const deck=ctx.createLinearGradient(0,deckY,0,H); deck.addColorStop(0,'#6a4a32'); deck.addColorStop(1,'#513826');
  ctx.fillStyle=deck; ctx.fillRect(0,deckY,W,H-deckY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=22){ ctx.beginPath(); ctx.moveTo(x,deckY); ctx.lineTo(x,H); ctx.stroke(); }

  // string lights
  ctx.strokeStyle='rgba(120,100,80,.8)'; ctx.lineWidth=1; ctx.beginPath();
  for (let x=0;x<=W;x+=10){ const y=20+Math.sin(x*0.03)*10; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y); } ctx.stroke();
  for (let x=14;x<W;x+=28){ const y=26+Math.sin(x*0.03)*10; ctx.fillStyle='rgba(255,200,100,.15)'; ctx.beginPath(); ctx.arc(x,y,7,0,7); ctx.fill(); ctx.fillStyle=`rgba(255,200,100,${0.7+0.3*Math.sin(t*3+x)})`; ctx.beginPath(); ctx.arc(x,y,3,0,7); ctx.fill(); }

  // potted plants
  drawPotPlant(W*0.10,deckY,0.9,'bush');
  drawPotPlant(W*0.90,deckY,0.85,'flower');

  // bistro table + chairs + candle
  const tX=W*0.5, tY=deckY+16;
  ctx.fillStyle='#2e2e38';
  ctx.fillRect(tX-34,tY+2,10,4); ctx.fillRect(tX-34,tY+6,3,16); ctx.fillRect(tX-27,tY+6,3,16); ctx.fillRect(tX-34,tY-8,10,12);
  ctx.fillRect(tX+24,tY+2,10,4); ctx.fillRect(tX+24,tY+6,3,16); ctx.fillRect(tX+31,tY+6,3,16); ctx.fillRect(tX+24,tY-8,10,12);
  ctx.fillStyle='#3a3a44'; ctx.fillRect(tX-2,tY,4,26); ctx.beginPath(); ctx.ellipse(tX,tY,20,6,0,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,210,130,.4)'; ctx.beginPath(); ctx.arc(tX,tY-5,7,0,7); ctx.fill();
  ctx.fillStyle='#ffd27f'; ctx.beginPath(); ctx.arc(tX,tY-5,2.5,0,7); ctx.fill();

  // a cat resting on the deck
  SpriteRenderer.submit({sprite:'cat',phase:'ground',x:W*0.74,y:deckY+8,width:22,height:22,anchorY:1,frame:Math.floor(t*7)%4});
  // teacup on the table
  SpriteRenderer.submit({sprite:'teacup',phase:'ground',x:W*0.48,y:deckY+12,width:14,height:14,anchorY:1,frame:0});
}
registerScene('rooftop', drawRooftop);

/* ── TEA HOUSE (indoor · tea ceremony) ── */
function drawTeaHouse(){
  const t = sceneTime, floorY = H*0.60;

  // warm wall
  ctx.fillStyle='#e8dcc4'; ctx.fillRect(0,0,W,floorY);
  // glowing shoji screen
  const shX=W*0.55, shW=W*0.42, shY=H*0.08, shH=floorY-shY-4;
  ctx.fillStyle='#f7ead0'; ctx.fillRect(shX,shY,shW,shH);
  ctx.fillStyle='rgba(255,220,150,.18)'; ctx.fillRect(shX,shY,shW,shH);
  ctx.strokeStyle='#7a5a3a'; ctx.lineWidth=3; ctx.strokeRect(shX,shY,shW,shH);
  ctx.lineWidth=1.5;
  for (let x=shX;x<=shX+shW+1;x+=shW/4){ ctx.beginPath(); ctx.moveTo(x,shY); ctx.lineTo(x,shY+shH); ctx.stroke(); }
  for (let y=shY;y<=shY+shH+1;y+=shH/5){ ctx.beginPath(); ctx.moveTo(shX,y); ctx.lineTo(shX+shW,y); ctx.stroke(); }

  // hanging scroll
  const scX=W*0.16, scY=H*0.10;
  ctx.fillStyle='#efe6d2'; ctx.fillRect(scX-14,scY,28,64);
  ctx.fillStyle='#8a5a3a'; ctx.fillRect(scX-16,scY-4,32,4); ctx.fillRect(scX-16,scY+64,32,4);
  ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(scX,scY+12); ctx.quadraticCurveTo(scX+6,scY+28,scX-4,scY+40); ctx.stroke();
  ctx.beginPath(); ctx.arc(scX,scY+50,4,0,7); ctx.stroke();

  // tatami floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#bcae7a'); fl.addColorStop(1,'#a89a68');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(120,110,70,.25)'; ctx.lineWidth=1; for (let y=floorY+4;y<H;y+=4){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.strokeStyle='#3a4a2a'; ctx.lineWidth=2;
  for (let x=0;x<=W;x+=W/3){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x,H); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0,floorY+(H-floorY)/2); ctx.lineTo(W,floorY+(H-floorY)/2); ctx.stroke();

  // paper lantern
  const lX=W*0.32, lY=H*0.06;
  ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lX,0); ctx.lineTo(lX,lY); ctx.stroke();
  ctx.fillStyle='rgba(255,180,90,.18)'; ctx.beginPath(); ctx.arc(lX,lY+15,26,0,7); ctx.fill();
  ctx.fillStyle=`rgba(255,180,90,${0.7+0.1*Math.sin(t*2)})`; roundRect(lX-12,lY,24,30,10); ctx.fill();
  ctx.strokeStyle='#c04a2a'; for (let i=1;i<4;i++){ ctx.beginPath(); ctx.moveTo(lX-12,lY+i*7); ctx.lineTo(lX+12,lY+i*7); ctx.stroke(); }

  // low tea table with teapot, cups, steam
  const tX=W*0.42, tY=floorY+30;
  ctx.fillStyle='#6a4326'; roundRect(tX-40,tY,80,10,3); ctx.fill(); ctx.fillRect(tX-34,tY+10,5,14); ctx.fillRect(tX+29,tY+10,5,14);
  ctx.fillStyle='#3a5a4a'; ctx.beginPath(); ctx.ellipse(tX-10,tY-6,12,9,0,0,7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(tX-22,tY-6); ctx.lineTo(tX-30,tY-12); ctx.lineTo(tX-28,tY-4); ctx.closePath(); ctx.fill();
  ctx.fillRect(tX-11,tY-18,2,4);
  ctx.fillStyle='#efe6d2'; ctx.beginPath(); ctx.arc(tX+10,tY-2,4,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(tX+22,tY-2,4,0,7); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=2; ctx.beginPath();
  for (let k=0;k<=8;k++){ const yy=tY-14-k*4, xx=tX-10+Math.sin(t*3+k*0.6)*3; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy); } ctx.stroke();

  // bonsai on a stand
  const boX=W*0.87, boY=floorY+8;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(boX-14,boY,28,6); ctx.fillRect(boX-12,boY+6,4,14); ctx.fillRect(boX+8,boY+6,4,14);
  ctx.fillStyle='#7a5a3a'; ctx.beginPath(); ctx.ellipse(boX,boY-2,12,4,0,0,7); ctx.fill();
  ctx.strokeStyle='#5a3a22'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(boX,boY-2); ctx.lineTo(boX-2,boY-16); ctx.lineTo(boX+6,boY-22); ctx.stroke();
  ctx.fillStyle='#4a7a3a'; ctx.beginPath(); ctx.ellipse(boX+6,boY-24,12,6,0,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(boX-6,boY-18,8,5,0,0,7); ctx.fill();

  // teacups on the low table
  SpriteRenderer.submit({sprite:'teacup',phase:'ground',x:W*0.35,y:floorY+12,width:14,height:14,anchorY:1,frame:0});
  SpriteRenderer.submit({sprite:'teacup',phase:'ground',x:W*0.46,y:floorY+14,width:14,height:14,anchorY:1,frame:0});
}
registerScene('teahouse', drawTeaHouse);

/* ── KOI POND ZEN GARDEN (outdoor · serene) ── */
function drawZenGarden(){
  const t = sceneTime, groundY = H*0.40;

  // sky + hedge
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#cfe6f0'); sky.addColorStop(1,'#e8f0e0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='#3a6a3a'; ctx.fillRect(0,groundY-16,W,20);
  ctx.fillStyle='#4a7a4a'; for (let x=0;x<W;x+=14){ ctx.beginPath(); ctx.arc(x,groundY-16,8,Math.PI,0); ctx.fill(); }

  // garden ground
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#e6ddc8'); gr.addColorStop(1,'#d8cdb2');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);

  // red maple (right)
  const mX=W*0.82, mB=groundY+6;
  ctx.strokeStyle='#5a3a2a'; ctx.lineWidth=6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(mX,mB); ctx.lineTo(mX-10,mB-46); ctx.moveTo(mX-6,mB-30); ctx.lineTo(mX-24,mB-50); ctx.moveTo(mX-8,mB-38); ctx.lineTo(mX+10,mB-58); ctx.stroke(); ctx.lineCap='butt';
  ctx.fillStyle='#c0392b'; for (let i=0;i<10;i++){ const a=i/10*6.28; ctx.beginPath(); ctx.arc(mX-8+Math.cos(a)*24, mB-52+Math.sin(a)*16, 12,0,7); ctx.fill(); }
  ctx.fillStyle='#e05a3b'; ctx.beginPath(); ctx.arc(mX-8,mB-56,16,0,7); ctx.fill();

  // koi pond
  const pcx=W*0.30, pcy=H*0.52, prx=W*0.24, pry=H*0.09;
  ctx.fillStyle='#9a9086'; for (let i=0;i<18;i++){ const a=i/18*6.28; ctx.beginPath(); ctx.arc(pcx+Math.cos(a)*(prx+3), pcy+Math.sin(a)*(pry+3), 4,0,7); ctx.fill(); }
  ctx.fillStyle='#4a8ea0'; ctx.beginPath(); ctx.ellipse(pcx,pcy,prx,pry,0,0,7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(pcx,pcy,prx,pry,0,0,7); ctx.clip();
  ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=1; for (let r=0;r<3;r++){ const rr=(t*10+r*18)%36; ctx.beginPath(); ctx.ellipse(pcx+8,pcy-4,rr,rr*0.5,0,0,7); ctx.stroke(); }
  for (let i=0;i<4;i++){
    const speed=(i%2?1:-1)*(10+i*3);
    const kx=pcx-prx + ((((i*prx*0.5 + t*speed)%(prx*2))+prx*2)%(prx*2));
    const ky=pcy-pry*0.4 + i*pry*0.25 + Math.sin(t+i)*3, dir=speed>0?1:-1;
    ctx.save(); ctx.translate(kx,ky); ctx.scale(dir,1);
    ctx.fillStyle=i%3?'#ff7a2e':'#f0f0f0';
    ctx.beginPath(); ctx.ellipse(0,0,7,4,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7,0); ctx.lineTo(-12,-4); ctx.lineTo(-12,4); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle='#3a7a4a'; for (const lp of [[pcx-14,pcy+4],[pcx+18,pcy-3],[pcx+4,pcy+8]]){ ctx.beginPath(); ctx.arc(lp[0],lp[1],6,0.3,6.0); ctx.fill(); }
  ctx.restore();

  // stone lantern
  const laX=W*0.66, laB=H*0.60;
  ctx.fillStyle='#8a8278'; ctx.fillRect(laX-3,laB-6,6,6); ctx.fillRect(laX-2,laB-24,4,18);
  ctx.fillStyle='#9a9288'; ctx.fillRect(laX-9,laB-34,18,10);
  ctx.fillStyle='rgba(255,200,120,.85)'; ctx.fillRect(laX-4,laB-32,8,6);
  ctx.fillStyle='#8a8278'; ctx.beginPath(); ctx.moveTo(laX-11,laB-34); ctx.lineTo(laX,laB-42); ctx.lineTo(laX+11,laB-34); ctx.closePath(); ctx.fill();

  // raked gravel + stepping stones (foreground)
  ctx.strokeStyle='rgba(160,150,120,.5)'; ctx.lineWidth=1;
  for (let i=0;i<5;i++){ const ry=H*0.64+i*10; ctx.beginPath(); for (let x=0;x<=W;x+=6){ x===0?ctx.moveTo(x,ry):ctx.lineTo(x, ry+Math.sin(x*0.08+i)*2); } ctx.stroke(); }
  ctx.fillStyle='#b0a894'; for (const s of [[W*0.5,H*0.82],[W*0.6,H*0.88],[W*0.68,H*0.83]]){ ctx.beginPath(); ctx.ellipse(s[0],s[1],11,5,0,0,7); ctx.fill(); }
}
registerScene('zengarden', drawZenGarden);

/* ── SCIENCE LAB (indoor · chemistry) ── */
function drawScienceLab(){
  const t = sceneTime, floorY = H*0.62, benchY = H*0.55;

  // wall + tiled floor
  ctx.fillStyle='#dfe6e8'; ctx.fillRect(0,0,W,floorY);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#b8c0c4'); fl.addColorStop(1,'#a4acb0');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1;
  for (let i=1;i<5;i++){ const y=floorY+i/5*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  for (let x=0;x<W;x+=W/8){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x,H); ctx.stroke(); }

  // periodic-table poster
  const ptX=W*0.06, ptY=H*0.10, cell=8, pc=['#e07a8b','#f2c14e','#7fd0ff','#9ad57f','#c79be0'];
  ctx.fillStyle='#fff'; ctx.fillRect(ptX-3,ptY-3,cell*9+6,cell*5+6);
  for (let r=0;r<5;r++) for (let c=0;c<9;c++){ if (r<1 || c<2 || c>1){ ctx.fillStyle=pc[(r+c)%5]; ctx.globalAlpha=0.85; ctx.fillRect(ptX+c*cell,ptY+r*cell,cell-1,cell-1); } }
  ctx.globalAlpha=1;

  // reagent shelf
  ctx.fillStyle='#9aa2a6'; ctx.fillRect(W*0.5,H*0.12,W*0.44,4);
  const bc=['#7fd0ff','#9ad57f','#f2a6b3','#f2c14e','#c79be0'];
  for (let i=0;i<7;i++){ const bx=W*0.52+i*W*0.06; ctx.fillStyle='#cfe0e8'; ctx.fillRect(bx-4,H*0.12-16,8,16); ctx.fillStyle=bc[i%5]; ctx.fillRect(bx-4,H*0.12-8,8,8); ctx.fillStyle='#888'; ctx.fillRect(bx-2,H*0.12-20,4,4); }

  // lab bench
  ctx.fillStyle='#3a464c'; ctx.fillRect(W*0.16,benchY+8,5,floorY-(benchY+8)); ctx.fillRect(W*0.84-5,benchY+8,5,floorY-(benchY+8));
  ctx.fillStyle='#5a6a70'; ctx.fillRect(W*0.14,benchY,W*0.72,10);

  // flasks with bubbling liquid
  function flask(x,col){
    ctx.fillStyle='rgba(220,235,240,.5)';
    ctx.beginPath(); ctx.moveTo(x-3,benchY-24); ctx.lineTo(x-3,benchY-14); ctx.lineTo(x-10,benchY); ctx.lineTo(x+10,benchY); ctx.lineTo(x+3,benchY-14); ctx.lineTo(x+3,benchY-24); ctx.closePath(); ctx.fill();
    ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(x-8,benchY-3); ctx.lineTo(x+8,benchY-3); ctx.lineTo(x+5,benchY-9); ctx.lineTo(x-5,benchY-9); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.6)'; for (let k=0;k<3;k++){ const bb=(t*20+k*8)%12; ctx.beginPath(); ctx.arc(x-3+k*3, benchY-4-bb, 1.2,0,7); ctx.fill(); }
  }
  flask(W*0.30,'#9ad57f'); flask(W*0.44,'#7fd0ff');

  // bunsen burner + flame
  const buX=W*0.58, flh=8+Math.sin(t*12)*2;
  ctx.fillStyle='#555'; ctx.fillRect(buX-3,benchY-14,6,14);
  ctx.fillStyle='#5a9eff'; ctx.beginPath(); ctx.moveTo(buX-4,benchY-14); ctx.quadraticCurveTo(buX,benchY-14-flh,buX+4,benchY-14); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffb84d'; ctx.beginPath(); ctx.moveTo(buX-2,benchY-14); ctx.quadraticCurveTo(buX,benchY-14-flh*0.6,buX+2,benchY-14); ctx.closePath(); ctx.fill();

  // test-tube rack
  const rkX=W*0.72, tc=['#f2a6b3','#9ad57f','#f2c14e'];
  ctx.fillStyle='#7a5a3a'; ctx.fillRect(rkX-16,benchY-6,32,6);
  for (let i=0;i<3;i++){ ctx.fillStyle='#cfe0e8'; ctx.fillRect(rkX-12+i*10,benchY-22,6,22); ctx.fillStyle=tc[i]; ctx.fillRect(rkX-12+i*10,benchY-12,6,12); }
}
registerScene('sciencelab', drawScienceLab);

/* ── TIDE POOLS (outdoor · rocky coast) ── */
function drawTidePools(){
  const t = sceneTime, seaY = H*0.36, rockY = H*0.50;

  // sky + sea
  const sky=ctx.createLinearGradient(0,0,0,seaY); sky.addColorStop(0,'#a8d8ef'); sky.addColorStop(1,'#daf0f5');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,seaY);
  const sea=ctx.createLinearGradient(0,seaY,0,rockY); sea.addColorStop(0,'#3a8ea8'); sea.addColorStop(1,'#5aa8bc');
  ctx.fillStyle=sea; ctx.fillRect(0,seaY,W,rockY-seaY);
  ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.lineWidth=1;
  for (let i=0;i<10;i++){ const y=seaY+4+i*3; ctx.beginPath(); for (let x=0;x<=W;x+=8){ x===0?ctx.moveTo(x,y):ctx.lineTo(x, y+Math.sin(x*0.1+t*2+i)*1.4); } ctx.stroke(); }
  ctx.strokeStyle='#5a5a5a'; ctx.lineWidth=2; const gx=W*0.7+Math.sin(t*0.3)*30;
  ctx.beginPath(); ctx.moveTo(gx-6,seaY-20); ctx.quadraticCurveTo(gx,seaY-24,gx,seaY-20); ctx.quadraticCurveTo(gx,seaY-24,gx+6,seaY-20); ctx.stroke();

  // rocky shore
  const rock=ctx.createLinearGradient(0,rockY,0,H); rock.addColorStop(0,'#8a8278'); rock.addColorStop(1,'#6e675e');
  ctx.fillStyle=rock; ctx.fillRect(0,rockY,W,H-rockY);
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1;
  for (let i=0;i<14;i++){ const rx=(i*61+11)%W, ry=rockY+10+((i*47)%(H-rockY-10)); ctx.beginPath(); ctx.moveTo(rx,ry); ctx.lineTo(rx+8+((i*13)%10), ry+4); ctx.stroke(); }
  ctx.fillStyle='#7a7268'; for (const b of [[W*0.12,rockY+6,20],[W*0.9,rockY+2,26]]){ ctx.beginPath(); ctx.ellipse(b[0],b[1],b[2],b[2]*0.6,0,Math.PI,0); ctx.fill(); }

  // tide pools with critters
  function pool(px,py,pr){
    ctx.fillStyle='#3a4a44'; ctx.beginPath(); ctx.ellipse(px,py,pr+2,pr*0.6+2,0,0,7); ctx.fill();
    ctx.fillStyle='#4a8a90'; ctx.beginPath(); ctx.ellipse(px,py,pr,pr*0.6,0,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.2)'; ctx.beginPath(); ctx.ellipse(px-pr*0.3,py-pr*0.2,pr*0.4,pr*0.2,0,0,7); ctx.fill();
    ctx.fillStyle='#e08a3a'; ctx.save(); ctx.translate(px+pr*0.2,py+2); for (let a=0;a<5;a++){ ctx.rotate(6.28/5); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(2,4); ctx.lineTo(0,7); ctx.lineTo(-2,4); ctx.closePath(); ctx.fill(); } ctx.restore();
    ctx.fillStyle='#d05a7a'; ctx.beginPath(); ctx.arc(px-pr*0.4,py,3,0,7); ctx.fill();
    ctx.strokeStyle='#e07a9a'; ctx.lineWidth=1; for (let a=0;a<6;a++){ const an=a/6*6.28; ctx.beginPath(); ctx.moveTo(px-pr*0.4,py); ctx.lineTo(px-pr*0.4+Math.cos(an)*5, py+Math.sin(an)*3-2); ctx.stroke(); }
  }
  pool(W*0.3,H*0.68,26); pool(W*0.7,H*0.82,30); pool(W*0.15,H*0.86,18);

  // little crab
  const crX=W*0.55+Math.sin(t*1.5)*10, crY=H*0.74;
  ctx.fillStyle='#c0503a'; ctx.beginPath(); ctx.ellipse(crX,crY,7,5,0,0,7); ctx.fill();
  ctx.strokeStyle='#c0503a'; ctx.lineWidth=2; for (let i=-1;i<=1;i+=2){ ctx.beginPath(); ctx.moveTo(crX+i*6,crY); ctx.lineTo(crX+i*11,crY-3); ctx.stroke(); }
  ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(crX-2,crY-3,1,0,7); ctx.arc(crX+2,crY-3,1,0,7); ctx.fill();
}
registerScene('tidepools', drawTidePools);

/* ── BALLET STUDIO (indoor · dance) ── */
function drawBalletStudio(){
  const floorY = H*0.62;

  // wall
  ctx.fillStyle='#e6dce0'; ctx.fillRect(0,0,W,floorY);

  // big mirror
  const mX=W*0.06, mY=H*0.10, mW=W*0.5, mH=floorY-mY-6;
  ctx.fillStyle='#c8d0d4'; ctx.fillRect(mX,mY,mW,mH);
  const mg=ctx.createLinearGradient(mX,mY,mX,mY+mH); mg.addColorStop(0,'rgba(255,255,255,.4)'); mg.addColorStop(0.5,'rgba(200,210,220,.15)'); mg.addColorStop(1,'rgba(180,190,200,.3)');
  ctx.fillStyle=mg; ctx.fillRect(mX,mY,mW,mH);
  ctx.strokeStyle='rgba(140,110,80,.5)'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(mX+6,mY+mH*0.62); ctx.lineTo(mX+mW-6,mY+mH*0.62); ctx.stroke();
  ctx.strokeStyle='#b0a0b0'; ctx.lineWidth=4; ctx.strokeRect(mX,mY,mW,mH);
  ctx.fillStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.moveTo(mX+8,mY+8); ctx.lineTo(mX+40,mY+8); ctx.lineTo(mX+8,mY+50); ctx.closePath(); ctx.fill();

  // window with soft light
  const wX=W*0.64, wY=H*0.12, wW=W*0.28, wH=H*0.30;
  ctx.fillStyle='#eaf2f8'; ctx.fillRect(wX,wY,wW,wH);
  ctx.strokeStyle='#fff'; ctx.lineWidth=5; ctx.strokeRect(wX,wY,wW,wH);
  ctx.beginPath(); ctx.moveTo(wX+wW/2,wY); ctx.lineTo(wX+wW/2,wY+wH); ctx.moveTo(wX,wY+wH/2); ctx.lineTo(wX+wW,wY+wH/2); ctx.stroke();
  ctx.fillStyle='rgba(255,250,220,.10)'; ctx.beginPath(); ctx.moveTo(wX,wY+wH); ctx.lineTo(wX+wW,wY+wH); ctx.lineTo(wX+wW+30,H); ctx.lineTo(wX-40,H); ctx.closePath(); ctx.fill();

  // tutu + pointe shoes on the wall
  const tuX=W*0.9;
  ctx.fillStyle='#f4c6d6'; ctx.beginPath(); ctx.moveTo(tuX,H*0.14); ctx.lineTo(tuX-14,H*0.24); ctx.lineTo(tuX+14,H*0.24); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#f7d9e3'; ctx.beginPath(); ctx.ellipse(tuX,H*0.24,16,5,0,0,7); ctx.fill();
  ctx.fillStyle='#f0b8c8'; ctx.beginPath(); ctx.ellipse(tuX-4,H*0.30,5,3,0.3,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(tuX+4,H*0.31,5,3,-0.3,0,7); ctx.fill();

  // wood floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#c99a5a'); fl.addColorStop(1,'#b5883f');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(90,60,20,.2)'; ctx.lineWidth=1;
  for (let x=0;x<W;x+=20){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x,H); ctx.stroke(); }
  for (let i=1;i<5;i++){ const y=floorY+i/5*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // freestanding barre
  const brY=floorY-34;
  ctx.strokeStyle='#7a4a26'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W*0.14,brY); ctx.lineTo(W*0.14,floorY); ctx.moveTo(W*0.5,brY); ctx.lineTo(W*0.5,floorY); ctx.stroke();
  ctx.strokeStyle='#a06a3a'; ctx.lineWidth=4; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(W*0.10,brY); ctx.lineTo(W*0.54,brY); ctx.stroke(); ctx.lineCap='butt';
}
registerScene('balletstudio', drawBalletStudio);

/* ── VINEYARD AT DUSK (outdoor · evening) ── */
function drawVineyard(){
  const horizon = H*0.40;

  // dusk sky + low sun
  const sky=ctx.createLinearGradient(0,0,0,horizon); sky.addColorStop(0,'#6a4a8a'); sky.addColorStop(0.5,'#e08a5a'); sky.addColorStop(1,'#f2c28a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,horizon);
  ctx.fillStyle='rgba(255,220,150,.5)'; ctx.beginPath(); ctx.arc(W*0.7,horizon-6,26,0,7); ctx.fill();
  ctx.fillStyle='#ffe8b0'; ctx.beginPath(); ctx.arc(W*0.7,horizon-6,16,0,7); ctx.fill();

  // hills + villa
  ctx.fillStyle='#8a7a5a'; ctx.beginPath(); ctx.moveTo(0,horizon); ctx.quadraticCurveTo(W*0.3,horizon-20,W*0.6,horizon-4); ctx.quadraticCurveTo(W*0.85,horizon-16,W,horizon-2); ctx.lineTo(W,horizon); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#d8c0a0'; ctx.fillRect(W*0.16,horizon-18,20,14);
  ctx.fillStyle='#9a4a3a'; ctx.beginPath(); ctx.moveTo(W*0.16-2,horizon-18); ctx.lineTo(W*0.16+10,horizon-26); ctx.lineTo(W*0.16+22,horizon-18); ctx.closePath(); ctx.fill();

  // field
  const fld=ctx.createLinearGradient(0,horizon,0,H); fld.addColorStop(0,'#7a6a3a'); fld.addColorStop(1,'#5a4e2a');
  ctx.fillStyle=fld; ctx.fillRect(0,horizon,W,H-horizon);

  // vine rows in perspective
  for (let r=0;r<9;r++){
    const p=r/8, y=horizon+Math.pow(p,1.5)*(H-horizon), postH=6+p*22;
    ctx.strokeStyle=`rgb(${60+p*20},${80+p*20},${40+p*10})`; ctx.lineWidth=2+p*3; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    ctx.fillStyle=`rgb(${90-p*20},40,${110-p*10})`; for (let x=10;x<W;x+=30+p*20){ ctx.beginPath(); ctx.arc(x,y-postH*0.4,2+p*3,0,7); ctx.fill(); }
    ctx.strokeStyle=`rgba(80,60,30,${0.4+p*0.4})`; ctx.lineWidth=1+p*2; for (let x=20;x<W;x+=60+p*30){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-postH); ctx.stroke(); }
  }

  // foreground barrels
  function barrel(x,y){
    ctx.fillStyle='#8a5a2a'; roundRect(x-14,y-20,28,24,6); ctx.fill();
    ctx.strokeStyle='#5a3a18'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x-14,y-14); ctx.lineTo(x+14,y-14); ctx.moveTo(x-14,y-2); ctx.lineTo(x+14,y-2); ctx.stroke();
    ctx.fillStyle='#7a4a22'; ctx.beginPath(); ctx.ellipse(x,y-20,14,4,0,0,7); ctx.fill();
  }
  barrel(W*0.85,H*0.90); barrel(W*0.12,H*0.86);
}
registerScene('vineyard', drawVineyard);

/* ── FLORIST SHOP (indoor · flowers) ── */
function drawFlorist(){
  const floorY = H*0.62;

  // wall + wainscot
  ctx.fillStyle='#eae0d0'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#dcae88'; ctx.fillRect(0,floorY-30,W,30);
  ctx.fillStyle='rgba(0,0,0,.05)'; ctx.fillRect(0,floorY-30,W,2);
  // tiled floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#c8b89a'); fl.addColorStop(1,'#b4a486');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  for (let r=0;r<5;r++) for (let c=0;c<10;c++){ if ((r+c)%2){ ctx.fillStyle='rgba(120,90,60,.10)'; ctx.fillRect(c*W/10,floorY+r/5*(H-floorY),W/10,(H-floorY)/5); } }

  // hanging dried flowers
  for (const hx of [W*0.2,W*0.5,W*0.8]){
    ctx.strokeStyle='#7a8a5a'; ctx.lineWidth=2;
    for (let k=0;k<5;k++){ const a=-1.2+k*0.5; ctx.beginPath(); ctx.moveTo(hx,0); ctx.quadraticCurveTo(hx+Math.cos(a)*10,20,hx+Math.cos(a)*14,34); ctx.stroke(); }
    ctx.fillStyle='#b088c0'; for (let k=0;k<3;k++){ ctx.beginPath(); ctx.arc(hx-6+k*6,30,2,0,7); ctx.fill(); }
  }

  // shop sign
  ctx.fillStyle='#7a5a3a'; ctx.font='bold 14px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('✿ Fleurs ✿', W*0.5, H*0.10); ctx.textAlign='left';

  // flower buckets
  function bucket(x,cols){
    const by=floorY+8;
    ctx.fillStyle='#8aa0b0'; ctx.beginPath(); ctx.moveTo(x-12,by-2); ctx.lineTo(x+12,by-2); ctx.lineTo(x+9,by+22); ctx.lineTo(x-9,by+22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#3a7a3a'; ctx.lineWidth=1.5; for (let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(x+i*4,by-2); ctx.lineTo(x+i*5,by-30); ctx.stroke(); }
    for (let i=-2;i<=2;i++){ ctx.fillStyle=cols[(i+2)%cols.length]; ctx.beginPath(); ctx.arc(x+i*5,by-32,5,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+i*5,by-32,1.8,0,7); ctx.fill(); }
  }
  bucket(W*0.14,['#e8628c','#f2c14e','#e84a6a']);
  bucket(W*0.30,['#c05fd0','#f2a6b3','#9a5fd0']);
  bucket(W*0.86,['#ff8a5a','#f2c14e','#e8628c']);

  // counter with wrapped bouquet + ribbon spools
  const cX=W*0.58, cTop=floorY+6;
  ctx.fillStyle='#9a6b3f'; ctx.fillRect(cX-30,cTop,70,H-cTop);
  ctx.fillStyle='#8a5a34'; ctx.fillRect(cX-30,cTop,70,6);
  ctx.fillStyle='#f0e8d8'; ctx.beginPath(); ctx.moveTo(cX-6,cTop-2); ctx.lineTo(cX+18,cTop-2); ctx.lineTo(cX+8,cTop-30); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#e8628c'; ctx.beginPath(); ctx.arc(cX+4,cTop-28,4,0,7); ctx.arc(cX+11,cTop-26,4,0,7); ctx.arc(cX+7,cTop-33,4,0,7); ctx.fill();
  ctx.fillStyle='#e84a6a'; ctx.beginPath(); ctx.arc(cX-18,cTop-6,5,0,7); ctx.fill();
  ctx.fillStyle='#4a90d9'; ctx.beginPath(); ctx.arc(cX-8,cTop-6,5,0,7); ctx.fill();
}
registerScene('florist', drawFlorist);

/* ── HOT AIR BALLOONS (outdoor · meadow) ── */
function drawBalloons(){
  const t = sceneTime, groundY = H*0.66;

  // sky + clouds
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#7ec0ef'); sky.addColorStop(1,'#cdeaf7');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  drawSpriteCloud(W*0.2+Math.sin(t*0.1)*10,H*0.12,0.8); drawSpriteCloud(W*0.7+Math.sin(t*0.08+2)*12,H*0.20,0.6);

  // balloons
  function balloon(x,y,col,s){
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x,y,16*s,0,7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x-11*s,y+11*s); ctx.lineTo(x+11*s,y+11*s); ctx.lineTo(x+4*s,y+22*s); ctx.lineTo(x-4*s,y+22*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(x,y,4*s,16*s,0,0,7); ctx.fill();
    ctx.strokeStyle='#7a5a3a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x-4*s,y+22*s); ctx.lineTo(x-4*s,y+28*s); ctx.moveTo(x+4*s,y+22*s); ctx.lineTo(x+4*s,y+28*s); ctx.stroke();
    ctx.fillStyle='#8a5a3a'; ctx.fillRect(x-5*s,y+28*s,10*s,6*s);
  }
  balloon(W*0.30, H*0.28+Math.sin(t*0.5)*8, '#e0504a',1.1);
  balloon(W*0.62, H*0.17+Math.sin(t*0.4+1)*8, '#f2b03a',0.9);
  balloon(W*0.82, H*0.34+Math.sin(t*0.6+2)*8, '#5a9ee0',0.8);
  balloon(W*0.12, H*0.44+Math.sin(t*0.45+3)*8,'#7ac05a',0.7);

  // meadow + flowers
  const g=ctx.createLinearGradient(0,groundY,0,H); g.addColorStop(0,'#8bc34a'); g.addColorStop(1,'#6fae35');
  ctx.fillStyle=g; ctx.fillRect(0,groundY,W,H-groundY);
  const fc=['#e8628c','#f2c14e','#ffffff','#c05fd0'];
  for (let i=0;i<30;i++){ const fx=(i*53+11)%W, fy=groundY+10+((i*37+5)%(H-groundY-10)); ctx.fillStyle=fc[i%4]; ctx.beginPath(); ctx.arc(fx,fy,2.5,0,7); ctx.fill(); ctx.fillStyle='#3a7a22'; ctx.fillRect(fx-0.5,fy,1,5); }
}
registerScene('balloons', drawBalloons);

/* ── RECORD SHOP (indoor · vinyl) ── */
function drawRecordShop(){
  const t = sceneTime, floorY = H*0.62;

  // wall + floor
  ctx.fillStyle='#2e2836'; ctx.fillRect(0,0,W,floorY);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#5a4a3a'); fl.addColorStop(1,'#463829');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let x=0;x<W;x+=24){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x,H); ctx.stroke(); }

  // sign
  ctx.fillStyle='#f2c14e'; ctx.font='bold 14px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('◉ RECORDS ◉', W*0.5, H*0.055); ctx.textAlign='left';

  // wall of album covers
  const gx=W*0.06, gy=H*0.09, cs=W*0.14, cvC=['#e0504a','#f2b03a','#5a9ee0','#7ac05a','#c05fd0','#e8628c'];
  for (let r=0;r<2;r++) for (let c=0;c<6;c++){ const x=gx+c*cs, y=gy+r*cs; if (x+cs*0.9>W) continue; ctx.fillStyle=cvC[(r*6+c)%6]; ctx.fillRect(x,y,cs*0.9,cs*0.9); ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.arc(x+cs*0.45,y+cs*0.45,cs*0.28,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+cs*0.45,y+cs*0.45,cs*0.06,0,7); ctx.fill(); }

  // record bins
  function bin(x){
    const by=floorY-6, bw=W*0.26, bh=40;
    ctx.fillStyle='#6a4a2a'; ctx.fillRect(x,by-bh,bw,bh); ctx.fillStyle='#5a3a1a'; ctx.fillRect(x,by-bh,bw,6);
    for (let i=0;i<14;i++){ ctx.fillStyle=['#333','#444','#555522','#225555','#552255'][i%5]; ctx.save(); ctx.translate(x+6+i*((bw-12)/14),by-4); ctx.rotate(-0.15); ctx.fillRect(0,-bh+8,3,bh-8); ctx.restore(); }
    ctx.fillStyle='#4a2f18'; ctx.fillRect(x,by,bw,H-by);
  }
  bin(W*0.06); bin(W*0.40);

  // turntable on a stand
  const tX=W*0.82, tY=floorY-30;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(tX-20,tY+26,4,floorY-(tY+26)); ctx.fillRect(tX+16,tY+26,4,floorY-(tY+26));
  ctx.fillStyle='#222'; roundRect(tX-24,tY,48,26,3); ctx.fill();
  ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(tX-4,tY+13,11,0,7); ctx.fill();
  ctx.strokeStyle='#555'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(tX-4,tY+13,8,t*3,t*3+5); ctx.stroke();
  ctx.fillStyle='#e0504a'; ctx.beginPath(); ctx.arc(tX-4,tY+13,3,0,7); ctx.fill();
  ctx.strokeStyle='#888'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(tX+14,tY+4); ctx.lineTo(tX+2,tY+12); ctx.stroke();
}
registerScene('recordshop', drawRecordShop);

/* ── WATERFALL GROTTO (outdoor · lush) ── */
function drawWaterfall(){
  const t = sceneTime, poolTop = H*0.46, shoreY = H*0.64;

  ctx.fillStyle='#2a3a2a'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#bfe0d0'; ctx.fillRect(0,0,W,H*0.10);

  // cliff walls + moss
  ctx.fillStyle='#4a4238';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.34,0); ctx.lineTo(W*0.28,poolTop); ctx.lineTo(0,poolTop); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W,0); ctx.lineTo(W*0.66,0); ctx.lineTo(W*0.72,poolTop); ctx.lineTo(W,poolTop); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a5a2a'; ctx.fillRect(0,poolTop-8,W*0.30,8); ctx.fillRect(W*0.72,poolTop-8,W*0.30,8);

  // waterfall
  const wx0=W*0.36, wx1=W*0.64;
  ctx.fillStyle='#cfe8f0'; ctx.fillRect(wx0,H*0.06,wx1-wx0,poolTop-H*0.06);
  ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.lineWidth=2;
  for (let i=0;i<9;i++){ const x=wx0+4+i*((wx1-wx0-8)/9); ctx.beginPath(); for (let y=H*0.08;y<poolTop;y+=8){ ctx.lineTo(x+Math.sin(y*0.1+t*6+i)*1.5,y); } ctx.stroke(); }

  // pool
  const pool=ctx.createLinearGradient(0,poolTop,0,shoreY); pool.addColorStop(0,'#4a9ea8'); pool.addColorStop(1,'#2a6a72');
  ctx.fillStyle=pool; ctx.fillRect(0,poolTop,W,shoreY-poolTop);
  ctx.fillStyle='rgba(255,255,255,.75)'; for (let i=0;i<12;i++){ const fx=wx0+((i*17)%(wx1-wx0)), r=3+Math.abs(Math.sin(t*4+i))*3; ctx.beginPath(); ctx.arc(fx,poolTop+3,r,0,7); ctx.fill(); }
  ctx.strokeStyle='rgba(255,255,255,.2)'; ctx.lineWidth=1; for (let i=0;i<3;i++){ const y=poolTop+12+i*10; ctx.beginPath(); for (let x=0;x<=W;x+=8){ x===0?ctx.moveTo(x,y):ctx.lineTo(x, y+Math.sin(x*0.1+t*2+i)*1.5); } ctx.stroke(); }
  ctx.fillStyle='rgba(255,255,255,.10)'; for (let i=0;i<5;i++){ ctx.beginPath(); ctx.ellipse(wx0+((i*40)%(wx1-wx0)), poolTop+4+Math.sin(t+i)*3, 20,7,0,0,7); ctx.fill(); }

  // mossy bank + rocks
  const bank=ctx.createLinearGradient(0,shoreY,0,H); bank.addColorStop(0,'#4a6a34'); bank.addColorStop(1,'#3a5228');
  ctx.fillStyle=bank; ctx.fillRect(0,shoreY,W,H-shoreY);
  ctx.fillStyle='#6a6258'; for (const b of [[W*0.2,shoreY+10,14],[W*0.8,shoreY+16,18],[W*0.5,shoreY+30,12]]){ ctx.beginPath(); ctx.ellipse(b[0],b[1],b[2],b[2]*0.6,0,0,7); ctx.fill(); }

  // ferns
  ctx.strokeStyle='#3a7a3a'; ctx.lineWidth=2;
  for (const fx of [W*0.08,W*0.92]){ for (let k=0;k<5;k++){ const a=-1.4+k*0.6; ctx.beginPath(); ctx.moveTo(fx,H); ctx.quadraticCurveTo(fx+Math.cos(a)*20,H-30,fx+Math.cos(a)*30,H-52); ctx.stroke(); } }
}
registerScene('waterfall', drawWaterfall);

/* ── SEWING STUDIO (indoor · quilting) ── */
function drawSewingStudio(){
  const floorY = H*0.62;

  ctx.fillStyle='#e4d8c8'; ctx.fillRect(0,0,W,floorY);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#b98a5a'); fl.addColorStop(1,'#a9784a');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(90,60,30,.2)'; ctx.lineWidth=1; for (let i=1;i<5;i++){ const y=floorY+i/5*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // patchwork quilt on the wall
  const qX=W*0.06, qY=H*0.10, qC=8, qR=6, qs=9, qc=['#e0504a','#f2b03a','#5a9ee0','#7ac05a','#c05fd0','#e8628c','#f2c14e'];
  ctx.fillStyle='#8a5a3a'; ctx.fillRect(qX-4,qY-6,qC*qs+8,4);
  for (let r=0;r<qR;r++) for (let c=0;c<qC;c++){ ctx.fillStyle=qc[(r*qC+c*3)%qc.length]; ctx.globalAlpha=0.9; ctx.fillRect(qX+c*qs,qY+r*qs,qs-1,qs-1); }
  ctx.globalAlpha=1; ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.strokeRect(qX,qY,qC*qs,qR*qs);

  // thread spool rack
  const rX=W*0.62, rY=H*0.14, tc=['#e0504a','#5a9ee0','#7ac05a','#f2b03a','#c05fd0','#e8628c'];
  ctx.fillStyle='#8a5a3a'; ctx.fillRect(rX,rY,W*0.32,4); ctx.fillRect(rX,rY+22,W*0.32,4);
  for (let i=0;i<6;i++){ const sx=rX+8+i*((W*0.32-16)/6); ctx.fillStyle=tc[i]; ctx.fillRect(sx-3,rY-12,6,12); ctx.fillStyle=tc[(i+2)%6]; ctx.fillRect(sx-3,rY+10,6,12); }

  // fabric bolts leaning
  for (let i=0;i<3;i++){ const bx=W*0.10+i*10; ctx.save(); ctx.translate(bx,floorY); ctx.rotate(-0.2); ctx.fillStyle=['#c05fd0','#5a9ee0','#e8628c'][i]; ctx.fillRect(-6,-70,12,70); ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(-6,-70,4,70); ctx.restore(); }

  // sewing table + machine
  const tX=W*0.44, tTop=floorY-30;
  ctx.fillStyle='#9a6b3f'; ctx.fillRect(tX-40,tTop,80,8); ctx.fillRect(tX-36,tTop+8,5,floorY-(tTop+8)); ctx.fillRect(tX+31,tTop+8,5,floorY-(tTop+8));
  ctx.fillStyle='#efe6d8'; ctx.beginPath(); ctx.moveTo(tX-22,tTop-2); ctx.lineTo(tX+22,tTop-2); ctx.lineTo(tX+22,tTop-18); ctx.lineTo(tX+8,tTop-18); ctx.lineTo(tX+2,tTop-30); ctx.lineTo(tX-22,tTop-30); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#c04a2a'; ctx.fillRect(tX-18,tTop-26,10,3);
  ctx.fillStyle='#888'; ctx.beginPath(); ctx.arc(tX+16,tTop-24,4,0,7); ctx.fill();
  ctx.strokeStyle='#555'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(tX+4,tTop-18); ctx.lineTo(tX+4,tTop-4); ctx.stroke();
  ctx.fillStyle='#7ac05a'; ctx.fillRect(tX-14,tTop-4,26,4);

  // dress form
  const dX=W*0.87, dB=floorY+6;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(dX-2,dB,4,H-dB);
  ctx.fillStyle='#d8b8a0'; ctx.beginPath(); ctx.moveTo(dX-14,dB-6); ctx.quadraticCurveTo(dX-16,dB-40,dX-6,dB-52); ctx.lineTo(dX+6,dB-52); ctx.quadraticCurveTo(dX+16,dB-40,dX+14,dB-6); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#c8a890'; ctx.fillRect(dX-3,dB-60,6,8);
}
registerScene('sewingstudio', drawSewingStudio);

/* ── PUMPKIN PATCH (outdoor · autumn) ── */
function drawPumpkinPatch(){
  const t = sceneTime, groundY = H*0.50;

  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#9ec8e0'); sky.addColorStop(1,'#f2d8b0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='#b0a878'; ctx.fillRect(0,groundY-14,W,14);
  ctx.fillStyle='#a04a3a'; ctx.fillRect(W*0.7,groundY-40,40,26);
  ctx.beginPath(); ctx.moveTo(W*0.7-3,groundY-40); ctx.lineTo(W*0.7+20,groundY-52); ctx.lineTo(W*0.7+43,groundY-40); ctx.closePath(); ctx.fill();

  const g=ctx.createLinearGradient(0,groundY,0,H); g.addColorStop(0,'#8a9a4a'); g.addColorStop(1,'#6a7a34');
  ctx.fillStyle=g; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.strokeStyle='#4a6a2a'; ctx.lineWidth=1.5; for (let i=0;i<6;i++){ const y=groundY+20+i*((H-groundY)/6); ctx.beginPath(); for (let x=0;x<=W;x+=10){ x===0?ctx.moveTo(x,y):ctx.lineTo(x,y+Math.sin(x*0.15+i)*3); } ctx.stroke(); }

  // scarecrow
  const scX=W*0.28, scB=groundY+72;
  ctx.strokeStyle='#8a5a3a'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(scX,scB); ctx.lineTo(scX,scB-70); ctx.moveTo(scX-20,scB-50); ctx.lineTo(scX+20,scB-50); ctx.stroke();
  ctx.fillStyle='#c04a3a'; ctx.fillRect(scX-14,scB-50,28,28);
  ctx.fillStyle='#e8d090'; ctx.beginPath(); ctx.arc(scX,scB-58,9,0,7); ctx.fill();
  ctx.fillStyle='#5a3a1a'; ctx.beginPath(); ctx.ellipse(scX,scB-64,12,3,0,0,7); ctx.fill(); ctx.fillRect(scX-6,scB-74,12,10);

  // pumpkins
  function pumpkin(x,y,s){
    ctx.fillStyle='#e07a1a'; for (let k=-1;k<=1;k++){ ctx.beginPath(); ctx.ellipse(x+k*4*s,y,5*s,7*s,0,0,7); ctx.fill(); }
    ctx.fillStyle='#f0902a'; ctx.beginPath(); ctx.ellipse(x,y,5*s,7*s,0,0,7); ctx.fill();
    ctx.strokeStyle='#4a7a2a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,y-7*s); ctx.lineTo(x+3,y-10*s); ctx.stroke();
  }
  pumpkin(W*0.5,H*0.66,1.4); pumpkin(W*0.66,H*0.72,1.8); pumpkin(W*0.14,H*0.78,2.0); pumpkin(W*0.8,H*0.62,1.2); pumpkin(W*0.42,H*0.84,2.2); pumpkin(W*0.9,H*0.86,1.6);

  // hay bale
  ctx.fillStyle='#d8c060'; roundRect(W*0.6,H*0.87,44,22,4); ctx.fill();
  ctx.strokeStyle='#b8a040'; ctx.lineWidth=1; for (let i=1;i<4;i++){ ctx.beginPath(); ctx.moveTo(W*0.6+i*11,H*0.87); ctx.lineTo(W*0.6+i*11,H*0.87+22); ctx.stroke(); }

  // crow
  ctx.strokeStyle='#222'; ctx.lineWidth=2; const cx=W*0.5+Math.sin(t*0.5)*40;
  ctx.beginPath(); ctx.moveTo(cx-6,H*0.18); ctx.quadraticCurveTo(cx,H*0.155,cx,H*0.18); ctx.quadraticCurveTo(cx,H*0.155,cx+6,H*0.18); ctx.stroke();
}
registerScene('pumpkinpatch', drawPumpkinPatch);

/* ── TOY SHOP (indoor · toys) ── */
function drawToyShop(){
  const t = sceneTime, floorY = H*0.62;

  ctx.fillStyle='#f2e0c0'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='rgba(230,150,120,.12)'; for (let x=0;x<W;x+=24) ctx.fillRect(x,0,12,floorY);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#c99a5a'); fl.addColorStop(1,'#b5883f');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(90,60,20,.2)'; ctx.lineWidth=1; for (let i=1;i<5;i++){ const y=floorY+i/5*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  ctx.fillStyle='#e0504a'; ctx.font='bold 15px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('★ TOYS ★', W*0.5, H*0.08); ctx.textAlign='left';

  // shelves of toys
  for (let s=0;s<2;s++){
    const sy=H*0.16+s*H*0.16;
    ctx.fillStyle='#9a6b3f'; ctx.fillRect(W*0.06,sy+26,W*0.6,5);
    const blc=['#e0504a','#5a9ee0','#7ac05a','#f2b03a']; for (let i=0;i<3;i++){ ctx.fillStyle=blc[(i+s)%4]; ctx.fillRect(W*0.08+i*14,sy+14,12,12); }
    const bx=W*0.3; ctx.fillStyle='#b5875a'; ctx.beginPath(); ctx.arc(bx,sy+18,8,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(bx-6,sy+10,3,0,7); ctx.arc(bx+6,sy+10,3,0,7); ctx.fill(); ctx.fillStyle='#8a5a3a'; ctx.beginPath(); ctx.arc(bx,sy+18,4,0,7); ctx.fill(); ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(bx-3,sy+15,1,0,7); ctx.arc(bx+3,sy+15,1,0,7); ctx.fill();
    ctx.fillStyle='#e0504a'; ctx.beginPath(); ctx.arc(W*0.44,sy+18,8,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.fillRect(W*0.44-8,sy+16,16,3);
    const rx=W*0.56; ctx.fillStyle='#9aa2b0'; ctx.fillRect(rx-7,sy+8,14,18); ctx.fillStyle='#5a9ee0'; ctx.fillRect(rx-4,sy+11,8,5); ctx.strokeStyle='#9aa2b0'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(rx,sy+8); ctx.lineTo(rx,sy+3); ctx.stroke(); ctx.fillStyle='#e0504a'; ctx.beginPath(); ctx.arc(rx,sy+3,2,0,7); ctx.fill();
  }

  // hanging kite
  const kX=W*0.82, kY=H*0.16;
  ctx.save(); ctx.translate(kX,kY); ctx.rotate(0.3+Math.sin(t)*0.05);
  ctx.fillStyle='#e0504a'; ctx.beginPath(); ctx.moveTo(0,-16); ctx.lineTo(12,0); ctx.lineTo(0,16); ctx.lineTo(-12,0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#f2c14e'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,-16); ctx.lineTo(0,16); ctx.moveTo(-12,0); ctx.lineTo(12,0); ctx.stroke();
  ctx.strokeStyle='#5a9ee0'; ctx.beginPath(); ctx.moveTo(0,16); ctx.quadraticCurveTo(6,26,0,34); ctx.stroke(); ctx.restore();

  // rocking horse
  const hX=W*0.3, hB=floorY+30;
  ctx.strokeStyle='#a06a3a'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(hX,hB-2,20,Math.PI*1.15,Math.PI*1.85); ctx.stroke();
  ctx.fillStyle='#d8a860'; ctx.beginPath(); ctx.ellipse(hX,hB-16,18,7,0,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(hX+16,hB-22,6,5,0.4,0,7); ctx.fill();
  ctx.strokeStyle='#8a5a3a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(hX-8,hB-12); ctx.lineTo(hX-8,hB-2); ctx.moveTo(hX+8,hB-12); ctx.lineTo(hX+8,hB-2); ctx.stroke();
  ctx.strokeStyle='#c04a3a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(hX+18,hB-26); ctx.quadraticCurveTo(hX+24,hB-20,hX+20,hB-14); ctx.stroke();

  // stacked blocks on floor
  const sbX=W*0.72; ctx.fillStyle='#e0504a'; ctx.fillRect(sbX,floorY-14,14,14); ctx.fillStyle='#5a9ee0'; ctx.fillRect(sbX+2,floorY-28,14,14); ctx.fillStyle='#7ac05a'; ctx.fillRect(sbX-2,floorY-42,14,14);
}
registerScene('toyshop', drawToyShop);

/* ── SNOWY CABIN (outdoor · winter day) ── */
function drawSnowyCabin(){
  const t = sceneTime, groundY = H*0.58;

  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#bcd8ec'); sky.addColorStop(1,'#e6f0f6');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='#d8e6ef'; ctx.beginPath(); ctx.moveTo(0,groundY); ctx.quadraticCurveTo(W*0.3,groundY-40,W*0.6,groundY-10); ctx.quadraticCurveTo(W*0.85,groundY-30,W,groundY-6); ctx.lineTo(W,groundY); ctx.closePath(); ctx.fill();
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#f0f6fb'); gr.addColorStop(1,'#dae6ef');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);

  for (let i=0;i<5;i++) drawSnowPine(W*0.1+i*W*0.12, groundY+6, 26+((i*23)%14));

  // cabin
  const cX=W*0.66, cB=groundY+40, cW=W*0.36, cH=54;
  ctx.fillStyle='#7a4a2a'; ctx.fillRect(cX-cW/2,cB-cH,cW,cH);
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; for (let y=cB-cH+6;y<cB;y+=8){ ctx.beginPath(); ctx.moveTo(cX-cW/2,y); ctx.lineTo(cX+cW/2,y); ctx.stroke(); }
  ctx.fillStyle='#5a3a22'; ctx.beginPath(); ctx.moveTo(cX-cW/2-6,cB-cH); ctx.lineTo(cX,cB-cH-30); ctx.lineTo(cX+cW/2+6,cB-cH); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.moveTo(cX-cW/2-6,cB-cH); ctx.lineTo(cX,cB-cH-30); ctx.lineTo(cX+cW/2+6,cB-cH); ctx.closePath(); ctx.clip(); ctx.fillStyle='#f4faff'; ctx.fillRect(cX-cW/2-6,cB-cH-30,cW+12,12); ctx.restore();
  ctx.fillStyle='#ffd88a'; ctx.fillRect(cX-14,cB-cH+12,20,18);
  ctx.strokeStyle='#5a3a22'; ctx.lineWidth=2; ctx.strokeRect(cX-14,cB-cH+12,20,18); ctx.beginPath(); ctx.moveTo(cX-4,cB-cH+12); ctx.lineTo(cX-4,cB-cH+30); ctx.moveTo(cX-14,cB-cH+21); ctx.lineTo(cX+6,cB-cH+21); ctx.stroke();
  ctx.fillStyle='#5a3a22'; ctx.fillRect(cX+12,cB-30,14,30);
  ctx.fillStyle='#6a4a3a'; ctx.fillRect(cX+cW/2-16,cB-cH-24,8,16);
  ctx.strokeStyle='rgba(200,200,200,.5)'; ctx.lineWidth=3; ctx.beginPath(); for (let k=0;k<=8;k++){ const yy=cB-cH-24-k*6, xx=cX+cW/2-12+Math.sin(t*2+k*0.6)*5; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy); } ctx.stroke();

  // snowman
  const sX=W*0.26, sB=groundY+50;
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(sX,sB-8,12,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(sX,sB-26,9,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(sX,sB-40,6,0,7); ctx.fill();
  ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(sX-2,sB-41,1,0,7); ctx.arc(sX+2,sB-41,1,0,7); ctx.fill();
  ctx.fillStyle='#e0802a'; ctx.beginPath(); ctx.moveTo(sX,sB-39); ctx.lineTo(sX+6,sB-38); ctx.lineTo(sX,sB-37); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#5a3a22'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(sX-8,sB-26); ctx.lineTo(sX-16,sB-30); ctx.moveTo(sX+8,sB-26); ctx.lineTo(sX+16,sB-30); ctx.stroke();
  ctx.fillStyle='#c04a3a'; ctx.fillRect(sX-6,sB-48,12,3); ctx.fillRect(sX-4,sB-54,8,6);

  // falling snow
  ctx.fillStyle='rgba(255,255,255,.9)'; for (let i=0;i<30;i++){ const seed=i*41.7, sx=(((seed*1.6+Math.sin(t+i)*10)%W)+W)%W, sy=(seed*2.2+t*16)%H; ctx.beginPath(); ctx.arc(sx,sy,1.3,0,7); ctx.fill(); }
}
registerScene('snowycabin', drawSnowyCabin);

/* ── SPA / BATHHOUSE (indoor · relaxation) ── */
function drawSpa(){
  const t = sceneTime, floorY = H*0.62;

  // stone wall
  ctx.fillStyle='#d8cfc2'; ctx.fillRect(0,0,W,floorY);
  ctx.strokeStyle='rgba(0,0,0,.06)'; ctx.lineWidth=1;
  for (let y=0;y<floorY;y+=16){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  for (let x=0;x<W;x+=32){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,floorY); ctx.stroke(); }
  // tiled floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#b8c4c0'); fl.addColorStop(1,'#a4b0ac');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  for (let r=0;r<5;r++) for (let c=0;c<10;c++){ if ((r+c)%2){ ctx.fillStyle='rgba(255,255,255,.15)'; ctx.fillRect(c*W/10,floorY+r/5*(H-floorY),W/10,(H-floorY)/5); } }

  // sunken hot bath
  const bX=W*0.5, bY=H*0.48, bW=W*0.5, bH=H*0.13;
  ctx.fillStyle='#8a9aa0'; roundRect(bX-bW/2-4,bY-4,bW+8,bH+8,10); ctx.fill();
  ctx.fillStyle='#5aa8b8'; roundRect(bX-bW/2,bY,bW,bH,8); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1; for (let i=0;i<3;i++){ const y=bY+6+i*5; ctx.beginPath(); for (let x=bX-bW/2+4;x<bX+bW/2-4;x+=6){ x===bX-bW/2+4?ctx.moveTo(x,y):ctx.lineTo(x,y+Math.sin(x*0.2+t*2+i)*1.2); } ctx.stroke(); }
  ctx.fillStyle='#e88ab0'; for (let i=0;i<5;i++){ const px=bX-bW/2+10+((i*40+t*6)%(bW-20)); ctx.beginPath(); ctx.ellipse(px,bY+bH*0.4,3,1.5,0,0,7); ctx.fill(); }
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=3; for (const sx of [bX-bW*0.3,bX,bX+bW*0.3]){ ctx.beginPath(); for (let k=0;k<=9;k++){ const yy=bY-k*6, xx=sx+Math.sin(t*2+k*0.6+sx*0.1)*5; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy); } ctx.stroke(); }

  // stacked towels
  const twX=W*0.1;
  ctx.fillStyle='#fff'; roundRect(twX-16,floorY-8,32,8,3); ctx.fill();
  ctx.fillStyle='#e8f0f0'; roundRect(twX-16,floorY-16,32,8,3); ctx.fill();
  ctx.fillStyle='#d8e8e8'; roundRect(twX-16,floorY-24,32,8,3); ctx.fill();

  // candles
  for (const cx of [W*0.30,W*0.70]){ ctx.fillStyle='#e8dcc0'; ctx.fillRect(cx-3,floorY-16,6,16); const f2=1+Math.sin(t*8+cx)*0.3; ctx.fillStyle='rgba(255,200,100,.2)'; ctx.beginPath(); ctx.arc(cx,floorY-18,8,0,7); ctx.fill(); ctx.fillStyle='#ffcf5a'; ctx.beginPath(); ctx.ellipse(cx,floorY-18,2,4*f2,0,0,7); ctx.fill(); }

  // stacked zen stones
  const zX=W*0.88;
  ctx.fillStyle='#6a6258'; ctx.beginPath(); ctx.ellipse(zX,floorY-6,12,5,0,0,7); ctx.fill();
  ctx.fillStyle='#7a7268'; ctx.beginPath(); ctx.ellipse(zX,floorY-15,9,4,0,0,7); ctx.fill();
  ctx.fillStyle='#8a8278'; ctx.beginPath(); ctx.ellipse(zX,floorY-22,6,3,0,0,7); ctx.fill();
}
registerScene('spa', drawSpa);

/* ── DESERT SUNSET (outdoor · evening) ── */
function drawDesert(){
  const t = sceneTime, groundY = H*0.60;

  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#4a3a6a'); sky.addColorStop(0.4,'#e07a5a'); sky.addColorStop(0.7,'#f2b06a'); sky.addColorStop(1,'#f8d090');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='rgba(255,220,150,.4)'; ctx.beginPath(); ctx.arc(W*0.5,groundY-6,44,0,7); ctx.fill();
  ctx.fillStyle='#ffe0a0'; ctx.beginPath(); ctx.arc(W*0.5,groundY-6,30,0,7); ctx.fill();

  ctx.fillStyle='#8a4a4a'; ctx.fillRect(W*0.1,groundY-40,50,40); ctx.fillRect(W*0.72,groundY-30,44,30);
  ctx.fillStyle='#7a3a3a'; ctx.fillRect(W*0.1,groundY-40,50,6); ctx.fillRect(W*0.72,groundY-30,44,6);

  const g=ctx.createLinearGradient(0,groundY,0,H); g.addColorStop(0,'#e0a86a'); g.addColorStop(1,'#c08a4a');
  ctx.fillStyle=g; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#d89a5a'; ctx.beginPath(); ctx.moveTo(0,groundY+20); ctx.quadraticCurveTo(W*0.3,groundY+6,W*0.6,groundY+22); ctx.quadraticCurveTo(W*0.85,groundY+8,W,groundY+24); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();

  function cactus(x,baseY,s){
    ctx.fillStyle='#3a6a3a';
    ctx.fillRect(x-4*s,baseY-40*s,8*s,40*s);
    ctx.fillRect(x-14*s,baseY-30*s,10*s,6*s); ctx.fillRect(x-14*s,baseY-42*s,6*s,18*s);
    ctx.fillRect(x+4*s,baseY-24*s,10*s,6*s); ctx.fillRect(x+8*s,baseY-38*s,6*s,20*s);
    ctx.beginPath(); ctx.arc(x,baseY-40*s,4*s,Math.PI,0); ctx.fill();
    ctx.beginPath(); ctx.arc(x-11*s,baseY-42*s,3*s,Math.PI,0); ctx.fill();
    ctx.beginPath(); ctx.arc(x+11*s,baseY-38*s,3*s,Math.PI,0); ctx.fill();
  }
  cactus(W*0.2,groundY+30,1.2); cactus(W*0.82,groundY+40,1.0); cactus(W*0.42,groundY+54,0.8);

  // tumbleweed
  const twX=((t*40)%(W+40))-20, twY=groundY+50+Math.sin(t*6)*3;
  ctx.strokeStyle='#a07a4a'; ctx.lineWidth=1.5; ctx.save(); ctx.translate(twX,twY); ctx.rotate(t*3);
  for (let a=0;a<6;a++){ ctx.rotate(6.28/6); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,7); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0,0,7,0,7); ctx.stroke(); ctx.restore();
}
registerScene('desert', drawDesert);

/* ── OBSERVATORY (indoor · astronomy) ── */
function drawObservatory(){
  const t = sceneTime, floorY = H*0.66;

  // dome interior
  ctx.fillStyle='#1a1e2a'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(120,130,160,.15)'; ctx.lineWidth=1;
  for (let r=0.7;r>0.2;r-=0.12){ ctx.beginPath(); ctx.arc(W/2,floorY,W*r,Math.PI,0); ctx.stroke(); }
  for (let a=0;a<=8;a++){ const an=Math.PI+a/8*Math.PI; ctx.beginPath(); ctx.moveTo(W/2,floorY); ctx.lineTo(W/2+Math.cos(an)*W*0.7, floorY+Math.sin(an)*W*0.7); ctx.stroke(); }

  // open slit revealing the night sky
  ctx.save(); ctx.beginPath(); ctx.moveTo(W*0.44,floorY); ctx.lineTo(W*0.42,H*0.06); ctx.lineTo(W*0.58,H*0.06); ctx.lineTo(W*0.56,floorY); ctx.closePath(); ctx.clip();
  const sky=ctx.createLinearGradient(0,0,0,floorY); sky.addColorStop(0,'#0a1030'); sky.addColorStop(1,'#1a2450');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,floorY);
  for (let i=0;i<40;i++){ const sx=(i*61+7)%W, sy=(i*37+3)%floorY; ctx.fillStyle=`rgba(255,255,255,${0.4+0.5*Math.sin(t*2+i)})`; ctx.fillRect(sx,sy,1.3,1.3); }
  ctx.fillStyle='#f0ecd0'; ctx.beginPath(); ctx.arc(W*0.5,H*0.2,10,0,7); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='#3a4050'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(W*0.44,floorY); ctx.lineTo(W*0.42,H*0.06); ctx.moveTo(W*0.56,floorY); ctx.lineTo(W*0.58,H*0.06); ctx.stroke();

  // floor
  ctx.fillStyle='#12151d'; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=1; for (let i=1;i<4;i++){ const y=floorY+i/4*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // telescope
  const tx=W*0.66, ty=floorY;
  ctx.fillStyle='#2a2e3a'; ctx.fillRect(tx-6,ty-30,12,30); ctx.beginPath(); ctx.ellipse(tx,ty,16,5,0,0,7); ctx.fill();
  ctx.save(); ctx.translate(tx,ty-30); ctx.rotate(-0.9);
  ctx.fillStyle='#8a9098'; roundRect(-8,-46,16,60,8); ctx.fill();
  ctx.fillStyle='#5a6068'; ctx.fillRect(-8,-46,16,8);
  ctx.fillStyle='#c0c8d0'; ctx.fillRect(-3,14,6,10);
  ctx.restore();
  ctx.strokeStyle='#4a505a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(tx,ty-30); ctx.lineTo(tx+14,ty-18); ctx.stroke();
  ctx.fillStyle='#3a4048'; ctx.beginPath(); ctx.arc(tx+16,ty-16,5,0,7); ctx.fill();

  // control desk
  const dX=W*0.16, dY=floorY-8;
  ctx.fillStyle='#2a2e38'; ctx.fillRect(dX-24,dY-16,48,16); ctx.fillRect(dX-20,dY,4,H-dY); ctx.fillRect(dX+16,dY,4,H-dY);
  ctx.fillStyle='#1a3a5a'; ctx.fillRect(dX-20,dY-13,20,10);
  ctx.fillStyle='#5ad0ff'; for (let i=0;i<5;i++){ ctx.fillRect(dX-18+((i*17)%18),dY-11+((i*7)%7),1.5,1.5); }
  ctx.fillStyle='#e8dcc0'; ctx.save(); ctx.translate(dX+8,dY-8); ctx.rotate(-0.1); ctx.fillRect(-8,-6,16,12); ctx.restore();
}
registerScene('observatory', drawObservatory);

/* ── FIREFLY MEADOW (outdoor · dusk) ── */
function drawFireflies(){
  const t = sceneTime, groundY = H*0.60;

  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#1a2a55'); sky.addColorStop(0.6,'#4a5a7a'); sky.addColorStop(1,'#d88a5a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='rgba(255,240,200,.3)'; ctx.beginPath(); ctx.arc(W*0.78,H*0.2,26,0,7); ctx.fill();
  ctx.fillStyle='#fff0c8'; ctx.beginPath(); ctx.arc(W*0.78,H*0.2,18,0,7); ctx.fill();
  for (let i=0;i<20;i++){ const sx=(i*79+5)%W, sy=(i*41+3)%(groundY*0.4); ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(sx,sy,1,1); }

  ctx.fillStyle='#14201a'; ctx.beginPath(); ctx.moveTo(0,groundY); for (let x=0;x<=W;x+=20){ ctx.lineTo(x, groundY-14-Math.abs(Math.sin(x*0.3))*16); } ctx.lineTo(W,groundY); ctx.closePath(); ctx.fill();

  const g=ctx.createLinearGradient(0,groundY,0,H); g.addColorStop(0,'#2a3a24'); g.addColorStop(1,'#1a2818');
  ctx.fillStyle=g; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.strokeStyle='#1a2814'; ctx.lineWidth=1.5; for (let i=0;i<60;i++){ const gx=(i*23+7)%W, gh=10+((i*13)%18); ctx.beginPath(); ctx.moveTo(gx,H); ctx.quadraticCurveTo(gx+Math.sin(t+i)*3,H-gh*0.6,gx+Math.sin(t+i)*5,H-gh); ctx.stroke(); }

  for (let i=0;i<24;i++){
    const seed=i*97.3, fx=(((seed*1.3 + Math.sin(t*0.5+i)*40)%W)+W)%W;
    const fy=groundY-30 + Math.sin(t*0.4+i*1.3)*40 + (i%5)*10;
    const glow=0.4+0.6*Math.abs(Math.sin(t*3+i));
    ctx.fillStyle=`rgba(210,255,120,${glow*0.25})`; ctx.beginPath(); ctx.arc(fx,fy,5,0,7); ctx.fill();
    ctx.fillStyle=`rgba(230,255,150,${glow})`; ctx.beginPath(); ctx.arc(fx,fy,1.6,0,7); ctx.fill();
  }
}
registerScene('fireflies', drawFireflies);

/* ── COFFEE SHOP (indoor · café) ── */
function drawCafe(){
  const t = sceneTime, floorY = H*0.62;

  ctx.fillStyle='#4a3a30'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#6a4a34'; ctx.fillRect(0,floorY-24,W,24);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#8a6a4a'); fl.addColorStop(1,'#6e5238');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let x=0;x<W;x+=22){ ctx.beginPath(); ctx.moveTo(x,floorY); ctx.lineTo(x,H); ctx.stroke(); }

  // pendant light
  ctx.strokeStyle='#2a1e14'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.3,0); ctx.lineTo(W*0.3,H*0.1); ctx.stroke();
  ctx.fillStyle='rgba(255,220,150,.18)'; ctx.beginPath(); ctx.arc(W*0.3,H*0.14,20,0,7); ctx.fill();
  ctx.fillStyle='#2a2018'; ctx.beginPath(); ctx.moveTo(W*0.3-12,H*0.1+10); ctx.lineTo(W*0.3+12,H*0.1+10); ctx.lineTo(W*0.3+8,H*0.1); ctx.lineTo(W*0.3-8,H*0.1); ctx.closePath(); ctx.fill();

  // chalkboard menu
  ctx.fillStyle='#2a2a24'; roundRect(W*0.06,H*0.1,W*0.2,H*0.22,4); ctx.fill(); ctx.strokeStyle='#c9a06a'; ctx.lineWidth=3; roundRect(W*0.06,H*0.1,W*0.2,H*0.22,4); ctx.stroke();
  ctx.fillStyle='#e8dcc4'; ctx.font='bold 9px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('~ CAFE ~', W*0.16, H*0.145);
  ctx.font='7px Segoe UI, sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#c8bca4';
  const items=['Espresso','Latte','Mocha','Cocoa']; for (let i=0;i<4;i++) ctx.fillText('- '+items[i], W*0.08, H*0.185+i*11);

  // counter + espresso machine
  const cY=floorY-40;
  ctx.fillStyle='#5a3a24'; ctx.fillRect(W*0.4,cY,W*0.56,H-cY);
  ctx.fillStyle='#3a2418'; ctx.fillRect(W*0.4,cY,W*0.56,6);
  const eX=W*0.52, eY=cY;
  ctx.fillStyle='#b0b4b8'; roundRect(eX-20,eY-30,40,30,3); ctx.fill();
  ctx.fillStyle='#8a8e92'; ctx.fillRect(eX-16,eY-26,32,10);
  ctx.fillStyle='#3a3e42'; ctx.fillRect(eX-8,eY-14,16,10);
  ctx.fillStyle='#d8dce0'; ctx.fillRect(eX-6,eY-4,4,4); ctx.fillRect(eX+2,eY-4,4,4);
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=2; ctx.beginPath(); for (let k=0;k<=6;k++){ const yy=eY-30-k*5, xx=eX+10+Math.sin(t*3+k*0.6)*3; k===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy); } ctx.stroke();
  for (let i=0;i<3;i++){ ctx.fillStyle='#e8e0d4'; ctx.beginPath(); ctx.arc(W*0.74+i*16,cY-4,5,0,7); ctx.fill(); }

  // mug shelf
  ctx.fillStyle='#6a4a34'; ctx.fillRect(W*0.62,H*0.14,W*0.32,4);
  for (let i=0;i<5;i++){ ctx.fillStyle=['#c0392b','#2980b9','#27ae60','#f1c40f','#8e44ad'][i]; ctx.fillRect(W*0.64+i*16-4,H*0.14-10,8,10); }

  // café table + chair + steaming cup
  const tX=W*0.2, tY=floorY+22;
  ctx.fillStyle='#3a2418'; ctx.fillRect(tX-2,tY,4,H-tY); ctx.beginPath(); ctx.ellipse(tX,tY,20,6,0,0,7); ctx.fill();
  ctx.fillStyle='#e8e0d4'; ctx.beginPath(); ctx.arc(tX,tY-4,4,0,7); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=1.5; ctx.beginPath(); for (let k=0;k<=4;k++){ const yy=tY-8-k*4; k===0?ctx.moveTo(tX,yy):ctx.lineTo(tX+Math.sin(t*3+k)*2, yy); } ctx.stroke();
  ctx.fillStyle='#5a3a24'; ctx.fillRect(tX-34,tY-2,4,H-tY); ctx.fillRect(tX-34,tY-20,4,18); ctx.fillRect(tX-46,tY-2,14,4);

  // book on the cafe table
  SpriteRenderer.submit({sprite:'book',phase:'ground',x:W*0.24,y:floorY+18,width:16,height:16,anchorY:1,frame:0});
}
registerScene('cafe', drawCafe);

/* ── RAINY CITY STREET (outdoor · evening) ── */
function drawRainyStreet(){
  const t = sceneTime, sidewalkY = H*0.66;

  const sky=ctx.createLinearGradient(0,0,0,sidewalkY); sky.addColorStop(0,'#1a2438'); sky.addColorStop(1,'#3a4a60');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,sidewalkY);

  // buildings (deterministic)
  let seed=3; const rnd=()=>{ seed=(seed*9301+49297)%233280; return seed/233280; };
  let bx=0;
  while (bx<W){
    const bw=40+Math.floor(rnd()*30), bh=60+Math.floor(rnd()*70), bTop=sidewalkY-bh;
    ctx.fillStyle=`rgb(${30+Math.floor(rnd()*20)},${34+Math.floor(rnd()*20)},${46+Math.floor(rnd()*20)})`; ctx.fillRect(bx,bTop,bw,bh);
    for (let wy=bTop+8;wy<sidewalkY-8;wy+=12) for (let wx=bx+6;wx<bx+bw-6;wx+=12){ if (rnd()>0.4){ ctx.fillStyle=`rgba(255,210,120,${0.4+0.4*rnd()})`; ctx.fillRect(wx,wy,6,7); } }
    bx+=bw+2;
  }
  ctx.textAlign='left';
  ctx.fillStyle=`rgba(255,80,180,${0.7+0.3*Math.sin(t*3)})`; ctx.font='bold 12px Segoe UI, sans-serif'; ctx.fillText('OPEN', W*0.12, sidewalkY-70);
  ctx.fillStyle=`rgba(80,220,255,${0.7+0.3*Math.sin(t*2+1)})`; ctx.font='bold 10px Segoe UI, sans-serif'; ctx.fillText('DINER', W*0.68, sidewalkY-92);

  // wet street + reflections
  const st=ctx.createLinearGradient(0,sidewalkY,0,H); st.addColorStop(0,'#2a2e36'); st.addColorStop(1,'#1a1e26');
  ctx.fillStyle=st; ctx.fillRect(0,sidewalkY,W,H-sidewalkY);
  ctx.globalAlpha=0.2; for (let i=0;i<10;i++){ const rx=(i*41+13)%W; ctx.fillStyle=['#ffd278','#ff50b4','#50dcff'][i%3]; ctx.fillRect(rx,sidewalkY,3,30+((i*17)%30)); } ctx.globalAlpha=1;
  ctx.fillStyle='rgba(120,150,180,.2)'; for (const p of [[W*0.3,H*0.82,30],[W*0.7,H*0.90,40],[W*0.15,H*0.94,24]]){ ctx.beginPath(); ctx.ellipse(p[0],p[1],p[2],p[2]*0.3,0,0,7); ctx.fill(); }

  // streetlamp + glow
  const lX=W*0.85, lB=sidewalkY;
  ctx.fillStyle='rgba(255,220,150,.06)'; ctx.beginPath(); ctx.moveTo(lX-6,lB-88); ctx.lineTo(lX-40,H); ctx.lineTo(lX+40,H); ctx.lineTo(lX+6,lB-88); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#2a2e34'; ctx.fillRect(lX-2,lB-90,4,90);
  ctx.fillStyle='rgba(255,220,150,.25)'; ctx.beginPath(); ctx.arc(lX,lB-88,24,0,7); ctx.fill();
  ctx.fillStyle='#ffe0a0'; ctx.beginPath(); ctx.arc(lX,lB-88,4,0,7); ctx.fill();

  // rain
  ctx.strokeStyle='rgba(180,200,220,.4)'; ctx.lineWidth=1; for (let i=0;i<60;i++){ const seed2=i*53.1, rx=((seed2*1.7 + t*400)%(W+40))-20, ry=(seed2*2.3 + t*600)%H; ctx.beginPath(); ctx.moveTo(rx,ry); ctx.lineTo(rx-4,ry+10); ctx.stroke(); }

  // umbrella on the ground
  SpriteRenderer.submit({sprite:'umbrella',phase:'ground',x:W*0.18,y:sidewalkY+14,width:30,height:30,anchorY:1,frame:0});
}
registerScene('rainystreet', drawRainyStreet);

/* ── DARKROOM (indoor · film photography) ── */
function drawDarkroom(){
  const t = sceneTime, floorY = H*0.64;

  ctx.fillStyle='#2a1414'; ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W*0.5,H*0.2,10,W*0.5,H*0.5,W*0.8); rg.addColorStop(0,'rgba(180,30,30,.12)'); rg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=rg; ctx.fillRect(0,0,W,floorY);
  // safelight
  ctx.fillStyle='rgba(200,30,30,.10)'; ctx.beginPath(); ctx.arc(W*0.5,10,80,0,7); ctx.fill();
  ctx.fillStyle='#3a1010'; ctx.fillRect(W*0.5-10,0,20,10);
  ctx.fillStyle=`rgba(255,40,40,${0.5+0.1*Math.sin(t*2)})`; ctx.beginPath(); ctx.arc(W*0.5,10,6,0,7); ctx.fill();

  // clothesline of drying prints
  ctx.strokeStyle='#5a2020'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,H*0.14); ctx.lineTo(W,H*0.16); ctx.stroke();
  for (let i=0;i<6;i++){
    const px=W*0.08+i*W*0.16, py=H*0.14+(i%2)*6;
    ctx.fillStyle='#c88888'; ctx.fillRect(px-1,py-2,2,4);
    ctx.fillStyle='#3a2020'; ctx.fillRect(px-12,py+2,24,20);
    ctx.fillStyle='rgba(200,80,80,.4)'; ctx.fillRect(px-10,py+4,20,16);
    ctx.fillStyle='rgba(255,150,150,.3)'; ctx.fillRect(px-6,py+8,12,3);
  }

  // floor
  ctx.fillStyle='#1a0e0e'; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(255,60,60,.06)'; ctx.lineWidth=1; for (let i=1;i<4;i++){ const y=floorY+i/4*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // developing trays on a counter
  const cY=floorY-6;
  ctx.fillStyle='#3a2020'; ctx.fillRect(W*0.04,cY-30,W*0.42,30);
  ctx.fillStyle='#2a1616'; ctx.fillRect(W*0.04,cY-30,W*0.42,6);
  const trays=['#6a2a2a','#7a3030','#5a2626']; for (let i=0;i<3;i++){ const tx=W*0.09+i*W*0.13; ctx.fillStyle=trays[i]; roundRect(tx-16,cY-24,32,14,2); ctx.fill(); ctx.fillStyle='rgba(255,80,80,.25)'; roundRect(tx-13,cY-21,26,8,1); ctx.fill(); }

  // enlarger
  const eX=W*0.78, eB=floorY;
  ctx.fillStyle='#3a2222'; ctx.fillRect(eX-24,eB-6,48,6); ctx.fillRect(eX+18,eB-70,5,64);
  ctx.fillStyle='#4a2828'; ctx.fillRect(eX-18,eB-64,30,12);
  ctx.fillStyle='#2a1616'; ctx.fillRect(eX-14,eB-52,10,16);
  ctx.fillStyle=`rgba(255,120,120,${0.3+0.1*Math.sin(t*3)})`; ctx.beginPath(); ctx.moveTo(eX-12,eB-36); ctx.lineTo(eX-4,eB-36); ctx.lineTo(eX,eB-8); ctx.lineTo(eX-16,eB-8); ctx.closePath(); ctx.fill();
}
registerScene('darkroom', drawDarkroom);

/* ── LIGHTHOUSE COAST (outdoor · evening) ── */
function drawLighthouse(){
  const t = sceneTime, seaY = H*0.40, shoreY = H*0.66;

  const sky=ctx.createLinearGradient(0,0,0,seaY); sky.addColorStop(0,'#2a2a55'); sky.addColorStop(1,'#e08a6a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,seaY);
  for (let i=0;i<15;i++){ const sx=(i*83+5)%W, sy=(i*31+3)%(seaY*0.5); ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(sx,sy,1,1); }
  const sea=ctx.createLinearGradient(0,seaY,0,shoreY); sea.addColorStop(0,'#2a4a6a'); sea.addColorStop(1,'#1a3a54');
  ctx.fillStyle=sea; ctx.fillRect(0,seaY,W,shoreY-seaY);
  ctx.strokeStyle='rgba(255,180,140,.15)'; ctx.lineWidth=1; for (let i=0;i<8;i++){ const y=seaY+4+i*4; ctx.beginPath(); for (let x=0;x<=W;x+=8){ x===0?ctx.moveTo(x,y):ctx.lineTo(x,y+Math.sin(x*0.1+t+i)*1.2); } ctx.stroke(); }

  // lighthouse on a rock
  const lX=W*0.76, lBase=seaY+6, towerH=70, topW=14, botW=22;
  ctx.fillStyle='#3a3630'; ctx.beginPath(); ctx.moveTo(lX-30,lBase+10); ctx.lineTo(lX-16,lBase-6); ctx.lineTo(lX+18,lBase-4); ctx.lineTo(lX+32,lBase+10); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(lX-botW/2,lBase); ctx.lineTo(lX-topW/2,lBase-towerH); ctx.lineTo(lX+topW/2,lBase-towerH); ctx.lineTo(lX+botW/2,lBase); ctx.closePath();
  ctx.save(); ctx.clip();
  ctx.fillStyle='#f0ece4'; ctx.fillRect(lX-botW,lBase-towerH,botW*2,towerH);
  ctx.fillStyle='#c0392b'; for (let i=0;i<4;i++){ ctx.fillRect(lX-botW,lBase-towerH+i*20+8,botW*2,10); }
  ctx.restore();
  ctx.fillStyle='#3a4048'; ctx.fillRect(lX-9,lBase-towerH-12,18,12);
  ctx.fillStyle=`rgba(255,240,180,${0.7+0.3*Math.sin(t*4)})`; ctx.fillRect(lX-6,lBase-towerH-10,12,8);
  ctx.fillStyle='#2a2e34'; ctx.beginPath(); ctx.moveTo(lX-11,lBase-towerH-12); ctx.lineTo(lX,lBase-towerH-22); ctx.lineTo(lX+11,lBase-towerH-12); ctx.closePath(); ctx.fill();
  const lightY=lBase-towerH-6, ang=Math.sin(t*0.8)*0.5 - 1.2;
  ctx.fillStyle='rgba(255,245,190,.12)'; ctx.beginPath(); ctx.moveTo(lX,lightY); ctx.lineTo(lX+Math.cos(ang-0.12)*260, lightY+Math.sin(ang-0.12)*260); ctx.lineTo(lX+Math.cos(ang+0.12)*260, lightY+Math.sin(ang+0.12)*260); ctx.closePath(); ctx.fill();

  // rocky shore
  const rock=ctx.createLinearGradient(0,shoreY,0,H); rock.addColorStop(0,'#4a463e'); rock.addColorStop(1,'#3a362e');
  ctx.fillStyle=rock; ctx.fillRect(0,shoreY,W,H-shoreY);
  ctx.fillStyle='rgba(255,255,255,.4)'; for (let x=0;x<W;x+=10){ ctx.beginPath(); ctx.arc(x,shoreY+Math.sin(x*0.2+t*3)*2,2,0,7); ctx.fill(); }
  ctx.strokeStyle='#eee'; ctx.lineWidth=1.5; const gx=W*0.3+Math.sin(t*0.4)*30; ctx.beginPath(); ctx.moveTo(gx-5,seaY-30); ctx.quadraticCurveTo(gx,seaY-33,gx,seaY-30); ctx.quadraticCurveTo(gx,seaY-33,gx+5,seaY-30); ctx.stroke();
}
registerScene('lighthouse', drawLighthouse);

/* ── WINE CELLAR (indoor · wine) ── */
function drawWineCellar(){
  const t = sceneTime, floorY = H*0.66;

  ctx.fillStyle='#2e2620'; ctx.fillRect(0,0,W,floorY);
  ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=2; for (let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(W*(0.25+i*0.25),H*0.14,W*0.13,Math.PI,0); ctx.stroke(); }
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; for (let y=H*0.14;y<floorY;y+=14){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  const glow=ctx.createRadialGradient(W*0.5,floorY-30,10,W*0.5,floorY-30,W*0.55); glow.addColorStop(0,'rgba(255,170,80,.12)'); glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow; ctx.fillRect(0,0,W,floorY);

  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#4a4038'); fl.addColorStop(1,'#3a322a');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let i=1;i<4;i++){ const y=floorY+i/4*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // wine rack
  const rX=W*0.05, rY=H*0.2, rW=W*0.4, rH=floorY-rY-8, rows=5, cols=8, cw=rW/cols, ch=rH/rows;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(rX-3,rY-3,rW+6,rH+6);
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){ const x=rX+c*cw, y=rY+r*ch; ctx.fillStyle='#1a1410'; ctx.fillRect(x,y,cw-1,ch-1); ctx.fillStyle=(r+c)%3===0?'#5a2a2a':(r+c)%3===1?'#2a4a2a':'#3a3020'; ctx.beginPath(); ctx.arc(x+cw/2,y+ch/2,Math.min(cw,ch)*0.3,0,7); ctx.fill(); ctx.fillStyle='rgba(255,200,120,.2)'; ctx.beginPath(); ctx.arc(x+cw/2-1,y+ch/2-1,1.5,0,7); ctx.fill(); }

  // barrels
  function barrel(x,y,s){ ctx.fillStyle='#7a4a24'; ctx.beginPath(); ctx.ellipse(x,y,18*s,13*s,0,0,7); ctx.fill(); ctx.fillStyle='#5a3418'; ctx.beginPath(); ctx.ellipse(x,y,7*s,13*s,0,0,7); ctx.fill(); ctx.strokeStyle='#3a2410'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x,y,18*s,13*s,0,0,7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x-18*s,y); ctx.lineTo(x+18*s,y); ctx.stroke(); }
  barrel(W*0.76,floorY+8,1); barrel(W*0.9,floorY+8,1); barrel(W*0.83,floorY-20,1);

  // tasting table + bottle + glass + candle
  const tX=W*0.5, tY=floorY+24;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(tX-24,tY,48,6); ctx.fillRect(tX-20,tY+6,4,H-tY); ctx.fillRect(tX+16,tY+6,4,H-tY);
  ctx.fillStyle='#2a4a2a'; ctx.fillRect(tX-10,tY-22,7,22); ctx.fillRect(tX-8,tY-30,3,8);
  ctx.fillStyle='rgba(230,230,240,.4)'; ctx.beginPath(); ctx.moveTo(tX+6,tY-2); ctx.lineTo(tX+18,tY-2); ctx.lineTo(tX+15,tY-14); ctx.lineTo(tX+9,tY-14); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#7a1a2a'; ctx.beginPath(); ctx.moveTo(tX+8,tY-4); ctx.lineTo(tX+16,tY-4); ctx.lineTo(tX+14,tY-10); ctx.lineTo(tX+10,tY-10); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#e8dcc0'; ctx.fillRect(tX-2,tY-14,4,12); const cf=1+Math.sin(t*8)*0.3; ctx.fillStyle='rgba(255,180,90,.3)'; ctx.beginPath(); ctx.arc(tX,tY-16,8,0,7); ctx.fill(); ctx.fillStyle='#ffcf5a'; ctx.beginPath(); ctx.ellipse(tX,tY-16,2,4*cf,0,0,7); ctx.fill();
}
registerScene('winecellar', drawWineCellar);

/* ── BAMBOO FOREST (outdoor · serene) ── */
function drawBamboo(){
  const t = sceneTime;

  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#cfe6c8'); bg.addColorStop(0.55,'#9cc48c'); bg.addColorStop(0.75,'#7aa060'); bg.addColorStop(1,'#5a6a3a');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,220,.08)'; for (let i=0;i<4;i++){ const x=W*0.2+i*W*0.2; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+30,0); ctx.lineTo(x-40,H); ctx.lineTo(x-70,H); ctx.closePath(); ctx.fill(); }

  function stalk(x,w,col,sway){
    const bend=Math.sin(t*0.5+x)*sway;
    ctx.strokeStyle=col; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(x,H); ctx.quadraticCurveTo(x+bend*0.5,H*0.4,x+bend,-10); ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; for (let y=H*0.9;y>0;y-=28){ const sx=x+bend*(1-y/H); ctx.beginPath(); ctx.moveTo(sx-w/2,y); ctx.lineTo(sx+w/2,y); ctx.stroke(); }
    ctx.strokeStyle=col; ctx.lineWidth=1.5; for (let k=0;k<4;k++){ const ly=40+k*20, lx=x+bend*(1-ly/H); ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx+(k%2?14:-14), ly-8); ctx.stroke(); }
  }
  for (let i=0;i<7;i++) stalk(W*0.06+i*W*0.14+8, 4, '#8ab87a', 6);
  for (let i=0;i<5;i++) stalk(W*0.1+i*W*0.2, 8, '#5a9a4a', 10);

  // stepping stones
  ctx.fillStyle='#9a9488'; for (const s of [[W*0.5,H*0.82,16],[W*0.44,H*0.9,18],[W*0.58,H*0.96,20]]){ ctx.beginPath(); ctx.ellipse(s[0],s[1],s[2],s[2]*0.4,0,0,7); ctx.fill(); }

  // stone lantern
  const laX=W*0.85, laB=H*0.80;
  ctx.fillStyle='#8a8478'; ctx.fillRect(laX-3,laB-6,6,6); ctx.fillRect(laX-2,laB-22,4,16);
  ctx.fillStyle='#9a9488'; ctx.fillRect(laX-8,laB-32,16,10);
  ctx.fillStyle='rgba(255,200,120,.7)'; ctx.fillRect(laX-4,laB-30,8,6);
  ctx.fillStyle='#8a8478'; ctx.beginPath(); ctx.moveTo(laX-10,laB-32); ctx.lineTo(laX,laB-40); ctx.lineTo(laX+10,laB-32); ctx.closePath(); ctx.fill();
}
registerScene('bamboo', drawBamboo);

/* ── CLOCKMAKER'S SHOP (indoor · horology) ── */
function drawClockmaker(){
  const t = sceneTime, floorY = H*0.64;

  ctx.fillStyle='#6a4a34'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='rgba(0,0,0,.06)'; for (let y=0;y<floorY;y+=18) ctx.fillRect(0,y,W,1);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#8a6a4a'); fl.addColorStop(1,'#6e5238');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);

  function clock(cx,cy,r,rate){
    ctx.fillStyle='#e8dcc4'; ctx.beginPath(); ctx.arc(cx,cy,r,0,7); ctx.fill(); ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=2; ctx.stroke();
    ctx.strokeStyle='#5a4a3a'; ctx.lineWidth=1; for (let k=0;k<12;k++){ const a=k/12*6.28; ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*(r-2),cy+Math.sin(a)*(r-2)); ctx.lineTo(cx+Math.cos(a)*(r-4),cy+Math.sin(a)*(r-4)); ctx.stroke(); }
    const hh=t*rate*0.3, mh=t*rate;
    ctx.strokeStyle='#2a1a10'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(hh-1.57)*r*0.5, cy+Math.sin(hh-1.57)*r*0.5); ctx.stroke();
    ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(mh-1.57)*r*0.75, cy+Math.sin(mh-1.57)*r*0.75); ctx.stroke();
    ctx.fillStyle='#2a1a10'; ctx.beginPath(); ctx.arc(cx,cy,1.5,0,7); ctx.fill();
  }
  clock(W*0.14,H*0.16,16,0.5); clock(W*0.34,H*0.12,12,0.8); clock(W*0.34,H*0.30,10,0.3); clock(W*0.14,H*0.36,13,0.6);
  clock(W*0.72,H*0.16,15,0.4); clock(W*0.58,H*0.30,11,0.7);

  // grandfather clock with pendulum
  const gX=W*0.86, gB=floorY;
  ctx.fillStyle='#5a3a1a'; ctx.fillRect(gX-16,gB-100,32,100);
  ctx.fillStyle='#3a2410'; ctx.fillRect(gX-12,gB-70,24,64);
  clock(gX,gB-84,12,0.5);
  const pa=Math.sin(t*2)*0.4;
  ctx.strokeStyle='#c9a24a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(gX,gB-66); ctx.lineTo(gX+Math.sin(pa)*20,gB-14); ctx.stroke();
  ctx.fillStyle='#e8c24a'; ctx.beginPath(); ctx.arc(gX+Math.sin(pa)*20,gB-12,6,0,7); ctx.fill();

  // workbench with gears + magnifier
  const wX=W*0.28, wY=floorY-6;
  ctx.fillStyle='#4a3220'; ctx.fillRect(wX-40,wY-24,80,24); ctx.fillRect(wX-36,wY,6,H-wY); ctx.fillRect(wX+30,wY,6,H-wY);
  function gear(x,y,r,col){ ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); for (let k=0;k<8;k++){ const a=k/8*6.28+t*0.5; ctx.fillRect(x+Math.cos(a)*r-1,y+Math.sin(a)*r-1,2.5,2.5); } ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.arc(x,y,r*0.4,0,7); ctx.fill(); }
  gear(wX-16,wY-28,7,'#c9a24a'); gear(wX-4,wY-24,5,'#b0b4b8');
  ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(wX+16,wY-30,6,0,7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(wX+20,wY-26); ctx.lineTo(wX+26,wY-20); ctx.stroke();
}
registerScene('clockmaker', drawClockmaker);

/* ── CARNIVAL AT NIGHT (outdoor · festive) ── */
function drawCarnival(){
  const t = sceneTime, groundY = H*0.66;

  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#1a1a3a'); sky.addColorStop(1,'#4a2a5a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  for (let i=0;i<30;i++){ const sx=(i*71+5)%W, sy=(i*37+3)%(groundY*0.7); ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(sx,sy,1,1); }

  // ferris wheel
  const wX=W*0.34, wY=H*0.32, wR=W*0.20, rot=t*0.3;
  ctx.strokeStyle='#5a5e70'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(wX,wY); ctx.lineTo(wX-16,groundY); ctx.moveTo(wX,wY); ctx.lineTo(wX+16,groundY); ctx.stroke();
  ctx.strokeStyle='#8a8ea0'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(wX,wY,wR,0,7); ctx.stroke();
  for (let i=0;i<12;i++){ const a=rot+i/12*6.28, ex=wX+Math.cos(a)*wR, ey=wY+Math.sin(a)*wR; ctx.strokeStyle='#6a6e80'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(wX,wY); ctx.lineTo(ex,ey); ctx.stroke(); ctx.fillStyle=['#e0504a','#f2b03a','#5a9ee0','#7ac05a'][i%4]; ctx.fillRect(ex-5,ey-2,10,8); }
  ctx.fillStyle='#c9a24a'; ctx.beginPath(); ctx.arc(wX,wY,5,0,7); ctx.fill();
  for (let i=0;i<16;i++){ const a=i/16*6.28; ctx.fillStyle=`rgba(255,240,150,${0.5+0.5*Math.sin(t*4+i)})`; ctx.beginPath(); ctx.arc(wX+Math.cos(a)*wR,wY+Math.sin(a)*wR,2,0,7); ctx.fill(); }

  // striped tent
  const tX=W*0.8, tB=groundY, tW=W*0.3, tPeak=groundY-70;
  for (let i=0;i<8;i++){ ctx.fillStyle=i%2?'#d0402e':'#e8e0d4'; ctx.beginPath(); ctx.moveTo(tX,tPeak); ctx.lineTo(tX-tW/2+i*tW/8, tB); ctx.lineTo(tX-tW/2+(i+1)*tW/8, tB); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle='#f2c14e'; ctx.beginPath(); ctx.moveTo(tX,tPeak); ctx.lineTo(tX,tPeak-12); ctx.lineTo(tX+10,tPeak-8); ctx.closePath(); ctx.fill();

  // ground
  const g=ctx.createLinearGradient(0,groundY,0,H); g.addColorStop(0,'#3a2e2a'); g.addColorStop(1,'#2a201c');
  ctx.fillStyle=g; ctx.fillRect(0,groundY,W,H-groundY);

  // string lights
  ctx.strokeStyle='rgba(150,130,110,.6)'; ctx.lineWidth=1; ctx.beginPath(); for (let x=0;x<=W;x+=10){ const y=16+Math.sin(x*0.04)*8; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y); } ctx.stroke();
  for (let x=12;x<W;x+=24){ const y=16+Math.sin(x*0.04)*8+5; ctx.fillStyle=`rgba(255,${140+Math.floor(Math.abs(Math.sin(x))*80)},90,${0.7+0.3*Math.sin(t*3+x)})`; ctx.beginPath(); ctx.arc(x,y,3,0,7); ctx.fill(); }
}
registerScene('carnival', drawCarnival);

/* ── CHOCOLATE SHOP (indoor · chocolatier) ── */
function drawChocolateShop(){
  const t = sceneTime, floorY = H*0.62;

  ctx.fillStyle='#5a3a2a'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#6a4634'; ctx.fillRect(0,floorY-26,W,26);
  ctx.fillStyle='#e0d0b8'; ctx.fillRect(0,floorY,W,H-floorY);
  for (let r=0;r<5;r++) for (let c=0;c<10;c++){ if ((r+c)%2){ ctx.fillStyle='#5a3a2a'; ctx.globalAlpha=0.2; ctx.fillRect(c*W/10,floorY+r/5*(H-floorY),W/10,(H-floorY)/5); } }
  ctx.globalAlpha=1;

  ctx.fillStyle='#f2d9a0'; ctx.font='bold 13px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('CHOCOLATERIE', W*0.5, H*0.09); ctx.textAlign='left';

  // shelves of chocolate boxes
  ctx.fillStyle='#7a5238'; ctx.fillRect(W*0.06,H*0.16,W*0.34,4); ctx.fillRect(W*0.06,H*0.30,W*0.34,4);
  const boxc=['#c0392b','#8e44ad','#d4a017','#2980b9']; for (let r=0;r<2;r++) for (let i=0;i<5;i++){ const bx=W*0.09+i*W*0.06, by=(r===0?H*0.16:H*0.30)-14; ctx.fillStyle=boxc[(i+r)%4]; ctx.fillRect(bx-6,by,12,14); ctx.fillStyle='#f2d9a0'; ctx.fillRect(bx-6,by+5,12,2); }

  // display case with truffles
  const dcX=W*0.46, dcTop=floorY-50, dcW=W*0.5;
  ctx.fillStyle='rgba(210,225,235,.3)'; ctx.fillRect(dcX-dcW/2,dcTop,dcW,34); ctx.strokeStyle='#cfe0e8'; ctx.lineWidth=2; ctx.strokeRect(dcX-dcW/2,dcTop,dcW,34);
  ctx.fillStyle='#5a3a2a'; ctx.fillRect(dcX-dcW/2,dcTop+34,dcW,floorY-(dcTop+34));
  const trc=['#6a4028','#8a5a3a','#c0392b','#f2d9a0','#8e44ad']; for (let r=0;r<2;r++) for (let i=0;i<8;i++){ const tx=dcX-dcW/2+10+i*((dcW-20)/8), ty=dcTop+10+r*14; ctx.fillStyle=trc[(i+r)%5]; ctx.beginPath(); ctx.arc(tx,ty,4,0,7); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(tx,ty,4,3.6,4.7); ctx.stroke(); }

  // chocolate fountain
  const fX=W*0.86, fB=floorY;
  ctx.fillStyle='#c0c4c8'; ctx.fillRect(fX-4,fB-56,8,56);
  for (let i=0;i<3;i++){ const ty=fB-56+8+i*16, tw=8+i*8; ctx.fillStyle='#d0d4d8'; ctx.beginPath(); ctx.ellipse(fX,ty,tw,4,0,0,7); ctx.fill(); ctx.fillStyle='#5a3218'; ctx.beginPath(); ctx.ellipse(fX,ty-1,tw,3,0,0,7); ctx.fill(); ctx.strokeStyle='#5a3218'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(fX-tw,ty); ctx.lineTo(fX-tw+Math.sin(t*5)*1,ty+8); ctx.moveTo(fX+tw,ty); ctx.lineTo(fX+tw+Math.sin(t*5+1)*1,ty+8); ctx.stroke(); }
  ctx.fillStyle='#5a3218'; ctx.beginPath(); ctx.ellipse(fX,fB,20,5,0,0,7); ctx.fill();
}
registerScene('chocolateshop', drawChocolateShop);

/* ── TULIP FIELD & WINDMILL (outdoor · spring) ── */
function drawTulipField(){
  const t = sceneTime, horizon = H*0.44;

  const sky=ctx.createLinearGradient(0,0,0,horizon); sky.addColorStop(0,'#7ec0ef'); sky.addColorStop(1,'#cdeaf7');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,horizon);
  drawSpriteCloud(W*0.2+Math.sin(t*0.1)*8,H*0.1,0.7); drawSpriteCloud(W*0.75+Math.sin(t*0.08+2)*8,H*0.16,0.6);
  ctx.fillStyle='#7aad5a'; ctx.fillRect(0,horizon-8,W,8);

  // windmill
  const mX=W*0.78, mBase=horizon, mH=70, hubY=mBase-mH-4;
  ctx.fillStyle='#8a6a4a'; ctx.beginPath(); ctx.moveTo(mX-14,mBase); ctx.lineTo(mX-8,mBase-mH); ctx.lineTo(mX+8,mBase-mH); ctx.lineTo(mX+14,mBase); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#7a3a2a'; ctx.beginPath(); ctx.arc(mX,mBase-mH,10,Math.PI,0); ctx.fill();
  for (let i=0;i<4;i++){ const a=t*0.6+i*1.57; ctx.strokeStyle='#e8dcc4'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(mX,hubY); ctx.lineTo(mX+Math.cos(a)*34,hubY+Math.sin(a)*34); ctx.stroke(); ctx.fillStyle='rgba(230,220,196,.5)'; ctx.beginPath(); ctx.moveTo(mX+Math.cos(a)*10,hubY+Math.sin(a)*10); ctx.lineTo(mX+Math.cos(a)*34,hubY+Math.sin(a)*34); ctx.lineTo(mX+Math.cos(a+0.3)*30,hubY+Math.sin(a+0.3)*30); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle='#5a3a2a'; ctx.beginPath(); ctx.arc(mX,hubY,3,0,7); ctx.fill();

  // field + tulip rows
  const g=ctx.createLinearGradient(0,horizon,0,H); g.addColorStop(0,'#6aad4a'); g.addColorStop(1,'#4a8a2a');
  ctx.fillStyle=g; ctx.fillRect(0,horizon,W,H-horizon);
  const tc=['#d0402e','#f2c14e','#e86a9a','#8e44ad','#e0504a'];
  for (let r=0;r<10;r++){ const p=r/9, y=horizon+Math.pow(p,1.5)*(H-horizon), size=3+p*12, spacing=6+p*8, col=tc[r%5];
    for (let x=0;x<=W;x+=spacing){ ctx.strokeStyle='#3a7a2a'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-size); ctx.stroke(); ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(x,y-size-2,2+p*2,3+p*3,0,0,7); ctx.fill(); }
  }
}
registerScene('tulipfield', drawTulipField);

/* ── RETRO DINER (indoor · 50s diner) ── */
function drawDiner(){
  const t = sceneTime, floorY = H*0.62;

  ctx.fillStyle='#3aa0a0'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#f2a6b3'; ctx.fillRect(0,floorY-28,W,8);
  ctx.fillStyle='#e6e6e6'; ctx.fillRect(0,floorY-20,W,20);
  const fh=H-floorY; for (let r=0;r<5;r++) for (let c=0;c<10;c++){ ctx.fillStyle=(r+c)%2?'#2a2a2a':'#e8e8e8'; ctx.fillRect(c*W/10,floorY+r/5*fh,W/10,fh/5); }

  // neon sign
  ctx.font='bold 16px Segoe UI, sans-serif'; ctx.textAlign='center';
  ctx.strokeStyle='rgba(255,80,140,.4)'; ctx.lineWidth=2; ctx.strokeRect(W*0.5-40,H*0.05,80,H*0.06);
  ctx.fillStyle=`rgba(255,80,140,${0.7+0.3*Math.sin(t*3)})`; ctx.fillText('DINER', W*0.5, H*0.095); ctx.textAlign='left';

  // back counter with milkshakes
  const cTop=floorY-40;
  ctx.fillStyle='#5a4a3a'; ctx.fillRect(0,cTop,W,floorY-cTop);
  ctx.fillStyle='#d8dce0'; ctx.fillRect(0,cTop,W,6);
  for (let i=0;i<4;i++){ const mx=W*0.15+i*W*0.2; ctx.fillStyle='#f7d9e3'; ctx.beginPath(); ctx.moveTo(mx-5,cTop-2); ctx.lineTo(mx+5,cTop-2); ctx.lineTo(mx+3,cTop-16); ctx.lineTo(mx-3,cTop-16); ctx.closePath(); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(mx,cTop-16,4,Math.PI,0); ctx.fill(); ctx.fillStyle='#c0392b'; ctx.beginPath(); ctx.arc(mx+2,cTop-18,1.5,0,7); ctx.fill(); ctx.strokeStyle='#c0392b'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(mx+4,cTop-16); ctx.lineTo(mx+7,cTop-24); ctx.stroke(); }

  // stools
  for (let i=0;i<4;i++){ const sx=W*0.15+i*W*0.2; ctx.fillStyle='#888'; ctx.fillRect(sx-2,floorY+2,4,fh*0.5); ctx.fillStyle='#c0392b'; ctx.beginPath(); ctx.ellipse(sx,floorY+2,9,4,0,0,7); ctx.fill(); }

  // jukebox
  const jX=W*0.92, jB=floorY;
  ctx.fillStyle='#8a3a5a'; roundRect(jX-16,jB-60,32,60,10); ctx.fill();
  ctx.fillStyle=`rgba(255,200,100,${0.6+0.3*Math.sin(t*2)})`; roundRect(jX-12,jB-56,24,20,8); ctx.fill();
  ctx.fillStyle='#2a1a2a'; ctx.fillRect(jX-12,jB-32,24,14);
  ctx.fillStyle='#c0c4c8'; for (let i=0;i<3;i++) ctx.fillRect(jX-8+i*7,jB-30,4,10);
  for (let i=0;i<4;i++){ ctx.fillStyle=['#e0504a','#f2b03a','#5a9ee0','#7ac05a'][i]; ctx.beginPath(); ctx.arc(jX-9+i*6,jB-14,2,0,7); ctx.fill(); }
}
registerScene('diner', drawDiner);

/* ── MOUNTAIN SUMMIT (outdoor · alpine) ── */
function drawMountainSummit(){
  const t = sceneTime, ledgeY = H*0.64;

  const sky=ctx.createLinearGradient(0,0,0,ledgeY); sky.addColorStop(0,'#6ab0e8'); sky.addColorStop(1,'#cfe8f5');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,ledgeY);
  ctx.fillStyle='rgba(255,250,220,.5)'; ctx.beginPath(); ctx.arc(W*0.78,H*0.16,26,0,7); ctx.fill();
  ctx.fillStyle='#fffbe0'; ctx.beginPath(); ctx.arc(W*0.78,H*0.16,16,0,7); ctx.fill();

  const layers=[['#8a9ac0',0.40],['#6a7aa8',0.48],['#4a5a88',0.56]];
  for (const [col,yf] of layers){ ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,H*yf); let x=0; while (x<=W){ const peak=H*yf - 20 - (Math.sin(x*0.05+yf*10)*0.5+0.5)*40; ctx.lineTo(x,peak); x+=W/8; } ctx.lineTo(W,H*yf); ctx.lineTo(W,ledgeY); ctx.lineTo(0,ledgeY); ctx.closePath(); ctx.fill(); }

  // sea of clouds
  ctx.fillStyle='rgba(255,255,255,.7)'; for (let i=0;i<6;i++){ const cx=(i*W/5 + Math.sin(t*0.2+i)*10); ctx.beginPath(); ctx.ellipse(cx,H*0.56+((i%2)*8),40,10,0,0,7); ctx.fill(); }

  // snowy ledge
  const ledge=ctx.createLinearGradient(0,ledgeY,0,H); ledge.addColorStop(0,'#f0f6fb'); ledge.addColorStop(1,'#c8d6e2');
  ctx.fillStyle=ledge; ctx.beginPath(); ctx.moveTo(0,ledgeY+10); ctx.quadraticCurveTo(W*0.3,ledgeY-6,W*0.6,ledgeY+8); ctx.quadraticCurveTo(W*0.85,ledgeY-4,W,ledgeY+10); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#7a7268'; for (const r of [[W*0.2,ledgeY+34,10],[W*0.82,ledgeY+44,12]]){ ctx.beginPath(); ctx.moveTo(r[0]-r[2],r[1]); ctx.lineTo(r[0],r[1]-r[2]); ctx.lineTo(r[0]+r[2],r[1]); ctx.closePath(); ctx.fill(); }

  // summit cairn + flag
  const flX=W*0.5, flB=ledgeY+16;
  ctx.fillStyle='#6a6258'; ctx.beginPath(); ctx.arc(flX,flB,6,0,7); ctx.fill(); ctx.fillStyle='#7a7268'; ctx.beginPath(); ctx.arc(flX,flB-8,4,0,7); ctx.fill();
  ctx.strokeStyle='#5a4a3a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(flX,flB-10); ctx.lineTo(flX,flB-34); ctx.stroke();
  ctx.fillStyle='#e0504a'; ctx.beginPath(); ctx.moveTo(flX,flB-34); ctx.lineTo(flX+16+Math.sin(t*4)*2,flB-30); ctx.lineTo(flX,flB-26); ctx.closePath(); ctx.fill();

  // soaring bird
  ctx.strokeStyle='#444'; ctx.lineWidth=1.5; const gx=W*0.3+Math.sin(t*0.3)*40; ctx.beginPath(); ctx.moveTo(gx-6,H*0.24); ctx.quadraticCurveTo(gx,H*0.22,gx,H*0.24); ctx.quadraticCurveTo(gx,H*0.22,gx+6,H*0.24); ctx.stroke();
}
registerScene('mountain', drawMountainSummit);

/* ── APOTHECARY (indoor · herbalist) ── */
function drawApothecary(){
  const t = sceneTime, floorY = H*0.62;

  ctx.fillStyle='#4a3626'; ctx.fillRect(0,0,W,floorY);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#7a5638'); fl.addColorStop(1,'#5e4228');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for (let i=1;i<5;i++){ const y=floorY+i/5*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  const glow=ctx.createRadialGradient(W*0.5,H*0.4,20,W*0.5,H*0.5,W*0.6); glow.addColorStop(0,'rgba(255,180,80,.1)'); glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow; ctx.fillRect(0,0,W,floorY);

  // shelves of jars
  const jarc=['#7ac05a','#e0a020','#c0392b','#8e6a3a','#5a9ee0','#a05fd0'];
  for (let s=0;s<3;s++){ const sy=H*0.1+s*H*0.14; ctx.fillStyle='#3a2818'; ctx.fillRect(W*0.05,sy+20,W*0.9,4);
    for (let i=0;i<9;i++){ const jx=W*0.09+i*W*0.1; ctx.fillStyle='rgba(220,235,240,.25)'; ctx.fillRect(jx-6,sy,12,20); ctx.fillStyle=jarc[(i+s)%6]; ctx.fillRect(jx-5,sy+8,10,11); ctx.fillStyle='#8a6a4a'; ctx.fillRect(jx-6,sy-2,12,3); }
  }

  // hanging dried herb bundles
  for (const hx of [W*0.16,W*0.5,W*0.84]){ ctx.strokeStyle='#8a6a3a'; ctx.fillStyle='#8a6a3a'; ctx.fillRect(hx-3,H*0.5,6,4); ctx.fillStyle='#6a7a3a'; for (let k=0;k<7;k++){ const a=-1.3+k*0.4; ctx.save(); ctx.translate(hx,H*0.52); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,10,2,10,0,0,7); ctx.fill(); ctx.restore(); } }

  // counter with brass scale + mortar
  const cY=floorY-6;
  ctx.fillStyle='#5a3a24'; ctx.fillRect(W*0.1,cY-24,W*0.8,24+ (H-cY)); ctx.fillStyle='#4a2f1c'; ctx.fillRect(W*0.1,cY-24,W*0.8,5);
  const scX=W*0.30, scB=cY-24, tilt=Math.sin(t*1.5)*2;
  ctx.strokeStyle='#c9a24a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(scX,scB); ctx.lineTo(scX,scB-24); ctx.moveTo(scX-16,scB-24); ctx.lineTo(scX+16,scB-24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(scX-16,scB-24); ctx.lineTo(scX-16,scB-14+tilt); ctx.moveTo(scX+16,scB-24); ctx.lineTo(scX+16,scB-14-tilt); ctx.stroke();
  ctx.fillStyle='#c9a24a'; ctx.beginPath(); ctx.ellipse(scX-16,scB-13+tilt,6,2,0,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(scX+16,scB-13-tilt,6,2,0,0,7); ctx.fill();
  const mX=W*0.66, mB=cY-24;
  ctx.fillStyle='#9a9288'; ctx.beginPath(); ctx.moveTo(mX-10,mB-12); ctx.lineTo(mX+10,mB-12); ctx.lineTo(mX+7,mB); ctx.lineTo(mX-7,mB); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#7a7268'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(mX+2,mB-8); ctx.lineTo(mX+10,mB-22); ctx.stroke();
}
registerScene('apothecary', drawApothecary);

/* ── ICE SKATING POND (outdoor · winter evening) ── */
function drawIcePond(){
  const t = sceneTime, iceY = H*0.58;

  const sky=ctx.createLinearGradient(0,0,0,iceY); sky.addColorStop(0,'#2a3a6a'); sky.addColorStop(1,'#d0a0a0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,iceY);
  for (let i=0;i<18;i++){ const sx=(i*83+5)%W, sy=(i*37+3)%(iceY*0.5); ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(sx,sy,1,1); }
  ctx.fillStyle='#dbe8f0'; ctx.fillRect(0,iceY-14,W,14);
  for (let i=0;i<6;i++) drawSnowPine(W*0.08+i*W*0.17, iceY-8, 22+((i*19)%12));

  // string lights
  ctx.strokeStyle='rgba(150,130,110,.5)'; ctx.lineWidth=1; ctx.beginPath(); for (let x=0;x<=W;x+=10){ const y=20+Math.sin(x*0.04)*8; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y); } ctx.stroke();
  for (let x=14;x<W;x+=26){ const y=20+Math.sin(x*0.04)*8+4; ctx.fillStyle=`rgba(255,200,120,${0.7+0.3*Math.sin(t*3+x)})`; ctx.beginPath(); ctx.arc(x,y,2.5,0,7); ctx.fill(); }

  // frozen pond
  const ice=ctx.createLinearGradient(0,iceY,0,H); ice.addColorStop(0,'#bfe0ef'); ice.addColorStop(1,'#9ac8de');
  ctx.fillStyle=ice; ctx.fillRect(0,iceY,W,H-iceY);
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=1; for (let i=0;i<6;i++){ const y=iceY+10+i*((H-iceY)/6); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y-6); ctx.stroke(); }
  ctx.strokeStyle='rgba(160,190,210,.6)'; ctx.lineWidth=1.5; ctx.beginPath(); for (let x=0;x<=W;x+=6){ x===0?ctx.moveTo(x,iceY+50):ctx.lineTo(x, iceY+50+Math.sin(x*0.05)*20); } ctx.stroke(); ctx.beginPath(); for (let x=0;x<=W;x+=6){ x===0?ctx.moveTo(x,iceY+90):ctx.lineTo(x, iceY+90+Math.cos(x*0.06)*16); } ctx.stroke();

  // bonfire on the bank
  const fX=W*0.12, fY=iceY-6;
  const glow=ctx.createRadialGradient(fX,fY,2,fX,fY,40); glow.addColorStop(0,'rgba(255,150,60,.4)'); glow.addColorStop(1,'rgba(255,150,60,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(fX,fY,40,0,7); ctx.fill();
  ctx.strokeStyle='#5a3a20'; ctx.lineWidth=3; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(fX-8,fY); ctx.lineTo(fX+8,fY-3); ctx.moveTo(fX-8,fY-3); ctx.lineTo(fX+8,fY); ctx.stroke(); ctx.lineCap='butt';
  for (let i=0;i<3;i++){ const fl=0.7+0.3*Math.sin(t*8+i); ctx.fillStyle=['#ff5a00','#ff9a1f','#ffd21f'][i]; ctx.beginPath(); ctx.moveTo(fX-5+i*2,fY-4); ctx.quadraticCurveTo(fX+Math.sin(t*10+i)*3,fY-4-14*fl,fX,fY-4-16*fl); ctx.quadraticCurveTo(fX+5-i*2,fY-4-8,fX+5-i*2,fY-4); ctx.closePath(); ctx.fill(); }

  // falling snow
  ctx.fillStyle='rgba(255,255,255,.8)'; for (let i=0;i<24;i++){ const seed=i*41.7, sx=(((seed*1.6+Math.sin(t+i)*8)%W)+W)%W, sy=(seed*2.2+t*14)%H; ctx.beginPath(); ctx.arc(sx,sy,1.2,0,7); ctx.fill(); }
}
registerScene('icepond', drawIcePond);

/* ── CAT CAFÉ (indoor · cats) ── */
function drawCatCafe(){
  const t = sceneTime, floorY = H*0.62;

  ctx.fillStyle='#f0e0cc'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#d8b48c'; ctx.fillRect(0,floorY-24,W,24);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#c99a6a'); fl.addColorStop(1,'#b5884f');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(90,60,20,.15)'; ctx.lineWidth=1; for (let i=1;i<5;i++){ const y=floorY+i/5*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  ctx.fillStyle='#a0522d'; ctx.font='bold 12px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('🐾 Cat Cafe 🐾', W*0.5, H*0.09); ctx.textAlign='left';
  ctx.fillStyle='#bfe0ef'; ctx.fillRect(W*0.06,H*0.14,W*0.24,H*0.2); ctx.strokeStyle='#fff'; ctx.lineWidth=5; ctx.strokeRect(W*0.06,H*0.14,W*0.24,H*0.2);
  ctx.fillStyle='#9a6b3f'; ctx.fillRect(W*0.5,H*0.2,W*0.4,4); ctx.fillRect(W*0.42,H*0.34,W*0.3,4);

  function cat(x,y,col,pose){
    ctx.fillStyle=col;
    if (pose==='loaf'){
      ctx.beginPath(); ctx.ellipse(x,y,14,8,0,0,7); ctx.fill();
      ctx.beginPath(); ctx.arc(x-10,y-4,6,0,7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x-14,y-8); ctx.lineTo(x-13,y-13); ctx.lineTo(x-9,y-9); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x-9,y-9); ctx.lineTo(x-7,y-14); ctx.lineTo(x-4,y-9); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(x-12,y-4,1,0,7); ctx.arc(x-8,y-4,1,0,7); ctx.fill();
      ctx.strokeStyle=col; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(x+13,y); ctx.quadraticCurveTo(x+22,y-2,x+20+Math.sin(t*3)*3,y-10); ctx.stroke();
    } else if (pose==='sit'){
      ctx.beginPath(); ctx.ellipse(x,y,8,12,0,0,7); ctx.fill();
      ctx.beginPath(); ctx.arc(x,y-12,7,0,7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x-6,y-16); ctx.lineTo(x-5,y-22); ctx.lineTo(x-1,y-16); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x+1,y-16); ctx.lineTo(x+5,y-22); ctx.lineTo(x+6,y-16); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(x-3,y-12,1,0,7); ctx.arc(x+3,y-12,1,0,7); ctx.fill();
      ctx.strokeStyle=col; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(x+6,y+8); ctx.quadraticCurveTo(x+16,y+8,x+16,y-2); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.ellipse(x,y,14,7,0,0,7); ctx.fill();
      ctx.beginPath(); ctx.arc(x+12,y-1,5,0,7); ctx.fill();
      ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x+10,y-2); ctx.lineTo(x+14,y-2); ctx.stroke();
      ctx.strokeStyle=col; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x-13,y); ctx.quadraticCurveTo(x-20,y-6,x-14,y-8); ctx.stroke();
    }
  }
  cat(W*0.6,H*0.2-2,'#e0a050','loaf');
  cat(W*0.78,H*0.2-2,'#5a5a5a','sit');
  cat(W*0.52,H*0.34-2,'#3a3a3a','loaf');

  // cat tree
  const ctX=W*0.88, ctB=floorY;
  ctx.fillStyle='#a08868'; ctx.fillRect(ctX-4,ctB-70,8,70);
  ctx.fillStyle='#c8b090'; ctx.beginPath(); ctx.ellipse(ctX,ctB-70,16,5,0,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(ctX-10,ctB-40,14,5,0,0,7); ctx.fill();
  cat(ctX,ctB-74,'#d8d0c0','loaf');

  // floor cushion with sleeping cat
  ctx.fillStyle='#c05fd0'; ctx.beginPath(); ctx.ellipse(W*0.24,floorY+30,26,10,0,0,7); ctx.fill();
  cat(W*0.24,floorY+26,'#8a5a3a','sleep');

  // sprite cat wandering on the floor
  SpriteRenderer.submit({sprite:'cat',phase:'actors',x:W*0.50,y:floorY+20,width:22,height:22,anchorY:1,frame:Math.floor(t*7)%4});
  // teacup on the counter
  SpriteRenderer.submit({sprite:'teacup',phase:'ground',x:W*0.40,y:floorY-4,width:14,height:14,anchorY:1,frame:0});
}
registerScene('catcafe', drawCatCafe);

/* ── SAVANNA SUNSET (outdoor · evening) ── */
function drawSavanna(){
  const t = sceneTime, groundY = H*0.60;

  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#8a3a5a'); sky.addColorStop(0.5,'#e0603a'); sky.addColorStop(1,'#f2b04a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='rgba(255,220,140,.4)'; ctx.beginPath(); ctx.arc(W*0.5,groundY-10,50,0,7); ctx.fill();
  ctx.fillStyle='#ffd070'; ctx.beginPath(); ctx.arc(W*0.5,groundY-10,36,0,7); ctx.fill();

  function acacia(x,baseY,s){
    ctx.fillStyle='#2a1a10'; ctx.fillRect(x-2*s,baseY-30*s,4*s,30*s);
    ctx.strokeStyle='#2a1a10'; ctx.lineWidth=2*s; ctx.beginPath(); ctx.moveTo(x,baseY-24*s); ctx.lineTo(x-14*s,baseY-34*s); ctx.moveTo(x,baseY-24*s); ctx.lineTo(x+14*s,baseY-34*s); ctx.stroke();
    ctx.fillStyle='#1a1008'; ctx.beginPath(); ctx.ellipse(x,baseY-36*s,22*s,7*s,0,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x-16*s,baseY-34*s,10*s,5*s,0,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x+16*s,baseY-34*s,10*s,5*s,0,0,7); ctx.fill();
  }
  acacia(W*0.16,groundY,1.2); acacia(W*0.86,groundY,0.9);

  // giraffe silhouette
  const gx=W*0.66, gb=groundY;
  ctx.fillStyle='#3a2418'; ctx.fillRect(gx-8,gb-16,16,10); ctx.fillRect(gx-6,gb-6,3,6); ctx.fillRect(gx+3,gb-6,3,6);
  ctx.save(); ctx.translate(gx+6,gb-14); ctx.rotate(-0.5); ctx.fillRect(0,-20,3,22); ctx.restore();
  ctx.beginPath(); ctx.ellipse(gx+16,gb-30,4,3,0.3,0,7); ctx.fill();

  const g=ctx.createLinearGradient(0,groundY,0,H); g.addColorStop(0,'#c89a4a'); g.addColorStop(1,'#a87a2a');
  ctx.fillStyle=g; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.strokeStyle='#8a6a1a'; ctx.lineWidth=1; for (let i=0;i<50;i++){ const tx=(i*47+7)%W, ty=groundY+8+((i*31)%(H-groundY-8)); ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx+Math.sin(i)*2,ty-5-Math.abs(Math.cos(i))*4); ctx.stroke(); }

  ctx.strokeStyle='#2a1a10'; ctx.lineWidth=1.5; for (let i=0;i<3;i++){ const bx=W*0.3+i*20+Math.sin(t*0.3+i)*10, by=H*0.2+i*8; ctx.beginPath(); ctx.moveTo(bx-5,by); ctx.quadraticCurveTo(bx,by-3,bx,by); ctx.quadraticCurveTo(bx,by-3,bx+5,by); ctx.stroke(); }
}
registerScene('savanna', drawSavanna);

/* ── ANTIQUE SHOP (indoor · antiques) ── */
function drawAntiqueShop(){
  const t = sceneTime, floorY = H*0.62;

  ctx.fillStyle='#4a3a2e'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='rgba(0,0,0,.05)'; for (let x=0;x<W;x+=20) ctx.fillRect(x,0,10,floorY);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#6a4a30'); fl.addColorStop(1,'#503826');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='rgba(140,60,74,.3)'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.85,W*0.36,H*0.08,0,0,7); ctx.fill();

  // framed portraits
  for (const [px,py,pw,ph] of [[W*0.1,H*0.1,30,38],[W*0.24,H*0.12,26,32]]){ ctx.fillStyle='#c9a24a'; ctx.fillRect(px-3,py-3,pw+6,ph+6); ctx.fillStyle='#8a7a6a'; ctx.fillRect(px,py,pw,ph); ctx.fillStyle='#5a4a3a'; ctx.beginPath(); ctx.arc(px+pw/2,py+ph*0.4,pw*0.25,0,7); ctx.fill(); }

  // chandelier
  ctx.strokeStyle='#c9a24a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.5,0); ctx.lineTo(W*0.5,H*0.1); ctx.stroke(); ctx.beginPath(); ctx.arc(W*0.5,H*0.12,14,Math.PI,0); ctx.stroke();
  for (let i=-1;i<=1;i++){ ctx.fillStyle=`rgba(255,220,150,${0.6+0.2*Math.sin(t*3+i)})`; ctx.beginPath(); ctx.arc(W*0.5+i*12,H*0.12,3,0,7); ctx.fill(); }

  // counter
  const cY=floorY-6;
  ctx.fillStyle='#5a3a24'; ctx.fillRect(W*0.05,cY-8,W*0.9,8+(H-cY)); ctx.fillStyle='#4a2f1c'; ctx.fillRect(W*0.05,cY-8,W*0.9,4);

  // globe
  const glX=W*0.16, glY=cY-8;
  ctx.fillStyle='#3a6a8a'; ctx.beginPath(); ctx.arc(glX,glY-12,12,0,7); ctx.fill(); ctx.fillStyle='#4a8a5a'; ctx.beginPath(); ctx.arc(glX-3,glY-14,4,0,7); ctx.arc(glX+4,glY-10,3,0,7); ctx.fill(); ctx.strokeStyle='#c9a24a'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(glX,glY-12,14,Math.PI*1.2,Math.PI*2.2); ctx.stroke(); ctx.fillStyle='#8a5a3a'; ctx.fillRect(glX-2,glY-2,4,4);

  // stacked books
  const bkX=W*0.32, bkc=['#7a3a3a','#3a5a7a','#5a7a3a'];
  for (let i=0;i<3;i++){ ctx.fillStyle=bkc[i]; ctx.save(); ctx.translate(bkX,cY-8-i*6); ctx.rotate((i-1)*0.05); ctx.fillRect(-14,-6,28,6); ctx.restore(); }

  // gramophone
  const grX=W*0.52, grY=cY-8;
  ctx.fillStyle='#5a3a1a'; ctx.fillRect(grX-10,grY-8,20,8);
  ctx.fillStyle='#c9a24a'; ctx.beginPath(); ctx.moveTo(grX+8,grY-6); ctx.lineTo(grX+26,grY-22); ctx.lineTo(grX+24,grY-30); ctx.lineTo(grX+6,grY-12); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#a0822a'; ctx.beginPath(); ctx.ellipse(grX+25,grY-26,3,7,0.6,0,7); ctx.fill();

  // oil lamp
  const lpX=W*0.8, lpY=cY-8;
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(lpX-2,lpY-14,4,14); ctx.beginPath(); ctx.ellipse(lpX,lpY,8,3,0,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,220,150,.5)'; ctx.beginPath(); ctx.ellipse(lpX,lpY-20,7,9,0,0,7); ctx.fill(); ctx.fillStyle='#ffcf5a'; ctx.beginPath(); ctx.ellipse(lpX,lpY-20,2,4+Math.sin(t*8),0,0,7); ctx.fill();
}
registerScene('antiqueshop', drawAntiqueShop);

/* ── WATERLILY POND (outdoor · serene) ── */
function drawWaterlilyPond(){
  const t = sceneTime, bankY = H*0.66;

  const sky=ctx.createLinearGradient(0,0,0,H*0.3); sky.addColorStop(0,'#bfe0ef'); sky.addColorStop(1,'#dff0e8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H*0.3);
  ctx.fillStyle='#7aad6a'; ctx.fillRect(0,H*0.26,W,H*0.08);
  const pond=ctx.createLinearGradient(0,H*0.3,0,bankY); pond.addColorStop(0,'#4a8a7a'); pond.addColorStop(1,'#3a6a6a');
  ctx.fillStyle=pond; ctx.fillRect(0,H*0.3,W,bankY-H*0.3);
  ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1; for (let i=0;i<8;i++){ const y=H*0.34+i*5; ctx.beginPath(); for (let x=0;x<=W;x+=8){ x===0?ctx.moveTo(x,y):ctx.lineTo(x,y+Math.sin(x*0.1+t+i)*1.2); } ctx.stroke(); }

  // arched bridge
  const brX=W*0.5, brY=H*0.42;
  ctx.strokeStyle='#4a7a4a'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(brX,brY+30,50,Math.PI*1.15,Math.PI*1.85); ctx.stroke();
  ctx.strokeStyle='#3a6a3a'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(brX,brY+34,50,Math.PI*1.15,Math.PI*1.85); ctx.stroke();

  // lily pads + flowers
  const pads=[[W*0.2,H*0.5,1],[W*0.35,H*0.58,0],[W*0.7,H*0.52,1],[W*0.82,H*0.6,0],[W*0.5,H*0.6,1],[W*0.15,H*0.62,0]];
  for (const [px,py,fl] of pads){ ctx.fillStyle='#3a7a4a'; ctx.beginPath(); ctx.arc(px,py,8,0.4,6.1); ctx.fill(); if (fl){ ctx.fillStyle=(px%2<1)?'#f2a6c0':'#f7ead0'; ctx.beginPath(); ctx.arc(px,py-2,3.5,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(px,py-2,1.2,0,7); ctx.fill(); } }

  // weeping willow
  ctx.fillStyle='#5a3a22'; ctx.fillRect(W*0.06-3,H*0.16,6,H*0.16);
  ctx.strokeStyle='#6aad5a'; ctx.lineWidth=1.5; for (let i=0;i<10;i++){ const wx=W*0.06-20+i*5; ctx.beginPath(); ctx.moveTo(wx,H*0.18); ctx.quadraticCurveTo(wx+Math.sin(t+i)*3,H*0.3,wx+Math.sin(t+i)*5,H*0.42); ctx.stroke(); }
  ctx.fillStyle='#5a9a4a'; ctx.beginPath(); ctx.ellipse(W*0.06,H*0.16,26,14,0,0,7); ctx.fill();

  // grassy bank
  const bank=ctx.createLinearGradient(0,bankY,0,H); bank.addColorStop(0,'#7aad5a'); bank.addColorStop(1,'#5a8a3a');
  ctx.fillStyle=bank; ctx.beginPath(); ctx.moveTo(0,bankY+6); ctx.quadraticCurveTo(W*0.5,bankY-8,W,bankY+6); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#3a6a2a'; ctx.lineWidth=2; for (let i=0;i<8;i++){ const rx=(i*47+10)%W; ctx.beginPath(); ctx.moveTo(rx,bankY+20); ctx.quadraticCurveTo(rx+Math.sin(t+i)*3,bankY,rx+Math.sin(t+i)*5,bankY-16); ctx.stroke(); }
}
registerScene('waterlily', drawWaterlilyPond);
