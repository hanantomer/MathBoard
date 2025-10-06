<template>
  <v-tooltip text="line properties">
    <template v-slot:activator="{ props }">
      <v-btn v-show="show" v-bind="props" icon color="white" x-small fab dark
        ><v-icon>mdi-dots-vertical</v-icon>
        <v-menu activator="parent">
          <v-list>
            <v-list-item
              role="button"
              aria-label="Toggle dashed line"
              aria-keyshortcuts="D"
              @click="toggleDashedLine()"
            >
              <v-list-item-title v-if="isDashed"
                >Remove dashed line</v-list-item-title
              >
              <v-list-item-title v-if="!isDashed"
                >Add dashed line</v-list-item-title
              >
              <template v-slot:prepend>
                <v-icon>mdi-dots-horizontal</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              role="button"
              aria-label="Toggle dashed line"
              aria-keyshortcuts="D"
              @click="toggleRightArrow()"
            >
              <v-list-item-title v-if="hasRightArrow"
                >Remove right arrow</v-list-item-title
              >
              <v-list-item-title v-if="!hasRightArrow"
                >Add right arrow</v-list-item-title
              >
              <template v-slot:prepend>
                <v-icon>mdi-arrow-right</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              role="button"
              aria-label="Toggle dashed line"
              aria-keyshortcuts="D"
              @click="toggleLeftArrow()"
            >
              <v-list-item-title v-if="hasLeftArrow"
                >Remove left arrow</v-list-item-title
              >
              <v-list-item-title v-if="!hasLeftArrow"
                >Add left arrow</v-list-item-title
              >
              <template v-slot:prepend>
                <v-icon>mdi-arrow-left</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { LineNotationAttributes } from "common/baseTypes";
import { computed } from "vue";

import useAuthorizationHelper from "../helpers/authorizationHelper";

const notationMutateHelper = useNotationMutateHelper();
const authorizationHelper = useAuthorizationHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();

const show = computed(() => {
  return (
    notationStore.getSelectedNotations().length === 1 &&
    notationStore.getSelectedNotations()[0].notationType === "LINE"
  );
});

const isDashed = computed(() => {
  const notation = notationStore.getSelectedNotations()[0];
  return notation && (notation as LineNotationAttributes).dashed;
});

const hasRightArrow = computed(() => {
  const notation = notationStore.getSelectedNotations()[0];
  return notation && (notation as LineNotationAttributes).arrowRight;
});

const hasLeftArrow = computed(() => {
  const notation = notationStore.getSelectedNotations()[0];
  return notation && (notation as LineNotationAttributes).arrowLeft;
});

type LineProperty = "arrowRight" | "arrowLeft" | "dashed";

function toggleLineProperty(property: LineProperty) {
  if (!authorizationHelper.canEdit()) {
    return;
  }

  const notation =
    notationStore.getSelectedNotations()[0] as LineNotationAttributes;
  if (!notation) return;

  notation[property] = !notation[property];
  notationMutateHelper.updateNotation(notation);
  editModeStore.setDefaultEditMode();
}

function toggleRightArrow() {
  toggleLineProperty("arrowRight");
}

function toggleLeftArrow() {
  toggleLineProperty("arrowLeft");
}

function toggleDashedLine() {
  toggleLineProperty("dashed");
}
</script>
<style scoped>
/* .v-list-item {
  min-height: 20px !important;
} */
</style>
