# Parallax Handoff

## Current state

- Entry point: `parallax/index.html`
- Runs as a standalone, full-screen canvas scene.
- Paul walks in place while eight landscape layers move at different speeds.
- The scene uses procedural artwork when image assets are unavailable.
- There are currently no files in `parallax/assets/`, so all layers use their procedural fallbacks.

## Run locally

Serve the repository over HTTP, then open `/parallax/` in a browser. Do not open the HTML file directly because browser asset rules can differ for `file://` pages.

## Layer order

Back to front:

1. `mountains` — 0.05x
2. `hills` — 0.10x
3. `skyline` — 0.18x
4. `industrial` — 0.28x
5. `suburbs` — 0.40x
6. `farms` — 0.55x
7. `trees` — 0.75x
8. `forest` — 1.00x

The base walking speed is `60px/s`. Layer placement and speed are configured in `LAYER_DEFS` near the top of `index.html`.

## Asset handoff

Artwork requirements and prompts are in `ASSET_GUIDE.md`.

- Put files in `parallax/assets/`.
- Name them `{layer}_1.png`, `{layer}_2.png`, and `{layer}_3.png`.
- Expected size: 2048 x 512 PNG.
- Keep lighting, horizon, and color temperature consistent between every layer.
- All layers except `mountains` should have transparent sky areas.

The loader currently requests three variants for every layer. Missing variants fail silently, and the layer falls back to procedural drawing only when none of its variants load.

## Character

- Sheet: `birthday/sprites/walking-all/paul-walk.png`
- Frame size: 256 x 256
- Animation: row 2, four frames, 10 FPS
- Display height: 22% of the viewport
- Ground line: 88% of the viewport

## Known gaps

- Add and visually tune the final landscape assets.
- Verify transitions between unlike image variants; the current edge blend is provisional.
- Add pause/resume handling when the page is hidden.
- Add reduced-motion behavior for accessibility.
- Test narrow mobile screens and high-DPI displays with final assets.
- Decide where the main site should link into the standalone scene.

## Acceptance check

- No visible gap appears between repeated tiles.
- Adjacent variants do not flash or jump at their seam.
- Distant layers move noticeably slower than foreground layers.
- The character's feet remain aligned with the ground.
- Resize and orientation changes do not stretch or clear the scene.
- The procedural scene still works when all optional landscape assets are absent.
