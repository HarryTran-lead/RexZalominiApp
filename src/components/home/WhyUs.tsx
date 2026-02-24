import React from "react";
import { Box } from "zmp-ui";

const features = [
  {
    icon: "🎯",
    title: "Phương pháp hiện đại",
    description: "Áp dụng phương pháp giảng dạy tiên tiến từ các nước phát triển",
  },
  {
    icon: "👨‍🏫",
    title: "Giáo viên chất lượng",
    description: "Đội ngũ giáo viên giàu kinh nghiệm, nhiệt tình",
  },
  {
    icon: "📚",
    title: "Chương trình chuẩn quốc tế",
    description: "Theo chuẩn Cambridge, Oxford",
  },
  {
    icon: "🏆",
    title: "Kết quả cam kết",
    description: "Cam kết đầu ra cho học viên",
  },
];

const HomeWhyUs: React.FC = () => {
  return (
    <Box className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Tại sao chọn <span className="text-blue-600">RexKidzGo?</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi mang đến môi trường học tập chuyên nghiệp và hiệu quả nhất
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default HomeWhyUs;
