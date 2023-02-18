<template>
  <v-row justify="center">
    <v-dialog v-model="show" max-width="400px" @keydown.esc="show = false">
      <v-card>
        <v-card-title>
          <span class="headline">Lesson Access Link</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="link"
                  label="Access Link"
                  value=""
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="show = false">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text @click="copy">
            Copy To Clipboard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "accessLinkDialog",

  props: {
    value: Boolean,
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
    link() {
      return this.site + this.getCurrentLesson().uuid;
    },
  },
  data() {
    return {
      site: "http://localhost:8080/lesson/", ///TODO: point to parameter
    };
  },
  methods: {
    ...mapGetters({
      getCurrentLesson: "getCurrentLesson",
    }),
    copy: function () {
      navigator.clipboard.writeText(this.link);
      this.show = false;
    },
  },
};
</script>
