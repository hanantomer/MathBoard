<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" persistent max-width="400px">
      <v-card>
        <v-card-title>
          <span class="headline">Edit Fraction</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="nominatorValue" required></v-text-field>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="denominatorValue"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
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
    isOpen: false,
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
    },
  },
};
</script>
