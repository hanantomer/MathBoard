import { LessonNotationAttributes } from "../../math-common/build/lessonTypes";
import util from "./util.js";
import { Application } from "@feathersjs/feathers";
import AuthorizationService from "./authorizationService";

export default class notationSyncService {
  app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  async getUserUUIdFromCookie(cookie: string): Promise<string> {
    const user = await util.getUserFromCookie(cookie);
    if (!user) return "";
    return user.uuid;
  }

  private async assertCanEditLesson(
    cookie: string,
    lessonUUId: string | undefined,
  ) {
    if (!lessonUUId) {
      throw new Error("lessonUUId is required");
    }

    const user = await util.getUserFromCookie(cookie);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const authorizationService = this.app.service(
      "authorization",
    ) as unknown as AuthorizationService;

    if (!(await authorizationService.canEditLessonBoard(user, lessonUUId))) {
      throw new Error("Not authorized to edit lesson");
    }
  }

  async create(notation: LessonNotationAttributes, params: any) {
    await this.assertCanEditLesson(
      params.headers.cookie,
      notation.lesson?.uuid,
    );

    notation.user.uuid = await this.getUserUUIdFromCookie(
      params.headers.cookie,
    );
    return notation;
  }

  async update(
    id: number,
    notation: LessonNotationAttributes,
    params: any,
  ) {
    await this.assertCanEditLesson(
      params.headers.cookie,
      notation.lesson?.uuid,
    );

    notation.user.uuid = await this.getUserUUIdFromCookie(
      params.headers.cookie,
    );
    return notation;
  }

  async remove(notationUUId: string, params: any) {
    await this.assertCanEditLesson(
      params.headers.cookie,
      params.query?.lessonUUId,
    );

    const notation: unknown = {
      uuid: notationUUId,
      user: {
        uuid: await this.getUserUUIdFromCookie(params.headers.cookie),
      },
      lesson: { uuid: params.query.lessonUUId },
    };
    return notation;
  }
}
