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
              aria-label="Toggle right arrow"
              aria-keyshortcuts="R"
              @click="toggleRightArrow()"
            >
              <v-list-item-title v-if="hasRightOrDownArrow"
                >Remove {{RightOrDownArrowLabel}} arrow</v-list-item-title
              >
              <v-list-item-title v-if="!hasRightOrDownArrow"
                >Add {{RightOrDownArrowLabel}} arrow</v-list-item-title
              >
              <template v-slot:prepend>
                <v-icon>mdi-arrow-right</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              role="button"
              aria-label="Toggle left arrow"
              aria-keyshortcuts="L"
              @click="toggleLeftArrow()"
            >
              <v-list-item-title v-if="hasLeftOrUpArrow"
                >Remove {{LeftOrUpArrowLabel}} arrow</v-list-item-title
              >
              <v-list-item-title v-if="!hasLeftOrUpArrow"
                >Add {{LeftOrUpArrowLabel}} arrow</v-list-item-title
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
import { computed, ref } from "vue";

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

const hasRightOrDownArrow = computed(() => {
  const notation = notationStore.getSelectedNotations()[0];
  return notation && (notation as LineNotationAttributes).arrowRight;
});

const hasLeftOrUpArrow = computed(() => {
  const notation = notationStore.getSelectedNotations()[0];
  return notation && (notation as LineNotationAttributes).arrowLeft;
});

type LineProperty = "arrowRight" | "arrowLeft" | "dashed";

const LeftOrUpArrowLabel = computed(() => {
  const notation =
    notationStore.getSelectedNotations()[0] as LineNotationAttributes;
  if (!notation) return "Left";
  return notation.p1x === notation.p2x ? "Up" : "Left";
});

const RightOrDownArrowLabel = computed(() => {
  const notation =
    notationStore.getSelectedNotations()[0] as LineNotationAttributes;
  if (!notation) return "Right";
  return notation.p1x === notation.p2x ? "Down" : "Right";
});


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
