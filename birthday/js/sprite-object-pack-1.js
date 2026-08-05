/* High-reuse sprite pack: ambient objects, background visitors, and pets. */
(function registerSpriteObjectPack1(){
  const base='sprites/objects/';
  const assets={
    cloud:       {src:base+'cloud.png',cols:4,fps:1.5,defaultSize:82},
    lantern:     {src:base+'lantern.png',cols:4,fps:3,defaultSize:32},
    butterfly:   {src:base+'butterfly.png',cols:4,fps:8,defaultSize:26},
    bird:        {src:base+'bird.png',cols:4,fps:6,defaultSize:30},
    npcAdult:    {src:base+'npc-adult.png',cols:4,fps:8,defaultSize:80},
    npcChild:    {src:base+'npc-child.png',cols:4,fps:8,defaultSize:60},
    puppy:       {src:base+'puppy.png',cols:4,fps:7,defaultSize:50},
    cat:         {src:base+'cat.png',cols:4,fps:7,defaultSize:45},
    /* static props (single-frame) */
    book:        {src:base+'book.png',cols:1,fps:0,defaultSize:28},
    bush:        {src:base+'bush.png',cols:1,fps:0,defaultSize:55},
    cookingPot:  {src:base+'cooking-pot.png',cols:1,fps:0,defaultSize:38},
    giftBox:     {src:base+'gift-box.png',cols:1,fps:0,defaultSize:36},
    pottedPlant: {src:base+'potted-plant.png',cols:1,fps:0,defaultSize:65},
    tableChair:  {src:base+'table-chair.png',cols:1,fps:0,defaultSize:65},
    teacup:      {src:base+'teacup.png',cols:1,fps:0,defaultSize:22},
    umbrella:    {src:base+'umbrella.png',cols:1,fps:0,defaultSize:65},
    jellyfish: {src:base+'jellyfish.png',cols:4,fps:5,defaultSize:42},
    parrot:    {src:base+'parrot.png',cols:4,fps:7,defaultSize:38},
    crab:      {src:base+'crab.png',cols:4,fps:7,defaultSize:30},
    whaleShark:{src:base+'whale-shark.png',cols:4,fps:5,defaultSize:90},
    bunny:     {src:base+'bunny.png',cols:4,fps:7,defaultSize:40},
    kittens:   {src:base+'kittens.png',cols:4,fps:6,defaultSize:44},
    fireflies: {src:base+'fireflies.png',cols:4,fps:5,defaultSize:30},
    reindeer:  {src:base+'reindeer.png',cols:4,fps:6,defaultSize:78},
    /* environment pack: scale, ground anchor, collision footprint, and layering defaults */
    tree:          {src:base+'tree.png',cols:4,fps:2,defaultSize:150,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:58,depth:22},depthOffset:0},
    floweringBush: {src:base+'flowering-bush.png',cols:4,fps:2.5,defaultSize:82,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:60,depth:18},depthOffset:0},
    wildflowers:   {src:base+'wildflowers.png',cols:4,fps:3,defaultSize:58,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:40,depth:12},depthOffset:0},
    grassTuft:     {src:base+'grass-tuft.png',cols:4,fps:3,defaultSize:52,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:36,depth:10},depthOffset:0},
    parkBench:     {src:base+'park-bench.png',cols:4,fps:2.5,defaultSize:96,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:78,depth:22},depthOffset:0},
    cafeTable:     {src:base+'cafe-table.png',cols:4,fps:2.5,defaultSize:104,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:82,depth:38},depthOffset:0},
    signpost:      {src:base+'signpost.png',cols:4,fps:3,defaultSize:74,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:28,depth:14},depthOffset:0},
    fence:         {src:base+'fence.png',cols:4,fps:2,defaultSize:92,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:78,depth:14},depthOffset:0},
    streetlamp:    {src:base+'streetlamp.png',cols:4,fps:3,defaultSize:94,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:20,depth:12},depthOffset:0},
    mailbox:       {src:base+'mailbox.png',cols:4,fps:2,defaultSize:66,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:28,depth:14},depthOffset:0},
    trashCan:      {src:base+'trash-can.png',cols:4,fps:3,defaultSize:58,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:34,depth:16},depthOffset:0},
    marketAwning:  {src:base+'market-awning.png',cols:4,fps:3,defaultSize:116,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:88,depth:24},depthOffset:0},
    doorway:       {src:base+'doorway.png',cols:4,fps:2,defaultSize:112,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:70,depth:18},depthOffset:0},
    flowerWindow:  {src:base+'flower-window.png',cols:4,fps:2.5,defaultSize:108,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:86,depth:16},depthOffset:0},
    pennantFlags:  {src:base+'pennant-flags.png',cols:4,fps:4,defaultSize:82,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:22,depth:12},depthOffset:0},
    waterRipple:   {src:base+'water-ripple.png',cols:4,fps:5,defaultSize:68,phase:'ground',anchorX:.5,anchorY:.5,footprint:{width:60,depth:20},depthOffset:-10},
  };
  for(const [name,config] of Object.entries(assets)) SpriteRenderer.register(name,config);
})();

function drawSpriteCloud(x,y,scale=1){
  SpriteRenderer.submit({
    sprite:'cloud',phase:'background',x,y,depth:y,
    scale,anchorY:.5,
    frame:Math.floor(sceneTime*1.5)%4,
  });
}
