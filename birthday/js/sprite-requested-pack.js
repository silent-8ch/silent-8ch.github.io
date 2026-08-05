/* Four-frame environment sheets requested in the sprite handoff. */
(function registerRequestedSpritePack(){
  const base='sprites/requested/';
  const assets={
    skyDay:{src:base+'sky-day.png',fps:0,phase:'background',defaultSize:256,renderMode:'fill'},
    skyNight:{src:base+'sky-night.png',fps:0,phase:'background',defaultSize:256,renderMode:'fill'},
    skySunset:{src:base+'sky-sunset.png',fps:0,phase:'background',defaultSize:256,renderMode:'fill'},
    starField:{src:base+'star-field.png',fps:2.5,phase:'background',defaultSize:256,defaultAlpha:.8},
    waterSurface:{src:base+'water-surface.png',fps:4,phase:'ground',defaultWidth:180,defaultHeight:58,defaultAlpha:.72,renderMode:'strip'},
    shelfCounter:{src:base+'shelf-counter.png',fps:0,phase:'ground',defaultWidth:140,defaultHeight:72,renderMode:'strip'},
    windowRect:{src:base+'window-rect.png',fps:0,phase:'ground',defaultSize:90},
    windowArch:{src:base+'window-arch.png',fps:0,phase:'ground',defaultSize:90},
    candleFlame:{src:base+'candle-flame.png',fps:7,phase:'foreground',defaultSize:24},
    moonCrescent:{src:base+'moon-crescent.png',fps:0,phase:'background',defaultSize:64,anchorY:.5},
    mountainSilhouette:{src:base+'mountain-silhouette.png',fps:0,phase:'background',defaultWidth:190,defaultHeight:82},
    rockBoulder:{src:base+'rock-boulder.png',fps:0,phase:'ground',defaultSize:64,footprint:{width:48,depth:18}},
    rugCarpet:{src:base+'rug-carpet.png',fps:0,phase:'ground',defaultWidth:110,defaultHeight:70},
    bedPillow:{src:base+'bed-pillow.png',fps:0,phase:'ground',defaultSize:120,footprint:{width:82,depth:34}},
    fogMist:{src:base+'fog-mist.png',fps:2,phase:'overlay',defaultWidth:180,defaultHeight:64,defaultAlpha:.22},
    boatHull:{src:base+'boat-hull.png',fps:0,phase:'actors',defaultSize:90,footprint:{width:72,depth:20}},
    curtainDrape:{src:base+'curtain-drape.png',fps:0,phase:'foreground',defaultWidth:90,defaultHeight:120},
  };
  for(const [name,config] of Object.entries(assets)) SpriteRenderer.register(name,{...config,cols:4,lazy:true});
})();
