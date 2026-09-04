<template>
  <div class="practice-section-list" data-cy="practice-section-list">
    <button
      v-for="part in parts"
      :key="part.id"
      type="button"
      class="practice-section-list__item"
      :class="{
        'practice-section-list__item--active': part.id === activePartId,
        'practice-section-list__item--done': statusOf(part.id) === 'completed',
        'practice-section-list__item--started': statusOf(part.id) === 'started',
        'practice-section-list__item--locked': statusOf(part.id) === 'locked',
      }"
      :aria-current="part.id === activePartId ? 'true' : undefined"
      :aria-disabled="statusOf(part.id) === 'locked' ? 'true' : undefined"
      :data-cy="`practice-section-${part.id}`"
      @click="$emit('select', part.id)"
    >
      <v-icon
        v-if="statusOf(part.id) === 'completed'"
        size="16"
        class="practice-section-list__check"
      >
        mdi-check-circle
      </v-icon>
      <v-icon
        v-else-if="statusOf(part.id) === 'locked'"
        size="16"
        class="practice-section-list__lock"
      >
        mdi-lock-outline
      </v-icon>
      <span v-else class="practice-section-list__num">({{ part.id }})</span>
      <span class="practice-section-list__text">{{ part.text }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PracticeProblemPart } from "common/practiceParts";
import { partStatus } from "../helpers/practicePartOrderHelper";

const props = defineProps<{
  parts: PracticeProblemPart[];
  activePartId: string | null;
  completedPartIds: string[];
  startedPartIds: string[];
}>();

defineEmits<{
  select: [id: string];
}>();

function statusOf(id: string) {
  return partStatus(id, props.startedPartIds, props.completedPartIds);
}
</script>

<style scoped>
.practice-section-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.practice-section-list__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.practice-section-list__item:hover {
  background: rgba(32, 39, 80, 0.06);
}

.practice-section-list__item--active {
  border-color: rgba(25, 118, 210, 0.45);
  background: rgba(25, 118, 210, 0.08);
}

.practice-section-list__item--done .practice-section-list__text {
  color: rgba(0, 0, 0, 0.55);
}

.practice-section-list__item--started .practice-section-list__num {
  font-weight: 700;
}

.practice-section-list__item--locked:hover {
  background: transparent;
}

.practice-section-list__num,
.practice-section-list__check,
.practice-section-list__lock {
  flex: 0 0 auto;
  margin-top: 1px;
  color: rgba(25, 118, 210, 0.9);
}

.practice-section-list__check {
  color: #2e7d32;
}

.practice-section-list__lock {
  color: rgba(0, 0, 0, 0.45);
}

.practice-section-list__text {
  flex: 1 1 auto;
  font-size: 0.85rem;
  line-height: 1.35;
}
</style>
