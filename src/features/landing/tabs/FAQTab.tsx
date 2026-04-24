import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "zmp-ui";
import { faqService } from "@/services/faqService";
import { FAQItem as FAQItemType } from "@/types/faq";

const PAGE_SIZE = 8;

function toCategoryLabel(item: FAQItemType): string {
  return item.categoryName || item.category?.name || "Khác";
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold leading-snug text-slate-900">{q}</p>
        <span
          className={`mt-0.5 shrink-0 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
            open
              ? "bg-gradient-to-br from-red-500 to-red-600 text-white rotate-180"
              : "bg-red-100 text-red-600"
          }`}
        >
          <svg
            className="h-3 w-3 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-48 opacity-100 mt-2.5" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-sm leading-relaxed text-slate-600">{a}</p>
      </div>
    </button>
  );
}

function FAQTab() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [faqs, setFaqs] = useState<FAQItemType[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchInput.trim());
    }, 320);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await faqService.getPublicCategories();
        if (!mounted) return;
        setCategories(data.map((item) => ({ id: item.id, name: item.name })));
      } catch {
        if (!mounted) return;
        setCategories([]);
      } finally {
        if (mounted) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchFaqs = useCallback(
    async (targetPage: number, append: boolean) => {
      const currentRequestId = ++requestIdRef.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingInitial(true);
      }

      if (!append) {
        setError(null);
      }

      try {
        const result = await faqService.getPublicFaqs({
          categoryId: selectedCategoryId === "all" ? undefined : selectedCategoryId,
          searchTerm: debouncedSearchTerm || undefined,
          pageNumber: targetPage,
          pageSize: PAGE_SIZE,
        });

        if (requestIdRef.current !== currentRequestId) return;

        setFaqs((prev) => (append ? [...prev, ...result.items] : result.items));
        setPageNumber(result.pageNumber);
        setHasNextPage(result.hasNextPage);
        setTotalCount(result.totalCount);
      } catch (err: unknown) {
        if (requestIdRef.current !== currentRequestId) return;

        const message = err instanceof Error ? err.message : "Không thể tải dữ liệu FAQ";
        setError(message);

        if (!append) {
          setFaqs([]);
          setPageNumber(1);
          setHasNextPage(false);
          setTotalCount(0);
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setLoadingInitial(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedSearchTerm, selectedCategoryId]
  );

  useEffect(() => {
    fetchFaqs(1, false);
  }, [fetchFaqs]);

  const groupedFaqs = useMemo(() => {
    const groups = new Map<string, FAQItemType[]>();

    faqs.forEach((item) => {
      const key = toCategoryLabel(item);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(item);
    });

    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [faqs]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || loadingInitial || !hasNextPage) return;
    fetchFaqs(pageNumber + 1, true);
  }, [fetchFaqs, hasNextPage, loadingInitial, loadingMore, pageNumber]);

  const handleRetry = useCallback(() => {
    fetchFaqs(1, false);
  }, [fetchFaqs]);

  return (
    <div className="space-y-5 pb-4">
      {/* ─── HEADER BANNER ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-500 to-orange-500 px-5 py-5 text-white shadow-lg animate-fade-in">
        {/* Decorative shapes */}
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute right-8 top-12 h-8 w-8 rounded-full bg-white/10" />
        <div className="absolute -left-4 bottom-2 h-16 w-16 rounded-full bg-white/5" />

        <p className="relative text-[10px] font-bold uppercase tracking-widest text-red-200">
          Câu hỏi thường gặp
        </p>
        <h2 className="relative mt-1 text-lg font-extrabold leading-snug">
          Giải đáp mọi thắc mắc
          <br />
          về Rex Mini App
        </h2>
        <p className="relative mt-1.5 text-xs text-red-100">
          Không tìm thấy câu trả lời? Nhắn tin cho chúng tôi qua tab Liên hệ.
        </p>

        {/* Question mark icon */}
        <div className="absolute right-4 bottom-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <span className="text-2xl font-bold">?</span>
        </div>
      </div>

      <section className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <label htmlFor="faq-search" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Tìm kiếm nhanh
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="faq-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nhập từ khóa câu hỏi, câu trả lời, chủ đề..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        <div className="-mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategoryId("all")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                selectedCategoryId === "all"
                  ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              Tất cả
            </button>

            {!categoriesLoading &&
              categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                    selectedCategoryId === category.id
                      ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {category.name}
                </button>
              ))}
          </div>
        </div>

        <div className="px-1">
          <p className="text-[11px] text-slate-500">
            {loadingInitial ? "Đang tải danh sách câu hỏi..." : `Hiển thị ${faqs.length}/${totalCount} câu hỏi`}
          </p>
        </div>
      </section>

      {loadingInitial && (
        <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white py-12">
          <Spinner />
        </div>
      )}

      {!loadingInitial && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loadingInitial && !error && groupedFaqs.map((group, groupIndex) => (
        <section
          key={group.category}
          className="animate-slide-up"
          style={{ animationDelay: `${groupIndex * 100}ms` }}
        >
          <div className="mb-2.5 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-100 text-sm">
              ❓
            </span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-600">
              {group.category}
            </h3>
          </div>
          <div className="space-y-2">
            {group.items.map((item, itemIndex) => (
              <FAQItem
                key={item.id || `${item.question}-${itemIndex}`}
                q={item.question}
                a={item.answer}
                index={groupIndex * PAGE_SIZE + itemIndex}
              />
            ))}
          </div>
        </section>
      ))}

      {!loadingInitial && !error && faqs.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center">
          <p className="text-sm font-bold text-slate-700">Không tìm thấy câu hỏi phù hợp</p>
          <p className="mt-1 text-xs text-slate-500">Hãy thử từ khóa khác hoặc bỏ bộ lọc chủ đề.</p>
        </div>
      )}

      {!loadingInitial && !error && hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-sm disabled:opacity-60"
          >
            {loadingMore ? <Spinner size="small" /> : null}
            {loadingMore ? "Đang tải thêm..." : "Tải thêm câu hỏi"}
          </button>
        </div>
      )}

      {/* ─── CTA BOTTOM ─── */}
      <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-4 text-center shadow-sm animate-fade-in">
        <div className="mb-2 flex justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-xl">
            💬
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Vẫn còn câu hỏi khác? Chúng tôi luôn sẵn sàng hỗ trợ bạn.
        </p>
        <p className="mt-1 text-xs font-bold text-red-600">
          Nhắn tin qua tab Liên hệ bên dưới
        </p>
      </div>
    </div>
  );
}

export default FAQTab;
