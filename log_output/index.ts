import { existsSync, readFileSync } from "node:fs";

const LOG_FILE = "/usr/src/app/shared/log.txt";

const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  routes: {
    "/": () => {
      console.log("Received request for /");
      // prevent crash
      if (!existsSync(LOG_FILE)) {
        return new Response("No data yet", { status: 200 });
      }
      try {
        // read file
        const data = readFileSync(LOG_FILE, "utf8");
        return new Response(data, { status: 200 });
      } catch (e) {
        return new Response("Error reading log file", { status: 500 });
      }
    },
    "/health": () => new Response("ok"),
  },
});

console.log(
  `Reader server started on port ${server.port}, watching ${LOG_FILE}`
);

// docker build --pull -t log-output . && docker run -d -p 3000:3000 -v $(pwd)/tmp:/shared log-output bun run writer.ts
