<template>
  <accessLinkDialog :dialog="accessLinkDialogOpen"></accessLinkDialog>
  <freeTextDialog v-model="freeTextDialogOpen"></freeTextDialog>

  <v-toolbar color="primary" dark class="vertical-toolbar" height="500">
    <!-- create access link -->
    <v-tooltip text="<span>Create Access Link</span>">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          @click.stop="accessLinkDialogOpen = true"
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
          :disabled="!editEnabled || !hasActiveCell"
          v-on:click="startTextMode"
          @click.stop="freeTextDialogOpen = true"
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

    <!-- power-->
    <v-tooltip text="power">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          :color="powerButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="togglePowerMode"
          :disabled="!editEnabled"
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
import useMatrixHelper from "../helpers/matrixHelper";
import useAuthHelper from "../helpers/authHelper";
import accessLinkDialog from "./AccessLinkDialog.vue";
import freeTextDialog from "./FreeTextDialog.vue";
import useEventBus from "../helpers/eventBus";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { computed } from "vue";
import { useUserStore } from "../store/pinia/userStore";

const matrixHelper = useMatrixHelper();
const authHelper = useAuthHelper();
const eventBus = useEventBus();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const userStore = useUserStore();

let checkmarkButtonActive = ref(1);
let semicheckmarkButtonActive = ref(1);
let xmarkButtonActive = ref(1);
let selectionButtonActive = ref(1);
let fractionButtonActive = ref(1);
let squareRootButtonActive = ref(1);
let powerButtonActive = ref(1);

let accessLinkDialogOpen = ref(false);
let freeTextDialogOpen = ref(false);
let textButtonActive = ref(1);

const editEnabled = computed(() => {
  return authHelper.canEdit;
});

const hasActiveCell = computed(() => {
  return notationStore.activeNotation?.user;
});

const answerCheckMode = computed(() => {
  return (
    notationStore.getParent().value.type == "ANSWER" && userStore.isTeacher
  );
});

let toggle_exclusive = 10;

watch(
  () => eventBus.bus.value.get("resetToolbarState"),
  () => {
    reset();
  },
);

watch(
  () => eventBus.bus.value.get("resetToolbarState"),
  (value: string) => {
    submitText(value);
  },
);

function submitText(value: string) {
  let activeCell = notationStore.activeCell;
  if (!activeCell) return;

  let fromCol = activeCell.col;
  let toCol =
    activeCell.col + Math.floor(matrixHelper.freeTextRectWidth(value));
  let fromRow = activeCell.row;
  let toRow =
    activeCell.row + Math.floor(matrixHelper.freeTextRectHeight(value));
  notationMutateHelper.addTextNotation(fromCol, toCol, fromRow, toRow, value);
}

function reset() {
  checkmarkButtonActive.value = 1;
  semicheckmarkButtonActive.value = 1;
  xmarkButtonActive.value = 1;
  selectionButtonActive.value = 1;
  fractionButtonActive.value = 1;
  squareRootButtonActive.value = 1;
  powerButtonActive.value = 1;
  notationStore.setEditMode("SYMBOL");
}

function toggleFractionMode() {
  reset();
  if (notationStore.getEditMode().value == "FRACTION") {
    reset();
  } else {
    startFractionMode();
  }
}

function startFractionMode() {
  reset();
  fractionButtonActive.value = 0;
  notationStore.setEditMode("FRACTION");
}

function toggleSqrtMode() {
  reset();
  if (notationStore.getEditMode().value == "SQRT") {
    reset();
  } else {
    startSqrtMode();
  }
}

function startSqrtMode() {
  reset();
  squareRootButtonActive.value = 0;
  notationStore.setEditMode("SQRT");
}

function togglePowerMode() {
  reset();
  if (notationStore.getEditMode().value == "POWER") {
    endPowerMode();
  } else {
    startPowerMode();
  }
}

function startPowerMode() {
  reset();
  powerButtonActive.value = 0;
  notationStore.setEditMode("POWER");
}

function endPowerMode() {
  reset();
}

function startTextMode() {
  reset();
  textButtonActive.value = 0;
  notationStore.setEditMode("TEXT");
}

function endTextMode() {
  reset();
}

function toggleSelectionMode() {
  if (notationStore.getEditMode().value == "SELECT") {
    endSelectionMode();
  } else {
    startSelectionMode();
  }
}

function startSelectionMode() {
  reset();
  selectionButtonActive.value = 0;
  notationStore.setEditMode("SELECT");
}

function endSelectionMode() {
  reset();
  notationStore.setEditMode("SYMBOL");
}

function toggleCheckmarkMode() {
  if (notationStore.getEditMode().value == "CHECKMARK") {
    reset();
    notationStore.setEditMode("SYMBOL");
  } else {
    startCheckmarkMode();
  }
}

function startCheckmarkMode() {
  reset();
  checkmarkButtonActive.value = 0;
  notationStore.setEditMode("CHECKMARK");
}

function toggleSemiCheckmarkMode() {
  if (notationStore.getEditMode().value == "SEMICHECKMARK") {
    reset();
    notationStore.setEditMode("SYMBOL");
  } else {
    startSemiCheckmarkMode();
  }
}

function startSemiCheckmarkMode() {
  reset();
  semicheckmarkButtonActive.value = 0;
  notationStore.setEditMode("SEMICHECKMARK");
}

function toggleXmarkMode() {
  if (notationStore.getEditMode().value == "XMARK") {
    reset();
    notationStore.setEditMode("SYMBOL");
  } else {
    startXmarkMode();
  }
}

function startXmarkMode() {
  reset();
  xmarkButtonActive.value = 0;
  notationStore.setEditMode("XMARK");
}

/*

    // $symbolButtonPressed(e) {
    //   if (getCurrentEditMode() === 'SYMBOL')
    //     notationMixin_addNotation(e.currentTarget.innerText, "symbol");
    //   else if (getCurrentEditMode() === "POWER) {
    //     notationMixin_addNotation(e.currentTarget.innerText, "power");
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
