export interface BlogSummary {
  id: string;
  title?: string;
  summary?: string;
  excerpt?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  featuredImageUrl?: string;
  attachmentImageUrl?: string;
  attachmentFileUrl?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
  viewCount?: number;
}

export interface BlogDetail extends BlogSummary {
  content?: string;
  authorName?: string;
}
