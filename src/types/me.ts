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
  avatarUrl?: string | null;
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

export interface UpdateProfileDisplayNameItem {
  id: string;
  displayName: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar?: File;
  targetProfileId?: string;
  profiles?: UpdateProfileDisplayNameItem[];
}

export type UpdateProfile = UpdateProfileRequest;

export interface MeProfileContext {
  parentProfileId: string | null;
  studentProfileId: string | null;
}
