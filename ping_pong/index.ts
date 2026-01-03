import { appendFileSync, mkdirSync } from "node:fs";

// const LOG_FILE = "/usr/src/app/shared/log.txt";
// const DIR = LOG_FILE.substring(0, LOG_FILE.lastIndexOf("/"));
// mkdirSync(DIR, { recursive: true });

let counter = 0;
const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  routes: {
    "/pingpong": (req) => {
      try {
        counter += 1;
        // removed in 2.1, remount volumes also in deployment.yaml in both log_output and ping_pong
        // writeLine(counter);
        return new Response(`pong ${counter}`);
      } catch (error) {
        console.error("Error handling /pingpong request", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    },
    "/pongs": (req) => {
      try {
        console.log("Received /pongs request, counter =", counter);
        return new Response(counter.toString());
      } catch (error) {
        console.error("Error handling /pongs request", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }
  }
});

// const writeLine = (counter: number) => {
//     const line = `${new Date().toISOString()} PING / PONG: ${counter}`;
//     appendFileSync(LOG_FILE, line + "\n");
//     console.log("wrote:", line);
// };

console.log(`Server started in port ${server.port}!`);

// docker build --pull -t ping-pong . && docker run -d -p 3000:3000 ping-pong
