import { feathers } from "@feathersjs/feathers";

import socketio from "@feathersjs/socketio";
import constants from "./constants";
import connection from "../../math-db/build/models/index";

import AuthorizationService from "./authorizationService";
import AuthenticationService from "./authenticationService";
import HeartbeatService from "./heartbeatService";
import SelectedCellSyncService from "./selectedCellSyncService";
import NotationSyncService from "./notationSyncService";
import { LessonNotationAttributes } from "../../math-common/src/lessonTypes";
import imageUploadService from "./imageUploadService";


type ServiceTypes = {
  authorization: AuthorizationService;
  authentication: AuthenticationService;
  heartbeat: HeartbeatService;
  imageLoaded: imageUploadService;
  selectedCell: SelectedCellSyncService;
  notationSync: NotationSyncService;
};


const app: any = feathers<ServiceTypes>();

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
app.use("imageLoaded", new imageUploadService(app));
app.use("selectedCell", new SelectedCellSyncService(app));
app.use("notationSync", new NotationSyncService(app));


app
  .service("authorization")
  .publish(
    "updated",
    (id: any, authorization: any, ctx: any) => {
      return [
        app.channel(
          constants.LESSON_CHANNEL_PREFIX +
            authorization.data.lessonUUId +
            constants.USER_CHANNEL_PREFIX +
            authorization.data.userUUId
        ),
      ];
    }
  );

app
  .service("heartbeat")
  .publish(
    "updated",
    (id: any, heartbeat: any, ctx: any) => {
      return [
        app.channel(
          constants.LESSON_CHANNEL_PREFIX +
            heartbeat.data.lessonUUId +
            constants.USER_CHANNEL_PREFIX +
            heartbeat.data.userUUId
        ),
      ];
    }
);
  
app.service("imageLoaded").publish("updated", (id: any, imageLoaded: any, ctx: any) => {
  return app.channel(constants.LESSON_CHANNEL_PREFIX + imageLoaded.data.lessonUUId);
});

app.service("selectedCell").publish("updated", (id: any, selectedCell: any, ctx: any) => {
  return app.channel( constants.LESSON_CHANNEL_PREFIX + selectedCell.data.lessonUUId );
});


app.service("notationSync").publish("created", (notation: LessonNotationAttributes, ctx: any) => {
  return app.channel(constants.LESSON_CHANNEL_PREFIX + notation.lesson.uuid);
});

app
  .service("notationSync")
  .publish(
    "updated",
    (
      id: any,
      notation: any,
      ctx: any
    ) => {
      return app.channel(
        constants.LESSON_CHANNEL_PREFIX +
          notation.data.lesson.uuid
      );
    }
  );

app
  .service("notationSync")
  .publish(
    "removed",
    (
      id: any,
      notation: any,
      ctx: any
    ) => {
      return app.channel(
        constants.LESSON_CHANNEL_PREFIX +
          notation.result.lesson.uuid
      );
    }
  );
 
const PORT: number =
  Number(process.env.MESSAGING_PORT) || 18030;

connection.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT).then(() =>
    console.log(
      "Feathers server listening on localhost:" + PORT
    )
  );
}).catch((err: any) => {
  console.error("Unable to connect to the database:", err);
});  
  
