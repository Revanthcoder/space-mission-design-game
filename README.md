# Space Mission Design Game

A React and Vite educational mission-design game. The spacecraft builder and Member 3 mission simulator are available from the same app: use **Mission simulator** in the builder header to enter the simulator, then **Spacecraft builder** to return. The simulator includes objective-led configuration, fictional educational launch vehicles, orbit selection, launch readiness, countdown, mission stages, random decision events, a mission report, an interactive Three.js view, and an SVG fallback. The 3D view also has decorative bird, bouncing-ball, and rotating-cube animations; these are visual accents, not mission hardware.

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

## Spacecraft builder

- `src/pages/SpacecraftBuilder.jsx` — component assembly, destination selection, and engineering campaign UI.
- `src/data/spacecraftData.js` and `src/engine/resourceCalculations.js` — component specifications and the builder's mass, budget, power, battery, reliability, and required-system checks.
- `src/components/` — builder panels, NASA 3D asset previews, and spacecraft/planet visualizations.

## NASA references and scope

The experience cites NASA's *Design and Develop Science Missions* webinar, *CubeSat 101*, NASA Mission Viz, and NASA's *Build It Yourself: Satellite!* learning game. The BioNutrients-2 example's sample targets shown in the app come from the NASA webinar and are only applied to that scenario. The references and exact links are listed in `src/data/missionCatalog.js` and in the in-app source panel.

Rocket names, payload capacities, prices, mission credits, power budgets, instrument values, transfer paths, mission durations, event outcomes, and scores are configurable educational assumptions, not NASA vehicle specifications or flight dynamics. The mission paths are illustrative and not to scale. The simulation does not claim to model actual NASA operations.

## Resource-validation integration

The spacecraft builder uses `resourceCalculations.js` directly with its component-based mission data. The Member 3 simulator retains its visible readiness checks and supports an injected synchronous adapter through the `App` prop:

```js
resourceValidator(metrics) => [
  { id: "budget", label: "Budget", passed: true, message: "..." },
]
```

Each returned check is included in launch readiness. The two modules currently have different input shapes, so an adapter is needed before passing builder validation into the simulator; do not treat the builder's mission-level component checks as if they were already wired to the simulator.
