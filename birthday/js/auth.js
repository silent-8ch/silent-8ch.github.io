/* auth: optional Firebase login & cloud sync — birthday virtual-pet (8-3.html). */
(function(){
  firebase.initializeApp({
    apiKey:"AIzaSyDOHBS-ILRBi_qlYOvAm3qQlWcHKVBwuek",
    authDomain:"titato-c2897.firebaseapp.com",
    databaseURL:"https://titato-c2897-default-rtdb.firebaseio.com",
    projectId:"titato-c2897"
  });
  const db=firebase.database(), fbAuth=firebase.auth();
  let currentUser=null, displayName=null, syncTimer=null, lastHash='';
  let isSignUp=false, isLink=false;
  const $=id=>document.getElementById(id);
  function arr(v){ return Array.isArray(v)?v:v?Object.values(v):[]; }

  /* ── gather / apply ──────────────────────────────────────── */
  function gather(){
    return {
      state:{...state, x:pet.x, y:pet.y, lastSeen:Date.now()},
      meta, visited:[...visited], collection, achieved:[...achieved],
      disabled:[...disabledScenes], outfit, settings,
      gallery, cutscenesSeen:typeof seenCutscenes!=='undefined'?seenCutscenes:{}
    };
  }
  function leaderboardEntry(){
    return {
      name:displayName||'???',
      hugs:state.hugs||0, cookies:state.feeds||0, draws:state.draws||0, rests:state.rests||0,
      days:(meta&&meta.totalDays)||0, streak:(meta&&meta.streak)||0,
      visited:visited.size, achievements:achieved.size,
      trinkets:typeof collectedKinds==='function'?collectedKinds():Object.keys(collection).length
    };
  }
  function sync(){
    if(!currentUser) return;
    const d=gather(), h=JSON.stringify(d);
    if(h===lastHash) return; lastHash=h;
    db.ref('birthday/players/'+currentUser.uid+'/data').set(d).catch(e=>console.warn('sync',e));
    db.ref('birthday/leaderboard/'+currentUser.uid).set(leaderboardEntry()).catch(e=>console.warn('lb sync',e));
  }
  function applyCloud(d){
    if(!d) return;
    if(d.state){ Object.assign(state,d.state); pet.x=state.x; pet.y=state.y; pet.tx=state.x; pet.ty=state.y; }
    if(d.meta){ meta.firstDay=d.meta.firstDay; meta.lastDay=d.meta.lastDay; meta.totalDays=d.meta.totalDays||0; meta.streak=d.meta.streak||0; }
    if(d.visited){ visited.clear(); arr(d.visited).forEach(v=>visited.add(v)); }
    if(d.collection){ for(const k in collection) delete collection[k]; Object.assign(collection,d.collection||{}); }
    if(d.achieved){ achieved.clear(); arr(d.achieved).forEach(a=>achieved.add(a)); }
    if(d.disabled){ disabledScenes.clear(); arr(d.disabled).forEach(x=>disabledScenes.add(x)); }
    if(d.outfit!=null) outfit=d.outfit;
    if(d.settings) Object.assign(settings,d.settings);
    if(d.gallery){ gallery.length=0; arr(d.gallery).forEach(g=>gallery.push(g)); }
    if(d.cutscenesSeen&&typeof seenCutscenes!=='undefined'){ for(const k in seenCutscenes) delete seenCutscenes[k]; Object.assign(seenCutscenes,d.cutscenesSeen); }
    // mirror to localStorage
    save(); saveMeta(); saveVisited(); saveCollection(); saveAchieved();
    if(typeof saveDisabled==='function') saveDisabled();
    if(typeof saveOutfit==='function') saveOutfit();
    if(typeof saveSettings==='function') saveSettings();
    if(typeof saveGallery==='function') saveGallery();
    if(typeof saveSeenCutscenes==='function') saveSeenCutscenes();
    refreshHUD(); updateDaysChip();
  }

  /* ── periodic sync ───────────────────────────────────────── */
  function startSync(){ stopSync(); syncTimer=setInterval(sync,30000); }
  function stopSync(){ if(syncTimer){clearInterval(syncTimer);syncTimer=null;} }
  window.addEventListener('beforeunload',sync);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) sync(); });

  /* ── email link return ───────────────────────────────────── */
  if(fbAuth.isSignInWithEmailLink(window.location.href)){
    let email=localStorage.getItem('bpetEmailForSignIn');
    if(!email) email=window.prompt('Enter your email to confirm sign-in');
    if(email) fbAuth.signInWithEmailLink(email,window.location.href)
      .then(()=>{ localStorage.removeItem('bpetEmailForSignIn'); window.history.replaceState(null,'',window.location.pathname); })
      .catch(e=>console.error('email link',e));
  }

  /* ── auth state ──────────────────────────────────────────── */
  fbAuth.onAuthStateChanged(async user=>{
    currentUser=user;
    if(user){
      try{
        const snap=await db.ref('birthday/players/'+user.uid).once('value');
        const p=snap.val();
        if(p&&p.name){
          displayName=p.name;
          if(p.data){ applyCloud(p.data); lastHash=JSON.stringify(gather()); }
          else sync();
          startSync(); closeAuth(); closeName();
        } else showName();
      }catch(e){ console.error('auth load',e); }
    } else { displayName=null; stopSync(); lastHash=''; }
    if(typeof buildSettings==='function') buildSettings();
  });

  /* ── login helpers ───────────────────────────────────────── */
  function authErr(msg){ const el=$('authError'); if(el) el.textContent=msg||''; }

  function googleLogin(){ fbAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(e=>authErr(e.message)); }

  function emailLogin(){
    const email=($('authEmail')||{}).value?.trim();
    if(!email) return authErr('Enter your email');
    if(isLink){
      fbAuth.sendSignInLinkToEmail(email,{url:window.location.origin+window.location.pathname,handleCodeInApp:true})
        .then(()=>{ localStorage.setItem('bpetEmailForSignIn',email); const s=$('authLinkSent'); if(s) s.style.display=''; authErr(''); })
        .catch(e=>authErr(e.message));
      return;
    }
    const pw=($('authPassword')||{}).value;
    if(!pw) return authErr('Enter your password');
    if(isSignUp) fbAuth.createUserWithEmailAndPassword(email,pw).catch(e=>authErr(e.message));
    else fbAuth.signInWithEmailAndPassword(email,pw).catch(e=>authErr(e.message));
  }

  function toggleMode(){
    isSignUp=!isSignUp;
    const b=$('authSubmit'),t=$('authToggle');
    if(b) b.textContent=isSignUp?'Sign Up':'Sign In';
    if(t) t.textContent=isSignUp?'Already have an account? Sign In':"Don't have an account? Sign Up";
    authErr('');
  }
  function toggleLink(){
    isLink=!isLink;
    const pw=$('authPasswordRow'),b=$('authSubmit'),lt=$('authLinkToggle'),t=$('authToggle'),s=$('authLinkSent');
    if(pw) pw.style.display=isLink?'none':'';
    if(b) b.textContent=isLink?'Send Sign-In Link':(isSignUp?'Sign Up':'Sign In');
    if(lt) lt.textContent=isLink?'Use password instead':'Use email link instead';
    if(t) t.style.display=isLink?'none':'';
    if(s) s.style.display='none';
    authErr('');
  }

  /* ── name picker ─────────────────────────────────────────── */
  async function submitName(){
    const input=$('authNameInput'), err=$('authNameError');
    const name=(input?input.value:'').trim();
    if(!name){ if(err) err.textContent='Enter a name'; return; }
    if(name.length<2){ if(err) err.textContent='At least 2 characters'; return; }
    if(!currentUser){ if(err) err.textContent='Not signed in'; return; }
    const lo=name.toLowerCase();
    const ex=await db.ref('birthday/names/'+lo).once('value');
    if(ex.exists()&&ex.val()!==currentUser.uid){ if(err) err.textContent='Name taken'; return; }
    const old=await db.ref('birthday/players/'+currentUser.uid+'/name').once('value');
    if(old.exists()&&old.val()) await db.ref('birthday/names/'+old.val().toLowerCase()).remove();
    await db.ref('birthday/names/'+lo).set(currentUser.uid);
    await db.ref('birthday/players/'+currentUser.uid+'/name').set(name);
    displayName=name; sync(); startSync(); closeName(); closeAuth();
    if(typeof buildSettings==='function') buildSettings();
  }

  /* ── panels ──────────────────────────────────────────────── */
  function openAuth(){
    isSignUp=false; isLink=false;
    const el=$('authPanel'); if(el) el.classList.remove('hide');
    const e=$('authEmail'); if(e) e.value='';
    const p=$('authPassword'); if(p) p.value='';
    authErr('');
    const pw=$('authPasswordRow'); if(pw) pw.style.display='';
    const b=$('authSubmit'); if(b) b.textContent='Sign In';
    const t=$('authToggle'); if(t){ t.textContent="Don't have an account? Sign Up"; t.style.display=''; }
    const lt=$('authLinkToggle'); if(lt) lt.textContent='Use email link instead';
    const s=$('authLinkSent'); if(s) s.style.display='none';
  }
  function closeAuth(){ const el=$('authPanel'); if(el) el.classList.add('hide'); }
  function showName(){
    const el=$('authNamePanel'); if(el) el.classList.remove('hide');
    const i=$('authNameInput'); if(i) i.value='';
    const e=$('authNameError'); if(e) e.textContent='';
  }
  function closeName(){ const el=$('authNamePanel'); if(el) el.classList.add('hide'); }
  function editName(){
    const el=$('authNamePanel'); if(el) el.classList.remove('hide');
    const i=$('authNameInput'); if(i) i.value=displayName||'';
    const e=$('authNameError'); if(e) e.textContent='';
  }

  /* ── wire UI ─────────────────────────────────────────────── */
  $('authClose')?.addEventListener('click',closeAuth);
  $('authGoogle')?.addEventListener('click',googleLogin);
  $('authSubmit')?.addEventListener('click',emailLogin);
  $('authToggle')?.addEventListener('click',toggleMode);
  $('authLinkToggle')?.addEventListener('click',toggleLink);
  $('authNameSubmit')?.addEventListener('click',submitName);
  $('authPassword')?.addEventListener('keydown',e=>{ if(e.key==='Enter') emailLogin(); });
  $('authEmail')?.addEventListener('keydown',e=>{ if(e.key==='Enter'&&isLink) emailLogin(); });
  $('authNameInput')?.addEventListener('keydown',e=>{ if(e.key==='Enter') submitName(); });

  /* ── leaderboard fetch ────────────────────────────────────── */
  async function fetchLeaderboard(){
    const snap=await db.ref('birthday/leaderboard').once('value');
    if(!snap.exists()) return [];
    const out=[];
    snap.forEach(c=>{ out.push({uid:c.key,...c.val()}); });
    return out;
  }

  /* ── public API ──────────────────────────────────────────── */
  window.BpetAuth={
    get user(){ return currentUser; },
    get uid(){ return currentUser?currentUser.uid:null; },
    get name(){ return displayName; },
    sync, openLogin:openAuth, logout(){ sync(); fbAuth.signOut(); },
    editName, fetchLeaderboard,
    clearCloud(){
      if(!currentUser) return; const uid=currentUser.uid;
      db.ref('birthday/players/'+uid+'/data').remove().catch(()=>{});
      db.ref('birthday/leaderboard/'+uid).remove().catch(()=>{});
      lastHash='';
    },
  };
})();
