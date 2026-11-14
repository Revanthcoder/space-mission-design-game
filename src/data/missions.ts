import type { Mission } from "../types/mission";

export const missions: Mission[] = [
  {
    id: "mars",
    title: "Mars Exploration",
    objective: "Establish a survey route and validate rover readiness.",
    difficulty: "Hard",
    description:
      "Deploy a multi-zone mission to evaluate terrain stability, autonomous resource planning, and crew support under simulated Martian conditions.",
    category: "Mars",
  },
  {
    id: "moon",
    title: "Moon Exploration",
    objective: "Map a permanent lunar landing path for expanded research.",
    difficulty: "Medium",
    description:
      "Coordinate landing safety, crew logistics, and long-duration energy planning for a sustained lunar scientific base.",
    category: "Moon",
  },
  {
    id: "earth",
    title: "Earth Observation",
    objective: "Track environmental shifts using orbital monitoring tools.",
    difficulty: "Easy",
    description:
      "Analyze atmospheric patterns and climate indicators, then prioritize high-impact observation windows for rapid decision-making.",
    category: "Earth",
  },
  {
    id: "asteroid",
    title: "Asteroid Research",
    objective: "Evaluate resource potential and orbit risk for a sample return.",
    difficulty: "Hard",
    description:
      "Assess material composition, trajectory stability, and deep-space communication constraints before launching a high-risk retrieval mission.",
    category: "Asteroid",
  },
];

export function getMissionById(id?: string) {
  return missions.find((mission) => mission.id === id) ?? missions[0];
}
