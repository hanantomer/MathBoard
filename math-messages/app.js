const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio");
const NotationSyncService = require("./notationSyncService");
const AuthenticationService = require("./authenticationService");
const SelectedRectSyncService = require("./selectedRectSyncService");
const HeartbeatService = require("./heartbeatService");
const AuthorizationService = require("./authorizationService");
const constants = require("./constants");

const app = feathers();
app.configure(socketio());

app.use("authorization", new AuthorizationService(app));
app.use("heartbeat", new HeartbeatService(app));
app.use("authentication", new AuthenticationService(app));
app.use("selectedRectSync", new SelectedRectSyncService(app));
app.use("notationSync", new NotationSyncService(app));

app.service("heartbeat").publish("updated", (heartbeat, ctx) => {
  return [
    app.channel(
      constants.EXERCISE_CHANNEL_PREFIX +
        heartbeat.exerciseId +
        constants.USER_CHANNEL_PREFIX +
        heartbeat.userId
    ),
  ];
});

app.service("authorization").publish("updated", (authorization, ctx) => {
  return [
    app.channel(
      constants.EXERCISE_CHANNEL_PREFIX +
        authorization.exerciseId +
        constants.USER_CHANNEL_PREFIX +
        authorization.userId
    ),
  ];
});

app.service("notationSync").publish("created", (notation, ctx) => {
  console.debug(
    `publish notation created data: ${JSON.stringify(
      notation
    )} to channel: ${notation.ExerciseId.toString()}`
  );
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + notation.ExerciseId)];
});

app.service("notationSync").publish("updated", (notation, ctx) => {
  console.debug(
    `publish notation updated data: ${JSON.stringify(
      notation
    )} to channel: ${notation.ExerciseId.toString()}`
  );
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + notation.ExerciseId)];
});

app.service("notationSync").publish("removed", (notation, ctx) => {
  console.debug(
    `publish notation removed data: ${JSON.stringify(
      notation
    )} to channel: ${notation.ExerciseId.toString()}`
  );
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + notation.ExerciseId)];
});

app.service("selectedRectSync").publish("updated", (rect, ctx) => {
  console.debug(
    `publish selected rect updated data: ${JSON.stringify(
      rect
    )} to channel: ${rect.ExerciseId.toString()}`
  );
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + rect.ExerciseId)];
});

const PORT = process.env.PORT || 3030;
app
  .listen(PORT)
  .on("listening", () => console.log(`server running on port ${PORT}`));
