<template>
  <v-dialog v-model="open" max-width="520" scrollable>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center ga-2 pt-4 px-4">
        <v-icon color="primary">mdi-bookshelf</v-icon>
        <span class="text-h6">Lesson library</span>
        <v-spacer />
        <v-btn icon variant="text" size="small" aria-label="Close" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle class="px-4 pb-2">
        Add a ready-made sample to your lessons. You can edit the board after it
        opens.
      </v-card-subtitle>
      <v-divider />
      <v-card-text class="pa-0">
        <v-list lines="two" class="py-0">
          <v-list-item
            v-for="template in templates"
            :key="template.id"
            :data-cy="`lesson-template-${template.id}`"
            rounded="lg"
            class="mx-2 my-1"
            @click="selectTemplate(template.id)"
          >
            <template #prepend>
              <v-avatar color="primary" variant="tonal" size="40">
                <v-icon>{{
                  template.id.includes("pythagorean") ||
                  template.id.includes("trigonometry") ||
                  template.id.includes("geometry")
                    ? "mdi-triangle-outline"
                    : template.id.includes("sqrt")
                      ? "mdi-chart-bell-curve"
                      : "mdi-function-variant"
                }}</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">
              {{ template.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ template.description }}
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                :loading="loadingId === template.id"
                :disabled="!!loadingId && loadingId !== template.id"
                @click.stop="selectTemplate(template.id)"
              >
                Add
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { LESSON_TEMPLATES } from "common/lessonTemplates";

const open = defineModel<boolean>({ required: true });

const emit = defineEmits<{
  select: [templateId: string];
}>();

const templates = LESSON_TEMPLATES;
const loadingId = ref<string | null>(null);

function close() {
  open.value = false;
}

function selectTemplate(templateId: string) {
  loadingId.value = templateId;
  emit("select", templateId);
}

function clearLoading() {
  loadingId.value = null;
}

defineExpose({ clearLoading });
</script>
