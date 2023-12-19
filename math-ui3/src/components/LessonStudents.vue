<template>
  <div>
    <v-card>
      <v-card-title>
        <p style="font-size: 1vw">Online Students</p></v-card-title
      >
      <v-card-text>
        <v-list v-if="students" active-class="activestudent" color="indigo">
          <v-list-item
            v-for="student in students"
            :key="student.uuid"
            v-on:click="toggleStudentAuthorization(student)"
          >
            <v-avatar>
              <v-img :src="student.imageUrl"></v-img>
            </v-avatar>
            <v-list-item-title
              style="font-size: 0.9vw"
              v-text="getStudentDisplayName(student)"
            >
            </v-list-item-title>
            <v-btn
              class="[mx-2]"
              fab
              dark
              x-small
              :color="getStudentAuhorizationColor(student.uuid)"
            >
              <v-icon dark> mdi-pencil </v-icon>
            </v-btn>
          </v-list-item>
        </v-list>
        <p v-else>No stuedents have yet shown up to this class</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStudentStore } from "../store/pinia/studentStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { UserAttributes } from "../../../math-common/build/userTypes";
import UseUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";

const studentStore = useStudentStore();
const lessonStore = useLessonStore();
const userOutgoingOperations = UseUserOutgoingOperations();

const students = computed(() => {
  return studentStore.getStudents();
});

function getStudentDisplayName(student: UserAttributes) {
  return student.firstName + " " + student.lastName;
}

function getStudentAuhorizationColor(studentUUId: string) {
  return studentStore.getAuthorizedStudentUUId() === studentUUId
    ? "blue"
    : "green";
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
</script>

<style>
.activestudent {
  border: 2px dashed rgb(143, 26, 179);
}
</style>
