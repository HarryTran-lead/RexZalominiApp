import { useNavigate } from "react-router-dom";
import { Button } from "zmp-ui";
import heroKids from "../../../assets/images/hero-kids.jpg";

interface HomeTabProps {
  isLinking: boolean;
  onQuickZaloLink: () => void;
}

const STEPS = [
  {
    num: "01",
    title: "Bậc Thầy Phát Âm",
    desc: "Chuẩn hoá âm – nhịp – trọng âm theo kiểu vui & dễ nhớ.",
    color: "bg-red-500",
  },
  {
    num: "02",
    title: "Tăng Cường Giao Tiếp",
    desc: "Giao tiếp phản xạ, trò chơi tình huống – tự tin nói.",
    color: "bg-orange-500",
  },
  {
    num: "03",
    title: "Khởi Đầu Thi Cử",
    desc: "Nền tảng Cambridge/Pre-TOEIC – làm bài không sợ.",
    color: "bg-amber-500",
  },
  {
    num: "04",
    title: "Kế Hoạch & Thói Quen",
    desc: "Thói quen 20–30'/ngày; ba mẹ theo dõi tiến độ.",
    color: "bg-red-400",
  },
  {
    num: "05",
    title: "Báo Cáo & Hướng Dẫn",
    desc: "Bảng tiến bộ hàng tháng & 1:1 coaching khi cần.",
    color: "bg-rose-500",
  },
  {
    num: "06",
    title: "Dự Án & Câu Lạc Bộ",
    desc: "CLB, field trip – dùng tiếng Anh ngoài lớp.",
    color: "bg-orange-600",
  },
];

const COURSES = [
  {
    badge: "Mọi Trình Độ",
    title: "Tiếng Anh Tổng Quát",
    schedule: "2 × 90' / tuần",
    students: "500+",
    color: "border-red-200 bg-red-50",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    badge: "Bán chạy",
    title: "IELTS Chuyên Sâu",
    schedule: "3 × 90' / tuần",
    students: "500+",
    color: "border-orange-200 bg-orange-50",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    badge: "6–17 tuổi",
    title: "Trẻ Em & Thiếu Niên",
    schedule: "2 × 60' / tuần",
    students: "500+",
    color: "border-amber-200 bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-700",
  },
];

const TEACHERS = [
  { name: "Cô Lily", flag: "🇬🇧", exp: "10+ năm", spec: "Cambridge Starters-Movers" },
  { name: "Cô Sunny", flag: "🇺🇸", exp: "8+ năm", spec: "Giao tiếp phản xạ" },
  { name: "Thầy Tom", flag: "🇦🇺", exp: "12+ năm", spec: "Cambridge Flyers" },
  { name: "Cô Emma", flag: "🇬🇧", exp: "9+ năm", spec: "IELTS cho trẻ em" },
];

const FEATURES = [
  { icon: "👥", label: "Lớp nhỏ", sub: "Tối đa 8 học viên" },
  { icon: "🌍", label: "GV quốc tế", sub: "Chuẩn bản ngữ" },
  { icon: "📅", label: "Lịch linh hoạt", sub: "Sáng/chiều/tối/cuối tuần" },
  { icon: "📊", label: "Kết quả đo lường", sub: "Tiến bộ hàng tuần" },
  { icon: "🏆", label: "Test đầu vào/ra", sub: "Miễn phí & chính xác" },
  { icon: "🚀", label: "Ứng dụng thực tế", sub: "Dự án – CLB – field trip" },
];

function HomeTab({ isLinking, onQuickZaloLink }: HomeTabProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 pb-4">
      {/* ─── HERO ─── */}
      <div className="relative overflow-hidden rounded-3xl shadow-md">
        <img
          src={heroKids}
          alt="Trẻ học tiếng Anh tại Rex"
          className="h-52 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="mb-1 inline-block rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
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
      <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
        <span className="text-lg">🎉</span>
        <div className="flex-1">
          <p className="text-xs font-bold text-orange-700">Ưu đãi khai giảng tháng 4</p>
          <p className="text-[11px] text-orange-600">Giảm 15% học phí – đăng ký trước 30/4</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="rounded-xl bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white active:bg-orange-600"
        >
          Đăng ký
        </button>
      </div>

      {/* ─── CTA BUTTONS ─── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex h-12 items-center justify-center rounded-2xl bg-red-600 text-sm font-bold text-white shadow-sm active:bg-red-700"
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={onQuickZaloLink}
          disabled={isLinking}
          className="flex h-12 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white shadow-sm active:bg-slate-800 disabled:opacity-60"
        >
          {isLinking ? "Đang xử lý..." : "Liên kết SĐT Zalo"}
        </button>
      </div>

      {/* ─── STATS ROW ─── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: "500+", label: "Học viên" },
          { value: "6", label: "Bước lộ trình" },
          { value: "5.0", label: "Đánh giá" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center rounded-2xl border border-red-100 bg-white py-3"
          >
            <span className="text-lg font-extrabold text-red-600">{s.value}</span>
            <span className="mt-0.5 text-[10px] text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ─── LỘ TRÌNH 6 BƯỚC ─── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-red-500" />
          <h2 className="text-base font-extrabold text-slate-900">Lộ trình học 6 bước</h2>
        </div>
        <div className="space-y-2">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${step.color}`}
              >
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── KHÁC BIỆT ─── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-orange-500" />
          <h2 className="text-base font-extrabold text-slate-900">Khác biệt tạo hiệu quả</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center rounded-2xl border border-red-100 bg-white p-3 text-center"
            >
              <span className="text-2xl">{f.icon}</span>
              <p className="mt-1 text-[11px] font-bold text-slate-900">{f.label}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── KHÓA HỌC ─── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-red-500" />
          <h2 className="text-base font-extrabold text-slate-900">Khóa Học Nổi Bật</h2>
        </div>
        <div className="space-y-3">
          {COURSES.map((c) => (
            <div
              key={c.title}
              className={`rounded-2xl border px-4 py-3 ${c.color}`}
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
                    <span className="text-[11px] text-slate-600">
                      {c.schedule}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {c.students} học viên
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="ml-3 shrink-0 rounded-xl bg-red-600 px-3 py-1.5 text-[11px] font-bold text-white active:bg-red-700"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── GIÁO VIÊN ─── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-amber-500" />
          <h2 className="text-base font-extrabold text-slate-900">Thầy Cô Siêu Vui Tính</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TEACHERS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-3 py-4 text-center shadow-sm"
            >
              <span className="text-3xl">{t.flag}</span>
              <p className="mt-1.5 text-xs font-extrabold text-slate-900">{t.name}</p>
              <p className="text-[10px] text-slate-500">{t.exp}</p>
              <p className="mt-1 text-[10px] leading-tight text-red-600">{t.spec}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIAL ─── */}
      <section className="rounded-3xl border border-red-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          ))}
          <span className="ml-1 text-xs font-bold text-slate-700">5.0/5.0</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          &ldquo;Giáo viên tận tâm, phương pháp dễ hiểu – tiến bộ rất nhanh! Con tôi từ 5.5 lên 7.5 chỉ trong 6 tháng.&rdquo;
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
            M
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Minh Anh</p>
            <p className="text-[10px] text-slate-500">Phụ huynh học viên · 5.5 → 7.5</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeTab;
