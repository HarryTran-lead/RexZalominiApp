import React from "react";
import { MissionProgressItem } from "@/types/student";
import {
  getMissionProgressBarClass,
  getMissionStatusClass,
  getMissionStatusLabel,
} from "./gamificationHelpers";

interface StudentMissionListProps {
  missions: MissionProgressItem[];
}

function StudentMissionList({ missions }: StudentMissionListProps) {
  if (missions.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
        Chưa có nhiệm vụ nào.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {missions.map((mission) => {
        const progress = Math.max(0, Math.min(100, Number(mission.progressPercentage ?? 0)));
        return (
          <div key={mission.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-800">{mission.title}</h3>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getMissionStatusClass(mission.status)}`}>
                {getMissionStatusLabel(mission.status)}
              </span>
            </div>

            {mission.description && <p className="text-xs text-gray-500">{mission.description}</p>}

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[11px] text-gray-600">
                <span>
                  Tiến độ: {mission.progressCurrent ?? 0}/{mission.progressTarget ?? 0}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${getMissionProgressBarClass(mission.status)}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-yellow-700">+{mission.rewardStars ?? 0} ⭐</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">+{mission.rewardXp ?? 0} XP</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StudentMissionList;
