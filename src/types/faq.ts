export interface FAQCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  categoryId?: string;
  categoryName?: string;
  category?: FAQCategory;
}

export interface FAQQueryParams {
  categoryId?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface FAQListResult {
  items: FAQItem[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
}
