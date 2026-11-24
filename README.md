# First Adventure: Tokyo — Laila & Salma

A 3D Studio Ghibli–inspired browser adventure game built with Three.js where Laila and Salma explore a cozy Tokyo neighborhood.

## Features

- **Explore Tokyo**: Walk and run through Main Street, Sakura Elementary, Ichiban Ramen, Harajuku Kiosk, Gachapon Capsule Machine, Tokyo Drink & Snack Machine, and Laila & Salma's Room.
- **Activities & Collectibles**:
  - Take quizzes at Sakura Elementary to earn XP and coins
  - Order ramen at Ichiban Ramen
  - Unlock outfits & hats at the Harajuku Kiosk
  - Collect capsule toys from the Gachapon machine
  - Find hidden neighborhood cats and play with Mochi the Shiba Inu
  - Customize Laila & Salma's Room with walls, beanbags, and posters

## Project Structure

- `index.html` — Game shell, HUD, and modals
- `style.css` — Parchment UI styling and responsive/mobile controls
- `js/state.js` — Game state, localStorage persistence, XP/coins, timers, and audio
- `js/textures.js` — Procedural textures, character faces, and cel-shading
- `js/world.js` — 3D Tokyo neighborhood, buildings, and landmarks
- `js/characters.js` — Laila, Salma, NPCs, Mochi the Shiba Inu, and props
- `js/gameplay.js` — Quizzes, shops, ramen menu, gachapon, room customization, and interactions
- `js/main.js` — Three.js loop, controls, camera, minimap, and error guard

## Playing Locally

Serve the directory with any static HTTP server (or open `index.html` in a browser):

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
