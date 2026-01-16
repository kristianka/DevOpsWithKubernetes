import { initDB } from "./db";
import { getCounter, incrementCounter } from "./requests";

await initDB();

const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  routes: {
    "/": async (req) => {
      try {
        const counter = await incrementCounter();
        console.log("Received / request, counter =", counter);
        return new Response(`pong ${counter}`);
      } catch (error) {
        console.error("Error handling / request", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    },
    "/pongs": async (req) => {
      try {
        const counter = await getCounter();
        console.log("Received /pongs request, counter =", counter);
        return new Response(counter.toString());
      } catch (error) {
        console.error("Error handling /pongs request", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }
  }
});

console.log(`Server started in port ${server.port}!`);

// docker build --pull -t ping-pong . && docker run -d -p 3000:3000 ping-pong
