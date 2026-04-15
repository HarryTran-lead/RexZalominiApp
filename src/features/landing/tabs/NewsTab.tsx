import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "zmp-ui";
import { contentService } from "@/services/contentService";
import { BlogDetail, BlogSummary } from "@/types/content";
import { firstResolvedAssetUrl } from "@/utils/assetUrl";

function useCarousel(itemCount: number, autoPlayMs = 5000) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    if (itemCount <= 0) return;
    setCurrent((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (paused || itemCount <= 1) return;
    timerRef.current = setInterval(next, autoPlayMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next, autoPlayMs, itemCount]);

  useEffect(() => {
    setCurrent(0);
  }, [itemCount]);

  return { current, goTo, setPaused };
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTagColor(tag?: string): string {
  if (!tag) return "bg-slate-100 text-slate-700";
  const normalized = tag.toLowerCase();
  if (normalized.includes("học") || normalized.includes("kỹ")) {
    return "bg-red-100 text-red-700";
  }
  if (normalized.includes("cambridge") || normalized.includes("thi")) {
    return "bg-blue-100 text-blue-700";
  }
  if (normalized.includes("học bổng") || normalized.includes("ưu đãi")) {
    return "bg-amber-100 text-amber-700";
  }
  if (normalized.includes("thông báo")) {
    return "bg-green-100 text-green-700";
  }
  return "bg-slate-100 text-slate-700";
}

function stripHtml(value?: string): string {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function previewText(item: BlogSummary): string {
  return item.summary || item.excerpt || "Chưa có mô tả cho bài viết này.";
}

function imageUrl(item: BlogSummary): string {
  return (
    firstResolvedAssetUrl(
      item.featuredImageUrl,
      item.thumbnailUrl,
      item.coverImageUrl,
      item.attachmentImageUrl,
      item.attachmentFileUrl
    ) || "https://placehold.co/600x380/F3F4F6/9CA3AF?text=Rex+News"
  );
}

function NewsCard({ item, onOpen }: { item: BlogSummary; onOpen: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className="flex h-28 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-all active:scale-[0.98]"
    >
      <div className="relative h-28 w-24 shrink-0 overflow-hidden">
        <img src={imageUrl(item)} alt={item.title || "Bản tin"} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col justify-between px-3 py-2.5">
        <div>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${getTagColor(item.category)}`}
          >
            {item.category || "Bản tin"}
          </span>
          <h3 className="mt-1 text-xs font-bold leading-snug text-slate-900 line-clamp-2">
            {item.title || "Bài viết mới"}
          </h3>
          <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{previewText(item)}</p>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>{item.viewCount || 0} lượt xem</span>
          <span>{formatDate(item.publishedAt || item.createdAt)}</span>
        </div>
      </div>
    </button>
  );
}

function NewsTab() {
  const [activeTag, setActiveTag] = useState("Tất cả");
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openingId, setOpeningId] = useState<string>("");
  const [selectedBlog, setSelectedBlog] = useState<BlogDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contentService.getPublishedBlogs({ pageNumber: 1, pageSize: 30 });
      setBlogs(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải bản tin";
      setError(message);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const tags = useMemo(() => {
    const categorySet = new Set<string>();
    blogs.forEach((item) => {
      if (item.category?.trim()) categorySet.add(item.category.trim());
    });
    return ["Tất cả", ...Array.from(categorySet)];
  }, [blogs]);

  const filtered = useMemo(() => {
    if (activeTag === "Tất cả") return blogs;
    return blogs.filter((item) => item.category === activeTag);
  }, [activeTag, blogs]);

  const featuredNews = useMemo(() => filtered.slice(0, 3), [filtered]);
  const nonFeatured = useMemo(() => filtered.slice(3), [filtered]);
  const carousel = useCarousel(featuredNews.length, 5500);

  const openDetail = useCallback(async (id: string) => {
    setOpeningId(id);
    setLoadingDetail(true);
    try {
      const detail = await contentService.getBlogById(id);
      if (detail) setSelectedBlog(detail);
    } catch {
      // Keep silent to avoid blocking UI.
    } finally {
      setLoadingDetail(false);
      setOpeningId("");
    }
  }, []);

  return (
    <div className="space-y-4 pb-4">
      <div className="animate-fade-in">
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Bản tin Rex</p>
        <h2 className="mt-0.5 text-base font-extrabold text-slate-900">Tin mới mỗi ngày</h2>
        <p className="mt-1 text-xs text-slate-500">Cập nhật thông báo, bài viết chia sẻ và sự kiện nổi bật.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white py-12">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={fetchBlogs}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Tải lại
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="-mx-4 px-4">
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                    activeTag === tag
                      ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {featuredNews.length > 0 && (
            <div
              className="relative"
              onMouseEnter={() => carousel.setPaused(true)}
              onMouseLeave={() => carousel.setPaused(false)}
              onTouchStart={() => carousel.setPaused(true)}
              onTouchEnd={() => carousel.setPaused(false)}
            >
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${carousel.current * 100}%)` }}
                >
                  {featuredNews.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openDetail(item.id)}
                      className="relative h-48 w-full shrink-0 overflow-hidden text-left"
                    >
                      <img src={imageUrl(item)} alt={item.title || "Bản tin"} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm ${getTagColor(item.category)}`}
                      >
                        {item.category || "Bản tin"}
                      </span>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="line-clamp-2 text-sm font-extrabold text-white">{item.title || "Bài viết mới"}</h3>
                        <p className="mt-1 line-clamp-2 text-[11px] text-white/80">{previewText(item)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {featuredNews.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  {featuredNews.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => carousel.goTo(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === carousel.current ? "w-6 bg-red-500" : "w-2 bg-slate-300"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {nonFeatured.length > 0 && (
            <div className="space-y-2.5">
              {nonFeatured.map((item) => (
                <NewsCard key={item.id} item={item} onOpen={openDetail} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-sm font-bold text-slate-600">Chưa có bài viết nào</p>
              <p className="mt-1 text-xs text-slate-400">Hãy quay lại sau nhé!</p>
            </div>
          )}
        </>
      )}

      {(loadingDetail || selectedBlog) && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 px-3 pb-3 pt-16">
          <div className="max-h-full w-full max-w-[430px] overflow-y-auto rounded-3xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Chi tiết bản tin</h3>
              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
              >
                Đóng
              </button>
            </div>

            {loadingDetail && (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            )}

            {!loadingDetail && selectedBlog && (
              <div>
                <img
                  src={imageUrl(selectedBlog)}
                  alt={selectedBlog.title || "Bản tin"}
                  className="h-44 w-full rounded-2xl object-cover"
                />
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-red-600">
                  {selectedBlog.category || "Bản tin"}
                </p>
                <h4 className="mt-1 text-base font-extrabold text-slate-900">
                  {selectedBlog.title || "Bài viết mới"}
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(selectedBlog.publishedAt || selectedBlog.createdAt)}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {stripHtml(selectedBlog.content || selectedBlog.summary || selectedBlog.excerpt)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {openingId && (
        <div className="fixed right-4 top-16 z-[75] rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow">
          Đang mở bài viết...
        </div>
      )}
    </div>
  );
}

export default NewsTab;
