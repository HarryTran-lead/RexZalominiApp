import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { ImageIcon, PlayCircle, ChevronsUpDown } from "lucide-react";
import { authService } from "@/services/authService";
import { parentService } from "@/services/parentService";
import { ParentMediaItem } from "@/types/parent";
import { UserProfile } from "@/types/auth";
import { storage } from "@/utils/storage";
import { firstResolvedAssetUrl } from "@/utils/assetUrl";

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function imageUrl(item: ParentMediaItem): string {
  const record = item as ParentMediaItem & Record<string, unknown>;
  return (
    firstResolvedAssetUrl(
      item.thumbnailUrl,
      item.mediaUrl,
      typeof record.imageUrl === "string" ? record.imageUrl : undefined,
      typeof record.attachmentImageUrl === "string" ? record.attachmentImageUrl : undefined,
      typeof record.attachmentFileUrl === "string" ? record.attachmentFileUrl : undefined,
      typeof record.fileUrl === "string" ? record.fileUrl : undefined,
      typeof record.url === "string" ? record.url : undefined
    ) || "https://placehold.co/600x380/F3F4F6/9CA3AF?text=Media"
  );
}

function mediaFileUrl(item: ParentMediaItem): string {
  const record = item as ParentMediaItem & Record<string, unknown>;
  return firstResolvedAssetUrl(
    item.mediaUrl,
    typeof record.fileUrl === "string" ? record.fileUrl : undefined,
    typeof record.attachmentFileUrl === "string" ? record.attachmentFileUrl : undefined,
    typeof record.url === "string" ? record.url : undefined,
    typeof record.attachmentImageUrl === "string" ? record.attachmentImageUrl : undefined,
    typeof record.imageUrl === "string" ? record.imageUrl : undefined
  );
}

function isVideo(item: ParentMediaItem): boolean {
  const type = (item.mediaType || "").toLowerCase();
  const record = item as ParentMediaItem & Record<string, unknown>;
  const fallbackType = typeof record.fileType === "string" ? record.fileType.toLowerCase() : "";
  const url = mediaFileUrl(item).toLowerCase();
  return type.includes("video") || fallbackType.includes("video") || /\.(mp4|mov|webm|m3u8)$/.test(url);
}

function ParentMediaPage() {
  const { openSnackbar } = useSnackbar();

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [items, setItems] = useState<ParentMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<ParentMediaItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const loadedStudentsRef = useRef(false);

  const selectedStudent = useMemo(
    () => students.find((item) => item.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parentService.getMedia({
        studentProfileId: selectedStudentId || undefined,
        pageNumber: 1,
        pageSize: 60,
      });
      setItems(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải thư viện media";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  const openDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const detail = await parentService.getMediaDetail(id);
      if (detail) {
        setSelectedItem(detail);
        return;
      }
      openSnackbar({ text: "Không có dữ liệu chi tiết media", type: "warning" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể mở media";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setLoadingDetail(false);
    }
  }, [openSnackbar]);

  useEffect(() => {
    if (loadedStudentsRef.current) return;
    loadedStudentsRef.current = true;

    const bootstrapStudents = async () => {
      try {
        const response = await authService.getProfiles();
        const studentProfiles = response.data?.filter((item) => item.profileType === "Student") ?? [];
        setStudents(studentProfiles);

        if (studentProfiles.length > 0) {
          const savedProfileId = await storage.getItem("selectedProfileId");
          const defaultId =
            studentProfiles.find((item) => item.id === savedProfileId)?.id || studentProfiles[0].id;
          setSelectedStudentId((prev) => prev || defaultId);
        }
      } catch {
        openSnackbar({ text: "Không tải được danh sách học sinh", type: "error" });
      }
    };

    void bootstrapStudents();
  }, [openSnackbar]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4">
        <h1 className="text-center text-lg font-bold text-white">Media của con</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 pt-4">
        <div className="rounded-2xl border border-red-100 bg-white p-3">
          <label className="mb-1 block text-xs font-semibold text-gray-600">Học sinh</label>
          <Listbox value={selectedStudentId} onChange={setSelectedStudentId}>
            <div className="relative">
              <ListboxButton className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm">
                <span className="block truncate text-gray-800">
                  {selectedStudent?.displayName || "-- Chọn học sinh --"}
                </span>
                <ChevronsUpDown className="h-5 w-5 shrink-0 text-gray-400" />
              </ListboxButton>
              <ListboxOptions
                portal
                anchor="bottom start"
                className="z-[80] mt-2 max-h-60 w-[var(--button-width)] overflow-auto rounded-xl border border-gray-200 bg-white p-1 text-sm shadow-lg [--anchor-gap:8px]"
              >
                {students.map((student) => (
                  <ListboxOption
                    key={student.id}
                    value={student.id}
                    className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[focus]:text-red-600 data-[selected]:font-semibold"
                  >
                    {student.displayName}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
          Album học tập của con: hình ảnh, video lớp học và tư liệu được giáo viên chia sẻ.
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        )}

        {!loading && error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={loadMedia}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">Chưa có media nào cho học sinh này.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openDetail(item.id)}
                className="overflow-hidden rounded-2xl bg-white text-left shadow-sm"
              >
                <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                  <img src={imageUrl(item)} alt={item.title || "Media"} className="h-full w-full object-cover" />
                  <div className="absolute right-2 top-2 rounded-full bg-black/55 px-1.5 py-1 text-white">
                    {isVideo(item) ? <PlayCircle className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-2 text-xs font-semibold text-gray-800">
                    {item.title || item.classTitle || "Media lớp học"}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">{formatDate(item.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {(loadingDetail || selectedItem) && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 px-3 pb-3 pt-16">
          <div className="max-h-full w-full max-w-[430px] overflow-y-auto rounded-3xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Chi tiết media</h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
              >
                Đóng
              </button>
            </div>

            {loadingDetail && (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            )}

            {!loadingDetail && selectedItem && (
              <div>
                <div className="overflow-hidden rounded-2xl bg-gray-100">
                  {isVideo(selectedItem) && mediaFileUrl(selectedItem) ? (
                    <video controls className="h-56 w-full object-cover" src={mediaFileUrl(selectedItem)} />
                  ) : (
                    <img
                      src={imageUrl(selectedItem)}
                      alt={selectedItem.title || "Media"}
                      className="h-56 w-full object-cover"
                    />
                  )}
                </div>

                <h4 className="mt-3 text-sm font-bold text-gray-900">
                  {selectedItem.title || selectedItem.classTitle || "Media lớp học"}
                </h4>
                <p className="mt-1 text-xs text-gray-500">{formatDate(selectedItem.createdAt)}</p>
                {selectedItem.description && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {selectedItem.description}
                  </p>
                )}

                {mediaFileUrl(selectedItem) && (
                  <a
                    href={mediaFileUrl(selectedItem)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Mở file gốc
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Page>
  );
}

export default ParentMediaPage;
