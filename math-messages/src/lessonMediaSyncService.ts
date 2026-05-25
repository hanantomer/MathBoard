import { Application } from "@feathersjs/feathers";
import {
  LessonMediaPolicy,
  LessonMediaSyncPayload,
} from "../../math-common/build/lessonMediaTypes";
import util from "./util";

const policies = new Map<string, LessonMediaPolicy>();

function defaultPolicy(lessonUUId: string): LessonMediaPolicy {
  return {
    lessonUUId,
    muteAllActive: false,
    unmutedStudentUUIds: [],
  };
}

function getPolicy(lessonUUId: string): LessonMediaPolicy {
  if (!policies.has(lessonUUId)) {
    policies.set(lessonUUId, defaultPolicy(lessonUUId));
  }
  return { ...policies.get(lessonUUId)!, unmutedStudentUUIds: [...policies.get(lessonUUId)!.unmutedStudentUUIds] };
}

function savePolicy(policy: LessonMediaPolicy) {
  policies.set(policy.lessonUUId, {
    ...policy,
    unmutedStudentUUIds: [...policy.unmutedStudentUUIds],
  });
}

export default class LessonMediaSyncService {
  app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  async find(params: { query?: { lessonUUId?: string } }) {
    const lessonUUId = params.query?.lessonUUId;
    if (!lessonUUId) {
      return [];
    }
    return getPolicy(lessonUUId);
  }

  async update(_id: null, data: LessonMediaSyncPayload, params: any) {
    const teacher = await util.getUserFromCookie(params.headers?.cookie);
    if (!teacher || teacher.userType !== "TEACHER") {
      throw new Error("Only teachers can update lesson media policy");
    }

    const lessonUUId = data.lessonUUId;
    if (!lessonUUId) {
      throw new Error("lessonUUId is required");
    }

    const policy = getPolicy(lessonUUId);

    switch (data.action) {
      case "muteAll":
        policy.muteAllActive = true;
        policy.unmutedStudentUUIds = [];
        break;
      case "unmuteAll":
        policy.muteAllActive = false;
        policy.unmutedStudentUUIds = [];
        break;
      case "unmuteStudent":
        if (data.targetUserUUId && !policy.unmutedStudentUUIds.includes(data.targetUserUUId)) {
          policy.unmutedStudentUUIds.push(data.targetUserUUId);
        }
        break;
      case "muteStudent":
        if (data.targetUserUUId) {
          policy.unmutedStudentUUIds = policy.unmutedStudentUUIds.filter(
            (id) => id !== data.targetUserUUId,
          );
        }
        break;
      default:
        throw new Error("Invalid lesson media action");
    }

    savePolicy(policy);

    return {
      ...policy,
      action: data.action,
      targetUserUUId: data.targetUserUUId,
    };
  }
}
