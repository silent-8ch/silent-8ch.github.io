/* scenes 4/4  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */


/* ── LUTHIER WORKSHOP (indoor · making violins) ── */
function drawLuthier(){
  const t=sceneTime, floorY=H*0.66;
  // warm amber shop
  ctx.fillStyle='#c9a468'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#7a5432'; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='#b8945a'; ctx.fillRect(0,H*0.12,W,2);
  // warm window light
  ctx.fillStyle='#f2e0a8'; ctx.fillRect(W*0.72,H*0.06,W*0.22,H*0.22);
  ctx.strokeStyle='#8a6a40'; ctx.lineWidth=2; ctx.strokeRect(W*0.72,H*0.06,W*0.22,H*0.22);
  ctx.beginPath(); ctx.moveTo(W*0.83,H*0.06); ctx.lineTo(W*0.83,H*0.28); ctx.moveTo(W*0.72,H*0.17); ctx.lineTo(W*0.94,H*0.17); ctx.stroke();
  // a violin shape helper
  function violin(x,y,s,ang,varnish){
    ctx.save(); ctx.translate(x,y); ctx.rotate(ang);
    // body (two bouts via arcs)
    ctx.fillStyle=varnish;
    ctx.beginPath();
    ctx.moveTo(0,-26*s);
    ctx.bezierCurveTo(14*s,-24*s, 13*s,-8*s, 7*s,-4*s); // upper bout right
    ctx.bezierCurveTo(4*s,-2*s, 4*s,2*s, 7*s,4*s);      // waist right
    ctx.bezierCurveTo(15*s,10*s, 15*s,30*s, 0,32*s);    // lower bout right
    ctx.bezierCurveTo(-15*s,30*s, -15*s,10*s, -7*s,4*s);
    ctx.bezierCurveTo(-4*s,2*s, -4*s,-2*s, -7*s,-4*s);
    ctx.bezierCurveTo(-13*s,-8*s, -14*s,-24*s, 0,-26*s);
    ctx.closePath(); ctx.fill();
    // edge highlight
    ctx.strokeStyle='rgba(255,240,200,.25)'; ctx.lineWidth=1; ctx.stroke();
    // f-holes
    ctx.strokeStyle='#3a2414'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(-4*s,6*s); ctx.quadraticCurveTo(-6*s,14*s,-4*s,20*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4*s,6*s); ctx.quadraticCurveTo(6*s,14*s,4*s,20*s); ctx.stroke();
    // neck + scroll
    ctx.fillStyle='#5a3a1e'; ctx.fillRect(-2.5*s,-46*s,5*s,22*s);
    ctx.fillStyle='#6a4626'; ctx.beginPath(); ctx.arc(0,-48*s,4*s,0,7); ctx.fill();
    // strings
    ctx.strokeStyle='rgba(240,235,220,.7)'; ctx.lineWidth=0.5;
    for(let k=-1.5;k<=1.5;k++){ ctx.beginPath(); ctx.moveTo(k*1.6*s,-44*s); ctx.lineTo(k*1.6*s,28*s); ctx.stroke(); }
    ctx.restore();
  }
  // three violins hanging from the ceiling by their scrolls, gently swaying
  const varn=['#a5541f','#8a3e1a','#b5651f'];
  for(let i=0;i<3;i++){ const hx=W*0.16+i*W*0.14; const sway=Math.sin(t*1.1+i)*0.05;
    ctx.strokeStyle='#555'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(hx,H*0.02); ctx.lineTo(hx+Math.sin(sway)*30,H*0.06); ctx.stroke();
    violin(hx, H*0.2, 0.85, sway, varn[i]); }
  // the workbench
  const by=floorY-4; ctx.fillStyle='#6a4a2e'; ctx.fillRect(0,by-8,W,8+(H-by)); ctx.fillStyle='#7a5636'; ctx.fillRect(0,by-8,W,4);
  // a violin body in progress clamped on the bench (pale unvarnished spruce)
  violin(W*0.4, by-26, 1.0, -1.57, '#e8d6a8'); // lying on side
  // carving gouges + a plane + clamps around it
  ctx.fillStyle='#8a8a92'; ctx.fillRect(W*0.5,by-16,16,7); ctx.fillStyle='#5a3a1e'; ctx.fillRect(W*0.5,by-16,4,7); // plane
  for(let i=0;i<3;i++){ ctx.strokeStyle='#9a9aa2'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.58+i*10,by-6); ctx.lineTo(W*0.58+i*10,by-20); ctx.stroke();
    ctx.fillStyle='#5a3a1e'; ctx.fillRect(W*0.58+i*10-2,by-24,4,6); } // gouges standing
  // curled wood shavings on the bench
  ctx.strokeStyle='#d8bd82'; ctx.lineWidth=1.5; for(let i=0;i<6;i++){ const sx=W*0.16+i*W*0.05; ctx.beginPath();
    for(let a=0;a<6;a++){ const r=3+a*0.6, an=a*0.9; const px=sx+Math.cos(an)*r, py=by+6+Math.sin(an)*r*0.5; if(a===0)ctx.moveTo(px,py); else ctx.lineTo(px,py);} ctx.stroke(); }
  // varnish pot + brush on the right of the bench
  ctx.fillStyle='#7a3a1a'; ctx.fillRect(W*0.86,by-14,12,14); ctx.fillStyle='#a5541f'; ctx.beginPath(); ctx.ellipse(W*0.86+6,by-14,6,2.5,0,0,7); ctx.fill();
  ctx.strokeStyle='#5a3a1e'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.9,by-14); ctx.lineTo(W*0.93,by-30); ctx.stroke(); ctx.fillStyle='#3a2414'; ctx.fillRect?.(W*0.925,by-32,3,4);
  // a bow hanging on the wall (right)
  ctx.strokeStyle='#3a2414'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.66,H*0.12); ctx.quadraticCurveTo(W*0.8,H*0.16,W*0.94,H*0.12); ctx.stroke();
  ctx.strokeStyle='rgba(240,235,220,.6)'; ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(W*0.66,H*0.125); ctx.lineTo(W*0.94,H*0.125); ctx.stroke();
}
registerScene('luthier', drawLuthier);

/* ── COVERED BRIDGE (outdoor · red bridge over an autumn stream) ── */
function drawCoveredBridge(){
  const t=sceneTime, waterY=H*0.72;
  // crisp autumn sky
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#a8d4ea'); sky.addColorStop(1,'#e8ecc8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  // autumn tree line behind
  const foliage=['#d0602a','#e0902a','#c04a2a','#e0b83a','#a5642a'];
  for(let i=0;i<10;i++){ const tx=i*W*0.11, ty=waterY-6, r=18+ (i%3)*8;
    ctx.fillStyle=foliage[i%foliage.length]; ctx.beginPath(); ctx.arc(tx,ty-r*0.4,r,0,7); ctx.arc(tx+r*0.6,ty-r*0.2,r*0.7,0,7); ctx.arc(tx-r*0.6,ty-r*0.2,r*0.7,0,7); ctx.fill(); }
  // grassy banks
  ctx.fillStyle='#7a8a3a'; ctx.fillRect(0,waterY-8,W,14);
  // stream
  const water=ctx.createLinearGradient(0,waterY,0,H); water.addColorStop(0,'#4a7a8a'); water.addColorStop(1,'#2f5566');
  ctx.fillStyle=water; ctx.fillRect(0,waterY,W,H-waterY);
  // the covered bridge spanning the stream
  const bx0=W*0.12, bx1=W*0.88, deckY=waterY-4;
  // stone abutments
  ctx.fillStyle='#8a8078'; ctx.fillRect(bx0-14,deckY-6,18,H-deckY+6); ctx.fillRect(bx1-4,deckY-6,18,H-deckY+6);
  // red barn-board body
  const bodyTop=deckY-58;
  ctx.fillStyle='#a0341f'; ctx.fillRect(bx0,bodyTop,bx1-bx0,54);
  // vertical plank shading
  ctx.strokeStyle='rgba(0,0,0,.14)'; ctx.lineWidth=1; for(let x=bx0;x<bx1;x+=8){ ctx.beginPath(); ctx.moveTo(x,bodyTop); ctx.lineTo(x,deckY-4); ctx.stroke(); }
  // white portal trim + dark entrance arch
  ctx.fillStyle='#e8e0d0'; ctx.fillRect(bx0-2,bodyTop-4,bx1-bx0+4,6);
  ctx.fillStyle='#2a1a14'; ctx.beginPath(); ctx.moveTo(bx0+10,deckY-4); ctx.lineTo(bx0+10,bodyTop+14); ctx.quadraticCurveTo((bx0+bx1)/2,bodyTop-2,bx1-10,bodyTop+14); ctx.lineTo(bx1-10,deckY-4); ctx.closePath(); ctx.fill();
  // a little arched window glow midway
  ctx.fillStyle='#3a2a1e'; ctx.fillRect((bx0+bx1)/2-6,bodyTop+18,12,10);
  // gable roof
  ctx.fillStyle='#5a3a24'; ctx.beginPath(); ctx.moveTo(bx0-8,bodyTop); ctx.lineTo(bx1+8,bodyTop); ctx.lineTo(bx1-6,bodyTop-16); ctx.lineTo(bx0+6,bodyTop-16); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#4a2e1c'; ctx.fillRect(bx0+6,bodyTop-18,bx1-bx0-12,3);
  // reflection of the bridge in the stream (wavering)
  ctx.save(); ctx.globalAlpha=0.3;
  for(let i=0;i<6;i++){ const ry=waterY+4+i*4; const wob=Math.sin(t*1.6+i)*3;
    ctx.fillStyle='#a0341f'; ctx.fillRect(bx0+wob,ry,bx1-bx0,3); }
  ctx.restore();
  // ripple lines
  for(let i=0;i<5;i++){ const ry=waterY+16+i*((H-waterY)/6); ctx.strokeStyle='rgba(255,255,255,.1)'; ctx.lineWidth=1.5;
    ctx.beginPath(); for(let x=0;x<=W;x+=10){ const yy=ry+Math.sin(x*0.05+t*1.4+i)*2; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // fallen leaves drifting down the stream + a couple twirling in the air
  const lc=['#d0602a','#e0b83a','#c04a2a'];
  for(let i=0;i<6;i++){ const lx=(t*22+i*70)%(W+40)-20, ly=waterY+20+ (i%3)*14;
    ctx.fillStyle=lc[i%3]; ctx.save(); ctx.translate(lx,ly); ctx.rotate(t+i); ctx.beginPath(); ctx.ellipse(0,0,4,2,0,0,7); ctx.fill(); ctx.restore(); }
  for(let i=0;i<4;i++){ const lx=W*0.2+i*W*0.2+Math.sin(t*1.3+i)*20, ly=(t*30+i*60)%(waterY*0.9);
    ctx.fillStyle=lc[i%3]; ctx.save(); ctx.translate(lx,ly); ctx.rotate(t*2+i); ctx.beginPath(); ctx.ellipse(0,0,4,2,0,0,7); ctx.fill(); ctx.restore(); }
}
registerScene('coveredbridge', drawCoveredBridge);

/* ── CHEESE SHOP (indoor · artisan aging room & counter) ── */
function drawCheeseShop(){
  const t=sceneTime, floorY=H*0.66;
  // creamy walls, terracotta floor
  ctx.fillStyle='#efe4c8'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#a5623c'; ctx.fillRect(0,floorY,W,H-floorY);
  for(let y=0;y*15<H-floorY;y++) for(let x=0;x<W/26+1;x++){ ctx.fillStyle=((x+y)%2)?'#9a5a36':'#b06a42'; ctx.fillRect(x*26,floorY+y*15,26,15); }
  ctx.fillStyle='#c9a24a'; ctx.fillRect(0,H*0.1,W,2);
  // "FROMAGERIE" sign
  ctx.fillStyle='#7a5a2a'; ctx.font='italic bold 13px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('Fromagerie', W*0.5, H*0.075); ctx.textAlign='left';
  // wall of aging shelves stacked with cheese wheels
  function wheel(x,y,r,rind){ ctx.fillStyle=rind; ctx.beginPath(); ctx.ellipse(x,y,r,r*0.42,0,0,7); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(x,y,r,r*0.42,0,0,Math.PI); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.15)'; ctx.beginPath(); ctx.ellipse(x-r*0.3,y-r*0.15,r*0.3,r*0.12,0,0,7); ctx.fill(); }
  const rinds=['#e8d18a','#d8b060','#e0c878','#c8a44a','#ecdca0'];
  for(let s=0;s<3;s++){ const sy=H*0.16+s*H*0.13;
    ctx.fillStyle='#8a6a40'; ctx.fillRect(W*0.04,sy+8,W*0.44,4);
    for(let i=0;i<5;i++){ const wx=W*0.09+i*W*0.09; wheel(wx,sy,15,rinds[(i+s)%rinds.length]);
      if(s<2) wheel(wx,sy-10,15,rinds[(i+s+2)%rinds.length]); } // stacked pair
  }
  // hanging provolone/cured cheeses (teardrop) on the right, gently swaying
  for(let i=0;i<4;i++){ const hx=W*0.62+i*W*0.09; const sway=Math.sin(t*1.1+i)*3;
    ctx.strokeStyle='#8a7a5a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(hx,H*0.12); ctx.lineTo(hx+sway,H*0.2); ctx.stroke();
    ctx.fillStyle='#e8c878'; ctx.beginPath(); ctx.moveTo(hx+sway,H*0.2); ctx.quadraticCurveTo(hx+sway-10,H*0.28,hx+sway,H*0.36); ctx.quadraticCurveTo(hx+sway+10,H*0.28,hx+sway,H*0.2); ctx.fill(); }
  // the deli counter with a glass case
  const cy=floorY-4; ctx.fillStyle='#6a4a30'; ctx.fillRect(W*0.06,cy-30,W*0.88,30+(H-cy));
  ctx.fillStyle='#7a5636'; ctx.fillRect(W*0.06,cy-30,W*0.88,5);
  ctx.fillStyle='rgba(210,235,240,.35)'; ctx.fillRect(W*0.08,cy-28,W*0.84,22);
  // wedges of cheese in the case (varied)
  const wedge=['#f2e3a0','#e8c060','#ecd888','#f0eecc','#e0b070'];
  for(let i=0;i<7;i++){ const wx=W*0.12+i*W*0.11; ctx.fillStyle=wedge[i%wedge.length];
    ctx.beginPath(); ctx.moveTo(wx,cy-8); ctx.lineTo(wx+16,cy-8); ctx.lineTo(wx+16,cy-22); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#c8a44a'; ctx.fillRect(wx,cy-9,16,2); // rind edge
    // blue-cheese veins on one
    if(i===3){ ctx.strokeStyle='#5a6a7a'; ctx.lineWidth=0.6; for(let v=0;v<4;v++){ ctx.beginPath(); ctx.moveTo(wx+4+v*3,cy-10); ctx.lineTo(wx+6+v*3,cy-18); ctx.stroke(); } }
  }
  // a cutting board on the counter with a wire cutter + a wedge, a grape cluster
  ctx.fillStyle='#8a6a44'; ctx.fillRect(W*0.4,cy-40,W*0.2,6);
  ctx.fillStyle='#f2e3a0'; ctx.beginPath(); ctx.moveTo(W*0.43,cy-40); ctx.lineTo(W*0.5,cy-40); ctx.lineTo(W*0.43,cy-52); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#cfcfd6'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.52,cy-52); ctx.lineTo(W*0.56,cy-40); ctx.stroke();
  ctx.fillStyle='#5a7a3a'; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(W*0.56+ (i%2)*4, cy-42+Math.floor(i/2)*4, 2.4,0,7); ctx.fill(); }
}
registerScene('cheeseshop', drawCheeseShop);

/* ── CANYON (outdoor · red-rock gorge with a river far below) ── */
function drawCanyon(){
  const t=sceneTime, riverY=H*0.82;
  // hazy warm sky in a slot of blue at the top
  const sky=ctx.createLinearGradient(0,0,0,H*0.3); sky.addColorStop(0,'#8fc0e0'); sky.addColorStop(1,'#f0d8a8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H*0.3);
  // far canyon wall (hazy, receding)
  ctx.fillStyle='#c88a6a'; ctx.fillRect(0,H*0.24,W,riverY-H*0.24);
  // layered strata on the far wall
  const strata=['#b87a5a','#c88a6a','#a56a4a','#d09a72','#bd8060'];
  for(let i=0;i<8;i++){ ctx.fillStyle=strata[i%strata.length]; ctx.fillRect(0,H*0.24+i*((riverY-H*0.24)/8), W, (riverY-H*0.24)/8 * 0.7); }
  // atmospheric haze wash over the far wall
  ctx.fillStyle='rgba(240,220,200,.25)'; ctx.fillRect(0,H*0.24,W,riverY-H*0.24);
  // the river far below, winding, catching light
  ctx.fillStyle='#4a7a86'; ctx.fillRect(0,riverY,W,H-riverY);
  ctx.fillStyle='#6a9aa6'; ctx.beginPath(); ctx.moveTo(0,riverY+6); ctx.quadraticCurveTo(W*0.3,riverY+2,W*0.55,riverY+10); ctx.quadraticCurveTo(W*0.8,riverY+18,W,riverY+8); ctx.lineTo(W,riverY+22); ctx.lineTo(0,riverY+22); ctx.fill();
  for(let i=0;i<4;i++){ ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1; ctx.beginPath(); for(let x=0;x<=W;x+=10){ const yy=riverY+12+i*4+Math.sin(x*0.06+t*1.5+i)*1.5; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // FOREGROUND canyon walls framing left & right (dark, textured, in shadow)
  function wall(side){ const dir=side; ctx.save();
    ctx.fillStyle='#7a3f28';
    ctx.beginPath();
    if(dir<0){ ctx.moveTo(0,0); ctx.lineTo(W*0.34,0); ctx.lineTo(W*0.2,riverY); ctx.lineTo(0,riverY); }
    else { ctx.moveTo(W,0); ctx.lineTo(W*0.66,0); ctx.lineTo(W*0.82,riverY); ctx.lineTo(W,riverY); }
    ctx.closePath(); ctx.fill();
    // strata bands on the near wall
    ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=2;
    for(let i=1;i<10;i++){ const y=riverY*i/10; ctx.beginPath();
      if(dir<0){ ctx.moveTo(0,y); ctx.lineTo(W*0.34 - (W*0.14)*(y/riverY), y+4); }
      else { ctx.moveTo(W,y); ctx.lineTo(W*0.66 + (W*0.16)*(y/riverY), y+4); }
      ctx.stroke(); }
    // vertical erosion streaks
    ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=1;
    for(let i=0;i<5;i++){ const x= dir<0? W*0.05+i*W*0.05 : W*0.7+i*W*0.05; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x-dir*10,riverY); ctx.stroke(); }
    ctx.restore();
  }
  wall(-1); wall(1);
  // a scrubby bush + a saguaro-like plant on a ledge
  ctx.fillStyle='#5a7a3a'; ctx.beginPath(); ctx.arc(W*0.24,riverY-40,8,0,7); ctx.fill();
  ctx.fillStyle='#4f7a3a'; ctx.fillRect(W*0.74,riverY-70,5,50); ctx.fillRect(W*0.72,riverY-56,3,14); ctx.fillRect(W*0.78,riverY-60,3,16);
  // two hawks circling on thermals between the walls
  for(let i=0;i<2;i++){ const a=t*0.5+i*Math.PI; const hx=W*0.5+Math.cos(a)*W*0.16, hy=H*0.4+Math.sin(a)*H*0.08;
    ctx.strokeStyle='#3a2a20'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(hx-7,hy); ctx.quadraticCurveTo(hx,hy-5,hx+7,hy); ctx.stroke(); }
  // sun-shaft cutting diagonally into the gorge
  ctx.save(); ctx.globalAlpha=0.1; ctx.fillStyle='#fff2c0';
  ctx.beginPath(); ctx.moveTo(W*0.34,0); ctx.lineTo(W*0.44,0); ctx.lineTo(W*0.34,riverY); ctx.lineTo(W*0.26,riverY); ctx.closePath(); ctx.fill(); ctx.restore();
}
registerScene('canyon', drawCanyon);

/* ── COMIC SHOP (indoor · comics, spinner rack, posters) ── */
function drawComicShop(){
  const t=sceneTime, floorY=H*0.68;
  // bold shop
  ctx.fillStyle='#243a5a'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#4a3a2a'; ctx.fillRect(0,floorY,W,H-floorY); // wood floor
  for(let i=0;i<7;i++){ ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(0,floorY+i*((H-floorY)/7),W,1); }
  // pop-art halftone accent stripe
  ctx.fillStyle='#e0c020'; ctx.fillRect(0,H*0.1,W,3);
  ctx.fillStyle='rgba(255,255,255,.08)'; for(let i=0;i<W;i+=10) ctx.beginPath(),ctx.arc(i,H*0.05,3,0,7),ctx.fill();
  // "COMICS" sign in a burst
  ctx.fillStyle='#e02030'; ctx.save(); ctx.translate(W*0.5,H*0.06);
  ctx.beginPath(); for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, r=(i%2)?26:18; ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r*0.6);} ctx.closePath(); ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='bold 11px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('COMICS', 0,4); ctx.restore(); ctx.textAlign='left';
  // wall of framed cover art (colorful rectangles with simple "hero" marks)
  const covers=['#e02030','#2060c0','#20a050','#e0a020','#8040c0','#e05090'];
  for(let s=0;s<2;s++) for(let i=0;i<5;i++){ const cx=W*0.06+i*W*0.1, cy=H*0.16+s*H*0.16;
    ctx.fillStyle='#111'; ctx.fillRect(cx-2,cy-2,W*0.08+4,H*0.12+4);
    ctx.fillStyle=covers[(i+s*3)%covers.length]; ctx.fillRect(cx,cy,W*0.08,H*0.12);
    // a lightning/star emblem
    ctx.fillStyle='#fff'; ctx.save(); ctx.translate(cx+W*0.04,cy+H*0.06);
    ctx.beginPath(); for(let k=0;k<10;k++){ const a=k/10*Math.PI*2 - Math.PI/2, r=(k%2)?8:3.5; ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);} ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(cx,cy,W*0.08,4); } // title bar
  // the spinning wire rack (center) with comics fanned around it, slowly rotating
  const rx=W*0.5, rBase=floorY+2;
  ctx.fillStyle='#888'; ctx.fillRect(rx-2,rBase-70,4,70); // pole
  ctx.beginPath(); ctx.ellipse(rx,rBase,20,6,0,0,7); ctx.fill();
  for(let tier=0;tier<3;tier++){ const ty=rBase-56+tier*20;
    const rot=t*0.6 + tier*0.5;
    for(let i=0;i<6;i++){ const a=rot+i/6*Math.PI*2; const depth=(Math.sin(a)+1)/2; // front bigger
      const px=rx+Math.cos(a)*22; const s=0.6+depth*0.5;
      ctx.fillStyle=covers[(i+tier)%covers.length]; ctx.globalAlpha=0.5+depth*0.5;
      ctx.fillRect(px-5*s, ty-8*s, 10*s, 16*s);
      ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(px-5*s, ty-8*s, 10*s, 2*s);
      ctx.globalAlpha=1; }
  }
  // long boxes of back-issues on the floor (left & right)
  function longbox(x){ ctx.fillStyle='#d8cbb0'; ctx.fillRect(x,floorY+6,W*0.2,H*0.18);
    ctx.fillStyle='#c0b090'; ctx.fillRect(x,floorY+6,W*0.2,4);
    for(let i=0;i<12;i++){ ctx.fillStyle=covers[i%covers.length]; ctx.fillRect(x+4+i*(W*0.2-8)/12, floorY+8, 2, H*0.16); } // comic tops
    ctx.fillStyle='#3a2a1a'; ctx.font='7px Segoe UI'; }
  longbox(W*0.04); longbox(W*0.76);
  // a cardboard standee of a hero by the counter
  const sx=W*0.22;
  ctx.fillStyle='#2060c0'; ctx.fillRect(sx-8,floorY-40,16,44);
  ctx.fillStyle='#f0c090'; ctx.beginPath(); ctx.arc(sx,floorY-46,6,0,7); ctx.fill();
  ctx.fillStyle='#e02030'; ctx.beginPath(); ctx.moveTo(sx-8,floorY-38); ctx.lineTo(sx-16,floorY-20); ctx.lineTo(sx-8,floorY-24); ctx.closePath(); ctx.fill(); // cape
  ctx.fillStyle='#e0c020'; ctx.beginPath(); ctx.moveTo(sx,floorY-34); ctx.lineTo(sx-3,floorY-28); ctx.lineTo(sx+3,floorY-28); ctx.closePath(); ctx.fill(); // chest emblem
}
registerScene('comicshop', drawComicShop);

