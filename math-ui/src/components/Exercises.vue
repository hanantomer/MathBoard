<template>
  <v-container>
    <exercise-dialog
      :isOpen="isDialogOpen"
      v-on="{ save: saveExercise }"
    ></exercise-dialog>
    <v-card class="mx-auto" max-width="900" elevation="10">
      <v-card-title>Exercises</v-card-title>
      <v-btn icon>
        <v-icon>mdi-plus-circle-outline</v-icon>
      </v-btn>
      <v-list>
        <!-- <v-subheader>Ex</v-subheader> -->
        <v-list-item-group v-model="selectedItem" color="primary">
          <v-list-item v-for="(item, i) in items" :key="item.id">
            <v-list-item-content>
              <v-list-item-title
                v-text="item.name"
                @click="exerciseSeletcted(item.id)"
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
    // if no exercises , create a new and show it
    this.loadExercises().then((exercises) => {
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
          path: "/mathboard/" + addedExercise.id,
        });
      });
    },
    exerciseSeletcted(id) {
      this.$router.push({
        path: "/mathboard/" + id,
      });
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
