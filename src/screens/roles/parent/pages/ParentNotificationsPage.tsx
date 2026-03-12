import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
import { parentService } from "@/services/parentService";
import { ParentNotification } from "@/types/parent";

/** Strip HTML tags for plain text display */
function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function ParentNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parentService.getNotifications({
        unreadOnly,
        pageSize: 50,
      });
      setNotifications(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const formatDate = (dateStr?: string) => {
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
  };

  return (
    <Page className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Thông báo</h1>
      </div>

      {/* Filter */}
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

      {/* Content */}
      <div className="px-4 pt-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm mb-3">{error}</p>
            <button onClick={fetchNotifications} className="text-red-600 text-sm font-semibold">
              Thử lại
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm">{unreadOnly ? "Không có thông báo chưa đọc" : "Không có thông báo nào"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl shadow-sm p-4 flex gap-3 items-start ${
                  !item.isRead ? "border-l-4 border-red-500" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  !item.isRead ? "bg-red-100" : "bg-gray-100"
                }`}>
                  <svg className={`w-5 h-5 ${!item.isRead ? "text-red-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm mb-0.5 ${!item.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                    {item.title || "Thông báo"}
                  </h3>
                  {item.content && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1">{stripHtml(item.content)}</p>
                  )}
                  <span className="text-[11px] text-gray-400">{formatDate(item.sentAt || item.createdAt)}</span>
                </div>
                {!item.isRead && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0 mt-1.5"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

export default ParentNotificationsPage;
