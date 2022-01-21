const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio");
const SymbolSyncService = require("./symbolSyncService");
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
app.use("symbolSync", new SymbolSyncService(app));

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

app.service("symbolSync").publish("created", (symbol, ctx) => {
  console.debug(
    `publish symbol created data: ${JSON.stringify(
      symbol
    )} to channel: ${symbol.ExerciseId.toString()}`
  );
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + symbol.ExerciseId)];
});

app.service("symbolSync").publish("updated", (symbol, ctx) => {
  console.debug(
    `publish symbol updated data: ${JSON.stringify(
      symbol
    )} to channel: ${symbol.ExerciseId.toString()}`
  );
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + symbol.ExerciseId)];
});

app.service("symbolSync").publish("removed", (symbol, ctx) => {
  console.debug(
    `publish symbol removed data: ${JSON.stringify(
      symbol
    )} to channel: ${symbol.ExerciseId.toString()}`
  );
  return [app.channel(constants.EXERCISE_CHANNEL_PREFIX + symbol.ExerciseId)];
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
