const app = require('express')();
const http = require('http').Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

const documents = {};

io.on("connection", socket => {

  let previousId;

  const safeJoin = currentId => {
    socket.leave(previousId);
    socket.join(currentId, () => {
      console.log(`Socket ${socket.id} joined room ${currentId}`);
    });
    previousId = currentId;
  }

  socket.on("getDoc", (docId) => {
    console.log("🚀 ~ file: app.js ~ line 25 ~ socket.on ~ docId", docId)

    safeJoin(docId);
    socket.emit("document", documents[docId]);
  });

  socket.on("addDoc", (doc) => {
    console.log("🚀 ~ file: app.js ~ line 32 ~ socket.on ~ doc", doc)

    documents[doc.id] = doc;
    safeJoin(doc.id);
    io.emit("documents", Object.keys(documents));
    socket.emit("document", doc);
  });

  socket.on("editDoc", (doc) => {
    console.log("🚀 ~ file: app.js ~ line 41 ~ socket.on ~ doc", doc)
    documents[doc.id] = doc;
    socket.to(doc.id).emit("document", doc);
  });

  io.emit("documents", Object.keys(documents));

  console.log(`Socket ${socket.id} has connected`);

})

http.listen(4444, () => {
  console.log("Listening on port 4444");
});

