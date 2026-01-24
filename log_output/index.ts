import { existsSync, readFileSync } from "node:fs";

const LOG_FILE = "/usr/src/app/shared/log.txt";
const PING_PONG_URL = Bun.env.PING_PONG_URL || "http://ping-pong-svc/pongs";
const CONFIG_FILE = "/usr/src/app/config/information.txt";
const MESSAGE = Bun.env.MESSAGE || "No message set";
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

        let fileContent = "File not found";
        if (existsSync(CONFIG_FILE)) {
          fileContent = readFileSync(CONFIG_FILE, "utf-8").trim();
        }

        const output = `file content: ${fileContent}\nenv variable: MESSAGE=${MESSAGE}\n${timestamp}: ${uuid}.\nPing / Pongs: ${pongCount}`;
        return new Response(output, { status: 200 });
      } catch (e) {
        console.error("Error fetching pong count:", e);
        return new Response("Error fetching pong count", { status: 500 });
      }
    },
    "/health": () => new Response("ok"),
    "/healthz": () => new Response("ok"),
    "/readyz": async () => {
      try {
        // Check if we can connect to ping-pong service
        const response = await fetch(PING_PONG_URL, {
          signal: AbortSignal.timeout(2000)
        });

        if (!response.ok) {
          console.error("Ping-pong service returned non-ok status:", response.status);
          return new Response("ping-pong not ready", { status: 503 });
        }

        console.log("Ping-pong service is ready!");
        return new Response("ready", { status: 200 });
      } catch (error) {
        console.error("Ping-pong service not ready:", error);
        return new Response("ping-pong not reachable", { status: 503 });
      }
    }
  }
});

console.log(
  `Log output server started on port ${server.port}, UUID: ${uuid}, fetching pongs from ${PING_PONG_URL}`
);

// docker build --pull -t log-output . && docker run -d -p 3000:3000 -v $(pwd)/tmp:/shared log-output bun run writer.ts
