import { existsSync, readFileSync } from "node:fs";

const LOG_FILE = "/usr/src/app/shared/log.txt";
const PING_PONG_URL = Bun.env.PING_PONG_URL || "http://ping-pong-svc/pongs";
const GREETER_URL = Bun.env.GREETER_URL || "http://greeter-svc";
const CONFIG_FILE = "/usr/src/app/config/information.txt";
const MESSAGE = Bun.env.MESSAGE || "No message set";
const uuid = crypto.randomUUID();

interface GreeterResponse {
  greeting: string;
  version: string;
}

const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  routes: {
    "/": async () => {
      console.log("Received request for /");
      try {
        // Fetch pong count
        const pongResponse = await fetch(PING_PONG_URL);
        if (!pongResponse.ok) {
          console.error("Failed to fetch pongs:", pongResponse.statusText);
          throw new Error(`Failed to fetch pongs: ${pongResponse.status}`);
        }
        const pongCount = await pongResponse.text();

        // Fetch greeting
        let greeting = "Greeting unavailable";
        try {
          const greeterResponse = await fetch(GREETER_URL);
          if (greeterResponse.ok) {
            const greeterData = (await greeterResponse.json()) as GreeterResponse;
            greeting = `${greeterData.greeting} (${greeterData.version})`;
          }
        } catch (e) {
          console.error("Error fetching greeting:", e);
        }

        const timestamp = new Date().toISOString();

        let fileContent = "File not found";
        if (existsSync(CONFIG_FILE)) {
          fileContent = readFileSync(CONFIG_FILE, "utf-8").trim();
        }

        const output = `file content: ${fileContent}\nenv variable: MESSAGE=${MESSAGE}\n${timestamp}: ${uuid}.\nGreeting: ${greeting}\nPing / Pongs: ${pongCount}`;
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
