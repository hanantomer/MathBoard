import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  LessonMediaPolicy,
  isStudentMicBlocked,
} from "common/lessonMediaTypes";

export type LessonRemoteParticipant = {
  userUUId: string;
  stream: MediaStream;
  hasVideo: boolean;
  hasAudio: boolean;
};

function defaultPolicy(lessonUUId: string): LessonMediaPolicy {
  return {
    lessonUUId,
    muteAllActive: false,
    unmutedStudentUUIds: [],
  };
}

export const useLessonMediaStore = defineStore("lessonMedia", () => {
  const policy = ref<LessonMediaPolicy | null>(null);
  const connected = ref(false);
  const connecting = ref(false);
  const localMicEnabled = ref(false);
  const localCamEnabled = ref(false);
  const mediaAvailable = ref(true);
  const errorMessage = ref<string | null>(null);
  const videoDockVisible = ref(false);
  const videoDockOpen = ref(false);
  const localMediaStream = ref<MediaStream | null>(null);
  const remoteParticipants = ref<LessonRemoteParticipant[]>([]);

  const muteAllActive = computed(() => policy.value?.muteAllActive ?? false);

  function setPolicy(next: LessonMediaPolicy) {
    policy.value = {
      ...next,
      unmutedStudentUUIds: [...next.unmutedStudentUUIds],
    };
  }

  function setRemoteParticipants(next: LessonRemoteParticipant[]) {
    remoteParticipants.value = next;
  }

  function reset(lessonUUId?: string) {
    policy.value = lessonUUId ? defaultPolicy(lessonUUId) : null;
    connected.value = false;
    connecting.value = false;
    localMicEnabled.value = false;
    localCamEnabled.value = false;
    errorMessage.value = null;
    videoDockVisible.value = false;
    videoDockOpen.value = false;
    localMediaStream.value = null;
    remoteParticipants.value = [];
  }

  function isMicBlockedForStudent(studentUUId: string): boolean {
    if (!policy.value) {
      return false;
    }
    return isStudentMicBlocked(policy.value, studentUUId);
  }

  function isStudentUnmutedException(studentUUId: string): boolean {
    return policy.value?.unmutedStudentUUIds.includes(studentUUId) ?? false;
  }

  return {
    policy,
    connected,
    connecting,
    localMicEnabled,
    localCamEnabled,
    mediaAvailable,
    errorMessage,
    videoDockVisible,
    videoDockOpen,
    localMediaStream,
    remoteParticipants,
    muteAllActive,
    setPolicy,
    setRemoteParticipants,
    reset,
    isMicBlockedForStudent,
    isStudentUnmutedException,
  };
});
