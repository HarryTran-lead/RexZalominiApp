import { Box, Button, Page, Text } from "zmp-ui";

function ParentPage() {
  return (
    <Page className="min-h-screen bg-slate-50">
      <Box className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-10">
        <header className="space-y-2">
          <Text.Title size="xLarge">Trang phụ huynh</Text.Title>
          <Text className="text-sm text-slate-500">
            Quản lý tiến độ học tập và học phí của học viên.
          </Text>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <Text.Title size="small">Tổng quan học tập</Text.Title>
            <Text className="text-sm text-slate-500">
              82% mục tiêu tuần đã hoàn thành.
            </Text>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <Text.Title size="small">Học phí</Text.Title>
            <Text className="text-sm text-slate-500">
              Còn lại 500.000 ₫ · Hạn 15/01/2025.
            </Text>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <Text.Title size="small">Thông báo & phê duyệt</Text.Title>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Xác nhận học phí kỳ 1.</li>
            <li>• Báo cáo tuần 12 đã sẵn sàng.</li>
          </ul>
        </div>

        <Button fullWidth>Trao đổi với trung tâm</Button>
      </Box>
    </Page>
  );
}

export default ParentPage;