const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const httpObj = {
      method: "",
      path: "",
      headers: {},
    };

    const requestData = data.toString().split("\r\n\r\n")[0].split("\r\n");
    const httpStartLine = requestData[0].split(" ");
    httpObj.method = httpStartLine[0];
    httpObj.path = httpStartLine[1];

    const requestHeaders = requestData.slice(1);

    requestHeaders.forEach((headerLine) => {
      const splitHeader = headerLine.split(": ");
      httpObj.headers[String(splitHeader[0])] = String(splitHeader[1]);
    });

    const parsedPath = httpObj.path.replace("/echo/", "");
    const parsedPathLength = parsedPath.length;

    if (httpObj.path == "/") {
      socket.write(
        `HTTP/1.1 200 OK\r\n\r\n`
      );
    } else if (httpObj.path.startsWith("/echo")) {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${parsedPathLength}\r\n\r\n${parsedPath}\r\n\r\n`
      );
    } else if (httpObj.path.startsWith("/user-agent")) {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${httpObj.headers["User-Agent"].length}\r\n\r\n${httpObj.headers["User-Agent"]}\r\n\r\n`
      );
    } else {
      socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
    }
  });
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost", () => {
  console.log("server bound port 4221");
});
