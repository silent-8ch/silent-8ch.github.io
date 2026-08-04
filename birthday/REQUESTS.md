# Requests inbox → Claude

This is your back-channel to me while I work. Write anything here — feature ideas,
tweaks, bugs, "make her say X", "add a Y scene", questions — and commit it (on its
own is fine). I check this file at the start of every work round, act on whatever's
under **Inbox**, and move each item to **Done** with a short note on what I did.

Format is loose. A dash-bullet per item is easiest. Add `!` at the front for
"do this next / high priority". If something's ambiguous I'll leave it in Inbox
with a **Q:** note asking what you meant, rather than guess.

I only *edit* this file to check items off — I won't rewrite your wording. If we
ever both touch it, I rebase on your version first so your text always wins.

---

## Inbox
<!-- add your requests below this line -->
- ! **Bug: fireflies show on every scene** — The seasonal motes system in `js/extras.js` (section 2, `fxSeasonMotes`) draws summer fireflies as an `EXTRA_DRAWERS` overlay on ALL scenes. Since it's August, the glow particles appear everywhere. Fix: either remove the summer fireflies entirely, make them only appear on outdoor night scenes, or reduce count/alpha drastically so they're barely visible.
- ! **Bug: rainbow shows on every scene** — The joy rainbow in `js/extras.js` (section 8, `fxRainbow`) draws a rainbow arc across the top of every scene whenever `state.fun >= 96`. This triggers after using the draw action. Fix: lower the threshold, reduce opacity further, or make it only appear on outdoor scenes.


## Done
<!-- I'll move handled items here, newest first, with a note + commit short-sha -->
