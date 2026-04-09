// src/store/notificationStore.ts
import { NotificationItem } from '@/types/notification';
import { atom } from 'jotai';

export const notificationsAtom = atom<NotificationItem[]>([]);
export const unreadCountAtom = atom<number>(0);

// Atom điều khiển trạng thái polling (đang mở app hay ẩn app)
export const isAppVisibleAtom = atom<boolean>(true);