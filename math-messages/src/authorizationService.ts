import { Application } from "@feathersjs/feathers";
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
    let user = await util.getUserFromCookie(params.headers.cookie);
    if (!user) return;

    const lessonId = await dbUtil.getIdByUUId("Lesson", params.lessonUUId);
    if (!lessonId) return;

    return (
      this.lessonAuthorizedUsers[lessonId] &&
      this.lessonAuthorizedUsers[lessonId].indexOf(user.id!) >= 0
    );
  }

  async update(id: number, data: any, params: any) {
    
    let user = await util.getUserFromCookie(params.headers.cookie);
    
    if (!user?.id) return;
    
    if (user.userType !== "TEACHER") return;

    let lessonId = await dbUtil.getIdByUUId(
      "Lesson",
      data.lessonUUId
    );

    if (!lessonId) return;

    this.lessonAuthorizedUsers[lessonId].push(user.id!);
  }
}
