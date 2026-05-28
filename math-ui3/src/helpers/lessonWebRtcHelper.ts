import {
  LessonMediaPolicy,
  WebRtcSignalPayload,
  isStudentMicBlocked,
  shouldInitiateWebRtcOffer,
} from "common/lessonMediaTypes";
import { FeathersHelper } from "./feathersHelper";
import {
  useLessonMediaStore,
  type LessonRemoteParticipant,
} from "../store/pinia/lessonMediaStore";

const WEBRTC_DEBUG = import.meta.env.DEV;

function logWebRtc(...args: unknown[]) {
  if (WEBRTC_DEBUG) {
    console.log("[WebRTC]", ...args);
  }
}

function buildRtcConfiguration(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
  ];

  const turnUrl = import.meta.env.VITE_TURN_URL;
  if (turnUrl) {
    iceServers.push({
      urls: turnUrl,
      username: import.meta.env.VITE_TURN_USERNAME || undefined,
      credential: import.meta.env.VITE_TURN_CREDENTIAL || undefined,
    });
    logWebRtc("TURN server configured");
  } else if (!WEBRTC_DEBUG) {
    console.warn(
      "[WebRTC] VITE_TURN_URL is not set; cross-network audio/video may fail without TURN.",
    );
  }

  return { iceServers };
}

