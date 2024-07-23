const net  = require("net");
const fs   = require("fs");
const path = require("path");

// -- GET method handler
function GET(req, socket) {
  req = req.split('\r\n');

  req_root = req.find(line => line.startsWith("GET"));
  
  const rgx_origin_root  = /^GET\s\/\sHTTP\/1\.1$/;
  const rgx_origin_echo  = /^GET\s\/echo\/([^\s?]*)\sHTTP\/1\.1$/;
  const rgx_origin_usra  = /^GET\s\/user-agent\sHTTP\/1\.1$/;
  const rgx_origin_files = /^GET\s\/files\/[^\s?]*\sHTTP\/1\.1$/;

  if        (rgx_origin_root.test(req_root))  {
    if ((/\/\s/).test(req_root)) {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
      socket.end();
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.end();
    }
  } else if (rgx_origin_echo.test(req_root))  {
    if ((/echo/).test(req_root)) {
      let resp = rgx_origin_echo.exec(req_root);
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(resp[1])}\r\n\r\n${resp[1]}`);
      socket.end();
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.end();
    }
  } else if (rgx_origin_usra.test(req_root))  {
    if ((/user-agent:/i).test(req)) {
      let resp = req.find(line => line.startsWith("User-Agent:")).split(" ");
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(resp[1])}\r\n\r\n${resp[1]}`);
      socket.end();
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.end();
    }
  } else if (rgx_origin_files.test(req_root)) {
    let resp = req_root.split(/\s|\//);
    let dir  = process.argv[3]
    let file = resp[3];
    if (fs.existsSync(`/${dir}/${file}`)) {
      fs.readFile(`/${dir}/${file}`, "utf8", (err, data) => {
        data = data.toString();
        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${Buffer.byteLength(data)}\r\n\r\n${data}`);
        socket.end();
      });
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.end();
    }
  } else {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.end();
  }
}

// -- POST method handler
function POST(req, socket) {
  req = req.split('\r\n');

  req_root = req.find(line => line.startsWith("POST"));
  
  const rgx_origin_files = /^POST\s\/files\/[^\s?]*\sHTTP\/1\.1$/;

  if (rgx_origin_files.test(req_root)) {
    let resp = req_root.split(/\s|\//);
    let dir  = process.argv[3].toString();
    let file = resp[3].toString();
    let post = req[req.lastIndexOf("")+1];

    //console.log(`\r\nverify\r\n${dir}/${file}\r\n${post}\r\n`);
    fs.writeFile(`${dir}${file}`, `${post}`, (err) => err && console.error(err))

    if (fs.existsSync(`${dir}${file}`)) {
      fs.readFile(`${dir}${file}`, "utf8", (err, data) => {
        data = data.toString();
        socket.write(`HTTP/1.1 201 Created\r\n\r\n`);
        socket.end();
      });
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.end();
    }
  } else {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.end();
  }
}

// -- create server
const server = net.createServer(
(socket) => {
  // -- HTTP request handlers
  socket.on("data", (data) => {
    console.log(`Incoming request:\n${data.toString()}`);
    const req  = data.toString();

    if ((/^GET/).test(req)) { GET(req, socket); }
    
    if ((/^POST/).test(req)) { POST(req, socket); }
  });  

  // -- connection close handler
  socket.on("close", () => { socket.end(); });
});

server.listen(4221, "localhost");
