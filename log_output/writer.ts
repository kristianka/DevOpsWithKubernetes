// import { appendFileSync, mkdirSync } from "node:fs";

// const LOG_FILE = "/usr/src/app/shared/log.txt";
// const DIR = LOG_FILE.substring(0, LOG_FILE.lastIndexOf("/"));
// mkdirSync(DIR, { recursive: true });

const uuid = crypto.randomUUID();
// const writeLine = () => {
//   const line = `${new Date().toISOString()}\t${uuid}`;
//   appendFileSync(LOG_FILE, line + "\n");
//   console.log("wrote:", line);
// };

// writeLine();
// setInterval(writeLine, 5000);

// console.log(`Writer started, appending to ${LOG_FILE}`);

setInterval(() => {
  console.log(`${new Date().toISOString()}: ${uuid}`);
}, 5000);

console.log(`Writer started with UUID: ${uuid}`);
