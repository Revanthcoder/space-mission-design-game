import SpacecraftBuilder from "./SpacecraftBuilder";

export default function Home({ onOpenMissionControl, onLaunchDesignedMission }) {
  return (
    <SpacecraftBuilder
      onOpenMissionControl={onOpenMissionControl}
      onLaunchDesignedMission={onLaunchDesignedMission}
    />
  );
}
