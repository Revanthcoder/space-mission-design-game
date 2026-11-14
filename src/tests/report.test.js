import test from "node:test";
import assert from "node:assert/strict";
import { buildMissionReport } from "../results/missionReport.js";

test("builds a report from simulation facts and failed scoring categories", () => {
  const report = buildMissionReport(
    {
      missionName: "Europa Survey",
      objective: "Map a region",
      outcome: "failure",
      resourceUsage: [{ name: "Fuel", consumed: 12, available: 10 }],
      events: [{ name: "Power loss", description: "Array output dropped." }],
    },
    {
      total: 0,
      categories: [
        {
          label: "Resource efficiency",
          earned: 0,
          maximum: 20,
          reasons: ["Fuel: 120.0% of available amount used. Over budget."],
        },
      ],
    },
  );

  assert.equal(report.missionName, "Europa Survey");
  assert.equal(report.outcome, "failure");
  assert.equal(report.resourcesConsumed[0].consumed, 12);
  assert.equal(report.events[0].name, "Power loss");
  assert.match(report.improvementSuggestions[0], /Over budget/);
});
