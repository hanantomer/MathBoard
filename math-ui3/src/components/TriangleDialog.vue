<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      max-width="400px"
      persistent
      @keydown.esc="closeDialog"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Triangle construction</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  :rules="[
                    rules.required,
                    rules.maxAngelValue,
                    rules.minAngelValue,
                  ]"
                  label="A"
                  v-model="A"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  :rules="[
                    rules.required,
                    rules.maxAngelValue,
                    rules.minAngelValue,
                  ]"
                  v-model="B"
                  label="B"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  :rules="[
                    rules.required,
                    rules.maxAngelValue,
                    rules.minAngelValue,
                  ]"
                  v-model="C"
                  label="C"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-card>
                  <v-card-item>
                    <svg ref="triangleSvg" width="200" height="200">
                      <polygon
                        ref="trianglePolygon"
                        points="100,10 50,100 150,100"
                        style="fill: lime; stroke: purple; stroke-width: 1"
                      />
                    </svg>
                  </v-card-item>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialog"> Close </v-btn>
          <v-btn color="blue darken-1" @click="submit"> Submit triangle </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch, onActivated } from "vue";
import useEventBus from "../helpers/eventBusHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { TriangleNotationAttributes } from "common/baseTypes";
import { onMounted } from "vue";

const emit = defineEmits(["close", "save"]);
const eventBus = useEventBus();
const notationStore = useNotationStore();

const dialog = ref(false);
const props = defineProps({
  show: { type: Boolean },
});

watch(
  () => props.show,
  (newVal) => {
    dialog.value = newVal;
  },
);

watch(
  () => dialog.value,
  (dialog) => {
    if (dialog) {
      setTimeout(setInitalAnglesValue, 0);
    }
  },
);

let A = ref(60);
let B = ref(60);
let C = ref(60);

watch(
  () => A.value,
  () => {
    drawTriangle();
  },
);

watch(
  () => B.value,
  () => {
    drawTriangle();
  },
);

watch(
  () => C.value,
  () => {
    drawTriangle();
  },
);

const rules = {
  required: (value: number) => !!value || "Required.",
  maxAngelValue: (value: number) =>
    value <= 178 || "Maximum angel value is 178",
  minAngelValue: (value: number) => value >= 1 || "Minimum angel value is 1",
};

function setInitalAnglesValue() {
  if (notationStore.getSelectedNotations()[0]?.notationType == "TRIANGLE") {
    const triangleNotationAttributes =
      notationStore.getSelectedNotations()[0] as TriangleNotationAttributes;

    A.value = triangleNotationAttributes.A;
    B.value = triangleNotationAttributes.B;
    C.value = triangleNotationAttributes.C;
  }

  drawTriangle();
}

let triangleSvg = ref<SVGSVGElement | null>();
let trianglePolygon = ref<SVGPolygonElement | null>();

function drawTriangle() {

  if (A.value + B.value + C.value !== 180) return;

  const ACoordinates: DOMPoint = trianglePolygon.value?.points[0]!;
  const BCoordinates: DOMPoint = trianglePolygon.value?.points[1]!;

  const adjecentLen = Math.sqrt(
    (ACoordinates?.x - BCoordinates.x) * (BCoordinates?.y - ACoordinates.y),
  ); // pitagoras

  const hypotenuseLen = adjecentLen * Math.cos(Math.PI*(A.value/180));

  const oppositeLen = hypotenuseLen * Math.sin(Math.PI*(A.value/180));

  const p2y =
    Math.pow(oppositeLen, 2) -
    BCoordinates.x * ACoordinates.x -
    Math.pow(hypotenuseLen, 2) +
    ACoordinates.x * ACoordinates.y;

  const p2x =
    (Math.pow(hypotenuseLen, 2) +
      ACoordinates.x * p2y -
      ACoordinates.x * ACoordinates.y) /
    p2y;

  const p1 = new DOMPoint(100, 0);
  const p2 = new DOMPoint(p2x, p2y);
  const p3 = new DOMPoint(0, 100);

  trianglePolygon.value?.points.replaceItem(p1, 0);
  trianglePolygon.value?.points.replaceItem(p2, 1);
  trianglePolygon.value?.points.replaceItem(p3, 2);
}

function submit() {
  if (A.value + B.value + C.value !== 180) return;

  eventBus.emit("triangleSubmited", {
    A: A.value,
    B: B.value,
    C: C.value,
  });
  emit("close");
}

function closeDialog() {
  emit("close");
}
</script>
