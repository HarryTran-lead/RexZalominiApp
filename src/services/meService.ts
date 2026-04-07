import { api } from "@/api/api";
import { ME_ENDPOINTS } from "@/constants/apiURL";
import { ApiResponse } from "@/types/apiResponse";
import { UpdateProfileRequest, UserData } from "@/types/me";

export const meService = {
  getMe: async (): Promise<ApiResponse<UserData>> => {
    return await api.get<ApiResponse<UserData>>(ME_ENDPOINTS.GET);
  },

  updateMe: async (
    payload: UpdateProfileRequest
  ): Promise<ApiResponse<UserData>> => {
    return await api.put<ApiResponse<UserData>>(ME_ENDPOINTS.UPDATE, payload);
  },
};
