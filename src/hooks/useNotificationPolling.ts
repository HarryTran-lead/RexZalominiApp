// src/hooks/useNotificationPolling.ts
import { useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { notificationsAtom, unreadCountAtom, isAppVisibleAtom } from '@/store/notificationStore';
import { notificationService, NotificationRole } from '@/services/notificationService';

export const useNotificationPolling = (role: NotificationRole) => {
  const setNotifications = useSetAtom(notificationsAtom);
  const setUnreadCount = useSetAtom(unreadCountAtom);
  const [isVisible, setIsVisible] = useAtom(isAppVisibleAtom);
  const timerRef = useRef<number | undefined>(undefined);

  const fetchNotifications = useCallback(async () => {
    try {
      const [newItems, unreadCount] = await Promise.all([
        notificationService.getNotifications(role, { pageNumber: 1, pageSize: 30 }),
        notificationService.getUnreadCount(role),
      ]);

      setNotifications((prev) => {
        const map = new Map(prev.map((item) => [item.id, item]));

        for (const item of newItems) {
          map.set(item.id, { ...map.get(item.id), ...item });
        }

        return Array.from(map.values()).sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
        );
      });

      setUnreadCount(unreadCount);

    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  }, [role, setNotifications, setUnreadCount]);

  useEffect(() => {
    // Xử lý ẩn/hiện app của trình duyệt / Zalo Webview
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [setIsVisible]);

  useEffect(() => {
    if (!isVisible) {
      // Tạm dừng polling khi app ẩn (Mục 3.2)
      window.clearInterval(timerRef.current);
      return;
    }

    // Lấy ngay khi vừa mở app
    fetchNotifications();

    // Set interval 15 giây (hoặc 30 giây)
    timerRef.current = window.setInterval(fetchNotifications, 15000);

    return () => {
      if (timerRef.current !== undefined) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isVisible, fetchNotifications]);
};