const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// listener
myEmitter.on("event", (text) => {
  console.log(text);
});

setTimeout(() => {
  myEmitter.emit("event", "hello");
}, 1000);
