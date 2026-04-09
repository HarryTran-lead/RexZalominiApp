import React from "react";
import { RewardRedemption } from "@/types/student";
import {
  formatGamificationDateTime,
  getRedemptionStatusClass,
  getRedemptionStatusLabel,
} from "./gamificationHelpers";

interface StudentRewardHistoryListProps {
  redemptions: RewardRedemption[];
  confirmingRedemptionId: string | null;
  onConfirmReceived: (redemptionId: string) => void;
}

function StudentRewardHistoryList({
  redemptions,
  confirmingRedemptionId,
  onConfirmReceived,
}: StudentRewardHistoryListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Lịch sử đổi quà</h3>
      {redemptions.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
          Chưa có giao dịch đổi quà nào.
        </div>
      ) : (
        redemptions.map((redemption) => {
          const canConfirm = String(redemption.status || "").toLowerCase() === "delivered";
          return (
            <div key={redemption.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800">{redemption.item?.title || "Món quà"}</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getRedemptionStatusClass(redemption.status)}`}>
                  {getRedemptionStatusLabel(redemption.status)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">SL: {redemption.quantity} • Tổng: {redemption.totalCostStars} sao</p>
              <p className="mt-1 text-xs text-gray-500">Yêu cầu: {formatGamificationDateTime(redemption.requestedAt)}</p>
              {redemption.cancelReason && <p className="mt-1 text-xs text-rose-600">Lý do hủy: {redemption.cancelReason}</p>}

              {canConfirm && (
                <button
                  onClick={() => onConfirmReceived(redemption.id)}
                  disabled={confirmingRedemptionId === redemption.id}
                  className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {confirmingRedemptionId === redemption.id ? "Đang xác nhận..." : "Đã nhận quà"}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default StudentRewardHistoryList;
