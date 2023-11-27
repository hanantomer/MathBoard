<template>
  <accessLinkDialog
    :show="showAccessLinkDialog"
    @close="closeAccessLinkDialog"
  ></accessLinkDialog>
  <freeTextDialog
    :show="showFreeTextDialog"
    @close="closeFreeTextDialog"
  ></freeTextDialog>
  <exponentDialog
    :show="showExponentDialog"
    @close="closeExponentDialog"
  ></exponentDialog>

  <v-toolbar color="primary" dark class="vertical-toolbar" height="500">
    <!-- create access link -->
    <v-tooltip text="Create Access Link">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          @click.stop="openAccessLinkDialog"
          color="white"
          x-small
          fab
          dark
          ><v-icon>mdi-account-plus</v-icon></v-btn
        >
      </template>
    </v-tooltip>

    <!-- text tool  -->
    <v-tooltip text="Free Text">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          :disabled="!textEnabled"
          v-on:click="startTextMode"
          @click.stop="openFreeTextDialog"
          ><v-icon>mdi-text</v-icon></v-btn
        >
      </template>
    </v-tooltip>

    <!-- selection button -->
    <v-tooltip text="Selection">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :color="selectionButtonActive ? 'white' : 'yellow'"
          icon
          :disabled="!editEnabled"
          @click="toggleSelectionMode"
          x-small
          ><v-icon>mdi-selection</v-icon></v-btn
        >
      </template>
    </v-tooltip>

    <!-- fraction line-->
    <v-tooltip text="Draw fraction line">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          :color="fractionButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="toggleFractionMode"
          :disabled="!editEnabled"
        >
          <v-icon>mdi-tooltip-minus-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- sqrt line-->
    <v-tooltip text="Draw sqrt line">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          :color="squareRootButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="toggleSqrtMode"
          :disabled="!editEnabled"
        >
          <v-icon>mdi-square-root</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- exponent-->
    <v-tooltip text="exponent">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          :color="exponentButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="toggleExponentMode"
          :disabled="!editEnabled"
          @click.stop="openExponentDialog"
        >
          <v-icon>mdi-exponent</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- checkmark-->
    <v-tooltip text="Correct">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          v-if="answerCheckMode"
          icon
          :color="checkmarkButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="toggleCheckmarkMode"
        >
          <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- semicheckmark-->
    <v-tooltip text="Half Correct">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          v-if="answerCheckMode"
          icon
          :color="semicheckmarkButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="toggleSemiCheckmarkMode"
        >
          <v-icon style="position: relative; left: 8px">mdi-check</v-icon>
          <v-icon style="position: relative; left: -8px; top: -1px"
            >mdi-minus</v-icon
          >
        </v-btn>
      </template>
    </v-tooltip>

    <!-- xmark-->
    <v-tooltip text="Incorrect">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          v-if="answerCheckMode"
          icon
          :color="xmarkButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="toggleXmarkMode"
        >
          <v-icon>mdi-close-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
  </v-toolbar>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import useAuthHelper from "../helpers/authHelper";
import accessLinkDialog from "./AccessLinkDialog.vue";
import freeTextDialog from "./FreeTextDialog.vue";
import exponentDialog from "./ExponentDialog.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { computed } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import useEventBus from "../helpers/eventBusHelper";
import { ExponentAttributes } from "common/baseTypes";

const authHelper = useAuthHelper();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const userStore = useUserStore();
const editModeStore = useEditModeStore();
const eventBus = useEventBus();

let checkmarkButtonActive = ref(1);
let semicheckmarkButtonActive = ref(1);
let xmarkButtonActive = ref(1);
let selectionButtonActive = ref(1);
let fractionButtonActive = ref(1);
let squareRootButtonActive = ref(1);
let exponentButtonActive = ref(1);

let showAccessLinkDialog = ref(false);
let showFreeTextDialog = ref(false);
let showExponentDialog = ref(false);

let textButtonActive = ref(1);

watch(
  () => editModeStore.getEditMode(),
  (editMode) => {
    if (editMode === editModeStore.getDefaultEditMode()) {
      resetButtonsState();
    }

    if (editMode === "FRACTION") {
      fractionButtonActive.value = 0;
    }

    if (editMode === "SQRT") {
      squareRootButtonActive.value = 0;
    }

    if (editMode === editModeStore.getDefaultEditMode()) {
      resetButtonsState();
    }
  },
  { immediate: true, deep: true },
);

// emitted by exponent dialog
watch(
  () => eventBus.bus.value.get("exponentSubmited"),
  (exponent: ExponentAttributes) => {
    notationMutateHelper.upsertExponentNotation(exponent);
  },
);

// emitted by free text dialog
watch(
  () => eventBus.bus.value.get("freeTextSubmited"),
  (value: string) => {
    notationMutateHelper.upsertTextNotation(value);
  },
);

function openFreeTextDialog() {
  showFreeTextDialog.value = true;
}

function closeFreeTextDialog() {
  showFreeTextDialog.value = false;
}

function openAccessLinkDialog() {
  showAccessLinkDialog.value = true;
}

function closeAccessLinkDialog() {
  showAccessLinkDialog.value = false;
}

function openExponentDialog() {
  showExponentDialog.value = true;
}

