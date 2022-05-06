<template>
  <v-container>
    <lesson-dialog
      :isOpen="isDialogOpen"
      v-on="{ save: saveLesson }"
    ></lesson-dialog>
    <v-card class="d-flex align-center justify-center">
      <v-card-title>Lessons</v-card-title>

      <v-list>
        <v-btn icon>
          <v-icon>mdi-plus-circle-outline</v-icon>
        </v-btn>
        <v-list-item-group v-model="selectedItem" color="primary">
          <v-list-item v-for="item in items" :key="item.id">
            <v-list-item-content>
              <v-list-item-title
                v-text="item.name"
                @click="lessonSeletcted(item)"
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
import LessonDialog from "./LessonDialog.vue";

export default {
  components: { LessonDialog },
  name: "Lessons",
  mounted() {
    this.loadLessons().then((lessons) => {
      console.debug(`loadLessons: ${JSON.stringify(lessons)}`);
      if (!lessons) {
        this.openLessonDialog();
      }
    });
  },
  computed: {
    items() {
      return this.getLessons();
    },
  },
  methods: {
    ...mapActions({
      loadLessons: "loadLessons",
      addLesson: "addLesson",
      setCurrentLesson: "setCurrentLesson",
    }),
    ...mapGetters({
      getLessons: "getLessons",
    }),
    openLessonDialog() {
      this.isDialogOpen = true;
    },
    saveLesson(lesson) {
      this.addLesson(lesson).then((addedLesson) => {
        this.$router.push({
          path: "/symbols/" + addedLesson.id,
        });
      });
    },
    async lessonSeletcted(lesson) {
      this.setCurrentLesson(lesson).then(() =>
        this.$router.push({
          path: "/symbols/" + lesson.id,
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
