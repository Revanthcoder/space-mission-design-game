import SpacecraftBuilder from "./SpacecraftBuilder";

export default function Home({ onOpenMissionControl, onLaunchDesignedMission, onAbout }) {
  return (
    <SpacecraftBuilder
      onOpenMissionControl={onOpenMissionControl}
      onLaunchDesignedMission={onLaunchDesignedMission}
      onAbout={onAbout}
    />
  );
}
