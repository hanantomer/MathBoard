const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio");
const constants = require("./constants");

const app = feathers();
app.configure(socketio());

const AuthorizationService = require("./authorizationService");
const AuthenticationService = require("./authenticationService");
const HeartbeatService = require("./heartbeatService");
const currentPositionSyncService = require("./currentPositionSyncService");
const NotationSyncService = require("./notationSyncService");

app.use("authorization", new AuthorizationService(app));
app.use("authentication", new AuthenticationService(app));
app.use("heartbeat", new HeartbeatService(app));
app.use("currentPosition", new currentPositionSyncService(app));
app.use("notationSync", new NotationSyncService(app));

app.service("authorization").publish("updated", (authorization, ctx) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        authorization.lessonId +
        constants.USER_CHANNEL_PREFIX +
        authorization.userId
    ),
  ];
});

app.service("authentication").publish("created", (authentication, ctx) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        authentication.lessonId +
        constants.USER_CHANNEL_PREFIX +
        authentication.userId
    ),
  ];
});

app.service("heartbeat").publish("updated", (heartbeat, ctx) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        heartbeat.lessonId +
        constants.USER_CHANNEL_PREFIX +
        heartbeat.userId
    ),
  ];
});

app.service("currentPosition").publish("updated", (position, ctx) => {
  console.debug(
    `publish selected rect updated data: ${JSON.stringify(
      position
    )} to channel: ${position.LessonId.toString()}`
  );
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + position.LessonId)];
});

app.service("notationSync").publish("created", (notation, ctx) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + notation.LessonId)];
});

app.service("notationSync").publish("updated", (notation, ctx) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + notation.LessonId)];
});

app.service("notationSync").publish("removed", (notation, ctx) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + notation.LessonId)];
});

const PORT = process.env.PORT || 3030;
app
  .listen(PORT)
  .on("listening", () => console.log(`server running on port ${PORT}`));
