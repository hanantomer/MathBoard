import { defineStore } from "pinia";
import { ref } from "vue";
import { TextSyncUpdateData, TextSyncEndData } from "common/globals";
import { get } from "lodash";

export const useTextSyncStore = defineStore("textSync", () => {
  const TextSyncUpdateData = ref<TextSyncUpdateData>();
  const TextSyncEndData = ref<TextSyncEndData>();

  function getTextSyncUpdateData() {
    return TextSyncUpdateData.value;
  }

  function setTextSyncUpdateData(newData: TextSyncUpdateData) {
    TextSyncUpdateData.value = newData;
  }

  function getTextSyncEndData() {
    return TextSyncEndData.value;
  }

  function setTextSyncEndData(newData: TextSyncEndData) {
    TextSyncEndData.value = newData;
  }

  return {
    getTextSyncUpdateData,
    setTextSyncUpdateData,
    getTextSyncEndData,
    setTextSyncEndData,
  };
});
