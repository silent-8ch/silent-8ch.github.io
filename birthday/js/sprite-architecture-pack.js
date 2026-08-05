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
})();
