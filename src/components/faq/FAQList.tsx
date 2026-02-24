import React, { useState } from "react";
import { Box } from "zmp-ui";

const faqs = [
  {
    id: 1,
    category: "Chương trình học",
    question: "Trẻ em mấy tuổi có thể học?",
    answer: "Chúng tôi nhận học viên từ 3 tuổi trở lên. Chương trình được thiết kế phù hợp với từng độ tuổi và trình độ của trẻ.",
  },
  {
    id: 2,
    category: "Chương trình học",
    question: "Một lớp học có bao nhiêu học viên?",
    answer: "Lớp học của chúng tôi có từ 8-12 học viên để đảm bảo giáo viên có thể chăm sóc và theo dõi từng em một cách tốt nhất.",
  },
  {
    id: 3,
    category: "Học phí",
    question: "Học phí là bao nhiêu?",
    answer: "Học phí dao động từ 2-4 triệu/tháng tùy thuộc vào chương trình và độ tuổi. Chúng tôi có nhiều gói ưu đãi cho học viên đăng ký dài hạn.",
  },
  {
    id: 4,
    category: "Học phí",
    question: "Có chính sách hoàn học phí không?",
    answer: "Có, chúng tôi có chính sách hoàn học phí trong vòng 7 ngày đầu tiên nếu quý phụ huynh chưa hài lòng về chất lượng dịch vụ.",
  },
  {
    id: 5,
    category: "Giáo viên",
    question: "Giáo viên có trình độ như thế nào?",
    answer: "Đội ngũ giáo viên của chúng tôi đều tốt nghiệp chuyên ngành Sư phạm Tiếng Anh, có chứng chỉ giảng dạy quốc tế và kinh nghiệm từ 3-10 năm.",
  },
  {
    id: 6,
    category: "Cơ sở vật chất",
    question: "Trung tâm có những phòng học nào?",
    answer: "Chúng tôi có phòng học hiện đại, phòng đọc sách, khu vui chơi ngoài trời, phòng máy tính và phòng hoạt động ngoại khóa.",
  },
  {
    id: 7,
    category: "Đăng ký",
    question: "Làm thế nào để đăng ký học?",
    answer: "Quý phụ huynh có thể đăng ký trực tiếp tại trung tâm, qua hotline hoặc đăng ký online trên website của chúng tôi.",
  },
  {
    id: 8,
    category: "Đăng ký",
    question: "Có được học thử không?",
    answer: "Có, chúng tôi có buổi học thử miễn phí để phụ huynh và các em có thể trải nghiệm phương pháp giảng dạy của chúng tôi.",
  },
];

const categories = ["Tất cả", "Chương trình học", "Học phí", "Giáo viên", "Cơ sở vật chất", "Đăng ký"];

const FAQList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "Tất cả" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Box className="py-16 px-4 bg-sky-50">
      <div className="max-w-4xl mx-auto">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-sky-400 outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border-l-4 ${
                  isExpanded ? "border-sky-500" : "border-transparent"
                }`}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left px-6 py-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="text-xs text-sky-600 font-semibold mb-1">
                      {faq.category}
                    </div>
                    <h3 className="font-bold text-gray-900">{faq.question}</h3>
                  </div>
                  <div
                    className={`shrink-0 text-2xl transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ⌄
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤔</div>
            <p className="text-gray-600">Không tìm thấy câu hỏi phù hợp</p>
          </div>
        )}
      </div>
    </Box>
  );
};

export default FAQList;
