import { Application } from "@feathersjs/feathers";
import useDbUtil from "../../math-db/build/dbUtil";
import util from "./util";
const dbUtil = useDbUtil();

export default class AuhorizationService {
  app: Application;
  lessonAuthorizedUsers: Map<number, Set<number>>;

  constructor(app: Application) {
    this.app = app;
    this.lessonAuthorizedUsers = new Map();
  }

  async get(id: number, params: any) {
    let user = await util.getUserFromCookie(params.headers.cookie);
    if (!user?.id) return false;

    const lessonId = await dbUtil.getIdByUUId("Lesson", params.lessonUUId);
    if (!lessonId) return;

    const usersSet = this.lessonAuthorizedUsers.get(lessonId);
    return usersSet?.has(user.id);
  }

  async update(id: number, data: any, params: any) {
    
    let teacher = await util.getUserFromCookie(params.headers.cookie);
    if (!teacher?.id) return;
    if (teacher.userType !== "TEACHER") return;

    let lessonId = await dbUtil.getIdByUUId(
      "Lesson",
      data.lessonUUId
    );

    if (!lessonId) return;

    let studentUserId = await dbUtil.getIdByUUId(
      "User",
      data.userUUId
    );

    if (!studentUserId) return;

    if (!this.lessonAuthorizedUsers.get(lessonId)) {
      this.lessonAuthorizedUsers.set(lessonId, new Set())
    }

    if (data.authorized)
      this.lessonAuthorizedUsers.get(lessonId)?.add(studentUserId);
    else {
      this.lessonAuthorizedUsers.get(lessonId)?.delete(studentUserId);
    }

    return {
      userUUId: data.userUUId,
      authorized: data.authorized,
      lessonUUId: data.lessonUUId
    };
  }
}
