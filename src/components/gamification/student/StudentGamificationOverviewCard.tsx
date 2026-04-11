import React from "react";
import { AttendanceStreak, StarBalance, StudentLevel } from "@/types/student";
import { calculateLevelProgress, formatStarAmount } from "@/utils";

interface StudentGamificationOverviewCardProps {
  starBalance: StarBalance | null;
  studentLevel: StudentLevel | null;
  attendanceStreak: AttendanceStreak | null;
  checkedInToday: boolean;
  onOpenCheckIn: () => void;
}

function StudentGamificationOverviewCard({
  starBalance,
  studentLevel,
  attendanceStreak,
  checkedInToday,
  onOpenCheckIn,
}: StudentGamificationOverviewCardProps) {
  const levelPayload = studentLevel as (StudentLevel & { xp?: number }) | null;
  const totalXp = Math.max(0, Number(levelPayload?.currentXp ?? levelPayload?.xp ?? 0));
  const xpInCurrentLevel = totalXp % 100;
  const xpRemainingToNextLevel = xpInCurrentLevel === 0 ? 100 : 100 - xpInCurrentLevel;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-rose-500 p-4 text-white shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-red-100">Ví sao</p>
          <p className="mt-0.5 text-2xl font-bold">{formatStarAmount(starBalance?.balance ?? 0)} ⭐</p>
        </div>
        <div className="rounded-xl bg-white/20 px-2.5 py-1 text-xs font-semibold">{studentLevel?.level ?? 1}</div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-red-50">
          <span>XP: {totalXp}</span>
          <span>Cần {xpRemainingToNextLevel} XP để lên cấp</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/30">
          <div
            className="h-2 rounded-full bg-white"
            style={{
              width: `${calculateLevelProgress(totalXp, studentLevel?.xpRequiredForNextLevel ?? 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/15 px-3 py-2">
          <p className="text-[11px] text-red-100">Chuỗi hiện tại</p>
          <p className="text-lg font-bold">{attendanceStreak?.currentStreak ?? 0}</p>
        </div>
        <button
          type="button"
          onClick={onOpenCheckIn}
          className="rounded-xl bg-white px-3 py-2 text-left text-red-600"
        >
          <p className="text-[11px] font-semibold">Điểm danh</p>
          <p className="mt-0.5 text-sm font-bold">{checkedInToday ? "Xem trạng thái hôm nay" : "Nhấn để điểm danh"}</p>
        </button>
      </div>
    </div>
  );
}

export default StudentGamificationOverviewCard;
