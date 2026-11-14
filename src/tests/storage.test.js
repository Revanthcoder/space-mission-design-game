import test, { after, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  deleteMissionDraft,
  deleteMissionResult,
  getTeam,
  listMissionDrafts,
  listMissionReports,
  listMissionResults,
  listPlayerProgress,
  saveMissionDraft,
  saveMissionReport,
  saveMissionResult,
  saveTeam,
} from "../services/localStorage.js";
import { recordSimulationResult } from "../services/missionResults.js";

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
const values = new Map();

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  },
});

afterEach(() => values.clear());
after(() => {
  if (originalStorage) {
    Object.defineProperty(globalThis, "localStorage", originalStorage);
  } else {
    delete globalThis.localStorage;
  }
});

test("saves, updates, loads, and deletes mission drafts", () => {
  const first = saveMissionDraft({ name: "Europa", objective: "Survey ice" });
  const updated = saveMissionDraft({
    id: first.id,
    name: "Europa Survey",
    objective: "Survey surface ice",
  });

  assert.equal(listMissionDrafts().length, 1);
  assert.equal(listMissionDrafts()[0].name, "Europa Survey");
  assert.notEqual(updated.updatedAt, undefined);
  assert.equal(deleteMissionDraft(first.id), true);
  assert.deepEqual(listMissionDrafts(), []);
});

test("stores completed results, derives player progress, and deletes results", () => {
  saveMissionResult(
    {
      missionId: "survey",
      missionName: "Survey",
      objective: "Survey target",
      outcome: "success",
      playerName: "Ari",
    },
    { total: 72, categories: [] },
  );
  saveMissionResult(
    {
      missionId: "relay",
      missionName: "Relay",
      objective: "Deploy relay",
      outcome: "failure",
      playerName: "Ari",
    },
    { total: 43, categories: [] },
  );

  assert.equal(listMissionResults().length, 2);
  assert.deepEqual(listPlayerProgress(), [
    {
      playerName: "Ari",
      completedMissions: 2,
      highestScore: 72,
      updatedAt: listMissionResults()[0].savedAt,
    },
  ]);
  assert.equal(deleteMissionResult(listMissionResults()[0].id), true);
  assert.equal(listMissionResults().length, 1);
});

test("requires completed outcome and a valid score to save a result", () => {
  assert.throws(
    () =>
      saveMissionResult(
        {
          missionId: "unfinished",
          missionName: "Unfinished",
          objective: "No outcome yet",
          outcome: "incomplete",
        },
        { total: 0, categories: [] },
      ),
    /completed result/,
  );
  assert.throws(
    () =>
      saveMissionResult(
        {
          missionId: "bad-score",
          missionName: "Bad score",
          objective: "Test validation",
          outcome: "success",
        },
        { total: "high", categories: [] },
      ),
    /valid score breakdown/,
  );
});

test("records simulation output through the engine-facing integration service", () => {
  const saved = recordSimulationResult({
    missionId: "engine-42",
    missionName: "Engine handoff",
    objective: "Verify engine integration",
    outcome: "success",
    objectiveChecks: [{ id: "objective-1", label: "Objective", achieved: true }],
  });

  assert.equal(saved.result.missionId, "engine-42");
  assert.equal(saved.score.categories[0].earned, 30);
  assert.equal(listMissionResults().length, 1);
});

test("saves team assignments and mission reports", () => {
  saveTeam([{ name: "Ari", role: "Mission Commander" }]);
  assert.equal(getTeam()[0].name, "Ari");
  assert.throws(
    () =>
      saveTeam([
        { name: "Ari", role: "Mission Commander" },
        { name: "Sam", role: "Mission Commander" },
      ]),
    /at most one participant per role/,
  );

  const saved = saveMissionReport("record-1", { missionName: "Survey" });
  assert.equal(listMissionReports()[0].id, saved.id);
});

test("supports a team of up to four unique mission roles", () => {
  const team = [
    { name: "Commander", role: "Mission Commander" },
    { name: "Engineer", role: "Spacecraft Engineer" },
    { name: "Scientist", role: "Science Specialist" },
    { name: "Manager", role: "Resource Manager" },
  ];
  assert.deepEqual(saveTeam(team), team);
  assert.equal(getTeam().length, 4);
  assert.deepEqual(saveTeam([]), []);
});

test("reports invalid stored JSON rather than silently replacing it", () => {
  values.set("mission-control:v1:drafts", "{bad json");
  assert.throws(() => listMissionDrafts(), /Saved data is invalid/);
});
