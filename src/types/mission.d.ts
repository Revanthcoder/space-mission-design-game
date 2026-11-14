export type MissionOutcome = "success" | "failure" | "incomplete";

export interface WeightedObjectiveCheck {
  id: string;
  label: string;
  achieved: boolean;
  weight?: number;
  explanation?: string;
}

export interface EngineeringCheck {
  id: string;
  label: string;
  passed: boolean;
  weight?: number;
  explanation?: string;
}

export interface ResourceUsage {
  name: string;
  consumed: number;
  available: number;
  unit?: string;
}

export interface MissionEvent {
  name: string;
  description: string;
  occurredAt?: string;
}

export interface MissionParticipant {
  name: string;
  role:
    | "Mission Commander"
    | "Spacecraft Engineer"
    | "Science Specialist"
    | "Resource Manager";
}

export interface MissionSimulationResult {
  missionId: string;
  missionName: string;
  objective: string;
  spacecraft?: string;
  rocket?: string;
  orbit?: string;
  outcome: MissionOutcome;
  objectiveChecks?: WeightedObjectiveCheck[];
  engineeringChecks?: EngineeringCheck[];
  resourceUsage?: ResourceUsage[];
  communication?: {
    attempted: number;
    successful: number;
  };
  missionLifetime?: {
    actual: number;
    target: number;
    unit?: string;
  };
  scientificValue?: {
    earned: number;
    maximum: number;
    unit?: string;
  };
  events?: MissionEvent[];
  participants?: MissionParticipant[];
  playerName?: string;
  completedAt?: string;
}

export interface ScoreCategory {
  id: string;
  label: string;
  earned: number;
  maximum: number;
  reasons: string[];
}

export interface ScoreBreakdown {
  total: number;
  categories: ScoreCategory[];
}

export interface MissionDraft {
  id: string;
  name: string;
  objective: string;
  spacecraft: string;
  rocket: string;
  orbit: string;
  updatedAt: string;
}

export interface SavedMissionResult {
  id: string;
  result: MissionSimulationResult;
  score: ScoreBreakdown;
  savedAt: string;
}

export interface PlayerProgress {
  playerName: string;
  completedMissions: number;
  highestScore: number;
  updatedAt: string;
}

export interface MissionReport {
  missionName: string;
  objective: string;
  spacecraft: string;
  rocket: string;
  orbit: string;
  resourcesConsumed: ResourceUsage[];
  events: MissionEvent[];
  score: ScoreBreakdown;
  outcome: MissionOutcome;
  improvementSuggestions: string[];
  generatedAt: string;
}
