const net = require("net");
const fs = require("fs");
const path = require("path");

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

    const stringReq = data.toString().split("\r\n\r\n");
    const requestData = stringReq[0].split("\r\n");
    const httpStartLine = requestData[0].split(" ");
    httpObj.method = httpStartLine[0];
    httpObj.path = httpStartLine[1];
    httpObj.body = stringReq.length > 1 ? stringReq[1] : "";

    const requestHeaders = requestData.slice(1);

    requestHeaders.forEach((headerLine) => {
      const splitHeader = headerLine.split(": ");
      httpObj.headers[String(splitHeader[0])] = String(splitHeader[1]);
    });

    if (httpObj.path == "/") {
      socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
    } else if (httpObj.path.startsWith("/echo")) {
      const parsedPath = httpObj.path.replace("/echo/", "");
      const parsedPathLength = parsedPath.length;
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${parsedPathLength}\r\n\r\n${parsedPath}\r\n\r\n`
      );
    } else if (httpObj.path.startsWith("/user-agent")) {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${httpObj.headers["User-Agent"].length}\r\n\r\n${httpObj.headers["User-Agent"]}\r\n\r\n`
      );
    } else if (httpObj.path.startsWith("/files")) {
      if (httpObj.method == "GET") {
        const directory = process.argv[3];
        const filename = httpObj.path.replace("/files/", "");
        fs.readFile(path.join(directory, filename), "utf8", (err, data) => {
          if (err) {
            socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
            socket.end();
          } else {
            socket.write(
              `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}\r\n\r\n`
            );
          }
        });
      } else if (httpObj.method == "POST") {
        const directory = process.argv[3];
        const filename = httpObj.path.replace("/files/", "");
        fs.writeFile(
          path.join(directory, filename),
          httpObj.body,
          (err, data) => {
            if (err) {
              socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
              socket.end();
            } else {
              socket.write(`HTTP/1.1 201 Created\r\n\r\n`);
            }
          }
        );
      }
    } else {
      socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
      socket.end();
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
