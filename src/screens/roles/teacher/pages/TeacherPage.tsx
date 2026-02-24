import { Box, Button, Page, Text } from "zmp-ui";

function TeacherPage() {
  return (
    <Page className="min-h-screen bg-white">
      <Box className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-10">
        <header className="space-y-2">
          <Text.Title size="xLarge">Trang giáo viên</Text.Title>
          <Text className="text-sm text-slate-500">
            Theo dõi lịch dạy và thống kê hiệu suất giảng dạy.
          </Text>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <Text.Title size="small">Lớp đang dạy</Text.Title>
            <Text className="text-sm text-slate-500">4 lớp</Text>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <Text.Title size="small">Buổi hôm nay</Text.Title>
            <Text className="text-sm text-slate-500">2 buổi</Text>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <Text.Title size="small">Thông báo</Text.Title>
            <Text className="text-sm text-slate-500">3 thông báo mới</Text>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <Text.Title size="small">Lịch dạy sắp tới</Text.Title>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• IELTS Foundation - A1 · 08:00 - 10:00</li>
            <li>• TOEIC Intermediate · 14:00 - 16:00</li>
          </ul>
        </div>

        <Button fullWidth variant="secondary">
          Xem lịch đầy đủ
        </Button>
      </Box>
    </Page>
  );
}

export default TeacherPage;