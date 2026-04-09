import React from "react";
import { RewardStoreItem } from "@/types/student";

interface StudentRewardStoreListProps {
  rewardItems: RewardStoreItem[];
  quantityByItemId: Record<string, number>;
  redeemingItemId: string | null;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRedeem: (item: RewardStoreItem) => void;
}

function StudentRewardStoreList({
  rewardItems,
  quantityByItemId,
  redeemingItemId,
  onQuantityChange,
  onRedeem,
}: StudentRewardStoreListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Cửa hàng quà tặng</h3>
      {rewardItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
          Hiện chưa có quà đang mở bán.
        </div>
      ) : (
        rewardItems.map((item) => {
          const quantity = quantityByItemId[item.id] ?? 1;
          const maxQty = Math.max(1, Number(item.quantity ?? 1));

          return (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description || "Không có mô tả"}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-yellow-50 px-2 py-0.5 font-semibold text-yellow-700">{item.costStars} ⭐</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">Còn {item.quantity}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    const normalized = Number.isFinite(next) ? Math.min(Math.max(next, 1), maxQty) : 1;
                    onQuantityChange(item.id, normalized);
                  }}
                  className="w-20 rounded-lg border border-gray-200 px-2 py-2 text-sm"
                />
                <button
                  onClick={() => onRedeem(item)}
                  disabled={redeemingItemId === item.id || item.quantity <= 0}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {redeemingItemId === item.id ? "Đang đổi..." : "Đổi quà"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default StudentRewardStoreList;
