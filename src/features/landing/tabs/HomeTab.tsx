import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import heroKids from "../../../assets/images/hero-kids.jpg";

interface HomeTabProps {
  isLinking: boolean;
  onQuickZaloLink: () => void;
}

// ─── DATA ─────────────────────────────────────────────────────

const STEPS = [
  {
    num: 1,
    title: "Bậc Thầy Phát Âm",
    desc: "Chuẩn hoá âm – nhịp – trọng âm theo kiểu vui & dễ nhớ.",
    colors: ["#FFE4EC", "#FFB3C6"],
    accent: "#FF6B9D",
  },
  {
    num: 2,
    title: "Tăng Cường Giao Tiếp",
    desc: "Giao tiếp phản xạ, trò chơi tình huống – tự tin nói.",
    colors: ["#E0F4FF", "#A8DAFF"],
    accent: "#4A9FD4",
  },
  {
    num: 3,
    title: "Khởi Đầu Thi Cử",
    desc: "Nền tảng Cambridge/Pre-TOEIC – làm bài không sợ.",
    colors: ["#FFF3E0", "#FFCC80"],
    accent: "#FF9800",
  },
  {
    num: 4,
    title: "Kế Hoạch & Thói Quen",
    desc: "Thói quen 20–30'/ngày; ba mẹ theo dõi tiến độ.",
    colors: ["#E8F5E9", "#A5D6A7"],
    accent: "#4CAF50",
  },
  {
    num: 5,
    title: "Báo Cáo & Hướng Dẫn",
    desc: "Bảng tiến bộ hàng tháng & 1:1 coaching khi cần.",
    colors: ["#EDE7F6", "#B39DDB"],
    accent: "#9575CD",
  },
  {
    num: 6,
    title: "Dự Án & Câu Lạc Bộ",
    desc: "CLB, field trip – dùng tiếng Anh ngoài lớp.",
    colors: ["#E3F2FD", "#90CAF9"],
    accent: "#2196F3",
  },
];

const FEATURES = [
  { icon: "👥", label: "Lớp nhỏ", sub: "Tối đa 8 học viên – cá nhân hoá cao." },
  { icon: "🌍", label: "GV chuẩn quốc tế", sub: "Kinh nghiệm luyện thi & giao tiếp cho trẻ em." },
  { icon: "📅", label: "Lịch linh hoạt", sub: "Sáng/chiều/tối & cuối tuần." },
  { icon: "💡", label: "Ứng dụng thực tế", sub: "Dự án – CLB – field trip." },
  { icon: "📊", label: "Kết quả đo lường", sub: "Theo dõi tiến bộ hàng tuần." },
  { icon: "🏆", label: "Test đầu vào/ra", sub: "Miễn phí & chính xác." },
];

const COURSES = [
  {
    badge: "Mọi Trình Độ",
    title: "Tiếng Anh Tổng Quát",
    schedule: "2 × 90' / tuần",
    students: "500+",
    color: "border-red-200 bg-gradient-to-br from-red-50 to-orange-50",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    badge: "Bán chạy",
    title: "IELTS Chuyên Sâu",
    schedule: "3 × 90' / tuần",
    students: "500+",
    color: "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    badge: "6–17 tuổi",
    title: "Trẻ Em & Thiếu Niên",
    schedule: "2 × 60' / tuần",
    students: "500+",
    color: "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50",
    badgeColor: "bg-amber-100 text-amber-700",
  },
];

