<template>
  <v-row>
    <v-col cols="10">
      <mathBoard :svgId="svgId" :loaded="loaded">
        <template #title
          ><p>{{ lessonTitle }}</p></template
        >1
      </mathBoard>
    </v-col>
    <v-col cols="2" v-if="teacher">
      <lesson-students></lesson-students>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from "vuex";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import userOperationsOutgoingSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import userOperationsIncomingSyncMixin from "../Mixins/userIncomingOperationsSyncMixin";
import lessonStudents from "./LessonStudents.vue";
import newItemDialog from "./NewItemDialog.vue";
import matrixMixin from "../Mixins/matrixMixin";
import activateObjectMixin from "../Mixins/activateObjectMixin";
import notationMixin from "../Mixins/notationMixin";
import mathBoard from "./MathBoard.vue";

export default {
  components: {
    mathBoard,
    lessonStudents,
    newItemDialog,
  },
  mounted: function () {
    this.loadLesson(this.$route.params.LessonUUId).then(() => {
      if (!this.isTeacher()) {
        this.addLessonToSharedLessons();
      }
      this.loaded = true; // signal child
    });
  },
  mixins: [
    userOperationsOutgoingSyncMixin,
    userOperationsIncomingSyncMixin,
    matrixMixin,
    activateObjectMixin,
    notationMixin,
  ],
  data: function () {
    return {
      loaded: false,
      svgId: "lessonSvg",
    };
  },
  computed: {
    ...mapGetters({
      teacher: "isTeacher",
    }),
    ...mapState({
      lessonTitle: (state) => {
        return state.lessonStore.currentLesson.name;
      },
    }),
  },
  watch: {
    $route: "loadLesson",
  },
  methods: {
    ...mapGetters({
      getCurrentLesson: "getCurrentLesson",
      isTeacher: "isTeacher",
    }),
    ...mapActions({
      loadLessonNotations: "loadLessonNotations",
      addLessonToSharedLessons: "addLessonToSharedLessons",
    }),
    loadLesson: async function (lessonUUID) {
      // load from db to store
      await this.$store.dispatch("loadLesson", lessonUUID);

      // for student, send heartbeat to teacher
      if (!this.isTeacher()) {
        setInterval(
          this.userOperationsMixin_syncOutgoingHeartBeat,
          5000,
          this.getCurrentLesson().uuid
        );
      }

      // refresh screen
      this.loadLessonNotations();

      // listen to other users
      this.mixin_syncIncomingUserOperations();

      // init outgoing relay
      this.userOperationsMixin_init();
    },
  },
};
</script>
