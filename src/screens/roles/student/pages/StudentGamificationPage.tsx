import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { gamificationService } from "@/services";
import {
  AttendanceCheckInResult,
  AttendanceStreak,
  StreakRecord,
  MissionProgressItem,
  RewardRedemption,
  RewardStoreItem,
  StarBalance,
  StudentLevel,
} from "@/types/student";
import StudentCheckInModal from "@/components/gamification/student/StudentCheckInModal";
import StudentGamificationOverviewCard from "@/components/gamification/student/StudentGamificationOverviewCard";
import StudentMissionList from "@/components/gamification/student/StudentMissionList";
import StudentRewardHistoryList from "@/components/gamification/student/StudentRewardHistoryList";
import StudentRewardStoreList from "@/components/gamification/student/StudentRewardStoreList";
import {
  isApiSuccess,
  isToday,
  normalizeMissionItems,
  normalizeRedemptions,
  normalizeRewardItems,
} from "@/components/gamification/student/gamificationHelpers";

type GamificationTab = "missions" | "rewards" | "history";

const TABS: Array<{ key: GamificationTab; label: string }> = [
  { key: "missions", label: "Nhiệm vụ" },
  { key: "rewards", label: "Đổi quà" },
  { key: "history", label: "Lịch sử" },
];

function StudentGamificationPage() {
  const { openSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState<GamificationTab>("missions");
  const [starBalance, setStarBalance] = useState<StarBalance | null>(null);
  const [studentLevel, setStudentLevel] = useState<StudentLevel | null>(null);
  const [attendanceStreak, setAttendanceStreak] = useState<AttendanceStreak | null>(null);
  const [recentStreaks, setRecentStreaks] = useState<StreakRecord[]>([]);
  const [missions, setMissions] = useState<MissionProgressItem[]>([]);
  const [rewardItems, setRewardItems] = useState<RewardStoreItem[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<RewardRedemption[]>([]);
  const [checkInResult, setCheckInResult] = useState<AttendanceCheckInResult | null>(null);
  const [quantityByItemId, setQuantityByItemId] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [redeemingItemId, setRedeemingItemId] = useState<string | null>(null);
  const [confirmingRedemptionId, setConfirmingRedemptionId] = useState<string | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGamificationData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [balanceRes, levelRes, streakRes, missionRes, rewardStoreRes, redemptionRes] = await Promise.all([
        gamificationService.getMyStarBalance(),
        gamificationService.getMyLevel(),
        gamificationService.getMyAttendanceStreak(),
        gamificationService.getMyMissionProgress({ pageNumber: 1, pageSize: 20 }),
        gamificationService.getActiveRewardItems({ pageNumber: 1, pageSize: 20 }),
        gamificationService.getMyRewardRedemptions({ pageNumber: 1, pageSize: 20 }),
      ]);

      if (isApiSuccess(balanceRes)) {
        setStarBalance(balanceRes.data ?? { balance: 0, studentProfileId: "", lastUpdated: new Date().toISOString() });
      }

      if (isApiSuccess(levelRes)) {
        setStudentLevel(levelRes.data ?? null);
      }

      if (isApiSuccess(streakRes)) {
        setAttendanceStreak(streakRes.data ?? null);
        setRecentStreaks(Array.isArray(streakRes.data?.recentStreaks) ? streakRes.data.recentStreaks : []);
      }

      if (isApiSuccess(missionRes)) {
        setMissions(normalizeMissionItems(missionRes.data));
      }

      if (isApiSuccess(rewardStoreRes)) {
        const items = normalizeRewardItems(rewardStoreRes.data);
        setRewardItems(items);
        setQuantityByItemId((prev) => {
          const next: Record<string, number> = {};
          items.forEach((item) => {
            const prevQty = prev[item.id] ?? 1;
            const maxQty = Math.max(1, Number(item.quantity ?? 1));
            next[item.id] = Math.min(Math.max(prevQty, 1), maxQty);
          });
          return next;
        });
      }

      if (isApiSuccess(redemptionRes)) {
        setMyRedemptions(normalizeRedemptions(redemptionRes.data));
      }
    } catch (err) {
      console.error("Error fetching gamification data:", err);
      setError("Đã có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const checkedInToday = useMemo(() => isToday(attendanceStreak?.lastAttendanceDate), [attendanceStreak?.lastAttendanceDate]);

  const handleCheckIn = async () => {
    if (checkingIn) return;

    setCheckingIn(true);
    try {
      const response = await gamificationService.checkInAttendance();
      const result = response.data ?? null;
      setCheckInResult(result);

      if (result?.isNewStreak === false) {
        openSnackbar({ text: "Bạn đã điểm danh hôm nay rồi", type: "warning" });
      } else {
        openSnackbar({ text: "Điểm danh thành công", type: "success" });
      }

      setShowCheckInModal(false);
      await fetchGamificationData();
    } catch (err) {
      console.error("Error checking in:", err);
      openSnackbar({ text: "Điểm danh thất bại, vui lòng thử lại", type: "error" });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRedeem = async (item: RewardStoreItem) => {
    if (redeemingItemId) return;
    const quantity = Math.max(1, Number(quantityByItemId[item.id] ?? 1));

    setRedeemingItemId(item.id);
    try {
      await gamificationService.requestRewardRedemption({ itemId: item.id, quantity });
      openSnackbar({ text: "Đổi quà thành công", type: "success" });
      await fetchGamificationData();
    } catch (err: unknown) {
      const raw =
        (err as { response?: { data?: { message?: string; error?: unknown } } })?.response?.data;
      const message = String(raw?.message || "");
      const errorCode = typeof raw?.error === "string" ? raw.error : "";
      const combined = `${message} ${errorCode}`.toLowerCase();
      const statusCode = (err as { response?: { status?: number } })?.response?.status;

      if (statusCode === 409 && combined.includes("insufficientstars")) {
        openSnackbar({ text: "Bạn không đủ sao", type: "error" });
      } else if (statusCode === 409 && combined.includes("insufficientquantity")) {
        openSnackbar({ text: "Món quà này đã hết hàng", type: "error" });
      } else if (statusCode === 400 && combined.includes("itemnotactive")) {
        openSnackbar({ text: "Món quà này đang bị khóa", type: "warning" });
      } else {
        openSnackbar({ text: message || "Đổi quà thất bại", type: "error" });
      }
    } finally {
      setRedeemingItemId(null);
    }
  };

  const handleConfirmReceived = async (redemptionId: string) => {
    if (confirmingRedemptionId) return;
    setConfirmingRedemptionId(redemptionId);
    try {
      await gamificationService.confirmRewardReceived(redemptionId);
      openSnackbar({ text: "Đã xác nhận nhận quà", type: "success" });
      await fetchGamificationData();
    } catch {
      openSnackbar({ text: "Xác nhận nhận quà thất bại", type: "error" });
    } finally {
      setConfirmingRedemptionId(null);
    }
  };

  const renderTabContent = () => {
    if (activeTab === "missions") {
      return <StudentMissionList missions={missions} />;
    }

    if (activeTab === "rewards") {
      return (
        <StudentRewardStoreList
          rewardItems={rewardItems}
          quantityByItemId={quantityByItemId}
          redeemingItemId={redeemingItemId}
          onQuantityChange={(itemId, quantity) => {
            setQuantityByItemId((prev) => ({ ...prev, [itemId]: quantity }));
          }}
          onRedeem={handleRedeem}
        />
      );
    }

    return (
      <StudentRewardHistoryList
        redemptions={myRedemptions}
        confirmingRedemptionId={confirmingRedemptionId}
        onConfirmReceived={handleConfirmReceived}
      />
    );
  };

  if (loading) {
    return (
      <Page className="flex h-full min-h-0 flex-col bg-gray-100">
        <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
          <h1 className="text-white font-bold text-lg w-full text-center">Gamification</h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page className="flex h-full min-h-0 flex-col bg-gray-100">
        <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
          <h1 className="text-white font-bold text-lg w-full text-center">Gamification</h1>
        </div>
        <div className="flex-1 px-4 py-8 text-center">
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={fetchGamificationData} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">
            Thử lại
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Gamification</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-24">
        <div className="space-y-4">
          <StudentGamificationOverviewCard
            starBalance={starBalance}
            studentLevel={studentLevel}
            attendanceStreak={attendanceStreak}
            checkedInToday={checkedInToday}
            onOpenCheckIn={() => setShowCheckInModal(true)}
          />

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-red-100 bg-white p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
                  activeTab === tab.key ? "bg-red-600 text-white" : "text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {renderTabContent()}
        </div>
      </div>

      <StudentCheckInModal
        show={showCheckInModal}
        attendanceStreak={attendanceStreak}
        recentStreaks={recentStreaks}
        checkInResult={checkInResult}
        checkedInToday={checkedInToday}
        checkingIn={checkingIn}
        onClose={() => setShowCheckInModal(false)}
        onCheckIn={handleCheckIn}
      />
    </Page>
  );
}

export default StudentGamificationPage;
