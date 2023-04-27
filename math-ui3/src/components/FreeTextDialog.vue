<template>
  <v-row justify="center">
    <v-dialog v-model="show" max-width="800px" @keydown.esc="show = false">
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
                  v-model="text"
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
          <v-btn color="blue darken-1" text @click="show = false">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text @click="submit">
            Submit text
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "freeTextDialog",

  props: {
    value: Boolean,
    editText: String,
  },

  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
  watch: {
    show(val) {
      if (val && !!this.getActiveNotation()?.value) {
        this.text = this.getActiveNotation().value;
      }
    },
  },
  data() {
    return {
      text: "",
      //background_color: "#000001",
    };
  },
  methods: {
    ...mapGetters({
      getActiveNotation: "getActiveNotation",
    }),
    submit: function () {
      this.show = false;
      //this.$emit("submitText", this.text, this.background_color);
      this.$emit("submitText", this.text, "lightYellow");
      this.text = "";
    },
  },
};
</script>
