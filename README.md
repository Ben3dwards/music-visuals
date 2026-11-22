# Music Visuals
 
A browser based 3D scene builder that reacts to music in real time. Build a scene of shapes, models, spectrum visualisers, smoke, lights and cameras, connect them to the music. For DJ sets, streams or just watching music.


---
## Features
 
### Audio reactive
- **Live audio capture** from your computer's sound
- **Frequency analysis** into sub bass, mid bass, mids, highs and snare bands
- **Kick and snare detection** using adaptive thresholds
- **Reactions:** any visual property can be driven by any band or by kick/snare hits, with adjustable amount.

### Scene builder
- **Add items** from the bottom bar: cubes, spheres, imported `.glb` models, spectrum visualisers, smoke, lights and cameras
- **Select** by clicking in the scene or in the outliner
- **Gizmos** to move, rotate and scale (`W` / `E` / `R`)
- **Attach** spectrums, smoke, lights and cameras to an object so they follow it
- **Reset** any section or object back to its defaults

### Visuals
- **Shapes and models** with glow or lit finishes, borders, per object bloom and per axis music reactions
- **Spectrum visualiser:** a mirrored ring and/or a scrolling 3D grid with depth fade
- **Smoke:** particle clouds that thicken with the sub bass and burst outward on kicks and snares, with wind modes
- **Lights:** point, directional and spot lights with colour, brightness and music driven flashes
- **Backgrounds:** solid colour or 360° panoramas, including your own uploads
- **Wormhole mode:** a seeded, shader drawn tunnel around the whole scene.

### Performing
- **Cameras:** place shots in the scene
- **Preview** the audience's view without leaving the editor
- **Perform mode:** fullscreen, UI hidden, `Esc` to exit

## Tech stack
 
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Babylon.js](https://www.babylonjs.com/) — 3D rendering, particles, post processing
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vite.dev/)
- Web Audio API (`AnalyserNode`) for frequency analysis
- GLSL shaders for the wormhole tunnel and warp
 
---

## How to use
 
1. Click **Enable audio**. On Windows, choose **Entire screen** and tick **Also share system audio**. On a Mac, share a Chrome tab that's playing music. Then play something.
2. Add items with the **+** buttons along the bottom.
3. Click an item (or its name in the list on the left) to select and edit it in the panel on the right.
4. Click empty space to see the scene settings: lighting, camera, background and wormhole.
5. Add a **Camera** to set the audience's view, and use **Preview** to check it.
6. Click **Perform** to go fullscreen. Press **Esc** to come back.


### Shortcuts
 
| Key | Action |
| --- | --- |
| `W` / `E` / `R` | Move / rotate / scale the selected item |
| `Delete` | Remove the selected item |
| `Esc` | Leave Perform mode |
| Drag | Orbit the view |
| Scroll | Zoom |
| Double click (in the list) | Rename |
 
---
## Browser support
 
Capturing your computer's audio works best in **Chrome** or **Edge** on Windows.
 
---

## Credits
 
- Star background: [Solar System Scope](https://www.solarsystemscope.com/textures/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
