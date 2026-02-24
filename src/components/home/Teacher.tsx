import React from "react";
import { Box } from "zmp-ui";

const teachers = [
  {
    name: "Ms. Lisa",
    role: "Giáo viên Tiếng Anh",
    avatar: "https://ui-avatars.com/api/?name=Lisa&background=4F46E5&color=fff&size=200",
    experience: "5 năm kinh nghiệm",
  },
  {
    name: "Mr. David",
    role: "Giáo viên Bản ngữ",
    avatar: "https://ui-avatars.com/api/?name=David&background=EC4899&color=fff&size=200",
    experience: "7 năm kinh nghiệm",
  },
  {
    name: "Ms. Jenny",
    role: "Giáo viên chuyên nghiệp",
    avatar: "https://ui-avatars.com/api/?name=Jenny&background=10B981&color=fff&size=200",
    experience: "6 năm kinh nghiệm",
  },
];

const HomeTeacher: React.FC = () => {
  return (
    <Box className="py-16 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Đội ngũ <span className="text-blue-600">Giáo viên</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Giáo viên giàu kinh nghiệm, tận tâm với học sinh
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {teachers.map((teacher, index) => (
            <div
              key={index}
              className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-500"
              />
              <h3 className="text-xl font-bold mb-1">{teacher.name}</h3>
              <p className="text-blue-600 font-semibold mb-2">{teacher.role}</p>
              <p className="text-sm text-gray-600">{teacher.experience}</p>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default HomeTeacher;