/* ── ALPINE MEADOW (outdoor · flowered pasture below snowy peaks) ── */
function drawAlpineMeadow(){
  const t=sceneTime, groundY=H*0.5;
  // clear mountain sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#5aa0e0'); sky.addColorStop(1,'#cfe8f2');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  for(let i=0;i<3;i++){ const cx=((t*5+i*140)%(W+120))-60; ctx.fillStyle='rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(cx,H*0.1+i*14,10,0,7); ctx.arc(cx+12,H*0.1+i*14+2,8,0,7); ctx.arc(cx-11,H*0.1+i*14+3,7,0,7); ctx.fill(); }
  // snowy peaks
  ctx.fillStyle='#8a9ab0'; ctx.beginPath(); ctx.moveTo(0,groundY); ctx.lineTo(W*0.16,H*0.18); ctx.lineTo(W*0.32,groundY); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#7a8aa0'; ctx.beginPath(); ctx.moveTo(W*0.2,groundY); ctx.lineTo(W*0.44,H*0.12); ctx.lineTo(W*0.7,groundY); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#8a9ab0'; ctx.beginPath(); ctx.moveTo(W*0.58,groundY); ctx.lineTo(W*0.8,H*0.2); ctx.lineTo(W,groundY); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#eef4fa'; // snow caps
  ctx.beginPath(); ctx.moveTo(W*0.16,H*0.18); ctx.lineTo(W*0.1,H*0.27); ctx.lineTo(W*0.22,H*0.27); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W*0.44,H*0.12); ctx.lineTo(W*0.36,H*0.24); ctx.lineTo(W*0.53,H*0.24); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W*0.8,H*0.2); ctx.lineTo(W*0.74,H*0.28); ctx.lineTo(W*0.87,H*0.28); ctx.closePath(); ctx.fill();
  // dark evergreen tree line at the base of the mountains
  ctx.fillStyle='#2f5a3a'; for(let i=0;i<W;i+=12){ ctx.beginPath(); ctx.moveTo(i,groundY); ctx.lineTo(i+6,groundY-12); ctx.lineTo(i+12,groundY); ctx.closePath(); ctx.fill(); }
  // rolling green meadow
  ctx.fillStyle='#6aa83e'; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#5c9a34'; ctx.beginPath(); ctx.moveTo(0,groundY+20); ctx.quadraticCurveTo(W*0.5,groundY+2,W,groundY+24); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fill();
  // scattered wildflowers
  const fc=['#f2e24a','#ffffff','#e0609a','#8a6ae0'];
  for(let i=0;i<40;i++){ const fx=(i*53+11)%W, fy=groundY+10+ ((i*29)%(H-groundY-10)); const s=0.6+ (fy-groundY)/(H-groundY);
    ctx.fillStyle=fc[i%4]; ctx.beginPath(); ctx.arc(fx,fy,2*s,0,7); ctx.fill(); ctx.fillStyle='#f2e24a'; ctx.beginPath(); ctx.arc(fx,fy,0.8*s,0,7); ctx.fill(); }
  // a cow helper (brown & white, with a bell), tail flicking, head bobbing to graze
  function cow(x,y,s){
    const graze=Math.sin(t*1.5+x)*0.1;
    // body
    ctx.fillStyle='#f0ece4'; ctx.beginPath(); ctx.ellipse(x,y,18*s,10*s,0,0,7); ctx.fill();
    // brown patches
    ctx.fillStyle='#7a4a2a'; ctx.beginPath(); ctx.ellipse(x-6*s,y-2*s,6*s,5*s,0,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x+8*s,y+2*s,5*s,4*s,0,0,7); ctx.fill();
    // legs
    ctx.strokeStyle='#5a3a22'; ctx.lineWidth=2*s; for(let l=-1;l<=1;l+=2){ ctx.beginPath(); ctx.moveTo(x+l*10*s,y+8*s); ctx.lineTo(x+l*10*s,y+18*s); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x+l*4*s,y+8*s); ctx.lineTo(x+l*4*s,y+18*s); ctx.stroke(); }
    // head (lowered to graze)
    ctx.save(); ctx.translate(x-18*s,y-2*s); ctx.rotate(0.5+graze);
    ctx.fillStyle='#f0ece4'; ctx.fillRect(-2*s,0,8*s,7*s); ctx.fillStyle='#e0b0a0'; ctx.fillRect(4*s,4*s,4*s,3*s); // muzzle
    ctx.fillStyle='#5a3a22'; ctx.fillRect(-2*s,-2*s,2*s,3*s); ctx.fillRect(4*s,-2*s,2*s,3*s); // ears/horns
    ctx.restore();
    // bell
    ctx.fillStyle='#c9a24a'; ctx.fillRect(x-19*s,y+2*s,4*s,4*s);
    // flicking tail
    ctx.strokeStyle='#5a3a22'; ctx.lineWidth=1.5*s; ctx.beginPath(); ctx.moveTo(x+17*s,y-4*s); ctx.lineTo(x+22*s+Math.sin(t*4+x)*3, y+6*s); ctx.stroke();
  }
  cow(W*0.3, groundY+50, 0.9);
  cow(W*0.62, groundY+70, 1.1);
  cow(W*0.82, groundY+40, 0.75);
  // a little wooden chalet on the right
  const cx=W*0.9, cy=groundY+30;
  ctx.fillStyle='#8a6a44'; ctx.fillRect(cx-14,cy-14,28,18); ctx.fillStyle='#5a3a24'; ctx.beginPath(); ctx.moveTo(cx-18,cy-14); ctx.lineTo(cx+18,cy-14); ctx.lineTo(cx,cy-26); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#c98a3a'; ctx.fillRect(cx-4,cy-6,8,10);
}
registerScene('alpinemeadow', drawAlpineMeadow);

/* ── COBBLER (indoor · shoemaker's workshop) ── */
function drawCobbler(){
  const t=sceneTime, floorY=H*0.66;
  // warm leather-brown shop
  ctx.fillStyle='#b89a70'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#6a4a30'; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='#a5885c'; ctx.fillRect(0,H*0.12,W,2);
  // small window
  ctx.fillStyle='#e0d2a8'; ctx.fillRect(W*0.72,H*0.06,W*0.2,H*0.2); ctx.strokeStyle='#5a3e26'; ctx.lineWidth=2; ctx.strokeRect(W*0.72,H*0.06,W*0.2,H*0.2);
  ctx.beginPath(); ctx.moveTo(W*0.82,H*0.06); ctx.lineTo(W*0.82,H*0.26); ctx.moveTo(W*0.72,H*0.16); ctx.lineTo(W*0.92,H*0.16); ctx.stroke();
  // "SHOES" sign
  ctx.fillStyle='#5a3a22'; ctx.font='bold 12px Georgia, serif'; ctx.textAlign='center'; ctx.fillText('Cobbler', W*0.3, H*0.08); ctx.textAlign='left';
  // shelves of finished shoes (pairs, various colors)
  const sh=['#3a2a1a','#7a2a2a','#2a3a5a','#5a3a1a','#2a4a2a'];
  for(let s=0;s<3;s++){ const sy=H*0.16+s*H*0.13; ctx.fillStyle='#8a6a44'; ctx.fillRect(W*0.04,sy+8,W*0.42,4);
    for(let i=0;i<4;i++){ const bx=W*0.07+i*W*0.1; // a shoe silhouette
      for(let p=0;p<2;p++){ ctx.fillStyle=sh[(i+s)%sh.length]; ctx.beginPath();
        ctx.moveTo(bx+p*10,sy+8); ctx.quadraticCurveTo(bx+p*10-3,sy-2,bx+6+p*10,sy-2); ctx.lineTo(bx+16+p*10,sy+2); ctx.quadraticCurveTo(bx+18+p*10,sy+8,bx+16+p*10,sy+8); ctx.closePath(); ctx.fill(); } }
  }
  // the cobbler's bench with a cast-iron shoe last (foot form)
  const by=floorY-4; ctx.fillStyle='#5a3e26'; ctx.fillRect(0,by-8,W,8+(H-by)); ctx.fillStyle='#6a4a30'; ctx.fillRect(0,by-8,W,4);
  // the iron last stand (center) with a shoe being resoled
  const lx=W*0.42, ly=by-8;
  ctx.fillStyle='#3a3a42'; ctx.fillRect(lx-3,ly-40,6,40); ctx.beginPath(); ctx.ellipse(lx,ly,12,4,0,0,7); ctx.fill(); // stand
  // the iron foot form (pointing up) with a shoe on it
  ctx.fillStyle='#5a5a62'; ctx.save(); ctx.translate(lx,ly-40); ctx.rotate(-0.2);
  ctx.beginPath(); ctx.moveTo(-4,0); ctx.lineTo(4,0); ctx.lineTo(3,-16); ctx.quadraticCurveTo(0,-22,-3,-16); ctx.closePath(); ctx.fill(); ctx.restore();
  // shoe (upper) on the last + a fresh sole
  ctx.fillStyle='#7a2a2a'; ctx.beginPath(); ctx.moveTo(lx-14,ly-40); ctx.quadraticCurveTo(lx-16,ly-54,lx-2,ly-56); ctx.lineTo(lx+10,ly-52); ctx.quadraticCurveTo(lx+14,ly-44,lx+10,ly-40); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#c9a86a'; ctx.fillRect(lx-16,ly-40,32,4); // new sole
  // little hammer tapping tacks (animated)
  const tap=Math.abs(Math.sin(t*5))*6;
  ctx.save(); ctx.translate(lx+16,ly-52-tap); ctx.rotate(0.5);
  ctx.strokeStyle='#7a5230'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(14,10); ctx.stroke();
  ctx.fillStyle='#4a4a52'; ctx.fillRect(-4,-4,10,7); ctx.restore();
  // tools on the wall pegboard (right)
  ctx.fillStyle='#8a6a44'; ctx.fillRect(W*0.62,H*0.14,W*0.02,H*0.24);
  const toolC=['#9aa','#c9a86a','#9aa'];
  for(let i=0;i<3;i++){ ctx.strokeStyle=toolC[i]; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.66+i*W*0.06,H*0.16); ctx.lineTo(W*0.66+i*W*0.06,H*0.16+34+i*8); ctx.stroke();
    ctx.fillStyle=toolC[i]; ctx.fillRect(W*0.66+i*W*0.06-3,H*0.16+34+i*8,6,6); }
  // spools of waxed thread + an awl + leather scraps on the bench foreground
  for(let i=0;i<3;i++){ ctx.fillStyle=['#3a2a1a','#7a4a2a','#2a2a30'][i]; ctx.beginPath(); ctx.arc(W*0.14+i*W*0.06,by+6,5,0,7); ctx.fill();
    ctx.fillStyle='#8a6a44'; ctx.beginPath(); ctx.arc(W*0.14+i*W*0.06,by+6,1.6,0,7); ctx.fill(); }
  ctx.fillStyle='#8a5a34'; ctx.beginPath(); ctx.moveTo(W*0.7,by+2); ctx.lineTo(W*0.86,by+4); ctx.lineTo(W*0.82,by+14); ctx.lineTo(W*0.7,by+12); ctx.closePath(); ctx.fill(); // leather scrap
  ctx.strokeStyle='#5a3a22'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(W*0.6,by+2); ctx.lineTo(W*0.63,by-12); ctx.stroke(); ctx.fillStyle='#9aa'; ctx.fillRect(W*0.628,by-14,3,4); // awl
}
registerScene('cobbler', drawCobbler);

/* ── WHEAT FIELD (outdoor · golden wheat rippling at sunset) ── */
function drawWheatField(){
  const t=sceneTime, groundY=H*0.5;
  // amber sunset sky
  const sky=ctx.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,'#e0904a'); sky.addColorStop(0.5,'#f4b85a'); sky.addColorStop(1,'#f8dc90');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // big low sun
  const sunX=W*0.72, sunY=groundY-16;
  ctx.fillStyle='#fff0c0'; ctx.beginPath(); ctx.arc(sunX,sunY,32,0,7); ctx.fill();
  ctx.globalAlpha=0.25; ctx.beginPath(); ctx.arc(sunX,sunY,52,0,7); ctx.fill(); ctx.globalAlpha=1;
  // wispy clouds
  for(let i=0;i<3;i++){ const cx=((t*3+i*130)%(W+120))-60; ctx.fillStyle=`rgba(255,230,200,${0.5-i*0.1})`; ctx.beginPath(); ctx.ellipse(cx,H*0.14+i*12,30,5,0,0,7); ctx.fill(); }
  // distant hill line
  ctx.fillStyle='#c98a4a'; ctx.beginPath(); ctx.moveTo(0,groundY); ctx.quadraticCurveTo(W*0.5,groundY-16,W,groundY); ctx.lineTo(W,groundY+4); ctx.lineTo(0,groundY+4); ctx.fill();
  // the wheat field base
  const field=ctx.createLinearGradient(0,groundY,0,H); field.addColorStop(0,'#d8a83a'); field.addColorStop(1,'#a5761f');
  ctx.fillStyle=field; ctx.fillRect(0,groundY,W,H-groundY);
  // wind ripple bands sweeping across the field (lighter arcs moving)
  for(let i=0;i<8;i++){ const ry=groundY+8+i*((H-groundY)/8); ctx.strokeStyle='rgba(255,240,190,.15)'; ctx.lineWidth=3;
    ctx.beginPath(); for(let x=0;x<=W;x+=8){ const yy=ry+Math.sin(x*0.03 + t*1.5 + i*0.5)*4; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // individual wheat stalks (denser & taller toward foreground), swaying with the wind
  for(let row=0;row<5;row++){ const ry=groundY+16+row*((H-groundY)/5); const s=0.6+row*0.2;
    for(let i=0;i<28;i++){ const x=(i*W/28 + row*7)%W; const wind=Math.sin(t*1.5 + x*0.05 + row)*4*s;
      ctx.strokeStyle='#b5852a'; ctx.lineWidth=1*s; ctx.beginPath(); ctx.moveTo(x,ry+14*s); ctx.quadraticCurveTo(x+wind*0.5,ry, x+wind,ry-14*s); ctx.stroke();
      // grain head
      ctx.fillStyle='#e0c060'; ctx.beginPath(); ctx.ellipse(x+wind,ry-16*s,2*s,5*s,wind*0.05,0,7); ctx.fill();
      // awns
      ctx.strokeStyle='rgba(230,200,110,.7)'; ctx.lineWidth=0.5; for(let a=-1;a<=1;a+=2){ ctx.beginPath(); ctx.moveTo(x+wind,ry-20*s); ctx.lineTo(x+wind+a*3*s,ry-26*s); ctx.stroke(); }
    }
  }
  // a weathered scarecrow standing among the wheat
  const scx=W*0.24, scy=H*0.7;
  ctx.strokeStyle='#6a4a2a'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(scx,scy); ctx.lineTo(scx,scy+40); ctx.stroke(); // post
  ctx.beginPath(); ctx.moveTo(scx-20,scy+8); ctx.lineTo(scx+20,scy+8); ctx.stroke(); // arms
  ctx.fillStyle='#8a5a30'; ctx.fillRect(scx-10,scy-2,20,20); // shirt
  ctx.fillStyle='#e0c060'; ctx.beginPath(); ctx.arc(scx,scy-8,7,0,7); ctx.fill(); // straw head
  ctx.fillStyle='#7a4a20'; ctx.beginPath(); ctx.moveTo(scx-10,scy-12); ctx.lineTo(scx+10,scy-12); ctx.lineTo(scx,scy-22); ctx.closePath(); ctx.fill(); // hat
  // straw dangling from sleeves
  ctx.strokeStyle='#d8b850'; ctx.lineWidth=1; for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(scx-20,scy+8); ctx.lineTo(scx-22+i,scy+14); ctx.moveTo(scx+20,scy+8); ctx.lineTo(scx+22+i,scy+14); ctx.stroke(); }
  // crows flying near the sun
  for(let i=0;i<3;i++){ const cx=sunX-40+Math.sin(t*0.7+i*2)*30, cy=H*0.2+i*10;
    ctx.strokeStyle='#2a2018'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(cx-5,cy); ctx.quadraticCurveTo(cx,cy-4+Math.sin(t*6+i)*1.5,cx+5,cy); ctx.stroke(); }
}
registerScene('wheatfield', drawWheatField);

/* ── WEAVING STUDIO (indoor · a floor loom & tapestry) ── */
function drawWeaving(){
  const t=sceneTime, floorY=H*0.68;
  // soft natural-light studio
  ctx.fillStyle='#e6ddc8'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#a5895f'; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='#c9bda0'; ctx.fillRect(0,H*0.12,W,2);
  // window casting warm light
  ctx.fillStyle='#f4ecd0'; ctx.fillRect(W*0.04,H*0.08,W*0.2,H*0.24); ctx.strokeStyle='#8a7452'; ctx.lineWidth=2; ctx.strokeRect(W*0.04,H*0.08,W*0.2,H*0.24);
  ctx.beginPath(); ctx.moveTo(W*0.14,H*0.08); ctx.lineTo(W*0.14,H*0.32); ctx.moveTo(W*0.04,H*0.2); ctx.lineTo(W*0.24,H*0.2); ctx.stroke();
  // hanging skeins of yarn on the wall (colorful)
  const yarn=['#c0503a','#4a86c0','#d0a030','#5f9a44','#8a4ac0','#e0709a'];
  for(let i=0;i<6;i++){ const yx=W*0.3+i*W*0.06; ctx.strokeStyle=yarn[i]; ctx.lineWidth=6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(yx,H*0.1); ctx.lineTo(yx,H*0.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(yx,H*0.22,5,0,Math.PI); ctx.stroke(); }
  ctx.lineCap='butt';
  // finished tapestry hanging on the right wall
  const tx=W*0.72, ty=H*0.1, tw=W*0.22, th=H*0.34;
  ctx.fillStyle='#5a3e26'; ctx.fillRect(tx-3,ty-3,tw+6,6);
  for(let r=0;r<10;r++){ ctx.fillStyle=yarn[r%yarn.length]; ctx.fillRect(tx,ty+r*(th/10),tw,th/10*0.9); }
  // a woven zigzag motif overlaid
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1; for(let r=0;r<5;r++){ ctx.beginPath(); for(let x=0;x<=tw;x+=8){ ctx.lineTo(tx+x, ty+ th*0.2 + r*th*0.15 + (x%16<8?0:6)); } ctx.stroke(); }
  // the big wooden floor loom (center)
  const lx=W*0.5, lb=floorY+8;
  // frame uprights
  ctx.fillStyle='#7a5636'; ctx.fillRect(lx-60,lb-70,8,70+(H-lb)); ctx.fillRect(lx+52,lb-70,8,70+(H-lb));
  ctx.fillRect(lx-60,lb-70,120,8); // top beam
  ctx.fillStyle='#8a6444'; ctx.fillRect(lx-52,lb-8,104,6); // breast beam
  // the warp threads stretched from top beam down to the cloth
  const shed=Math.sin(t*3); // heddles lift alternate threads
  for(let i=0;i<24;i++){ const wxp=lx-48+i*(96/23); const lift=(i%2? shed:-shed)*4;
    ctx.strokeStyle='#e8dcc0'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(wxp,lb-62); ctx.lineTo(wxp+lift,lb-24); ctx.stroke(); }
  // the harness/heddle bar that lifts (moves up & down)
  ctx.fillStyle='#5a3e26'; ctx.fillRect(lx-50,lb-44+shed*4,100,4);
  ctx.fillRect(lx-50,lb-36-shed*4,100,4);
  // the woven cloth building up at the bottom (rows of colored weft)
  ctx.fillStyle='#cbbf9a'; ctx.fillRect(lx-48,lb-24,96,20);
  for(let r=0;r<6;r++){ ctx.fillStyle=yarn[r%yarn.length]; ctx.globalAlpha=0.8; ctx.fillRect(lx-48,lb-22+r*3,96,2.4); ctx.globalAlpha=1; }
  // the shuttle sliding across the shed (animated left-right)
  const sh=Math.sin(t*1.6); const shx=lx + sh*44;
  ctx.fillStyle='#8a5a30'; ctx.beginPath(); ctx.ellipse(shx,lb-32,9,4,0,0,7); ctx.fill();
  ctx.fillStyle='#d0a030'; ctx.fillRect(shx-4,lb-33,8,3); // yarn on the shuttle
  // trailing weft thread from the shuttle back to the selvedge
  ctx.strokeStyle='#d0a030'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(shx,lb-32); ctx.lineTo(lx-48,lb-30); ctx.stroke();
  // the weaver's bench in front
  ctx.fillStyle='#6a4a30'; ctx.fillRect(lx-30,floorY+30,60,8); ctx.fillRect(lx-26,floorY+38,6,H-floorY-38); ctx.fillRect(lx+20,floorY+38,6,H-floorY-38);
  // a basket of yarn balls on the floor
  ctx.fillStyle='#a5723c'; ctx.beginPath(); ctx.moveTo(W*0.14,H*0.92); ctx.lineTo(W*0.24,H*0.92); ctx.lineTo(W*0.22,H); ctx.lineTo(W*0.16,H); ctx.closePath(); ctx.fill();
  for(let i=0;i<3;i++){ ctx.fillStyle=yarn[i+1]; ctx.beginPath(); ctx.arc(W*0.16+i*W*0.03,H*0.92,4,0,7); ctx.fill(); }
}
registerScene('weaving', drawWeaving);

/* ── FROZEN WATERFALL (outdoor · winter ice cascade) ── */
function drawFrozenFalls(){
  const t=sceneTime, poolY=H*0.8;
  // cold pale sky
  const sky=ctx.createLinearGradient(0,0,0,poolY); sky.addColorStop(0,'#bcd2e6'); sky.addColorStop(1,'#e6eef4');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,poolY);
  // faint sun halo
  ctx.fillStyle='rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(W*0.3,H*0.16,20,0,7); ctx.fill();
  // dark rock cliff faces framing the falls
  ctx.fillStyle='#5a5560'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.34,0); ctx.lineTo(W*0.42,poolY); ctx.lineTo(0,poolY); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W,0); ctx.lineTo(W*0.66,0); ctx.lineTo(W*0.58,poolY); ctx.lineTo(W,poolY); ctx.closePath(); ctx.fill();
  // snow caps on the cliff tops
  ctx.fillStyle='#eef4fa'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.34,0); ctx.lineTo(W*0.36,H*0.06); ctx.lineTo(0,H*0.08); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W,0); ctx.lineTo(W*0.66,0); ctx.lineTo(W*0.64,H*0.06); ctx.lineTo(W,H*0.08); ctx.closePath(); ctx.fill();
  // the frozen cascade — vertical columns of blue-white ice between the cliffs
  const fx0=W*0.36, fx1=W*0.64;
  const iceGrad=ctx.createLinearGradient(0,0,0,poolY); iceGrad.addColorStop(0,'#dff0f8'); iceGrad.addColorStop(0.5,'#add6ec'); iceGrad.addColorStop(1,'#cfe6f2');
  ctx.fillStyle=iceGrad; ctx.fillRect(fx0,0,fx1-fx0,poolY);
  // bulging ice columns
  for(let i=0;i<7;i++){ const cx=fx0+ (i+0.5)*(fx1-fx0)/7; const w=(fx1-fx0)/7*0.5;
    ctx.fillStyle= i%2? 'rgba(255,255,255,.35)':'rgba(150,200,230,.35)';
    ctx.beginPath(); ctx.moveTo(cx-w,0);
    for(let y=0;y<=poolY;y+=20){ const bulge=Math.sin(y*0.05+i)*3; ctx.lineTo(cx-w+bulge, y); }
    for(let y=poolY;y>=0;y-=20){ const bulge=Math.sin(y*0.05+i+1)*3; ctx.lineTo(cx+w+bulge, y); }
    ctx.closePath(); ctx.fill();
  }
  // vertical flow striations frozen in place
  ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1; for(let i=0;i<16;i++){ const cx=fx0+i*(fx1-fx0)/16; ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx+Math.sin(cx)*2,poolY); ctx.stroke(); }
  // hanging icicles along the top ledge
  ctx.fillStyle='#e8f4fa'; for(let i=0;i<12;i++){ const ix=W*0.34+i*(W*0.32/11); const len=8+ (i%4)*8;
    ctx.beginPath(); ctx.moveTo(ix-3,H*0.06); ctx.lineTo(ix+3,H*0.06); ctx.lineTo(ix,H*0.06+len); ctx.closePath(); ctx.fill(); }
  // a faint inner glow where a thin trickle still flows behind the ice (animated shimmer)
  ctx.strokeStyle=`rgba(120,200,240,${0.3+0.2*Math.sin(t*3)})`; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(W*0.5,H*0.08); for(let y=H*0.1;y<poolY;y+=16){ ctx.lineTo(W*0.5+Math.sin(y*0.1+t*2)*4, y); } ctx.stroke();
  // frozen pool at the base with cracked ice
  ctx.fillStyle='#c6e0ee'; ctx.fillRect(0,poolY,W,H-poolY);
  ctx.strokeStyle='rgba(150,190,220,.6)'; ctx.lineWidth=1;
  for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(W*0.2+i*W*0.15,poolY+4); ctx.lineTo(W*0.3+i*W*0.15,H); ctx.stroke(); }
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(W*0.5,poolY+14,60,8,0,0,7); ctx.fill(); // snow dusting on pool
  // snow-laden evergreens at the edges
  function pine(x,base,s){ ctx.fillStyle='#3a5a44'; for(let k=0;k<3;k++){ ctx.beginPath(); ctx.moveTo(x-14*s+k*2,base-k*14*s); ctx.lineTo(x+14*s-k*2,base-k*14*s); ctx.lineTo(x,base-(k+1)*14*s-6*s); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle='rgba(255,255,255,.8)'; for(let k=0;k<3;k++){ ctx.beginPath(); ctx.moveTo(x-14*s+k*2,base-k*14*s); ctx.lineTo(x,base-(k+1)*14*s-6*s); ctx.lineTo(x-6*s,base-k*14*s-6*s); ctx.closePath(); ctx.fill(); } }
  pine(W*0.12,poolY+6,1.0); pine(W*0.88,poolY+6,1.1);
  // gentle snowfall
  for(let i=0;i<24;i++){ const sx=(i*47+t*12)%W, sy=(i*33+t*20)%poolY; ctx.fillStyle='rgba(255,255,255,.8)'; ctx.fillRect(sx,sy,2,2); }
}
registerScene('frozenfalls', drawFrozenFalls);

