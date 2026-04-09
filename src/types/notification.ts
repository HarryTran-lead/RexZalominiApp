// Các kênh gửi thông báo
export type NotificationChannel = "InApp" | "ZaloOa" | "Push" | "Email";

// Trạng thái gửi thông báo (dành cho các kênh ngoài như Zalo, Email)
export type NotificationStatus = "Pending" | "Sent" | "Failed";

// Model chính của 1 item thông báo
export interface NotificationItem {
  id: string;
  recipientUserId: string;
  recipientProfileId?: string | null; 
  channel: NotificationChannel;
  title: string;
  content?: string | null;
  deeplink?: string | null;           
  status: NotificationStatus;
  sentAt?: string | null;             
  createdAt: string;            
  isRead: boolean;                   
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