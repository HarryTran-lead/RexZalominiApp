import { useState } from "react";

const FAQS = [
  {
    category: "Về Mini App",
    icon: "📱",
    items: [
      {
        q: "Rex Mini App dùng để làm gì?",
        a: "Phụ huynh, học viên, giáo viên theo dõi lịch học, điểm danh, bài tập và thông báo trên cùng một ứng dụng. Tất cả trong lòng bàn tay qua Zalo.",
      },
      {
        q: "Mini App có miễn phí không?",
        a: "Hoàn toàn miễn phí! Bạn chỉ cần có tài khoản Zalo và đã đăng ký học tại Rex English Centre là có thể dùng ngay.",
      },
    ],
  },
  {
    category: "Đăng nhập & Tài khoản",
    icon: "🔐",
    items: [
      {
        q: "Tôi có thể đăng nhập bằng số điện thoại không?",
        a: "Có. Bạn đăng nhập bằng số điện thoại đã đăng ký với Rex. Nếu chưa có tài khoản, liên hệ nhân viên trung tâm để được cấp.",
      },
      {
        q: "Liên kết SĐT Zalo để vào nhanh như thế nào?",
        a: 'Bấm nút "Liên kết SĐT Zalo" ở trang chủ, ứng dụng sẽ tự động dùng số điện thoại đã liên kết với Zalo của bạn để đăng nhập – không cần nhập tay.',
      },
      {
        q: "Tôi quên mật khẩu thì phải làm sao?",
        a: 'Liên hệ nhân viên Rex qua nút "Liên hệ" ở bottom bar để được hỗ trợ đặt lại mật khẩu nhanh chóng.',
      },
    ],
  },
  {
    category: "Học tập & Lịch học",
    icon: "📚",
    items: [
      {
        q: "Tôi có thể xem lịch học của con ở đâu?",
        a: 'Sau khi đăng nhập với vai trò Phụ huynh, vào mục "Thời khoá biểu" để xem đầy đủ lịch học theo tuần.',
      },
      {
        q: "Thầy cô có thể điểm danh qua Mini App không?",
        a: 'Có! Giáo viên đăng nhập bằng tài khoản GV, vào mục "Điểm danh" và điểm danh ngay trên Mini App theo từng buổi học.',
      },
      {
        q: "Bài tập về nhà được giao như thế nào?",
        a: 'Giáo viên đăng bài tập trực tiếp trên hệ thống. Học viên và phụ huynh sẽ thấy ngay trong mục "Bài tập" và nhận thông báo qua Zalo.',
      },
    ],
  },
  {
    category: "Khóa học & Học phí",
    icon: "💰",
    items: [
      {
        q: "Một lớp có bao nhiêu học viên?",
        a: "Rex áp dụng mô hình lớp nhỏ – tối đa 8 học viên mỗi lớp để giáo viên có thể theo sát từng bé.",
      },
      {
        q: "Test đầu vào có tốn phí không?",
        a: "Hoàn toàn miễn phí! Rex cung cấp bài kiểm tra đầu vào và đầu ra để xếp lớp chính xác và đo lường tiến bộ.",
      },
      {
        q: "Rex có dạy Cambridge không?",
        a: "Có. Rex có lộ trình Cambridge Starters → Movers → Flyers đầy đủ với giáo viên chuyên luyện thi có kinh nghiệm 8–12 năm.",
      },
    ],
  },
];

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

      {/* ─── FAQ ACCORDION BY CATEGORY ─── */}
      {FAQS.map((group, groupIndex) => (
        <section
          key={group.category}
          className="animate-slide-up"
          style={{ animationDelay: `${groupIndex * 100}ms` }}
        >
          <div className="mb-2.5 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-100 text-sm">
              {group.icon}
            </span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-600">
              {group.category}
            </h3>
          </div>
          <div className="space-y-2">
            {group.items.map((item, itemIndex) => (
              <FAQItem
                key={item.q}
                q={item.q}
                a={item.a}
                index={groupIndex * 3 + itemIndex}
              />
            ))}
          </div>
        </section>
      ))}

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