// ── TEACHER DATA với placeholder ảnh ──
const TEACHERS = [
  {
    name: "Cô Lily",
    flag: "🇬🇧",
    exp: "10+ năm",
    spec: "Cambridge Starters-Movers",
    // Placeholder: Bạn sẽ import ảnh vào đây
    // avatar: require("../../../assets/images/teachers/lily.jpg"),
    avatarPlaceholder: "L",
    bgColor: "bg-pink-100",
    textColor: "text-pink-700",
  },
  {
    name: "Cô Sunny",
    flag: "🇺🇸",
    exp: "8+ năm",
    spec: "Giao tiếp phản xạ",
    avatarPlaceholder: "S",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  {
    name: "Thầy Tom",
    flag: "🇦🇺",
    exp: "12+ năm",
    spec: "Cambridge Flyers",
    avatarPlaceholder: "T",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    name: "Cô Emma",
    flag: "🇬🇧",
    exp: "9+ năm",
    spec: "IELTS cho trẻ em",
    avatarPlaceholder: "E",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
];

// ── 5 TESTIMONIALS ──
const TESTIMONIALS = [
  {
    id: 1,
    rating: 5,
    text: "Giáo viên tận tâm, phương pháp dễ hiểu – tiến bộ rất nhanh! Con tôi từ 5.5 lên 7.5 chỉ trong 6 tháng.",
    name: "Minh Anh",
    role: "Phụ huynh học viên",
    detail: "5.5 → 7.5",
    avatar: "M",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  {
    id: 2,
    rating: 5,
    text: "Con gái tôi rất thích đi học. Cô giáo vui tính, lớp học sinh động. Bé tiến bộ thấy rõ sau 3 tháng!",
    name: "Thu Hà",
    role: "Phụ huynh học viên",
    detail: "Starter → Movers",
    avatar: "T",
    bgColor: "bg-pink-100",
    textColor: "text-pink-700",
  },
  {
    id: 3,
    rating: 5,
    text: "Lộ trình rõ ràng, bài tập vừa sức. Con tự tin giao tiếp hơn hẳn. Cảm ơn Rex rất nhiều!",
    name: "Hoàng Nam",
    role: "Phụ huynh học viên",
    detail: "Cambridge Flyers",
    avatar: "H",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    id: 4,
    rating: 5,
    text: "Con được học qua trò chơi, video sinh động. Thầy cô nhiệt tình giải đáp mọi thắc mắc của phụ huynh.",
    name: "Lan Phương",
    role: "Phụ huynh học viên",
    detail: "Movers → Flyers",
    avatar: "L",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  {
    id: 5,
    rating: 5,
    text: "Cơ sở sạch sẽ, đội ngũ chuyên nghiệp. Con háo hức đi học mỗi ngày. Sẽ giới thiệu cho bạn bè!",
    name: "Quốc Bảo",
    role: "Phụ huynh học viên",
    detail: "IELTS 6.5",
    avatar: "Q",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
];

// ─── CAROUSEL HOOK ────────────────────────────────────────────

function useCarousel(itemCount: number, autoPlayMs = 4000) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + itemCount) % itemCount);
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

  return { current, next, prev, goTo, setPaused };
}

// ─── COMPONENT ────────────────────────────────────────────────

function HomeTab({ isLinking, onQuickZaloLink }: HomeTabProps) {
  const navigate = useNavigate();
  const testimonialCarousel = useCarousel(TESTIMONIALS.length, 5000);
  const [animatedStats, setAnimatedStats] = useState({ students: 0, steps: 0, rating: 0 });

  // Animate stats on mount
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedStats({
        students: Math.round(500 * easeOut),
        steps: Math.round(6 * easeOut),
        rating: parseFloat((5.0 * easeOut).toFixed(1)),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 pb-4">
      {/* ─── HERO with animation ─── */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg animate-fade-in">
        <img
          src={heroKids}
          alt="Trẻ học tiếng Anh tại Rex"
          className="h-52 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="mb-1 inline-block rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white animate-pulse">
            Ưu đãi khai giảng
          </span>
          <h1 className="text-xl font-extrabold leading-tight text-white">
            Lộ trình Tiếng Anh Rex
            <br />
            <span className="text-orange-300">cho bé yêu</span>
          </h1>
          <p className="mt-1 text-xs text-white/80">
            Lớp nhỏ · Phát âm chuẩn · Giao tiếp tự tin
          </p>
        </div>
      </div>

      {/* ─── PROMO BADGE ─── */}
      <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 shadow-sm animate-slide-up">
        <span className="text-lg animate-bounce">🎉</span>
        <div className="flex-1">
          <p className="text-xs font-bold text-orange-700">Ưu đãi khai giảng tháng 4</p>
          <p className="text-[11px] text-orange-600">Giảm 15% học phí – đăng ký trước 30/4</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md active:scale-95 transition-transform"
        >
          Đăng ký
        </button>
      </div>

      {/* ─── CTA BUTTONS ─── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold text-white shadow-md active:scale-95 transition-transform"
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={onQuickZaloLink}
          disabled={isLinking}
          className="flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 text-xs font-semibold text-white shadow-md active:scale-95 transition-transform disabled:opacity-60"
        >
          {isLinking ? "Đang xử lý..." : "Liên kết SĐT Zalo"}
        </button>
      </div>

      {/* ─── ANIMATED STATS ROW ─── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: `${animatedStats.students}+`, label: "Học viên" },
          { value: animatedStats.steps.toString(), label: "Bước lộ trình" },
          { value: animatedStats.rating.toFixed(1), label: "Đánh giá" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="flex flex-col items-center rounded-2xl border border-red-100 bg-white py-3 shadow-sm"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="text-lg font-extrabold text-red-600">{s.value}</span>
            <span className="mt-0.5 text-[10px] text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ─── LỘ TRÌNH 6 BƯỚC (Clone from production) ─── */}
      <section>
        <div className="text-center mb-4">
          <h2 className="text-lg font-extrabold text-slate-900">
            Lộ trình học <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">6 bước</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Hành trình khám phá tiếng Anh đầy màu sắc dành riêng cho trẻ em
          </p>
        </div>
        
        {/* Timeline Grid */}
        <div className="relative">
          {/* Center timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-pink-400 via-green-400 to-blue-400 rounded-full hidden sm:block" />
          
          <div className="grid grid-cols-2 gap-3">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="relative overflow-hidden rounded-2xl p-4 shadow-sm border border-white/50 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${step.colors[0]} 0%, ${step.colors[1]} 100%)`,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                {/* Decorative shapes */}
                <div 
                  className="absolute -right-2 -top-2 h-12 w-12 rounded-xl opacity-30"
                  style={{ backgroundColor: step.accent }}
                />
                <div 
                  className="absolute right-4 top-8 h-3 w-3 rounded-full opacity-50"
                  style={{ backgroundColor: step.accent }}
                />
                <div 
                  className="absolute right-8 top-4 h-2 w-2 rounded-full opacity-40"
                  style={{ backgroundColor: step.accent }}
                />
                
                {/* Step number badge */}
                <span
                  className="absolute -left-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-white shadow-md"
                  style={{ backgroundColor: step.accent }}
                >
                  {step.num}
                </span>
                
                <div className="pt-4">
                  <p className="text-sm font-extrabold text-slate-800">{step.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{step.desc}</p>
                  
                  {/* Dots indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ 
                            backgroundColor: dot === 0 ? step.accent : `${step.accent}40`
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: step.accent }}>
                      Bước {step.num}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── KHÁC BIỆT TẠO HIỆU QUẢ (Clone from production) ─── */}
      <section>
        <div className="text-center mb-4">
          <h2 className="text-lg font-extrabold text-slate-900">
            Khác biệt tạo <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">hiệu quả</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Khám phá những điểm đặc biệt giúp KidzGo trở thành lựa chọn hàng đầu
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="group relative flex flex-col items-center rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-3 text-center shadow-sm transition-all hover:shadow-md active:scale-95"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Number badge */}
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[9px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-2xl transition-transform group-hover:scale-110">{f.icon}</span>
              <p className="mt-1.5 text-[11px] font-bold text-slate-900">{f.label}</p>
              <p className="mt-0.5 text-[9px] leading-tight text-slate-500">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── KHÓA HỌC ─── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
          <h2 className="text-base font-extrabold text-slate-900">Khóa Học Nổi Bật</h2>
        </div>
        <div className="space-y-3">
          {COURSES.map((c, i) => (
            <div
              key={c.title}
              className={`rounded-2xl border px-4 py-3 shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${c.color}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${c.badgeColor}`}
                  >
                    {c.badge}
                  </span>
                  <p className="mt-1.5 text-sm font-extrabold text-slate-900">{c.title}</p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="text-[11px] text-slate-600">{c.schedule}</span>
                    <span className="text-[11px] text-slate-600">{c.students} học viên</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="ml-3 shrink-0 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm active:scale-95 transition-transform"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── GIÁO VIÊN (Với placeholder cho ảnh) ─── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
          <h2 className="text-base font-extrabold text-slate-900">Thầy Cô Siêu Vui Tính</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TEACHERS.map((t, i) => (
            <div
              key={t.name}
              className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-3 py-4 text-center shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Avatar placeholder - Bạn sẽ thay bằng ảnh thật */}
              {/* <img src={t.avatar} alt={t.name} className="h-16 w-16 rounded-full object-cover" /> */}
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${t.bgColor} text-2xl font-bold ${t.textColor} transition-transform group-hover:scale-105`}>
                {t.avatarPlaceholder}
              </div>
              <span className="mt-2 text-xl">{t.flag}</span>
              <p className="mt-1 text-xs font-extrabold text-slate-900">{t.name}</p>
              <p className="text-[10px] text-slate-500">{t.exp}</p>
              <p className="mt-1 text-[10px] leading-tight text-red-600">{t.spec}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS CAROUSEL (5 reviews) ─── */}
      <section
        onMouseEnter={() => testimonialCarousel.setPaused(true)}
        onMouseLeave={() => testimonialCarousel.setPaused(false)}
        onTouchStart={() => testimonialCarousel.setPaused(true)}
        onTouchEnd={() => testimonialCarousel.setPaused(false)}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400" />
          <h2 className="text-base font-extrabold text-slate-900">Phụ huynh nói gì</h2>
        </div>
        
        <div className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-4 shadow-md">
          {/* Carousel content */}
          <div className="relative h-[180px] overflow-hidden">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.id}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  i === testimonialCarousel.current
                    ? "opacity-100 translate-x-0"
                    : i < testimonialCarousel.current
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                }`}
              >
                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, j) => (
                    <svg key={j} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-xs font-bold text-slate-700">{t.rating}.0/5.0</span>
                </div>
                
                {/* Quote */}
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  &ldquo;{t.text}&rdquo;
                </p>
                
                {/* Author */}
                <div className="mt-4 flex items-center gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.bgColor} text-sm font-bold ${t.textColor}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-500">{t.role} · {t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation dots */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => testimonialCarousel.goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === testimonialCarousel.current
                    ? "w-6 bg-amber-500"
                    : "w-2 bg-amber-200 hover:bg-amber-300"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          
          {/* Prev/Next arrows */}
          <button
            type="button"
            onClick={testimonialCarousel.prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md active:scale-90 transition-transform"
            aria-label="Previous"
          >
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={testimonialCarousel.next}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md active:scale-90 transition-transform"
            aria-label="Next"
          >
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomeTab;
