import React from "react";
import { Box } from "zmp-ui";

const testimonials = [
  {
    name: "Phụ huynh Minh Anh",
    avatar: "https://ui-avatars.com/api/?name=Minh+Anh&background=4F46E5&color=fff",
    rating: 5,
    comment: "Con tôi rất thích học ở đây. Giáo viên nhiệt tình và chuyên nghiệp.",
  },
  {
    name: "Phụ huynh Thu Hà",
    avatar: "https://ui-avatars.com/api/?name=Thu+Ha&background=EC4899&color=fff",
    rating: 5,
    comment: "Môi trường học tập tốt, con tiến bộ rõ rệt sau 3 tháng học.",
  },
  {
    name: "Phụ huynh Văn Nam",
    avatar: "https://ui-avatars.com/api/?name=Van+Nam&background=10B981&color=fff",
    rating: 5,
    comment: "Chương trình học bài bản, giá cả hợp lý. Rất hài lòng!",
  },
];

const HomeTestimonials: React.FC = () => {
  return (
    <Box className="py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Phụ huynh <span className="text-blue-600">Nói gì</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Những phản hồi tích cực từ phụ huynh và học viên
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <div className="flex text-yellow-400">
                    {"★".repeat(testimonial.rating)}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default HomeTestimonials;
