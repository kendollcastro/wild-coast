"use client";

import { preconnect } from "react-dom";

export function ResourceHints() {
  preconnect("https://images.unsplash.com", { crossOrigin: "anonymous" });
  return null;
}