# Space Mission Design Game

A React and Vite educational mission-design game. The Member 3 experience includes objective-led spacecraft configuration, fictional educational launch vehicles, orbit selection, launch readiness, countdown, mission stages, random decision events, a mission report, an interactive Three.js view, and an SVG fallback. The 3D view also has decorative bird, bouncing-ball, and rotating-cube animations; these are visual accents, not mission hardware.

## Run locally

```sh
npm install
npm run dev
```

Run the production build and focused mission-rule tests:

```sh
npm run build
npm test
```

## Member 3 structure

- `src/data/missionCatalog.js` — mission objectives, instruments, launch vehicles, orbit descriptions, events, NASA references, and the BioNutrients-2 example targets.
- `src/engine/missionRules.js` — payload/budget/power/compatibility checks and deterministic simulation/event effects.
- `src/components/MissionVisualization.jsx` — interactive 3D mission view with an animated SVG fallback for unavailable WebGL.
- `src/App.jsx` and `src/App.css` — mission design, readiness, countdown, flight, event decisions, telemetry, and report UI.
- `src/tests/missionRules.test.js` — focused validation and simulation tests.

## NASA references and scope

The experience cites NASA's *Design and Develop Science Missions* webinar, *CubeSat 101*, NASA Mission Viz, and NASA's *Build It Yourself: Satellite!* learning game. The BioNutrients-2 example's sample targets shown in the app come from the NASA webinar and are only applied to that scenario. The references and exact links are listed in `src/data/missionCatalog.js` and in the in-app source panel.

Rocket names, payload capacities, prices, mission credits, power budgets, instrument values, transfer paths, mission durations, event outcomes, and scores are configurable educational assumptions, not NASA vehicle specifications or flight dynamics. The mission paths are illustrative and not to scale. The simulation does not claim to model actual NASA operations.

## Member 2 resource-validator handoff

The starter repository did not contain a shared mission interface or Member 2 resource-validation module. The app therefore performs its own visible Member 3 readiness checks and supports an injected synchronous validator through the `App` prop:

```js
resourceValidator(metrics) => [
  { id: "budget", label: "Budget", passed: true, message: "..." },
]
```

Each returned check is included in launch readiness. Wire the actual Member 2 validator into `<App resourceValidator={...} />` once its shared interface is available; do not duplicate or silently replace that system.
