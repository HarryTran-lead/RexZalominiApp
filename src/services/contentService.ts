import { api } from "@/api/api";
import { BLOG_ENDPOINTS } from "@/constants/apiURL";
import { BlogDetail, BlogSummary } from "@/types/content";

function findItems<T>(payload: unknown, depth = 0): T[] {
  if (depth > 5) return [];

  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.items)) return record.items as T[];

  for (const value of Object.values(record)) {
    const nested = findItems<T>(value, depth + 1);
    if (nested.length > 0) return nested;
  }

  return [];
}

function toStringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function normalizeBlogSummary(raw: unknown): BlogSummary {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const id =
    toStringOrUndefined(item.id) ||
    toStringOrUndefined(item.blogId) ||
    toStringOrUndefined(item.slug) ||
    toStringOrUndefined(item.title) ||
    "";

  return {
    id,
    title: toStringOrUndefined(item.title),
    summary: toStringOrUndefined(item.summary),
    excerpt: toStringOrUndefined(item.excerpt) || toStringOrUndefined(item.shortDescription),
    thumbnailUrl: toStringOrUndefined(item.thumbnailUrl),
    coverImageUrl: toStringOrUndefined(item.coverImageUrl),
    featuredImageUrl: toStringOrUndefined(item.featuredImageUrl),
    attachmentImageUrl: toStringOrUndefined(item.attachmentImageUrl),
    attachmentFileUrl: toStringOrUndefined(item.attachmentFileUrl),
    category:
      toStringOrUndefined(item.category) ||
      toStringOrUndefined(item.categoryName) ||
      toStringOrUndefined(item.blogCategory),
    tags: Array.isArray(item.tags)
      ? item.tags.filter((tag): tag is string => typeof tag === "string")
      : undefined,
    publishedAt: toStringOrUndefined(item.publishedAt),
    createdAt: toStringOrUndefined(item.createdAt),
    viewCount: toNumberOrUndefined(item.viewCount) || toNumberOrUndefined(item.totalViews),
  };
}

function normalizeBlogDetail(raw: unknown): BlogDetail {
  const detail = normalizeBlogSummary(raw);
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  return {
    ...detail,
    content: toStringOrUndefined(item.content) || toStringOrUndefined(item.body),
    authorName: toStringOrUndefined(item.authorName) || toStringOrUndefined(item.createdByName),
  };
}

function toTimestamp(value?: string): number {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export const contentService = {
  getPublishedBlogs: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    keyword?: string;
  }): Promise<BlogSummary[]> => {
    const response = await api.get<unknown>(BLOG_ENDPOINTS.PUBLISHED, { params });
    return findItems<unknown>(response)
      .map(normalizeBlogSummary)
      .sort(
        (a, b) =>
          Math.max(toTimestamp(b.publishedAt), toTimestamp(b.createdAt)) -
          Math.max(toTimestamp(a.publishedAt), toTimestamp(a.createdAt))
      );
  },

  getBlogById: async (id: string): Promise<BlogDetail | null> => {
    const response = await api.get<unknown>(BLOG_ENDPOINTS.DETAIL(id));
    const payload = response as Record<string, unknown> | undefined;
    const data = (payload?.data ?? payload) as unknown;

    if (!data || Array.isArray(data) || typeof data !== "object") {
      return null;
    }

    return normalizeBlogDetail(data);
  },
};
