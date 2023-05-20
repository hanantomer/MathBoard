import util from "./util.js";

export default class notationSyncService {
  app: any;
  constructor(app: any) {
    this.app = app;
  }

  async enrichNotation(notation: any, userId: number) {
    if (!!notation) {
      notation.UserId = userId;
    }
  }

  async create(data: any, params: any) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    if (!!user) {
      this.enrichNotation(data.notation.data, user.id);
    }
    return data.notation;
  }

  async update(id: number, data: any, params: any) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    if (!!user) {
      this.enrichNotation(data.notation, user.id);
      return data.notation;
    }
  }

  async remove(data: any, params: any) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    if (!!user) {
      this.enrichNotation(data.notation, user.id);
      return data.notation;
    }
  }
}

