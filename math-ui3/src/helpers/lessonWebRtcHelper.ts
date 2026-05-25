import {
  LessonMediaPolicy,
  WebRtcSignalPayload,
  isStudentMicBlocked,
  shouldInitiateWebRtcOffer,
} from "common/lessonMediaTypes";
import { FeathersHelper } from "./feathersHelper";
import { useLessonMediaStore } from "../store/pinia/lessonMediaStore";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

type PeerState = {
  pc: RTCPeerConnection;
  audioElement: HTMLAudioElement;
};

type MediaSession = {
  lessonUUId: string;
  userUUId: string;
  isTeacher: boolean;
};

let session: MediaSession | null = null;
let localStream: MediaStream | null = null;
const peers = new Map<string, PeerState>();
const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
let remoteMediaRoot: HTMLElement | null = null;
let signalingListenerRegistered = false;

function ensureRemoteMediaRoot(): HTMLElement {
  if (!remoteMediaRoot) {
    remoteMediaRoot = document.createElement("div");
    remoteMediaRoot.id = "lesson-remote-media";
    remoteMediaRoot.style.display = "none";
    document.body.appendChild(remoteMediaRoot);
  }
  return remoteMediaRoot;
}

function isActiveSignal(signal: WebRtcSignalPayload): boolean {
  return !!session && signal.lessonUUId === session.lessonUUId;
}

async function sendSignal(payload: Omit<WebRtcSignalPayload, "fromUserUUId">) {
  if (!session) {
    return;
  }
  await FeathersHelper.getInstance()
    .service("webrtcSignaling")
    .create({ ...payload, lessonUUId: session.lessonUUId }, {});
}

function removePeer(peerUUId: string) {
  const peer = peers.get(peerUUId);
  if (!peer) {
    return;
  }
  peer.pc.close();
  peer.audioElement.remove();
  peers.delete(peerUUId);
  pendingCandidates.delete(peerUUId);
}

function attachRemoteAudio(peerUUId: string, stream: MediaStream) {
  let peer = peers.get(peerUUId);
  if (!peer) {
    return;
  }
  peer.audioElement.srcObject = stream;
}

function createPeerConnection(peerUUId: string): RTCPeerConnection {
  const existing = peers.get(peerUUId);
  if (existing) {
    return existing.pc;
  }

  const pc = new RTCPeerConnection(RTC_CONFIG);
  const audioElement = document.createElement("audio");
  audioElement.autoplay = true;
  ensureRemoteMediaRoot().appendChild(audioElement);

  peers.set(peerUUId, { pc, audioElement });

  if (localStream) {
    for (const track of localStream.getTracks()) {
      pc.addTrack(track, localStream);
    }
  }

  pc.onicecandidate = (event) => {
    if (!event.candidate || !session) {
      return;
    }
    void sendSignal({
      type: "ice-candidate",
      lessonUUId: session.lessonUUId,
      toUserUUId: peerUUId,
      candidate: event.candidate.toJSON(),
    });
  };

  pc.ontrack = (event) => {
    const stream = event.streams[0];
    if (stream) {
      attachRemoteAudio(peerUUId, stream);
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed") {
      removePeer(peerUUId);
    }
  };

  return pc;
}

