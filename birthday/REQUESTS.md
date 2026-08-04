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
- **Content focus: interactivity** — clicking things in the scenes should have lots of unique responses — at least text reactions, ideally effects too. Every scene should have several clickable objects/elements with their own responses. Make scenes feel alive and reactive, not just backdrops.
  - _(in progress — Claude: content thread is building a per-scene tap-hotspot system — region-based reactions everywhere + hand-authored object spots filling in over rounds; big ongoing job)_

  _(Note: "Add 10 magic scenes" reappeared here but was already completed in rounds 11–12 — see Done. If you actually want 10 MORE, say so and I'll add them.)_

## Done
<!-- I'll move handled items here, newest first, with a note + commit short-sha -->
- ✅ **Drawing journal feature** — *Done:* she now keeps a diary — open it from the 📖 tab on the left edge of the stage. It auto-writes warm dated entries in her voice for the moments that matter (first-time visits to places, days-together milestones, hugs, achievements) and tucks in the actual pictures you draw together on the pad. Self-contained (`js/journal.js`), persists in localStorage.
- ✅ **Add 10 magic and mysticism related rooms/scenes** — *Done:* added 10 new magic/mysticism scenes across two rounds — Wizard Tower, Fortune Teller Parlor, Rune Circle, Arcane Library, Fairy Ring, Alchemy Lab, Witch's Cottage, Moon Temple, Will-o'-Wisp Marsh, Enchanted Mirror Hall. Each has tap-interactions + themed collectibles, and there are new magic features too (spell orb, flip-a-tarot-card, stargaze telescope). That's 16 magic-themed scenes in all.
- ✅ **Bug: rainbow shows on every scene** — *Fixed:* now daytime-only (gated on `!isNight()`), threshold raised `fun>=96` → `fun>=99` so a single draw rarely triggers it, and opacity cut roughly in half (`0.16` → `0.08` per band). It no longer appears at night/indoor-evening scenes and is barely-there when it does.
- ✅ **Bug: fireflies show on every scene** — *Fixed:* summer fireflies are now night-only (they don't draw at all in daylight — so they're gone during the day in August) and drastically reduced (count `8`→`4`, alpha `0.7`→`0.26`). At night a few faint ones remain. Say the word if you'd rather remove them entirely.
