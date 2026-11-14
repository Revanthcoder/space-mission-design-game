import "./App.css";
import { useEffect, useMemo, useState } from "react";
import {
  deleteMissionDraft,
  deleteMissionResult,
  getTeam,
  listMissionDrafts,
  listMissionReports,
  listMissionResults,
  saveMissionDraft,
  saveMissionReport,
  saveTeam,
} from "./services/localStorage.js";
import { recordSimulationResult } from "./services/missionResults.js";
import ResultsDashboard from "./results/ResultsDashboard.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import {
  buildMissionReport,
  downloadMissionReport,
} from "./results/missionReport.js";

const TABS = [
  ["missions", "Missions"],
  ["results", "Results"],
  ["history", "History & leaderboard"],
  ["team", "Team"],
];

const EMPTY_DRAFT = {
  id: "",
  name: "",
  objective: "",
  spacecraft: "",
  rocket: "",
  orbit: "",
};

function App() {
  const [storageError, setStorageError] = useState("");
  const [activeTab, setActiveTab] = useState("missions");
  const [drafts, setDrafts] = useState([]);
  const [results, setResults] = useState([]);
  const [reports, setReports] = useState([]);
  const [team, setTeam] = useState([]);
  const [draftForm, setDraftForm] = useState(EMPTY_DRAFT);
  const [draftMessage, setDraftMessage] = useState("");
  const [simulationJson, setSimulationJson] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [selectedResultId, setSelectedResultId] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  useEffect(() => {
    const errors = [];
    for (const [loader, setter] of [
      [listMissionDrafts, setDrafts],
      [listMissionResults, setResults],
      [listMissionReports, setReports],
      [getTeam, setTeam],
    ]) {
      try {
        setter(loader());
      } catch (error) {
        errors.push(error.message);
      }
    }
    if (errors.length > 0) setStorageError(errors.join(" "));
  }, []);

  const selectedRecord = useMemo(
    () => results.find((record) => record.id === selectedResultId) ?? results[0],
    [results, selectedResultId],
  );

  useEffect(() => {
    if (!selectedResultId && results[0]) setSelectedResultId(results[0].id);
  }, [results, selectedResultId]);

  function performStorageAction(action) {
    try {
      action();
      setStorageError("");
    } catch (error) {
      setStorageError(error.message);
    }
  }

  function handleSaveDraft(event) {
    event.preventDefault();
    if (!draftForm.name.trim() || !draftForm.objective.trim()) return;
    performStorageAction(() => {
      const saved = saveMissionDraft(draftForm);
      setDrafts(listMissionDrafts());
      setDraftForm(EMPTY_DRAFT);
      setDraftMessage(`Saved "${saved.name}" to this device.`);
    });
  }

  function handleImportResult(event) {
    event.preventDefault();
    setImportMessage("");
    try {
      const parsed = JSON.parse(simulationJson);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new TypeError("Simulation result JSON must contain an object.");
      }
      if (!Array.isArray(parsed.participants) && team.length > 0) {
        parsed.participants = team;
      }
      parsed.completedAt ??= new Date().toISOString();
      const saved = recordSimulationResult(parsed);
      setResults(listMissionResults());
      setSelectedResultId(saved.id);
      setSimulationJson("");
      setActiveTab("results");
      setImportMessage(
        `Simulation result saved. Score: ${saved.score.total}/100.`,
      );
      setStorageError("");
    } catch (error) {
      setImportMessage(error instanceof SyntaxError
        ? "The simulation result is not valid JSON."
        : error.message);
    }
  }

  function handleDeleteDraft(id) {
    performStorageAction(() => {
      deleteMissionDraft(id);
      setDrafts(listMissionDrafts());
    });
  }

  function handleDeleteResult(id) {
    performStorageAction(() => {
      deleteMissionResult(id);
      setResults(listMissionResults());
      if (selectedResultId === id) setSelectedResultId("");
    });
  }

  function handleSaveReport(record) {
    performStorageAction(() => {
      const report = buildMissionReport(record.result, record.score);
      saveMissionReport(record.id, report);
      setReports(listMissionReports());
      setReportMessage("Report saved on this device.");
    });
  }

  function handleExportReport(record) {
    try {
      downloadMissionReport(buildMissionReport(record.result, record.score));
      setReportMessage("Report downloaded as JSON.");
    } catch (error) {
      setReportMessage(error.message);
    }
  }

  function handleTeamChange(nextTeam) {
    performStorageAction(() => {
      saveTeam(nextTeam);
      setTeam(nextTeam);
    });
  }

  const leaderboard = useMemo(() => {
    const players = new Map();
    const teams = new Map();
    for (const record of results) {
      const { result, score } = record;
      const player = result.playerName?.trim() || "Local player";
      const playerEntry = players.get(player) ?? {
        name: player,
        highestScore: 0,
        completedMissions: 0,
      };
      playerEntry.highestScore = Math.max(playerEntry.highestScore, score.total);
      playerEntry.completedMissions += 1;
      players.set(player, playerEntry);

      const participants = Array.isArray(result.participants)
        ? result.participants
        : [];
      if (participants.length > 0) {
        const teamName = participants.map((participant) => participant.name).join(" · ");
        const teamEntry = teams.get(teamName) ?? {
          name: teamName,
          highestScore: 0,
          completedMissions: 0,
        };
        teamEntry.highestScore = Math.max(teamEntry.highestScore, score.total);
        teamEntry.completedMissions += 1;
        teams.set(teamName, teamEntry);
      }
    }
    const rank = (a, b) =>
      b.highestScore - a.highestScore ||
      b.completedMissions - a.completedMissions;
    return {
      players: [...players.values()].sort(rank),
      teams: [...teams.values()].sort(rank),
    };
  }, [results]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setActiveTab("missions")}>
          <span className="brand-mark" aria-hidden="true">M</span>
          <span><strong>MISSION CONTROL</strong><small>MISSION OPERATIONS</small></span>
        </a>
        <span className="local-indicator"><i /> LOCAL MODE</span>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <p className="sidebar-label">WORKSPACE</p>
          <nav aria-label="Main navigation">
            {TABS.map(([id, label], index) => (
              <button
                className={`nav-item ${activeTab === id ? "active" : ""}`}
                key={id}
                onClick={() => setActiveTab(id)}
              >
                <span className="nav-number">0{index + 1}</span>{label}
                {id === "results" && results.length > 0 && (
                  <span className="nav-count">{results.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="status-dot" />
            <div><strong>All systems ready</strong><small>Saved to this device</small></div>
          </div>
        </aside>

        <section className="content">
          {storageError && (
            <div className="notice error" role="alert">
              <strong>Storage issue</strong> {storageError}
            </div>
          )}

          {activeTab === "missions" && (
            <div className="page">
              <div className="page-heading">
                <div><p className="eyebrow">MISSION WORKSPACE / 01</p><h1>Mission planning</h1>
                  <p className="subtitle">Keep mission configurations on this device, then bring in actual simulation outcomes.</p></div>
              </div>

              <div className="two-column">
                <section className="panel">
                  <div className="panel-heading"><div><p className="eyebrow">CONFIGURATION</p><h2>Save a mission draft</h2></div><span className="panel-icon">✳</span></div>
                  <form className="form-grid" onSubmit={handleSaveDraft}>
                    <label className="field full">Mission name<input value={draftForm.name} onChange={(event) => setDraftForm({ ...draftForm, name: event.target.value })} placeholder="e.g. Europa Survey" required /></label>
                    <label className="field full">Mission objective<textarea value={draftForm.objective} onChange={(event) => setDraftForm({ ...draftForm, objective: event.target.value })} placeholder="Describe the mission goal" rows="3" required /></label>
                    <label className="field">Spacecraft<input value={draftForm.spacecraft} onChange={(event) => setDraftForm({ ...draftForm, spacecraft: event.target.value })} placeholder="Not selected" /></label>
                    <label className="field">Rocket<input value={draftForm.rocket} onChange={(event) => setDraftForm({ ...draftForm, rocket: event.target.value })} placeholder="Not selected" /></label>
                    <label className="field">Orbit<input value={draftForm.orbit} onChange={(event) => setDraftForm({ ...draftForm, orbit: event.target.value })} placeholder="Not selected" /></label>
                    <button className="button primary full" type="submit">{draftForm.id ? "Update mission draft" : "Save mission draft"} <span>→</span></button>
                  </form>
                  {draftMessage && <p className="inline-message" role="status">{draftMessage}</p>}
                </section>

                <section className="panel import-panel">
                  <div className="panel-heading"><div><p className="eyebrow">SIMULATION HANDOFF</p><h2>Record real results</h2></div><span className="panel-icon">↗</span></div>
                  <p className="panel-copy">Paste the completed result JSON from the simulation engine. Scores are computed only from supplied outcome data; missing metrics earn no points.</p>
                  <form onSubmit={handleImportResult}>
                    <label className="field">Simulation result JSON
                      <textarea className="code-input" value={simulationJson} onChange={(event) => setSimulationJson(event.target.value)} placeholder={'{\n  "missionId": "engine-result-id",\n  "missionName": "Mission name",\n  "objective": "Mission objective",\n  "outcome": "success",\n  "objectiveChecks": [],\n  "engineeringChecks": [],\n  "resourceUsage": [],\n  "communication": { "attempted": 0, "successful": 0 },\n  "missionLifetime": { "actual": 0, "target": 0 }\n}'} rows="9" required />
                    </label>
                    <button className="button secondary" type="submit">Score & save result <span>→</span></button>
                  </form>
                  {importMessage && <p className="inline-message" role="status">{importMessage}</p>}
                </section>
              </div>

              <section className="panel drafts-panel">
                <div className="panel-heading"><div><p className="eyebrow">LOCAL STORAGE</p><h2>Saved mission drafts</h2></div><span className="text-count">{drafts.length} SAVED</span></div>
                {drafts.length === 0 ? <p className="empty-copy">No saved drafts yet. Save a configuration to see it here.</p> : (
                  <div className="draft-list">{drafts.map((draft) => (
                    <article className="draft-row" key={draft.id}>
                      <div><strong>{draft.name}</strong><p>{draft.objective}</p><small>{[draft.spacecraft, draft.rocket, draft.orbit].filter(Boolean).join(" · ") || "Configuration details not provided"}</small></div>
                      <div className="row-actions">
                        <button className="button quiet" onClick={() => setDraftForm(draft)}>Edit</button>
                        <button className="button quiet danger-text" onClick={() => handleDeleteDraft(draft.id)}>Delete</button>
                      </div>
                    </article>
                  ))}</div>
                )}
              </section>
            </div>
          )}

          {activeTab === "results" && (
            <div className="page">
              <div className="page-heading">
                <div><p className="eyebrow">MISSION PERFORMANCE / 02</p><h1>Results & reports</h1>
                  <p className="subtitle">Transparent scoring based on the simulation data provided.</p></div>
                {results.length > 0 && <select className="record-select" aria-label="Select mission result" value={selectedRecord?.id ?? ""} onChange={(event) => setSelectedResultId(event.target.value)}>{results.map((record) => <option value={record.id} key={record.id}>{record.result.missionName} · {record.score.total}/100</option>)}</select>}
              </div>
              {selectedRecord ? (
                <>
                  <ResultsDashboard record={selectedRecord} reports={reports} onSaveReport={handleSaveReport} onExportReport={handleExportReport} reportMessage={reportMessage} />
                  <section className="panel saved-reports"><div className="panel-heading"><div><p className="eyebrow">REPORT ARCHIVE</p><h2>Saved reports</h2></div><span className="text-count">{reports.length} SAVED</span></div>
                    {reports.filter((item) => item.recordId === selectedRecord.id).length === 0 ? <p className="empty-copy">Save a report to keep a snapshot of this mission’s results.</p> : reports.filter((item) => item.recordId === selectedRecord.id).map((item) => <div className="report-row" key={item.id}><span>{item.report.missionName} report</span><small>{new Date(item.savedAt).toLocaleString()}</small><button className="button quiet" onClick={() => downloadMissionReport(item.report)}>Export JSON</button></div>)}
                  </section>
                </>
              ) : (
                <section className="empty-state panel"><span className="empty-symbol">◎</span><p className="eyebrow">NO COMPLETED MISSIONS</p><h2>Results appear after a simulation</h2><p>Run a mission in the simulation module, then submit its actual result from Mission Planning. No sample scores are shown here.</p><button className="button primary" onClick={() => setActiveTab("missions")}>Go to mission planning <span>→</span></button></section>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="page">
              <div className="page-heading"><div><p className="eyebrow">MISSION RECORD / 03</p><h1>History & leaderboard</h1><p className="subtitle">Rankings reflect completed missions saved on this device only.</p></div></div>
              <div className="two-column history-columns">
                <Leaderboard title="Individual leaderboard" entries={leaderboard.players} />
                <Leaderboard title="Team leaderboard" entries={leaderboard.teams} emptyText="Team rankings appear when completed results include participants." />
              </div>
              <section className="panel history-panel"><div className="panel-heading"><div><p className="eyebrow">COMPLETED FLIGHTS</p><h2>Mission history</h2></div><span className="text-count">{results.length} MISSIONS</span></div>
                {results.length === 0 ? <p className="empty-copy">No completed missions saved on this device.</p> : <div className="history-list">{results.map((record) => <article className="history-row" key={record.id}><div className={`outcome-mark ${record.result.outcome}`}>{record.result.outcome === "success" ? "✓" : "×"}</div><div className="history-name"><strong>{record.result.missionName}</strong><small>{record.result.objective}</small></div><span className={`outcome-label ${record.result.outcome}`}>{record.result.outcome}</span><strong className="history-score">{record.score.total}<small>/100</small></strong><small className="history-date">{new Date(record.savedAt).toLocaleDateString()}</small><button className="button quiet danger-text" onClick={() => handleDeleteResult(record.id)} aria-label={`Delete ${record.result.missionName} result`}>Delete</button></article>)}</div>}
              </section>
              <section className="panel progress-panel"><div className="panel-heading"><div><p className="eyebrow">PLAYER PROGRESS</p><h2>Local records</h2></div></div>{leaderboard.players.length === 0 ? <p className="empty-copy">Progress starts when a completed mission is recorded.</p> : leaderboard.players.map((player) => <div className="progress-row" key={player.name}><span>{player.name}</span><span>{player.completedMissions} completed</span><strong>Best {player.highestScore}/100</strong></div>)}</section>
            </div>
          )}

          {activeTab === "team" && <TeamPage team={team} onChange={handleTeamChange} />}

          <footer className="page-footer"><span>MISSION CONTROL <b>·</b> RESULTS & OPERATIONS</span><span>DATA STORED LOCALLY ON THIS DEVICE</span></footer>
        </section>
      </main>
    </div>
  );
}

function Leaderboard({ title, entries, emptyText = "No completed missions yet." }) {
  return (
    <section className="panel leaderboard-panel">
      <div className="panel-heading"><div><p className="eyebrow">TOP PERFORMERS</p><h2>{title}</h2></div><span className="panel-icon">↗</span></div>
      {entries.length === 0 ? <p className="empty-copy">{emptyText}</p> : <div className="leaderboard-list">{entries.map((entry, index) => <article className="leaderboard-row" key={entry.name}><span className={`rank rank-${index + 1}`}>{String(index + 1).padStart(2, "0")}</span><div><strong>{entry.name}</strong><small>{entry.completedMissions} completed mission{entry.completedMissions === 1 ? "" : "s"}</small></div><strong className="leaderboard-score">{entry.highestScore}<small> PTS</small></strong></article>)}</div>}
    </section>
  );
}

export default App;