function closeExponentDialog() {
  showExponentDialog.value = false;
}

const editEnabled = computed(() => {
  return authHelper.canEdit();
});

const textEnabled = computed(() => {
  if (!editEnabled) return false;

  return (
    notationStore.getSelectedCell() ||
    notationStore.getSelectedNotations()?.at(0)?.notationType === "TEXT"
  );
});

const answerCheckMode = computed(() => {
  return notationStore.getParent().type == "ANSWER" && userStore.isTeacher;
});

function resetButtonsState() {
  checkmarkButtonActive.value = 1;
  semicheckmarkButtonActive.value = 1;
  xmarkButtonActive.value = 1;
  selectionButtonActive.value = 1;
  fractionButtonActive.value = 1;
  squareRootButtonActive.value = 1;
  exponentButtonActive.value = 1;
}

function toggleFractionMode() {
  resetButtonsState();
  if (editModeStore.getEditMode() == "FRACTION") {
    resetButtonsState();
  } else {
    startFractionMode();
  }
}

function startFractionMode() {
  resetButtonsState();
  fractionButtonActive.value = 0;
  editModeStore.setEditMode("FRACTION");
}

function toggleSqrtMode() {
  resetButtonsState();
  if (editModeStore.getEditMode() == "SQRT") {
    resetButtonsState();
  } else {
    startSqrtMode();
  }
}

function startSqrtMode() {
  resetButtonsState();
  squareRootButtonActive.value = 0;
  editModeStore.setEditMode("SQRT");
}

function toggleExponentMode() {
  resetButtonsState();
  if (editModeStore.getEditMode() == "EXPONENT") {
    endExponentMode();
  } else {
    startExponentMode();
  }
}

function startExponentMode() {
  resetButtonsState();
  exponentButtonActive.value = 0;
  editModeStore.setEditMode("EXPONENT");
}

function endExponentMode() {
  resetButtonsState();
}

function startTextMode() {
  resetButtonsState();
  textButtonActive.value = 0;
  editModeStore.setEditMode("TEXT");
}

function toggleSelectionMode() {
  if (editModeStore.getEditMode() == "AREA_SELECT") {
    endSelectionMode();
  } else {
    startSelectionMode();
  }
}

function startSelectionMode() {
  resetButtonsState();
  selectionButtonActive.value = 0;
  editModeStore.setEditMode("AREA_SELECT");
}

function endSelectionMode() {
  resetButtonsState();
  editModeStore.setEditMode("SYMBOL");
}

function toggleCheckmarkMode() {
  if (editModeStore.getEditMode() == "CHECKMARK") {
    resetButtonsState();
    editModeStore.setEditMode("SYMBOL");
  } else {
    startCheckmarkMode();
  }
}

function startCheckmarkMode() {
  resetButtonsState();
  checkmarkButtonActive.value = 0;
  editModeStore.setEditMode("CHECKMARK");
}

function toggleSemiCheckmarkMode() {
  if (editModeStore.getEditMode() == "SEMICHECKMARK") {
    resetButtonsState();
    editModeStore.setEditMode("SYMBOL");
  } else {
    startSemiCheckmarkMode();
  }
}

function startSemiCheckmarkMode() {
  resetButtonsState();
  semicheckmarkButtonActive.value = 0;
  editModeStore.setEditMode("SEMICHECKMARK");
}

function toggleXmarkMode() {
  if (editModeStore.getEditMode() == "XMARK") {
    resetButtonsState();
    editModeStore.setEditMode("SYMBOL");
  } else {
    startXmarkMode();
  }
}

function startXmarkMode() {
  resetButtonsState();
  xmarkButtonActive.value = 0;
  editModeStore.setEditMode("XMARK");
}

/*

    // $symbolButtonPressed(e) {
    //   if (getCurrentEditMode() === 'SYMBOL')
    //     notationMixin_addNotation(e.currentTarget.innerText, "symbol");
    //   else if (getCurrentEditMode() === "EXPONENT) {
    //     notationMixin_addNotation(e.currentTarget.innerText, "exponent");
    //   }
    // },
    $checkmark() {
      //notationMixin_addSpecialSymbol("", NotationType.CHECKMARK);
      checkmarkButtonActive = 0;
    },
    $semicheckmark() {
      //notationMixin_addSpecialSymbol("", NotationType.CHECKMARK);
      semicheckmarkButtonActive = 0;
    },
    $xmark() {
      //notationMixin_addSpecialSymbol("", NotationType.CHECKMARK);
      xmarkButtonActive = 0;
    },
  },

  watch: {
    currentEditMode: {
      deep: true,
      handler(newVal) {
        if (newVal == 'SYMBOL') {
          resetButtonsState();
        }
      },
    },
  },

  data: function () {
    return {
    };
  },
};
*/
</script>

<style>
.vertical-toolbar {
  flex-basis: content;
  flex-flow: column wrap !important;
  width: 55px !important;
  height: max-content !important;
  padding: 4px !important;
}
.vertical-toolbar .v-toolbar__content {
  flex-flow: column wrap !important;
  width: 35px !important;
  height: max-content !important;
  padding: 2px !important;
}
.vertical-toolbar-column {
  flex-basis: content;
}
</style>
