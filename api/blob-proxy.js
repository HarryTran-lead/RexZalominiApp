const ALLOWED_BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";

function getSingleQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }
  return typeof value === "string" ? value : "";
}

function buildAuthHeader() {
  const token =
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.Rex_ZMP_READ_WRITE_TOKEN ||
    "";

  return token ? `Bearer ${token}` : "";
}

function isAllowedBlobUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(ALLOWED_BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const rawUrl = getSingleQueryValue(req.query?.url);
  if (!rawUrl || !isAllowedBlobUrl(rawUrl)) {
    res.status(400).json({ message: "Invalid blob url" });
    return;
  }

  const authHeader = buildAuthHeader();
  if (!authHeader) {
    res.status(500).json({ message: "Blob token is missing" });
    return;
  }

  try {
    const upstream = await fetch(rawUrl, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ message: "Blob fetch failed" });
      return;
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const cacheControl = upstream.headers.get("cache-control") || "public, max-age=300";
    const bodyBuffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", cacheControl);
    res.status(200).send(bodyBuffer);
  } catch {
    res.status(502).json({ message: "Cannot proxy blob" });
  }
}
