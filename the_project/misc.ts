import path from "path";
import { mkdir, readdir, stat, access } from "fs/promises";

export const IMAGE_DIR = path.join(process.cwd(), "public");
export const IMAGE_FILE = path.join(IMAGE_DIR, "cached.jpg");
export const TIMESTAMP_FILE = path.join(IMAGE_DIR, "timestamp.txt");
export const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const fileExists = async (filePath: string) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const getCachedTimestamp = async () => {
  if (!(await fileExists(TIMESTAMP_FILE))) return 0;
  const tsText = await Bun.file(TIMESTAMP_FILE).text();
  return parseInt(tsText, 10) || 0;
};

export const saveTimestamp = async (ts: number) => {
  await Bun.write(TIMESTAMP_FILE, ts.toString());
};

export const downloadImage = async () => {
  const imageUrl = Bun.env.IMAGE_URL || "https://picsum.photos/1200";
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Failed to fetch image");

  const buffer = await res.arrayBuffer();

  // Ensure directory exists
  try {
    // suprisingly bun does not have mkdir yet
    await mkdir(IMAGE_DIR, { recursive: true });
  } catch (e) {
    console.log(`[image] Directory already exists: ${IMAGE_DIR}`);
  }

  await Bun.write(IMAGE_FILE, new Uint8Array(buffer));
  console.log(`[image] Wrote new image to ${IMAGE_FILE}`);
};

export const ensureImageDir = async () => {
  try {
    await mkdir(IMAGE_DIR, { recursive: true });
    // quick sanity: list after creation (ignore errors)
    console.log(`[image] Ensured directory: ${IMAGE_DIR}`);
  } catch (e) {
    console.error(`[image] Failed to ensure directory ${IMAGE_DIR}`, e);
    throw e;
  }
};

export const listPublicFiles = async () => {
  try {
    await ensureImageDir();
    const entries = await readdir(IMAGE_DIR);
    // add metadata to know how old the image is
    const detailed = await Promise.all(
      entries.map(async (name) => {
        try {
          const s = await stat(path.join(IMAGE_DIR, name));
          return {
            name,
            size: s.size,
            mtime: s.mtime.toISOString(),
          };
        } catch (e) {
          return { name, error: String(e) };
        }
      })
    );
    return { dir: IMAGE_DIR, files: detailed };
  } catch (e) {
    console.error(`[image] Failed to list public files in ${IMAGE_DIR}`, e);
    return e;
  }
};
