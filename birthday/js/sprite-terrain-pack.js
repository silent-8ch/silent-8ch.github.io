/* Reusable four-variant terrain tiles, boundaries, and traversal edges. */
(function registerSpriteTerrainPack(){
  const base='sprites/objects/';
  const tiles={
    meadowGrass:   'meadow-grass.png',
    forestGrass:   'forest-grass.png',
    dirtPath:      'dirt-path.png',
    beachSand:     'beach-sand.png',
    cobblestone:   'cobblestone.png',
    flagstone:     'flagstone.png',
    woodFloor:     'wood-floor.png',
    terracottaTile:'terracotta-tile.png',
  };
  for(const [name,file] of Object.entries(tiles)){
    SpriteRenderer.register(name,{
      src:base+file,cols:4,fps:0,renderMode:'tile',variantMode:'position',
      tileSize:64,defaultWidth:64,defaultHeight:64,phase:'background',anchorX:0,anchorY:0,
    });
  }

  const strips={
    grassDirtEdge:{file:'grass-dirt-edge.png',fps:0,width:128,height:64,collidable:true,footprint:{width:120,depth:16}},
    grassCurbEdge:{file:'grass-curb-edge.png',fps:0,width:128,height:64,collidable:true,footprint:{width:120,depth:18}},
    sandShoreline:{file:'sand-shoreline.png',fps:4,width:128,height:64,collidable:false},
    riverbankEdge:{file:'riverbank-edge.png',fps:4,width:128,height:64,collidable:true,footprint:{width:120,depth:20}},
    dockEdge:     {file:'dock-edge.png',fps:0,width:128,height:64,collidable:true,footprint:{width:112,depth:24}},
    stoneStairs:  {file:'stone-stairs.png',fps:0,width:112,height:80,collidable:false},
    woodStairs:   {file:'wood-stairs.png',fps:0,width:112,height:80,collidable:false},
    pathBorder:   {file:'path-border.png',fps:0,width:128,height:48,collidable:true,footprint:{width:120,depth:12}},
  };
  for(const [name,item] of Object.entries(strips)){
    SpriteRenderer.register(name,{
      src:base+item.file,cols:4,fps:item.fps,renderMode:'strip',variantMode:item.fps?'animation':'position',
      defaultWidth:item.width,defaultHeight:item.height,phase:'ground',anchorX:.5,anchorY:1,
      collidable:item.collidable,footprint:item.footprint||null,depthOffset:0,
    });
  }
})();
