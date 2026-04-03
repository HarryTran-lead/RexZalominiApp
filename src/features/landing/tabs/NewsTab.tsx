import { useState } from "react";
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

function NewsCard({ item, featured }: { item: NewsItem; featured?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ${
        featured ? "flex-col" : "flex h-28"
      }`}
    >
      {featured ? (
        <>
          <div className="relative h-40 w-full">
            <img src={item.img} alt={item.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.tagColor}`}
            >
              {item.tag}
            </span>
          </div>
          <div className="p-3.5">
            <h3 className="text-sm font-extrabold leading-snug text-slate-900">{item.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.excerpt}</p>
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span>{item.views.toLocaleString()} xem</span>
                <span>{item.likes} thích</span>
                <span>{item.comments} bình luận</span>
              </div>
              <span className="text-[10px] text-slate-400">{item.date}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <img src={item.img} alt={item.title} className="h-28 w-24 shrink-0 object-cover" />
          <div className="flex flex-1 flex-col justify-between px-3 py-2.5">
            <div>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${item.tagColor}`}
              >
                {item.tag}
              </span>
              <h3 className="mt-1 text-xs font-bold leading-snug text-slate-900">{item.title}</h3>
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

function NewsTab() {
  const [activeTag, setActiveTag] = useState("Tất cả");

  const filtered =
    activeTag === "Tất cả" ? NEWS : NEWS.filter((n) => n.tag === activeTag);

  const [featured, ...rest] = filtered;

  return (
    <div className="space-y-4 pb-4">
      {/* ─── HEADER ─── */}
      <div>
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

      {/* ─── TAG FILTER ─── */}
      <div className="-mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {TAGS_FILTER.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                activeTag === tag
                  ? "bg-red-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ─── FEATURED CARD ─── */}
      {featured && <NewsCard item={featured} featured />}

      {/* ─── REST OF CARDS ─── */}
      {rest.length > 0 && (
        <div className="space-y-2.5">
          {rest.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="text-4xl">📭</span>
          <p className="mt-3 text-sm font-bold text-slate-600">Chưa có bài viết nào</p>
          <p className="mt-1 text-xs text-slate-400">Hãy quay lại sau nhé!</p>
        </div>
      )}
    </div>
  );
}

export default NewsTab;
