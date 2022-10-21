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
      if (val) {
        this.text =
          // check if text notation is activated
          this.getActiveRectArr().length > 1
            ? Object.values(this.getNotations()).find((n) => {
                return (
                  n.fromCol == this.getActiveRectArr()[0].col &&
                  n.fromRow == this.getActiveRectArr()[0].row
                );
              }).value
            : "";
      }
    },
  },
  data() {
    return {
      text: "",
    };
  },
  methods: {
    ...mapGetters({
      getActiveRectArr: "getActiveRectArr",
      getNotations: "getNotations",
    }),
    submit: function () {
      this.show = false;
      this.$emit("freeTextSubmitted", this.text);
    },
  },
};
</script>
