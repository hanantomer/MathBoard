import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio";
import constants from "./constants";

const app: any = feathers();
app.configure(socketio());

import AuthorizationService from "./authorizationService";
import AuthenticationService from "./authenticationService";
import HeartbeatService from "./heartbeatService";
import activeCellSyncService from "./activeCellSyncService";
import NotationSyncService from "./notationSyncService";

app.use("authorization", new AuthorizationService(app));
app.use("authentication", new AuthenticationService(app));
app.use("heartbeat", new HeartbeatService(app));
app.use("activeCell", new activeCellSyncService(app));
app.use("notationSync", new NotationSyncService(app));

app.service("authorization").publish("updated", (authorization: any, ctx: any) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        authorization.LessonUUId +
        constants.USER_CHANNEL_PREFIX +
        authorization.UserId
    ),
  ];
});

app.service("authentication").publish("created", (authentication: any, ctx: any) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        authentication.LessonUUId +
        constants.USER_CHANNEL_PREFIX +
        authentication.userId
    ),
  ];
});

app.service("heartbeat").publish("updated", (heartbeat: any, ctx: any) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        heartbeat.LessonUUId +
        constants.USER_CHANNEL_PREFIX +
        heartbeat.userId
    ),
  ];
});

app.service("activeCell").publish("updated", (position: any, ctx: any) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + position.LessonUUId)];
});

app.service("notationSync").publish("created", (notation: any, ctx: any) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + notation.LessonUUId)];
});

app.service("notationSync").publish("updated", (notation: any, ctx: any) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + notation.LessonUUId)];
});

app.service("notationSync").publish("removed", (notation: any, ctx: any) => {
  return [app.channel(constants.LESSON_CHANNEL_PREFIX + notation.LessonUUId)];
});

const PORT: number = Number(process.env.PORT) || 3030;
app
  .listen(PORT)
  .on("listening", () => console.log(`server running on port ${PORT}`));
