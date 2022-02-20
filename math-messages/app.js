const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio");
const constants = require("./constants");

const app = feathers();
app.configure(socketio());

const AuthorizationService = require("./authorizationService");
const AuthenticationService = require("./authenticationService");
const HeartbeatService = require("./heartbeatService");
const SelectedRectSyncService = require("./selectedRectSyncService");
const SymbolSyncService = require("./symbolSyncService");

app.use("authorization", new AuthorizationService(app));
app.use("authentication", new AuthenticationService(app));
app.use("heartbeat", new HeartbeatService(app));
app.use("selectedRectSync", new SelectedRectSyncService(app));
app.use("symbolSync", new SymbolSyncService(app));

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

app.service("authentication").publish("created", (authentication, ctx) => {
  return [
    app.channel(
      constants.EXERCISE_CHANNEL_PREFIX +
        authentication.exerciseId +
        constants.USER_CHANNEL_PREFIX +
        authentication.userId
    ),
  ];
});

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

app.service("selectedRectSync").publish("updated", (rect, ctx) => {
  console.debug(
    `publish selected rect updated data: ${JSON.stringify(
      rect
    )} to channel: ${rect.ExerciseId.toString()}`
  );
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + rect.ExerciseId)];
});

app.service("symbolSync").publish("created", (symbol, ctx) => {
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + symbol.ExerciseId)];
});

app.service("symbolSync").publish("updated", (symbol, ctx) => {
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + symbol.ExerciseId)];
});

app.service("symbolSync").publish("removed", (symbol, ctx) => {
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + symbol.ExerciseId)];
});

const PORT = process.env.PORT || 3030;
app
  .listen(PORT)
  .on("listening", () => console.log(`server running on port ${PORT}`));
