import { ApiResponse } from "@/types/apiResponse";
import { api } from "../api/api";
import { AUTH_ENDPOINTS } from "../constants/apiURL";
import {
  LoginRequest,
  LoginPhoneRequest,
  LoginResponse,
  SendPhoneOtpRequest,
  SendPhoneOtpResponse,
  VerifyPhoneOtpRequest,
  VerifyPhoneOtpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ForgetPasswordRequest,
  ResetPasswordRequest,
  VerifyParentPinRequest,
  VerifyParentPinResponse,
  SelectStudentRequest,
  SelectStudentResponse,
  ChangePinRequest,
  RequestPinResetRequest,
  RequestPinResetZaloOtpResponse,
  VerifyPinResetZaloOtpRequest,
  VerifyPinResetZaloOtpResponse,
  ResetPinRequest,
  UserProfile,
} from "../types/auth";

export const authService = {
  // Login
  login: async (
    credentials: LoginRequest
  ): Promise<ApiResponse<LoginResponse>> => {
    return await api.post<ApiResponse<LoginResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
  },

  // Login with Phone Number
  loginWithPhone: async (
    data: LoginPhoneRequest
  ): Promise<ApiResponse<LoginResponse>> => {
    return await api.post<ApiResponse<LoginResponse>>(
      AUTH_ENDPOINTS.LOGIN_PHONE,
      data
    );
  },

  // Send phone OTP
  sendPhoneOtp: async (
    data: SendPhoneOtpRequest
  ): Promise<ApiResponse<SendPhoneOtpResponse>> => {
    return await api.post<ApiResponse<SendPhoneOtpResponse>>(
      AUTH_ENDPOINTS.SEND_PHONE_OTP,
      data
    );
  },

  // Verify phone OTP
  verifyPhoneOtp: async (
    data: VerifyPhoneOtpRequest
  ): Promise<ApiResponse<VerifyPhoneOtpResponse>> => {
    return await api.post<ApiResponse<VerifyPhoneOtpResponse>>(
      AUTH_ENDPOINTS.VERIFY_PHONE_OTP,
      data
    );
  },


  // Refresh Token
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<ApiResponse<RefreshTokenResponse>> => {
    return await api.post<ApiResponse<RefreshTokenResponse>>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      data
    );
  },

  // Change Password
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ApiResponse<void>> => {
    return await api.put<ApiResponse<void>>(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      data
    );
  },

  // Get Profiles
  getProfiles: async (): Promise<ApiResponse<UserProfile[]>> => {
    return await api.get<ApiResponse<UserProfile[]>>(AUTH_ENDPOINTS.PROFILES);
  },

  // Forget Password
  forgetPassword: async (
    data: ForgetPasswordRequest
  ): Promise<ApiResponse<void>> => {
    return await api.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.FORGET_PASSWORD,
      data
    );
  },

  // Reset Password
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ApiResponse<void>> => {
    return await api.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      data
    );
  },

  // Verify Parent PIN
  verifyParentPin: async (
    data: VerifyParentPinRequest
  ): Promise<ApiResponse<VerifyParentPinResponse>> => {
    return await api.post<ApiResponse<VerifyParentPinResponse>>(
      AUTH_ENDPOINTS.VERIFY_PARENT_PIN,
      data
    );
  },

  // Select Student
  selectStudent: async (
    data: SelectStudentRequest
  ): Promise<ApiResponse<SelectStudentResponse>> => {
    return await api.post<ApiResponse<SelectStudentResponse>>(
      AUTH_ENDPOINTS.SELECT_STUDENT,
      data
    );
  },

  // Change PIN
  changePin: async (data: ChangePinRequest): Promise<ApiResponse<void>> => {
    return await api.put<ApiResponse<void>>(AUTH_ENDPOINTS.CHANGE_PIN, data);
  },

  // Request PIN Reset
  requestPinReset: async (
    data: RequestPinResetRequest
  ): Promise<ApiResponse<void>> => {
    return await api.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.REQUEST_PIN_RESET,
      data
    );
  },

  requestPinResetZaloOtp: async (): Promise<
    ApiResponse<RequestPinResetZaloOtpResponse>
  > => {
    return await api.post<ApiResponse<RequestPinResetZaloOtpResponse>>(
      AUTH_ENDPOINTS.REQUEST_PIN_RESET_ZALO_OTP
    );
  },

  verifyPinResetZaloOtp: async (
    data: VerifyPinResetZaloOtpRequest
  ): Promise<ApiResponse<VerifyPinResetZaloOtpResponse>> => {
    return await api.post<ApiResponse<VerifyPinResetZaloOtpResponse>>(
      AUTH_ENDPOINTS.VERIFY_PIN_RESET_ZALO_OTP,
      data
    );
  },

  resetPin: async (data: ResetPinRequest): Promise<ApiResponse<void>> => {
    return await api.post<ApiResponse<void>>(AUTH_ENDPOINTS.RESET_PIN, data);
  },
};
