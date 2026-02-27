import util from "./util";
import { Application } from "@feathersjs/feathers";
import { TextSyncUpdateData, TextSyncEndData } from "../../math-common/build/globals";

export default class TextBoxSyncService {
  app: Application;
  constructor(app: Application) {
        this.app = app;
  }

  // sync active text box content
  async update(
    id: number,
    TextSyncUpdateData: TextSyncUpdateData
  ) {
    return TextSyncUpdateData;
  }

  // signal end of text box editing
  async remove(
    id: string | null,
    params: any
  ) {
    const TextSyncEndData: TextSyncEndData = {
      notationUUId: params.query.notationUUId,
      userUUId: params.query.userUUId,
      lessonUUId: params.query.lessonUUId
    };
    return TextSyncEndData;
  }
}