type PeerState = {
  pc: RTCPeerConnection;
  audioElement: HTMLAudioElement;
  remoteStream: MediaStream | null;
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
const pendingSignals: WebRtcSignalPayload[] = [];
const mediaPeerUUIds = new Set<string>();
let remoteMediaRoot: HTMLElement | null = null;
let signalingListenerRegistered = false;

function streamHasLiveVideo(stream: MediaStream | null): boolean {
  if (!stream) {
    return false;
  }
  return stream
    .getVideoTracks()
    .some((track) => track.enabled && track.readyState === "live");
}

function streamHasAudio(stream: MediaStream | null): boolean {
  if (!stream) {
    return false;
  }
  return stream.getAudioTracks().some((track) => track.enabled);
}

function syncPeersToStore() {
  const mediaStore = useLessonMediaStore();
  const list: LessonRemoteParticipant[] = [];

  for (const [userUUId, peer] of peers.entries()) {
    if (!peer.remoteStream) {
      continue;
    }
    list.push({
      userUUId,
      stream: peer.remoteStream,
      hasVideo: streamHasLiveVideo(peer.remoteStream),
      hasAudio: streamHasAudio(peer.remoteStream),
    });
  }

  mediaStore.setRemoteParticipants(list);
}

function syncLocalStreamToStore() {
  const mediaStore = useLessonMediaStore();
  mediaStore.localMediaStream = localStream;
}

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

function shouldProcessSignal(signal: WebRtcSignalPayload): boolean {
  if (!isActiveSignal(signal) || !session) {
    return false;
  }
  if (signal.fromUserUUId === session.userUUId) {
    return false;
  }
  if (signal.toUserUUId && signal.toUserUUId !== session.userUUId) {
    return false;
  }
  return true;
}

function trackMediaPeer(userUUId: string | undefined) {
  if (userUUId) {
    mediaPeerUUIds.add(userUUId);
  }
}

function queueSignal(signal: WebRtcSignalPayload) {
  pendingSignals.push(signal);
  logWebRtc(
    "Queued signal",
    signal.type,
    "from",
    signal.fromUserUUId,
    "queue size",
    pendingSignals.length,
  );
}

async function sendSignal(payload: Omit<WebRtcSignalPayload, "fromUserUUId">) {
  if (!session) {
    return;
  }
  logWebRtc("Sending signal", payload.type, "to", payload.toUserUUId ?? "all");
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
  syncPeersToStore();
}

function attachRemoteAudio(peerUUId: string, stream: MediaStream) {
  const peer = peers.get(peerUUId);
  if (!peer) {
    return;
  }
  peer.audioElement.srcObject = stream;
  void peer.audioElement.play().catch((error) => {
    logWebRtc("Remote audio autoplay blocked for", peerUUId, error);
  });
}

function watchTrack(peerUUId: string, track: MediaStreamTrack) {
  const refresh = () => syncPeersToStore();
  track.addEventListener("ended", refresh);
  track.addEventListener("mute", refresh);
  track.addEventListener("unmute", refresh);
}

function attachRemoteTrack(peerUUId: string, track: MediaStreamTrack) {
  let peer = peers.get(peerUUId);
  if (!peer) {
    return;
  }

  if (!peer.remoteStream) {
    peer.remoteStream = new MediaStream();
  }

  const existing = peer.remoteStream
    .getTracks()
    .find((t) => t.id === track.id);
  if (!existing) {
    peer.remoteStream.addTrack(track);
    watchTrack(peerUUId, track);
  }

  if (track.kind === "audio") {
    attachRemoteAudio(peerUUId, peer.remoteStream);
  }

  syncPeersToStore();
}

function createPeerConnection(peerUUId: string): RTCPeerConnection {
  const existing = peers.get(peerUUId);
  if (existing) {
    return existing.pc;
  }

  const pc = new RTCPeerConnection(buildRtcConfiguration());
  const audioElement = document.createElement("audio");
  audioElement.autoplay = true;
  ensureRemoteMediaRoot().appendChild(audioElement);

  peers.set(peerUUId, { pc, audioElement, remoteStream: null });

  if (localStream) {
    for (const track of localStream.getTracks()) {
      pc.addTrack(track, localStream);
    }
  }

  pc.onicecandidate = (event) => {
    if (!event.candidate || !session) {
      return;
    }
    logWebRtc("ICE candidate for", peerUUId, event.candidate.type);
    void sendSignal({
      type: "ice-candidate",
      lessonUUId: session.lessonUUId,
      toUserUUId: peerUUId,
      candidate: event.candidate.toJSON(),
    });
  };

  pc.ontrack = (event) => {
    logWebRtc("Remote track received from", peerUUId, event.track.kind);
    const stream = event.streams[0];
    if (stream) {
      for (const track of stream.getTracks()) {
        attachRemoteTrack(peerUUId, track);
      }
      return;
    }
    attachRemoteTrack(peerUUId, event.track);
  };

  pc.onconnectionstatechange = () => {
    logWebRtc(
      "Peer",
      peerUUId,
      "connectionState:",
      pc.connectionState,
      "ice:",
      pc.iceConnectionState,
    );
    if (pc.connectionState === "failed") {
      removePeer(peerUUId);
      if (
        session &&
        localStream &&
        shouldInitiateWebRtcOffer(session.userUUId, peerUUId)
      ) {
        void createOffer(peerUUId).catch((error) => {
          console.error("[WebRTC] Offer retry failed:", peerUUId, error);
        });
      }
    }
  };

  pc.oniceconnectionstatechange = () => {
    logWebRtc("Peer", peerUUId, "iceConnectionState:", pc.iceConnectionState);
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

  trackMediaPeer(fromUUId);

  if (!localStream) {
    logWebRtc("Join from", fromUUId, "queued until local media is ready");
    return;
  }

  if (shouldInitiateWebRtcOffer(session.userUUId, fromUUId)) {
    await createOffer(fromUUId);
  }
}

async function connectToKnownPeers() {
  if (!session || !localStream) {
    return;
  }

  for (const peerUUId of [...mediaPeerUUIds]) {
    if (peerUUId === session.userUUId) {
      continue;
    }
    await handleJoin(peerUUId);
  }
}

async function processSignal(signal: WebRtcSignalPayload) {
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
      mediaPeerUUIds.delete(signal.fromUserUUId!);
      removePeer(signal.fromUserUUId!);
      break;
  }
}

async function flushPendingSignals() {
  if (!localStream || pendingSignals.length === 0) {
    return;
  }

  const batch = pendingSignals.splice(0, pendingSignals.length);
  logWebRtc("Flushing", batch.length, "queued signals");

  for (const signal of batch) {
    if (!shouldProcessSignal(signal)) {
      continue;
    }
    trackMediaPeer(signal.fromUserUUId);
    try {
      await processSignal(signal);
    } catch (error) {
      console.error("[WebRTC] Queued signal handling failed:", signal.type, error);
    }
  }
}

async function announceMediaJoin() {
  if (!session) {
    return;
  }

  trackMediaPeer(session.userUUId);
  await sendSignal({ type: "join", lessonUUId: session.lessonUUId });
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
  if (!isActiveSignal(signal)) {
    return;
  }

  if (signal.type === "join") {
    trackMediaPeer(signal.fromUserUUId);
  }

  if (!localStream) {
    if (shouldProcessSignal(signal) || signal.type === "join") {
      queueSignal(signal);
    }
    return;
  }

  if (!shouldProcessSignal(signal)) {
    return;
  }

  try {
    await processSignal(signal);
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
    await FeathersHelper.waitUntilConnected();
    FeathersHelper.rejoinLessonChannel();

    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    mediaStore.localMicEnabled =
      localStream.getAudioTracks()[0]?.enabled ?? false;
    mediaStore.localCamEnabled =
      localStream.getVideoTracks()[0]?.enabled ?? false;
    mediaStore.connected = true;
    syncLocalStreamToStore();
    mediaStore.videoDockVisible = true;
    mediaStore.videoDockOpen = true;

    await applyMicPolicy(policy, userUUId, isTeacher);
    await flushPendingSignals();
    await announceMediaJoin();
    await connectToKnownPeers();
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

  pendingSignals.length = 0;
  mediaPeerUUIds.clear();

  if (remoteMediaRoot) {
    remoteMediaRoot.innerHTML = "";
  }

  mediaStore.connected = false;
  mediaStore.localMicEnabled = false;
  mediaStore.localCamEnabled = false;
  mediaStore.localMediaStream = null;
  mediaStore.videoDockVisible = false;
  mediaStore.videoDockOpen = false;
  mediaStore.setRemoteParticipants([]);
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
  syncLocalStreamToStore();
  return true;
}

export function isLessonMediaConnected(): boolean {
  return !!session && !!localStream;
}
