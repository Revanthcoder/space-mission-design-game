export type MissionDifficulty = "Easy" | "Medium" | "Hard";
export type MissionCategory = "Mars" | "Moon" | "Earth" | "Asteroid";

export interface Mission {
  id: string;
  title: string;
  objective: string;
  difficulty: MissionDifficulty;
  description: string;
  category: MissionCategory;
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  status: "success" | "warning" | "info";
}
