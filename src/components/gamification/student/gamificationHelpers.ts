import { MissionProgressItem, RewardRedemption, RewardStoreItem } from "@/types/student";
import { API_CONFIG } from "@/constants/apiURL";

export function isApiSuccess(response?: { isSuccess?: boolean; success?: boolean }): boolean {
  return Boolean(response?.isSuccess ?? response?.success ?? true);
}

export function extractItems<T>(payload: unknown, depth = 0): T[] {
  if (depth > 4) return [];

  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    if (Array.isArray(data.items)) {
      return data.items as T[];
    }

    if (data.items && typeof data.items === "object") {
      const nestedFromItems = extractItems<T>(data.items, depth + 1);
      if (nestedFromItems.length > 0) return nestedFromItems;
    }

    for (const value of Object.values(data)) {
      const nested = extractItems<T>(value, depth + 1);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

export function parseApiDateTime(value?: string | null): Date {
  if (!value) return new Date(NaN);

  const normalized = value.trim();

  // Treat date-only values as local date to avoid implicit UTC conversion.
  const dateOnlyMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
  }

  return new Date(normalized);
}

export function formatGamificationDateTime(value?: string | null): string {
  if (!value) return "";
  const normalized = value.trim();
  const d = parseApiDateTime(value);
  if (Number.isNaN(d.getTime())) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

function resolveImageUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;

  const normalized = rawUrl.trim();
  if (!normalized) return undefined;

  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return normalized;
  }

  const baseUrl = API_CONFIG.BASE_URL;
  if (!baseUrl) return normalized;

  try {
    const apiOrigin = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost").origin;
    if (normalized.startsWith("/")) {
      return `${apiOrigin}${normalized}`;
    }
    return `${apiOrigin}/${normalized}`;
  } catch {
    return normalized;
  }
}

export function isToday(iso?: string): boolean {
  if (!iso) return false;
  const d = parseApiDateTime(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function normalizeMissionItems(payload: unknown): MissionProgressItem[] {
  const rawItems = extractItems<Record<string, unknown>>(payload);

  return rawItems.map((item) => {
    const progressCurrent = Number(item.progressCurrent ?? item.progressValue ?? 0);
    const progressTarget = Number(item.progressTarget ?? item.totalRequired ?? 0);
    const progressPercentage = Number(item.progressPercentage ?? 0);

    return {
      id: String(item.id ?? item.missionId ?? ""),
      missionId: typeof item.missionId === "string" ? item.missionId : undefined,
      missionCode: typeof item.missionCode === "string" ? item.missionCode : undefined,
      title: String(item.title ?? "Nhiệm vụ"),
      description: typeof item.description === "string" ? item.description : undefined,
      status: String(item.status ?? "Assigned"),
      progressCurrent,
      progressTarget,
      progressPercentage,
      rewardStars: Number(item.rewardStars ?? 0),
      rewardXp: Number(item.rewardXp ?? item.rewardExp ?? 0),
      dueAt: typeof item.endAt === "string" ? item.endAt : typeof item.dueAt === "string" ? item.dueAt : undefined,
    };
  });
}

export function normalizeRewardItems(payload: unknown): RewardStoreItem[] {
  const rawItems = extractItems<Record<string, unknown>>(payload);

  return rawItems.map((item) => ({
    id: String(item.id ?? ""),
    title: String(item.title ?? item.itemName ?? "Quà tặng"),
    description: typeof item.description === "string" ? item.description : undefined,
    imageUrl: resolveImageUrl(
      typeof item.imageUrl === "string"
        ? item.imageUrl
        : typeof item.image === "string"
        ? item.image
        : typeof item.thumbnailUrl === "string"
        ? item.thumbnailUrl
        : typeof item.iconUrl === "string"
        ? item.iconUrl
        : undefined
    ),
    costStars: Number(item.costStars ?? 0),
    quantity: Number(item.quantity ?? 0),
    isActive: Boolean(item.isActive ?? true),
  }));
}

export function normalizeRedemptions(payload: unknown): RewardRedemption[] {
  const rawItems = extractItems<Record<string, unknown>>(payload);

  return rawItems.map((item) => {
    const itemId = String(item.itemId ?? "");
    const itemName = String(item.itemName ?? item.title ?? "Món quà");
    const createdAt =
      typeof item.requestedAt === "string"
        ? item.requestedAt
        : typeof item.createdAt === "string"
        ? item.createdAt
        : "";

    return {
      id: String(item.id ?? ""),
      itemId,
      item: {
        id: itemId,
        title: itemName,
        description: undefined,
        imageUrl: undefined,
        costStars: Number(item.costStars ?? item.starsDeducted ?? 0),
        quantity: Number(item.quantity ?? 0),
        isActive: true,
      },
      studentProfileId: String(item.studentProfileId ?? ""),
      quantity: Number(item.quantity ?? 0),
      totalCostStars: Number(item.totalCostStars ?? item.starsDeducted ?? 0),
      status: String(item.status ?? "Requested") as RewardRedemption["status"],
      requestedAt: createdAt,
      processedAt:
        typeof item.handledAt === "string"
          ? item.handledAt
          : typeof item.deliveredAt === "string"
          ? item.deliveredAt
          : undefined,
      cancelReason: typeof item.cancelReason === "string" ? item.cancelReason : undefined,
    };
  });
}

export function getMissionStatusLabel(status?: string): string {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "assigned") return "Mới nhận";
  if (normalized === "inprogress") return "Đang làm";
  if (normalized === "completed") return "Hoàn thành";
  return status || "Không xác định";
}

export function getMissionStatusClass(status?: string): string {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "assigned") return "bg-slate-100 text-slate-700";
  if (normalized === "inprogress") return "bg-amber-100 text-amber-700";
  if (normalized === "completed") return "bg-emerald-100 text-emerald-700";
  return "bg-gray-100 text-gray-700";
}

export function getMissionProgressBarClass(status?: string): string {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "assigned") return "bg-slate-400";
  if (normalized === "inprogress") return "bg-amber-500";
  if (normalized === "completed") return "bg-emerald-500";
  return "bg-red-500";
}

export function getRedemptionStatusLabel(status?: string): string {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "requested" || normalized === "pending") return "Chờ duyệt";
  if (normalized === "approved") return "Đã duyệt";
  if (normalized === "delivered") return "Đã giao";
  if (normalized === "received") return "Đã nhận";
  if (normalized === "cancelled") return "Đã hủy";
  return status || "Không xác định";
}

export function getRedemptionStatusClass(status?: string): string {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "requested" || normalized === "pending") return "bg-amber-100 text-amber-700";
  if (normalized === "approved") return "bg-blue-100 text-blue-700";
  if (normalized === "delivered") return "bg-indigo-100 text-indigo-700";
  if (normalized === "received") return "bg-emerald-100 text-emerald-700";
  if (normalized === "cancelled") return "bg-rose-100 text-rose-700";
  return "bg-gray-100 text-gray-700";
}
