<template>
  <v-dialog
    v-model="show"
    max-width="480"
    scrollable
    transition="dialog-bottom-transition"
    persistent
  >
    <v-card class="lesson-students-card">
      <v-card-title class="d-flex align-center ga-2 pa-4">
        <v-icon color="primary">mdi-account-school-outline</v-icon>
        <span class="text-h6 flex-grow-1">Online Students</span>
        <v-chip
          v-if="students.length"
          size="small"
          color="primary"
          variant="tonal"
        >
          {{ students.length }}
        </v-chip>
        <v-btn
          icon
          variant="text"
          size="small"
          aria-label="Close"
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="ma-3 mb-0"
        >
          {{ COLLAB_HELP.lessonStudentsTip }}
        </v-alert>
        <div class="student-list">
          <v-list v-if="students.length" class="py-2">
            <v-list-item
              v-for="student in students"
              :key="student.uuid"
              :active="isStudentAuthorized(student.uuid)"
              active-color="primary"
              rounded="lg"
              class="student-list-item mx-2"
            >
              <template #prepend>
                <v-avatar size="40" color="grey-lighten-3">
                  <v-img
                    v-if="student.imageUrl"
                    :src="student.imageUrl"
                    cover
                    alt=""
                  />
                  <v-icon v-else color="grey-darken-1">mdi-account</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ getStudentDisplayName(student) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{
                  isStudentAuthorized(student.uuid)
                    ? "Can edit the board"
                    : "View only"
                }}
              </v-list-item-subtitle>

              <template #append>
                <div class="student-actions">
                  <v-tooltip
                    location="bottom"
                    :text="toggleEditingTooltip(student.uuid)"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        icon
                        size="small"
                        :variant="
                          isStudentAuthorized(student.uuid) ? 'flat' : 'tonal'
                        "
                        :color="getStudentAuthorizationColor(student.uuid)"
                        aria-label="Toggle editing permission"
                        @click="toggleStudentAuthorization(student)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip
                    v-if="muteAllActive"
                    location="bottom"
                    :text="micTooltip(student.uuid)"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        icon
                        size="small"
                        variant="text"
                        :color="
                          isStudentUnmuted(student.uuid) ? 'success' : 'warning'
                        "
                        :aria-label="
                          isStudentUnmuted(student.uuid)
                            ? 'Mute student microphone'
                            : 'Unmute student microphone'
                        "
                        @click="toggleStudentMic(student.uuid)"
                      >
                        <v-icon>
                          {{
                            isStudentUnmuted(student.uuid)
                              ? "mdi-microphone"
                              : "mdi-microphone-off"
                          }}
                        </v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-icon
                    v-else
                    color="grey-lighten-1"
                    size="small"
                    class="mx-1"
                  >
                    mdi-account-voice
                  </v-icon>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <div v-else class="empty-state text-center pa-8">
            <v-icon size="56" color="grey-lighten-1">
              mdi-account-off-outline
            </v-icon>
            <p class="text-body-1 mt-4 text-medium-emphasis">
              No students have joined this lesson yet.
            </p>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useStudentStore } from "../store/pinia/studentStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useLessonMediaStore } from "../store/pinia/lessonMediaStore";
import { UserAttributes } from "common/userTypes";
import UseUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";
import { COLLAB_HELP } from "../constants/helpCopy";

const studentStore = useStudentStore();
const lessonStore = useLessonStore();
const userOutgoingOperations = UseUserOutgoingOperations();
const editModeStore = useEditModeStore();
const lessonMediaStore = useLessonMediaStore();
const { muteAllActive } = storeToRefs(lessonMediaStore);

function toggleEditingTooltip(studentUUId: string): string {
  return isStudentAuthorized(studentUUId)
    ? "Disable editing for this student"
    : "Allow this student to edit";
}

function micTooltip(studentUUId: string): string {
  return isStudentUnmuted(studentUUId)
    ? "Mute this student"
    : "Unmute this student";
}

const show = computed(() => {
  return editModeStore.getEditMode() === "STUDENTS_MONITORING";
});

const students = computed(() => {
  return studentStore.getStudents().filter((s) => s.lastHeartbeatTime);
});

function getStudentDisplayName(student: UserAttributes) {
  return `${student.firstName} ${student.lastName}`.trim();
}

function isStudentAuthorized(studentUUId: string): boolean {
  return studentStore.getAuthorizedStudentUUId() === studentUUId;
}

function getStudentAuthorizationColor(studentUUId: string) {
  return isStudentAuthorized(studentUUId) ? "primary" : "grey";
}

function isStudentUnmuted(studentUUId: string): boolean {
  return lessonMediaStore.isStudentUnmutedException(studentUUId);
}

function toggleStudentMic(studentUUId: string) {
  const lessonUUId = lessonStore.getCurrentLesson()?.uuid;
  if (!lessonUUId) {
    return;
  }

  const action = isStudentUnmuted(studentUUId) ? "muteStudent" : "unmuteStudent";
  userOutgoingOperations.syncOutgoingLessonMediaAction(
    lessonUUId,
    action,
    studentUUId,
  );
}

function toggleStudentAuthorization(student: UserAttributes) {
  let studentUUId: string | null = student.uuid;
  const previouslyAuthorizedStudentUUId: string | null =
    studentStore.getAuthorizedStudentUUId();

  if (previouslyAuthorizedStudentUUId === student.uuid) {
    studentUUId = null;
  }

  studentStore.setAuthorizedStudentUUId(studentUUId);

  userOutgoingOperations.syncOutgoingAuthorizeUser(
    student.uuid,
    previouslyAuthorizedStudentUUId,
    lessonStore.getCurrentLesson()!.uuid,
  );
}

function closeDialog() {
  editModeStore.setDefaultEditMode();
}
</script>

<style scoped>
.student-list {
  max-height: min(65vh, 520px);
  overflow-y: auto;
}

.student-list-item {
  margin-bottom: 4px;
}

.student-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.student-actions :deep(.v-btn) {
  pointer-events: auto;
}

.empty-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
