<template>
  <v-app-bar app color="primary" dark dense elevation="8" class="app-bar" >
    <v-img
      class="mx-2"
      src="./assets/beta.png"
      max-height="35"
      max-width="35"
      contain
      style="max-width: 35px; width: 100%; height: auto"
    ></v-img>
    <v-img
      class="mx-2"
      src="./assets/logo.png"
      max-height="65"
      max-width="85"
      contain
    ></v-img>
    <v-toolbar-title>
      ONLINE <strong style="color: darkorange">MATH WHITEBOARD </strong>
      <span class="title">{{ title }}</span>
    </v-toolbar-title>

    <!-- lessons -->
    <v-tooltip text="Lessons" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          data-cy="lessons"
          v-show="showLessons"
          icon
          v-on:click="navToLessons"
          v-bind="props"
        >
          <v-icon>mdi-archive-edit-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- questions -->
    <v-tooltip text="Questions" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-show="showQuestions"
          icon
          v-on:click="navToQuestions"
          v-bind="props"
        >
          <v-icon>mdi-message-question-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- answers -->
    <v-tooltip text="Answers" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-show="showAnswers"
          icon
          v-on:click="navToAnswers"
          v-bind="props"
        >
          <v-icon>mdi-checkbox-marked-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- students -->
    <v-tooltip text="Online Students" location="bottom">
      <template v-slot:activator="{ props }">
        <v-badge
          :content="onlineStudentsCount"
          :model-value="onlineStudentsCount > 0"
          color="green"
          overlap
        >
          <v-tooltip text="Online Students" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-show="showOnlineStudents"
                icon
                v-on:click="showOnlineStudentsDialog"
                v-bind="props"
              >
                <v-icon>mdi-account-school-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-badge>
      </template>
    </v-tooltip>

    <v-tooltip text="Send Feedback" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          color="secondary"
          icon
          @click="emit('show-feedback')"
        >
          <v-icon>mdi-message-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- sign in / register -->
    <v-tooltip text="Sign in as Teacher" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          v-show="!user"
          icon
          v-on:click="showLoginDialog('TEACHER')"
        >
          <v-icon>mdi-account-tie</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip text="Sign in as Student" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          v-show="!user"
          icon
          v-on:click="showLoginDialog('STUDENT')"
        >
          <v-icon>mdi-account-school-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <v-divider class="mx-6" vertical></v-divider>

    <!-- user image or name -->
    <v-tooltip bottom hidden>
      <template v-slot:activator="{ props }">
        <v-avatar v-show="user?.imageUrl" size="36px"
          ><img v-bind:src="user?.imageUrl"
        /></v-avatar>
      </template>
      <span v-show="user?.firstName">{{ user?.firstName }}</span>
    </v-tooltip>

    <span v-show="user?.firstName && !user?.imageUrl"
      >Hello {{ user?.firstName }}</span
    >

    <v-tooltip text="Sign Out" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-show="user" icon v-on:click="signOut" v-bind="props">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import { useTitleStore } from "../store/pinia/titleStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useStudentStore } from "../store/pinia/studentStore";
import { useCookies } from "vue3-cookies";
import { ACCESS_TOKEN_NAME } from "common/globals";

const emit = defineEmits<{
  "show-feedback": [];
}>();

const cookies = useCookies().cookies;
const router = useRouter();
const userStore = useUserStore();
const titleStore = useTitleStore();
const editModeStrore = useEditModeStore();
const studentStore = useStudentStore();

const onlineStudentsCount = computed(() => {
  return studentStore.getStudents().length;
});

const title = computed(() => {
  return titleStore.getTitle();
});

const user = computed(() => {
  return userStore.getCurrentUser();
});

const showLessons = computed(() => {
  return user.value;
});

const showQuestions = computed(() => {
  return userStore.getCurrentUser();
});

const showAnswers = computed(() => {
  return isTeacher.value;
});

const showOnlineStudents = computed(() => {
  return isTeacher.value;
});

const isTeacher = computed(() => userStore.isTeacher());

function showLoginDialog(userType?: string) {
  if (userType) {
    router.push({ name: "login", query: { userType } });
  } else {
    router.push("/login");
  }
}

function signOut() {
  userStore.setCurrentUser(null);
  cookies.remove(ACCESS_TOKEN_NAME);
  router.push("/");
}

function showOnlineStudentsDialog() {
  editModeStrore.setEditMode("STUDENTS_MONITORING");
}

function navToLessons() {
  router.push("/lessons");
}

function navToQuestions() {
  router.push("/questions");
}

function navToAnswers() {
  router.push("/answers");
}
</script>

<style scoped>
.title {
  margin-left: 20px !important;
}
.app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
</style>
