import { API_CONFIG } from "@/constants/apiURL";

function toBlobProxyUrl(rawUrl: string): string {
  return `/api/blob-proxy?url=${encodeURIComponent(rawUrl)}`;
}

function normalizeExternalAssetUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    if (parsed.pathname.startsWith("/api/blob-proxy")) {
      return rawUrl;
    }

    if (parsed.hostname.includes(".blob.vercel-storage.com")) {
      return toBlobProxyUrl(parsed.toString());
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
}

export function resolveBackendAssetUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "";

  const normalized = rawUrl.trim();
  if (!normalized) return "";

  if (
    /^(https?:)?\/\//i.test(normalized) ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalizeExternalAssetUrl(normalized);
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
