import feathers, { Application } from "@feathersjs/feathers";
import useDbUtil from "../../math-db/build/dbUtil";
import util from "./util";
const dbUtil = useDbUtil();

export default class AuhorizationService {
  app: Application;
  lessonAuthorizedUsers: number[][];

  constructor(app: Application) {
    this.app = app;
    this.lessonAuthorizedUsers = [];
  }

  async get(id: number, params: any) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);

    if (!!user) {
      user.lessonId = await dbUtil.getIdByUUId("Lesson", params.LessonUUId);

      return (
        !!this.lessonAuthorizedUsers[user.lessonId] &&
        this.lessonAuthorizedUsers[user.lessonId].indexOf(user.id) >= 0
      );
    }
  }

  async update(id: number, data: any, params: any) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    let lessonId = await dbUtil.getIdByUUId("Lesson", data.LessonUUId);
    let isTeacher = await dbUtil.isTeacher(user.id, data.LessonUUId);
    if (!isTeacher) return;

    return data;
  }
}
