<template>
  <v-dialog v-model="show" transition="dialog-bottom-transition" persistent>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <p style="font-size: 1vw">Online Students</p>
              <v-btn
                icon
                size="small"
                variant="text"
                @click="closeDialog"
                aria-label="Close"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div class="scrollable-list">
                <v-list
                  v-if="students.length"
                  active-class="activestudent"
                  color="indigo"
                >
                  <v-list-item
                    v-for="student in students"
                    :key="student.uuid"
                    @click="toggleStudentAuthorization(student)"
                  >
                    <v-tooltip
                      bottom
                      :text="toggleEditingTooltip(student.uuid)"
                    >
                      <template #activator="{ props }">
                        <v-row align="center" no-gutters>
                          <v-col cols="2" class="d-flex justify-center">
                            <v-avatar>
                              <v-img :src="student.imageUrl"></v-img>
                            </v-avatar>
                          </v-col>
                          <v-col cols="5">
                            <span>{{ getStudentDisplayName(student) }}</span>
                          </v-col>
                          <v-col cols="2" class="d-flex justify-center">
                            <v-btn
                              class="mx-2"
                              fab
                              dark
                              x-small
                              :color="getStudentAuhorizationColor(student.uuid)"
                              v-bind="props"
                              @click.stop
                            >
                              <v-icon dark>mdi-pencil</v-icon>
                            </v-btn>
                          </v-col>
                          <v-col cols="3" class="d-flex justify-center">
                            <v-btn
                              v-if="muteAllActive"
                              icon
                              size="small"
                              variant="text"
                              :color="
                                isStudentUnmuted(student.uuid)
                                  ? 'success'
                                  : 'warning'
                              "
                              @click.stop="toggleStudentMic(student.uuid)"
                            >
                              <v-icon>
                                {{
                                  isStudentUnmuted(student.uuid)
                                    ? "mdi-microphone"
                                    : "mdi-microphone-off"
                                }}
                              </v-icon>
                            </v-btn>
                            <v-icon v-else color="grey">mdi-account</v-icon>
                          </v-col>
                        </v-row>
                      </template>
                    </v-tooltip>
                  </v-list-item>
                </v-list>
                <p v-else>No students have yet shown up to this class</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
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

const studentStore = useStudentStore();
const lessonStore = useLessonStore();
const userOutgoingOperations = UseUserOutgoingOperations();
const editModeStore = useEditModeStore();
const lessonMediaStore = useLessonMediaStore();
const { muteAllActive } = storeToRefs(lessonMediaStore);

function toggleEditingTooltip(studentUUId: string): string {
  return studentStore.getAuthorizedStudentUUId() == studentUUId
    ? "Click to disable editing for this student"
    : "Click to enable editing for this student";
}

const show = computed(() => {
  return editModeStore.getEditMode() === "STUDENTS_MONITORING";
});

const students = computed(() => {
  return studentStore.getStudents().filter((s) => s.lastHeartbeatTime);
});

function getStudentDisplayName(student: UserAttributes) {
  return student.firstName + " " + student.lastName;
}

function getStudentAuhorizationColor(studentUUId: string) {
  return studentStore.getAuthorizedStudentUUId() === studentUUId
    ? "blue"
    : "grey";
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

  // clicked on authorized student
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

// Add close dialog function
function closeDialog() {
  editModeStore.setDefaultEditMode();
}
</script>

<style>
.scrollable-list {
  max-height: 650px;
  overflow-y: auto;
}
.activestudent {
  border: 2px dashed rgb(143, 26, 179);
}
</style>

