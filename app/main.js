const net     = require("net");

// -- GET request handler
function GET(req, socket) {
  req = req.split('\r\n');

  req_root = req.find(line => line.startsWith("GET"));
  req_usra = req.find(line => line.startsWith("User-Agent:"));
  
  const rgx_origin_root = /^GET\s\/\sHTTP\/1\.1$/;
  const rgx_origin_echo = /^GET\s\/echo\/([^\s?]*)\sHTTP\/1\.1$/;
  const rgx_origin_usra = /^GET\s\/user-agent\sHTTP\/1\.1$/;

  if        (rgx_origin_root.test(req_root)) {
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
  } else if (rgx_origin_echo.test(req_root)) {
    let resp = rgx_origin_echo.exec(req_root);
    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(resp[1]).toString()}\r\n\r\n${resp[1]}`);
  } else if (rgx_origin_usra.test(req_root)) {
    let resp = req_usra.split(" ");
    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(resp[1]).toString()}\r\n\r\n${resp[1]}`);
  } else                                     {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
  }
}

// -- create server
const server = net.createServer(
(socket) => {
  // -- HTTP request handlers
  socket.on("data", (data) => {
    console.log(`Incoming request:\n${data.toString()}`);
    const req  = data.toString();

    GET(req, socket);

    socket.end();
  });  

  // -- connection close handler
  socket.on("close", () => { socket.end(); });
});

server.listen(4221, "localhost");
