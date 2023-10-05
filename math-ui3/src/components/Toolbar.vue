<template>
  <div>
    <accessLinkDialog :dialog="accessLinkDialogOpen"></accessLinkDialog>
    <freeTextDialog v-model="freeTextDialogOpen"></freeTextDialog>

    <v-toolbar color="primary" dark class="vertical-toolbar">
      <!-- create access link -->
      <v-tooltip top hidden v-model="showAccessTooltip">
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
        <span>Create Access Link</span>
      </v-tooltip>
      <!-- text tool  -->
      <v-tooltip top hidden>
        <template v-slot:activator="{ props }">
          <v-btn-toggle
            v-model="textButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-bind="props"
              icon
              :disabled="!editEnabled || !hasActiveCell"
              v-on:click="startTextMode"
              @click.stop="freeTextDialogOpen = true"
              x-small
              ><v-icon>mdi-text</v-icon></v-btn
            >
          </v-btn-toggle>
        </template>
        <span>Free Text</span>
      </v-tooltip>

      <!-- selection button -->
      <v-tooltip top hidden>
        <template v-slot:activator="{ props }">
          <v-btn-toggle
            v-model="selectionButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-bind="props"
              color="yellow"
              icon
              :disabled="!editEnabled"
              v-on:click="toggleSelectionMode"
              x-small
              ><v-icon>mdi-selection</v-icon></v-btn
            >
          </v-btn-toggle>
        </template>
        <span>Selection</span>
      </v-tooltip>

      <!-- fraction line-->
      <v-tooltip top hidden v-model="showFractionLineTooltip">
        <template v-slot:activator="{ props }">
          <v-btn-toggle
            v-model="fractionButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-bind="props"
              icon
              color="white"
              x-small
              fab
              dark
              v-on:click="toggleFractionMode"
              :disabled="!editEnabled"
            >
              <v-icon>mdi-tooltip-minus-outline</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Draw fraction line</span>
      </v-tooltip>

      <!-- sqrt line-->
      <v-tooltip top hidden v-model="showSquareRootTooltip">
        <template v-slot:activator="{ props }">
          <v-btn-toggle
            v-model="squareRootButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-bind="props"
              icon
              color="white"
              x-small
              fab
              dark
              v-on:click="toggleSqrtMode"
              :disabled="!editEnabled"
            >
              <v-icon>mdi-square-root</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Draw sqrt line</span>
      </v-tooltip>

      <!-- power-->
      <v-tooltip top hidden v-model="showPowerTooltip">
        <template v-slot:activator="{ props }">
          <v-btn-toggle
            v-model="powerButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-bind="props"
              icon
              color="white"
              x-small
              fab
              dark
              v-on:click="togglePowerMode"
              :disabled="!editEnabled"
            >
              <v-icon>mdi-exponent</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Power</span>
      </v-tooltip>

      <!-- checkmark-->
      <v-tooltip top hidden v-model="showCheckmarkTooltip">
        <template v-slot:activator="{ props }">
          <v-btn-toggle
            v-model="checkmarkButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-bind="props"
              v-if="answerCheckMode"
              icon
              color="white"
              x-small
              fab
              dark
              v-on:click="toggleCheckmarkMode"
            >
              <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Correct</span>
      </v-tooltip>

      <!-- semicheckmark-->
      <v-tooltip top hidden v-model="showSemicheckmarkTooltip">
        <template v-slot:activator="{ props }">
          <v-btn-toggle
            v-model="semicheckmarkButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-bind="props"
              v-if="answerCheckMode"
              icon
              color="white"
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
          </v-btn-toggle>
        </template>
        <span>Half Correct</span>
      </v-tooltip>

      <!-- xmark-->
      <v-tooltip top hidden v-model="showXmarkTooltip">
        <template v-slot:activator="{ props }"  >
          <v-btn-toggle
            v-model="xmarkButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-bind="props"
              v-if="answerCheckMode"
              icon
              color="white"
              x-small
              fab
              dark
              v-on:click="toggleXmarkMode"
            >
              <v-icon>mdi-close-outline</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Incorrect</span>
      </v-tooltip>
    </v-toolbar>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from "vue"
import { BoardType, EditMode } from "../../../math-common/src/unions";
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

