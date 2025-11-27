import { LessonNotationAttributes } from "../../math-common/build/lessonTypes";
import util from "./util.js";
import { Application } from "@feathersjs/feathers";

export default class notationSyncService {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  async getUserUUIdFromCookie(
    cookie: string
  ): Promise<string> {
    let user = await util.getUserFromCookie(cookie );

    if (!user) return "";

    return user.uuid;
  }

  async create(
    notation: LessonNotationAttributes,
    params: any
  ) {
    notation.user.uuid =
      await this.getUserUUIdFromCookie(
        params.headers.cookie
      );
    return notation;
  }

  async update(
    id: number,
    notation: LessonNotationAttributes,
    params: any
  ) {
    notation.user.uuid =
      await this.getUserUUIdFromCookie(
        params.headers.cookie
      );
    return notation;
  }

  async remove(
    notationUUId: string,
    params: any
  ) {
    let notation: unknown = {
      uuid: notationUUId,
      user: { uuid: await this.getUserUUIdFromCookie(params.headers.cookie) },
      lesson: {uuid: params.query.lessonUUId}
    }
    return notation;
  }
}

