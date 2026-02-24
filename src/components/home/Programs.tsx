import React from "react";
import { Box } from "zmp-ui";

const programs = [
  {
    title: "Chương trình Mầm non",
    age: "3-5 tuổi",
    description: "Làm quen tiếng Anh qua trò chơi và hoạt động vui nhộn",
    color: "from-pink-400 to-rose-500",
  },
  {
    title: "Chương trình Tiểu học",
    age: "6-10 tuổi",
    description: "Phát triển 4 kỹ năng: Nghe, Nói, Đọc, Viết",
    color: "from-blue-400 to-cyan-500",
  },
  {
    title: "Chương trình THCS",
    age: "11-14 tuổi",
    description: "Nâng cao kiến thức và chuẩn bị cho các kỳ thi",
    color: "from-purple-400 to-indigo-500",
  },
];

const HomePrograms: React.FC = () => {
  return (
    <Box className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Chương trình <span className="text-blue-600">Đào tạo</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chương trình học được thiết kế theo từng độ tuổi, phù hợp với sự phát triển của trẻ
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((program, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-r ${program.color} p-4 rounded-xl mb-4`}>
                <div className="text-white text-center">
                  <div className="text-2xl font-bold mb-1">{program.age}</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{program.title}</h3>
              <p className="text-gray-600">{program.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default HomePrograms;
