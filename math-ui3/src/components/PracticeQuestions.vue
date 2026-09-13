<template>
  <v-container class="practice-page">
    <v-card class="mx-auto mt-4" max-width="800" min-height="600">
      <div class="practice-hero px-4 pt-4 pb-2">
        <h1 class="practice-hero__title">{{ WELCOME_PATHS.practice.title }}</h1>
        <p class="practice-hero__lead">{{ WELCOME_PATHS.practice.landingLead }}</p>
        <router-link class="practice-hero__class" to="/">
          {{ WELCOME_PATHS.practice.classroomLink }}
        </router-link>
      </div>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Practice</v-toolbar-title>
        <v-spacer />
        <v-btn
          variant="tonal"
          color="white"
          class="mr-2"
          prepend-icon="mdi-image-plus"
          data-cy="practice-blank-entry"
          @click="openBlankSheet"
        >
          Blank sheet
        </v-btn>
      </v-toolbar>

      <v-chip-group
        v-model="selectedSubject"
        class="px-4 pt-1"
        mandatory
        selected-class="text-primary"
      >
        <v-chip
          v-for="subject in subjects"
          :key="subject"
          :value="subject"
          filter
        >
          {{ subject }}
        </v-chip>
      </v-chip-group>

      <v-data-table
        :items="practiceQuestions"
        :headers="headers"
        item-value="uuid"
        class="elevation-1"
        :hover="true"
        :loading="practiceQuestionStore.loading"
        loading-text="Loading questions…"
        @click:row="openQuestion"
      >
        <template #item.name="{ item }">
          <div class="practice-q-name">{{ rowItem(item).name }}</div>
          <div
            v-if="rowItem(item).tags.length"
            class="practice-q-tags"
          >
            <v-chip
              v-for="tag in rowItem(item).tags"
              :key="tag"
              size="x-small"
              variant="tonal"
              class="mr-1"
            >
              {{ tag }}
            </v-chip>
          </div>
        </template>
        <template #no-data>
          <div class="text-center pa-8 text-medium-emphasis">
            {{
              practiceQuestionStore.loading
                ? "Loading questions…"
                : "No practice questions in this subject yet."
            }}
          </div>
        </template>
      </v-data-table>

      <v-card
        class="ma-4 blank-sheet-card"
        variant="outlined"
        rounded="lg"
        @click="openBlankSheet"
      >
        <v-card-title class="text-subtitle-1 d-flex align-center">
          <v-icon class="mr-2" color="teal-darken-1">mdi-file-image-outline</v-icon>
          Blank sheet
        </v-card-title>
        <v-card-text class="pt-0 text-body-2 text-medium-emphasis">
          Write the question on the board, paste it as text (Ctrl+V), or
          paste/upload a worksheet image, then solve.
        </v-card-text>
      </v-card>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { PRACTICE_SUBJECTS } from "common/practiceSubjects";
import {
  PRACTICE_DIFFICULTY_LABEL,
  PRACTICE_DIFFICULTY_ORDER,
  getPracticeQuestionTemplateByUUId,
} from "common/practiceQuestionTemplates";
import type { PracticeDifficulty } from "common/practiceQuestionTemplates";
import { WELCOME_PATHS } from "../constants/helpCopy";
import { usePracticeQuestionStore } from "../store/pinia/practiceQuestionStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useBoardContextStore } from "../store/pinia/boardContextStore";

const router = useRouter();
const route = useRoute();
const practiceQuestionStore = usePracticeQuestionStore();
const editModeStore = useEditModeStore();
const boardContext = useBoardContextStore();

const subjects = PRACTICE_SUBJECTS;
const selectedSubject = ref<string>(subjects[0]);

watch(
  route,
  () => {
    editModeStore.setDefaultEditMode();
    boardContext.setPracticeList();
  },
  { immediate: true },
);

watch(
  selectedSubject,
  async (subject) => {
    if (!subject) return;
    await practiceQuestionStore.loadBySubject(subject);
  },
  { immediate: true },
);

const headers = [
  { title: "Question", key: "name", sortable: false },
  { title: "Difficulty", key: "difficultyLabel", sortable: false },
];

const DIFFICULTY_RANK = new Map(
  PRACTICE_DIFFICULTY_ORDER.map((d, i) => [d, i]),
);

const practiceQuestions = computed(() => {
  return Array.from(practiceQuestionStore.getItems().values())
    .map((q) => {
      const template = getPracticeQuestionTemplateByUUId(q.uuid);
      const difficulty = template?.difficulty;
      return {
        uuid: q.uuid,
        name: q.name,
        subject: q.subject,
        tags: template?.tags ?? [],
        difficulty,
        difficultyLabel: difficulty
          ? PRACTICE_DIFFICULTY_LABEL[difficulty]
          : "",
      };
    })
    .sort((a, b) => {
      const ra = DIFFICULTY_RANK.get(a.difficulty as PracticeDifficulty) ?? 99;
      const rb = DIFFICULTY_RANK.get(b.difficulty as PracticeDifficulty) ?? 99;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
});

type ListRow = {
  uuid: string;
  name: string;
  subject: string;
  tags: string[];
  difficulty?: PracticeDifficulty;
  difficultyLabel: string;
};

function rowItem(item: unknown): ListRow {
  const row = item as ListRow & { raw?: ListRow };
  const resolved = row.raw ?? row;
  return { ...resolved, tags: resolved.tags ?? [] };
}

function openQuestion(_: unknown, row: { item: ListRow }) {
  const item = rowItem(row.item);
  router.push({ name: "practiceQuestion", params: { questionUUId: item.uuid } });
}

function openBlankSheet() {
  router.push({ name: "practiceBlank" });
}
</script>

<style scoped>
.practice-page {
  padding-top: 80px;
}

.practice-hero__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f766e;
  line-height: 1.2;
}

.practice-hero__lead {
  margin: 0.5rem 0 0.35rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #475569;
  line-height: 1.4;
}

.practice-hero__class {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ea580c;
  text-decoration: none;
}

.practice-hero__class:hover {
  text-decoration: underline;
}

.blank-sheet-card {
  cursor: pointer;
  border-color: #99f6e4 !important;
  background: #f0fdfa;
}

.blank-sheet-card:hover {
  border-color: #0f766e !important;
}

.practice-q-name {
  font-weight: 600;
}

.practice-q-tags {
  margin-top: 4px;
}
</style>
