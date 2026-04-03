// ZaUI stylesheet
import "zmp-ui/zaui.css";
// Tailwind stylesheet
import "@/styles/tailwind.scss";
// Your stylesheet
import "@/styles/app.scss";

// React core
import React from "react";
import { createRoot } from "react-dom/client";

// Mount the app
import appConfig from "../app-config.json";
import AppLayout from "./layouts/AppLayout";

// Debug log for production
console.log("[v0] App starting...");
console.log("[v0] Environment:", import.meta.env.MODE);
console.log("[v0] ZALO_OA_ID available:", !!import.meta.env.VITE_ZALO_OA_ID);

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig as any;
}

// Error boundary wrapper
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] App Error:", error);
    console.error("[v0] Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(
        "div",
        {
          style: {
            padding: "20px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          },
        },
        React.createElement("h1", { style: { color: "#dc2626" } }, "Đã có lỗi xảy ra"),
        React.createElement(
          "p",
          { style: { color: "#666", marginTop: "10px" } },
          this.state.error?.message || "Unknown error"
        ),
        React.createElement(
          "button",
          {
            onClick: () => window.location.reload(),
            style: {
              marginTop: "20px",
              padding: "10px 20px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            },
          },
          "Tải lại trang"
        )
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("app");
if (rootElement) {
  console.log("[v0] Root element found, rendering app...");
  const root = createRoot(rootElement);
  root.render(
    React.createElement(
      ErrorBoundary,
      null,
      React.createElement(AppLayout)
    )
  );
} else {
  console.error("[v0] Root element #app not found!");
}
