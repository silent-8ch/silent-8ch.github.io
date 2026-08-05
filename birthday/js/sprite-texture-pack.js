/* Broad static texture library. Every registered asset is one lazy-loaded frame. */
(function registerSpriteTexturePack(){
  const base='sprites/textures/';
  const groups={
    natural:{
      springGrass:'spring-grass.png',dryGrass:'dry-grass.png',cloverGround:'clover-ground.png',mossGround:'moss-ground.png',
      darkSoil:'dark-soil.png',gardenSoil:'garden-soil.png',mudGround:'mud-ground.png',gravelGround:'gravel-ground.png',
      snowGround:'snow-ground.png',iceGround:'ice-ground.png',fallenLeaves:'fallen-leaves.png',pineNeedles:'pine-needles.png',
    },
    paths:{
      packedPath:'packed-path.png',redBrickPath:'red-brick-path.png',slatePath:'slate-path.png',asphaltPath:'asphalt-path.png',
    },
    floors:{
      oakFloor:'oak-floor.png',paleWoodFloor:'pale-wood-floor.png',darkWoodFloor:'dark-wood-floor.png',parquetFloor:'parquet-floor.png',
      creamCarpet:'cream-carpet.png',roseCarpet:'rose-carpet.png',blueCarpet:'blue-carpet.png',speckledLinoleum:'speckled-linoleum.png',
      marbleFloor:'marble-floor.png',kitchenTile:'kitchen-tile.png',workshopFloor:'workshop-floor.png',checkerFloor:'checker-floor.png',
    },
    walls:{
      creamPlasterWall:'cream-plaster-wall.png',floralWallpaper:'floral-wallpaper.png',paintedBrickWall:'painted-brick-wall.png',woodPanelWall:'wood-panel-wall.png',
      fieldstoneWall:'fieldstone-wall.png',castleStoneWall:'castle-stone-wall.png',concreteWall:'concrete-wall.png',whiteSiding:'white-siding.png',
      redSiding:'red-siding.png',cedarSiding:'cedar-siding.png',stuccoWall:'stucco-wall.png',subwayTileWall:'subway-tile-wall.png',
    },
    roofs:{
      asphaltShingles:'asphalt-shingles.png',slateRoof:'slate-roof.png',terracottaRoof:'terracotta-roof.png',metalRoof:'metal-roof.png',
      thatchRoof:'thatch-roof.png',cedarShingles:'cedar-shingles.png',
    },
    structural:{dockPlanks:'dock-planks.png',weatheredDeck:'weathered-deck.png'},
    water:{
      pondWater:'pond-water.png',riverWater:'river-water.png',oceanWater:'ocean-water.png',poolWater:'pool-water.png',
      fountainWater:'fountain-water.png',swampWater:'swamp-water.png',shallowWater:'shallow-water.png',deepWater:'deep-water.png',
    },
    decorative:{
      redRug:'red-rug.png',blueRug:'blue-rug.png',floralRug:'floral-rug.png',picnicBlanket:'picnic-blanket.png',
      gardenBed:'garden-bed.png',flowerPatch:'flower-patch.png',pebbleBed:'pebble-bed.png',mosaicTile:'mosaic-tile.png',
    },
  };
  for(const [category,textures] of Object.entries(groups)){
    for(const [name,file] of Object.entries(textures)){
      SpriteRenderer.register(name,{
        src:base+file,cols:1,fps:0,lazy:true,renderMode:'texture',category,
        tileSize:64,defaultWidth:64,defaultHeight:64,phase:'background',anchorX:0,anchorY:0,
      });
    }
  }
})();
