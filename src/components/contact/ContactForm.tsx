import React, { useState } from "react";
import { Box, useSnackbar } from "zmp-ui";

const ContactForm: React.FC = () => {
  const { openSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name || !formData.phone) {
      openSnackbar({
        text: "Vui lòng điền đầy đủ thông tin!",
        type: "error",
      });
      return;
    }

    // Success
    openSnackbar({
      text: "Gửi thông tin thành công! Chúng tôi sẽ liên hệ lại sớm.",
      type: "success",
    });

    // Reset form
    setFormData({
      name: "",
      phone: "",
      email: "",
      message: "",
    });
  };

  return (
    <Box className="py-16 px-4 bg-gradient-to-br from-green-50 to-teal-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-black mb-6">Gửi thông tin liên hệ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email (tùy chọn)"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nội dung
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Nhập nội dung cần tư vấn..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-400 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-teal-700 transition shadow-lg"
              >
                Gửi thông tin
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-black mb-6">Thông tin liên hệ</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                    📍
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Địa chỉ</h3>
                    <p className="text-gray-600">123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    📞
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Hotline</h3>
                    <p className="text-gray-600">1900-xxxx</p>
                    <p className="text-gray-600">(+84) 123-456-789</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                    ✉️
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p className="text-gray-600">info@rexkidzgo.vn</p>
                    <p className="text-gray-600">support@rexkidzgo.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                    🕐
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Giờ làm việc</h3>
                    <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                    <p className="text-gray-600">Thứ 7 - CN: 8:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="w-full h-64 bg-gradient-to-br from-green-200 to-teal-200 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>Bản đồ vị trí</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default ContactForm;
