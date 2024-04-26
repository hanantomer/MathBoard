<template>
  <accessLinkDialog
    :show="showAccessLinkDialog"
    @close="closeAccessLinkDialog"
  ></accessLinkDialog>

  <freeTextDialog
    :show="showFreeTextDialog"
    @close="closeFreeTextDialog"
  ></freeTextDialog>

  <v-toolbar color="primary" dark class="vertical-toolbar" height="500">
    <!-- create access link -->
    <v-tooltip text="Create Access Link" v-if="userStore.isTeacher()">
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

    <!-- horizontal line-->
    <v-tooltip text="Draw horizontal line">
      <template v-slot:activator="{ props }">
        <v-btn
          data-cy="horizontalLine"
          v-bind="props"
          icon
          :color="horizontalLineButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="startHorizontalLineMode"
          :disabled="!editEnabled"
        >
          <v-icon
            ><span class="material-symbols-outlined">
              horizontal_rule
            </span></v-icon
          >
        </v-btn>
      </template>
    </v-tooltip>

    <!-- vertical line-->
    <v-tooltip text="Draw vertical line">
      <template v-slot:activator="{ props }">
        <v-btn
          data-cy="verticalLine"
          v-bind="props"
          icon
          :color="verticalLineButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="startVerticalLineMode"
          :disabled="!editEnabled"
        >
          <v-icon style="transform: rotate(90deg)"
            ><span class="material-symbols-outlined">
              horizontal_rule
            </span></v-icon
          >
        </v-btn>
      </template>
    </v-tooltip>

    <!-- slope line-->
    <v-tooltip text="Draw sloped line">
      <template v-slot:activator="{ props }">
        <v-btn
          data-cy="slopeLine"
          v-bind="props"
          icon
          :color="slopeLineButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="startSlopeLineMode"
          :disabled="!editEnabled"
        >
          <v-icon style="transform: rotate(115deg)"
            ><span class="material-symbols-outlined">
              horizontal_rule
            </span></v-icon
          >
        </v-btn>
      </template>
    </v-tooltip>

    <!-- sqrt line-->
    <v-tooltip text="Draw sqrt line">
      <template v-slot:activator="{ props }">
        <v-btn
          data-cy="sqrt"
          v-bind="props"
          icon
          :color="squareRootButtonActive ? 'white' : 'yellow'"
          x-small
          fab
          dark
          v-on:click="startSqrtMode"
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
          :color="exponentButtonActive ? 'white' : 'yellow'"
          icon
          v-on:click="toggleExponentMode"
          :disabled="!exponentEnabled"
        >
          <v-icon>mdi-exponent</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- text tool  -->
    <v-tooltip text="Free Text">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          v-on:click="startTextMode"
          :disabled="!textEnabled"
          @click.stop="openFreeTextDialog"
          ><v-icon>mdi-text</v-icon></v-btn
        >
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
import accessLinkDialog from "./AccessLinkDialog.vue";
import freeTextDialog from "./FreeTextDialog.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { computed } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import useEventBus from "../helpers/eventBusHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";

const authorizationHelper = useAuthorizationHelper();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const userStore = useUserStore();
const editModeStore = useEditModeStore();
const eventBus = useEventBus();

let checkmarkButtonActive = ref(1);
let semicheckmarkButtonActive = ref(1);
let xmarkButtonActive = ref(1);
let selectionButtonActive = ref(1);
let verticalLineButtonActive = ref(1);
let slopeLineButtonActive = ref(1);
let horizontalLineButtonActive = ref(1);
let squareRootButtonActive = ref(1);
let exponentButtonActive = ref(1);
let textButtonActive = ref(1);

let showAccessLinkDialog = ref(false);
let showFreeTextDialog = ref(false);
//let showExponentDialog = ref(false);

