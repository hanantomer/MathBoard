import util from "./util";

export default class HeartbeatService {
  app: any;
  constructor(app: any ) {
    this.app = app;
  }
  async update(id: number, data: any, params: any) {
    let access_token = await util.getAccessTokenFromCookie(
      params.headers.cookie
    );

    let user = await this.app
      .service("authentication")
      .authUserByToken(access_token);

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

