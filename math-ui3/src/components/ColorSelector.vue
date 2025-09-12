<template>
  <v-tooltip text="colorize tool">
    <template v-slot:activator="{ props }">
      <v-btn v-show="show" v-bind="props" icon color="white" x-small fab dark
        ><v-icon>mdi-format-color-highlight</v-icon>
        <v-menu activator="parent">
          <v-list>
            <v-list-item
              v-for="(color, index) in colors"
              :key="index"
              v-bind:style="{
                backgroundColor: color === 'none' ? transparentColor : color,
                height: 20,
              }"
              @click="colorizeSelectedNotations(color)"
            >
              <v-list-item-title></v-list-item-title>
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
import { NotationAttributes } from "common/baseTypes";
import { transparentColor } from "common/globals";
import { Color } from "common/unions";
import { computed } from "vue";

import useAuthorizationHelper from "../helpers/authorizationHelper";

const notationMutateHelper = useNotationMutateHelper();
const authorizationHelper = useAuthorizationHelper();
const notationStore = useNotationStore();

const colors: Color[] = [
  "ciyan",
  "blue",
  "green",
  "purple",
  "orange",
  "red",
  "yellow",
  "gray",
  "lightgray",
  "darkgray",
  "lightblue",
  "lightgreen",
  "pink",
  "none",
];

const show = computed(() => {
  return notationStore.getSelectedNotations().length > 0;
});

function colorizeSelectedNotations(color: Color) {
  if (!authorizationHelper.canEdit()) {
    return;
  }
  const selectedNotations = notationStore.getSelectedNotations();
  if (selectedNotations) {
    selectedNotations.forEach((notation) => {
      colorizeNotation(notation, color);
    });
  }
}

function colorizeNotation(notation: NotationAttributes, color: Color) {
  notation.color = color === "none" ? null : { value: color, id: undefined };
  notationMutateHelper.updateNotation(notation);
}
</script>
<style scoped>
.v-list-item {
  min-height: 20px !important;
}
</style>
