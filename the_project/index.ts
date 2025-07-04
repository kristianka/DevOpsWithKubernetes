const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  fetch(req) {
    return new Response("Bun!");
  },
});

console.log(`Server started in port ${server.port}!`);

// docker build --pull -t project .
// docker run -d -p 3000:3000 project