/* ── FENCING SALLE (indoor · a fencing school, en garde) ── */
function drawFencing(){
  const t=sceneTime, floorY=H*0.68;
  // cool grey hall
  ctx.fillStyle='#3a4048'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#8a8478'; ctx.fillRect(0,floorY,W,H-floorY); // wood floor
  for(let i=0;i<8;i++){ ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(0,floorY+i*((H-floorY)/8),W,1); }
  ctx.fillStyle='#2e343c'; ctx.fillRect(0,H*0.1,W,2);
  // tall arched windows
  for(let i=0;i<3;i++){ const wx=W*0.08+i*W*0.3; ctx.fillStyle='#5a6a7a'; ctx.fillRect(wx,H*0.12,W*0.14,H*0.3);
    ctx.beginPath(); ctx.arc(wx+W*0.07,H*0.12,W*0.07,Math.PI,0); ctx.fill();
    ctx.strokeStyle='#2e343c'; ctx.lineWidth=2; ctx.strokeRect(wx,H*0.12,W*0.14,H*0.3); ctx.beginPath(); ctx.moveTo(wx+W*0.07,H*0.12); ctx.lineTo(wx+W*0.07,H*0.42); ctx.stroke(); }
  // the piste (metallic strip) on the floor
  ctx.fillStyle='#b0b4b8'; ctx.fillRect(W*0.1,floorY+30,W*0.8,20);
  ctx.strokeStyle='#7a7e82'; ctx.lineWidth=1; ctx.strokeRect(W*0.1,floorY+30,W*0.8,20);
  ctx.beginPath(); ctx.moveTo(W*0.5,floorY+30); ctx.lineTo(W*0.5,floorY+50); ctx.stroke(); // center line
  ctx.strokeStyle='#5a5e62'; for(let i=1;i<4;i++){ ctx.beginPath(); ctx.moveTo(W*0.1+i*W*0.2,floorY+30); ctx.lineTo(W*0.1+i*W*0.2,floorY+50); ctx.stroke(); } // en-garde lines
  // rack of foils/epees on the left wall
  ctx.fillStyle='#5a4a38'; ctx.fillRect(W*0.04,H*0.16,4,H*0.24);
  for(let i=0;i<5;i++){ ctx.strokeStyle='#c8ccd0'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(W*0.06+i*W*0.014,H*0.17); ctx.lineTo(W*0.06+i*W*0.014,H*0.4); ctx.stroke();
    ctx.fillStyle='#2a2a30'; ctx.fillRect(W*0.06+i*W*0.014-2,H*0.4,4,5); }
  // fencing masks hanging on the right wall
  for(let i=0;i<2;i++){ const mx=W*0.86, my=H*0.2+i*H*0.12; ctx.fillStyle='#c0c4c8'; ctx.beginPath(); ctx.arc(mx,my,10,Math.PI*0.8,Math.PI*2.2); ctx.fill();
    ctx.fillStyle='#8a8e92'; ctx.fillRect(mx-9,my,18,6); // bib
    ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=0.5; for(let k=-3;k<=3;k++){ ctx.beginPath(); ctx.moveTo(mx+k*2.6,my-8); ctx.lineTo(mx+k*2.6,my); ctx.stroke(); } }
  // two fencers in white, lunging & recovering in rhythm
  function fencer(x,dir,phase){
    const lunge=Math.max(0,Math.sin(t*1.8+phase)); // 0 en garde .. 1 lunge
    const baseY=floorY+40;
    const bx=x + dir*lunge*24;
    ctx.save();
    // back leg + front leg (lunge stance)
    ctx.strokeStyle='#e8e8ea'; ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(bx,baseY-24); ctx.lineTo(bx - dir*(14+lunge*10), baseY); ctx.stroke(); // front
    ctx.beginPath(); ctx.moveTo(bx,baseY-24); ctx.lineTo(bx + dir*16, baseY); ctx.stroke(); // back
    // torso
    ctx.fillStyle='#f0f0f2'; ctx.fillRect(bx-5,baseY-44,10,22);
    // mask/head
    ctx.fillStyle='#c0c4c8'; ctx.beginPath(); ctx.arc(bx+dir*2,baseY-48,6,0,7); ctx.fill();
    // sword arm extended forward with blade
    ctx.strokeStyle='#e8e8ea'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(bx,baseY-38); ctx.lineTo(bx - dir*(10+lunge*8), baseY-40); ctx.stroke();
    ctx.strokeStyle='#c8ccd0'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(bx - dir*(10+lunge*8), baseY-40); ctx.lineTo(bx - dir*(10+lunge*8+40), baseY-42); ctx.stroke();
    // rear arm raised for balance
    ctx.strokeStyle='#e8e8ea'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(bx,baseY-40); ctx.lineTo(bx+dir*10,baseY-52); ctx.stroke();
    ctx.restore();
    return bx - dir*(10+lunge*8+40); // blade tip x
  }
  const tipA=fencer(W*0.38, 1, 0);
  const tipB=fencer(W*0.62, -1, Math.PI); // opposite phase — when one lunges the other recovers
  // a spark where blades meet at center when both near middle
  const meet=Math.abs((W*0.5)-((tipA+tipB)/2));
  if(meet<20){ ctx.fillStyle=`rgba(255,240,180,${0.6})`; for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; ctx.beginPath(); ctx.arc(W*0.5+Math.cos(a)*6, floorY, 1.6,0,7); ctx.fill(); } }
  // a scoring box on a stand (green/red lights)
  const sx=W*0.5, sy=floorY-4;
  ctx.fillStyle='#222'; ctx.fillRect(sx-14,H*0.5,28,16);
  ctx.fillStyle=`rgba(60,220,80,${0.4+0.4*Math.sin(t*3)})`; ctx.beginPath(); ctx.arc(sx-7,H*0.5+8,4,0,7); ctx.fill();
  ctx.fillStyle=`rgba(230,50,50,${0.4+0.4*Math.sin(t*3+2)})`; ctx.beginPath(); ctx.arc(sx+7,H*0.5+8,4,0,7); ctx.fill();
}
registerScene('fencing', drawFencing);

/* ── GEYSER FIELD (outdoor · geothermal basin, erupting geyser) ── */
function drawGeyser(){
  const t=sceneTime, groundY=H*0.6;
  // pale steamy sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#9fc4dc'); sky.addColorStop(1,'#e4ecec');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // distant hills
  ctx.fillStyle='#8a9a86'; ctx.beginPath(); ctx.moveTo(0,groundY); ctx.quadraticCurveTo(W*0.3,groundY-26,W*0.6,groundY-4); ctx.quadraticCurveTo(W*0.85,groundY-20,W,groundY-2); ctx.lineTo(W,groundY); ctx.fill();
  // pale mineral crust ground (sinter)
  ctx.fillStyle='#dcd6c8'; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#cfc8b6'; ctx.beginPath(); ctx.moveTo(0,groundY+16); ctx.quadraticCurveTo(W*0.5,groundY+2,W,groundY+18); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fill();
  // colorful hot spring pools with bacterial-mat rings (like Grand Prismatic)
  function pool(cx,cy,r){
    const rings=[['#2a6a8a',1],['#3a9a8a',0.8],['#5abf7a',0.62],['#c9c040',0.44],['#e0902a',0.28],['#c85a2a',0.16]];
    for(const [col,f] of rings){ ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(cx,cy,r*f,r*f*0.4,0,0,7); ctx.fill(); }
    // steam off the pool
    ctx.strokeStyle=`rgba(255,255,255,${0.1+0.05*Math.sin(t*2+cx)})`; ctx.lineWidth=5; ctx.lineCap='round';
    for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(cx+i*r*0.3, cy); for(let k=1;k<=3;k++) ctx.lineTo(cx+i*r*0.3+Math.sin(t*1.5+i+k)*6, cy-k*20); ctx.stroke(); }
    ctx.lineCap='butt';
  }
  pool(W*0.2, groundY+40, 40);
  pool(W*0.8, groundY+52, 34);
  // the geyser cone (mineral mound) center with a periodic erupting column
  const gx=W*0.5, gBase=groundY+30;
  ctx.fillStyle='#c8c0ac'; ctx.beginPath(); ctx.moveTo(gx-26,gBase+16); ctx.lineTo(gx-10,gBase-6); ctx.lineTo(gx+10,gBase-6); ctx.lineTo(gx+26,gBase+16); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a6a7a'; ctx.beginPath(); ctx.ellipse(gx,gBase-6,10,4,0,0,7); ctx.fill(); // vent
  // eruption cycle
  const cyc=(t*0.5)%1; const erupt = cyc<0.55 ? Math.sin(cyc/0.55*Math.PI) : 0; // rises & falls
  const colH = erupt*H*0.5;
  if(colH>2){
    // water column
    const cg=ctx.createLinearGradient(0,gBase-6-colH,0,gBase-6); cg.addColorStop(0,'rgba(255,255,255,.85)'); cg.addColorStop(1,'rgba(200,225,235,.6)');
    ctx.fillStyle=cg;
    ctx.beginPath(); ctx.moveTo(gx-6,gBase-6);
    for(let y=0;y<=colH;y+=10){ const w=6+ (y/colH)*10; ctx.lineTo(gx - w + Math.sin(y*0.1+t*6)*3, gBase-6-y); }
    for(let y=colH;y>=0;y-=10){ const w=6+ (y/colH)*10; ctx.lineTo(gx + w + Math.sin(y*0.1+t*6+1)*3, gBase-6-y); }
    ctx.closePath(); ctx.fill();
    // spray droplets at the top
    for(let i=0;i<12;i++){ const a=-Math.PI/2 + (i-6)*0.16; const sp=colH*0.2*erupt; ctx.fillStyle='rgba(255,255,255,.7)';
      ctx.beginPath(); ctx.arc(gx+Math.cos(a)*sp*(0.5+ (i%3)*0.2), gBase-6-colH + Math.abs(Math.sin(a))* -sp*0.3 + 6, 2.4,0,7); ctx.fill(); }
    // billowing steam cloud above
    ctx.fillStyle=`rgba(255,255,255,${0.3*erupt})`; ctx.beginPath(); ctx.arc(gx,gBase-6-colH-6,18,0,7); ctx.arc(gx-14,gBase-6-colH+2,12,0,7); ctx.arc(gx+14,gBase-6-colH+2,12,0,7); ctx.fill();
  }
  // a wooden boardwalk crossing the foreground
  ctx.fillStyle='#8a6a44'; ctx.fillRect(0,H*0.9,W,10);
  ctx.fillStyle='#7a5a38'; for(let x=0;x<W;x+=14){ ctx.fillRect(x,H*0.9,2,10); }
  ctx.fillStyle='#5a4028'; ctx.fillRect(0,H*0.9-2,W,2);
  // a couple of steam vents puffing at the edges
  for(let i=0;i<2;i++){ const vx= i? W*0.94:W*0.06; ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(vx,groundY+20); for(let k=1;k<=3;k++) ctx.lineTo(vx+Math.sin(t*2+i+k)*5, groundY+20-k*18); ctx.stroke(); }
}
registerScene('geyser', drawGeyser);

/* ── BALLROOM (indoor · a waltz under the chandelier) ── */
function drawBallroom(){
  const t=sceneTime, floorY=H*0.66;
  // rich burgundy hall
  ctx.fillStyle='#4a2530'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#7a5a2e'; ctx.fillRect(0,floorY,W,H-floorY); // parquet
  // parquet diamond pattern with reflections
  for(let y=0;y*16<H-floorY;y++) for(let x=0;x<W/28+1;x++){ ctx.fillStyle=((x+y)%2)?'#8a6a38':'#6a4e28'; ctx.fillRect(x*28 - (y%2)*14, floorY+y*16,28,16); }
  ctx.fillStyle='#caa24a'; ctx.fillRect(0,floorY-4,W,4); ctx.fillRect(0,H*0.1,W,3); // gold trim
  // tall draped windows with gold curtains
  for(let i=0;i<3;i++){ const wx=W*0.1+i*W*0.3; ctx.fillStyle='#243a54'; ctx.fillRect(wx,H*0.14,W*0.12,H*0.34);
    ctx.beginPath(); ctx.arc(wx+W*0.06,H*0.14,W*0.06,Math.PI,0); ctx.fill();
    ctx.fillStyle='#a5813a'; ctx.fillRect(wx-6,H*0.13,6,H*0.36); ctx.fillRect(wx+W*0.12,H*0.13,6,H*0.36); }
  // grand chandelier hanging center, gently glimmering
  const chx=W*0.5, chy=H*0.06;
  ctx.strokeStyle='#8a7a4a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(chx,0); ctx.lineTo(chx,chy); ctx.stroke();
  ctx.fillStyle='#c9a84a'; ctx.beginPath(); ctx.ellipse(chx,chy+10,26,10,0,0,7); ctx.fill();
  for(let ring=0;ring<3;ring++){ const rr=26-ring*7, ry=chy+10+ring*8;
    for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; const g=0.5+0.5*Math.sin(t*4+i+ring);
      ctx.fillStyle=`rgba(255,240,180,${g})`; ctx.beginPath(); ctx.arc(chx+Math.cos(a)*rr, ry+Math.abs(Math.sin(a))*3, 2,0,7); ctx.fill(); } }
  ctx.fillStyle='rgba(255,240,180,.5)'; ctx.beginPath(); ctx.arc(chx,chy+10,8,0,7); ctx.fill();
  // warm glow pool cast on the dance floor
  const glow=ctx.createRadialGradient(chx,floorY+20,10,chx,floorY+20,W*0.5); glow.addColorStop(0,'rgba(255,225,160,.18)'); glow.addColorStop(1,'rgba(255,225,160,0)');
  ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
  // waltzing couples — elegant silhouettes turning, spaced around the floor
  function couple(cx,phase,scale){
    const spin=t*1.2+phase; const sway=Math.sin(spin)*10;
    const baseY=floorY+34;
    const x=cx+sway;
    // lady's gown (triangle skirt) + partner (dark suit)
    ctx.save(); ctx.translate(x,baseY); ctx.rotate(Math.sin(spin)*0.06);
    // partner
    ctx.fillStyle='#1a1a22'; ctx.beginPath(); ctx.moveTo(-2*scale,-2*scale); ctx.lineTo(-10*scale,-2*scale); ctx.lineTo(-7*scale,-34*scale); ctx.lineTo(-2*scale,-34*scale); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#e8c8a8'; ctx.beginPath(); ctx.arc(-4.5*scale,-38*scale,3.5*scale,0,7); ctx.fill();
    // lady's flowing gown
    const gcol=['#c85a8a','#5a86c0','#c9a24a','#5aa06a'][Math.floor(phase)%4];
    ctx.fillStyle=gcol; ctx.beginPath(); ctx.moveTo(2*scale,-2*scale); ctx.lineTo(14*scale + Math.sin(spin*2)*3, -2*scale); ctx.lineTo(6*scale,-30*scale); ctx.lineTo(3*scale,-30*scale); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#e8c8a8'; ctx.beginPath(); ctx.arc(4.5*scale,-34*scale,3.2*scale,0,7); ctx.fill();
    // joined arms
    ctx.strokeStyle='#e8c8a8'; ctx.lineWidth=2*scale; ctx.beginPath(); ctx.moveTo(-4*scale,-26*scale); ctx.lineTo(4*scale,-26*scale); ctx.stroke();
    // shadow
    ctx.restore();
    ctx.fillStyle='rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x,baseY+2,14*scale,3,0,0,7); ctx.fill();
  }
  couple(W*0.3, 0, 1.0);
  couple(W*0.6, 2.1, 1.15);
  couple(W*0.82, 4.0, 0.8);
  couple(W*0.14, 5.2, 0.75);
  // a small orchestra corner (a cello + music stands) on the right
  ctx.fillStyle='#3a2418'; ctx.fillRect(W*0.9,floorY-2,3,H-floorY); // stand pole
  ctx.fillStyle='#7a4a2a'; ctx.save(); ctx.translate(W*0.94,floorY+10); ctx.rotate(-0.2); ctx.beginPath(); ctx.ellipse(0,0,7,14,0,0,7); ctx.fill(); ctx.restore(); // cello body
}
registerScene('ballroom', drawBallroom);

/* ── VOLCANO (outdoor · night eruption with a lava river) ── */
function drawVolcano(){
  const t=sceneTime, groundY=H*0.7;
  // night sky, tinted red-orange near the summit
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#160e1a'); sky.addColorStop(0.7,'#3a1a20'); sky.addColorStop(1,'#5a2418');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // stars away from the glow (left side)
  for(let i=0;i<30;i++){ const sx=(i*37)%(W*0.5), sy=(i*53)%(groundY*0.6); ctx.fillStyle=`rgba(255,255,255,${0.3+0.3*Math.sin(t*2+i)})`; ctx.fillRect(sx,sy,1.2,1.2); }
  // the volcano cone silhouette
  const vx=W*0.5, summitY=H*0.28, baseY=groundY;
  ctx.fillStyle='#1a1216'; ctx.beginPath(); ctx.moveTo(W*0.1,baseY); ctx.lineTo(vx-16,summitY); ctx.lineTo(vx+16,summitY); ctx.lineTo(W*0.9,baseY); ctx.closePath(); ctx.fill();
  // crater glow at the summit
  const cg=ctx.createRadialGradient(vx,summitY,2,vx,summitY,40); cg.addColorStop(0,`rgba(255,220,120,${0.8+0.2*Math.sin(t*6)})`); cg.addColorStop(1,'rgba(255,100,20,0)');
  ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(vx,summitY,40,0,7); ctx.fill();
  ctx.fillStyle='#ffcf6a'; ctx.beginPath(); ctx.ellipse(vx,summitY,14,5,0,0,7); ctx.fill();
  // ash & smoke plume billowing upward, drifting
  for(let i=0;i<7;i++){ const py=summitY - i*26; const px=vx + Math.sin(t*0.6+i*0.5)*i*4;
    ctx.fillStyle=`rgba(60,50,55,${0.5-i*0.05})`; ctx.beginPath(); ctx.arc(px,py,10+i*4,0,7); ctx.fill();
    ctx.fillStyle=`rgba(90,70,70,${0.3-i*0.03})`; ctx.beginPath(); ctx.arc(px-8,py+4,7+i*3,0,7); ctx.fill(); }
  // glowing ember sparks flung from the crater
  for(let i=0;i<14;i++){ const life=(t*30+i*40)%120; const a=-Math.PI/2 + (i-7)*0.12;
    const ex=vx+Math.cos(a)*life*0.6, ey=summitY+Math.sin(a)*life*0.6 - life*0.3;
    ctx.globalAlpha=Math.max(0,1-life/120); ctx.fillStyle= i%2?'#ffcf6a':'#ff7a2a'; ctx.fillRect(ex,ey,2.4,2.4); ctx.globalAlpha=1; }
  // lava rivers running down the cone (glowing veins)
  function lavaRun(offX){ ctx.strokeStyle='#ff5a1a'; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(vx+offX*0.2,summitY+4);
    let x=vx+offX*0.2, y=summitY+4; for(let k=0;k<8;k++){ x += offX*0.1 + Math.sin(k+offX)*4; y += (baseY-summitY)/8; ctx.lineTo(x,y); }
    ctx.stroke();
    ctx.strokeStyle=`rgba(255,220,120,${0.6+0.3*Math.sin(t*5+offX)})`; ctx.lineWidth=1.5; ctx.stroke();
  }
  lavaRun(-30); lavaRun(24);
  // foreground: cooled black lava field with glowing cracks + a lava pool
  ctx.fillStyle='#120c10'; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.strokeStyle=`rgba(255,90,30,.7)`; ctx.lineWidth=1.5;
  for(let i=0;i<7;i++){ ctx.beginPath(); ctx.moveTo(i*W*0.15,groundY+6); ctx.lineTo(i*W*0.15+30+Math.sin(i)*10, H); ctx.stroke(); }
  // a molten pool glowing at the base of the cone
  const pg=ctx.createRadialGradient(vx,groundY+10,2,vx,groundY+10,60); pg.addColorStop(0,'#ffdc80'); pg.addColorStop(0.4,'#ff6a1a'); pg.addColorStop(1,'rgba(120,30,10,0)');
  ctx.fillStyle=pg; ctx.beginPath(); ctx.ellipse(vx,groundY+16,60,14,0,0,7); ctx.fill();
  // heat shimmer over the pool
  ctx.fillStyle=`rgba(255,140,60,${0.1+0.05*Math.sin(t*4)})`; ctx.beginPath(); ctx.ellipse(vx,groundY+16,50,10,0,0,7); ctx.fill();
}
registerScene('volcano', drawVolcano);

