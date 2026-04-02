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


// Expose app configuration
import appConfig from "../app-config.json";
import AppLayout from "./layouts/AppLayout";

const renderBootstrapError = (message: string) => {
  const container = document.getElementById("app");
  if (!container) return;

  container.innerHTML = `
    <div style="padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#991b1b;background:#fef2f2;min-height:100vh;box-sizing:border-box;">
      <h2 style="margin:0 0 8px 0;font-size:18px;">Ung dung gap loi khoi tao</h2>
      <p style="margin:0;line-height:1.5;">${message}</p>
    </div>
  `;
};

try {
  if (!window.APP_CONFIG) {
    window.APP_CONFIG = appConfig as any;
  }

  const appElement = document.getElementById("app");

  if (!appElement) {
    throw new Error("Khong tim thay #app de mount ung dung.");
  }

  const root = createRoot(appElement);
  root.render(React.createElement(AppLayout));
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Loi khong xac dinh";
  console.error("App bootstrap failed:", error);
  renderBootstrapError(errorMessage);
}
