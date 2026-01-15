import {
  CACHE_DURATION_MS,
  downloadImage,
  fileExists,
  getCachedTimestamp,
  IMAGE_FILE,
  saveTimestamp,
  ensureImageDir,
  listPublicFiles,
  IMAGE_DIR
} from "../misc";
import { getTodos, addTodo } from "../routes/todos";
import { initDB } from "./db";

let inFlightDownload: Promise<void> | null = null;

// Prepare dir on startup
ensureImageDir();

// Initialize database on startup
await initDB();

// frontend ENV injection setup
const CLIENT_API = Bun.env.CLIENT_API || "http://localhost:3000"; // fallback for local dev
let clientBundleCache: { code: string; api: string } | null = null;

const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  routes: {
    [`/project`]: () =>
      new Response(Bun.file("index.html"), {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      }),
    // bundle & serve React client (injecting CLIENT_API as process.env.CLIENT_API)
    [`/project/client.js`]: async () => {
      try {
        if (clientBundleCache && clientBundleCache.api === CLIENT_API) {
          return new Response(clientBundleCache.code, {
            headers: { "Content-Type": "application/javascript" }
          });
        }

        // inject env vars. looks so hacky but according to docs this is as intended...
        const result = await Bun.build({
          entrypoints: ["./client/main.tsx"],
          target: "browser",
          sourcemap: Bun.env.NODE_ENV === "production" ? "none" : "inline",
          define: {
            "process.env.CLIENT_API": JSON.stringify(CLIENT_API)
          }
        });

        if (!result.outputs.length) {
          return new Response("Build failed", { status: 500 });
        }

        const code = await result.outputs[0].text();
        clientBundleCache = { code, api: CLIENT_API };

        return new Response(code, {
          headers: { "Content-Type": "application/javascript" }
        });
      } catch (e) {
        console.error("Failed building client", e);
        return new Response("Error building client", { status: 500 });
      }
    },
    [`/project/hello`]: () => new Response("Hello, Bun!"),
    [`/project/json`]: () =>
      new Response(JSON.stringify({ message: "Hello, JSON!" }), {
        headers: { "Content-Type": "application/json" }
      }),

    [`/project/hourly-image`]: async () => {
      try {
        const now = Date.now();
        const lastUpdated = await getCachedTimestamp();

        // check if file needs to be updated
        if (!(await fileExists(IMAGE_FILE)) || now - lastUpdated > CACHE_DURATION_MS) {
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
            headers: { "Retry-After": "5" }
          });
        }

        const imgFile = Bun.file(IMAGE_FILE);
        return new Response(imgFile.stream(), {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=600"
          }
        });
      } catch (err) {
        console.log("Error loading image", err);
        return new Response("Error loading image", { status: 500 });
      }
    },

    // reveals all public files. good for debugging
    [`/project/debug/public`]: async () => {
      const info = await listPublicFiles();
      return new Response(JSON.stringify(info, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    },

    // Todo routes
    [`/project/todos`]: (req: Request) => {
      if (req.method === "GET") {
        return getTodos(req);
      } else if (req.method === "POST") {
        return addTodo(req);
      }
      return new Response("Method not allowed", { status: 405 });
    }
  }
});

console.log(`Server started on port ${server.port}! Using IMAGE_DIR=${IMAGE_DIR}`);
