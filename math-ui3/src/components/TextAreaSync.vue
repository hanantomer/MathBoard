<template>
  <div v-show="show">
    <div
      :style="{
        left: left,
        top: top,
        position: 'absolute',
      }"
      class="user-name"
    >
      {{ userName }}
    </div>
    <textarea
      ref="textareaRef"
      :style="{
        height: height,
        width: width,
        left: left,
        top: top,
      }"
      :value="value"
      class="textsync"
      readonly
      disabled
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { TextSyncUpdateData, TextSyncEndData } from "common/globals";
import useWatchHelper from "../helpers/watchHelper";
import useApiHelper from "../helpers/apiHelper";

const apiHelper = useApiHelper();

const watchHelper = useWatchHelper();

let height = ref("");
let width = ref("");
let left = ref("");
let top = ref("");
let value = ref("");
let userName = ref("");
let show = ref(false);
let id = ref("");
let textareaRef = ref<HTMLTextAreaElement>();

watchHelper.watchTextSync(syncIncomingChanges);

watchHelper.watchTextSyncEndData(syncIncomingChangesEnd);

async function syncIncomingChanges(textSyncUpdateData: TextSyncUpdateData) {
  setIncomingData(textSyncUpdateData);
  show.value = true;
  if (id.value) hideTextNotation(id.value);
}

function syncIncomingChangesEnd() {
  show.value = false;
  reset();
  if (id.value) showTextNotation(id.value);
}

function hideTextNotation(uuid: string) {
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.add("hidden");
}

function showTextNotation(uuid: string) {
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.remove("hidden");
}

function reset() {
  left.value = "0px";
  top.value = "0px";
  height.value = "100px";
  width.value = "100px";
  value.value = "";
  userName.value = "";
  show.value = false;
}

async function setIncomingData(textSyncUpdateData: TextSyncUpdateData) {
  id.value = textSyncUpdateData.notationUUId
    ? textSyncUpdateData.notationUUId
    : "";
  left.value = textSyncUpdateData.x + "px";
  top.value = textSyncUpdateData.y + "px";
  height.value = textSyncUpdateData.height + "px";
  width.value = textSyncUpdateData.width + "px";
  value.value = textSyncUpdateData.text;
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.scrollTop = textareaRef.value.scrollHeight;
    }
  });
  userName.value =
    (await apiHelper.getUser(textSyncUpdateData.userUUId)).firstName || "";
}
</script>

<style scoped>
.textsync {
  background-color: rgb(232, 232, 215);
  padding: 5px;
  font-family: inherit;
  font-size: inherit;
  position: absolute;
}

.user-name {
  font-size: xx-small;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}
</style>
