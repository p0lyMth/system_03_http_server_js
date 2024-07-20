const net     = require("net");

const server = net.createServer(
(socket) => {
  // -- GET request handler
  socket.on("data", (data) => {
    console.log(`Incoming request:\n${data.toString()}`);

    const req  = data.toString().split('\r\n')[0];
    rgx_origin = /^GET\s\/\sHTTP\/1\.1$/g;
    if (rgx_origin.test(req)) {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

    socket.end();
  });  

  // -- close handler
  socket.on("close", () => { socket.end(); });
});

server.listen(4221, "localhost");
