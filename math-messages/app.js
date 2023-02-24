const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio");
const constants = require("./constants");

const app = feathers();
app.configure(socketio());

const AuthorizationService = require("./authorizationService");
const AuthenticationService = require("./authenticationService");
const HeartbeatService = require("./heartbeatService");
const activeCellSyncService = require("./activeCellSyncService");
const NotationSyncService = require("./notationSyncService");

app.use("authorization", new AuthorizationService(app));
app.use("authentication", new AuthenticationService(app));
app.use("heartbeat", new HeartbeatService(app));
app.use("activeCell", new activeCellSyncService(app));
app.use("notationSync", new NotationSyncService(app));

app.service("authorization").publish("updated", (authorization, ctx) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        authorization.LessonUUId +
        constants.USER_CHANNEL_PREFIX +
        authorization.UserId
    ),
  ];
});

app.service("authentication").publish("created", (authentication, ctx) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        authentication.LessonUUId +
        constants.USER_CHANNEL_PREFIX +
        authentication.userId
    ),
  ];
});

app.service("heartbeat").publish("updated", (heartbeat, ctx) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        heartbeat.LessonUUId +
        constants.USER_CHANNEL_PREFIX +
        heartbeat.userId
    ),
  ];
});

app.service("activeCell").publish("updated", (position, ctx) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + position.LessonUUId)];
});

app.service("notationSync").publish("created", (notation, ctx) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + notation.LessonUUId)];
});

app.service("notationSync").publish("updated", (notation, ctx) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + notation.LessonUUId)];
});

app.service("notationSync").publish("removed", (notation, ctx) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + notation.LessonUUId)];
});

const PORT = process.env.PORT || 3030;
app
  .listen(PORT)
  .on("listening", () => console.log(`server running on port ${PORT}`));
