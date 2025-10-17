# ASU — Campus Wayfinder

A lightweight React (Vite) app to help ASU students find cafeterias, playrooms, and lecture rooms on a campus map.

## Features
- Upload or replace campus map image (`/public/asu-campus-map.jpg`)
- Add / edit / remove points of interest (in Admin mode)
- Search, filter by category, and class/room lookup
- Export/import POIs as JSON
- English-only, ASU-branded (logo included)

## How to use locally
1. Install Node (>=16) and npm.
2. In the project folder, run:
```bash
npm install
npm run dev
```
3. Open the URL shown by Vite (usually http://localhost:5173).

## Deploy to Vercel
1. Sign in to Vercel and create a new project from this repository.
2. The default build command (`npm run build`) and output directory (`dist`) will work.
3. Alternatively, drag-and-drop the project folder into Vercel's dashboard.

## Notes
- Replace `/public/asu-campus-map.jpg` with your official campus map image (same filename) for the map to appear.
- The app stores POIs in the browser's localStorage. Use Export to back up.

