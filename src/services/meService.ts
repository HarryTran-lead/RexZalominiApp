import { api } from "@/api/api";
import { ME_ENDPOINTS } from "@/constants/apiURL";
import { ApiResponse } from "@/types/apiResponse";
import { MeProfileContext, UpdateProfileRequest, UserData } from "@/types/me";

const appendIfPresent = (formData: FormData, key: string, value?: string) => {
  if (typeof value === "string") {
    formData.append(key, value);
  }
};

const buildUpdateMeFormData = (payload: UpdateProfileRequest): FormData => {
  const formData = new FormData();

  appendIfPresent(formData, "FullName", payload.fullName);
  appendIfPresent(formData, "Email", payload.email);
  appendIfPresent(formData, "PhoneNumber", payload.phoneNumber);
  appendIfPresent(formData, "TargetProfileId", payload.targetProfileId);

  if (payload.avatar) {
    formData.append("Avatar", payload.avatar);
  }

  payload.profiles?.forEach((profile, index) => {
    appendIfPresent(formData, `Profiles[${index}].Id`, profile.id);
    appendIfPresent(
      formData,
      `Profiles[${index}].DisplayName`,
      profile.displayName
    );
  });

  return formData;
};

const resolveProfileContext = (data: UserData): MeProfileContext => {
  const parentProfile = data.profiles?.find(
    (profile) => profile.profileType === "Parent"
  );

  return {
    parentProfileId: parentProfile?.id ?? null,
    studentProfileId: data.selectedProfileId ?? null,
  };
};

export const meService = {
  getMe: async (): Promise<ApiResponse<UserData>> => {
    return await api.get<ApiResponse<UserData>>(ME_ENDPOINTS.GET);
  },

  updateMe: async (
    payload: UpdateProfileRequest
  ): Promise<ApiResponse<UserData>> => {
    const formData = buildUpdateMeFormData(payload);
    return await api.put<ApiResponse<UserData>>(ME_ENDPOINTS.UPDATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  extractProfileContext: (data: UserData): MeProfileContext => {
    return resolveProfileContext(data);
  },
};
