<template>
  <v-container>
    <exercise-dialog
      :isOpen="isDialogOpen"
      v-on="{ save: saveExercise }"
    ></exercise-dialog>
    <v-card>
      <v-card-title>Exercises</v-card-title>
      <v-btn icon>
        <v-icon>mdi-plus-circle-outline</v-icon>
      </v-btn>
      <v-list>
        <!-- <v-subheader>Ex</v-subheader> -->
        <v-list-item-group v-model="selectedItem" color="primary">
          <v-list-item v-for="item in items" :key="item.id">
            <v-list-item-content>
              <v-list-item-title
                v-text="item.name"
                @click="exerciseSeletcted(item)"
              ></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </v-container>
</template>
<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import ExerciseDialog from "./ExerciseDialog.vue";

export default {
  components: { ExerciseDialog },
  name: "Exercises",
  mounted() {
    this.loadExercises().then((exercises) => {
      console.debug(`loadExercises: ${JSON.stringify(exercises)}`);
      if (!exercises) {
        this.openExerciseDialog();
      }
    });
  },
  computed: {
    items() {
      return this.getExercises();
    },
  },
  methods: {
    ...mapActions({
      loadExercises: "loadExercises",
      addExercise: "addExercise",
      setCurrentExercise: "setCurrentExercise",
    }),
    ...mapGetters({
      getExercises: "getExercises",
    }),
    openExerciseDialog() {
      this.isDialogOpen = true;
    },
    saveExercise(exercise) {
      this.addExercise(exercise).then((addedExercise) => {
        this.$router.push({
          path: "/symbols/" + addedExercise.id,
        });
      });
    },
    async exerciseSeletcted(exercise) {
      this.setCurrentExercise(exercise).then(() =>
        this.$router.push({
          path: "/symbols/" + exercise.id,
        })
      );
    },
  },
  data() {
    return {
      selectedItem: {},
      isDialogOpen: false,
      menu: [
        { icon: "plus", title: "Add" },
        { icon: "remove", title: "Remove" },
      ],
    };
  },
};
</script>

<style></style>
