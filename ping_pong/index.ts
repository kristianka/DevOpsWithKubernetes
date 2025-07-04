let counter = 0;
const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  routes: {
    "/pingpong": (req) => {
      counter += 1;
      return new Response(`pong ${counter}`);
    },
  },
});

console.log(`Server started in port ${server.port}!`);

// docker build --pull -t ping-pong . && docker run -d -p 3000:3000 ping-pong
