const NotationSyncService = require("./notationSyncService.js");
const dbSyncMixin = require("../math-ui/src/Mixins/dbSyncMixin.js");

//how to create dynamically?
//const channel = "L1";

const app = feathers();
//app.configure(socketio());

// add user to channel when user opens an exercise shared with him
//app.on("login", (conn) => {
/*if (conn.headers["connection"] !== "close") {
    dbSyncMixin.methods
      .getUserByToken(conn.headers["token"], conn.headers["authType"])
      .then((user) =>
        dbSyncMixin.methods
          .getAllExercises(user.id)
          .then((exercises) =>
            exercises.forEach((e) => app.channel("channel" + e.id).join(conn))
          )
      );
  }*/
//});

app.configure(
  socketio(function (io) {
    io.on("connection", function (socket) {
      //  authenticateUser =
      //socket.emit("news", { text: "A client connected!" });
      //socket.on("my other event", function (data) {
      //  console.log(data);
      //});
    });

    // Registering Socket.io middleware
    //io.use(function (socket, next) {
    // Exposing a request property to services and hooks
    //   socket.feathers.referrer = socket.request.referrer;
    //   next();
    // });
  })
);

app.use("notationSync", new NotationSyncService());

//app.publish((data) => app.channel(channel));
const PORT = process.env.PORT || 3030;
app
  .listen(PORT)
  .on("listening", () => console.log(`server running on port ${PORT}`));
