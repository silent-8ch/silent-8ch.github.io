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

## Important continuation notes

- When prompting image generation, attach `reference-photos.png` and identify each named panel explicitly.
- Use generated assets as style references only; never substitute them for original photographic identity references.
- Preserve each person's age, build, hairstyle, and pictured outfit.
- Favor recognizable silhouette and hair over excessive facial detail at low resolution.
- Keep all new sprites visually consistent with the existing compact assets.
- The eating animation intentionally contains no food or utensil so items can be overlaid later.
- The individual temporary `codex-clipboard-...` paths are not present in this repository; use the consolidated contact sheet or attach originals again for closer detail.
