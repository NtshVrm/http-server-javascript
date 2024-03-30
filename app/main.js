const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const requestData = data.toString().split("\r\n");
    const httpStartLine = requestData[0].split(" ");

    const parsedPath = httpStartLine[1].replace("/echo", "");
    const parsedPathLength = parsedPath.length;

    if(httpStartLine[1].startsWith("/echo")){
        socket.write(
            `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${parsedPathLength}\r\n\r\n ${parsedPath}\r\n\r\n`
          );
    }else{
        socket.write(
            `HTTP/1.1 404 Not Found\r\n\r\n`
          );
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
