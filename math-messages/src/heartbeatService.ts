import util from "./util";
import { Application } from "@feathersjs/feathers";

export default class HeartbeatService {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  // student sends heartbeat messgae
  // return hartbeat data 
  async update(id: number, data: any, params: any) {

    return {
      lessonUUId: data.lessonUUId,
      userUUId: data.userUUId,
      authorized: data.authorized
    };
  }
}