/* ── FIREWORKS (outdoor · festive night show over the water) ── */
function drawFireworks(){
  const t=sceneTime, waterY=H*0.72;
  // night sky
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#0a0e24'); sky.addColorStop(1,'#1e2a48');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  // stars
  for(let i=0;i<40;i++){ const sx=(i*47+9)%W, sy=(i*71)%(waterY*0.7); ctx.fillStyle=`rgba(255,255,255,${0.3+0.3*Math.sin(t*2+i)})`; ctx.fillRect(sx,sy,1.2,1.2); }
  // a distant city skyline silhouette with lit windows
  ctx.fillStyle='#0c1020';
  const bh=[0.5,0.62,0.44,0.7,0.55,0.66,0.48,0.6];
  for(let i=0;i<8;i++){ const bx=i*W/8, bw=W/8; const by=waterY - (waterY*0.28)*bh[i];
    ctx.fillRect(bx,by,bw+1,waterY-by);
    ctx.fillStyle=`rgba(255,220,140,.6)`; for(let w=0;w<6;w++){ if((i*7+w)%3) ctx.fillRect(bx+4+ (w%3)*(bw/3), by+6+Math.floor(w/3)*10, 3,4); }
    ctx.fillStyle='#0c1020'; }
  // firework bursts — several at staggered phases
  const palette=[['#ff5a7a'],['#5ad0ff'],['#ffd45a'],['#8affa0'],['#c98aff'],['#ff9a4a']];
  function burst(cx, topY, phase, colIdx){
    const period=2.4; const ph=(t*0.8 + phase)%period;
    if(ph<0.35){ // rising rocket
      const rp=ph/0.35; ctx.fillStyle='#ffd98a'; ctx.beginPath(); ctx.arc(cx, waterY - (waterY-topY)*rp, 2,0,7); ctx.fill();
      ctx.strokeStyle='rgba(255,200,120,.4)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,waterY - (waterY-topY)*rp); ctx.lineTo(cx, waterY - (waterY-topY)*rp + 14); ctx.stroke();
    } else { // explosion
      const ep=(ph-0.35)/(period-0.35); const R=6+ep*46; const alpha=Math.max(0,1-ep);
      const col=palette[colIdx%palette.length][0];
      for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; const r=R*(0.85+ (i%3)*0.08);
        ctx.strokeStyle=col; ctx.globalAlpha=alpha; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r*0.5, topY+Math.sin(a)*r*0.5 + ep*ep*30);
        ctx.lineTo(cx+Math.cos(a)*r, topY+Math.sin(a)*r + ep*ep*30); ctx.stroke();
        // sparkle tip
        ctx.fillStyle='#fff'; ctx.globalAlpha=alpha*(0.5+0.5*Math.sin(t*20+i)); ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r, topY+Math.sin(a)*r + ep*ep*30, 1.4,0,7); ctx.fill();
      }
      ctx.globalAlpha=1;
      // flash core
      ctx.fillStyle=`rgba(255,255,255,${alpha*0.5})`; ctx.beginPath(); ctx.arc(cx,topY,4,0,7); ctx.fill();
    }
  }
  burst(W*0.26, H*0.24, 0.0, 0);
  burst(W*0.54, H*0.16, 0.9, 1);
  burst(W*0.76, H*0.3, 1.7, 2);
  burst(W*0.4, H*0.34, 2.3, 3);
  burst(W*0.88, H*0.2, 3.1, 4);
  burst(W*0.12, H*0.32, 1.3, 5);
  // harbor water with shimmering reflections of the bursts + city
  const water=ctx.createLinearGradient(0,waterY,0,H); water.addColorStop(0,'#16223e'); water.addColorStop(1,'#0a1226');
  ctx.fillStyle=water; ctx.fillRect(0,waterY,W,H-waterY);
  // reflected colored streaks (wavering)
  for(let i=0;i<6;i++){ const rx=W*(0.15+i*0.15); ctx.fillStyle=palette[i%palette.length][0]; ctx.globalAlpha=0.12;
    for(let y=0;y<H-waterY;y+=6){ ctx.fillRect(rx-8+Math.sin(y*0.2+t*3+i)*4, waterY+y, 16, 3); } ctx.globalAlpha=1; }
  // ripple lines
  for(let i=0;i<4;i++){ const ry=waterY+10+i*((H-waterY)/5); ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=1.5;
    ctx.beginPath(); for(let x=0;x<=W;x+=10){ const yy=ry+Math.sin(x*0.05+t*1.5+i)*2; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // two tiny silhouettes on a foreground dock watching
  ctx.fillStyle='#05070f'; ctx.fillRect(0,H*0.94,W,H*0.06);
  for(let i=0;i<2;i++){ const px=W*0.44+i*W*0.08; ctx.fillRect(px-2,H*0.9,4,H*0.04); ctx.beginPath(); ctx.arc(px,H*0.89,3,0,7); ctx.fill(); }
}
registerScene('fireworks', drawFireworks);

/* ── CHESS HALL (indoor · a grand club mid-game) ── */
function drawChessHall(){
  const t=sceneTime, floorY=H*0.72;
  // dark-panelled club with green-shaded lamps
  ctx.fillStyle='#2e2620'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#4a3a2a'; ctx.fillRect(0,floorY,W,H-floorY); // wood floor
  for(let i=0;i<7;i++){ ctx.fillStyle='rgba(0,0,0,.1)'; ctx.fillRect(0,floorY+i*((H-floorY)/7),W,1); }
  // wainscot panelling lines
  ctx.strokeStyle='#3a2e22'; ctx.lineWidth=1; for(let i=0;i<6;i++){ ctx.strokeRect(W*0.05+i*W*0.15,H*0.14,W*0.12,H*0.3); }
  ctx.fillStyle='#6a4a2a'; ctx.fillRect(0,H*0.1,W,3); // rail
  // a shelf of trophies + old clocks in the back
  ctx.fillStyle='#5a3e26'; ctx.fillRect(W*0.6,H*0.14,W*0.34,4);
  for(let i=0;i<4;i++){ ctx.fillStyle='#d4af37'; ctx.beginPath(); ctx.moveTo(W*0.63+i*W*0.08-4,H*0.14); ctx.lineTo(W*0.63+i*W*0.08+4,H*0.14); ctx.lineTo(W*0.63+i*W*0.08+2,H*0.08); ctx.lineTo(W*0.63+i*W*0.08-2,H*0.08); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(W*0.63+i*W*0.08,H*0.07,3,0,7); ctx.fill(); }
  // green banker's lamp glow pool over the main table
  const lampX=W*0.5, lampY=H*0.14;
  ctx.strokeStyle='#8a7a4a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(lampX,0); ctx.lineTo(lampX,lampY); ctx.stroke();
  ctx.fillStyle='#2a6a3a'; ctx.beginPath(); ctx.ellipse(lampX,lampY+6,20,8,0,Math.PI,0); ctx.fill();
  const glow=ctx.createRadialGradient(lampX,floorY-10,10,lampX,floorY-10,W*0.4); glow.addColorStop(0,'rgba(255,235,150,.22)'); glow.addColorStop(1,'rgba(255,235,150,0)');
  ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
  // the main chess table (center)
  const tx=W*0.5, ty=floorY-4;
  ctx.fillStyle='#4a2f1c'; ctx.fillRect(tx-70,ty-6,140,10+(H-ty)); // table + legs implied
  ctx.fillStyle='#3a2418'; ctx.fillRect(tx-60,ty+H*0.14,10,H*0.14); ctx.fillRect(tx+50,ty+H*0.14,10,H*0.14);
  // the board (in slight perspective) with alternating squares
  const bTop=ty-30, bw=110, bh=40;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const sx=tx-bw/2 + c*(bw/8), sy=bTop + r*(bh/8);
    ctx.fillStyle=((r+c)%2)?'#e8d8b0':'#7a5638'; ctx.fillRect(sx,sy,bw/8+1,bh/8+1); }
  ctx.strokeStyle='#2a1a10'; ctx.lineWidth=2; ctx.strokeRect(tx-bw/2-2,bTop-2,bw+4,bh+4);
  // chess pieces as little silhouettes (two colors)
  function piece(c,r,dark){ const sx=tx-bw/2 + (c+0.5)*(bw/8), sy=bTop + (r+0.5)*(bh/8);
    ctx.fillStyle=dark?'#1a1a1e':'#f0ead8'; ctx.beginPath(); ctx.ellipse(sx,sy+2,2.6,1.4,0,0,7); ctx.fill();
    ctx.fillRect(sx-1.4,sy-4,2.8,6); ctx.beginPath(); ctx.arc(sx,sy-4,2,0,7); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(sx+1.5,sy+3,3,1.2,0,0,7); ctx.fill(); }
  // a partial mid-game arrangement
  const layout=[[0,0,1],[2,1,1],[5,1,1],[7,0,1],[3,3,1],[4,4,0],[1,6,0],[6,6,0],[7,7,0],[0,7,0],[2,5,0]];
  for(const [c,r,d] of layout) piece(c,r,d);
  // a knight being moved — floats and slides between two squares
  const mv=(Math.sin(t*1.2)+1)/2; const c0=4,r0=4,c1=5,r1=2;
  const kc=c0+(c1-c0)*mv, kr=r0+(r1-r0)*mv; const lift=Math.sin(mv*Math.PI)*8;
  const ksx=tx-bw/2 + (kc+0.5)*(bw/8), ksy=bTop + (kr+0.5)*(bh/8) - lift;
  ctx.fillStyle='rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(tx-bw/2 + (kc+0.5)*(bw/8), bTop + (kr+0.5)*(bh/8)+2, 3,1.4,0,0,7); ctx.fill();
  ctx.fillStyle='#1a1a1e'; ctx.save(); ctx.translate(ksx,ksy); ctx.beginPath(); ctx.moveTo(-2,4); ctx.lineTo(-2,-2); ctx.quadraticCurveTo(-3,-6,1,-6); ctx.lineTo(3,-3); ctx.lineTo(1,-2); ctx.lineTo(2,4); ctx.closePath(); ctx.fill(); ctx.restore();
  // a chess clock beside the board with a ticking pendulum flag
  const clx=tx+bw/2+16, cly=ty-14;
  ctx.fillStyle='#6a4a2a'; ctx.fillRect(clx-10,cly-10,20,14);
  ctx.fillStyle='#f0ead8'; ctx.beginPath(); ctx.arc(clx-4,cly-3,4,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(clx+4,cly-3,4,0,7); ctx.fill();
  ctx.strokeStyle='#333'; ctx.lineWidth=1; const ha=t*3; ctx.beginPath(); ctx.moveTo(clx-4,cly-3); ctx.lineTo(clx-4+Math.cos(ha)*2.5,cly-3+Math.sin(ha)*2.5); ctx.stroke();
  // a facing pair of players' hands/silhouettes hinted at edges
  ctx.fillStyle='#241c16'; ctx.beginPath(); ctx.ellipse(tx-90,ty+30,16,20,0,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(tx+90,ty+30,16,20,0,0,7); ctx.fill();
}
registerScene('chesshall', drawChessHall);

/* ── CORAL REEF (underwater · sunlit reef teeming with fish) ── */
function drawCoralReef(){
  const t=sceneTime, sandY=H*0.82;
  // sunlit water column
  const water=ctx.createLinearGradient(0,0,0,H); water.addColorStop(0,'#2aa6d8'); water.addColorStop(0.6,'#1f7fb0'); water.addColorStop(1,'#12556e');
  ctx.fillStyle=water; ctx.fillRect(0,0,W,H);
  // god-ray light shafts from the surface
  ctx.save(); for(let i=0;i<5;i++){ const x0=W*0.1+i*W*0.2 + Math.sin(t*0.5+i)*10; ctx.globalAlpha=0.06;
    ctx.fillStyle='#dff4ff'; ctx.beginPath(); ctx.moveTo(x0,0); ctx.lineTo(x0+22,0); ctx.lineTo(x0+60,H); ctx.lineTo(x0+10,H); ctx.closePath(); ctx.fill(); } ctx.restore();
  // sandy seabed
  ctx.fillStyle='#e6d8a8'; ctx.beginPath(); ctx.moveTo(0,sandY); for(let x=0;x<=W;x+=20){ ctx.lineTo(x,sandY+Math.sin(x*0.05)*6); } ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fill();
  // coral clusters along the bottom
  function brainCoral(x,y,r,c){ ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,r,Math.PI,0); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=1; for(let i=0;i<4;i++){ ctx.beginPath(); ctx.arc(x,y,r-3-i*3,Math.PI,0); ctx.stroke(); } }
  function branchCoral(x,base,c){ ctx.strokeStyle=c; ctx.lineWidth=4; ctx.lineCap='round';
    for(let b=-2;b<=2;b++){ ctx.beginPath(); ctx.moveTo(x,base); ctx.quadraticCurveTo(x+b*6,base-16,x+b*10,base-30); ctx.stroke(); } ctx.lineCap='butt'; }
  function fanCoral(x,base,c){ ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(x,base); for(let a=0;a<=Math.PI;a+=0.3){ ctx.lineTo(x+Math.cos(a)*18, base-Math.sin(a)*26); } ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.2)'; ctx.lineWidth=0.6; for(let a=0.2;a<Math.PI;a+=0.3){ ctx.beginPath(); ctx.moveTo(x,base); ctx.lineTo(x+Math.cos(a)*18, base-Math.sin(a)*26); ctx.stroke(); } }
  brainCoral(W*0.15,sandY,20,'#e07a9a'); brainCoral(W*0.85,sandY+4,24,'#e0a04a');
  branchCoral(W*0.35,sandY+2,'#e0906a'); branchCoral(W*0.62,sandY,'#c86a9a');
  fanCoral(W*0.5,sandY,'#d04a6a'); fanCoral(W*0.28,sandY+2,'#6a5ac0');
  // swaying anemones with tentacles
  for(let i=0;i<3;i++){ const ax=W*0.2+i*W*0.3, ay=sandY-4; ctx.fillStyle='#9a5ac0';
    for(let k=0;k<9;k++){ const a=-Math.PI*0.1 - k*0.28; const sw=Math.sin(t*2+k+i)*4;
      ctx.strokeStyle=k%2?'#c07ad8':'#9a5ac0'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.quadraticCurveTo(ax+Math.cos(a)*10+sw, ay+Math.sin(a)*14, ax+Math.cos(a)*14+sw*1.5, ay+Math.sin(a)*22); ctx.stroke(); }
    ctx.fillStyle='#7a3aa0'; ctx.beginPath(); ctx.ellipse(ax,ay,8,4,0,0,7); ctx.fill(); }
  // schooling fish drifting across
  function fish(x,y,s,col,dir){ ctx.save(); ctx.translate(x,y); ctx.scale(dir,1);
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(0,0,7*s,4*s,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6*s,0); ctx.lineTo(-12*s,-4*s); ctx.lineTo(-12*s,4*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(4*s,-1*s,1.2*s,0,7); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(4.4*s,-1*s,0.6*s,0,7); ctx.fill(); ctx.restore(); }
  // a school moving together
  for(let i=0;i<10;i++){ const fx=((t*40 + i*26)%(W+60))-30; const fy=H*0.4 + Math.sin(i*0.8 + t*1.5)*16; fish(fx,fy,1,'#f2c14a',1); }
  // a couple of clownfish near an anemone
  fish(W*0.2+Math.sin(t*2)*6, sandY-16, 1.1, '#e0692a', -1);
  fish(W*0.24+Math.sin(t*2+1)*6, sandY-10, 0.9, '#e0692a', -1);
  // an angelfish gliding slowly the other way
  const agx=(W+40)-((t*18)%(W+80)); fish(agx, H*0.28, 1.6, '#5ad0e0', -1);
  // rising bubbles
  for(let i=0;i<14;i++){ const bx=(i*53+7)%W; const by=(H - (t*30 + i*40)%H); ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(bx+Math.sin(by*0.1+i)*4, by, 1.5+(i%3),0,7); ctx.stroke(); }
  // green sea-grass tufts
  ctx.strokeStyle='#3f8a5a'; ctx.lineWidth=2; for(let i=0;i<14;i++){ const gx=i*W/14+6; const sw=Math.sin(t*1.5+i)*6;
    ctx.beginPath(); ctx.moveTo(gx,sandY+4); ctx.quadraticCurveTo(gx+sw,sandY-12,gx+sw*1.5,sandY-24); ctx.stroke(); }
}
registerScene('coralreef', drawCoralReef);

/* ── BOXING GYM (indoor · ring & swinging bags) ── */
function drawBoxingGym(){
  const t=sceneTime, floorY=H*0.7;
  // industrial gym
  ctx.fillStyle='#4a4640'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#6a5a44'; ctx.fillRect(0,floorY,W,H-floorY); // wood floor
  for(let i=0;i<8;i++){ ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(0,floorY+i*((H-floorY)/8),W,1); }
  ctx.fillStyle='#3a3630'; ctx.fillRect(0,H*0.08,W,W*0.004); // brick line
  // brick wall texture
  ctx.strokeStyle='rgba(0,0,0,.1)'; ctx.lineWidth=1; for(let r=0;r<5;r++) for(let c=0;c<W/40+1;c++){ ctx.strokeRect(c*40 - (r%2)*20, H*0.1+r*16, 40,16); }
  // championship banners hung high
  const bc=['#c0392b','#2960a0','#c9a227'];
  for(let i=0;i<3;i++){ const bx=W*0.12+i*W*0.3; ctx.fillStyle=bc[i]; ctx.beginPath(); ctx.moveTo(bx,H*0.12); ctx.lineTo(bx+40,H*0.12); ctx.lineTo(bx+40,H*0.24); ctx.lineTo(bx+20,H*0.3); ctx.lineTo(bx,H*0.24); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 8px Arial'; ctx.textAlign='center'; ctx.fillText('★', bx+20, H*0.2); ctx.textAlign='left'; }
  // the boxing ring (perspective) on the right
  const rx=W*0.66, rTop=floorY-30, rBot=H-6, rw=W*0.3;
  // canvas
  ctx.fillStyle='#c9c2b4'; ctx.beginPath(); ctx.moveTo(rx-rw*0.4,rTop); ctx.lineTo(rx+rw*0.5,rTop); ctx.lineTo(rx+rw*0.6,rBot); ctx.lineTo(rx-rw*0.5,rBot); ctx.closePath(); ctx.fill();
  // corner posts
  ctx.fillStyle='#c0392b'; ctx.fillRect(rx-rw*0.4-3,rTop-40,6,40); ctx.fillRect(rx+rw*0.5-3,rTop-40,6,40); ctx.fillRect(rx-rw*0.5-3,rBot-46,6,46); ctx.fillRect(rx+rw*0.6-3,rBot-46,6,46);
  // ropes
  ctx.strokeStyle='#e8e0d0'; ctx.lineWidth=2; for(let k=0;k<3;k++){ const off=12+k*12;
    ctx.beginPath(); ctx.moveTo(rx-rw*0.4,rTop-off); ctx.lineTo(rx+rw*0.5,rTop-off); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx-rw*0.4,rTop-off); ctx.lineTo(rx-rw*0.5,rBot-off-6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx+rw*0.5,rTop-off); ctx.lineTo(rx+rw*0.6,rBot-off-6); ctx.stroke(); }
  // heavy bag hanging from the ceiling on the left, swinging
  const hx=W*0.2, hTop=H*0.1; const swing=Math.sin(t*1.4)*0.12;
  ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.save(); ctx.translate(hx,hTop); ctx.rotate(swing);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,H*0.22); ctx.stroke();
  ctx.fillStyle='#7a1e1e'; ctx.beginPath(); ctx.moveTo(-14,H*0.22); ctx.lineTo(14,H*0.22); ctx.lineTo(12,H*0.46); ctx.lineTo(-12,H*0.46); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#5a1414'; ctx.fillRect(-14,H*0.22,28,4); ctx.fillRect(-12,H*0.34,24,3);
  ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(-14,H*0.22,5,H*0.24);
  ctx.restore();
  // a trainer silhouette steadying the bag
  const tbx=hx+Math.sin(t*1.4)*20;
  ctx.fillStyle='#1c1c22'; ctx.fillRect(tbx+16,floorY-30,10,30+(H-floorY)); ctx.beginPath(); ctx.arc(tbx+21,floorY-34,6,0,7); ctx.fill();
  ctx.strokeStyle='#1c1c22'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(tbx+18,floorY-22); ctx.lineTo(tbx+6,floorY-30); ctx.stroke(); // arm to bag
  // speed bag platform on the wall being hit (blurred fast motion)
  const sbx=W*0.44, sby=H*0.4;
  ctx.fillStyle='#3a2e22'; ctx.fillRect(sbx-18,sby-8,36,5); // platform
  const hit=Math.sin(t*14); ctx.fillStyle='#5a1414'; ctx.globalAlpha=0.5;
  ctx.beginPath(); ctx.ellipse(sbx+hit*4,sby+6,7,9,0,0,7); ctx.fill(); ctx.globalAlpha=1;
  ctx.beginPath(); ctx.ellipse(sbx,sby+6,7,9,0,0,7); ctx.fillStyle='#7a1e1e'; ctx.fill();
  // a row of jump ropes + gloves hanging on the left wall
  ctx.fillStyle='#8a6a44'; ctx.fillRect(W*0.03,H*0.42,3,3);
  for(let i=0;i<3;i++){ ctx.strokeStyle='#c0392b'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(W*0.05+i*W*0.02,H*0.42); ctx.quadraticCurveTo(W*0.05+i*W*0.02+6,H*0.5,W*0.05+i*W*0.02,H*0.56); ctx.stroke(); }
  // pair of red gloves on a peg
  ctx.fillStyle='#c0392b'; ctx.beginPath(); ctx.arc(W*0.12,H*0.44,7,0,7); ctx.fill(); ctx.fillRect(W*0.115,H*0.44,10,8);
  ctx.beginPath(); ctx.arc(W*0.16,H*0.46,7,0,7); ctx.fill(); ctx.fillRect(W*0.155,H*0.46,10,8);
  // a stool with a water bottle in the ring corner
  ctx.fillStyle='#222'; ctx.fillRect(rx-rw*0.44,rBot-18,10,12); ctx.fillStyle='#3aa0d0'; ctx.fillRect(rx-rw*0.42,rBot-28,4,10);
}
registerScene('boxinggym', drawBoxingGym);

/* ── BIOLUMINESCENT BAY (outdoor · glowing waves at night) ── */
function drawBioBay(){
  const t=sceneTime, waterY=H*0.42, sandY=H*0.82;
  // deep night sky
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#050a1a'); sky.addColorStop(1,'#0e2038');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  // milky-way + stars
  for(let i=0;i<70;i++){ const sx=(i*47+11)%W, sy=(i*61)%(waterY*0.95); const tw=0.3+0.5*Math.abs(Math.sin(t*2+i));
    ctx.fillStyle=`rgba(220,235,255,${tw})`; const r=(i%13===0)?1.6:0.9; ctx.fillRect(sx,sy,r,r); }
  // low crescent moon
  ctx.fillStyle='rgba(230,240,255,.9)'; ctx.beginPath(); ctx.arc(W*0.8,H*0.14,12,0,7); ctx.fill();
  ctx.fillStyle='#0e2038'; ctx.beginPath(); ctx.arc(W*0.83,H*0.12,12,0,7); ctx.fill();
  // dark sea
  const sea=ctx.createLinearGradient(0,waterY,0,sandY); sea.addColorStop(0,'#08243a'); sea.addColorStop(1,'#0a3350');
  ctx.fillStyle=sea; ctx.fillRect(0,waterY,W,sandY-waterY);
  // faint moon glimmer on the water
  for(let i=0;i<10;i++){ const gy=waterY+4+i*((sandY-waterY)/10); ctx.fillStyle='rgba(180,210,255,.06)'; ctx.fillRect(W*0.8-10+Math.sin(t*2+i)*6, gy, 20, 2); }
  // glowing breaking-wave lines (cyan bioluminescence) sweeping toward shore
  for(let w=0;w<4;w++){ const prog=((t*0.3 + w*0.25)%1); const ly=waterY + prog*(sandY-waterY);
    const glow=Math.sin(prog*Math.PI); // brightest mid-travel
    ctx.strokeStyle=`rgba(80,240,220,${0.5*glow})`; ctx.lineWidth=3;
    ctx.beginPath(); for(let x=0;x<=W;x+=8){ const yy=ly+Math.sin(x*0.04+w)*4; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke();
    // soft bloom under the line
    ctx.strokeStyle=`rgba(80,240,220,${0.15*glow})`; ctx.lineWidth=8; ctx.stroke();
  }
  // the glowing surf line right at the sand
  ctx.strokeStyle=`rgba(120,255,235,${0.6+0.2*Math.sin(t*3)})`; ctx.lineWidth=4;
  ctx.beginPath(); for(let x=0;x<=W;x+=6){ const yy=sandY-4+Math.sin(x*0.05+t*2)*3; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke();
  ctx.strokeStyle='rgba(120,255,235,.18)'; ctx.lineWidth=12; ctx.stroke();
  // scattered glowing plankton sparkles in the shallows
  for(let i=0;i<40;i++){ const px=(i*53+t*20)%W, py=sandY-30+((i*29)%26); const s=0.4+0.6*Math.abs(Math.sin(t*4+i));
    ctx.fillStyle=`rgba(120,255,230,${s*0.6})`; ctx.fillRect(px,py,1.6,1.6); }
  // dark wet sand reflecting the glow
  ctx.fillStyle='#141a1e'; ctx.fillRect(0,sandY,W,H-sandY);
  ctx.fillStyle='rgba(80,240,220,.08)'; ctx.fillRect(0,sandY,W,10);
  // a barefoot walker leaving glowing footprints in the surf
  const wx=(t*18)%(W+40)-20;
  ctx.fillStyle='#05070a'; ctx.fillRect(wx-2,sandY-40,4,40); ctx.beginPath(); ctx.arc(wx,sandY-44,4,0,7); ctx.fill();
  ctx.strokeStyle='#05070a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(wx,sandY-30); ctx.lineTo(wx-6,sandY-4); ctx.moveTo(wx,sandY-30); ctx.lineTo(wx+6,sandY-2); ctx.stroke();
  // fading glowing footprints behind
  for(let i=1;i<6;i++){ const fx=wx-i*16; if(fx>0){ ctx.fillStyle=`rgba(120,255,230,${0.4/i})`; ctx.beginPath(); ctx.ellipse(fx,sandY+2,4,2,0,0,7); ctx.fill(); } }
  // a couple of dark rocks with glowing wet rings
  for(const rx of [W*0.16,W*0.86]){ ctx.fillStyle='#0a0e12'; ctx.beginPath(); ctx.ellipse(rx,sandY+8,16,7,0,Math.PI,0); ctx.fill();
    ctx.strokeStyle='rgba(120,255,230,.3)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(rx,sandY+8,17,7.5,0,Math.PI,0); ctx.stroke(); }
}
registerScene('biobay', drawBioBay);

/* ── NATURAL HISTORY MUSEUM (indoor · dinosaur hall) ── */
function drawNaturalHistory(){
  const t=sceneTime, floorY=H*0.74;
  // grand marble hall
  ctx.fillStyle='#3a3a48'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#c8c2b8'; ctx.fillRect(0,floorY,W,H-floorY); // marble floor
  // floor tile sheen
  for(let i=0;i<6;i++){ ctx.fillStyle='rgba(255,255,255,.05)'; ctx.fillRect(0,floorY+i*((H-floorY)/6),W,1); }
  ctx.fillStyle='rgba(255,255,255,.08)'; ctx.beginPath(); ctx.moveTo(W*0.4,floorY); ctx.lineTo(W*0.6,floorY); ctx.lineTo(W*0.7,H); ctx.lineTo(W*0.3,H); ctx.closePath(); ctx.fill();
  // tall arched window at the back letting cool light in
  ctx.fillStyle='#5a6a80'; ctx.beginPath(); ctx.arc(W*0.5,H*0.2,W*0.16,Math.PI,0); ctx.fill(); ctx.fillRect(W*0.34,H*0.2,W*0.32,H*0.18);
  ctx.strokeStyle='#2a2a34'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(W*0.5,H*0.2,W*0.16,Math.PI,0); ctx.stroke();
  ctx.strokeRect(W*0.34,H*0.2,W*0.32,H*0.18); ctx.beginPath(); ctx.moveTo(W*0.5,H*0.04); ctx.lineTo(W*0.5,H*0.38); ctx.moveTo(W*0.34,H*0.28); ctx.lineTo(W*0.66,H*0.28); ctx.stroke();
  // columns flanking the hall
  for(const cx of [W*0.08,W*0.92]){ ctx.fillStyle='#5a5a68'; ctx.fillRect(cx-8,H*0.1,16,floorY-H*0.1);
    ctx.fillStyle='#6a6a78'; ctx.fillRect(cx-11,H*0.1,22,6); ctx.fillRect(cx-11,floorY-6,22,6);
    ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; for(let f=-2;f<=2;f++){ ctx.beginPath(); ctx.moveTo(cx+f*3,H*0.12); ctx.lineTo(cx+f*3,floorY-6); ctx.stroke(); } }
  // a big banner
  ctx.fillStyle='#8a2f3a'; ctx.fillRect(W*0.36,H*0.06,W*0.28,H*0.05);
  ctx.fillStyle='#e8d8b0'; ctx.font='bold 9px Georgia, serif'; ctx.textAlign='center'; ctx.fillText('DINOSAURS', W*0.5, H*0.095); ctx.textAlign='left';
  // the mounted sauropod / T-rex skeleton (center) — bone segments
  const bx=W*0.5, bfoot=floorY+4;
  ctx.strokeStyle='#e8e0cc'; ctx.fillStyle='#e8e0cc'; ctx.lineWidth=6;
  // long neck arching up and tail sweeping down (brontosaur-like)
  ctx.lineCap='round';
  // spine curve
  ctx.beginPath(); ctx.moveTo(bx-90,bfoot-30); // tail tip
  ctx.quadraticCurveTo(bx-40,bfoot-60, bx,bfoot-70); // hips->back
  ctx.quadraticCurveTo(bx+40,bfoot-78, bx+64,bfoot-120); // shoulder->neck
  ctx.quadraticCurveTo(bx+78,bfoot-150, bx+96,bfoot-150); // head up
  ctx.stroke();
  // ribs
  ctx.lineWidth=2; for(let i=0;i<8;i++){ const u=i/8; const rx=bx-30+u*50, ry=bfoot-64+Math.sin(u*3)*4;
    ctx.beginPath(); ctx.moveTo(rx,ry); ctx.lineTo(rx-4,ry+26); ctx.stroke(); }
  // legs
  ctx.lineWidth=5; for(const lx of [bx-24,bx+8,bx+30,bx-8]){ ctx.beginPath(); ctx.moveTo(lx,bfoot-58); ctx.lineTo(lx+ (lx>bx?6:-6),bfoot); ctx.stroke(); }
  // skull
  ctx.beginPath(); ctx.ellipse(bx+98,bfoot-150,8,5,0.3,0,7); ctx.fill();
  ctx.lineCap='butt';
  // support armature (thin dark rods)
  ctx.strokeStyle='#333'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(bx,bfoot-70); ctx.lineTo(bx,bfoot); ctx.moveTo(bx+64,bfoot-120); ctx.lineTo(bx+64,bfoot); ctx.stroke();
  // a glass display case on the left with a small fossil/gem, softly lit
  ctx.fillStyle='rgba(200,225,235,.25)'; ctx.fillRect(W*0.12,floorY-40,W*0.14,40);
  ctx.strokeStyle='#8a8a98'; ctx.lineWidth=1; ctx.strokeRect(W*0.12,floorY-40,W*0.14,40);
  ctx.fillStyle='#5a9ac0'; ctx.beginPath(); ctx.moveTo(W*0.17,floorY-6); ctx.lineTo(W*0.19,floorY-22); ctx.lineTo(W*0.21,floorY-6); ctx.closePath(); ctx.fill(); // crystal
  const gl=0.4+0.3*Math.sin(t*3); ctx.fillStyle=`rgba(150,220,255,${gl})`; ctx.beginPath(); ctx.arc(W*0.19,floorY-14,3,0,7); ctx.fill();
  // a wall-mounted pterosaur skeleton "flying" on the right
  ctx.strokeStyle='#e8e0cc'; ctx.lineWidth=2;
  const pwx=W*0.84, pwy=H*0.3; const flap=Math.sin(t*1.2)*6;
  ctx.beginPath(); ctx.moveTo(pwx-30,pwy+flap); ctx.lineTo(pwx,pwy); ctx.lineTo(pwx+30,pwy+flap); ctx.stroke(); // wings
  ctx.beginPath(); ctx.moveTo(pwx,pwy); ctx.lineTo(pwx+10,pwy-8); ctx.stroke(); // head crest
  // two tiny visitor silhouettes for scale
  for(let i=0;i<2;i++){ const vx=W*0.32+i*W*0.1; ctx.fillStyle='#1e1e26'; ctx.fillRect(vx-2,floorY-24,4,24); ctx.beginPath(); ctx.arc(vx,floorY-27,3,0,7); ctx.fill(); }
}
registerScene('naturalhistory', drawNaturalHistory);

/* ── SAND DUNES (outdoor · desert dune sea at sunset, camel caravan) ── */
function drawSandDunes(){
  const t=sceneTime, skyY=H*0.42;
  // warm dusk sky
  const sky=ctx.createLinearGradient(0,0,0,skyY); sky.addColorStop(0,'#e08a4a'); sky.addColorStop(0.5,'#f2b86a'); sky.addColorStop(1,'#f8dc9a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,skyY);
  // large hazy sun low on the horizon
  const sunX=W*0.28, sunY=skyY-14;
  ctx.fillStyle='#fff0c8'; ctx.beginPath(); ctx.arc(sunX,sunY,30,0,7); ctx.fill();
  ctx.globalAlpha=0.25; ctx.beginPath(); ctx.arc(sunX,sunY,50,0,7); ctx.fill(); ctx.globalAlpha=1;
  // faint heat haze band
  ctx.fillStyle='rgba(255,220,170,.3)'; ctx.fillRect(0,skyY-6,W,10);
  // overlapping dune ridges, back (light) to front (shadowed), each a smooth crest
  const duneCols=['#f0c884','#e8b86e','#dca85a','#cf9848','#c08838'];
  const bases=[0.46,0.56,0.68,0.82,1.0];
  for(let d=0;d<5;d++){ const by=H*bases[d]; ctx.fillStyle=duneCols[d];
    ctx.beginPath(); ctx.moveTo(0,by);
    for(let x=0;x<=W;x+=8){ const y=by - Math.sin(x*0.012 + d*1.3)*22 - Math.sin(x*0.03+d)*8; ctx.lineTo(x,y); }
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
    // shadowed lee side (thin darker band under each crest)
    ctx.strokeStyle='rgba(120,70,30,.22)'; ctx.lineWidth=2;
    ctx.beginPath(); for(let x=0;x<=W;x+=8){ const y=by - Math.sin(x*0.012 + d*1.3)*22 - Math.sin(x*0.03+d)*8; if(x===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke();
  }
  // wind-blown sand ripples on the nearest dune
  ctx.strokeStyle='rgba(150,100,50,.18)'; ctx.lineWidth=1;
  for(let i=0;i<8;i++){ const ry=H*0.86+i*((H-H*0.86)/8); ctx.beginPath(); for(let x=0;x<=W;x+=10){ const yy=ry+Math.sin(x*0.08+i)*2; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // wisps of sand blowing off the top crest
  for(let i=0;i<4;i++){ ctx.strokeStyle=`rgba(255,235,200,${0.12+0.06*Math.sin(t*2+i)})`; ctx.lineWidth=2;
    const cx=W*0.2+i*W*0.2; ctx.beginPath(); ctx.moveTo(cx,H*0.46 - Math.sin(cx*0.012)*22);
    for(let k=1;k<=4;k++) ctx.lineTo(cx+k*14, H*0.46 - Math.sin(cx*0.012)*22 - k*4 + Math.sin(t*3+i+k)*3); ctx.stroke(); }
  // a camel caravan crossing a mid dune ridge (silhouettes)
  function camel(x,y,s){ ctx.fillStyle='#4a2f1a';
    ctx.beginPath(); ctx.ellipse(x,y,10*s,5*s,0,0,7); ctx.fill(); // body
    ctx.beginPath(); ctx.arc(x-3*s,y-4*s,3*s,0,7); ctx.arc(x+3*s,y-4*s,3*s,0,7); ctx.fill(); // two humps
    // neck + head
    ctx.fillRect(x+8*s,y-14*s,2.5*s,12*s); ctx.beginPath(); ctx.ellipse(x+9*s,y-15*s,3*s,2*s,0.4,0,7); ctx.fill();
    // legs
    ctx.strokeStyle='#4a2f1a'; ctx.lineWidth=1.6*s; for(const lx of [-6,-2,2,6]){ ctx.beginPath(); ctx.moveTo(x+lx*s,y+3*s); ctx.lineTo(x+lx*s+ Math.sin(t*3+lx)*1, y+13*s); ctx.stroke(); }
    // rider on the lead camel
  }
  const march=(t*10)%(W*0.5);
  const ridgeY = x => H*0.66 - Math.sin(x*0.012 + 2*1.3)*22 - Math.sin(x*0.03+2)*8;
  for(let i=0;i<4;i++){ const cx=W*0.1 + march + i*36; camel(cx, ridgeY(cx)-6, 0.9 - i*0.05);
    if(i===0){ ctx.fillStyle='#3a2414'; ctx.fillRect(cx-1,ridgeY(cx)-24,3,10); ctx.beginPath(); ctx.arc(cx,ridgeY(cx)-25,2.5,0,7); ctx.fill(); } }
  // long soft shadows the caravan casts down-sun
  ctx.globalAlpha=0.15; ctx.fillStyle='#8a5a2a'; for(let i=0;i<4;i++){ const cx=W*0.1+march+i*36; ctx.beginPath(); ctx.ellipse(cx-14,ridgeY(cx)+2,16,3,0,0,7); ctx.fill(); } ctx.globalAlpha=1;
}
registerScene('sanddunes', drawSandDunes);

/* ── CARTOGRAPHER'S STUDY (indoor · map-maker's room) ── */
function drawCartographer(){
  const t=sceneTime, floorY=H*0.7;
  // warm study, aged-paper walls
  ctx.fillStyle='#c8b488'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#6a4a30'; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='#b8a478'; ctx.fillRect(0,H*0.1,W,2);
  // a large old world map pinned to the wall
  const mx=W*0.08, my=H*0.12, mw=W*0.56, mh=H*0.4;
  ctx.fillStyle='#e8dcb8'; ctx.fillRect(mx,my,mw,mh);
  ctx.strokeStyle='#8a6a44'; ctx.lineWidth=3; ctx.strokeRect(mx,my,mw,mh);
  // ocean tint + latitude/longitude grid
  ctx.fillStyle='rgba(150,180,190,.3)'; ctx.fillRect(mx+2,my+2,mw-4,mh-4);
  ctx.strokeStyle='rgba(120,90,50,.3)'; ctx.lineWidth=0.6;
  for(let i=1;i<8;i++){ ctx.beginPath(); ctx.moveTo(mx+i*mw/8,my); ctx.lineTo(mx+i*mw/8,my+mh); ctx.stroke(); }
  for(let i=1;i<5;i++){ ctx.beginPath(); ctx.moveTo(mx,my+i*mh/5); ctx.lineTo(mx+mw,my+i*mh/5); ctx.stroke(); }
  // stylized landmasses
  ctx.fillStyle='#c8a860';
  ctx.beginPath(); ctx.moveTo(mx+mw*0.15,my+mh*0.3); ctx.bezierCurveTo(mx+mw*0.28,my+mh*0.15, mx+mw*0.34,my+mh*0.5, mx+mw*0.22,my+mh*0.7); ctx.bezierCurveTo(mx+mw*0.12,my+mh*0.6, mx+mw*0.1,my+mh*0.45, mx+mw*0.15,my+mh*0.3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(mx+mw*0.55,my+mh*0.25); ctx.bezierCurveTo(mx+mw*0.75,my+mh*0.2, mx+mw*0.82,my+mh*0.55, mx+mw*0.66,my+mh*0.72); ctx.bezierCurveTo(mx+mw*0.5,my+mh*0.6, mx+mw*0.48,my+mh*0.4, mx+mw*0.55,my+mh*0.25); ctx.fill();
  // a compass rose on the map
  const crx=mx+mw*0.85, cry=my+mh*0.82; ctx.strokeStyle='#8a5a2a'; ctx.lineWidth=1;
  for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; ctx.beginPath(); ctx.moveTo(crx,cry); ctx.lineTo(crx+Math.cos(a)*(i%2?5:9),cry+Math.sin(a)*(i%2?5:9)); ctx.stroke(); }
  // dotted voyage route across the map
  ctx.strokeStyle='#a03030'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(mx+mw*0.2,my+mh*0.5); ctx.quadraticCurveTo(mx+mw*0.5,my+mh*0.3,mx+mw*0.7,my+mh*0.5); ctx.stroke(); ctx.setLineDash([]);
  // the desk
  const dy=floorY-4; ctx.fillStyle='#5a3e26'; ctx.fillRect(W*0.04,dy-6,W*0.92,6+(H-dy));
  ctx.fillStyle='#6a4a30'; ctx.fillRect(W*0.04,dy-6,W*0.92,4);
  ctx.fillStyle='#4a3220'; ctx.fillRect(W*0.1,dy+H*0.14,10,H*0.14); ctx.fillRect(W*0.84,dy+H*0.14,10,H*0.14);
  // a globe on a wooden stand, slowly rotating (shifting continents)
  const gx=W*0.24, gy=dy-24, gr=20;
  ctx.fillStyle='#7a5030'; ctx.fillRect(gx-2,gy+gr,4,10); ctx.beginPath(); ctx.ellipse(gx,gy+gr+10,10,3,0,0,7); ctx.fill();
  ctx.strokeStyle='#8a6a44'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(gx,gy,gr+3,-0.4,Math.PI+0.4); ctx.stroke(); // meridian ring
  ctx.fillStyle='#9ac0d0'; ctx.beginPath(); ctx.arc(gx,gy,gr,0,7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(gx,gy,gr,0,7); ctx.clip();
  ctx.fillStyle='#c8a860'; for(let i=0;i<3;i++){ const cx=gx-gr + ((t*8 + i*30)%(gr*3)) - gr; ctx.beginPath(); ctx.ellipse(cx, gy-6+i*8, 7,5,0.3,0,7); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(gx-5,gy-6,gr*0.4,0,7); ctx.stroke();
  // rolled-up charts leaning + an open scroll being drawn on
  for(let i=0;i<3;i++){ ctx.fillStyle='#d8c8a0'; ctx.fillRect(W*0.44+i*8,dy-40,5,36); ctx.fillStyle='#a03030'; ctx.fillRect(W*0.44+i*8,dy-40,5,3); }
  ctx.fillStyle='#efe6c8'; ctx.beginPath(); ctx.moveTo(W*0.56,dy-4); ctx.lineTo(W*0.8,dy-4); ctx.lineTo(W*0.8,dy-24); ctx.lineTo(W*0.56,dy-24); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#8a6a44'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(W*0.555,dy-14,4,-Math.PI/2,Math.PI/2); ctx.stroke(); ctx.beginPath(); ctx.arc(W*0.805,dy-14,4,Math.PI/2,-Math.PI/2); ctx.stroke();
  // brass dividers + a quill drawing on the scroll (nib moves)
  ctx.strokeStyle='#c9a24a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.62,dy-22); ctx.lineTo(W*0.6,dy-8); ctx.moveTo(W*0.62,dy-22); ctx.lineTo(W*0.66,dy-8); ctx.stroke();
  const qx=W*0.72+Math.sin(t*2)*3; ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(qx,dy-10); ctx.lineTo(qx+8,dy-26); ctx.stroke();
  ctx.fillStyle='#e8e0d0'; ctx.beginPath(); ctx.moveTo(qx+8,dy-26); ctx.lineTo(qx+14,dy-34); ctx.lineTo(qx+11,dy-24); ctx.closePath(); ctx.fill();
  // a brass oil lamp glowing warm on the right of the desk
  const lx=W*0.88, ly=dy-6; ctx.fillStyle='#b8892e'; ctx.beginPath(); ctx.ellipse(lx,ly,10,4,0,0,7); ctx.fill(); ctx.fillRect(lx-3,ly-10,6,8);
  const fl=1+0.2*Math.sin(t*8); ctx.fillStyle='rgba(255,180,60,.6)'; ctx.beginPath(); ctx.ellipse(lx,ly-16,4*fl,7*fl,0,0,7); ctx.fill();
  ctx.fillStyle='#ffe08a'; ctx.beginPath(); ctx.ellipse(lx,ly-15,2*fl,4*fl,0,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,190,90,.12)'; ctx.beginPath(); ctx.arc(lx,ly-14,26,0,7); ctx.fill();
}
registerScene('cartographer', drawCartographer);

/* ── BAYOU (outdoor · misty cypress swamp at dusk) ── */
function drawBayou(){
  const t=sceneTime, waterY=H*0.56;
  // muted dusk sky through mist
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#c8a86a'); sky.addColorStop(1,'#e8d8a8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  // low sun glow behind the trees
  ctx.fillStyle='rgba(255,235,180,.7)'; ctx.beginPath(); ctx.arc(W*0.7,waterY-20,26,0,7); ctx.fill();
  // layered mist bands
  for(let i=0;i<3;i++){ ctx.fillStyle=`rgba(220,215,195,${0.35-i*0.08})`; ctx.fillRect(0,waterY-40+i*14+Math.sin(t*0.5+i)*3,W,16); }
  // distant tree-line silhouette
  ctx.fillStyle='#5a6a54'; ctx.beginPath(); ctx.moveTo(0,waterY); for(let x=0;x<=W;x+=16){ ctx.lineTo(x,waterY-16-Math.abs(Math.sin(x*0.1))*14); } ctx.lineTo(W,waterY); ctx.fill();
  // still dark water
  const water=ctx.createLinearGradient(0,waterY,0,H); water.addColorStop(0,'#3a4a3a'); water.addColorStop(1,'#22301f');
  ctx.fillStyle=water; ctx.fillRect(0,waterY,W,H-waterY);
  // sun's reflection column shimmering
  for(let i=0;i<10;i++){ const gy=waterY+4+i*((H-waterY)/10); ctx.fillStyle='rgba(255,230,170,.10)'; ctx.fillRect(W*0.7-8+Math.sin(t*2+i)*5, gy, 16, 2); }
  // duckweed / algae patches on the surface
  for(let i=0;i<8;i++){ ctx.fillStyle='rgba(90,130,70,.4)'; ctx.beginPath(); ctx.ellipse((i*83+30)%W, waterY+20+ (i*37)%(H-waterY-20), 14,4,0,0,7); ctx.fill(); }
  // cypress trees rising from the water with buttressed bases + Spanish moss
  function cypress(x,topScale,trunkW){
    const topY=H*0.06;
    // trunk (reflected in water too)
    ctx.fillStyle='#4a3a2a'; ctx.beginPath(); ctx.moveTo(x-trunkW,H); ctx.lineTo(x-trunkW*0.4,topY); ctx.lineTo(x+trunkW*0.4,topY); ctx.lineTo(x+trunkW,H); ctx.closePath(); ctx.fill();
    // flared buttress base at waterline
    ctx.beginPath(); ctx.moveTo(x-trunkW,waterY+6); ctx.lineTo(x-trunkW*2.2,waterY+18); ctx.lineTo(x+trunkW*2.2,waterY+18); ctx.lineTo(x+trunkW,waterY+6); ctx.closePath(); ctx.fill();
    // canopy
    ctx.fillStyle='#3f5a3a'; ctx.beginPath(); ctx.ellipse(x,topY+8,trunkW*4,20,0,0,7); ctx.fill();
    // hanging Spanish moss, gently swaying
    ctx.strokeStyle='rgba(150,160,120,.7)'; ctx.lineWidth=1.5;
    for(let m=0;m<6;m++){ const mx=x-trunkW*3+m*trunkW; const sway=Math.sin(t*1.2+m+x)*3;
      ctx.beginPath(); ctx.moveTo(mx,topY+16); ctx.quadraticCurveTo(mx+sway,topY+30,mx+sway*1.5,topY+46); ctx.stroke(); }
    // reflection of the trunk
    ctx.fillStyle='rgba(74,58,42,.3)'; ctx.fillRect(x-trunkW,waterY+18,trunkW*2,(H-waterY)*0.5);
  }
  cypress(W*0.16, 1, 8); cypress(W*0.5, 1, 6); cypress(W*0.86, 1, 9);
  // knobby cypress "knees" poking out of the water
  ctx.fillStyle='#4a3a2a'; for(let i=0;i<5;i++){ const kx=W*0.1+i*W*0.2; ctx.beginPath(); ctx.moveTo(kx-3,waterY+30); ctx.lineTo(kx+3,waterY+30); ctx.lineTo(kx,waterY+20); ctx.closePath(); ctx.fill(); }
  // a small flat-bottom rowboat drifting with a lantern
  const bx=W*0.36+Math.sin(t*0.6)*8, by=H*0.82;
  ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.moveTo(bx-20,by); ctx.lineTo(bx+20,by); ctx.lineTo(bx+15,by+8); ctx.lineTo(bx-15,by+8); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#2a1c12'; ctx.fillRect(bx-1,by-16,2,16); // lantern pole
  const fl=0.6+0.2*Math.sin(t*6); ctx.fillStyle=`rgba(255,190,90,${fl})`; ctx.beginPath(); ctx.arc(bx,by-18,4,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,190,90,.15)'; ctx.beginPath(); ctx.arc(bx,by-18,16,0,7); ctx.fill();
  // its reflection on the water
  ctx.globalAlpha=0.3; ctx.fillStyle='#ffbe5a'; ctx.beginPath(); ctx.ellipse(bx,by+14,3,8,0,0,7); ctx.fill(); ctx.globalAlpha=1;
  // a heron standing in the shallows
  const hx=W*0.7, hy=waterY+30; ctx.strokeStyle='#8a8a80'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx,hy+22); ctx.stroke(); // leg
  ctx.fillStyle='#9a9a90'; ctx.beginPath(); ctx.ellipse(hx,hy-4,7,4,0,0,7); ctx.fill(); // body
  ctx.beginPath(); ctx.moveTo(hx+2,hy-6); ctx.lineTo(hx+5,hy-18); ctx.lineTo(hx+7,hy-6); ctx.closePath(); ctx.fill(); // neck
  ctx.strokeStyle='#d8a030'; ctx.beginPath(); ctx.moveTo(hx+5,hy-18); ctx.lineTo(hx+12,hy-16); ctx.stroke(); // beak
}
registerScene('bayou', drawBayou);

/* ── ESCAPE ROOM (indoor · puzzle den with a countdown) ── */
function drawEscapeRoom(){
  const t=sceneTime, floorY=H*0.72;
  // dim study-themed room
  ctx.fillStyle='#26201a'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#3a2e22'; ctx.fillRect(0,floorY,W,H-floorY);
  // patterned wallpaper hint
  ctx.strokeStyle='rgba(90,70,50,.3)'; ctx.lineWidth=1; for(let y=0;y<floorY;y+=18) for(let x=0;x<W;x+=18){ ctx.strokeRect(x,y,9,9); }
  ctx.fillStyle='#4a3a2a'; ctx.fillRect(0,H*0.1,W,3);
  // a glowing red countdown timer on the wall
  const tx=W*0.5, ty=H*0.14; ctx.fillStyle='#0a0a0a'; ctx.fillRect(tx-40,ty-16,80,32);
  ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.strokeRect(tx-40,ty-16,80,32);
  // seven-seg-ish digits "12:34" pulsing
  const glow=0.7+0.3*Math.sin(t*4);
  ctx.fillStyle=`rgba(255,40,40,${glow})`; ctx.font='bold 22px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  const secs=59-Math.floor((t*1)%60); ctx.fillText('04:'+String(secs).padStart(2,'0'), tx, ty); ctx.textBaseline='alphabetic'; ctx.textAlign='left';
  ctx.fillStyle=`rgba(255,40,40,${glow*0.15})`; ctx.fillRect(tx-40,ty-16,80,32);
  // a locked chest/safe with a combination dial (center)
  const sx=W*0.5, sy=floorY-4;
  ctx.fillStyle='#3a3a44'; ctx.fillRect(sx-30,sy-46,60,46); ctx.fillStyle='#4a4a54'; ctx.fillRect(sx-30,sy-46,60,6);
  ctx.fillStyle='#2a2a32'; ctx.fillRect(sx-24,sy-40,48,34);
  // dial
  ctx.fillStyle='#c8c8d0'; ctx.beginPath(); ctx.arc(sx,sy-22,10,0,7); ctx.fill();
  ctx.strokeStyle='#333'; ctx.lineWidth=1; for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; ctx.beginPath(); ctx.moveTo(sx+Math.cos(a)*7,sy-22+Math.sin(a)*7); ctx.lineTo(sx+Math.cos(a)*10,sy-22+Math.sin(a)*10); ctx.stroke(); }
  const da=t*0.8; ctx.strokeStyle='#a02020'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(sx,sy-22); ctx.lineTo(sx+Math.cos(da)*8,sy-22+Math.sin(da)*8); ctx.stroke();
  // handle
  ctx.strokeStyle='#c8c8d0'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(sx+18,sy-30); ctx.lineTo(sx+18,sy-14); ctx.stroke();
  // a corkboard of clues with red string connecting them (left)
  const cbx=W*0.06, cby=H*0.16, cbw=W*0.26, cbh=H*0.34;
  ctx.fillStyle='#8a6a44'; ctx.fillRect(cbx-4,cby-4,cbw+8,cbh+8); ctx.fillStyle='#c8b088'; ctx.fillRect(cbx,cby,cbw,cbh);
  const notes=[[0.2,0.2],[0.65,0.15],[0.4,0.5],[0.75,0.6],[0.15,0.7]];
  ctx.strokeStyle='#c02020'; ctx.lineWidth=1; ctx.beginPath();
  for(let i=0;i<notes.length;i++){ const nx=cbx+notes[i][0]*cbw, ny=cby+notes[i][1]*cbh; if(i===0)ctx.moveTo(nx,ny); else ctx.lineTo(nx,ny); } ctx.stroke();
  for(const [u,v] of notes){ const nx=cbx+u*cbw, ny=cby+v*cbh; ctx.fillStyle='#f0ead8'; ctx.save(); ctx.translate(nx,ny); ctx.rotate((u-0.5)*0.3); ctx.fillRect(-10,-8,20,16);
    ctx.fillStyle='#555'; ctx.fillRect(-7,-4,14,2); ctx.fillRect(-7,0,10,2); ctx.restore();
    ctx.fillStyle='#c02020'; ctx.beginPath(); ctx.arc(nx,ny,1.6,0,7); ctx.fill(); }
  // a bookshelf with a suspicious tilted book (right)
  const bshx=W*0.66; ctx.fillStyle='#4a3222'; ctx.fillRect(bshx,H*0.16,W*0.28,4); ctx.fillRect(bshx,H*0.3,W*0.28,4);
  const bc=['#7a2a2a','#2a4a3a','#2a3a6a','#5a3a1a','#3a5a5a','#7a5a2a'];
  for(let s=0;s<2;s++) for(let i=0;i<7;i++){ const bx=bshx+4+i*(W*0.28-8)/7; const tilt=(s===0&&i===4)?0.3:0;
    ctx.save(); ctx.translate(bx,H*0.16+s*H*0.14); ctx.rotate(tilt); ctx.fillStyle=bc[(i+s)%bc.length]; ctx.fillRect(0,-24,W*0.03,24); ctx.restore(); }
  // a UV blacklight flashlight on the table revealing a glowing clue on the wall
  ctx.fillStyle='#222'; ctx.fillRect(W*0.36,floorY-8,20,6); ctx.fillStyle='#6a4ad0'; ctx.beginPath(); ctx.arc(W*0.36,floorY-5,3,0,7); ctx.fill();
  // glowing UV number on the wall
  ctx.fillStyle=`rgba(140,90,255,${0.4+0.3*Math.sin(t*3)})`; ctx.font='bold 14px monospace'; ctx.fillText('7 3 9', W*0.38, floorY-30);
  ctx.font='10px sans-serif';
  // hanging exposed bulb
  ctx.strokeStyle='#555'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.85,0); ctx.lineTo(W*0.85,H*0.1); ctx.stroke();
  ctx.fillStyle=`rgba(255,230,160,${0.6+0.1*Math.sin(t*5)})`; ctx.beginPath(); ctx.arc(W*0.85,H*0.11,5,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,230,160,.08)'; ctx.beginPath(); ctx.arc(W*0.85,H*0.11,40,0,7); ctx.fill();
}
registerScene('escaperoom', drawEscapeRoom);

/* ── TEA PLANTATION (outdoor · terraced hills of tea bushes) ── */
function drawTeaPlantation(){
  const t=sceneTime, skyY=H*0.34;
  // soft morning sky
  const sky=ctx.createLinearGradient(0,0,0,skyY); sky.addColorStop(0,'#bcd8e8'); sky.addColorStop(1,'#eaf2e0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,skyY);
  // hazy sun
  ctx.fillStyle='rgba(255,248,220,.8)'; ctx.beginPath(); ctx.arc(W*0.24,H*0.14,20,0,7); ctx.fill();
  // misty layered hills behind
  ctx.fillStyle='#8fae90'; ctx.beginPath(); ctx.moveTo(0,skyY); ctx.quadraticCurveTo(W*0.3,skyY-24,W*0.6,skyY-6); ctx.quadraticCurveTo(W*0.85,skyY-20,W,skyY-4); ctx.lineTo(W,skyY); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(0,skyY-8,W,8); // mist
  // the plantation hillside — bright green with contour rows of tea bushes
  const field=ctx.createLinearGradient(0,skyY,0,H); field.addColorStop(0,'#5f9a48'); field.addColorStop(1,'#417a30');
  ctx.fillStyle=field; ctx.fillRect(0,skyY,W,H-skyY);
  // contour rows following the hill's curves (curved hedgerows of tea)
  for(let r=0;r<16;r++){ const ry=skyY+8+r*((H-skyY)/16); const amp=8+r*1.5;
    ctx.strokeStyle= r%2? 'rgba(30,70,25,.5)':'rgba(60,120,45,.5)'; ctx.lineWidth=3+r*0.4;
    ctx.beginPath(); for(let x=-10;x<=W+10;x+=10){ const y=ry + Math.sin(x*0.012 + r*0.3)*amp*0.4; if(x<=0)ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke();
    // little bump texture along the row (bush tops)
    ctx.fillStyle= r%2? '#4f8a3a':'#5f9a44';
    for(let x=0;x<W;x+=12){ const y=ry + Math.sin(x*0.012 + r*0.3)*amp*0.4; ctx.beginPath(); ctx.arc(x,y-1,2+r*0.2,Math.PI,0); ctx.fill(); }
  }
  // a dirt footpath winding up through the rows
  ctx.strokeStyle='#c8a86a'; ctx.lineWidth=8; ctx.beginPath(); ctx.moveTo(W*0.5,H); ctx.quadraticCurveTo(W*0.42,H*0.7,W*0.56,H*0.5); ctx.quadraticCurveTo(W*0.66,H*0.42,W*0.6,skyY+10); ctx.stroke();
  // a few tea pickers with conical hats and back baskets, dotted along the rows
  function picker(x,y,s){
    ctx.fillStyle='#c9a24a'; ctx.beginPath(); ctx.moveTo(x-6*s,y-8*s); ctx.lineTo(x+6*s,y-8*s); ctx.lineTo(x,y-16*s); ctx.closePath(); ctx.fill(); // conical hat
    ctx.fillStyle='#4a6a8a'; ctx.fillRect(x-3*s,y-8*s,6*s,12*s); // body (bent slightly)
    ctx.fillStyle='#8a5a34'; ctx.fillRect(x+3*s,y-6*s,4*s,8*s); // back basket
    // arm reaching to the bush, gentle picking motion
    const pk=Math.sin(t*3+x)*2*s; ctx.strokeStyle='#4a6a8a'; ctx.lineWidth=1.5*s; ctx.beginPath(); ctx.moveTo(x-2*s,y-4*s); ctx.lineTo(x-8*s,y+pk); ctx.stroke();
  }
  picker(W*0.28, H*0.62, 1.0); picker(W*0.72, H*0.7, 1.1); picker(W*0.5, H*0.84, 1.2); picker(W*0.85, H*0.5, 0.8);
  // a small tin-roof drying shed at the top of the path
  const shx=W*0.6, shy=skyY+14; ctx.fillStyle='#8a6a44'; ctx.fillRect(shx-12,shy-8,24,10); ctx.fillStyle='#9aa0a6'; ctx.beginPath(); ctx.moveTo(shx-15,shy-8); ctx.lineTo(shx+15,shy-8); ctx.lineTo(shx+10,shy-16); ctx.lineTo(shx-10,shy-16); ctx.closePath(); ctx.fill();
  // a couple of birds over the hills
  for(let i=0;i<3;i++){ const bx=W*0.3+i*W*0.2+Math.sin(t*0.7+i)*12, by=H*0.16+i*6; ctx.strokeStyle='#5a5a52'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(bx-5,by); ctx.quadraticCurveTo(bx,by-4,bx+5,by); ctx.stroke(); }
}
registerScene('teaplantation', drawTeaPlantation);

/* ── RECORDING STUDIO (indoor · mixing console & vocal booth) ── */
function drawRecordingStudio(){
  const t=sceneTime, floorY=H*0.72;
  // dim control room
  ctx.fillStyle='#1e2028'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#2e3038'; ctx.fillRect(0,floorY,W,H-floorY);
  // acoustic foam panels on the walls (wedge pattern)
  ctx.fillStyle='#3a2e3a'; for(let y=0;y<floorY*0.5;y+=14) for(let x=0;x<W;x+=14){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+7,y+7); ctx.lineTo(x,y+14); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(x+14,y); ctx.lineTo(x+7,y+7); ctx.lineTo(x+14,y+14); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(0,floorY*0.5,W,floorY*0.5);
  // the vocal booth window (right) with a singer silhouette + hanging mic
  const wx=W*0.7, wy=H*0.16, ww=W*0.26, wh=H*0.34;
  ctx.fillStyle='#0e1a24'; ctx.fillRect(wx,wy,ww,wh); ctx.strokeStyle='#4a4e58'; ctx.lineWidth=4; ctx.strokeRect(wx,wy,ww,wh);
  // warm light inside booth
  ctx.fillStyle='rgba(200,150,90,.15)'; ctx.fillRect(wx+4,wy+4,ww-8,wh-8);
  // hanging condenser mic
  ctx.strokeStyle='#888'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(wx+ww*0.5,wy+4); ctx.lineTo(wx+ww*0.5,wy+wh*0.35); ctx.stroke();
  ctx.fillStyle='#c8c8d0'; ctx.fillRect(wx+ww*0.5-4,wy+wh*0.35,8,14);
  ctx.strokeStyle='#666'; ctx.strokeRect(wx+ww*0.5-8,wy+wh*0.33,16,20); // pop filter ring hint
  // singer silhouette, subtly swaying
  const sng=Math.sin(t*1.5)*3; ctx.fillStyle='#05080c'; ctx.fillRect(wx+ww*0.3+sng,wy+wh*0.5,14,wh*0.5); ctx.beginPath(); ctx.arc(wx+ww*0.3+7+sng,wy+wh*0.48,7,0,7); ctx.fill();
  // the big mixing console (foreground, angled)
  const cy=floorY-6; ctx.fillStyle='#2a2c34'; ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a3d46'; ctx.fillRect(0,cy-8,W,10);
  // rows of knobs
  for(let r=0;r<2;r++) for(let i=0;i<16;i++){ const kx=W*0.04+i*W*0.06, ky=cy+10+r*14;
    ctx.fillStyle='#12141a'; ctx.beginPath(); ctx.arc(kx,ky,4,0,7); ctx.fill();
    const ka=Math.sin(i*1.3+r)*1.2; ctx.strokeStyle='#c9a24a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(kx+Math.cos(ka-Math.PI/2)*3,ky+Math.sin(ka-Math.PI/2)*3); ctx.stroke(); }
  // channel faders (sliders that gently move)
  for(let i=0;i<16;i++){ const fx=W*0.04+i*W*0.06; const track=H-cy-44;
    ctx.fillStyle='#12141a'; ctx.fillRect(fx-1,cy+40,2,track);
    const fv=(Math.sin(t*2+i*0.6)+1)/2; const fy=cy+40 + (1-fv)*track;
    ctx.fillStyle='#c8ccd4'; ctx.fillRect(fx-4,fy-3,8,6); ctx.fillStyle='#8a8e96'; ctx.fillRect(fx-4,fy,8,1); }
  // a pair of VU meters bouncing (left)
  for(let m=0;m<2;m++){ const mx=W*0.08+m*W*0.12, my=H*0.2; ctx.fillStyle='#0a0c10'; ctx.fillRect(mx-24,my-16,48,26);
    ctx.strokeStyle='#333'; ctx.lineWidth=1; ctx.strokeRect(mx-24,my-16,48,26);
    // arc scale
    ctx.strokeStyle='#556'; ctx.beginPath(); ctx.arc(mx,my+16,26,-Math.PI*0.9,-Math.PI*0.1); ctx.stroke();
    const na=-Math.PI*0.9 + (0.5+0.5*Math.sin(t*6+m*1.5))*Math.PI*0.8; // bouncing needle
    ctx.strokeStyle='#e0d060'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(mx,my+16); ctx.lineTo(mx+Math.cos(na)*24,my+16+Math.sin(na)*24); ctx.stroke();
    // red zone
    ctx.strokeStyle='#c02020'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(mx,my+16,26,-Math.PI*0.25,-Math.PI*0.1); ctx.stroke(); }
  // studio monitor speakers on stands flanking the booth
  for(const sxp of [W*0.5, W*0.98]){ ctx.fillStyle='#15161c'; ctx.fillRect(sxp-14,H*0.3,26,44);
    ctx.fillStyle='#0a0b0e'; ctx.beginPath(); ctx.arc(sxp-1,H*0.34,7,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(sxp-1,H*0.5,4,0,7); ctx.fill(); }
  // "REC" light glowing red above the booth
  ctx.fillStyle=`rgba(230,40,40,${0.5+0.4*Math.sin(t*2)})`; ctx.fillRect(wx+ww*0.36,wy-14,ww*0.28,10);
  ctx.fillStyle='#fff'; ctx.font='bold 7px sans-serif'; ctx.textAlign='center'; ctx.fillText('REC', wx+ww*0.5, wy-6); ctx.textAlign='left';
}
registerScene('recordingstudio', drawRecordingStudio);

/* ── CRANBERRY BOG (outdoor · flooded autumn harvest) ── */
function drawCranberryBog(){
  const t=sceneTime, waterY=H*0.34;
  // crisp autumn sky
  const sky=ctx.createLinearGradient(0,0,0,waterY); sky.addColorStop(0,'#8fc4e8'); sky.addColorStop(1,'#dceaf0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,waterY);
  for(let i=0;i<3;i++){ const cx=((t*5+i*150)%(W+120))-60; ctx.fillStyle='rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(cx,H*0.1+i*14,11,0,7); ctx.arc(cx+13,H*0.1+i*14+3,8,0,7); ctx.arc(cx-12,H*0.1+i*14+3,7,0,7); ctx.fill(); }
  // treeline of autumn colors around the bog
  const fol=['#d0602a','#e0902a','#c04a2a','#e0b83a'];
  for(let i=0;i<12;i++){ ctx.fillStyle=fol[i%4]; ctx.beginPath(); ctx.arc(i*W/12+8,waterY-4,12+(i%3)*4,0,7); ctx.fill(); }
  ctx.fillStyle='#5a4a2a'; ctx.fillRect(0,waterY-4,W,6); // earthen dike
  // the flooded bog water (dark, reflective)
  const water=ctx.createLinearGradient(0,waterY,0,H); water.addColorStop(0,'#5a7a5a'); water.addColorStop(1,'#3a5a44');
  ctx.fillStyle=water; ctx.fillRect(0,waterY,W,H-waterY);
  // reflections of the autumn trees
  ctx.save(); ctx.globalAlpha=0.25; for(let i=0;i<12;i++){ ctx.fillStyle=fol[i%4]; ctx.fillRect(i*W/12, waterY+2, W/12, 14+Math.sin(t*2+i)*2); } ctx.restore();
  // ripple shimmer
  for(let i=0;i<6;i++){ const ry=waterY+16+i*((H-waterY)/6); ctx.strokeStyle='rgba(255,255,255,.06)'; ctx.lineWidth=1.5;
    ctx.beginPath(); for(let x=0;x<=W;x+=10){ const yy=ry+Math.sin(x*0.05+t*1.4+i)*2; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // vast raft of floating red cranberries corralled by a boom (the classic red carpet)
  // the corral boom (floating yellow line) forming an arc
  ctx.strokeStyle='#e0c020'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W*0.06,waterY+30); ctx.quadraticCurveTo(W*0.5,H*0.66,W*0.7,waterY+40); ctx.stroke();
  // dense berries inside the boom
  ctx.save(); ctx.beginPath(); ctx.moveTo(W*0.06,waterY+30); ctx.quadraticCurveTo(W*0.5,H*0.66,W*0.7,waterY+40); ctx.lineTo(W*0.7,waterY+30); ctx.lineTo(W*0.06,waterY+30); ctx.closePath(); ctx.clip();
  for(let i=0;i<400;i++){ const bx=(i*47+ (i%7)*13)%(W*0.7)+ W*0.02; const by=waterY+30 + ((i*29)% Math.floor(H*0.32)); const bob=Math.sin(t*2+i)*0.6;
    ctx.fillStyle= i%5? '#c0202a' : '#e0404a'; ctx.beginPath(); ctx.arc(bx,by+bob,2.2,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,180,180,.5)'; ctx.fillRect(bx-1,by-1+bob,0.8,0.8); }
  ctx.restore();
  // scattered loose berries drifting outside the boom
  for(let i=0;i<20;i++){ const bx=(i*61+t*8)%W; const by=H*0.78+ (i*23)%(H*0.2); ctx.fillStyle='#c0202a'; ctx.beginPath(); ctx.arc(bx,by,2,0,7); ctx.fill(); }
  // a worker in chest waders pushing the boom, standing in the water
  function wader(x){ const push=Math.sin(t*1.5+x)*3;
    ctx.fillStyle='#e0b020'; ctx.fillRect(x-5,H*0.62,10,H*0.2); // yellow waders
    ctx.fillStyle='#2a5a8a'; ctx.fillRect(x-5,H*0.56,10,H*0.07); // jacket
    ctx.fillStyle='#f0d0a8'; ctx.beginPath(); ctx.arc(x,H*0.53,5,0,7); ctx.fill();
    ctx.fillStyle='#c04a2a'; ctx.beginPath(); ctx.arc(x,H*0.51,5.5,Math.PI,0); ctx.fill(); // cap
    // arms on a push-pole
    ctx.strokeStyle='#8a6a44'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+push,H*0.5); ctx.lineTo(x+push+20,H*0.7); ctx.stroke();
    ctx.strokeStyle='#2a5a8a'; ctx.beginPath(); ctx.moveTo(x,H*0.58); ctx.lineTo(x+push+6,H*0.62); ctx.stroke();
  }
  wader(W*0.34); wader(W*0.6);
  // a wooden collection truck/box on the far dike
  ctx.fillStyle='#5a3a24'; ctx.fillRect(W*0.8,waterY-16,W*0.16,14);
  ctx.fillStyle='#c0202a'; for(let i=0;i<8;i++) ctx.fillRect(W*0.81+i*W*0.018,waterY-13,3,3);
}
registerScene('cranberrybog', drawCranberryBog);

/* ── AVIARY (indoor · a domed conservatory full of birds) ── */
function drawAviary(){
  const t=sceneTime, floorY=H*0.76;
  // bright conservatory sky through the glass dome
  const air=ctx.createLinearGradient(0,0,0,floorY); air.addColorStop(0,'#bfe4f0'); air.addColorStop(1,'#dff0e2');
  ctx.fillStyle=air; ctx.fillRect(0,0,W,floorY);
  // the domed glass roof structure (arcing ribs + horizontal rings)
  ctx.strokeStyle='rgba(120,140,120,.5)'; ctx.lineWidth=2;
  const domeR=W*0.6, domeCx=W*0.5, domeCy=H*0.66;
  for(let i=-3;i<=3;i++){ ctx.beginPath(); ctx.ellipse(domeCx,domeCy,domeR*(1-Math.abs(i)*0.02),H*0.6, i*0.18,-Math.PI,0); ctx.stroke(); }
  for(let r=1;r<=3;r++){ ctx.beginPath(); ctx.ellipse(domeCx,domeCy,domeR*r/4,H*0.6*r/4,0,-Math.PI,0); ctx.stroke(); }
  // glass tint panels
  ctx.fillStyle='rgba(200,225,220,.12)'; ctx.beginPath(); ctx.ellipse(domeCx,domeCy,domeR,H*0.6,0,-Math.PI,0); ctx.fill();
  // lush foliage floor + potted palms
  ctx.fillStyle='#3f6a3a'; ctx.fillRect(0,floorY,W,H-floorY);
  function palm(x,base,s){ ctx.fillStyle='#6a4a2a'; ctx.fillRect(x-2*s,base-30*s,4*s,30*s);
    ctx.fillStyle='#3f7a3a'; for(let f=0;f<7;f++){ const a=-Math.PI/2 + (f-3)*0.4; ctx.save(); ctx.translate(x,base-30*s); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0,-14*s,4*s,16*s,0,0,7); ctx.fill(); ctx.restore(); } }
  palm(W*0.1,floorY+6,1.1); palm(W*0.9,floorY+8,1.2); palm(W*0.3,floorY+4,0.8);
  // a central branching tree with perched birds
  const tx=W*0.5, tb=floorY;
  ctx.strokeStyle='#5a3e26'; ctx.lineWidth=8; ctx.beginPath(); ctx.moveTo(tx,tb); ctx.lineTo(tx,H*0.3); ctx.stroke();
  ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(tx,H*0.42); ctx.lineTo(tx-50,H*0.34); ctx.moveTo(tx,H*0.5); ctx.lineTo(tx+54,H*0.44); ctx.moveTo(tx,H*0.36); ctx.lineTo(tx+30,H*0.26); ctx.stroke();
  // a hanging feeder + water dish
  ctx.strokeStyle='#888'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.5,H*0.14); ctx.lineTo(W*0.5,H*0.24); ctx.stroke();
  ctx.fillStyle='#c9a24a'; ctx.fillRect(W*0.5-6,H*0.24,12,10);
  // perched birds (colorful)
  function perch(x,y,col,face){ ctx.save(); ctx.translate(x,y); ctx.scale(face,1);
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(0,0,7,5,0,0,7); ctx.fill(); // body
    ctx.beginPath(); ctx.arc(5,-3,3.5,0,7); ctx.fill(); // head
    ctx.fillStyle='#f0a020'; ctx.beginPath(); ctx.moveTo(8,-3); ctx.lineTo(12,-2); ctx.lineTo(8,-1); ctx.closePath(); ctx.fill(); // beak
    ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-14,3); ctx.lineTo(-6,4); ctx.closePath(); ctx.fill(); // tail
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(5.5,-4,0.8,0,7); ctx.fill(); ctx.restore(); }
  perch(tx-50,H*0.34,'#e0402a',-1); perch(tx+54,H*0.44,'#2a86c0',1); perch(tx+30,H*0.26,'#e0b020',1);
  perch(tx-6,H*0.24,'#3aa05a',-1);
  // free-flying birds crossing the dome, wings flapping
  function flyer(x,y,col,s){ const flap=Math.sin(t*8+x)*7;
    ctx.strokeStyle=col; ctx.lineWidth=2.5*s; ctx.beginPath(); ctx.moveTo(x-9*s,y); ctx.quadraticCurveTo(x-3*s,y-flap,x,y); ctx.quadraticCurveTo(x+3*s,y-flap,x+9*s,y); ctx.stroke();
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(x,y,3*s,2*s,0,0,7); ctx.fill(); }
  for(let i=0;i<5;i++){ const fx=((t*30 + i*70)%(W+40))-20; const fy=H*0.16+ Math.sin(t*1.5+i*1.3)*30 + i*8;
    flyer(fx,fy,['#e0402a','#2a86c0','#e0b020','#3aa05a','#c04a9a'][i],1); }
  // a couple of floating feathers drifting down
  for(let i=0;i<3;i++){ const px=W*0.3+i*W*0.2+Math.sin(t*1.2+i)*20, py=(t*20+i*80)%floorY; ctx.fillStyle='rgba(230,150,60,.6)';
    ctx.save(); ctx.translate(px,py); ctx.rotate(t+i); ctx.beginPath(); ctx.ellipse(0,0,2,6,0,0,7); ctx.fill(); ctx.restore(); }
  // a low decorative fountain/birdbath in the foreground
  ctx.fillStyle='#b0aa98'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.96,40,8,0,0,7); ctx.fill();
  ctx.fillStyle='#9fd8e0'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.95,32,5,0,0,7); ctx.fill();
  for(let i=0;i<5;i++){ ctx.fillStyle='rgba(255,255,255,.4)'; ctx.fillRect(W*0.5-24+i*12, H*0.95+Math.sin(t*3+i)*1.5, 2,2); }
}
registerScene('aviary', drawAviary);

/* ── ICEBERG BAY (outdoor · polar sea with icebergs & penguins) ── */
function drawIcebergBay(){
  const t=sceneTime, seaY=H*0.5;
  // cold pale polar sky
  const sky=ctx.createLinearGradient(0,0,0,seaY); sky.addColorStop(0,'#a8c4e0'); sky.addColorStop(1,'#e0eef4');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,seaY);
  // pale low sun
  ctx.fillStyle='rgba(255,250,235,.8)'; ctx.beginPath(); ctx.arc(W*0.76,H*0.16,18,0,7); ctx.fill();
  ctx.globalAlpha=0.2; ctx.beginPath(); ctx.arc(W*0.76,H*0.16,30,0,7); ctx.fill(); ctx.globalAlpha=1;
  // distant glacier wall on the horizon
  ctx.fillStyle='#cfe0ea'; ctx.fillRect(0,seaY-24,W,24);
  ctx.fillStyle='#bcd2e0'; for(let i=0;i<W;i+=22){ ctx.fillRect(i,seaY-24-(i%3)*6,20,(i%3)*6+2); }
  ctx.fillStyle='rgba(140,190,220,.5)'; ctx.fillRect(0,seaY-6,W,6); // shadowed base
  // cold sea
  const sea=ctx.createLinearGradient(0,seaY,0,H); sea.addColorStop(0,'#3f7a9a'); sea.addColorStop(1,'#22506a');
  ctx.fillStyle=sea; ctx.fillRect(0,seaY,W,H-seaY);
  // gentle swell lines
  for(let i=0;i<7;i++){ const ry=seaY+10+i*((H-seaY)/8); ctx.strokeStyle='rgba(255,255,255,.1)'; ctx.lineWidth=1.5;
    ctx.beginPath(); for(let x=0;x<=W;x+=10){ const yy=ry+Math.sin(x*0.05+t*1.2+i)*2; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy);} ctx.stroke(); }
  // icebergs with underwater blue glow + reflection, gently bobbing
  function berg(x,y,s,bob){
    const by=y+Math.sin(t*0.8+bob)*2;
    // reflection
    ctx.save(); ctx.globalAlpha=0.2; ctx.fillStyle='#dff0f8'; ctx.beginPath(); ctx.moveTo(x-30*s,by+2); ctx.lineTo(x+30*s,by+2); ctx.lineTo(x+10*s,by+30*s); ctx.lineTo(x-14*s,by+30*s); ctx.closePath(); ctx.fill(); ctx.restore();
    // submerged blue base
    ctx.fillStyle='rgba(120,200,225,.35)'; ctx.beginPath(); ctx.ellipse(x,by+4,34*s,8*s,0,0,7); ctx.fill();
    // the berg above water
    ctx.fillStyle='#eef6fa'; ctx.beginPath(); ctx.moveTo(x-30*s,by); ctx.lineTo(x-18*s,by-24*s); ctx.lineTo(x-4*s,by-14*s); ctx.lineTo(x+10*s,by-32*s); ctx.lineTo(x+24*s,by-16*s); ctx.lineTo(x+32*s,by); ctx.closePath(); ctx.fill();
    // shadow facets
    ctx.fillStyle='#cfe4ee'; ctx.beginPath(); ctx.moveTo(x+10*s,by-32*s); ctx.lineTo(x+24*s,by-16*s); ctx.lineTo(x+16*s,by); ctx.lineTo(x+6*s,by); ctx.closePath(); ctx.fill();
  }
  berg(W*0.22, seaY+30, 1.1, 0); berg(W*0.7, seaY+50, 1.4, 1.6); berg(W*0.9, seaY+22, 0.7, 3);
  // a foreground ice floe with a huddle of penguins
  const flY=H*0.86;
  ctx.fillStyle='#eef6fa'; ctx.beginPath(); ctx.moveTo(0,flY); ctx.lineTo(W*0.5,flY-8); ctx.lineTo(W*0.62,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#cfe4ee'; ctx.beginPath(); ctx.moveTo(0,flY+4); ctx.lineTo(W*0.5,flY-4); ctx.lineTo(W*0.5,flY-8); ctx.lineTo(0,flY); ctx.closePath(); ctx.fill();
  function penguin(x,y,s,face){ ctx.save(); ctx.translate(x,y); ctx.scale(face,1);
    ctx.fillStyle='#1a1a22'; ctx.beginPath(); ctx.ellipse(0,0,7*s,11*s,0,0,7); ctx.fill(); // back
    ctx.fillStyle='#f4f4f0'; ctx.beginPath(); ctx.ellipse(1*s,1*s,4.5*s,9*s,0,0,7); ctx.fill(); // belly
    ctx.fillStyle='#1a1a22'; ctx.beginPath(); ctx.arc(0,-9*s,4*s,0,7); ctx.fill(); // head
    ctx.fillStyle='#f0a020'; ctx.beginPath(); ctx.moveTo(3*s,-9*s); ctx.lineTo(7*s,-8*s); ctx.lineTo(3*s,-7*s); ctx.closePath(); ctx.fill(); // beak
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(1.5*s,-10*s,1*s,0,7); ctx.fill();
    // little flipper wave
    const w=Math.sin(t*3+x)*0.3; ctx.strokeStyle='#1a1a22'; ctx.lineWidth=2*s; ctx.beginPath(); ctx.moveTo(-6*s,-2*s); ctx.lineTo(-9*s,4*s+w*4*s); ctx.stroke();
    // feet
    ctx.fillStyle='#f0a020'; ctx.fillRect(-3*s,10*s,3*s,2*s); ctx.fillRect(1*s,10*s,3*s,2*s);
    ctx.restore(); }
  penguin(W*0.14,flY+6,1.0,1); penguin(W*0.26,flY+10,1.1,-1); penguin(W*0.38,flY+4,0.9,1);
  // one penguin diving/sliding toward the water
  penguin(W*0.5,flY+18,1.0,1);
  // a couple of snowflakes
  for(let i=0;i<16;i++){ const sx=(i*47+t*10)%W, sy=(i*31+t*16)%seaY; ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillRect(sx,sy,2,2); }
  // a seabird gliding
  const gx=(t*24)%(W+40)-20; ctx.strokeStyle='#5a5a52'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(gx-6,H*0.24); ctx.quadraticCurveTo(gx,H*0.24-4,gx+6,H*0.24); ctx.stroke();
}
registerScene('icebergbay', drawIcebergBay);

/* ── CANDY SHOP (indoor · penny-candy sweet shop) ── */
function drawCandyShop(){
  const t=sceneTime, floorY=H*0.66;
  // cheerful pastel shop
  ctx.fillStyle='#f4e0ea'; ctx.fillRect(0,0,W,floorY);
  // vertical candy stripes on the walls
  for(let i=0;i<W;i+=24){ ctx.fillStyle=(i/24%2)?'rgba(230,120,150,.25)':'rgba(120,190,220,.2)'; ctx.fillRect(i,0,12,floorY); }
  // black-white checker floor
  for(let y=0;y*16<H-floorY;y++) for(let x=0;x<W/22+1;x++){ ctx.fillStyle=((x+y)%2)?'#e8e4dc':'#3a3436'; ctx.fillRect(x*22,floorY+y*16,22,16); }
  // scalloped candy-stripe awning across the top
  for(let i=0;i<W/22+1;i++){ ctx.fillStyle=(i%2)?'#e0506a':'#fbeef2'; ctx.beginPath(); ctx.moveTo(i*22,0); ctx.lineTo(i*22+22,0); ctx.lineTo(i*22+11,16); ctx.closePath(); ctx.fill(); }
  // "SWEETS" sign
  ctx.fillStyle='#c0304a'; ctx.font='bold 13px Georgia, serif'; ctx.textAlign='center'; ctx.fillText('SWEETS', W*0.5, H*0.1); ctx.textAlign='left';
  // wall shelves of glass candy jars filled with colorful candies
  const cc=['#e0402a','#f2c14a','#3aa05a','#4a86c0','#c04a9a','#e08030'];
  for(let s=0;s<2;s++){ const sy=H*0.16+s*H*0.16; ctx.fillStyle='#b58a5a'; ctx.fillRect(W*0.05,sy+16,W*0.6,4);
    for(let i=0;i<6;i++){ const jx=W*0.09+i*W*0.1;
      // jar
      ctx.fillStyle='rgba(220,235,240,.4)'; ctx.beginPath(); ctx.moveTo(jx-8,sy+16); ctx.lineTo(jx+8,sy+16); ctx.lineTo(jx+7,sy-2); ctx.quadraticCurveTo(jx,sy-6,jx-7,sy-2); ctx.closePath(); ctx.fill();
      // candies inside
      for(let k=0;k<7;k++){ ctx.fillStyle=cc[(i+k)%cc.length]; ctx.beginPath(); ctx.arc(jx-5+ (k%3)*5, sy+12-Math.floor(k/3)*4, 2.2,0,7); ctx.fill(); }
      // lid
      ctx.fillStyle='#c9a24a'; ctx.fillRect(jx-8,sy-8,16,4); ctx.beginPath(); ctx.arc(jx,sy-8,2,0,7); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(jx-5,sy+12); ctx.lineTo(jx-5,sy-2); ctx.stroke(); }
  }
  // a gumball machine on the counter (globe of colored balls)
  const gx=W*0.16, gy=floorY-4;
  ctx.fillStyle='#c02030'; ctx.fillRect(gx-10,gy-6,20,10); ctx.beginPath(); ctx.moveTo(gx-10,gy-6); ctx.lineTo(gx+10,gy-6); ctx.lineTo(gx+7,gy-14); ctx.lineTo(gx-7,gy-14); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(220,235,240,.5)'; ctx.beginPath(); ctx.arc(gx,gy-28,14,0,7); ctx.fill();
  for(let k=0;k<14;k++){ ctx.fillStyle=cc[k%cc.length]; ctx.beginPath(); ctx.arc(gx-8+ (k%5)*4, gy-34+Math.floor(k/5)*5 + Math.sin(t*3+k)*0.5, 2.4,0,7); ctx.fill(); }
  ctx.fillStyle='#c9a24a'; ctx.beginPath(); ctx.arc(gx,gy-14,3,0,7); ctx.fill(); // dispenser knob
  // the counter/display case
  const cy=floorY-4; ctx.fillStyle='#8a5a34'; ctx.fillRect(W*0.3,cy-24,W*0.64,24+(H-cy)); ctx.fillStyle='#9a6a44'; ctx.fillRect(W*0.3,cy-24,W*0.64,5);
  ctx.fillStyle='rgba(220,235,240,.35)'; ctx.fillRect(W*0.32,cy-22,W*0.6,18);
  // trays of assorted candies in the case
  for(let i=0;i<6;i++){ const tx=W*0.36+i*W*0.095; ctx.fillStyle='#efe6d8'; ctx.fillRect(tx-9,cy-10,18,7);
    for(let k=0;k<5;k++){ ctx.fillStyle=cc[(i+k+2)%cc.length]; ctx.beginPath(); ctx.arc(tx-6+k*3,cy-6,1.8,0,7); ctx.fill(); } }
  // a jar of spiral lollipops on the counter
  const lx=W*0.72; ctx.fillStyle='rgba(220,235,240,.4)'; ctx.fillRect(lx-10,cy-40,20,16);
  for(let i=0;i<5;i++){ const spx=lx-6+i*3; ctx.strokeStyle='#efe6d8'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(spx,cy-24); ctx.lineTo(spx,cy-40); ctx.stroke();
    ctx.fillStyle=cc[i%cc.length]; ctx.beginPath(); ctx.arc(spx,cy-42,4,0,7); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.arc(spx,cy-42,2.2,t,t+3); ctx.stroke(); }
  // a brass scale on the counter
  const scx=W*0.9; ctx.fillStyle='#c9a24a'; ctx.fillRect(scx-2,cy-20,4,16); ctx.beginPath(); ctx.moveTo(scx-12,cy-20); ctx.lineTo(scx+12,cy-20); ctx.stroke?.();
  ctx.strokeStyle='#c9a24a'; ctx.lineWidth=1.5; const tilt=Math.sin(t)*2; ctx.beginPath(); ctx.moveTo(scx-12,cy-20+tilt); ctx.lineTo(scx+12,cy-20-tilt); ctx.stroke();
  ctx.beginPath(); ctx.arc(scx-12,cy-14+tilt,4,0,Math.PI); ctx.arc(scx+12,cy-14-tilt,4,0,Math.PI); ctx.stroke();
}
registerScene('candyshop', drawCandyShop);

/* ── PRAIRIE STORM (outdoor · thunderstorm over the plains) ── */
function drawPrairieStorm(){
  const t=sceneTime, groundY=H*0.66;
  // lightning flash cycle: brief bright flashes
  const flashPhase=(t*0.9)%4;
  const flash = flashPhase<0.12 ? 1 : (flashPhase<0.22 ? 0.5 : (flashPhase<0.3?0.3:0));
  // ominous storm sky
  const sky=ctx.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,`rgb(${30+flash*90},${34+flash*90},${46+flash*90})`); sky.addColorStop(1,`rgb(${70+flash*70},${72+flash*70},${68+flash*70})`);
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // heavy layered clouds (darker lumps)
  for(let i=0;i<4;i++){ const cy=H*0.1+i*H*0.06; ctx.fillStyle=`rgba(${40+flash*90},${42+flash*90},${52+flash*90},0.8)`;
    for(let x=-20;x<W+40;x+=50){ const cx=x + Math.sin(t*0.3+i)*10; ctx.beginPath(); ctx.arc(cx,cy,20+i*3,0,7); ctx.arc(cx+26,cy+4,15,0,7); ctx.arc(cx-24,cy+4,14,0,7); ctx.fill(); } }
  // the lightning bolt (drawn during the flash)
  if(flashPhase<0.18){ const bx=W*0.62; ctx.strokeStyle='#f4f2ff'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(bx,H*0.12);
    let x=bx,y=H*0.12; const seg=[[8,0.16],[-14,0.28],[10,0.4],[-8,0.52],[6,groundY/H]];
    for(const [dx,ty] of seg){ x+=dx; y=ty*H; ctx.lineTo(x,y); }
    ctx.stroke();
    // glow
    ctx.strokeStyle='rgba(200,210,255,.4)'; ctx.lineWidth=6; ctx.stroke();
    // a small fork
    ctx.strokeStyle='#f4f2ff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(bx-6,H*0.4); ctx.lineTo(bx-24,H*0.5); ctx.stroke();
  }
  // slanting rain streaks
  ctx.strokeStyle=`rgba(190,200,215,${0.25})`; ctx.lineWidth=1;
  for(let i=0;i<80;i++){ const rx=(i*37 + t*260)%(W+80)-40; const ry=(i*53 + t*400)%H; ctx.beginPath(); ctx.moveTo(rx,ry); ctx.lineTo(rx-6,ry+16); ctx.stroke(); }
  // rain-veil sheet toward the horizon
  ctx.fillStyle='rgba(150,160,175,.15)'; ctx.beginPath(); ctx.moveTo(W*0.3,H*0.14); ctx.lineTo(W*0.6,H*0.14); ctx.lineTo(W*0.5,groundY); ctx.lineTo(W*0.2,groundY); ctx.closePath(); ctx.fill();
  // dark wind-flattened prairie grass
  ctx.fillStyle='#4a5030'; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#3a4024'; ctx.beginPath(); ctx.moveTo(0,groundY+16); ctx.quadraticCurveTo(W*0.5,groundY+2,W,groundY+18); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fill();
  ctx.strokeStyle='#5a6038'; ctx.lineWidth=1; for(let i=0;i<50;i++){ const gx=i*W/50; const bend=8+Math.sin(t*4+i)*3; ctx.beginPath(); ctx.moveTo(gx,H); ctx.quadraticCurveTo(gx+bend,H-14,gx+bend*2,H-24); ctx.stroke(); }
  // a lone barn with a silo, lit briefly by the flash
  const bx=W*0.2, by=groundY;
  ctx.fillStyle=`rgb(${120+flash*60},${40+flash*40},${34+flash*30})`; ctx.fillRect(bx-24,by-34,48,34);
  ctx.fillStyle=`rgb(${90+flash*50},${30+flash*30},${26+flash*20})`; ctx.beginPath(); ctx.moveTo(bx-28,by-34); ctx.lineTo(bx+28,by-34); ctx.lineTo(bx+18,by-50); ctx.lineTo(bx-18,by-50); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#2a1a14'; ctx.fillRect(bx-6,by-18,12,18); // door
  // silo
  ctx.fillStyle=`rgb(${130+flash*50},${132+flash*50},${128+flash*50})`; ctx.fillRect(bx+26,by-44,16,44); ctx.beginPath(); ctx.arc(bx+34,by-44,8,Math.PI,0); ctx.fill();
  // a windmill pump spinning fast in the wind
  const wx=W*0.84, wy=by-40; ctx.strokeStyle='#3a3a3a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(wx-6,by); ctx.lineTo(wx,wy); ctx.lineTo(wx+6,by); ctx.stroke();
  const rot=t*6; ctx.strokeStyle='#4a4a4a'; ctx.lineWidth=1; for(let i=0;i<8;i++){ const a=rot+i*Math.PI/4; ctx.beginPath(); ctx.moveTo(wx,wy); ctx.lineTo(wx+Math.cos(a)*10,wy+Math.sin(a)*10); ctx.stroke(); }
}
registerScene('prairiestorm', drawPrairieStorm);

/* ── MILLINERY (indoor · a hat shop) ── */
function drawMillinery(){
  const t=sceneTime, floorY=H*0.68;
  // soft elegant boutique
  ctx.fillStyle='#e8dce4'; ctx.fillRect(0,0,W,floorY);
  // damask-ish wall pattern
  ctx.fillStyle='rgba(180,150,175,.18)'; for(let y=10;y<floorY;y+=28) for(let x=10;x<W;x+=28){ ctx.beginPath(); ctx.arc(x,y,4,0,7); ctx.fill(); ctx.fillRect(x-1,y-8,2,16); ctx.fillRect(x-8,y-1,16,2); }
  ctx.fillStyle='#c9a0b4'; ctx.fillRect(0,floorY-20,W,20); // pink wainscot
  ctx.fillStyle='#8a6a54'; ctx.fillRect(0,floorY,W,H-floorY); // parquet
  for(let i=0;i<7;i++){ ctx.fillStyle='rgba(0,0,0,.06)'; ctx.fillRect(0,floorY+i*((H-floorY)/7),W,1); }
  ctx.fillStyle='#c9a24a'; ctx.fillRect(0,H*0.1,W,2);
  // "Chapeaux" sign
  ctx.fillStyle='#a06a84'; ctx.font='italic bold 14px Georgia, serif'; ctx.textAlign='center'; ctx.fillText('Chapeaux', W*0.5, H*0.08); ctx.textAlign='left';
  // a hat helper (varied styles)
  function hat(x,y,col,style){
    if(style===0){ // wide-brim sun hat
      ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(x,y,22,7,0,0,7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x,y-8,12,9,0,Math.PI,0); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(x-12,y-8,24,3); // band
      // a flower
      ctx.fillStyle='#e08aa8'; ctx.beginPath(); ctx.arc(x+10,y-8,4,0,7); ctx.fill();
    } else if(style===1){ // cloche/bell hat
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x,y-4,12,Math.PI,0); ctx.fill(); ctx.fillRect(x-12,y-4,24,8);
      ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(x-12,y-2,24,2);
      // feather
      ctx.strokeStyle='#c04a6a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+8,y-6); ctx.quadraticCurveTo(x+16,y-20,x+12,y-26); ctx.stroke();
    } else { // top hat / formal
      ctx.fillStyle=col; ctx.fillRect(x-9,y-22,18,20); ctx.beginPath(); ctx.ellipse(x,y-2,15,5,0,0,7); ctx.fill();
      ctx.fillStyle='rgba(200,160,60,.6)'; ctx.fillRect(x-9,y-8,18,3); // gold band
    }
  }
  // wall shelves of hats on head-forms (stands)
  for(let s=0;s<2;s++){ const sy=H*0.2+s*H*0.18; ctx.fillStyle='#a5885f'; ctx.fillRect(W*0.05,sy+14,W*0.6,4);
    const cols=['#c04a6a','#4a6a9a','#d0a030','#3a8a6a','#8a5aa0'];
    for(let i=0;i<5;i++){ const hx=W*0.1+i*W*0.12;
      ctx.strokeStyle='#8a7a6a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(hx,sy+14); ctx.lineTo(hx,sy+2); ctx.stroke(); // stand
      ctx.fillStyle='#e8d8c0'; ctx.beginPath(); ctx.arc(hx,sy,3,0,7); ctx.fill(); // form
      hat(hx,sy,cols[i%cols.length],(i+s)%3); }
  }
  // a standing oval cheval mirror on the left
  const mx=W*0.1, mtop=floorY-70;
  ctx.fillStyle='#8a6a44'; ctx.beginPath(); ctx.ellipse(mx,mtop+34,20,34,0,0,7); ctx.fill();
  ctx.fillStyle='#cfe0e8'; ctx.beginPath(); ctx.ellipse(mx,mtop+34,16,30,0,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.moveTo(mx-8,mtop+18); ctx.lineTo(mx-2,mtop+18); ctx.lineTo(mx-10,mtop+44); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#8a6a44'; ctx.fillRect(mx-4,mtop+68,8,H-mtop-68); ctx.beginPath(); ctx.ellipse(mx,H-4,14,4,0,0,7); ctx.fill();
  // the counter with ribbon spools and a hat-in-progress
  const cy=floorY-4; ctx.fillStyle='#9a7a54'; ctx.fillRect(W*0.5,cy-8,W*0.44,8+(H-cy)); ctx.fillStyle='#a5885f'; ctx.fillRect(W*0.5,cy-8,W*0.44,4);
  // spools of ribbon
  for(let i=0;i<4;i++){ const rx=W*0.56+i*W*0.05; ctx.fillStyle=['#c04a6a','#4a6a9a','#d0a030','#3a8a6a'][i]; ctx.fillRect(rx-4,cy-14,8,10);
    ctx.strokeStyle=['#c04a6a','#4a6a9a','#d0a030','#3a8a6a'][i]; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(rx,cy-4); ctx.quadraticCurveTo(rx+Math.sin(t*2+i)*4,cy+6,rx,cy+14); ctx.stroke(); }
  // a hat being trimmed on the counter with a plume that sways
  hat(W*0.8,cy-8,'#8a5aa0',1);
  const pl=Math.sin(t*1.5)*4; ctx.strokeStyle='#e0d040'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.8+8,cy-14); ctx.quadraticCurveTo(W*0.8+16+pl,cy-30,W*0.8+10+pl,cy-40); ctx.stroke();
  // a pincushion + scissors
  ctx.fillStyle='#c04a6a'; ctx.beginPath(); ctx.arc(W*0.68,cy+4,5,0,7); ctx.fill();
  for(let i=0;i<5;i++){ ctx.strokeStyle='#ccc'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.68,cy+4); ctx.lineTo(W*0.68+Math.cos(i)*7,cy+4+Math.sin(i)*7); ctx.stroke(); }
}
registerScene('millinery', drawMillinery);

/* ── HEDGE MAZE (outdoor · formal garden labyrinth) ── */
function drawHedgeMaze(){
  const t=sceneTime, horizon=H*0.32;
  // bright sky
  const sky=ctx.createLinearGradient(0,0,0,horizon); sky.addColorStop(0,'#9fd0ee'); sky.addColorStop(1,'#dcefdd');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,horizon);
  for(let i=0;i<3;i++){ const cx=((t*5+i*140)%(W+120))-60; ctx.fillStyle='rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(cx,H*0.1+i*12,10,0,7); ctx.arc(cx+12,H*0.1+i*12+2,8,0,7); ctx.arc(cx-11,H*0.1+i*12+3,7,0,7); ctx.fill(); }
  // a grand manor house on the horizon
  ctx.fillStyle='#c8b090'; ctx.fillRect(W*0.36,horizon-24,W*0.28,24); ctx.fillStyle='#8a5a3a'; ctx.beginPath(); ctx.moveTo(W*0.34,horizon-24); ctx.lineTo(W*0.66,horizon-24); ctx.lineTo(W*0.6,horizon-36); ctx.lineTo(W*0.4,horizon-36); ctx.closePath(); ctx.fill();
  for(let i=0;i<5;i++){ ctx.fillStyle='#5a6a80'; ctx.fillRect(W*0.38+i*W*0.05,horizon-18,6,10); }
  // manicured lawn base
  ctx.fillStyle='#6aa84a'; ctx.fillRect(0,horizon,W,H-horizon);
  ctx.fillStyle='#5f9a40'; for(let i=0;i<W;i+=18){ ctx.fillRect(i,horizon,9,H-horizon); } // mowing stripes
  // the maze — a grid of tall hedge walls in perspective (rows recede uphill)
  // draw from back (small/high) to front (big/low)
  const rows=7;
  for(let r=0;r<rows;r++){
    const y=horizon + (H-horizon)*Math.pow(r/rows,1.3);
    const y2=horizon + (H-horizon)*Math.pow((r+1)/rows,1.3);
    const hedgeH=(y2-y)*0.7 + 6;
    const shade=40 + r*8;
    // horizontal hedge run for this row, broken by gaps (the paths)
    ctx.fillStyle=`rgb(${shade},${90+r*8},${shade})`;
    for(let x=0;x<W;x+= (30 + r*6)){
      if((x + r*20) % (90+r*10) < (60+r*6)){ // wall segment vs gap
        ctx.fillRect(x, y-hedgeH, (30+r*6)*0.8, hedgeH);
        // rounded top + highlight
        ctx.fillStyle=`rgb(${shade+15},${105+r*8},${shade+15})`; ctx.fillRect(x, y-hedgeH, (30+r*6)*0.8, 3);
        ctx.fillStyle=`rgb(${shade},${90+r*8},${shade})`;
      }
    }
    // the gravel path strip in front of this hedge row
    ctx.fillStyle=`rgb(${200-r*8},${185-r*8},${150-r*6})`; ctx.fillRect(0,y,W,(y2-y)*0.3);
  }
  // a central circular clearing with a fountain (drawn mid-maze)
  const fx=W*0.5, fy=H*0.56;
  ctx.fillStyle='#c8b48a'; ctx.beginPath(); ctx.ellipse(fx,fy,34,12,0,0,7); ctx.fill();
  ctx.fillStyle='#9fd8e0'; ctx.beginPath(); ctx.ellipse(fx,fy-1,26,8,0,0,7); ctx.fill();
  ctx.fillStyle='#b0aa9c'; ctx.fillRect(fx-4,fy-20,8,18);
  ctx.fillStyle='#c8b48a'; ctx.beginPath(); ctx.ellipse(fx,fy-20,14,4,0,0,7); ctx.fill();
  ctx.strokeStyle='rgba(180,225,235,.7)'; ctx.lineWidth=1.5; for(let i=0;i<6;i++){ const a=i/6*Math.PI*2, ph=Math.sin(t*3+i)*2; ctx.beginPath(); ctx.moveTo(fx,fy-24); ctx.quadraticCurveTo(fx+Math.cos(a)*10, fy-30-ph, fx+Math.cos(a)*16, fy-14); ctx.stroke(); }
  // a couple of tiny figures walking the near path
  for(let i=0;i<2;i++){ const px=W*0.34+i*W*0.3 + Math.sin(t*0.8+i)*10; const py=H*0.9;
    ctx.fillStyle=['#c04a6a','#4a6a9a'][i]; ctx.fillRect(px-3,py-16,6,16); ctx.fillStyle='#f0d0a8'; ctx.beginPath(); ctx.arc(px,py-19,3,0,7); ctx.fill(); }
  // a couple of topiary balls flanking the entrance (foreground)
  for(const bx of [W*0.08,W*0.92]){ ctx.fillStyle='#3f8034'; ctx.beginPath(); ctx.arc(bx,H*0.94,14,0,7); ctx.fill(); ctx.fillStyle='#7a5030'; ctx.fillRect(bx-6,H*0.94+10,12,10); }
}
registerScene('hedgemaze', drawHedgeMaze);

/* ── OPTICIAN (indoor · eyewear shop & eye test) ── */
function drawOptician(){
  const t=sceneTime, floorY=H*0.7;
  // clean bright shop
  ctx.fillStyle='#eef2f4'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#c8ccd0'; ctx.fillRect(0,floorY,W,H-floorY); // grey floor
  for(let i=0;i<7;i++){ ctx.fillStyle='rgba(0,0,0,.04)'; ctx.fillRect(0,floorY+i*((H-floorY)/7),W,1); }
  ctx.fillStyle='#3a86b0'; ctx.fillRect(0,H*0.1,W,3); // accent stripe
  // "OPTIK" sign
  ctx.fillStyle='#2a6a90'; ctx.font='bold 13px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('OPTIK', W*0.2, H*0.075); ctx.textAlign='left';
  // wall display boards of eyeglasses (rows of frames)
  function specs(x,y,col,shape){ ctx.strokeStyle=col; ctx.lineWidth=2;
    if(shape===0){ ctx.beginPath(); ctx.arc(x-5,y,5,0,7); ctx.arc(x+5,y,5,0,7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x-1,y-1); ctx.lineTo(x+1,y-1); ctx.stroke(); }
    else if(shape===1){ ctx.strokeRect(x-9,y-4,8,8); ctx.strokeRect(x+1,y-4,8,8); ctx.beginPath(); ctx.moveTo(x-1,y); ctx.lineTo(x+1,y); ctx.stroke(); }
    else { ctx.beginPath(); ctx.ellipse(x-5,y,5,3.5,0,0,7); ctx.ellipse(x+5,y,5,3.5,0,0,7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x-1,y); ctx.lineTo(x+1,y); ctx.stroke(); }
    // temple arms
    ctx.beginPath(); ctx.moveTo(x-10,y); ctx.lineTo(x-13,y-2); ctx.moveTo(x+10,y); ctx.lineTo(x+13,y-2); ctx.stroke();
  }
  const fcol=['#2a2a30','#7a2a2a','#2a4a7a','#7a5a20','#5a2a6a','#2a6a5a'];
  for(let s=0;s<3;s++){ const sy=H*0.16+s*H*0.13; ctx.fillStyle='#dfe4e8'; ctx.fillRect(W*0.04,sy-10,W*0.44,22); ctx.strokeStyle='#c0c6ca'; ctx.lineWidth=1; ctx.strokeRect(W*0.04,sy-10,W*0.44,22);
    for(let i=0;i<5;i++) specs(W*0.09+i*W*0.09, sy, fcol[(i+s)%fcol.length], (i+s)%3); }
  // an eye chart on the right wall (Snellen)
  const ecx=W*0.82, ecy=H*0.16; ctx.fillStyle='#fff'; ctx.fillRect(ecx-30,ecy-4,60,H*0.34); ctx.strokeStyle='#ccc'; ctx.lineWidth=1; ctx.strokeRect(ecx-30,ecy-4,60,H*0.34);
  ctx.fillStyle='#222'; ctx.textAlign='center';
  const lines=[['E',18],['F P',12],['T O Z',9],['L P E D',7],['P E C F D',5]];
  for(let i=0;i<lines.length;i++){ ctx.font='bold '+lines[i][1]+'px monospace'; ctx.fillText(lines[i][0], ecx, ecy+10+i*H*0.06); }
  ctx.textAlign='left';
  // the phoropter (eye-test refractor) on an arm over a chair
  const px=W*0.5, py=floorY-4;
  ctx.fillStyle='#4a4e56'; ctx.fillRect(px-4,H*0.3,8,py-H*0.3-30); // arm post
  ctx.fillStyle='#5a5e66'; ctx.fillRect(px-22,py-58,44,26); // body
  // two eyepieces with rotating lens dials
  for(const ex of [px-11,px+11]){ ctx.fillStyle='#2a2c32'; ctx.beginPath(); ctx.arc(ex,py-45,9,0,7); ctx.fill();
    ctx.strokeStyle='#8a8e96'; ctx.lineWidth=1; const da=t*0.8; for(let k=0;k<8;k++){ const a=da+k*Math.PI/4; ctx.beginPath(); ctx.moveTo(ex+Math.cos(a)*6,py-45+Math.sin(a)*6); ctx.lineTo(ex+Math.cos(a)*9,py-45+Math.sin(a)*9); ctx.stroke(); }
    ctx.fillStyle='#9fd8e0'; ctx.beginPath(); ctx.arc(ex,py-45,3,0,7); ctx.fill(); }
  // the patient's chair
  ctx.fillStyle='#3a3e46'; ctx.fillRect(px-16,py-14,32,14); ctx.fillRect(px-16,py-40,6,26); ctx.fillStyle='#2a86c0'; ctx.fillRect(px-13,py-38,26,22);
  ctx.fillStyle='#b0b4b8'; ctx.beginPath(); ctx.ellipse(px,H-4,20,5,0,0,7); ctx.fill(); ctx.fillStyle='#3a3e46'; ctx.fillRect(px-4,py,8,H-py-4);
  // a lens-fitting counter with trial lenses on the left foreground
  ctx.fillStyle='#8a949a'; ctx.fillRect(W*0.04,floorY-4,W*0.22,4+(H-floorY));
  for(let i=0;i<4;i++){ ctx.strokeStyle='#7a8a90'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(W*0.07+i*W*0.05,floorY-10,5,0,7); ctx.stroke();
    ctx.fillStyle='rgba(160,210,225,.4)'; ctx.beginPath(); ctx.arc(W*0.07+i*W*0.05,floorY-10,4,0,7); ctx.fill(); }
}
registerScene('optician', drawOptician);

/* ── CORN MAZE (outdoor · autumn cornfield labyrinth) ── */
function drawCornMaze(){
  const t=sceneTime, horizon=H*0.3;
  // golden autumn sky
  const sky=ctx.createLinearGradient(0,0,0,horizon); sky.addColorStop(0,'#8fc0dc'); sky.addColorStop(1,'#f2dca8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,horizon);
  // hazy sun
  ctx.fillStyle='rgba(255,240,190,.8)'; ctx.beginPath(); ctx.arc(W*0.78,H*0.14,20,0,7); ctx.fill();
  // distant autumn trees + a barn
  const fol=['#d0602a','#e0a02a','#c04a2a'];
  for(let i=0;i<10;i++){ ctx.fillStyle=fol[i%3]; ctx.beginPath(); ctx.arc(i*W/10+6,horizon-2,10+(i%3)*4,0,7); ctx.fill(); }
  ctx.fillStyle='#a03a2a'; ctx.fillRect(W*0.14,horizon-18,26,18); ctx.fillStyle='#7a2a1e'; ctx.beginPath(); ctx.moveTo(W*0.13,horizon-18); ctx.lineTo(W*0.235,horizon-18); ctx.lineTo(W*0.19,horizon-28); ctx.closePath(); ctx.fill();
  // the corn field / maze — tall golden-green corn walls in perspective with winding cut paths
  ctx.fillStyle='#8a9a3a'; ctx.fillRect(0,horizon,W,H-horizon);
  const rows=7;
  for(let r=0;r<rows;r++){
    const y=horizon + (H-horizon)*Math.pow(r/rows,1.3);
    const cornH=(H-horizon)/rows * (0.6+r*0.12) + 6;
    const shade=120 - r*6;
    for(let x=0;x<W;x+=(26+r*5)){
      if((x + r*18) % (84+r*10) < (56+r*5)){ // corn wall vs cut path
        // corn wall segment: vertical stalks
        for(let sxp=x; sxp<x+(26+r*5)*0.85; sxp+=3+r*0.6){ const sway=Math.sin(t*2+sxp*0.1+r)*2;
          ctx.strokeStyle=`rgb(${shade+30},${shade+40},${40+r*4})`; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(sxp,y); ctx.lineTo(sxp+sway,y-cornH); ctx.stroke();
          // tassel top
          ctx.fillStyle=`rgb(${200-r*8},${180-r*8},${90-r*4})`; ctx.fillRect(sxp+sway-1,y-cornH-3,2,4);
        }
      }
    }
    // dirt path strip in front
    ctx.fillStyle=`rgb(${170-r*8},${140-r*6},${95-r*4})`; ctx.fillRect(0,y,W,(H-horizon)/rows*0.3);
  }
  // a scarecrow standing in a cut clearing mid-maze
  const scx=W*0.5, scy=H*0.56;
  ctx.strokeStyle='#6a4a2a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(scx,scy); ctx.lineTo(scx,scy+26); ctx.moveTo(scx-14,scy+6); ctx.lineTo(scx+14,scy+6); ctx.stroke();
  ctx.fillStyle='#7a3a2a'; ctx.fillRect(scx-8,scy-2,16,16); ctx.fillStyle='#e0c060'; ctx.beginPath(); ctx.arc(scx,scy-8,6,0,7); ctx.fill();
  ctx.fillStyle='#6a4a20'; ctx.beginPath(); ctx.moveTo(scx-9,scy-11); ctx.lineTo(scx+9,scy-11); ctx.lineTo(scx,scy-20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#d8b850'; ctx.lineWidth=1; for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(scx-14,scy+6); ctx.lineTo(scx-16+i,scy+12); ctx.moveTo(scx+14,scy+6); ctx.lineTo(scx+16+i,scy+12); ctx.stroke(); }
  // pumpkins + hay bales flanking the entrance in the foreground
  for(let i=0;i<4;i++){ const px=W*0.12+i*W*0.24; ctx.fillStyle='#e0802a'; ctx.beginPath(); ctx.ellipse(px,H*0.94,12,10,0,0,7); ctx.fill();
    ctx.strokeStyle='#c06820'; ctx.lineWidth=1; for(let k=-1;k<=1;k++){ ctx.beginPath(); ctx.moveTo(px+k*5,H*0.94-9); ctx.lineTo(px+k*5,H*0.94+9); ctx.stroke(); }
    ctx.fillStyle='#4f7a30'; ctx.fillRect(px-1,H*0.94-11,2,4); }
  ctx.fillStyle='#d8c060'; ctx.fillRect(W*0.02,H*0.9,W*0.1,H*0.08); ctx.fillRect(W*0.88,H*0.9,W*0.1,H*0.08);
  ctx.strokeStyle='#b8a040'; ctx.lineWidth=1; for(let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(W*0.02,H*0.92+i*H*0.02); ctx.lineTo(W*0.12,H*0.92+i*H*0.02); ctx.stroke(); }
  // crows over the field
  for(let i=0;i<3;i++){ const cx=W*0.4+i*W*0.15+Math.sin(t*0.7+i)*12, cy=H*0.18+i*6; ctx.strokeStyle='#2a2018'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(cx-5,cy); ctx.quadraticCurveTo(cx,cy-4+Math.sin(t*6+i)*1.5,cx+5,cy); ctx.stroke(); }
}
registerScene('cornmaze', drawCornMaze);

/* ── PET SHOP (indoor · puppies, fish tanks & birds) ── */
function drawPetShop(){
  const t=sceneTime, floorY=H*0.7;
  // cheerful shop
  ctx.fillStyle='#eae0cc'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#b58a5a'; ctx.fillRect(0,floorY,W,H-floorY);
  for(let i=0;i<7;i++){ ctx.fillStyle='rgba(0,0,0,.05)'; ctx.fillRect(0,floorY+i*((H-floorY)/7),W,1); }
  ctx.fillStyle='#5aa06a'; ctx.fillRect(0,H*0.1,W,3);
  // "PETS" sign with a pawprint
  ctx.fillStyle='#3a7a4a'; ctx.font='bold 13px Segoe UI, sans-serif'; ctx.textAlign='center'; ctx.fillText('PETS', W*0.5, H*0.08);
  ctx.beginPath(); ctx.arc(W*0.58,H*0.055,3,0,7); ctx.fill(); for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(W*0.565+i*0.015*W,H*0.04,1.4,0,7); ctx.fill(); } ctx.textAlign='left';
  // stacked fish tanks on the left, bubbling with colorful fish
  for(let s=0;s<2;s++){ const tx=W*0.05, ty=H*0.16+s*H*0.2, tw=W*0.28, th=H*0.16;
    ctx.fillStyle='#2a6a8a'; ctx.fillRect(tx,ty,tw,th); ctx.strokeStyle='#4a4e56'; ctx.lineWidth=3; ctx.strokeRect(tx,ty,tw,th);
    ctx.fillStyle='#d8c88a'; ctx.fillRect(tx+2,ty+th-6,tw-4,4); // gravel
    // plants
    ctx.strokeStyle='#3f8a4a'; ctx.lineWidth=2; for(let i=0;i<4;i++){ const px=tx+8+i*(tw/4); ctx.beginPath(); ctx.moveTo(px,ty+th-4); ctx.quadraticCurveTo(px+Math.sin(t*1.5+i)*4,ty+th*0.4,px,ty+th*0.2); ctx.stroke(); }
    // fish
    for(let i=0;i<3;i++){ const fx=tx+8 + ((t*20+i*40+s*20)%(tw-16)); const fy=ty+6+ (i*th/3)%th*0.6;
      ctx.fillStyle=['#e0692a','#f2c14a','#4a86c0'][i%3]; ctx.beginPath(); ctx.ellipse(fx,fy,5,3,0,0,7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(fx-4,fy); ctx.lineTo(fx-8,fy-2); ctx.lineTo(fx-8,fy+2); ctx.closePath(); ctx.fill(); }
    // bubbles
    for(let i=0;i<5;i++){ const bx=tx+tw-10; const by=ty+th - ((t*20+i*18)%th); ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(bx+Math.sin(by)*2,by,1.5,0,7); ctx.stroke(); }
  }
  // a puppy pen in the center foreground with two wagging pups
  const px=W*0.5, py=floorY;
  ctx.fillStyle='#c9a86a'; ctx.fillRect(px-50,py-4,100,6+(H-py)); // pen wall front
  ctx.strokeStyle='#b09050'; ctx.lineWidth=2; for(let i=-4;i<=4;i++){ ctx.beginPath(); ctx.moveTo(px+i*11,py-4); ctx.lineTo(px+i*11,H); ctx.stroke(); }
  ctx.fillStyle='#e8dcc0'; ctx.fillRect(px-48,py-2,96,H-py); // bedding behind bars (drawn first)
  function pup(x,col){ const wag=Math.sin(t*6+x)*3; const hop=Math.abs(Math.sin(t*2+x))*2;
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(x,py+8-hop,10,7,0,0,7); ctx.fill(); // body
    ctx.beginPath(); ctx.arc(x+8,py+2-hop,6,0,7); ctx.fill(); // head
    ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.arc(x+11,py+1-hop,1,0,7); ctx.fill(); // eye
    ctx.fillStyle='#2a1a12'; ctx.beginPath(); ctx.arc(x+13,py+3-hop,1.4,0,7); ctx.fill(); // nose
    ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(x+4,py-4-hop); ctx.lineTo(x+2,py-10-hop); ctx.lineTo(x+8,py-5-hop); ctx.closePath(); ctx.fill(); // ear
    // wagging tail
    ctx.strokeStyle=col; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x-9,py+4-hop); ctx.lineTo(x-14,py-2-hop+wag); ctx.stroke(); }
  pup(px-16,'#c98a4a'); pup(px+18,'#e8dcc0');
  // a bird cage hanging on the right with a swinging bird on a perch
  const cgx=W*0.82, cgy=H*0.16;
  ctx.strokeStyle='#888'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cgx,H*0.06); ctx.lineTo(cgx,cgy); ctx.stroke();
  ctx.strokeStyle='#c9a24a'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cgx,cgy,4,Math.PI,0); ctx.stroke();
  ctx.strokeStyle='#b0b0b8'; ctx.beginPath(); ctx.arc(cgx,cgy+30,26,Math.PI,0); ctx.stroke(); ctx.fillStyle='#c9a24a'; ctx.fillRect(cgx-26,cgy+30,52,4);
  for(let i=-2;i<=2;i++){ ctx.strokeStyle='#b0b0b8'; ctx.beginPath(); ctx.moveTo(cgx+i*11,cgy+4); ctx.lineTo(cgx+i*13,cgy+30); ctx.stroke(); }
  // perch + bird swinging
  const sw=Math.sin(t*2)*6; ctx.strokeStyle='#8a6a44'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cgx-8,cgy+18); ctx.lineTo(cgx+8,cgy+18); ctx.stroke();
  ctx.fillStyle='#4aa0d0'; ctx.beginPath(); ctx.ellipse(cgx+sw,cgy+14,4,5,0,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(cgx+sw+2,cgy+9,2.5,0,7); ctx.fill();
  ctx.fillStyle='#f0a020'; ctx.beginPath(); ctx.moveTo(cgx+sw+4,cgy+9); ctx.lineTo(cgx+sw+7,cgy+9); ctx.lineTo(cgx+sw+4,cgy+11); ctx.fill();
  // shelf of pet supplies (bags/toys) low on the right
  ctx.fillStyle='#8a6a44'; ctx.fillRect(W*0.72,floorY-4,W*0.24,4);
  for(let i=0;i<4;i++){ ctx.fillStyle=['#e0692a','#4a86c0','#3a8a5a','#d0a030'][i]; ctx.fillRect(W*0.74+i*W*0.05,floorY-16,10,12); }
}
registerScene('petshop', drawPetShop);

/* ── BALLOON FESTIVAL (outdoor · hot-air balloons at dawn) ── */
function drawBalloonFest(){
  const t=sceneTime, groundY=H*0.78;
  // soft dawn sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#f2b06a'); sky.addColorStop(0.5,'#f4d29a'); sky.addColorStop(1,'#eef0d8');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  // low sun glow
  ctx.fillStyle='rgba(255,245,210,.7)'; ctx.beginPath(); ctx.arc(W*0.5,groundY-6,40,0,7); ctx.fill();
  // misty rolling hills below
  ctx.fillStyle='#8aa86a'; ctx.beginPath(); ctx.moveTo(0,groundY); ctx.quadraticCurveTo(W*0.3,groundY-16,W*0.55,groundY-2); ctx.quadraticCurveTo(W*0.8,groundY-18,W,groundY-4); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fill();
  ctx.fillStyle='#7a9a5a'; ctx.beginPath(); ctx.moveTo(0,groundY+14); ctx.quadraticCurveTo(W*0.5,groundY+2,W,groundY+16); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(0,groundY-6,W,10); // ground mist
  // a hot-air balloon helper
  function balloon(x,y,s,cols){
    // envelope: stacked colored bands making a teardrop
    const rw=26*s, rh=32*s;
    for(let b=0;b<cols.length;b++){ ctx.fillStyle=cols[b];
      ctx.beginPath();
      const y0=y-rh + b*(rh*1.3/cols.length), y1=y-rh + (b+1)*(rh*1.3/cols.length);
      const w0=Math.sin(Math.acos(Math.max(-1,Math.min(1,(y0-(y-rh*0.3))/rh))))*rw || rw;
      // simpler: draw vertical gore bands via arcs
      ctx.moveTo(x-rw,y-rh*0.3);
      ctx.quadraticCurveTo(x-rw + b*(2*rw/cols.length), y-rh*1.1, x, y-rh*1.15);
      ctx.quadraticCurveTo(x+rw - b*(2*rw/cols.length), y-rh*1.1, x+rw, y-rh*0.3);
      ctx.closePath();
    }
    // Instead of that, draw a clean striped teardrop:
    ctx.save(); ctx.beginPath(); ctx.moveTo(x,y-rh*1.2);
    ctx.bezierCurveTo(x-rw*1.4,y-rh*1.1, x-rw*1.2,y-rh*0.1, x-rw*0.4,y+2); // left to base
    ctx.lineTo(x+rw*0.4,y+2);
    ctx.bezierCurveTo(x+rw*1.2,y-rh*0.1, x+rw*1.4,y-rh*1.1, x,y-rh*1.2);
    ctx.closePath(); ctx.clip();
    for(let i=0;i<cols.length;i++){ ctx.fillStyle=cols[i]; ctx.fillRect(x-rw*1.5 + i*(3*rw/cols.length), y-rh*1.3, 3*rw/cols.length +1, rh*1.5); }
    // vertical gore highlight
    ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(x-2,y-rh*1.3,4,rh*1.5);
    ctx.restore();
    // basket + support lines + flame
    ctx.strokeStyle='#5a4030'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x-rw*0.4,y+2); ctx.lineTo(x-4*s,y+16*s); ctx.moveTo(x+rw*0.4,y+2); ctx.lineTo(x+4*s,y+16*s); ctx.stroke();
    ctx.fillStyle='#7a5230'; ctx.fillRect(x-5*s,y+16*s,10*s,7*s);
    // burner flame flickering
    if(Math.sin(t*6+x)>0.3){ ctx.fillStyle='rgba(255,150,40,.8)'; ctx.beginPath(); ctx.ellipse(x,y+2, 3*s,7*s,0,0,7); ctx.fill(); ctx.fillStyle='#ffd86a'; ctx.beginPath(); ctx.ellipse(x,y+1,1.5*s,4*s,0,0,7); ctx.fill(); }
  }
  // several balloons at varying heights, slowly drifting/bobbing
  balloon(W*0.5, H*0.4 + Math.sin(t*0.8)*6, 1.3, ['#e0402a','#f2c14a','#e0402a','#f2c14a']);
  balloon(W*0.2, H*0.52 + Math.sin(t*0.7+1)*6, 0.9, ['#4a86c0','#ffffff','#4a86c0','#ffffff']);
  balloon(W*0.8, H*0.34 + Math.sin(t*0.9+2)*6, 1.0, ['#3a8a5a','#f2c14a','#e0609a','#3a8a5a']);
  balloon(W*0.68, H*0.58 + Math.sin(t*0.6+3)*5, 0.7, ['#8a4ac0','#e0609a','#8a4ac0','#e0609a']);
  balloon(W*0.34, H*0.66 + Math.sin(t*0.75+4)*5, 0.6, ['#e08030','#f2e04a','#e08030','#f2e04a']);
  // a couple of tiny far balloons near the horizon
  for(let i=0;i<3;i++){ const bx=W*0.1+i*W*0.35+Math.sin(t*0.5+i)*8; ctx.fillStyle=['#e0402a','#4a86c0','#3a8a5a'][i]; ctx.beginPath(); ctx.arc(bx,groundY-30,5,Math.PI,0); ctx.fill(); ctx.fillStyle='#5a4030'; ctx.fillRect(bx-1,groundY-24,2,2); }
  // a few birds
  for(let i=0;i<3;i++){ const gx=W*0.4+i*W*0.12+Math.sin(t*0.7+i)*10, gy=H*0.16+i*6; ctx.strokeStyle='#6a5a4a'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(gx-5,gy); ctx.quadraticCurveTo(gx,gy-4,gx+5,gy); ctx.stroke(); }
}
registerScene('balloonfest', drawBalloonFest);

/* ── NURSERY (indoor · a cozy baby's room at night) ── */
function drawNursery(){
  const t=sceneTime, floorY=H*0.72;
  // soft night-lit pastel room
  ctx.fillStyle='#cfe0ea'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='#e8dcc8'; ctx.fillRect(0,floorY,W,H-floorY); // warm floor
  for(let i=0;i<7;i++){ ctx.fillStyle='rgba(0,0,0,.04)'; ctx.fillRect(0,floorY+i*((H-floorY)/7),W,1); }
  ctx.fillStyle='#a8c8b0'; ctx.fillRect(0,floorY-18,W,18); // green wainscot
  // a starry nightlight projection glowing on the walls (soft twinkling dots)
  for(let i=0;i<26;i++){ const sx=(i*53+11)%W, sy=(i*37)%(floorY-20); const tw=0.3+0.5*Math.abs(Math.sin(t*2+i));
    ctx.fillStyle=`rgba(255,240,180,${tw*0.7})`;
    ctx.beginPath(); ctx.arc(sx,sy,1.4,0,7); ctx.fill();
    // an occasional soft sparkle cross
    if(i%5===0){ ctx.strokeStyle=`rgba(255,240,180,${tw*0.4})`; ctx.lineWidth=0.7;
      ctx.beginPath(); ctx.moveTo(sx-3,sy); ctx.lineTo(sx+3,sy); ctx.moveTo(sx,sy-3); ctx.lineTo(sx,sy+3); ctx.stroke(); }
  }
  // a crescent-moon nightlight on the wall
  ctx.fillStyle='rgba(255,235,160,.9)'; ctx.beginPath(); ctx.arc(W*0.14,H*0.18,12,0,7); ctx.fill();
  ctx.fillStyle='#cfe0ea'; ctx.beginPath(); ctx.arc(W*0.17,H*0.16,12,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,235,160,.15)'; ctx.beginPath(); ctx.arc(W*0.14,H*0.18,28,0,7); ctx.fill();
  // the crib (center) with turned rails
  const cx=W*0.5, cb=floorY;
  ctx.fillStyle='#e8e2d8'; ctx.fillRect(cx-44,cb-40,88,10); // top rail
  ctx.fillRect(cx-44,cb-4,88,4); // base
  ctx.fillRect(cx-46,cb-44,6,44+(H-cb)); ctx.fillRect(cx+40,cb-44,6,44+(H-cb)); // posts
  ctx.strokeStyle='#e8e2d8'; ctx.lineWidth=2; for(let i=-4;i<=4;i++){ ctx.beginPath(); ctx.moveTo(cx+i*9,cb-30); ctx.lineTo(cx+i*9,cb-4); ctx.stroke(); }
  // mattress + a little sleeping bundle + blanket
  ctx.fillStyle='#f4eee6'; ctx.fillRect(cx-40,cb-30,80,14);
  ctx.fillStyle='#e8a0b8'; ctx.fillRect(cx-20,cb-30,44,10); // blanket
  ctx.fillStyle='#f0d0b8'; ctx.beginPath(); ctx.arc(cx+22,cb-28,5,0,7); ctx.fill(); // baby head peeking
  // a mobile hanging over the crib, slowly rotating
  const mx=cx, my=H*0.16; ctx.strokeStyle='#b0a890'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(mx,H*0.06); ctx.lineTo(mx,my); ctx.stroke();
  ctx.fillStyle='#c8b8a0'; ctx.beginPath(); ctx.arc(mx,my,3,0,7); ctx.fill();
  const rot=t*0.6; const charms=['#e0692a','#4a86c0','#3a8a5a','#e0c040'];
  for(let i=0;i<4;i++){ const a=rot+i*Math.PI/2; const chx=mx+Math.cos(a)*20, chy=my+6+Math.sin(a)*4;
    ctx.strokeStyle='#b0a890'; ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(chx,chy); ctx.stroke();
    ctx.fillStyle=charms[i]; // little star/cloud charms
    if(i%2){ ctx.beginPath(); ctx.arc(chx,chy+6,4,Math.PI,0); ctx.arc(chx+3,chy+5,3,Math.PI,0); ctx.fill(); }
    else { ctx.beginPath(); for(let k=0;k<10;k++){ const sa=k/10*Math.PI*2-Math.PI/2, rr=(k%2?2:4.5); const px=chx+Math.cos(sa)*rr, py=chy+6+Math.sin(sa)*rr; if(k===0)ctx.moveTo(px,py); else ctx.lineTo(px,py);} ctx.closePath(); ctx.fill(); }
  }
  // a rocking chair on the left, gently rocking
  const rk=Math.sin(t*1.2)*0.05; ctx.save(); ctx.translate(W*0.12,floorY); ctx.rotate(rk);
  ctx.strokeStyle='#8a6a44'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-14,-2); ctx.lineTo(-14,-40); ctx.quadraticCurveTo(-14,-48,-4,-48); ctx.stroke(); // back
  ctx.beginPath(); ctx.moveTo(-14,-2); ctx.lineTo(12,-6); ctx.stroke(); // seat
  ctx.beginPath(); ctx.arc(0,4,20,Math.PI*0.75,Math.PI*0.25,true); ctx.stroke(); // rocker
  ctx.restore();
  // a small toy chest + a rocking horse + alphabet blocks on the right
  ctx.fillStyle='#c07a4a'; ctx.fillRect(W*0.8,floorY-18,W*0.16,18); ctx.fillStyle='#a5623c'; ctx.fillRect(W*0.8,floorY-22,W*0.16,5);
  // blocks
  const bc=['#e0692a','#4a86c0','#3a8a5a']; const letters=['A','B','C'];
  for(let i=0;i<3;i++){ ctx.fillStyle=bc[i]; ctx.fillRect(W*0.72+i*14,floorY-14,12,12); ctx.fillStyle='#fff'; ctx.font='bold 8px sans-serif'; ctx.fillText(letters[i],W*0.72+i*14+3,floorY-5); }
  // rocking horse
  const hx=W*0.62; ctx.fillStyle='#d8c0a0'; ctx.beginPath(); ctx.ellipse(hx,floorY-14,10,5,0,0,7); ctx.fill();
  ctx.fillRect(hx+6,floorY-24,4,10); ctx.beginPath(); ctx.arc(hx+10,floorY-24,3,0,7); ctx.fill();
  ctx.strokeStyle='#8a6a44'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(hx,floorY-6,14,Math.PI*0.8,Math.PI*0.2,true); ctx.stroke();
  ctx.strokeStyle='#c04a6a'; ctx.beginPath(); ctx.moveTo(hx+10,floorY-27); ctx.lineTo(hx+14,floorY-22); ctx.stroke(); // mane
}
registerScene('nursery', drawNursery);

