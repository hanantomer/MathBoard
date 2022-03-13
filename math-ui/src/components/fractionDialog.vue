<template>
  <v-row justify="center">
    <v-dialog v-model="show" persistent max-width="400px">
      <v-card>
        <v-card-title>Fraction Editor</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="nominatorValue"
            class="fraction-text"
          ></v-text-field>
          <v-divider></v-divider>
          <v-text-field
            v-model="denominatorValue"
            class="fraction-text"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
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
      nominatorValue: "",
      denominatorValue: "",
    };
  },
  methods: {
    save() {
      this.$emit("save", {
        nominatorValue: this.nominatorValue,
        denominatorValue: this.denominatorValue,
      });
      this.show = false;
    },
  },
};
</script>
<style scoped>
.fraction-text >>> .v-input__slot::before {
  border-style: none !important;
}
.fraction-text >>> .v-input__slot::after {
  border-style: none !important;
}
.fraction-text >>> .v-text-field__details {
  display: none;
}
.fraction-text >>> .v-text-field__slot {
  background-color: lightblue;
  color: black !important;
  font-weight: bold;
}

.v-text-field {
  padding-top: 6px !important;
}

hr {
  border-width: 2px;
}
</style>
