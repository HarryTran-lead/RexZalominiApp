import { api } from "@/api/api";
import { FAQ_ENDPOINTS } from "@/constants/apiURL";
import { FAQCategory, FAQItem, FAQListResult, FAQQueryParams } from "@/types/faq";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as UnknownRecord;
}

function toStringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toBooleanOrUndefined(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
}

function findItems<T>(payload: unknown, depth = 0): T[] {
  if (depth > 6) return [];
  if (Array.isArray(payload)) return payload as T[];

  const record = asRecord(payload);
  if (!record) return [];

  const items = record.items;
  if (Array.isArray(items)) return items as T[];

  for (const value of Object.values(record)) {
    const nested = findItems<T>(value, depth + 1);
    if (nested.length > 0) return nested;
  }

  return [];
}

function findPaginationMeta(payload: unknown, depth = 0): UnknownRecord | null {
  if (depth > 6) return null;

  const record = asRecord(payload);
  if (!record) return null;

  const hasPageNumber = toNumberOrUndefined(record.pageNumber) !== undefined;
  const hasTotalPages = toNumberOrUndefined(record.totalPages) !== undefined;
  const hasTotalCount = toNumberOrUndefined(record.totalCount) !== undefined;
  if (hasPageNumber || hasTotalPages || hasTotalCount) return record;

  for (const value of Object.values(record)) {
    const nested = findPaginationMeta(value, depth + 1);
    if (nested) return nested;
  }

  return null;
}

function normalizeCategory(raw: unknown): FAQCategory | null {
  const item = asRecord(raw);
  if (!item) return null;

  const id =
    toStringOrUndefined(item.id) ||
    toStringOrUndefined(item.categoryId) ||
    toStringOrUndefined(item.value);

  const name =
    toStringOrUndefined(item.name) ||
    toStringOrUndefined(item.categoryName) ||
    toStringOrUndefined(item.title);

  if (!id || !name) return null;

  return {
    id,
    name,
    description: toStringOrUndefined(item.description),
    displayOrder: toNumberOrUndefined(item.displayOrder) ?? toNumberOrUndefined(item.order),
  };
}

function normalizeFaqItem(raw: unknown): FAQItem | null {
  const item = asRecord(raw);
  if (!item) return null;

  const id =
    toStringOrUndefined(item.id) ||
    toStringOrUndefined(item.faqId) ||
    toStringOrUndefined(item.slug) ||
    `${toStringOrUndefined(item.question) || ""}-${toStringOrUndefined(item.categoryId) || ""}`;

  const question = toStringOrUndefined(item.question);
  const answer = toStringOrUndefined(item.answer);

  if (!question || !answer) return null;

  const categoryRecord = asRecord(item.category);
  const normalizedCategory = normalizeCategory(categoryRecord);

  return {
    id,
    question,
    answer,
    categoryId:
      toStringOrUndefined(item.categoryId) ||
      normalizedCategory?.id ||
      toStringOrUndefined(item.faqCategoryId),
    categoryName:
      toStringOrUndefined(item.categoryName) ||
      normalizedCategory?.name ||
      toStringOrUndefined(item.topic),
    category: normalizedCategory || undefined,
  };
}

function extractPayload(response: unknown): unknown {
  const record = asRecord(response);
  if (!record) return response;
  return record.data ?? response;
}

export const faqService = {
  getPublicCategories: async (): Promise<FAQCategory[]> => {
    const response = await api.get<unknown>(FAQ_ENDPOINTS.CATEGORIES);
    const payload = extractPayload(response);

    return findItems<unknown>(payload)
      .map(normalizeCategory)
      .filter((item): item is FAQCategory => item !== null)
      .sort((a, b) => (a.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b.displayOrder ?? Number.MAX_SAFE_INTEGER));
  },

  getPublicFaqs: async (params: FAQQueryParams): Promise<FAQListResult> => {
    const response = await api.get<unknown>(FAQ_ENDPOINTS.LIST, { params });
    const payload = extractPayload(response);

    const items = findItems<unknown>(payload)
      .map(normalizeFaqItem)
      .filter((item): item is FAQItem => item !== null);

    const meta = findPaginationMeta(payload) || findPaginationMeta(response);
    const pageNumber = toNumberOrUndefined(meta?.pageNumber) ?? params.pageNumber ?? 1;
    const totalPages = toNumberOrUndefined(meta?.totalPages) ?? pageNumber;
    const totalCount = toNumberOrUndefined(meta?.totalCount) ?? items.length;
    const hasNextPage =
      toBooleanOrUndefined(meta?.hasNextPage) ??
      (totalPages > 0 ? pageNumber < totalPages : items.length >= (params.pageSize ?? 10));

    return {
      items,
      pageNumber,
      totalPages,
      totalCount,
      hasNextPage,
    };
  },
};
