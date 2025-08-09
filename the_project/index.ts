import mySite from "./index.html";
import {
  CACHE_DURATION_MS,
  downloadImage,
  fileExists,
  getCachedTimestamp,
  IMAGE_FILE,
  saveTimestamp,
  ensureImageDir,
  listPublicFiles,
  IMAGE_DIR,
} from "./misc";

let inFlightDownload: Promise<void> | null = null;

// Prepare dir on startup
ensureImageDir();

const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  routes: {
    "/": mySite,
    "/hello": () => new Response("Hello, Bun!"),
    "/json": () =>
      new Response(JSON.stringify({ message: "Hello, JSON!" }), {
        headers: { "Content-Type": "application/json" },
      }),

    "/hourly-image": async () => {
      try {
        const now = Date.now();
        const lastUpdated = await getCachedTimestamp();

        // check if file needs to be updated
        if (
          !(await fileExists(IMAGE_FILE)) ||
          now - lastUpdated > CACHE_DURATION_MS
        ) {
          if (!inFlightDownload) {
            inFlightDownload = (async () => {
              try {
                await downloadImage();
                await saveTimestamp(Date.now());
                console.log("Downloaded new image");
              } catch (err) {
                console.error("Failed to download new image", err);
              } finally {
                inFlightDownload = null;
              }
            })();
          }
          // Allow first requester to await; others can proceed to serve old file if present
          await inFlightDownload;
        } else {
          console.log("Serving cached image");
        }

        if (!(await fileExists(IMAGE_FILE))) {
          return new Response("Image not yet available, try again shortly", {
            status: 503,
            headers: { "Retry-After": "5" },
          });
        }

        const imgFile = Bun.file(IMAGE_FILE);
        return new Response(imgFile.stream(), {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=600",
          },
        });
      } catch (err) {
        console.log("Error loading image", err);
        return new Response("Error loading image", { status: 500 });
      }
    },
    // reveals all public files. good for debugging
    "/debug/public": async () => {
      const info = await listPublicFiles();
      return new Response(JSON.stringify(info, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    },
  },
});

console.log(
  `Server started on port ${server.port}! Using IMAGE_DIR=${IMAGE_DIR}`
);
