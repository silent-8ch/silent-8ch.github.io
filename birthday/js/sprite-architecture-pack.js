/* Tintable, lazy-loaded, single-frame modules for assembling buildings and structures. */
(function registerSpriteArchitecturePack(){
  const base='sprites/architecture/';
  const groups={
    shell:{phase:'ground',collidable:true,items:{
      stoneFoundation:['stone-foundation.png',100],woodFoundation:['wood-foundation.png',100],
      plasterWallCorner:['plaster-wall-corner.png',110],brickWallCorner:['brick-wall-corner.png',110],
      stoneColumn:['stone-column.png',90],porchColumn:['porch-column.png',90],
      porchPlatform:['porch-platform.png',105],porchSteps:['porch-steps.png',105],
      woodBalcony:['wood-balcony.png',110],porchRailing:['porch-railing.png',100],
      brickChimney:['brick-chimney.png',92],stoneChimney:['stone-chimney.png',92],
      timberGable:['timber-gable.png',122],stoneGable:['stone-gable.png',122],
      shingleEave:['shingle-eave.png',120],tileEave:['tile-eave.png',120],
    }},
    openings:{phase:'ground',collidable:false,items:{
      woodDoor:['wood-door.png',92],archedDoor:['arched-door.png',98],storefrontDoor:['storefront-door.png',100],doubleDoor:['double-door.png',108],
      cottageWindow:['cottage-window.png',76],archedWindow:['arched-window.png',82],bayWindow:['bay-window.png',96],flowerBoxWindow:['flower-box-window.png',86],
      woodShutters:['wood-shutters.png',78],storefrontFrame:['storefront-frame.png',112],shopWindow:['shop-window.png',108],stoneArchway:['stone-archway.png',106],
      woodGate:['wood-gate.png',100,true],ironGate:['iron-gate.png',100,true],fenceCorner:['fence-corner.png',96,true],lowStoneCorner:['low-stone-corner.png',96,true],
    }},
    foreground:{phase:'foreground',collidable:false,items:{
      woodDoorframeOverlay:['wood-doorframe-overlay.png',100],stoneDoorframeOverlay:['stone-doorframe-overlay.png',104],
      stoneArchOverlay:['stone-arch-overlay.png',108],shingleEaveOverlay:['shingle-eave-overlay.png',128],
      balconyOverlay:['balcony-overlay.png',112],woodRailingOverlay:['wood-railing-overlay.png',106],
      ironRailingOverlay:['iron-railing-overlay.png',106],storefrontCanopy:['storefront-canopy.png',112],
    }},
    structures:{phase:'ground',collidable:true,items:{
      gardenGazebo:['garden-gazebo.png',138],gardenShed:['garden-shed.png',132],stoneWell:['stone-well.png',100],woodFootbridge:['wood-footbridge.png',124],
      stoneFootbridge:['stone-footbridge.png',124],pergola:['pergola.png',126],parkPavilion:['park-pavilion.png',142],emptyMarketStall:['empty-market-stall.png',128],
    }},
  };
  for(const [category,group] of Object.entries(groups)){
    for(const [name,item] of Object.entries(group.items)){
      const [file,size,collisionOverride]=item,collidable=collisionOverride??group.collidable;
      SpriteRenderer.register(name,{
        src:base+file,cols:1,fps:0,lazy:true,renderMode:'object',category,
        defaultSize:size,phase:group.phase,anchorX:.5,anchorY:1,depthOffset:0,collidable,
        footprint:collidable?{width:Math.round(size*.72),depth:Math.round(size*.18)}:null,
      });
    }
  }
  // Baked anchor overrides from debug editor
  const anchorOverrides = {
    archedDoor: {anchorX:.51, anchorY:.92},
    archedWindow: {anchorX:.5, anchorY:.92},
    balconyOverlay: {anchorX:.5, anchorY:.88},
    bayWindow: {anchorX:.5, anchorY:.92},
    brickChimney: {anchorX:.5, anchorY:.78},
    brickWallCorner: {anchorX:.5, anchorY:.7},
    cottageWindow: {anchorX:.49, anchorY:.9},
    dockEdge: {anchorX:.5, anchorY:.92},
    doorway: {anchorX:.5, anchorY:.92},
    doubleDoor: {anchorX:.5, anchorY:.92},
    emptyMarketStall: {anchorX:.51, anchorY:.77},
    fenceCorner: {anchorX:.5, anchorY:.78},
    flowerBoxWindow: {anchorX:.5, anchorY:.92},
    gardenGazebo: {anchorX:.5, anchorY:.77},
    gardenShed: {anchorX:.51, anchorY:.78},
    grassCurbEdge: {anchorX:.5, anchorY:.92},
    grassDirtEdge: {anchorX:.49, anchorY:.92},
    ironGate: {anchorX:.5, anchorY:.9},
    ironRailingOverlay: {anchorX:.5, anchorY:.86},
    lowStoneCorner: {anchorX:.48, anchorY:.8},
    parkPavilion: {anchorX:.49, anchorY:.75},
    pergola: {anchorX:.5, anchorY:.8},
    plasterWallCorner: {anchorX:.5, anchorY:.76},
    porchColumn: {anchorX:.49, anchorY:.83},
    porchPlatform: {anchorX:.49, anchorY:.68},
    porchRailing: {anchorX:.48, anchorY:.76},
    porchSteps: {anchorX:.47, anchorY:.73},
    shingleEave: {anchorX:.52, anchorY:.7},
    shingleEaveOverlay: {anchorX:.5, anchorY:.91},
    shopWindow: {anchorX:.5, anchorY:.91},
    stoneArchOverlay: {anchorX:.5, anchorY:.87},
    stoneArchway: {anchorX:.47, anchorY:.9},
    stoneChimney: {anchorX:.5, anchorY:.8},
    stoneColumn: {anchorX:.49, anchorY:.81},
    stoneDoorframeOverlay: {anchorX:.51, anchorY:.85},
    stoneFootbridge: {anchorX:.51, anchorY:.77},
    stoneFoundation: {anchorX:.5, anchorY:.74},
    stoneGable: {anchorX:.47, anchorY:.84},
    stoneStairs: {anchorX:.49, anchorY:.81},
    stoneWell: {anchorX:.51, anchorY:.82},
    storefrontCanopy: {anchorX:.48, anchorY:.9},
    storefrontDoor: {anchorX:.5, anchorY:.91},
    storefrontFrame: {anchorX:.5, anchorY:.9},
    tileEave: {anchorX:.5, anchorY:.73},
    timberGable: {anchorX:.48, anchorY:.84},
    woodBalcony: {anchorX:.5, anchorY:.75},
    woodDoor: {anchorX:.49, anchorY:.92},
    woodDoorframeOverlay: {anchorX:.49, anchorY:.86},
    woodFootbridge: {anchorX:.51, anchorY:.76},
    woodFoundation: {anchorX:.51, anchorY:.8},
    woodGate: {anchorX:.48, anchorY:.92},
    woodRailingOverlay: {anchorX:.49, anchorY:.86},
    woodShutters: {anchorX:.51, anchorY:.89},
    woodStairs: {anchorX:.49, anchorY:.79},
  };
  for (const [name, anc] of Object.entries(anchorOverrides)) {
    const sp = SpriteRenderer.getSprite(name);
    if (sp) { sp.anchorX = anc.anchorX; sp.anchorY = anc.anchorY; }
  }
})();
