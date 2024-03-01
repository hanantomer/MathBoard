import { feathers } from "@feathersjs/feathers";

import socketio from "@feathersjs/socketio";
import constants from "./constants";

import AuthorizationService from "./authorizationService";
import AuthenticationService from "./authenticationService";
import HeartbeatService from "./heartbeatService";
import SelectedCellSyncService from "./selectedCellSyncService";
import ColorizedCellSyncService from "./colorizedCellSyncService";
import NotationSyncService from "./notationSyncService";
import { SelectedCell, ColorizedCell } from "../../math-common/src/baseTypes";
import { LessonNotationAttributes } from "../../math-common/src/lessonTypes";


type ServiceTypes = {
  authorization: AuthorizationService;
  authentication: AuthenticationService;
  heartbeat: HeartbeatService;
  selectedCell: SelectedCellSyncService;
  colorizedCell: ColorizedCellSyncService;
  notationSync: NotationSyncService;
};


const app: any = feathers<ServiceTypes>();


// const WEB_PORT: number =
//   Number(process.env.WEB_PORT) || 3000;

// app.set("origin", "localhost:" + WEB_PORT)

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
app.use("selectedCell", new SelectedCellSyncService(app));
app.use("colorizedCell", new ColorizedCellSyncService(app));
app.use("notationSync", new NotationSyncService(app));


app.service("authorization").publish("updated", (authorization: any, ctx: any) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        authorization.lessonUUId +
        constants.USER_CHANNEL_PREFIX +
        authorization.userUUId
    ),
  ];
});


app.service("heartbeat").publish("updated", (heartbeat: any, ctx: any) => {
  return [
    app.channel(
      constants.LESSON_CHANNEL_PREFIX +
        heartbeat.lessonUUId +
        constants.USER_CHANNEL_PREFIX +
        heartbeat.userUUId
    ),
  ];
});

app.service("selectedCell").publish("updated", (selectedCell: SelectedCell, ctx: any) => {
  return app.channel( constants.LESSON_CHANNEL_PREFIX + selectedCell.lessonUUId );
});

app.service("colorizedCell").publish("updated",(colorizedCell: ColorizedCell, ctx: any) => {
  return app.channel(constants.LESSON_CHANNEL_PREFIX + colorizedCell.lessonUUId);
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
 
const PORT: number =
  Number(process.env.MESSAGING_PORT) || 18030;

app.listen(PORT).then(() =>
   console.log(
      "Feathers server listening on localhost:" + PORT
   )
 );
  
