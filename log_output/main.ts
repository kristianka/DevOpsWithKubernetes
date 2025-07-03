// run with e.g. deno: deno main.ts
// print uuid every 5 seconds
const uuid = crypto.randomUUID();
setInterval(() => {
  console.log(`${new Date().toISOString()}: ${uuid}`);
}, 5000);
