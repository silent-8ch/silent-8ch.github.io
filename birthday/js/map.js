/* map: scene labels + locations panel  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */

/* ---------- map / locations panel ---------- */
const SCENE_LABELS = {
  beach:'Beach', backyard:'Backyard', river:'River', artstudio:'Art Studio',
  campsite:'Starry Campsite', bakery:'Bakery', library:'Cozy Library',
  cherryblossom:'Cherry Blossoms', aquarium:'Aquarium Hall', greenhouse:'Greenhouse',
  planetarium:'Planetarium', autumnforest:'Autumn Forest', musicroom:'Music Room',
  aurora:'Aurora Tundra', pottery:'Pottery Studio', lavender:'Lavender Field',
  arcade:'Arcade', rooftop:'Rooftop Garden', teahouse:'Tea House', zengarden:'Zen Garden',
  sciencelab:'Science Lab', tidepools:'Tide Pools', balletstudio:'Ballet Studio',
  vineyard:'Vineyard', florist:'Florist Shop', balloons:'Hot Air Balloons',
  recordshop:'Record Shop', waterfall:'Waterfall', sewingstudio:'Sewing Studio',
  pumpkinpatch:'Pumpkin Patch', toyshop:'Toy Shop', snowycabin:'Snowy Cabin',
  spa:'Spa', desert:'Desert Sunset', observatory:'Observatory', fireflies:'Firefly Meadow',
  cafe:'Coffee Shop', rainystreet:'Rainy Street', darkroom:'Darkroom', lighthouse:'Lighthouse',
  winecellar:'Wine Cellar', bamboo:'Bamboo Forest', clockmaker:"Clockmaker's Shop",
  carnival:'Carnival', chocolateshop:'Chocolate Shop', tulipfield:'Tulip Field',
  diner:'Diner', mountain:'Mountain Vista', apothecary:'Apothecary', icepond:'Ice Pond',
  catcafe:'Cat Café', savanna:'Savanna', antiqueshop:'Antique Shop', waterlily:'Water Lily Pond',
  magicshop:'Magic Shop', fishingdock:'Fishing Dock', butterflydome:'Butterfly Dome',
  pasture:'Pasture', perfumery:'Perfumery', stainedglass:'Stained Glass Studio',
  orchard:'Apple Orchard', candleshop:'Candle Workshop', windmill:'Windmill',
  forge:'Blacksmith Forge', hotspring:'Hot Spring', cinema:'Cinema', marina:'Marina',
  puppettheater:'Puppet Theater', sunflowers:'Sunflower Field', icecreamparlor:'Ice Cream Parlor',
  topiary:'Topiary Garden', bowling:'Bowling Alley', redwoods:'Redwood Forest',
  trainroom:'Model Train Room', riceterraces:'Rice Terraces', barbershop:'Barbershop',
  koipond:'Koi Pond', glassblowing:'Glassblowing Studio', cliffs:'Coastal Cliffs',
  terrariumshop:'Terrarium Shop', saltflats:'Salt Flats', bookbindery:'Bookbindery',
  meteorshower:'Meteor Shower', letterpress:'Letterpress Shop', glowwormcave:'Glowworm Cave',
  luthier:'Luthier Workshop', coveredbridge:'Covered Bridge', cheeseshop:'Cheese Shop',
  canyon:'Canyon', comicshop:'Comic Shop', alpinemeadow:'Alpine Meadow', cobbler:'Cobbler',
  wheatfield:'Wheat Field', weaving:'Weaving Studio', frozenfalls:'Frozen Waterfall',
  fencing:'Fencing Salle', geyser:'Geyser Field', ballroom:'Ballroom', volcano:'Volcano',
  fireworks:'Fireworks', chesshall:'Chess Hall', coralreef:'Coral Reef', boxinggym:'Boxing Gym',
  biobay:'Bioluminescent Bay', naturalhistory:'Natural History Museum', sanddunes:'Sand Dunes',
  cartographer:"Cartographer's Study", bayou:'Bayou', escaperoom:'Escape Room',
  teaplantation:'Tea Plantation', recordingstudio:'Recording Studio', cranberrybog:'Cranberry Bog',
  aviary:'Aviary', icebergbay:'Iceberg Bay', candyshop:'Candy Shop', prairiestorm:'Prairie Storm',
  millinery:'Millinery', hedgemaze:'Hedge Maze', optician:'Optician', cornmaze:'Corn Maze',
  petshop:'Pet Shop', balloonfest:'Balloon Festival', nursery:'Nursery',
};
function sceneLabel(n){ return SCENE_LABELS[n] || (n.charAt(0).toUpperCase()+n.slice(1)); }
function buildPassport(){
  const el=document.getElementById('mapPassport'); if(!el) return;
  const pct = Math.round(visited.size/SCENES.length*100);
  const badges = earnedBadges().map(b=>`${b.icon}`).join(' ');
  el.innerHTML = `<span>🗺️ Visited ${visited.size}/${SCENES.length}</span>`
    + `<span class="pbar"><i style="width:${pct}%"></i></span>`
    + (badges ? `<span title="badges earned">${badges}</span>` : '');
}
function buildMapList(){
  buildPassport();
  const list=document.getElementById('mapList'); list.innerHTML='';
  SCENES.forEach((name,idx)=>{
    const row=document.createElement('div'); row.className='mapRow'+(idx===currentScene?' current':'');
    const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=sceneEnabled(name);
    cb.addEventListener('change',()=>{ if(cb.checked) disabledScenes.delete(name); else disabledScenes.add(name); saveDisabled(); });
    const nm=document.createElement('span'); nm.className='mn'+(visited.has(name)?' seen':''); nm.textContent=sceneLabel(name);
    nm.addEventListener('click',()=>{ currentScene=idx; sceneChangeTimer=60; closeMap(); });
    row.appendChild(cb); row.appendChild(nm); list.appendChild(row);
  });
}
function openMap(){ buildMapList(); document.getElementById('mapPanel').classList.remove('hide'); }
function closeMap(){ document.getElementById('mapPanel').classList.add('hide'); }
function toggleMap(){ document.getElementById('mapPanel').classList.contains('hide') ? openMap() : closeMap(); }
document.getElementById('mapBtn').addEventListener('click', openMap);
document.getElementById('mapClose').addEventListener('click', closeMap);
document.getElementById('collectBtn').addEventListener('click', openCollect);
document.getElementById('collectClose').addEventListener('click', closeCollect);
document.getElementById('outfitBtn').addEventListener('click', openOutfit);
document.getElementById('outfitClose').addEventListener('click', closeOutfit);
document.getElementById('setBtn').addEventListener('click', openSettings);
document.getElementById('setClose').addEventListener('click', closeSettings);
document.getElementById('daysChip').addEventListener('click', openNotes);
document.getElementById('noteClose').addEventListener('click', closeNotes);
document.getElementById('starWish').addEventListener('click', grantStar);
document.getElementById('padClose').addEventListener('click', closePad);
document.getElementById('padClear').addEventListener('click', padClearCanvas);
document.getElementById('padSave').addEventListener('click', padSaveDrawing);
// tap Draw to play; hold Draw to open the drawing pad
(function(){
  const drawBtn = document.querySelector('.btn[data-action="draw"]');
  if (!drawBtn) return;
  drawBtn.title = 'Tap to draw together · hold to open the drawing pad';
  let lp = null, longPressed = false;
  drawBtn.addEventListener('pointerdown', ()=>{ longPressed=false; lp=setTimeout(()=>{ longPressed=true; openPad(); }, 450); });
  const cancel = ()=> clearTimeout(lp);
  drawBtn.addEventListener('pointerup', cancel);
  drawBtn.addEventListener('pointerleave', cancel);
  drawBtn.addEventListener('click', (e)=>{ if (longPressed){ e.stopImmediatePropagation(); e.preventDefault(); longPressed=false; } }, true);
})();
document.getElementById('mapAll').addEventListener('click', ()=>{ disabledScenes.clear(); saveDisabled(); buildMapList(); });
document.getElementById('mapNone').addEventListener('click', ()=>{ disabledScenes = new Set(SCENES); saveDisabled(); buildMapList(); });

