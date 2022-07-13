<template>
  <v-row justify="center">
    <v-dialog v-model="show" persistent max-width="400px" min-height="400x">
      <v-form @submit.prevent="save">
        <v-card>
          <v-card-title>
            <span class="headline">Specify lesson name</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="name"
                    label="name*"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              data-cy="button-login"
              color="blue darken-1"
              text
              type="submit"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  props: {
    dialog: { show: false, name: "" },
  },
  watch: {
    dialog(val) {
      this.show = val.show;
      this.name = val.name;
    },
  },
  data() {
    return {
      name: "",
      show: false,
    };
  },
  methods: {
    save() {
      this.$emit("save", { name: this.name });
    },
  },
};
</script>
