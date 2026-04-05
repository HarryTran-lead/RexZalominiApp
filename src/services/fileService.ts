import { api } from "@/api/api";
import { FILE_ENDPOINTS } from "@/constants/apiURL";
import { UploadFileApiResponse } from "@/types/file";

export const fileService = {
  uploadAvatar: async (file: File): Promise<UploadFileApiResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    return await api.post<UploadFileApiResponse>(FILE_ENDPOINTS.AVATAR, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadGeneralFile: async (
    file: File,
    folder = "general",
    resourceType = "auto"
  ): Promise<UploadFileApiResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    return await api.post<UploadFileApiResponse>(FILE_ENDPOINTS.UPLOAD, formData, {
      params: {
        folder,
        resourceType,
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
