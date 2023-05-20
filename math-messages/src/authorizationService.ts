import dbUtil from "../../math-db/build/dbUtil";
import util from "./util.js";

export default class AuhorizationService {
  
  app: any;
  lessonAuthorizedUsers: number[][];
  
  constructor(app: any) {
    this.app = app;
    this.lessonAuthorizedUsers = [];
  }

  async get(id: number, data: any, params: any) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);

    if (!!user) {
      user.lessonId = await dbUtil.getIdByUUID("Lesson", data.LessonUUId);

      return (
        !!this.lessonAuthorizedUsers[user.lessonId] &&
        this.lessonAuthorizedUsers[user.lessonId].indexOf(user.id) >= 0
      );
    }
  }

  async update(id: number, data: any, params: any) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    let lessonId = await dbUtil.getIdByUUID("Lesson", data.LessonUUId);
    let isTeacher = await dbUtil.isTeacher(user.id, lessonId);
    if (!isTeacher) return;

    return data;
  }
}
module.exports = AuhorizationService;
