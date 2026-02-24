import React from "react";
import { Box } from "zmp-ui";

const blogs = [
  {
    title: "5 Phương pháp học tiếng Anh hiệu quả cho trẻ",
    date: "15/02/2026",
    image: "https://via.placeholder.com/400x250/4F46E5/FFFFFF?text=Blog+1",
    description: "Khám phá những phương pháp học tiếng Anh giúp trẻ phát triển toàn diện...",
  },
  {
    title: "Tầm quan trọng của tiếng Anh trong thời đại 4.0",
    date: "10/02/2026",
    image: "https://via.placeholder.com/400x250/EC4899/FFFFFF?text=Blog+2",
    description: "Vì sao tiếng Anh lại quan trọng đối với con trong tương lai...",
  },
  {
    title: "Cách giúp con yêu thích học tiếng Anh",
    date: "05/02/2026",
    image: "https://via.placeholder.com/400x250/10B981/FFFFFF?text=Blog+3",
    description: "Những bí quyết để con hứng thú và gắn bó với tiếng Anh...",
  },
];

const HomeBlog: React.FC = () => {
  return (
    <Box className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Bản tin <span className="text-blue-600">mới nhất</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cập nhật những thông tin hữu ích về giáo dục tiếng Anh
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {blogs.map((blog, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-blue-600 font-semibold mb-2">
                  {blog.date}
                </div>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {blog.description}
                </p>
                <button className="text-blue-600 font-semibold hover:underline">
                  Đọc thêm →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default HomeBlog;
