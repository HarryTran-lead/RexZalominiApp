import { useState, useRef, useEffect, useCallback } from "react";
import news1 from "../../../assets/images/news-1.jpg";
import news2 from "../../../assets/images/news-2.jpg";
import news3 from "../../../assets/images/news-3.jpg";

interface NewsItem {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  img: string;
  featured?: boolean;
}

const NEWS: NewsItem[] = [
  {
    id: 1,
    tag: "Kỹ năng",
    tagColor: "bg-red-100 text-red-700",
    title: "5 mẹo sửa phát âm cho bé tại nhà",
    excerpt: "Hoạt động đơn giản giúp bé tự tin nói tiếng Anh mỗi ngày – ba mẹ không cần là giáo viên vẫn làm được.",
    date: "12/12",
    views: 1231,
    likes: 239,
    comments: 56,
    img: news1,
    featured: true,
  },
  {
    id: 2,
    tag: "Cambridge",
    tagColor: "bg-blue-100 text-blue-700",
    title: "Cambridge: Starters → Movers → Flyers",
    excerpt: "Cấu trúc đề và cách luyện đều – chắc – vui tại KidzGo. Lộ trình rõ ràng từng cấp.",
    date: "13/12",
    views: 976,
    likes: 56,
    comments: 15,
    img: news2,
  },
  {
    id: 3,
    tag: "Học bổng",
    tagColor: "bg-amber-100 text-amber-700",
    title: "Checklist xin học bổng trung học Mỹ",
    excerpt: "Chuẩn bị hồ sơ, hoạt động ngoại khoá và chứng chỉ – hướng dẫn đầy đủ từ A-Z.",
    date: "14/12",
    views: 1207,
    likes: 83,
    comments: 25,
    img: news3,
  },
  {
    id: 4,
    tag: "Thông báo",
    tagColor: "bg-green-100 text-green-700",
    title: "Khai giảng lớp Starter tháng 4/2026",
    excerpt: "Lớp mới dành cho bé 3–5 tuổi bắt đầu hành trình tiếng Anh. Ưu đãi học phí khai giảng 15%.",
    date: "02/04",
    views: 842,
    likes: 104,
    comments: 31,
    img: news1,
  },
  {
    id: 5,
    tag: "Chính sách",
    tagColor: "bg-slate-100 text-slate-700",
    title: "Cập nhật chính sách điểm danh mới",
    excerpt: "Rex áp dụng hệ thống điểm danh số hoá từ tháng 4/2026 – phụ huynh nhận thông báo tức thì qua Zalo.",
    date: "30/03",
    views: 654,
    likes: 47,
    comments: 12,
    img: news2,
  },
];

const TAGS_FILTER = ["Tất cả", "Kỹ năng", "Cambridge", "Học bổng", "Thông báo", "Chính sách"];

// ─── CAROUSEL HOOK ────────────────────────────────────────────

function useCarousel(itemCount: number, autoPlayMs = 5000) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => {
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

  return { current, next, goTo, setPaused };
}

// ─── NEWS CARD COMPONENT ──────────────────────────────────────

function NewsCard({ item, featured }: { item: NewsItem; featured?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${
        featured ? "flex-col" : "flex h-28"
      }`}
    >
      {featured ? (
        <>
          <div className="relative h-40 w-full overflow-hidden">
            <img 
              src={item.img} 
              alt={item.title} 
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm ${item.tagColor}`}
            >
              {item.tag}
            </span>
          </div>
          <div className="p-3.5">
            <h3 className="text-sm font-extrabold leading-snug text-slate-900">{item.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">{item.excerpt}</p>
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {item.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {item.likes}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {item.comments}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">{item.date}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative h-28 w-24 shrink-0 overflow-hidden">
            <img 
              src={item.img} 
              alt={item.title} 
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" 
            />
          </div>
          <div className="flex flex-1 flex-col justify-between px-3 py-2.5">
            <div>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${item.tagColor}`}
              >
                {item.tag}
              </span>
              <h3 className="mt-1 text-xs font-bold leading-snug text-slate-900 line-clamp-2">{item.title}</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>{item.views} xem</span>
                <span>{item.likes} thích</span>
              </div>
              <span className="text-[10px] text-slate-400">{item.date}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────

function NewsTab() {
  const [activeTag, setActiveTag] = useState("Tất cả");
  const featuredNews = NEWS.filter((n) => n.featured);
  const carousel = useCarousel(featuredNews.length, 6000);

  const filtered =
    activeTag === "Tất cả" ? NEWS : NEWS.filter((n) => n.tag === activeTag);

  const nonFeatured = filtered.filter((n) => !n.featured);

  return (
    <div className="space-y-4 pb-4">
      {/* ─── HEADER ─── */}
      <div className="animate-fade-in">
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">
          Bản tin của bé yêu
        </p>
        <h2 className="mt-0.5 text-base font-extrabold text-slate-900">
          Khám phá câu chuyện vui
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Hoạt động thú vị và bí kíp học tiếng Anh siêu dễ thương!
        </p>
      </div>

      {/* ─── TAG FILTER (Horizontal scroll) ─── */}
      <div className="-mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {TAGS_FILTER.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                activeTag === tag
                  ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ─── FEATURED CAROUSEL ─── */}
      {featuredNews.length > 0 && (
        <div
          className="relative"
          onMouseEnter={() => carousel.setPaused(true)}
          onMouseLeave={() => carousel.setPaused(false)}
          onTouchStart={() => carousel.setPaused(true)}
          onTouchEnd={() => carousel.setPaused(false)}
        >
          <div className="relative overflow-hidden rounded-2xl">
            {/* Carousel slides */}
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${carousel.current * 100}%)` }}
            >
              {featuredNews.map((item) => (
                <div key={item.id} className="w-full shrink-0">
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm ${item.tagColor}`}
                    >
                      {item.tag}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-sm font-extrabold text-white">{item.title}</h3>
                      <p className="mt-1 text-[11px] text-white/80 line-clamp-2">{item.excerpt}</p>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-white/70">
                        <span>{item.views.toLocaleString()} xem</span>
                        <span>{item.likes} thích</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel dots */}
          {featuredNews.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {featuredNews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => carousel.goTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === carousel.current
                      ? "w-6 bg-red-500"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── REST OF CARDS ─── */}
      {nonFeatured.length > 0 && (
        <div className="space-y-2.5">
          {nonFeatured.map((item, i) => (
            <div
              key={item.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <NewsCard item={item} />
            </div>
          ))}
        </div>
      )}

      {/* Featured cards below carousel */}
      {filtered.filter((n) => n.featured).length > 0 && (
        <div className="space-y-2.5">
          {filtered
            .filter((n) => n.featured)
            .map((item) => (
              <NewsCard key={item.id} item={item} featured />
            ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-bold text-slate-600">Chưa có bài viết nào</p>
          <p className="mt-1 text-xs text-slate-400">Hãy quay lại sau nhé!</p>
        </div>
      )}
    </div>
  );
}

export default NewsTab;
