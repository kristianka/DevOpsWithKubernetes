import mySite from "./index.html";

const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  routes: {
    "/": mySite,
    "/hello": () => new Response("Hello, Bun!"),
    "/json": () =>
      new Response(JSON.stringify({ message: "Hello, JSON!" }), {
        headers: { "Content-Type": "application/json" },
      }),
  },
});

console.log(`Server started in port ${server.port}!`);

// docker build --pull -t project .
// docker run -d -p 3000:3000 project

// forwarding port in kube
// kubectl port-forward todo-server-dep-6f574656bd-m9z28 5000:5000
