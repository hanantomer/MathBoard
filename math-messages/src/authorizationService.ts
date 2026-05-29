import { Application } from "@feathersjs/feathers";
import useDbUtil from "../../math-db/build/dbUtil";
import util from "./util";
import { UserAttributes } from "../../math-common/build/userTypes";

const dbUtil = useDbUtil();

export default class AuhorizationService {
  app: Application;
  lessonAuthorizedUsers: Map<number, Set<number>>;

  constructor(app: Application) {
    this.app = app;
    this.lessonAuthorizedUsers = new Map();
  }

  async canEditLessonBoard(
    user: UserAttributes,
    lessonUUId: string,
  ): Promise<boolean> {
    if (!user?.id || !lessonUUId) {
      return false;
    }

    const lesson = await dbUtil.getLesson(lessonUUId);
    if (!lesson) {
      return false;
    }

    if (lesson.userId === user.id && util.canTeach(user)) {
      return true;
    }

    const lessonId = lesson.id;
    if (lessonId) {
      const usersSet = this.lessonAuthorizedUsers.get(lessonId);
      if (usersSet?.has(user.id)) {
        return true;
      }
    }

    return dbUtil.isStudentAuthorizedToEditLesson(user.id, lessonUUId);
  }

  async get(id: number, params: any) {
    const lessonUUId =
      params?.query?.lessonUUId ?? params?.lessonUUId;
    const user = await util.getUserFromCookie(params.headers.cookie);
    if (!user?.id || !lessonUUId) {
      return { authorized: false };
    }

    const authorized = await this.canEditLessonBoard(user, lessonUUId);
    return { authorized };
  }

  async update(id: number, data: any, params: any) {
    const teacher = await util.getUserFromCookie(params.headers.cookie);
    if (!teacher?.id) return;
    if (!util.canTeach(teacher)) return;

    const isOwner = await util.isLessonOwner(teacher, data.lessonUUId);
    if (!isOwner) return;

    const lessonId = await dbUtil.getIdByUUId("Lesson", data.lessonUUId);
    if (!lessonId) return;

    const studentUserId = await dbUtil.getIdByUUId("User", data.userUUId);
    if (!studentUserId) return;

    if (!this.lessonAuthorizedUsers.get(lessonId)) {
      this.lessonAuthorizedUsers.set(lessonId, new Set());
    }

    if (data.authorized) {
      this.lessonAuthorizedUsers.get(lessonId)?.clear();
      this.lessonAuthorizedUsers.get(lessonId)?.add(studentUserId);
    } else {
      this.lessonAuthorizedUsers.get(lessonId)?.delete(studentUserId);
    }

    await dbUtil.setStudentLessonEditAuthorized(
      data.lessonUUId,
      data.userUUId,
      data.authorized,
    );

    return {
      userUUId: data.userUUId,
      authorized: data.authorized,
      lessonUUId: data.lessonUUId,
    };
  }
}
