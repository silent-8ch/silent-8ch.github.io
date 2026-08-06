# Parallax Walk — Image Asset Guide

## Overview

The scene is an infinite side-scrolling parallax landscape viewed at eye level, golden hour lighting. A pixel-art character walks right in the foreground. Behind him, 8 photorealistic layers scroll at different speeds to create depth — from dense forest in front to distant mountains in back.

All layers must share **consistent lighting, horizon line, and color temperature** so they composite into a single cohesive scene.

---

## Global Rules

- **Lighting:** Golden hour, sun low on the right. Warm highlights, long shadows cast left.
- **Perspective:** Side view, camera at eye level (~5.5ft). No dramatic angles.
- **Horizon line:** Roughly 30% from the top of the image. Keep consistent across all layers.
- **Color temperature:** Warm overall. Distant layers shift cooler/hazier (atmospheric perspective).
- **Format:** PNG, transparent background (except mountains which include sky).
- **Dimensions:** 2048 × 512 px (4:1 aspect ratio).
- **Tiling:** Images do NOT need to tile seamlessly. The engine crossfades between tiles. But avoid hard visual elements (buildings, large trees) at the left and right edges — keep edges relatively neutral so crossfades look natural.
- **Naming:** `parallax/assets/{layer}_{n}.png` — e.g. `mountains_1.png`, `mountains_2.png`
- **Variants:** 2–3 per layer to start. More = less repetition.

---

## Layer Specifications (back to front)

### 1. mountains (slowest — barely moves)
**Scroll speed:** 5% of walk speed
**Vertical placement:** Top 10–65% of canvas
**Content:** Distant mountain range, snow-capped peaks, hazy blue-purple tones. Should feel far away — low contrast, atmospheric haze, desaturated.
**Transparency:** None — this is the backmost layer. Include sky gradient (deep indigo at top → warm gold near horizon) or match the engine's sky.
**Prompt seed:**
> Photorealistic distant mountain range, snow-capped peaks, golden hour, heavy atmospheric haze, blue-purple tones, desaturated, panoramic side view, horizon at 30% from top, warm sky gradient from deep indigo to amber gold, cinematic landscape photography, 2048x512

### 2. hills
**Scroll speed:** 10%
**Vertical placement:** 25–75% of canvas
**Content:** Rolling green hills, grassland, scattered wildflowers. Mid-distance, slight haze but more saturated than mountains. Gentle undulating silhouette along the top edge.
**Transparency:** Transparent above the hilltops. Solid from hilltops down.
**Prompt seed:**
> Photorealistic rolling green hills, gentle undulating terrain, scattered wildflowers, golden hour side light, slight atmospheric haze, mid-distance landscape, transparent sky above hilltops, panoramic side view, 2048x512, PNG with transparency

### 3. skyline
**Scroll speed:** 18%
**Vertical placement:** 30–80% of canvas
**Content:** City skyline — varied building heights, glass towers, some older brick buildings. Backlit by golden hour, windows catching light. Silhouetted but with enough detail to read as a real city.
**Transparency:** Transparent above rooftops.
**Prompt seed:**
> Photorealistic city skyline silhouette, varied skyscrapers and buildings, golden hour backlighting, windows catching warm light, some architectural detail visible, panoramic side view, transparent sky above buildings, 2048x512, PNG with transparency

### 4. industrial
**Scroll speed:** 28%
**Vertical placement:** 35–85% of canvas
**Content:** Industrial zone — warehouses, smokestacks, water towers, power lines, cranes. Grittier textures, metal and concrete. Some warm light on surfaces.
**Transparency:** Transparent above structures.
**Prompt seed:**
> Photorealistic industrial zone side view, warehouses, smokestacks, water towers, power lines, cranes, corrugated metal buildings, golden hour warm light on surfaces, gritty textures, transparent sky above structures, 2048x512, PNG with transparency

### 5. suburbs
**Scroll speed:** 40%
**Vertical placement:** 40–88% of canvas
**Content:** Suburban neighborhood — single/two-story houses with pitched roofs, front yards, picket fences, mailboxes, the occasional tree in a yard. Warm and inviting.
**Transparency:** Transparent above rooftops.
**Prompt seed:**
> Photorealistic suburban neighborhood side view, houses with pitched roofs, front yards with grass, picket fences, mailboxes, warm golden hour lighting, residential street, cozy Americana, transparent sky above rooftops, 2048x512, PNG with transparency

### 6. farms
**Scroll speed:** 55%
**Vertical placement:** 48–93% of canvas
**Content:** Farmland — crop rows, barns, silos, wooden fences, hay bales. Rich earth tones and greens. Crops at varying heights.
**Transparency:** Transparent above the tallest elements (silos, barn roofs).
**Prompt seed:**
> Photorealistic farmland side view, crop rows, red barn, grain silo, wooden post fence, hay bales, rich earth tones, golden hour warm light, rural agricultural landscape, transparent background above structures, 2048x512, PNG with transparency

### 7. trees
**Scroll speed:** 75%
**Vertical placement:** 55–97% of canvas
**Content:** Row of large deciduous trees — oaks, maples. Full canopies, dappled light through leaves. Trunks visible. Some variety in species and size.
**Transparency:** Transparent between and above canopies. This layer should have gaps you can see through.
**Prompt seed:**
> Photorealistic row of large deciduous trees side view, oaks and maples, full green canopies, visible trunks, dappled golden hour light through leaves, varied tree sizes, transparent gaps between trees, 2048x512, PNG with transparency

### 8. forest (fastest — closest to camera)
**Scroll speed:** 100% (matches character walk)
**Vertical placement:** 62–100% of canvas
**Content:** Dense forest edge — close-up tree trunks, ferns, undergrowth, moss. Dark and rich. Partially obscures the view like looking through the edge of a woods. Should have significant transparent gaps so the layers behind are visible.
**Transparency:** Lots of it — this is a foreground frame. Think tree trunks as vertical columns with foliage between, leaving large open areas.
**Prompt seed:**
> Photorealistic dense forest edge foreground, close-up tree trunks, ferns and undergrowth, moss on bark, dark rich greens and browns, golden hour light filtering through, side view, significant transparent gaps between trees to see through, foreground framing element, 2048x512, PNG with transparency

---

## Variant Guidelines

Each layer needs 2–3 variants. Variants should:

- **Keep the same general composition** — horizon height, density, lighting angle
- **Vary the specific content** — different buildings, different tree shapes, different hill contours
- **Maintain consistent color/tone** — all variants of a layer should match so crossfades are invisible

Example: `skyline_1.png` might feature a downtown cluster, `skyline_2.png` a more spread-out midrise area, `skyline_3.png` a mixed residential/commercial zone. Same lighting, same vertical placement, different buildings.

---

## Checklist Before Dropping Assets In

- [ ] All images are 2048 × 512 px
- [ ] All except mountains have transparent backgrounds (PNG-24)
- [ ] Edges are neutral (no hard elements at left/right margins)
- [ ] Horizon line consistent across all layers (~30% from top)
- [ ] Lighting direction consistent (sun low-right, golden hour)
- [ ] Distant layers are hazier/cooler, near layers are sharper/warmer
- [ ] Files named `{layer}_{1,2,3}.png` and placed in `parallax/assets/`
