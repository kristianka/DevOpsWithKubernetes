import { existsSync, readFileSync } from "node:fs";

const LOG_FILE = "/usr/src/app/shared/log.txt";
const PING_PONG_URL = Bun.env.PING_PONG_URL || "http://ping-pong-svc/pongs";
const uuid = crypto.randomUUID();

const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  routes: {
    "/": async () => {
      console.log("Received request for /");
      try {
        const response = await fetch(PING_PONG_URL);
        if (!response.ok) {
          console.error("Failed to fetch pongs:", response.statusText);
          throw new Error(`Failed to fetch pongs: ${response.status}`);
        }
        const pongCount = await response.text();
        const timestamp = new Date().toISOString();
        const output = `${timestamp}: ${uuid}.\nPing / Pongs: ${pongCount}`;
        return new Response(output, { status: 200 });
      } catch (e) {
        console.error("Error fetching pong count:", e);
        return new Response("Error fetching pong count", { status: 500 });
      }
    },
    "/health": () => new Response("ok")
  }
});

console.log(
  `Log output server started on port ${server.port}, UUID: ${uuid}, fetching pongs from ${PING_PONG_URL}`
);

// docker build --pull -t log-output . && docker run -d -p 3000:3000 -v $(pwd)/tmp:/shared log-output bun run writer.ts
