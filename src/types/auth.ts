import { ApiResponse } from "./apiResponse";

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// Phone Login Request
export interface LoginPhoneRequest {
  phoneNumber: string;
}

// Phone OTP Request
export interface SendPhoneOtpRequest {
  phoneNumber: string;
}

export interface VerifyPhoneOtpRequest {
  phoneNumber: string;
  otpCode: string;
}

// Refresh Token Request
export type RefreshTokenRequest = string;

// Change Password Request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Forget Password Request
export interface ForgetPasswordRequest {
  email: string;
}

// Reset Password Request
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Verify Parent PIN Request
export interface VerifyParentPinRequest {
  profileId: string;
  pin: string;
}

// Select Student Profile Request
export interface SelectStudentProfileRequest {
  profileId: string;
}

// Change User PIN Request
export interface ChangeUserPinRequest {
  currentPin: string;
  newPin: string;
}

// Request Parent PIN Reset Request
export interface RequestParentPinResetRequest {
  profileId: string;
}

// ==================== Type Aliases for Compatibility ====================

export type SelectStudentRequest = SelectStudentProfileRequest;
export type ChangePinRequest = ChangeUserPinRequest;
export type RequestPinResetRequest = RequestParentPinResetRequest;

// ==================== Response Interfaces ====================

export interface UserProfile {
  id: string;
  userId?: string;
  studentId?: string;
  profileType: "Parent" | "Student";
  displayName: string;
  hasPinSetup?: boolean;
  avatarUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Login Response
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
  userId?: string;
  role?: number;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    branchId?: string;
  };
  profiles?: UserProfile[];
}

export interface SendPhoneOtpResponse {
  success?: boolean;
  message?: string;
  requestId?: string;
  expiresIn?: number;
}

export interface VerifyPhoneOtpResponse extends LoginResponse {
  verified?: boolean;
}

// Refresh Token Response
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// Get Profiles Response
export interface GetProfilesResponse {
  profiles: UserProfile[];
  selectedProfileId?: string;
}

// Verify Parent PIN Response
export interface VerifyParentPinResponse {
  success: boolean;
  message?: string;
}

// Select Student Response
export interface SelectStudentResponse {
  success: boolean;
  selectedProfile?: UserProfile;
  accessToken?: string;
  studentId?: string;
  message?: string;
}

// User/Me Response
export interface UserMeResponse {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  role: string;
  isActive: boolean;
  branchId?: string;
  branchName?: string;
  createdAt: string;
  updatedAt?: string;
  profiles?: UserProfile[];
  permissions?: string[];
  selectedProfile?: UserProfile;
}

// ==================== API Response Types ====================

export type LoginApiResponse = ApiResponse<LoginResponse>;
export type SendPhoneOtpApiResponse = ApiResponse<SendPhoneOtpResponse>;
export type VerifyPhoneOtpApiResponse = ApiResponse<VerifyPhoneOtpResponse>;
export type RefreshTokenApiResponse = ApiResponse<RefreshTokenResponse>;
export type ChangePasswordApiResponse = ApiResponse<{ message: string }>;
export type GetProfilesApiResponse = ApiResponse<GetProfilesResponse>;
export type ForgetPasswordApiResponse = ApiResponse<{ message: string }>;
export type ResetPasswordApiResponse = ApiResponse<{ message: string }>;
export type VerifyParentPinApiResponse = ApiResponse<VerifyParentPinResponse>;
export type SelectStudentApiResponse = ApiResponse<SelectStudentResponse>;
export type ChangePinApiResponse = ApiResponse<{ message: string }>;
export type RequestPinResetApiResponse = ApiResponse<{ message: string }>;
export type UserMeApiResponse = ApiResponse<UserMeResponse>;
export type LogoutApiResponse = ApiResponse<{ message: string }>;