let showFractionLineTooltip = ref(false);
let showSquareRootTooltip = ref(false);
let showPowerTooltip = ref(false);
let showAccessTooltip = ref(false);
let showCheckmarkTooltip = ref(false);
let showSemicheckmarkTooltip = ref(false);
let showXmarkTooltip = ref(false);


const editEnabled = computed(() => {
  return authHelper.canEdit;
});

const hasActiveCell = computed(() => {
  return notationStore.activeNotation?.user;
});

const answerCheckMode = computed(() => {
  return notationStore.getParent().value.type == "ANSWER" && userStore.isTeacher;
});

watch(() => eventBus.bus.value.get("resetToolbarState"), () => {
  reset();
});

watch(() => eventBus.bus.value.get("resetToolbarState"), (value: string) => {
  submitText(value);
});



function submitText(value: string) {
  let activeCell = notationStore.activeCell;
  if (!activeCell) return;

  let fromCol = activeCell.col;
  let toCol = activeCell.col + Math.floor(matrixHelper.freeTextRectWidth(value));
  let fromRow = activeCell.row;
  let toRow = activeCell.row + Math.floor(matrixHelper.freeTextRectHeight(value));
  notationMutateHelper.addTextNotation(fromCol, toCol, fromRow, toRow, value)
};


function reset() {
  checkmarkButtonActive.value = 1;
  semicheckmarkButtonActive.value = 1;
  xmarkButtonActive.value = 1;
  selectionButtonActive.value = 1;
  fractionButtonActive.value = 1;
  squareRootButtonActive.value = 1;
  powerButtonActive.value = 1;
  notationMutateHelper.setCurrentEditMode('SYMBOL');
}

function toggleFractionMode() {
  reset();
  if (notationStore.getEditMode().value == "FRACTION") {
    reset();
  } else {
    startFractionMode();
  }
};

function startFractionMode() {
  reset();
  fractionButtonActive.value = 0;
  notationMutateHelper.setCurrentEditMode("FRACTION");
};

function toggleSqrtMode() {
  reset();
  if (notationStore.getEditMode().value == "SQRT") {
    reset();
  } else {
    startSqrtMode();
  }
};

function startSqrtMode() {
  reset();
  squareRootButtonActive.value = 0;
  notationMutateHelper.setCurrentEditMode("SQRT");
};

function togglePowerMode() {
  reset();
  if (notationStore.getEditMode().value == "POWER") {
    endPowerMode();
  } else {
      startPowerMode();
  }
};

function startPowerMode() {
  reset();
  powerButtonActive.value = 0;
  notationMutateHelper.setCurrentEditMode("POWER");
};

function endPowerMode() {
  reset();
};

function startTextMode() {
  reset();
  textButtonActive.value = 0;
  notationMutateHelper.setCurrentEditMode("TEXT");
};

function endTextMode() {
      reset();
};

function toggleSelectionMode() {
      if (notationStore.getEditMode().value == 'SELECT') {
        endSelectionMode();
      } else {
        startSelectionMode();
      }
};

function startSelectionMode() {
      reset();
      selectionButtonActive.value = 0;
      notationMutateHelper.setCurrentEditMode('SELECT');
};

function endSelectionMode() {
      reset();
      notationMutateHelper.setCurrentEditMode('SYMBOL');
};

function toggleCheckmarkMode() {
      if (notationStore.getEditMode().value == "CHECKMARK") {
        reset();
        notationMutateHelper.setCurrentEditMode('SYMBOL');
      } else {
        startCheckmarkMode();
      }
};

function startCheckmarkMode() {
      reset();
      checkmarkButtonActive.value = 0;
      notationMutateHelper.setCurrentEditMode("CHECKMARK");
};

function toggleSemiCheckmarkMode() {
      if (notationStore.getEditMode().value == "SEMICHECKMARK") {
        reset();
        notationMutateHelper.setCurrentEditMode('SYMBOL');
      } else {
        startSemiCheckmarkMode();
      }
};

function startSemiCheckmarkMode() {
      reset();
      semicheckmarkButtonActive.value = 0;
      notationMutateHelper.setCurrentEditMode("SEMICHECKMARK");
};

function toggleXmarkMode() {
      if (notationStore.getEditMode().value == "XMARK") {
        reset();
        notationMutateHelper.setCurrentEditMode('SYMBOL');
      } else {
        startXmarkMode();
      }
};

function startXmarkMode() {
      reset();
      xmarkButtonActive.value = 0;
      notationMutateHelper.setCurrentEditMode("XMARK");
};


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
