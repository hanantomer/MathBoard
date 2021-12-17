const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio");
const NotationSyncService = require("./notationSyncService.js");
const AuthenticationService = require("./authenticationService");
const CursorSyncService = require("./cursorSyncService.js");
const HeartbeatService = require("./heartbeatService.js");

const app = feathers();
app.configure(socketio());

app.use("heartbeat", new HeartbeatService(app));
app.use("authentication", new AuthenticationService(app));
app.use("cursorSync", new CursorSyncService(app));
app.use("notationSync", new NotationSyncService(app));

app.service("notationSync").publish("created", (notation, ctx) => {
  console.debug(
    `publish notation created data: ${JSON.stringify(
      notation
    )} to channel: ${notation.ExerciseId.toString()}`
  );
  return [app.channel(`channel${notation.ExerciseId.toString()}`)];
});

app.service("heartbeat").publish("updated", (user, ctx) => {
  console.debug(
    `heartbeat: ${JSON.stringify(
      user
    )} to channel: ${user.ExerciseId.toString()}`
  );
  return [app.channel(`channel${user.ExerciseId.toString()}`)];
});

app.service("notationSync").publish("updated", (notation, ctx) => {
  console.debug(
    `publish notation updated data: ${JSON.stringify(
      notation
    )} to channel: ${notation.ExerciseId.toString()}`
  );
  return [app.channel(`channel${notation.ExerciseId.toString()}`)];
});

app.service("notationSync").publish("removed", (notation, ctx) => {
  console.debug(
    `publish notation removed data: ${JSON.stringify(
      notation
    )} to channel: ${notation.ExerciseId.toString()}`
  );
  return [app.channel(`channel${notation.ExerciseId.toString()}`)];
});

app.service("cursorSync").publish("updated", (cursorPosition, ctx) => {
  console.debug(
    `publish cursor updated data: ${JSON.stringify(
      cursorPosition
    )} to channel: ${cursorPosition.ExerciseId.toString()}`
  );
  return [app.channel(`channel${cursorPosition.ExerciseId.toString()}`)];
});

const PORT = process.env.PORT || 3030;
app
  .listen(PORT)
  .on("listening", () => console.log(`server running on port ${PORT}`));
