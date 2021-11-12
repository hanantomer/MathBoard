const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio");
const NotationSyncService = require("./notationSyncService.js");
const AuthenticationService = require("./authenticationService");

const app = feathers();
app.configure(socketio());

// add user to channel when user opens an exercise shared with him
// app.on("login", (conn) => {
//   if (conn.headers["connection"] !== "close") {
//     dbSyncMixin.methods
//       .getUserByToken(conn.headers["token"], conn.headers["authType"])
//       .then((user) =>
//         dbSyncMixin.methods
//           .getAllExercises(user.id)
//           .then((exercises) =>
//             exercises.forEach((e) => app.channel("channel" + e.id).join(conn))
//           )
//       );
//   }
// });

app.configure(
  socketio(function (io) {
    //     io.on("connection", function (socket) {
    //       //  authenticateUser =
    //       //socket.emit("news", { text: "A client connected!" });
    //       //socket.on("my other event", function (data) {
    //       //  console.log(data);
    //       //});
    //     });
    //     // Registering Socket.io middleware
    //     //io.use(function (socket, next) {
    //     // Exposing a request property to services and hooks
    //     //   socket.feathers.referrer = socket.request.referrer;
    //     //   next();
    //     // });
  })
);

app.use("notationSync", new NotationSyncService());
app.use("authentication", new AuthenticationService(app));

// Here you can also add service specific event publishers
// e.g. the publish the `users` service `created` event to the `admins` channel
// app.service('users').publish('created', () => app.channel('admins'));

// With the userid and email organization from above you can easily select involved users
app.service("notationSync").publish("created", (data, ctx) => {
  return [app.channel(`channel${ctx.data.ExerciseId}`)];
});

//app.publish((data) => app.channel(channel));
const PORT = process.env.PORT || 3030;
app
  .listen(PORT)
  .on("listening", () => console.log(`server running on port ${PORT}`));
