/* extras: add-on features  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */
/*
  This file is the home for new self-contained features. It loads after everything
  except main.js (boot), so all core globals/functions are available.

  Extension points (defined in engine.js), so features never need to edit the core loop:
    EXTRA_UPDATERS.push(fn)  // fn(dt) runs every frame
    EXTRA_DRAWERS.push(fn)   // fn() draws over the scene every frame (canvas ctx, W×H)
    EXTRA_TAPS.push(fn)      // fn(px,py) on a stage tap; return true to consume it

  Handy globals: pet, state, clamp, pick, rand, say, hearts, burst, fxAt, sfx,
  showToast, isNight, currentHour, SCENES, currentScene, refreshHUD, save.
  Keep each feature additive and low-risk. Warm, personal tone (a gift for Krystal, from Paul).
*/
