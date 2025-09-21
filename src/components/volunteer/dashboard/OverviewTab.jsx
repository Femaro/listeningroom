import AvailabilityToggle from "@/components/volunteer/dashboard/AvailabilityToggle";
import VolunteerStats from "@/components/volunteer/dashboard/VolunteerStats";
import RealtimeTimer from "@/components/volunteer/dashboard/RealtimeTimer";
import NoActiveSession from "@/components/volunteer/dashboard/NoActiveSession";

export default function OverviewTab({
  availability,
  onToggleAvailability,
  stats,
  activeSession,
  onTimeUpdate,
  onAutoTerminate,
  onRefresh,
}) {
  return (
    <div className="space-y-6">
      <AvailabilityToggle
        availability={availability}
        onToggle={onToggleAvailability}
      />
      <VolunteerStats stats={stats} />
      {activeSession ? (
        <RealtimeTimer
          sessionId={activeSession.id}
          onTimeUpdate={onTimeUpdate}
          onAutoTerminate={onAutoTerminate}
        />
      ) : (
        <NoActiveSession
          isAvailable={availability?.is_available}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
