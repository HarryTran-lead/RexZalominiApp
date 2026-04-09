// Các kênh gửi thông báo
export type NotificationChannel = "InApp" | "ZaloOa" | "Push" | "Email";

// Trạng thái gửi thông báo (dành cho các kênh ngoài như Zalo, Email)
export type NotificationStatus = "Pending" | "Sent" | "Failed";

// Model chính của 1 item thông báo
export interface NotificationItem {
  id: string;
  recipientUserId: string;
  recipientProfileId?: string | null; // Có thể null nếu thông báo gửi chung cho User thay vì Profile cụ thể
  channel: NotificationChannel;
  title: string;
  content?: string | null;
  deeplink?: string | null;           // Dùng để điều hướng trong Mini App khi click vào
  status: NotificationStatus;
  sentAt?: string | null;             // Thời gian gửi (nếu có)
  createdAt: string;                  // Thời gian tạo (ISO String)
  isRead: boolean;                    // Trạng thái đã đọc hay chưa
}


export interface NotificationPage<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface NotificationsResponse {
  isSuccess: boolean;
  data: {
    notifications: NotificationPage<NotificationItem>;
  };
}