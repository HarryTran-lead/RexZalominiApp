import { HomeworkAssignment, RewardRedemption, Exam } from "@/types/student";

// Date formatting helpers
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    }).format(date);
  } catch {
    return '';
  }
};

export const formatTime = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return '';
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return '';
  }
};

// Homework helpers
export const getHomeworkStatusColor = (status?: string): string => {
  switch (status) {
    case 'Assigned':
      return 'text-indigo-600';
    case 'Submitted':
      return 'text-blue-600';
    case 'Graded':
      return 'text-green-600';
    case 'Late':
      return 'text-orange-600';
    case 'Missing':
      return 'text-red-600';
    case 'Pending':
    default:
      return 'text-gray-600';
  }
};

export const getHomeworkStatusText = (status?: string): string => {
  switch (status) {
    case 'Assigned':
      return 'Đã giao';
    case 'Pending':
      return 'Chưa nộp';
    case 'Submitted':
      return 'Đã nộp';
    case 'Graded':
      return 'Đã chấm điểm';
    case 'Late':
      return 'Nộp muộn';
    case 'Missing':
      return 'Thiếu bài';
    default:
      return status || '';
  }
};

export const isHomeworkOverdue = (homework: HomeworkAssignment): boolean => {
  if (!homework.dueAt || homework.status === 'Submitted' || homework.status === 'Graded') {
    return false;
  }

  return new Date() > new Date(homework.dueAt);
};

export const getHomeworkDaysUntilDue = (dueDate?: string): number | null => {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Timetable helpers
export const getTimetableStatusColor = (status?: string): string => {
  switch (status) {
    case 'Completed':
      return 'text-green-600';
    case 'InProgress':
      return 'text-blue-600';
    case 'Cancelled':
      return 'text-red-600';
    case 'Planned':
    default:
      return 'text-gray-600';
  }
};

export const getTimetableStatusText = (status?: string): string => {
  switch (status) {
    case 'Planned':
      return 'Đã lên lịch';
    case 'InProgress':
      return 'Đang diễn ra';
    case 'Completed':
      return 'Hoàn thành';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status || '';
  }
};


// Gamification helpers
export const formatStarAmount = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
};

export const getRewardStatusColor = (status?: string): string => {
  switch (status) {
    case 'Approved':
      return 'text-green-600';
    case 'Delivered':
      return 'text-blue-600';
    case 'Received':
      return 'text-green-700';
    case 'Cancelled':
      return 'text-red-600';
    case 'Pending':
    default:
      return 'text-orange-600';
  }
};

export const getRewardStatusText = (status?: string): string => {
  switch (status) {
    case 'Pending':
      return 'Đang chờ duyệt';
    case 'Approved':
      return 'Đã duyệt';
    case 'Delivered':
      return 'Đã giao hàng';
    case 'Received':
      return 'Đã nhận';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status || '';
  }
};

export const calculateLevelProgress = (currentXp: number, xpForNextLevel: number): number => {
  if (xpForNextLevel <= 0) return 100;
  return Math.min((currentXp / xpForNextLevel) * 100, 100);
};

// Exam helpers
export const getExamTypeText = (examType?: string): string => {
  switch (examType) {
    case 'QuarterlyExam':
      return 'Kiểm tra định kỳ';
    case 'MidtermExam':
      return 'Kiểm tra giữa kỳ';
    case 'FinalExam':
      return 'Thi cuối kỳ';
    case 'PopQuiz':
      return 'Kiểm tra bất ngờ';
    case 'PlacementTest':
      return 'Kiểm tra xếp lớp';
    default:
      return examType || '';
  }
};

export const getExamStatusColor = (status?: string): string => {
  switch (status) {
    case 'Active':
      return 'text-green-600';
    case 'Completed':
      return 'text-blue-600';
    case 'Cancelled':
      return 'text-red-600';
    case 'Draft':
    default:
      return 'text-gray-600';
  }
};

export const getExamStatusText = (status?: string): string => {
  switch (status) {
    case 'Draft':
      return 'Bản nháp';
    case 'Active':
      return 'Đang mở';
    case 'Completed':
      return 'Hoàn thành';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status || '';
  }
};

export const isExamAvailable = (exam: any): boolean => {
  if (!exam || exam.status !== 'Active') return false;
  
  const now = new Date();
  const startTime = new Date(exam.startTime || exam.scheduledStartTime);
  const endTime = new Date(exam.endTime);
  
  return now >= startTime && now <= endTime && !exam.submitted;
};

export const getExamTimeRemaining = (scheduledStartTime?: string, timeLimitMinutes?: number): number | null => {
  if (!scheduledStartTime || !timeLimitMinutes) return null;
  
  const endTime = new Date(new Date(scheduledStartTime).getTime() + timeLimitMinutes * 60000);
  const now = new Date();
  const diffMinutes = Math.floor((endTime.getTime() - now.getTime()) / 60000);
  
  return Math.max(0, diffMinutes);
};

// General utility helpers
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: number;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.window.setTimeout(() => func(...args), delay);
  }) as T;
};

export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Reward redemption status helpers
export const getRewardRedemptionStatusColor = (status: string): string => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Approved':
      return 'bg-green-100 text-green-800';
    case 'Delivered':
      return 'bg-blue-100 text-blue-800';
    case 'Received':
      return 'bg-green-200 text-green-900';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRewardRedemptionStatusText = (status: string): string => {
  switch (status) {
    case 'Pending':
      return 'Đang chờ';
    case 'Approved':
      return 'Đã duyệt';
    case 'Delivered':
      return 'Đã giao';
    case 'Received':
      return 'Đã nhận';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

// Additional exam helpers for new pages
export const isExamUpcoming = (exam: any): boolean => {
  const now = new Date();
  const startTime = new Date(exam.startTime || exam.scheduledStartTime);
  return startTime > now;
};

export const isExamPast = (exam: any): boolean => {
  const now = new Date();
  const endTime = new Date(exam.endTime);
  return endTime < now || exam.submitted;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }
  
  return `${hours}h ${remainingMinutes}p`;
};
