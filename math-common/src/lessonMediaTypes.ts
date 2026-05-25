export type LessonMediaAction =
  | "muteAll"
  | "unmuteAll"
  | "unmuteStudent"
  | "muteStudent";

export type LessonMediaPolicy = {
  lessonUUId: string;
  muteAllActive: boolean;
  unmutedStudentUUIds: string[];
};

export type LessonMediaSyncPayload = LessonMediaPolicy & {
  action?: LessonMediaAction;
  targetUserUUId?: string;
};

export type WebRtcSignalType =
  | "join"
  | "leave"
  | "offer"
  | "answer"
  | "ice-candidate";

export type WebRtcSessionDescription = {
  type: "offer" | "answer" | "pranswer" | "rollback";
  sdp: string;
};

export type WebRtcIceCandidate = {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
};

export type WebRtcSignalPayload = {
  lessonUUId: string;
  type: WebRtcSignalType;
  toUserUUId?: string;
  fromUserUUId?: string;
  sdp?: WebRtcSessionDescription;
  candidate?: WebRtcIceCandidate;
};

/** Student mic blocked when mute-all is on and they are not in the exception list. */
export function isStudentMicBlocked(
  policy: LessonMediaPolicy,
  studentUUId: string,
): boolean {
  if (!policy.muteAllActive) {
    return false;
  }
  return !policy.unmutedStudentUUIds.includes(studentUUId);
}

export function shouldInitiateWebRtcOffer(
  localUUId: string,
  remoteUUId: string,
): boolean {
  return localUUId.localeCompare(remoteUUId) < 0;
}
