# Codex People and Sprite Handoff

Use this document as context for continuing a custom birthday video-game sprite project.

## Project goal

Create warm, recognizable pixel-art sprites for a birthday game starring Krystal. Maintain a consistent compact cozy-RPG style across all assets.

## Consolidated original-photo reference

- Use `reference-photos.png` as the primary visual source for new character sprites.
- This contact sheet contains the seven original, unaltered photographs: two Krystal references and one each for Luna, Wade, Paul, Luke, and William.
- Base identity and clothing decisions on these original photographs, not on previously generated sprites.
- The contact sheet only resizes the photographs proportionally and adds labels; it does not redraw, retouch, crop, stylize, or otherwise reinterpret the people.
- If a generated sprite conflicts with a photograph, the original photograph always takes precedence.

### Reference priority for future Codex tasks

1. `reference-photos.png` for identity, age, facial features, hair, body proportions, skin tone, and clothing.
2. The original photographs, if they are attached again, when a closer view is needed.
3. Existing generated sprites only for pixel-art style, canvas dimensions, palette, pose, and animation timing.

Do not use generated sprites as the identity source for another generation. They are derivatives and may contain accumulated inaccuracies.

## Established art direction

- Compact retro/cozy RPG pixel art.
- Crisp, chunky pixels with minimal shading and a limited palette.
- Transparent PNG output.
- Krystal's standard outfit is a green Gators swim-team T-shirt, dark forest-green open cardigan/sweater, dusty-mauve ankle-length dress, and brown flip-flops.
- Krystal has light skin, an oval face, large brown eyes, expressive dark eyebrows, and extremely long straight dark-brown hair.
- Current directional walk sheets are 1024 x 1024 (four 256 px cells across and four rows).
- Hug sprites use matching transparent 64 x 96 px canvases.

## People

### Krystal

- Role: wife and main player character.
- Appearance: light skin, oval face, large brown eyes, expressive dark eyebrows, extremely long straight dark-brown hair.
- Standard sprite outfit: green Gators swim-team T-shirt, dark forest-green open cardigan, dusty-mauve long dress, brown flip-flops.
- Reference photos:
  - `codex-clipboard-398165ea-bdb1-4ad4-811e-0095b797326f.png` — primary face reference.
  - `codex-clipboard-25ed5c4e-dd66-4529-b8d6-68ed6110e1dd.png` — body and outfit reference.
- Hug asset: `outputs/birthday-game-sprites/hug-pairs/krystal-left.png`

### Luna

- Role: young woman hugging Krystal.
- Appearance/outfit: shoulder-length straight brown hair, black graphic T-shirt, light-blue knee-length denim shorts, white socks, black combat boots.
- Reference photo: `codex-clipboard-ef94f0e2-3f48-4865-a4d4-fb0c0f80a18c.png`
- Hug asset: `outputs/birthday-game-sprites/hug-pairs/luna-right.png`

### Wade

- Role: teenage boy hugging Krystal.
- Appearance/outfit: short dark hair, blue-green eyes, gray T-shirt, navy shorts, bright red slide sandals.
- Reference photo: `codex-clipboard-0e26fa27-022f-47b8-9d7b-5f1bd5fb4f05.png`
- Hug asset: `outputs/birthday-game-sprites/hug-pairs/wade-right.png`

### Paul

- Role: adult man hugging Krystal.
- Appearance/outfit: short salt-and-pepper hair, full salt-and-pepper beard, pale cat-print T-shirt, light-gray frayed shorts, gray sneakers.
- Reference photo: `codex-clipboard-3b0f289e-86ef-4717-8eab-4190d475c807.png`
- Hug asset: `outputs/birthday-game-sprites/hug-pairs/paul-right.png`

### Luke

- Role: boy in an athletic outfit hugging Krystal.
- Appearance/outfit: tousled brown hair, black sleeveless tank top, black athletic shorts with white stripes, pale-blue sweatshirt tied around waist, white socks, light-blue sneakers.
- Reference photo: `codex-clipboard-a334b03d-6bfc-4f71-a8b9-7a7cd007c9dc.png`
- Hug asset: `outputs/birthday-game-sprites/hug-pairs/luke-right.png`

### William

- Role: younger boy hugging Krystal.
- Appearance/outfit: curly brown hair, oversized black graphic T-shirt, charcoal jeans, bright-blue Crocs.
- Reference photo: `codex-clipboard-0f3d182b-fead-439e-8c1b-33ccd7e63507.png`
- Hug asset: `outputs/birthday-game-sprites/hug-pairs/william-right.png`

## Hug-sprite construction rules

- Krystal stands on the left and faces right.
- The other person stands on the right and faces left.
- Each character is a separate static sprite; movement in the game brings them together.
- Each sprite displays exactly one foreground hugging arm and one foreground hand.
- The rear arm and rear hand must be completely hidden behind that character's torso. No rear fingertips, detached hands, or background hands may appear.
- The visible arm reaches toward the other character at chest height.
- Remove mini-golf clubs, canes, phones, and other handheld objects.
- Align both characters on the same foot baseline and overlap their visible hands/torsos to complete the hug.

