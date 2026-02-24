import React, { useState } from "react";
import { Box } from "zmp-ui";

const blogs = [
  {
    id: 1,
    title: "5 Phương pháp học tiếng Anh hiệu quả cho trẻ mầm non",
    category: "Phương pháp học",
    date: "20/02/2026",
    author: "Ms. Lisa",
    image: "https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Blog+1",
    excerpt: "Khám phá những phương pháp học tiếng Anh độc đáo giúp trẻ mầm non phát triển kỹ năng ngôn ngữ một cách tự nhiên và hiệu quả...",
  },
  {
    id: 2,
    title: "Tầm quan trọng của tiếng Anh trong thời đại 4.0",
    category: "Kiến thức",
    date: "18/02/2026",
    author: "Mr. David",
    image: "https://via.placeholder.com/600x400/EC4899/FFFFFF?text=Blog+2",
    excerpt: "Trong thời đại công nghệ 4.0, tiếng Anh không chỉ là công cụ giao tiếp mà còn là chìa khóa mở ra nhiều cơ hội trong tương lai...",
  },
  {
    id: 3,
    title: "Cách giúp con yêu thích học tiếng Anh từ nhỏ",
    category: "Tâm lý học đường",
    date: "15/02/2026",
    author: "Ms. Jenny",
    image: "https://via.placeholder.com/600x400/10B981/FFFFFF?text=Blog+3",
    excerpt: "Những bí quyết đơn giản nhưng hiệu quả giúp con hứng thú và gắn bó với việc học tiếng Anh từ những năm tháng đầu đời...",
  },
  {
    id: 4,
    title: "Lợi ích của việc học tiếng Anh sớm cho trẻ",
    category: "Kiến thức",
    date: "12/02/2026",
    author: "Ms. Lisa",
    image: "https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Blog+4",
    excerpt: "Nghiên cứu khoa học chứng minh rằng việc tiếp xúc với ngôn ngữ thứ hai từ sớm mang lại nhiều lợi ích cho sự phát triển trí não...",
  },
  {
    id: 5,
    title: "10 Trò chơi học tiếng Anh thú vị tại nhà",
    category: "Phương pháp học",
    date: "10/02/2026",
    author: "Mr. David",
    image: "https://via.placeholder.com/600x400/8B5CF6/FFFFFF?text=Blog+5",
    excerpt: "Cùng khám phá những trò chơi đơn giản nhưng hiệu quả giúp bé học tiếng Anh vui vẻ ngay tại nhà mỗi ngày...",
  },
  {
    id: 6,
    title: "Cách phát âm chuẩn tiếng Anh cho trẻ em",
    category: "Kỹ năng",
    date: "08/02/2026",
    author: "Ms. Jenny",
    image: "https://via.placeholder.com/600x400/EF4444/FFFFFF?text=Blog+6",
    excerpt: "Hướng dẫn chi tiết cách luyện phát âm chuẩn tiếng Anh cho trẻ từ những âm cơ bản đến các từ phức tạp hơn...",
  },
];

const categories = ["Tất cả", "Phương pháp học", "Kiến thức", "Tâm lý học đường", "Kỹ năng"];

const BlogList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = selectedCategory === "Tất cả" || blog.category === selectedCategory;
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Box className="py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-purple-400 outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-2"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    {blog.category}
                  </span>
                  <span className="text-xs text-gray-500">{blog.date}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-purple-600 transition">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">👤 {blog.author}</span>
                  <button className="text-purple-600 font-semibold text-sm hover:underline">
                    Đọc thêm →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600">Không tìm thấy bài viết phù hợp</p>
          </div>
        )}
      </div>
    </Box>
  );
};

export default BlogList;