watch(
  () => editModeStore.getEditMode(),
  (editMode) => {
    if (
      editMode === editModeStore.getDefaultEditMode() ||
      editMode == "AREA_SELECTED"
    ) {
      resetButtonsState();
    }

    if (editMode === "HORIZONTAL_LINE_STARTED") {
      horizontalLineButtonActive.value = 0;
    }

    if (editMode === "VERTICAL_LINE_STARTED") {
      verticalLineButtonActive.value = 0;
    }

    if (editMode === "SLOPE_LINE_STARTED") {
      slopeLineButtonActive.value = 0;
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
// watch(
//   () => eventBus.bus.value.get("exponentSubmited"),
//   (exponent: ExponentAttributes) => {
//     notationMutateHelper.upsertExponentNotation(exponent);
//   },
// );

// emitted by free text dialog
watch(
  () => eventBus.bus.value.get("freeTextSubmited"),
  (value: string) => {
    notationMutateHelper.upsertTextNotation(value);
  },
);

// emitted by triangle dialog
// watch(
//   () => eventBus.bus.value.get("triangleSubmited"),
//   (triangle: TriangleAttributes) => {
//     notationMutateHelper.upsertTriangleNotation(triangle);
//   },
// );

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

// function openExponentDialog() {
//   showExponentDialog.value = true;
// }

// function closeExponentDialog() {
//   showExponentDialog.value = false;
// }

const editEnabled = computed(() => {
  return authorizationHelper.canEdit();
});

const textEnabled = computed(() => {
  if (!editEnabled.value) return false;

  return (
    notationStore.getSelectedCell() ||
    notationStore.getSelectedNotations()?.at(0)?.notationType === "TEXT"
  );
});

const exponentEnabled = computed(() => {
  if (!editEnabled.value) return false;

  return (
    notationStore.getSelectedCell() ||
    notationStore.getSelectedNotations()?.at(0)?.notationType === "EXPONENT"
  );
});

const answerCheckMode = computed(() => {
  return notationStore.getParent().type == "ANSWER" && userStore.isTeacher();
});

function resetButtonsState() {
  checkmarkButtonActive.value =
    semicheckmarkButtonActive.value =
    xmarkButtonActive.value =
    selectionButtonActive.value =
    horizontalLineButtonActive.value =
    verticalLineButtonActive.value =
    slopeLineButtonActive.value =
    squareRootButtonActive.value =
    exponentButtonActive.value =
      1;
}

// function toggleHorizontalLineMode() {
//   resetButtonsState();
//   if (editModeStore.getEditMode() == "HORIZONTAL_LINE_STARTED") {
//     resetButtonsState();
//   } else {
//     startHorizontalLineMode();
//   }
// }

// function toggleVerticalLineMode() {
//   resetButtonsState();
//   if (editModeStore.getEditMode() == "VERTICAL_LINE_STARTED") {
//     resetButtonsState();
//   } else {
//     startVerticalLineMode();
//   }
// }

// function toggleSlopeLineMode() {
//   resetButtonsState();
//   if (editModeStore.getEditMode() == "SLOPE_LINE_STARTED") {
//     resetButtonsState();
//   } else {
//     startSlopeLineMode();
//   }
// }

function startHorizontalLineMode() {
  resetButtonsState();
  horizontalLineButtonActive.value = 0;
  editModeStore.setEditMode("HORIZONTAL_LINE_STARTED");
}

function startVerticalLineMode() {
  resetButtonsState();
  verticalLineButtonActive.value = 0;
  editModeStore.setEditMode("VERTICAL_LINE_STARTED");
}

function startSlopeLineMode() {
  resetButtonsState();
  slopeLineButtonActive.value = 0;
  editModeStore.setEditMode("SLOPE_LINE_STARTED");
}

// function toggleSqrtMode() {
//   resetButtonsState();
//   if (editModeStore.getEditMode() == "SQRT") {
//     resetButtonsState();
//   } else {
//     startSqrtMode();
//   }
// }

function toggleExponentMode() {
  resetButtonsState();
  if (editModeStore.getEditMode() == "EXPONENT") {
    resetButtonsState();
  } else {
    startExponentMode();
  }
}

function startSqrtMode() {
  resetButtonsState();
  squareRootButtonActive.value = 0;
  editModeStore.setEditMode("SQRT");
}

function startExponentMode() {
  resetButtonsState();
  exponentButtonActive.value = 0;
  editModeStore.setEditMode("EXPONENT");
}

function startTriangleMode() {
  resetButtonsState();
  editModeStore.setEditMode("GEO");
}

function startTextMode() {
  resetButtonsState();
  textButtonActive.value = 0;
  editModeStore.setEditMode("TEXT");
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
