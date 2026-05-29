import { Application } from "@feathersjs/feathers";
import {
  TextSyncUpdateData,
  TextSyncEndData,
} from "../../math-common/build/globals";
import util from "./util";
import AuthorizationService from "./authorizationService";

export default class TextBoxSyncService {
  app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  private async assertCanEditLesson(
    cookie: string | undefined,
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

  async update(id: number, textSyncUpdateData: TextSyncUpdateData, params: any) {
    await this.assertCanEditLesson(
      params.headers?.cookie,
      textSyncUpdateData.lessonUUId,
    );
    return textSyncUpdateData;
  }

  async remove(id: string | null, params: any) {
    await this.assertCanEditLesson(
      params.headers?.cookie,
      params.query?.lessonUUId,
    );

    const textSyncEndData: TextSyncEndData = {
      notationUUId: params.query.notationUUId,
      userUUId: params.query.userUUId,
      lessonUUId: params.query.lessonUUId,
    };
    return textSyncEndData;
  }
}
