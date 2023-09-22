<template>
  <div class="fill-height" style="width: 100%; position: relative">
    <v-row dense style="max-height: 25px">
      <v-col cols="12" class="d-flex justify-center">
        <slot name="title"></slot>
      </v-col>
    </v-row>
    <v-row style="height: 100%">
      <v-col colls="1">
        <toolbar></toolbar>
      </v-col>
      <v-col cols="11">
        <div style="overflow: auto; height: 100%; position: relative">
          <lineDrawer
            :svgId="svgId"
          ></lineDrawer>
          <areaSelector :svgId="svgId"></areaSelector>
          <svg
            v-bind:id="svgId"
            v-bind:width="matrixHelper.svgHeight"
            v-bind:height="matrixHelper.svgWidth"
            v-on:mousedown="eventHelper.mouseDown"
          ></svg>
        </div>
      </v-col>
      <slot name="students"></slot>
    </v-row>
  </div>
</template>

<script setup  lang="ts">

import { useNotationStore } from "../store/pinia/notationStore";
import UseMatrixHelper from "../helpers/matrixHelper";
import UseActivateObjectHelper from "../helpers/activateObjectHelper";
import UseEventHelper from "../helpers/eventHelper";
import toolbar from "./Toolbar.vue";
import areaSelector from "./AreaSelector.vue";
import lineDrawer from "./LineDrawer.vue";
import { watch } from "vue"
import { storeToRefs } from 'pinia'
import useEventBus from "../helpers/eventBus";

const notationStore = useNotationStore();
const eventBus = useEventBus();
const matrixHelper = UseMatrixHelper();
const activateObjectHelper = UseActivateObjectHelper();
const eventHelper = UseEventHelper();
//const { notations } = storeToRefs(notationStore)

const props = defineProps({
  svgId: { type: String , default: null},
  loaded: { type: Boolean, default: false }
})

///todo: implement via eventbus
//            v-on="{
//              drawLineEnded: eventManager_lineDrawEnded,
//}"

watch(() => eventBus.bus.value.get("keyup"), (e: KeyboardEvent) => {
   eventHelper.keyUp(e);
});

watch(() => eventBus.bus.value.get("paste"), (e: ClipboardEvent) => {
   eventHelper.paste(e);
});

watch(() => props.loaded, (loaded: Boolean) => {
  if (loaded) load();
}, {immediate: true});

watch(() => notationStore.getNotations(), () => {
  matrixHelper.refreshScreen(
    Array.from(notationStore.getNotations()).map(([key, value]) => { return value }),
    props.svgId,
    document!.getElementById(props.svgId)!)
}, {immediate :true, deep:true});

function load() {
  activateObjectHelper.reset();
  matrixHelper.setMatrix(props.svgId);
};

function resetToolbarState() {
  eventBus.emit("resetToolbarState");
}

</script>

<style>
.activestudent {
  border: 2px dashed rgb(143, 26, 179);
}
.hellow {
  padding: 5px;
  color: darkkhaki;
}

/* (Optional) Apply a "closed-hand" cursor during drag operation. */
.grabbable:active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}
.nopadding {
  padding: 0 !important;
}
.iconActive {
  background-color: dodgerblue;
}
.deleteButtonActive {
  cursor: URL("~@/assets/delete.jpg"), none !important;
}
mjx-container[jax="SVG"][display="true"] {
  margin: auto !important;
}

mjx-line {
  margin-top: 0.05em !important;
  margin-bottom: 0.3em !important;
}
</style>
