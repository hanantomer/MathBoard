import { Application } from "@feathersjs/feathers";
import { WebRtcSignalPayload } from "../../math-common/build/lessonMediaTypes";
import util from "./util";

export default class WebRtcSignalingService {
  app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  async create(data: WebRtcSignalPayload, params: any) {
    const user = await util.getUserFromCookie(params.headers?.cookie);
    if (!user?.uuid) {
      throw new Error("Unauthorized");
    }

    if (!data.lessonUUId || !data.type) {
      throw new Error("lessonUUId and type are required");
    }

    return {
      ...data,
      fromUserUUId: user.uuid,
    };
  }
}
