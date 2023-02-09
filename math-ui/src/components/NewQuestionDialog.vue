<template>
  <v-row justify="center">
    <v-dialog v-model="show" persistent max-width="500px" min-height="500x">
      <v-form @submit.prevent="save">
        <v-card>
          <v-card-title class="headline">
            <span>Please specify question properties</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="selectedLesson"
                    :items="lessons"
                    item-value="uuid"
                    item-text="name"
                    label="lesson:"
                    dense
                    outlined
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    autofocus
                    v-model="name"
                    label="Name*"
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
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

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
    ...mapActions({
      setCurrentLesson: "setCurrentLesson",
    }),
    ...mapGetters({
      getCurrentLesson: "getCurrentLesson",
      getLessons: "getLessons",
    }),
  },
  computed: {
    lessons() {
      return this.getLessons();
    },
    selectedLesson: {
      set(lessonUUId) {
        this.setCurrentLesson(
          this.getLessons().find((l) => l.uuid == lessonUUId)
        );
      },
      get() {
        return this.getCurrentLesson();
      },
    },
  },
};
</script>