## Current walking animations

All walk sheets are transparent 1024 x 1024 PNGs arranged as a strict 4 x 4
grid (256 x 256 per frame). Rows are down, left, right, and up. Every row has
four frames. Frames are automatically centered and pinned to pixel 236 inside
each cell by `tools/process-walk-sprites.swift`; do not hand-adjust them.

- Krystal: `sprites/walking-all/krystal-walk.png` (active player sheet)
- Luna: `sprites/walking-all/luna-walk.png`
- Wade: `sprites/walking-all/wade-walk.png`
- Paul: `sprites/walking-all/paul-walk.png`
- Luke: `sprites/walking-all/luke-walk.png`
- William: `sprites/walking-all/william-walk.png`
- Generation sources are retained beside the processed files as
  `*-walk-source.png`.

To reprocess a source:

```sh
CLANG_MODULE_CACHE_PATH=/tmp/codex-swift-module-cache \
SWIFT_MODULECACHE_PATH=/tmp/codex-swift-module-cache \
swift tools/process-walk-sprites.swift INPUT.png OUTPUT.png
```

## Other Krystal animations

- Eating, item-neutral: `k-eating.png`
- Drawing in an open sketchbook: `k-drawing.png`
- Crying: `k-crying.png`

## Four-frame expression library

Every person has 32 transparent 1024 x 256 sheets under
`sprites/expressions/<name>/`: `laugh`, `scared`, `surprised`, `cheer`, `sad`,
`embarrassed`, `think`, `wave`, `talk`, `nod`, `shake`, `shrug`, `point`,
`beckon`, `search`, `inspect`, `sit`, `give`, `hug`, `highfive`, `look`,
`interact`, `startled`, `sleep`, `run`, `sneak`, `crouch`, `carry`, `push`,
`pull`, `doorway`, and `trip`. Each sheet contains four aligned 256 x 256 cells
with feet pinned to pixel 236. The library contains 192 character sheets.
Generated 4 x 4 source atlases are retained in `sprites/expressions/sources/`.

Use `sprite-lab.html` to preview all expression, walking, and clapping sheets,
change playback speed/mode, scrub frames, and inspect frame boundaries.

## Shared scene sprite renderer

`js/sprite-objects.js` owns future animals, props, scenery, and background people.
It enforces a maximum of four frames per registered sheet and renders in five
ordered phases: `background`, `ground`, depth-sorted `actors`, `foreground`, and
`overlay`. Actor depth defaults to the object's foot `y` coordinate; use an
explicit `depth` only when a scene needs a fixed override.

Register art once with `SpriteRenderer.register(name, config)`, create persistent
scene objects with `SpriteRenderer.create(spec)`, or submit temporary drawables
from a scene renderer with `SpriteRenderer.submit(spec)`. Persistent objects are
automatically filtered to the scene where they were created.

The shared object pack lives in `sprites/objects/` and contains 40 registered
sprites. Its environment set includes trees, flowering bushes, wildflowers,
grass, benches, cafe furniture, signposts, fences, streetlamps, mailboxes, trash
cans, market awnings, doorways, flower windows, pennant flags, and water ripples.
Each environment entry in `js/sprite-object-pack-1.js` carries its intended
`defaultSize`, render `phase`, ground anchor, collision `footprint`, and
`depthOffset`; scenes should use those defaults instead of manually adjusting
the source image dimensions. `SpriteRenderer.getFootprint(object)` returns the
scaled world-space collision rectangle.

Environment sheets are transparent 1024 x 256 PNGs with four aligned 256 px
frames. Their original 4 x 4 generated atlases are retained in
`sprites/objects/sources/environment-*-pack.png`.

The terrain pack in `js/sprite-terrain-pack.js` adds eight full-bleed surface
tiles and eight transparent boundary/traversal strips. Surface rows use four
interchangeable positional variants (`renderMode: 'tile'`, `tileSize: 64`);
shorelines and riverbanks use four animation frames, while static edges use
four positional variants. Original atlases are retained as
`sprites/objects/sources/terrain-*-pack.png`.

All registered sprites support optional cached color tinting. Pass `tint` and
`tintAmount` (0–1) to `SpriteRenderer.create()` or `SpriteRenderer.submit()`;
for example `{sprite:'tree', tint:'#6f86b8', tintAmount:.3}`. Tint intensity is
clamped and quantized to hundredths, and cached by sprite, frame, color, and
amount. Call `SpriteRenderer.clearTintCache()` after a global palette change if
the cached variants are no longer needed.

The static texture library in `sprites/textures/` contains 64 opaque 256 x 256
single-frame assets covering natural ground, paths, floors, walls, roofs,
structural materials, water, rugs, and decorative surfaces. They are registered
by `js/sprite-texture-pack.js` with `cols: 1`, `fps: 0`, tint support, and lazy
loading. Use `SpriteRenderer.preload(name)` only when a scene needs a texture
ready before its first rendered frame. Four original 4 x 4 atlases are retained
under `sprites/textures/sources/`.

