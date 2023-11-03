import { feathers, Application, RealTimeConnection } from "@feathersjs/feathers";

import socketio from "@feathersjs/socketio";
import constants from "./constants";

import AuthorizationService from "./authorizationService";
import AuthenticationService from "./authenticationService";
import HeartbeatService from "./heartbeatService";
import activeCellSyncService from "./activeCellSyncService";
import NotationSyncService from "./notationSyncService";


//type ServiceTypes = {
//  // Add services path to type mapping here
//};

// app.get and app.set can be typed when initializing the app
//type Configuration = {
//  port: number;
//};

type ServiceTypes = {
  authorization: AuthorizationService,
  authentication: AuthenticationService,
  heartbeat: HeartbeatService,
  activeCell: activeCellSyncService,
  notationSync: NotationSyncService
};


const app: any = feathers<ServiceTypes>();

app.set("origin", "localhost:3000")


app.configure(
  socketio({
    cors: {
      origin: app.get("origins"),
    },
  })
);

app.use("authorization", new AuthorizationService(app));
app.use("authentication", new AuthenticationService(app));
app.use("heartbeat", new HeartbeatService(app));
app.use("activeCell", new activeCellSyncService(app));
app.use("notationSync", new NotationSyncService(app));

app.on('connection', (connection: RealTimeConnection) => {
  // On a new real-time connection, add it to the
  // anonymous channel
  app.channel('anonymous').join(connection)
})

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

app
  .service("authentication")
  .publish(
    "created",
    (authentication: any, ctx: any) => {
      return [
        app.channel(
          constants.LESSON_CHANNEL_PREFIX +
            authentication.LessonUUId +
            constants.USER_CHANNEL_PREFIX +
            authentication.userId
        ),
      ];
    }
  );

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

app.service("activeCell").on("updated", (position: any, ctx: any) => {
  console.log('on activeCell updated');
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
//app.on("listening", () => {
//  console.log(`server running on port ${PORT}`)
//});


app.listen(PORT).then(() =>
   console.log(
      "Feathers server listening on localhost:" + PORT
   )
 );
  
