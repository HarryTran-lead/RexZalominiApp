import { API_CONFIG } from "@/constants/apiURL";

export function resolveBackendAssetUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "";

  const normalized = rawUrl.trim();
  if (!normalized) return "";

  if (
    /^(https?:)?\/\//i.test(normalized) ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalized;
  }

  const base = API_CONFIG.BASE_URL || "";
  if (!base) return normalized;

  try {
    const origin = new URL(
      base,
      typeof window !== "undefined" ? window.location.origin : "http://localhost"
    ).origin;
    return `${origin}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
  } catch {
    return normalized;
  }
}

export function firstResolvedAssetUrl(
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    const resolved = resolveBackendAssetUrl(candidate);
    if (resolved) return resolved;
  }
  return "";
}
