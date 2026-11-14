# Space Mission Design Game

A React and Vite starter for the space mission design game.

## Getting started

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, or preview it locally with
`npm run preview`.

Run the scoring, report, and LocalStorage tests with `npm test`.

## Project structure

- `public/assets/` — static assets served as-is
- `src/components/` — reusable UI components
- `src/pages/` — application pages
- `src/engine/` — mission simulation and game logic
- `src/results/` — mission result handling and presentation
- `src/services/` — external service integrations
- `src/visualization/` — mission visualizations
- `src/store/` — shared application state
- `src/data/` — shared mission data
- `src/tests/` — tests
- `src/types/mission.d.ts` — shared mission/result TypeScript contracts
- `supabase/schema.sql` — Supabase database schema

## Results module (Member 4)

Mission drafts, completed results, saved reports, and team assignments are stored
in browser LocalStorage. The history and leaderboards are device-local, not
shared between players. Stored data is versioned; malformed data and storage
failures are shown rather than silently discarded.

The simulation engine can hand off a completed result as JSON from Mission
Planning. The shared `MissionSimulationResult` contract is in
`src/types/mission.d.ts`. Its scoring fields are:

- `objectiveChecks`: measured objective checks with optional positive weights
- `engineeringChecks`: measured engineering checks with optional positive weights
- `resourceUsage`: consumed and available amounts per named resource
- `communication`: attempted and successful transmissions
- `missionLifetime`: actual and target lifetime
- Optional mission configuration, scientific value, events, player, and team

Scoring awards at most 30/25/20/15/10 points respectively. Missing or invalid
measurements earn no points. Resource efficiency averages each resource's
consumption ratio (without adding unlike units); communication and lifetime
credit are proportional and capped at their category maximum. Success/failure
comes from the simulation result and is not inferred from the score.

Mission reports can be saved locally and exported as JSON. Team mode supports
the four mission roles on one device. An optional Supabase adapter is provided
for an initialized Supabase client, with user-scoped result table policies in
`supabase/schema.sql`; cloud sync and Realtime are not enabled by default.