import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmClassName?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  confirmClassName = "bg-red-600 hover:bg-red-700",
  isLoading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <h2 className="text-center text-lg font-bold text-gray-900">{title}</h2>
        {message && <p className="mt-2 text-center text-sm text-gray-500">{message}</p>}

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition active:scale-95 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl py-2.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50 ${confirmClassName}`}
          >
            {isLoading ? "Đang gửi..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
