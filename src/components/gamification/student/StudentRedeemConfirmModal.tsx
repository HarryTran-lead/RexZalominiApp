import React from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import { RewardStoreItem } from "@/types/student";

interface StudentRedeemConfirmModalProps {
  isOpen: boolean;
  item: RewardStoreItem | null;
  quantity: number;
  currentStars: number;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function StudentRedeemConfirmModal({
  isOpen,
  item,
  quantity,
  currentStars,
  isLoading,
  onConfirm,
  onCancel,
}: StudentRedeemConfirmModalProps) {
  if (!item) return null;

  const safeQuantity = Math.max(1, Number(quantity || 1));
  const totalCost = Math.max(0, Number(item.costStars || 0)) * safeQuantity;
  const remainingStars = currentStars - totalCost;

  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Xác nhận đổi quà"
      message="Bạn có chắc muốn đổi quà này không?"
      confirmText="Xác nhận đổi"
      cancelText="Hủy"
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <div className="rounded-xl border border-red-100 bg-red-50 p-3">
        <p className="text-sm font-semibold text-gray-800">{item.title}</p>
        <p className="mt-1 text-xs text-gray-600">Số lượng: {safeQuantity}</p>
        <p className="mt-1 text-xs text-gray-600">Tổng sao cần: {totalCost}</p>
        <p className="mt-1 text-xs text-gray-600">Số sao hiện tại: {currentStars}</p>
        <p className={`mt-1 text-xs font-semibold ${remainingStars < 0 ? "text-red-600" : "text-emerald-700"}`}>
          Số sao còn lại: {remainingStars}
        </p>
      </div>
    </ConfirmModal>
  );
}

export default StudentRedeemConfirmModal;
