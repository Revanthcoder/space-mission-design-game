import test from "node:test";
import assert from "node:assert/strict";
import { validateSimulationResult } from "../services/missionValidation.js";

const validResult = {
  missionId: "mission-1",
  missionName: "Survey",
  objective: "Map the target",
  outcome: "success",
};

test("accepts a valid result with optional metrics omitted", () => {
  assert.equal(validateSimulationResult(validResult), validResult);
});

test("rejects malformed event and resource collections before they reach the dashboard", () => {
  assert.throws(
    () => validateSimulationResult({ ...validResult, events: "none" }),
    /events must be an array/,
  );
  assert.throws(
    () => validateSimulationResult({ ...validResult, resourceUsage: [null] }),
    /resourceUsage must be an array/,
  );
});

test("rejects duplicate or excessive team role assignments in results", () => {
  assert.throws(
    () =>
      validateSimulationResult({
        ...validResult,
        participants: [
          { name: "One", role: "Mission Commander" },
          { name: "Two", role: "Mission Commander" },
        ],
      }),
    /unique mission roles/,
  );
});
