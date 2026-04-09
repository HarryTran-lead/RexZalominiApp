import React, { useEffect, useState } from "react";
import { AttendanceCheckInResult, AttendanceStreak, StreakRecord } from "@/types/student";
import { formatGamificationDateTime } from "./gamificationHelpers";

type CheckInModalTab = "checkin" | "history";

interface StudentCheckInModalProps {
  show: boolean;
  attendanceStreak: AttendanceStreak | null;
  recentStreaks: StreakRecord[];
  checkInResult: AttendanceCheckInResult | null;
  checkedInToday: boolean;
  checkingIn: boolean;
  onClose: () => void;
  onCheckIn: () => void;
}

function StudentCheckInModal({
  show,
  attendanceStreak,
  recentStreaks,
  checkInResult,
  checkedInToday,
  checkingIn,
  onClose,
  onCheckIn,
}: StudentCheckInModalProps) {
  const [activeTab, setActiveTab] = useState<CheckInModalTab>("checkin");

  useEffect(() => {
    if (show) {
      setActiveTab("checkin");
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <h3 className="text-base font-bold text-gray-800">Điểm danh hôm nay</h3>
        <p className="mt-1 text-sm text-gray-500">Điểm danh để cộng sao, XP và duy trì chuỗi học tập.</p>

        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-red-100 bg-red-50/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("checkin")}
            className={`rounded-lg py-2 text-xs font-semibold ${
              activeTab === "checkin" ? "bg-red-600 text-white" : "text-red-700"
            }`}
          >
            Điểm danh
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`rounded-lg py-2 text-xs font-semibold ${
              activeTab === "history" ? "bg-red-600 text-white" : "text-red-700"
            }`}
          >
            Lịch sử điểm danh
          </button>
        </div>

        {activeTab === "checkin" ? (
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-orange-50 px-3 py-2 text-center">
                <p className="text-[11px] text-orange-700">Chuỗi hiện tại</p>
                <p className="text-lg font-bold text-orange-600">{attendanceStreak?.currentStreak ?? 0}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
                <p className="text-[11px] text-emerald-700">Chuỗi dài nhất</p>
                <p className="text-lg font-bold text-emerald-600">{attendanceStreak?.maxStreak ?? 0}</p>
              </div>
            </div>

            {attendanceStreak?.lastAttendanceDate && (
              <p className="mt-3 text-xs text-gray-500">
                Điểm danh gần nhất: {formatGamificationDateTime(attendanceStreak.lastAttendanceDate)}
              </p>
            )}

            {(checkInResult?.awardedStars || checkInResult?.awardedXp) && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                Thưởng lần gần nhất: +{checkInResult?.awardedStars ?? 0} sao • +{checkInResult?.awardedXp ?? 0} XP
              </div>
            )}

            {checkedInToday && (
              <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">Bạn đã điểm danh hôm nay rồi.</div>
            )}
          </div>
        ) : (
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {recentStreaks.length === 0 ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                Chưa có dữ liệu lịch sử điểm danh.
              </div>
            ) : (
              recentStreaks.slice(0, 20).map((record) => (
                <div key={record.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-gray-700">{formatGamificationDateTime(record.attendanceDate)}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">+{record.rewardStars} sao</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Chuỗi: {record.currentStreak} ngày</span>
                    <span>+{record.rewardExp} XP</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-600"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onCheckIn}
            disabled={checkingIn || checkedInToday}
            className="rounded-lg bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {checkingIn ? "Đang điểm danh..." : "Xác nhận điểm danh"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentCheckInModal;
