import util from "./util";
import { Application } from "@feathersjs/feathers";

export default class HeartbeatService {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }
  async update(id: number, data: any, params: any) {
    let access_token = await util.getAccessTokenFromCookie(
      params.headers.cookie
    );

    let user = await this.app
      .service("authentication")
      .get(access_token);

    if (!!user) {
      return {
        LessonUUId: data.LessonUUId,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
  }
}

