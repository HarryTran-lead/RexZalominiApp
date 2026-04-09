// src/hooks/useNotificationPolling.ts
import { useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { notificationsAtom, unreadCountAtom, isAppVisibleAtom } from '@/store/notificationStore';
import { api } from '@/api/api'; // Axios instance của bạn

export const useNotificationPolling = (role: 'Parent' | 'Teacher' | 'Student') => {
  const setNotifications = useSetAtom(notificationsAtom);
  const setUnreadCount = useSetAtom(unreadCountAtom);
  const [isVisible, setIsVisible] = useAtom(isAppVisibleAtom);
  const timerRef = useRef<number | undefined>(undefined);

  const fetchNotifications = useCallback(async () => {
    try {
      // 1. Định tuyến API theo role (Mục 2.1 và 2.2)
      const isParent = role === 'Parent';
      const endpoint = isParent ? '/api/parent/notifications' : '/api/notifications';

      // 2. Lấy trang đầu tiên
      const listRes = await api.get(endpoint, {
        params: { pageNumber: 1, pageSize: 30 }
      });
      
      // 3. Lấy số lượng chưa đọc (Mục 3.1 - Bước 4)
      const unreadRes = await api.get(endpoint, {
        params: { unreadOnly: true, pageNumber: 1, pageSize: 1 }
      });

      // 4. Update Jotai State (Dedupe & Merge như Mục 3.3)
      setNotifications((prev) => {
        const newItems = listRes.data?.data?.notifications?.items || [];
        const map = new Map(prev.map((item) => [item.id, item]));
        
        for (const item of newItems) {
          map.set(item.id, { ...map.get(item.id), ...item });
        }
        
        return Array.from(map.values()).sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
        );
      });

      setUnreadCount(unreadRes.data?.data?.notifications?.totalCount || 0);

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