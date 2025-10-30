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
                          <v-col cols="6">
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
                            >
                              <v-icon dark>mdi-pencil</v-icon>
                            </v-btn>
                          </v-col>
                          <v-col cols="2" class="d-flex justify-center">
                            <v-icon color="grey">mdi-account</v-icon>
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
import { useStudentStore } from "../store/pinia/studentStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { UserAttributes } from "../../../math-common/src/userTypes";
import UseUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";

const studentStore = useStudentStore();
const lessonStore = useLessonStore();
const userOutgoingOperations = UseUserOutgoingOperations();
const editModeStore = useEditModeStore();

function toggleEditingTooltip(studentUUId: string): string {
  return studentStore.getAuthorizedStudentUUId() == studentUUId
    ? "Click to disable editing for this student"
    : "Click to enable editing for this student";
}

const show = computed(() => {
  return editModeStore.getEditMode() === "STUDENTS_MONITORING";
});

const students = computed(() => {
  const s = studentStore.getStudents().filter((s) => s.lastHeartbeatTime);
  for (let i = 1; i < 20; i++) {
    s.push({
      uuid: `test-student-uuid-${i}`,
      firstName: `Test${i}`,
      lastName: `Student`,
      imageUrl: `https://i.pravatar.cc/150?u=test-student-${i}`,
      email: "",
    } as UserAttributes);
  }

  return s;
});

function getStudentDisplayName(student: UserAttributes) {
  return student.firstName + " " + student.lastName;
}

function getStudentAuhorizationColor(studentUUId: string) {
  return studentStore.getAuthorizedStudentUUId() === studentUUId
    ? "blue"
    : "grey";
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
