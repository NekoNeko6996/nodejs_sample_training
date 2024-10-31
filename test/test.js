const testFunction = require("./module.js");
const fs = require("fs");
const path = require("path");

console.log(process.cwd());
console.log(process.argv);

var buf = Buffer.from("Hello World", "utf8");
console.log(buf);

// const interval = setInterval(() => {
//   console.log("Hello World");
// }, 1000);

// setTimeout(() => {
//   clearInterval(interval);
// }, 5000);

function test(callback) {
  console.log(callback());
}

test(() => {
  return "test callback";
});

testFunction(1, 2, (result) => {
  console.log(result);
});

fs.readFile("text.txt", "utf8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(data);
});

const text = "hello world";

fs.writeFile("text.txt", text, (err) => {
  if (err) {
    console.log(err);
    return;
  }
});


console.log(path.parse( "text.txt"));