## Requested sprite sheets — next generation batch

**Delivered:** all 17 sheets below are processed and registered by
`js/sprite-requested-pack.js`. Final files are in `sprites/requested/`; retained
generation sources are in `sprites/requested/sources/`. Every final sheet is an
exact 1024 x 256 four-cell row and requires no manual partition adjustment.

Priority-ordered by number of scenes impacted. All sheets should be transparent
1024 x 256 PNGs (four 256 x 256 frames) matching the existing art style.
Animated sheets use four sequential frames; static sheets use four positional
variants. Scenes can clip sprites to polygon shapes, so irregular silhouettes
are fine.

### Tier 1 — highest impact

| Name | Description | Frames | Scenes | Notes |
|------|-------------|--------|--------|-------|
| `sky-day` | Blue sky gradient, lightest at bottom | 4 positional variants | 67 | Rect fill, stretched to upper canvas |
| `sky-night` | Dark indigo/navy gradient with subtle depth | 4 variants | 45 | Rect fill, pairs with star-field |
| `sky-sunset` | Warm orange-pink-purple gradient | 4 variants | 8+ | Rect fill |
| `star-field` | Twinkling white/yellow dots on transparent bg | 4 animated frames | 45 | Overlay on night sky, subtle twinkle |
| `water-surface` | Rippling blue water, semi-transparent | 4 animated frames | 21 | Tileable horizontally, rect fill |
| `shelf-counter` | Wooden shelf/counter surface, front-facing | 4 positional variants | 48 | Tileable horizontally, rect clip |
| `window-rect` | Rectangular window pane showing blue/orange sky | 4 variants (day/night/sunset/curtained) | 42 | Rect placement |
| `window-arch` | Arched window variant | 4 variants (day/night/sunset/curtained) | 12 | Polygon clip for arch shape |
| `candle-flame` | Small candle with flickering flame and glow | 4 animated frames | 36 | Alpha-blended, small (defaultSize ~24) |
| `moon-crescent` | Crescent moon with soft radial glow halo | 4 phase variants (new/quarter/half/full) | 25 | Circular clip, transparent bg |
| `mountain-silhouette` | Layered mountain ridgeline, dark tones | 4 positional variants | 15 | Polygon clip, stretch to width, background phase |
| `rock-boulder` | Irregular rock/boulder, earthy tones | 4 size/shape variants | 19 | Polygon clip, ground phase |

### Tier 2 — medium impact

| Name | Description | Frames | Scenes | Notes |
|------|-------------|--------|--------|-------|
| `rug-carpet` | Warm patterned oval/rectangular rug | 4 color/pattern variants | 13 | Ground phase, polygon clip for oval |
| `bed-pillow` | Bed with pillow and blanket, side view | 4 variants (made/messy/occupied/nightstand) | 10 | Ground phase, large (defaultSize ~120) |
| `fog-mist` | Translucent white-gray horizontal mist band | 4 animated drift frames | 10 | Overlay phase, alpha 0.15-0.3, tileable |
| `boat-hull` | Small wooden boat/canoe on water | 4 variants (rowboat/sailboat/canoe/kayak) | 8 | Actors phase, polygon clip |
| `curtain-drape` | Hanging fabric curtain from top edge | 4 color variants | 7 | Foreground phase, polygon clip |

### Art direction for these sheets

- Match the compact cozy-RPG pixel style of existing sprites.
- Skies and water should have visible chunky pixels, not smooth gradients — the
  charm is in the pixel texture.
- Rocks and mountains should have defined dark outlines with 2-3 tone shading.
- Candle flame should glow warmly with a soft radial halo (drawn into the frame,
  not relying on canvas effects).
- Moon glow should be baked into the sprite as concentric semi-transparent rings.
- Window panes should show a simple interior/exterior gradient with mullion
  cross-bars.
- All sheets must have transparent backgrounds (except sky sheets, which are
  opaque fills).

The modular architecture library in `sprites/architecture/` contains 48
transparent, aligned 256 x 256 single-frame pieces: building shells, doors,
windows, gates, foreground occlusion overlays, bridges, gazebos, and other small
structures. `js/sprite-architecture-pack.js` registers intended size, phase,
collision footprint, tint support, and lazy loading. Foreground pieces are
already assigned to the `foreground` phase. Original 4 x 4 atlases are retained
under `sprites/architecture/sources/`.

## Important continuation notes

- When prompting image generation, attach `reference-photos.png` and identify each named panel explicitly.
- Use generated assets as style references only; never substitute them for original photographic identity references.
- Preserve each person's age, build, hairstyle, and pictured outfit.
- Favor recognizable silhouette and hair over excessive facial detail at low resolution.
- Keep all new sprites visually consistent with the existing compact assets.
- The eating animation intentionally contains no food or utensil so items can be overlaid later.
- The individual temporary `codex-clipboard-...` paths are not present in this repository; use the consolidated contact sheet or attach originals again for closer detail.
