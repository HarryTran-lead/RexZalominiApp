import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Page, Spinner } from "zmp-ui";
import { AlertCircle, Bell, BellOff } from "lucide-react";
import { notificationsAtom, unreadCountAtom } from "@/store/notificationStore";
import { notificationService, NotificationRole } from "@/services/notificationService";
import { NotificationItem } from "@/types/notification";

interface RoleNotificationsPageProps {
  role: NotificationRole;
}

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const RoleNotificationsPage: React.FC<RoleNotificationsPageProps> = ({ role }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingIds, setMarkingIds] = useState<Record<string, boolean>>({});
  const [markingAll, setMarkingAll] = useState(false);

  const [notifications, setNotifications] = useAtom(notificationsAtom);
  const unreadCount = useAtomValue(unreadCountAtom);
  const setUnreadCount = useSetAtom(unreadCountAtom);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, count] = await Promise.all([
        notificationService.getNotifications(role, { pageNumber: 1, pageSize: 50 }),
        notificationService.getUnreadCount(role),
      ]);
      setNotifications(items);
      setUnreadCount(count);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải thông báo";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [role, setNotifications, setUnreadCount]);

  React.useEffect(() => {
    if (notifications.length === 0) {
      fetchNotifications();
    }
  }, [fetchNotifications, notifications.length]);

  const visibleItems = useMemo(() => {
    if (!unreadOnly) return notifications;
    return notifications.filter((item) => !item.isRead);
  }, [notifications, unreadOnly]);

  const markItemAsRead = useCallback(
    async (item: NotificationItem): Promise<boolean> => {
      if (item.isRead || markingIds[item.id]) return true;

      setMarkingIds((prev) => ({ ...prev, [item.id]: true }));
      try {
        await notificationService.markAsRead(item.id);

        setNotifications((prev) =>
          prev.map((noti) => (noti.id === item.id ? { ...noti, isRead: true } : noti))
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
        return true;
      } catch {
        return false;
      } finally {
        setMarkingIds((prev) => ({ ...prev, [item.id]: false }));
      }
    },
    [markingIds, setNotifications, setUnreadCount]
  );

  const markAllAsRead = useCallback(async () => {
    if (markingAll) return;

    const unreadIds = notifications.filter((item) => !item.isRead).map((item) => item.id);
    if (unreadIds.length === 0) return;

    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead(unreadIds);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể đánh dấu đã đọc tất cả";
      setError(message);
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll, notifications, setNotifications, setUnreadCount]);

  const handleNotificationClick = useCallback(
    async (item: NotificationItem) => {
      const marked = await markItemAsRead(item);
      if (!marked && !item.isRead) {
        return;
      }

      if (item.deeplink?.startsWith("/")) {
        navigate(item.deeplink);
      }
    },
    [markItemAsRead, navigate]
  );

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4">
        <div className="relative">
          <h1 className="text-center text-white font-bold text-lg">Thông báo</h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
            >
              {markingAll ? "Đang xử lý..." : "Đọc tất cả"}
            </button>
          )}
          {unreadCount > 0 && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-24">
        <div className="px-4 pt-4 flex gap-2">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              !unreadOnly ? "bg-red-600 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              unreadOnly ? "bg-red-600 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            Chưa đọc
          </button>
        </div>

        <div className="px-4 pt-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <AlertCircle className="mb-3 h-16 w-16" strokeWidth={1.2} />
              <p className="text-sm mb-3">{error}</p>
              <button onClick={fetchNotifications} className="text-red-600 text-sm font-semibold">
                Thử lại
              </button>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <BellOff className="mb-3 h-16 w-16" strokeWidth={1.2} />
              <p className="text-sm">{unreadOnly ? "Không có thông báo chưa đọc" : "Không có thông báo nào"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full text-left bg-white rounded-2xl shadow-sm p-4 flex gap-3 items-start transition-colors ${
                    !item.isRead ? "border-l-4 border-red-500" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      !item.isRead ? "bg-red-100" : "bg-gray-100"
                    }`}
                  >
                    <Bell className={`h-5 w-5 ${!item.isRead ? "text-red-600" : "text-gray-400"}`} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm mb-0.5 ${!item.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}
                    >
                      {item.title || "Thông báo"}
                    </h3>
                    {item.content && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-1">{stripHtml(item.content)}</p>
                    )}
                    <span className="text-[11px] text-gray-400">{formatDate(item.sentAt || item.createdAt)}</span>
                  </div>
                  {!item.isRead && !markingIds[item.id] && (
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0 mt-1.5" />
                  )}
                  {markingIds[item.id] && (
                    <span className="text-[11px] font-semibold text-red-500">...</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default RoleNotificationsPage;
