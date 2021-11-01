<template>
  <v-row justify="center">
    <v-dialog v-model="show" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="headline">Exercise Access Link</span>
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
          <v-btn color="blue darken-1" text @click="copy">
            Copy To Clipboard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  name: "CreateAccessLinkDialog",

  props: {
    value: Boolean,
  },

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
  },
  data() {
    return {
      site: "http://localhost:8080/mathBoard/",
      link: "",
      linkPrefix: "l",
    };
  },
  methods: {
    copy: function () {
      navigator.clipboard.writeText(this.link);
      this.show = false;
      this.$emit("create", { link: this.link });
    },
  },
  created: function () {
    this.link = this.site + this.link + Math.random().toString(36);
  },
};
</script>
