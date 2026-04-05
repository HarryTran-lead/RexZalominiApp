import { ApiResponse } from "./apiResponse";

export interface UploadedFileData {
  url?: string;
  fileUrl?: string;
  secureUrl?: string;
  secure_url?: string;
  publicId?: string;
  public_id?: string;
  [key: string]: unknown;
}

export type UploadFileApiResponse = ApiResponse<UploadedFileData | string>;
