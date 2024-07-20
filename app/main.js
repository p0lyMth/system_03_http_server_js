const net     = require("net");

// -- GET request handler
function GET(req, socket) {
  rgx_origin_root = /^GET\s\/\sHTTP\/1\.1$/;
  rgx_origin_echo = /^GET\s\/echo\/([^\s?]*)\sHTTP\/1\.1$/;

  if (rgx_origin_root.test(req)) {
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
  } else if (rgx_origin_echo.test(req)) {
    const resp = rgx_origin_echo.exec(req);
    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(resp[1])}\r\n\r\n${resp[1]}`);
  } else {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
  }
}

// -- create server
const server = net.createServer(
(socket) => {
  // -- GET request handler
  socket.on("data", (data) => {
    console.log(`Incoming request:\n${data.toString()}`);
    const req  = data.toString().split('\r\n')[0];

    GET(req, socket);

    socket.end();
  });  

  // -- connection close handler
  socket.on("close", () => { socket.end(); });
});

server.listen(4221, "localhost");
