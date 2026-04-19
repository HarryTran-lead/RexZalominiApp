export interface ApiResponse<T> {
  success?: boolean;
  isSuccess?: boolean;
  data: T;
  message?: string;
  title?: string;
  detail?: string;
}

export interface PaginatedData<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface ErrorResponse {
  success?: boolean;
  isSuccess?: boolean;
  data: {
    message?: string;
  };
  error?: [message?: string, field?: string];
  title?: string;
  detail?: string;
}

export type ListData<T> = T[] | { items: T[] };