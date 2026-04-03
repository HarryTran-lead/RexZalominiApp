import { useState } from "react";

const FAQS = [
  {
    category: "Về Mini App",
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
    items: [
      {
        q: "Tôi có thể đăng nhập bằng số điện thoại không?",
        a: "Có. Bạn đăng nhập bằng số điện thoại đã đăng ký với Rex. Nếu chưa có tài khoản, liên hệ nhân viên trung tâm để được cấp.",
      },
      {
        q: "Liên kết SĐT Zalo để vào nhanh như thế nào?",
        a: "Bấm nút \"Liên kết SĐT Zalo\" ở trang chủ, ứng dụng sẽ tự động dùng số điện thoại đã liên kết với Zalo của bạn để đăng nhập – không cần nhập tay.",
      },
      {
        q: "Tôi quên mật khẩu thì phải làm sao?",
        a: "Liên hệ nhân viên Rex qua nút \"Liên hệ\" ở bottom bar để được hỗ trợ đặt lại mật khẩu nhanh chóng.",
      },
    ],
  },
  {
    category: "Học tập & Lịch học",
    items: [
      {
        q: "Tôi có thể xem lịch học của con ở đâu?",
        a: "Sau khi đăng nhập với vai trò Phụ huynh, vào mục \"Thời khoá biểu\" để xem đầy đủ lịch học theo tuần.",
      },
      {
        q: "Thầy cô có thể điểm danh qua Mini App không?",
        a: "Có! Giáo viên đăng nhập bằng tài khoản GV, vào mục \"Điểm danh\" và điểm danh ngay trên Mini App theo từng buổi học.",
      },
      {
        q: "Bài tập về nhà được giao như thế nào?",
        a: "Giáo viên đăng bài tập trực tiếp trên hệ thống. Học viên và phụ huynh sẽ thấy ngay trong mục \"Bài tập\" và nhận thông báo qua Zalo.",
      },
    ],
  },
  {
    category: "Khóa học & Học phí",
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

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-left shadow-sm active:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold leading-snug text-slate-900">{q}</p>
        <span
          className={`mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
            open ? "bg-red-500 text-white" : "bg-red-100 text-red-600"
          }`}
        >
          <svg
            className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
      {open && (
        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{a}</p>
      )}
    </button>
  );
}

function FAQTab() {
  return (
    <div className="space-y-5 pb-4">
      {/* ─── HEADER BANNER ─── */}
      <div className="rounded-3xl bg-red-600 px-5 py-5 text-white shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">
          Câu hỏi thường gặp
        </p>
        <h2 className="mt-1 text-lg font-extrabold leading-snug">
          Giải đáp mọi thắc mắc
          <br />
          về Rex Mini App
        </h2>
        <p className="mt-1.5 text-xs text-red-100">
          Không tìm thấy câu trả lời? Nhắn tin cho chúng tôi qua tab Liên hệ.
        </p>
      </div>

      {/* ─── FAQ ACCORDION BY CATEGORY ─── */}
      {FAQS.map((group) => (
        <section key={group.category}>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-1 w-4 rounded-full bg-red-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-600">
              {group.category}
            </h3>
          </div>
          <div className="space-y-2">
            {group.items.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      ))}

      {/* ─── CTA BOTTOM ─── */}
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-center">
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
