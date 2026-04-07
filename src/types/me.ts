export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string;
  profileType: "Student" | "Parent" | "Teacher" | string;
  lastLoginAt: string;
  lastSeenAt: string;
  isOnline: boolean;
  offlineDurationSeconds: number | null;
}

export interface UserData {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  branchId: string;
  branch: Branch;
  profiles: UserProfile[];
  selectedProfileId: string | null;
  permissions: string[];
  isActive: boolean;
  avatarUrl: string | null;
  lastLoginAt: string;
  lastSeenAt: string;
  isOnline: boolean;
  offlineDurationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  isSuccess: boolean;
  data: UserData;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
}

export type UpdateProfile = UpdateProfileRequest;
