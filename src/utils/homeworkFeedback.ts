export function translateTeacherFeedback(feedback?: string | null): string {
  const raw = String(feedback || "").trim();
  if (!raw) return "";

  const normalized = raw.toLowerCase();
  if (
    normalized ===
    "automatically graded 0 because the homework was not submitted before the deadline.".toLowerCase() ||
    (normalized.includes("automatically graded 0") && normalized.includes("not submitted before the deadline"))
  ) {
    return "Tự động chấm 0 điểm vì bài tập chưa được nộp trước hạn.";
  }

  return raw;
}