async function flushPendingCandidates(peerUUId: string) {
  const peer = peers.get(peerUUId);
  const queued = pendingCandidates.get(peerUUId);
  if (!peer || !queued?.length) {
    return;
  }

  for (const candidate of queued) {
    await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
  pendingCandidates.delete(peerUUId);
}

async function addIceCandidate(
  peerUUId: string,
  candidate: RTCIceCandidateInit,
) {
  const peer = peers.get(peerUUId);
  if (!peer?.pc.remoteDescription) {
    const queue = pendingCandidates.get(peerUUId) ?? [];
    queue.push(candidate);
    pendingCandidates.set(peerUUId, queue);
    return;
  }
  await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
}

async function createOffer(peerUUId: string) {
  if (!session) {
    return;
  }

  const pc = createPeerConnection(peerUUId);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await sendSignal({
    type: "offer",
    lessonUUId: session.lessonUUId,
    toUserUUId: peerUUId,
    sdp: { type: offer.type, sdp: offer.sdp ?? "" },
  });
}

async function handleOffer(fromUUId: string, sdp: RTCSessionDescriptionInit) {
  const pc = createPeerConnection(fromUUId);
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  await flushPendingCandidates(fromUUId);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  if (!session) {
    return;
  }

  await sendSignal({
    type: "answer",
    lessonUUId: session.lessonUUId,
    toUserUUId: fromUUId,
    sdp: { type: answer.type, sdp: answer.sdp ?? "" },
  });
}

async function handleAnswer(fromUUId: string, sdp: RTCSessionDescriptionInit) {
  const peer = peers.get(fromUUId);
  if (!peer) {
    return;
  }
  await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
  await flushPendingCandidates(fromUUId);
}

async function handleJoin(fromUUId: string) {
  if (!session || fromUUId === session.userUUId) {
    return;
  }

  if (shouldInitiateWebRtcOffer(session.userUUId, fromUUId)) {
    await createOffer(fromUUId);
  }
}

async function applyMicPolicy(
  policy: LessonMediaPolicy,
  userUUId: string,
  isTeacher: boolean,
) {
  const mediaStore = useLessonMediaStore();
  if (!localStream || isTeacher) {
    return;
  }

  const audioTrack = localStream.getAudioTracks()[0];
  if (!audioTrack) {
    return;
  }

  const blocked = isStudentMicBlocked(policy, userUUId);
  if (blocked) {
    audioTrack.enabled = false;
    mediaStore.localMicEnabled = false;
    return;
  }

  if (policy.muteAllActive && policy.unmutedStudentUUIds.includes(userUUId)) {
    audioTrack.enabled = true;
    mediaStore.localMicEnabled = true;
  }
}

export function registerWebRtcSignalingListener() {
  if (signalingListenerRegistered) {
    return;
  }
  signalingListenerRegistered = true;

  FeathersHelper.getInstance()
    .service("webrtcSignaling")
    .on("created", (signal: WebRtcSignalPayload) => {
      void handleIncomingWebRtcSignal(signal);
    });
}

export async function handleIncomingWebRtcSignal(signal: WebRtcSignalPayload) {
  if (!isActiveSignal(signal) || !localStream) {
    return;
  }
  if (!session || signal.fromUserUUId === session.userUUId) {
    return;
  }
  if (signal.toUserUUId && signal.toUserUUId !== session.userUUId) {
    return;
  }

  try {
    switch (signal.type) {
      case "join":
        await handleJoin(signal.fromUserUUId!);
        break;
      case "offer":
        if (signal.sdp) {
          await handleOffer(signal.fromUserUUId!, signal.sdp);
        }
        break;
      case "answer":
        if (signal.sdp) {
          await handleAnswer(signal.fromUserUUId!, signal.sdp);
        }
        break;
      case "ice-candidate":
        if (signal.candidate) {
          await addIceCandidate(signal.fromUserUUId!, signal.candidate);
        }
        break;
      case "leave":
        removePeer(signal.fromUserUUId!);
        break;
    }
  } catch (error) {
    console.error("[WebRTC] Signal handling failed:", signal.type, error);
  }
}

export async function initLessonMediaSession(
  lessonUUId: string,
  userUUId: string,
  isTeacher: boolean,
): Promise<void> {
  registerWebRtcSignalingListener();

  if (session) {
    await leaveLessonMedia();
  }

  session = { lessonUUId, userUUId, isTeacher };
}

export async function requestLessonMedia(
  policy: LessonMediaPolicy,
  userUUId: string,
  isTeacher: boolean,
): Promise<boolean> {
  const mediaStore = useLessonMediaStore();
  if (!session) {
    return false;
  }
  if (localStream) {
    return true;
  }

  mediaStore.connecting = true;
  mediaStore.errorMessage = null;

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    mediaStore.localMicEnabled = localStream.getAudioTracks()[0]?.enabled ?? false;
    mediaStore.localCamEnabled = localStream.getVideoTracks()[0]?.enabled ?? false;
    mediaStore.connected = true;

    await applyMicPolicy(policy, userUUId, isTeacher);
    await sendSignal({ type: "join", lessonUUId: session.lessonUUId });
    return true;
  } catch (error) {
    console.error("[WebRTC] Failed to start lesson media:", error);
    mediaStore.errorMessage = "Could not access camera/microphone";
    mediaStore.connected = false;
    return false;
  } finally {
    mediaStore.connecting = false;
  }
}

/** Stops camera/mic and peer connections but keeps the lesson signaling session. */
export async function stopLocalMedia() {
  const mediaStore = useLessonMediaStore();

  if (session && localStream) {
    try {
      await sendSignal({ type: "leave", lessonUUId: session.lessonUUId });
    } catch {
      // ignore disconnect errors
    }
  }

  for (const peerUUId of [...peers.keys()]) {
    removePeer(peerUUId);
  }

  if (localStream) {
    for (const track of localStream.getTracks()) {
      track.stop();
    }
    localStream = null;
  }

  if (remoteMediaRoot) {
    remoteMediaRoot.innerHTML = "";
  }

  mediaStore.connected = false;
  mediaStore.localMicEnabled = false;
  mediaStore.localCamEnabled = false;
}

export async function leaveLessonMedia() {
  await stopLocalMedia();
  session = null;
}

export async function syncLessonMediaPolicy(
  policy: LessonMediaPolicy,
  userUUId: string,
  isTeacher: boolean,
) {
  await applyMicPolicy(policy, userUUId, isTeacher);
}

export async function toggleLocalMic(
  enabled: boolean,
  userUUId: string,
  isTeacher: boolean,
): Promise<boolean> {
  const mediaStore = useLessonMediaStore();
  const audioTrack = localStream?.getAudioTracks()[0];
  if (!audioTrack) {
    return false;
  }

  if (
    !isTeacher &&
    enabled &&
    mediaStore.policy &&
    isStudentMicBlocked(mediaStore.policy, userUUId)
  ) {
    return false;
  }

  audioTrack.enabled = enabled;
  mediaStore.localMicEnabled = enabled;
  return true;
}

export async function toggleLocalCam(enabled: boolean): Promise<boolean> {
  const mediaStore = useLessonMediaStore();
  const videoTrack = localStream?.getVideoTracks()[0];
  if (!videoTrack) {
    return false;
  }

  videoTrack.enabled = enabled;
  mediaStore.localCamEnabled = enabled;
  return true;
}

export function isLessonMediaConnected(): boolean {
  return !!session && !!localStream;
}
