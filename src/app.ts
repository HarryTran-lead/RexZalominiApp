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

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig as any;
}

const root = createRoot(document.getElementById("app")!);
root.render(React.createElement(AppLayout));
