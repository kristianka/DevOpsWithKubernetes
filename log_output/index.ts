// print uuid every 5 seconds
const uuid = crypto.randomUUID();
setInterval(() => {
  console.log(`${new Date().toISOString()}: ${uuid}`);
}, 5000);

const server = Bun.serve({
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
  routes: {
    "/": (req) => {
      return new Response(`${new Date().toISOString()}: ${uuid}`);
    },
  },
});

console.log(`Server started in port ${server.port}!`);

// docker build --pull -t log-output . && docker run -d -p 3000:3000 log-output
