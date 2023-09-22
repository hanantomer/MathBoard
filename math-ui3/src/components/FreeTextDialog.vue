<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="800px" @keydown.esc="dialog = false">
      <v-card>
        <v-card-title>
          <span class="headline">Compose free text</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  autofocus
                  v-model="textValue"
                  background-color="grey lighten-2"
                  color="cyan"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6"> Background color: </v-col>
            </v-row>

            <!-- <v-row>
              <v-col cols="12">
                <v-color-picker
                  v-model="background_color"
                  dot-size="25"
                  mode="hexa"
                  show-swatches
                  swatches-max-height="100"
                ></v-color-picker>
              </v-col>
            </v-row> -->
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="dialog = false">
            Close
          </v-btn>
          <v-btn color="blue darken-1" @click="submit">
            Submit text
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { watch, ref } from "vue"
import { useNotationStore } from "../store/pinia/notationStore";
import { NotationType } from "../../../math-common/src/enum";
import useEventBus from "../helpers/eventBus";
import {
    RectNotationAttributes
} from "../../../math-common/build/baseTypes";


const notationStore = useNotationStore();
const eventBus = useEventBus();

const props = defineProps({
  show: { type: Boolean },
})

let dialog = ref(false);
let textValue = ref("");

watch(() => props.show,(newVal) => {
  dialog.value = newVal;
  setInitalTextValue();
})

function setInitalTextValue() {
  if (notationStore.activeNotation?.notationType == NotationType.TEXT
    && (notationStore.activeNotation as RectNotationAttributes).value)
    textValue.value = (notationStore.activeNotation as RectNotationAttributes).value;
}

function submit() {
  dialog.value = false;
  //this.$emit("submitText", this.text, this.background_color);
  //this.$emit("submitText", this.text, "lightYellow");
  textValue.value = "";
  eventBus.emit("textAdded", textValue.value);
}

//const show = computed(() => {
//  return
  //get() {
  //  return props.value;
  //},
  //set(value) {
  //  emit(value);
  //},
//});

//watch: {
 //   show(val) {
 //     if (val && !!this.getActiveNotation()?.value) {
 //       this.text = this.getActiveNotation().value;
//      }
//    },
//  },
//  data() {
//    return {
//      text: "",
      //background_color: "#000001",
//    };
//  },
//  methods: {
//    ...mapGetters({
//      getActiveNotation: "getActiveNotation",
///    }),
    // submit: function () {
    //   this.show = false;
    //   //this.$emit("submitText", this.text, this.background_color);
    //   this.$emit("submitText", this.text, "lightYellow");
    //   this.text = "";
    // },
  //},
//};
</script>
