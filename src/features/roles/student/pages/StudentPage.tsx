import { Box, Button, Page, Text } from "zmp-ui";

function StudentPage() {
  return (
    <Page className="min-h-screen bg-white">
      <Box className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10">
        <header className="space-y-2">
          <Text.Title size="xLarge">Trang học viên</Text.Title>
          <Text className="text-sm text-slate-500">
            Xin chào! Đây là không gian học tập của bạn.
          </Text>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <Text.Title size="small">Buổi học hôm nay</Text.Title>
            <Text className="text-sm text-slate-500">
              19:00 - 21:00 · Lớp tiếng Anh A1
            </Text>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <Text.Title size="small">Nhiệm vụ</Text.Title>
            <Text className="text-sm text-slate-500">
              2 bài tập cần hoàn thành trước thứ sáu.
            </Text>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <Text.Title size="small">Thông báo mới</Text.Title>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Tải tài liệu buổi 8 trong mục Tài liệu.</li>
            <li>• Bài viết chủ đề Giáng Sinh hạn nộp 22/12.</li>
          </ul>
        </div>

        <Button fullWidth variant="secondary">
          Vào lớp học
        </Button>
      </Box>
    </Page>
  );
}

export default StudentPage;