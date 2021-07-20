const app = require('express')();
// const cors = require("cors");

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
// app.use(cors(corsOptions));
app.use(require("cors")(corsOptions));

const http = require('http').Server(app);
const io = require('socket.io')(http);

const documents = {};

io.on("connection", socket => {
  console.log("🚀 ~ file: app.js ~ line 8 ~ socket", socket)

  let previousId;

  const safeJoin = currentId => {
    socket.leave(previousId);
    socket.join(currentId, () => {
      console.log(`Socket ${socket.id} joined room ${currentId}`);
    });
    previousId = currentId;
  }

  socket.on("getDoc", (docId) => {
    console.log("🚀 ~ file: app.js ~ line 21 ~ socket.on ~ docId", docId)
    safeJoin(docId);
    socket.emit("document", documents[docId]);
  });

  socket.on("addDoc", (doc) => {
    console.log("🚀 ~ file: app.js ~ line 27 ~ socket.on ~ doc", doc)
    documents[doc.id] = doc;
    safeJoin(doc.id);
    io.emit("documents", Object.keys(documents));
    socket.emit("document", doc);
  });

  socket.on("editDoc", (doc) => {
    console.log("🚀 ~ file: app.js ~ line 35 ~ socket.on ~ doc", doc)
    documents[doc.id] = doc;
    socket.to(doc.id).emit("document", doc);
  });

  io.emit("documents", Object.keys(documents));

  console.log(`Socket ${socket.id} has connected`);

})

http.listen(4444, () => {
  console.log("Listening on port 4444");
});

