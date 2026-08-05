/* High-reuse sprite pack: ambient objects, background visitors, and pets. */
(function registerSpriteObjectPack1(){
  const base='sprites/objects/';
  const assets={
    cloud:       {src:base+'cloud.png',cols:4,fps:1.5},
    lantern:     {src:base+'lantern.png',cols:4,fps:3},
    butterfly:   {src:base+'butterfly.png',cols:4,fps:8},
    bird:        {src:base+'bird.png',cols:4,fps:6},
    npcAdult:    {src:base+'npc-adult.png',cols:4,fps:8},
    npcChild:    {src:base+'npc-child.png',cols:4,fps:8},
    puppy:       {src:base+'puppy.png',cols:4,fps:7},
    cat:         {src:base+'cat.png',cols:4,fps:7},
    /* static props (single-frame) */
    book:        {src:base+'book.png',cols:1,fps:0},
    bush:        {src:base+'bush.png',cols:1,fps:0},
    cookingPot:  {src:base+'cooking-pot.png',cols:1,fps:0},
    giftBox:     {src:base+'gift-box.png',cols:1,fps:0},
    pottedPlant: {src:base+'potted-plant.png',cols:1,fps:0},
    tableChair:  {src:base+'table-chair.png',cols:1,fps:0},
    teacup:      {src:base+'teacup.png',cols:1,fps:0},
    umbrella:    {src:base+'umbrella.png',cols:1,fps:0},
  };
  for(const [name,config] of Object.entries(assets)) SpriteRenderer.register(name,config);
})();

function drawSpriteCloud(x,y,scale=1){
  SpriteRenderer.submit({
    sprite:'cloud',phase:'background',x,y,depth:y,
    width:82*scale,height:82*scale,anchorY:.5,
    frame:Math.floor(sceneTime*1.5)%4,
  });
}
