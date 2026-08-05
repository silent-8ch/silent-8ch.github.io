/* Shared sprite registry with four-frame animation and deterministic layering. */
(function installSpriteObjects(root){
  const PHASES = Object.freeze(['background','ground','actors','foreground','overlay']);
  const phaseRank = Object.fromEntries(PHASES.map((phase,index)=>[phase,index]));

  function createSpriteRenderer(options){
    const context=options.context, ImageCtor=options.ImageCtor||root.Image;
    const getScene=options.getScene||(()=>null), registry=new Map(), objects=new Map(), submitted=[];
    let nextId=1, order=1;
    function assertPhase(phase){if(!(phase in phaseRank))throw new Error(`Unknown sprite phase: ${phase}`)}
    function register(name,config){
      const cols=config.cols||config.frames||1, rows=config.rows||1;
      if(!name||typeof name!=='string')throw new Error('Sprite name is required');
      if(cols*rows>4)throw new Error(`Sprite ${name} exceeds the four-frame limit`);
      if(registry.has(name))throw new Error(`Sprite ${name} is already registered`);
      const record={...config,cols,rows,fps:config.fps||0,ready:false,image:null,fw:0,fh:0};
      registry.set(name,record);
      const image=new ImageCtor();
      image.onload=()=>{record.image=image;record.fw=Math.floor(image.width/cols);record.fh=Math.floor(image.height/rows);record.ready=record.fw>0&&record.fh>0};
      image.src=config.src;
      return record;
    }
    function normalize(spec,persistent){const sprite=registry.get(spec.sprite),phase=spec.phase||sprite?.phase||'actors';assertPhase(phase);return{
      id:persistent?nextId++:null,sprite:spec.sprite||null,draw:spec.draw||null,scene:spec.scene??getScene(),phase,
      x:spec.x||0,y:spec.y||0,depth:spec.depth??((spec.y||0)+(sprite?.depthOffset||0)),width:spec.width,height:spec.height,scale:spec.scale??1,
      anchorX:spec.anchorX??sprite?.anchorX??.5,anchorY:spec.anchorY??sprite?.anchorY??1,flipX:!!spec.flipX,alpha:spec.alpha??1,
      frame:spec.frame??0,elapsed:0,playing:spec.playing!==false,loop:spec.loop!==false,
      visible:spec.visible!==false,order:order++,data:spec.data||null};}
    function create(spec){const object=normalize(spec,true);objects.set(object.id,object);return object}
    function remove(value){return objects.delete(typeof value==='object'?value.id:value)}
    function clearScene(scene){for(const [id,object]of objects)if(object.scene===scene)objects.delete(id)}
    function beginFrame(){submitted.length=0}
    function submit(spec){const object=normalize(spec,false);submitted.push(object);return object}
    function update(dt){for(const object of objects.values()){const sprite=registry.get(object.sprite);if(!object.playing||!sprite||sprite.fps<=0)continue;object.elapsed+=dt;const step=1/sprite.fps;while(object.elapsed>=step){object.elapsed-=step;const next=object.frame+1;object.frame=next<sprite.cols?next:(object.loop?0:sprite.cols-1);if(!object.loop&&next>=sprite.cols)object.playing=false}}}
    function visible(object,scene){return object.visible&&(object.scene==null||object.scene===scene)}
    function drawObject(object){
      if(object.draw){object.draw(context,object);return}
      const sprite=registry.get(object.sprite);if(!sprite||!sprite.ready)return;
      const width=object.width||(sprite.defaultSize||sprite.fw)*object.scale,height=object.height||(sprite.defaultSize||sprite.fh)*object.scale;
      const frame=Math.max(0,Math.min(sprite.cols-1,object.frame|0));
      context.save();context.globalAlpha*=object.alpha;context.translate(object.x,object.y);context.scale(object.flipX?-1:1,1);
      context.drawImage(sprite.image,frame*sprite.fw,0,sprite.fw,sprite.fh,-width*object.anchorX,-height*object.anchorY,width,height);context.restore();
    }
    function drawPhase(phase){assertPhase(phase);const scene=getScene();const list=[...objects.values(),...submitted].filter(object=>object.phase===phase&&visible(object,scene)).sort((a,b)=>((a.depth??a.y)-(b.depth??b.y))||(a.order-b.order));for(const object of list)drawObject(object)}
    function hitTest(x,y,phases=PHASES){const scene=getScene();return[...objects.values()].filter(object=>phases.includes(object.phase)&&visible(object,scene)).sort((a,b)=>((b.depth??b.y)-(a.depth??a.y))||(b.order-a.order)).find(object=>{const sprite=registry.get(object.sprite),width=object.width||(sprite?.defaultSize||sprite?.fw||0)*object.scale,height=object.height||(sprite?.defaultSize||sprite?.fh||0)*object.scale,left=object.x-width*object.anchorX,top=object.y-height*object.anchorY;return x>=left&&x<=left+width&&y>=top&&y<=top+height})||null}
    function getFootprint(value){const object=typeof value==='object'?value:objects.get(value),sprite=object&&registry.get(object.sprite),shape=sprite?.footprint;if(!object||!shape)return null;const width=shape.width*object.scale,depth=shape.depth*object.scale;return{left:object.x-width*object.anchorX,right:object.x+width*(1-object.anchorX),top:object.y-depth,bottom:object.y,width,depth}}
    return{PHASES,register,create,remove,clearScene,beginFrame,submit,update,drawPhase,hitTest,getFootprint,getSprite:name=>registry.get(name),getObject:id=>objects.get(id)};
  }
  root.createSpriteRenderer=createSpriteRenderer;
  if(typeof ctx!=='undefined')root.SpriteRenderer=createSpriteRenderer({context:ctx,getScene:()=>typeof SCENES!=='undefined'?SCENES[currentScene]:null});
})(globalThis);
