const http = require("http");

const server = http.createServer((req, res) => {
  get("/", req, () => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("<h1>Home</h1>");
    return res.end();
  });

  get("/hello", req, () => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("<h1>Hello</h1>");
    return res.end();
  });

  post("/api/v1/get/user", req, () => {
    const user = {
      name: "John",
      age: 30,
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(user));
    return res.end();
  });

  default_(req, res);
});

// Hàm xử lý POST
function post(path, req, callback) {
  if (req.url === path && req.method === "POST") {
    callback();
  }
}

// Hàm xử lý GET
function get(path, req, callback) {
  if (req.url === path && req.method === "GET") {
    callback();
  }
}

function default_(req, res) {
  if (!res.headersSent) {
    if (req.method === "GET") {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.write("<h1>Page not found</h1>");
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.write(
        JSON.stringify({
          status: "error",
          message: "Method not allowed",
        })
      );
    }
    res.end();
  }
}

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
