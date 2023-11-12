import { feathers } from "@feathersjs/feathers";

import socketio from "@feathersjs/socketio";
import constants from "./constants";

import AuthorizationService from "./authorizationService";
import AuthenticationService from "./authenticationService";
import HeartbeatService from "./heartbeatService";
import selectedCellSyncService from "./selectedCellSyncService";
import NotationSyncService from "./notationSyncService";
import { SelectedCell } from "../../math-common/src/baseTypes";
import { LessonNotationAttributes } from "../../math-common/src/lessonTypes";


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
  selectedCell: selectedCellSyncService,
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
app.use("selectedCell", new selectedCellSyncService(app));
app.use("notationSync", new NotationSyncService(app));

//app.on('connection', (connection: RealTimeConnection) => {
  // On a new real-time connection, add it to the
  // anonymous channel
 // app.channel('anonymous').join(connection)
//})

app.service("authorization").publish("updated", (authorization: any, ctx: any) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        authorization.lessonUUId +
        constants.USER_CHANNEL_PREFIX +
        authorization.UserId
    ),
  ];
});

// app
//   .service("authentication")
//   .publish(
//     "created",
//     (id: any, data: any) => {
//       return [
//         app.channel(
//           constants.LESSON_CHANNEL_PREFIX +
//             data.lessonUUId +
//             constants.USER_CHANNEL_PREFIX +
//             data.userId
//         ),
//       ];
//     }
//   );

app.service("heartbeat").publish("updated", (heartbeat: any, ctx: any) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        heartbeat.lessonUUId +
        constants.USER_CHANNEL_PREFIX +
        heartbeat.userId
    ),
  ];
});

app.service("selectedCell").publish("updated", (selectedCell: SelectedCell, ctx: any) => {
  return app.channel( constants.LESSON_CHANNEL_PREFIX + selectedCell.lessonUUId );
});

app.service("notationSync").publish("created", (notation: LessonNotationAttributes, ctx: any) => {
  return app.channel(constants.LESSON_CHANNEL_PREFIX + notation.lesson.uuid);
});

app
  .service("notationSync").publish("updated", (notation: LessonNotationAttributes, ctx: any ) => {
      return app.channel(constants.LESSON_CHANNEL_PREFIX + notation.lesson.uuid );
});

app
  .service("notationSync").publish("removed", (notation: LessonNotationAttributes, ctx: any ) => {
      return app.channel(constants.LESSON_CHANNEL_PREFIX + notation.lesson.uuid );
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
  
