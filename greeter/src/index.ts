const VERSION = process.env.VERSION || "v1";
const GREETING = process.env.GREETING || "Hello";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          greeting: GREETING,
          version: VERSION
        }),
        {
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (url.pathname === "/healthz") {
      return new Response("OK", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  }
});

console.log(`Greeter ${VERSION} listening on port ${server.port}`);
