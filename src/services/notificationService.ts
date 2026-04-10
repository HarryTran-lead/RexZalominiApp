import { api } from "@/api/api";
import { NOTIFICATION_ENDPOINTS, PARENT_ENDPOINTS } from "@/constants/apiURL";
import { NotificationItem, NotificationStatus, NotificationChannel } from "@/types/notification";

export type NotificationRole = "Parent" | "Teacher" | "Student";

export interface NotificationQueryParams {
  unreadOnly?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

const VALID_CHANNELS: NotificationChannel[] = ["InApp", "ZaloOa", "Push", "Email"];
const VALID_STATUSES: NotificationStatus[] = ["Pending", "Sent", "Failed"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNotificationItem(raw: unknown): NotificationItem | null {
  if (!isObject(raw)) return null;

  const id = typeof raw.id === "string" ? raw.id : String(raw.id ?? "").trim();
  if (!id) return null;

  const channel = typeof raw.channel === "string" && VALID_CHANNELS.includes(raw.channel as NotificationChannel)
    ? (raw.channel as NotificationChannel)
    : "InApp";

  const status = typeof raw.status === "string" && VALID_STATUSES.includes(raw.status as NotificationStatus)
    ? (raw.status as NotificationStatus)
    : "Sent";

  const sentAt = typeof raw.sentAt === "string" ? raw.sentAt : null;
  const createdAt = typeof raw.createdAt === "string"
    ? raw.createdAt
    : sentAt ?? new Date().toISOString();

  return {
    id,
    recipientUserId: typeof raw.recipientUserId === "string" ? raw.recipientUserId : "",
    recipientProfileId: typeof raw.recipientProfileId === "string" ? raw.recipientProfileId : null,
    channel,
    title: typeof raw.title === "string" && raw.title.trim().length > 0 ? raw.title : "Thông báo",
    content: typeof raw.content === "string" ? raw.content : null,
    deeplink: typeof raw.deeplink === "string" ? raw.deeplink : null,
    status,
    sentAt,
    createdAt,
    isRead: Boolean(raw.isRead),
  };
}

function extractItems(payload: unknown): NotificationItem[] {
  if (Array.isArray(payload)) {
    return payload.map(asNotificationItem).filter((item): item is NotificationItem => item !== null);
  }

  if (!isObject(payload)) return [];

  if ("items" in payload && Array.isArray(payload.items)) {
    return payload.items.map(asNotificationItem).filter((item): item is NotificationItem => item !== null);
  }

  if ("notifications" in payload && isObject(payload.notifications)) {
    const notifications = payload.notifications;
    if (Array.isArray(notifications.items)) {
      return notifications.items
        .map(asNotificationItem)
        .filter((item): item is NotificationItem => item !== null);
    }
  }

  if ("data" in payload) {
    return extractItems(payload.data);
  }

  for (const value of Object.values(payload)) {
    const nested = extractItems(value);
    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
}

function extractTotalCount(payload: unknown): number {
  if (!isObject(payload)) return 0;

  if (typeof payload.totalCount === "number") return payload.totalCount;

  if ("notifications" in payload && isObject(payload.notifications)) {
    const notifications = payload.notifications;
    if (typeof notifications.totalCount === "number") {
      return notifications.totalCount;
    }
  }

  if ("data" in payload) {
    return extractTotalCount(payload.data);
  }

  return 0;
}

function endpointForRole(role: NotificationRole): string {
  return role === "Parent" ? PARENT_ENDPOINTS.NOTIFICATIONS : NOTIFICATION_ENDPOINTS.LIST;
}

function sortByNewest(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort(
    (a, b) => Date.parse(b.createdAt || b.sentAt || "") - Date.parse(a.createdAt || a.sentAt || "")
  );
}

export const notificationService = {
  async getNotifications(
    role: NotificationRole,
    params?: NotificationQueryParams
  ): Promise<NotificationItem[]> {
    const response = await api.get<unknown>(endpointForRole(role), { params });
    return sortByNewest(extractItems(response));
  },

  async getUnreadCount(role: NotificationRole): Promise<number> {
    const response = await api.get<unknown>(endpointForRole(role), {
      params: { unreadOnly: true, pageNumber: 1, pageSize: 1 },
    });

    const totalCount = extractTotalCount(response);
    if (totalCount > 0) return totalCount;

    const unreadItems = extractItems(response).filter((item) => !item.isRead);
    return unreadItems.length;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(NOTIFICATION_ENDPOINTS.MARK_AS_READ(notificationId));
  },
};
