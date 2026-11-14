import test from "node:test";
import assert from "node:assert/strict";
import { scoreMission } from "../engine/scoring.js";

test("scores a mission from measured outcomes using all five category caps", () => {
  const score = scoreMission({
    objectiveChecks: [
      { id: "a", label: "Collect sample", achieved: true, weight: 1 },
      { id: "b", label: "Return sample", achieved: false, weight: 1 },
    ],
    engineeringChecks: [
      { id: "a", label: "Thermal envelope", passed: true },
      { id: "b", label: "Power margin", passed: false },
    ],
    resourceUsage: [
      { name: "Fuel", consumed: 20, available: 100, unit: "kg" },
      { name: "Power", consumed: 2, available: 10, unit: "kWh" },
    ],
    communication: { attempted: 4, successful: 3 },
    missionLifetime: { actual: 4, target: 5, unit: "years" },
  });

  assert.deepEqual(
    score.categories.map(({ earned, maximum }) => [earned, maximum]),
    [[15, 30], [12.5, 25], [16, 20], [11.25, 15], [8, 10]],
  );
  assert.equal(score.total, 62.75);
});

test("does not award points for unavailable metrics", () => {
  const score = scoreMission({});
  assert.equal(score.total, 0);
  assert.ok(score.categories.every((category) => category.earned === 0));
  assert.ok(score.categories.every((category) => category.reasons.length > 0));
});

test("caps resource use, communication, and lifetime scores at their maximums", () => {
  const score = scoreMission({
    resourceUsage: [{ name: "Fuel", consumed: 0, available: 5 }],
    communication: { attempted: 3, successful: 3 },
    missionLifetime: { actual: 12, target: 6 },
  });

  assert.equal(score.categories[2].earned, 20);
  assert.equal(score.categories[3].earned, 15);
  assert.equal(score.categories[4].earned, 10);
  assert.ok(score.total <= 100);
});

test("awards exactly 100 points when every scored criterion is fully met", () => {
  const score = scoreMission({
    objectiveChecks: [{ id: "objective", label: "Objective", achieved: true }],
    engineeringChecks: [{ id: "engineering", label: "Engineering", passed: true }],
    resourceUsage: [{ name: "Fuel", consumed: 0, available: 10 }],
    communication: { attempted: 2, successful: 2 },
    missionLifetime: { actual: 10, target: 10 },
  });

  assert.equal(score.total, 100);
});

test("never awards resource points when a resource exceeds its budget", () => {
  const score = scoreMission({
    resourceUsage: [{ name: "Fuel", consumed: 12, available: 10 }],
  });

  assert.equal(score.categories[2].earned, 0);
  assert.match(score.categories[2].reasons[0], /Over budget/);
});

test("rejects a missing simulation result", () => {
  assert.throws(() => scoreMission(null), /simulation result is required/);
});
