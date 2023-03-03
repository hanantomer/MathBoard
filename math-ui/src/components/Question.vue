<template>
  <v-row>
    <v-col cols="12">
      <mathBoard :svgId="svgId" :loaded="loaded">
        <template #title
          ><p>{{ questionTitle }}</p></template
        >1
      </mathBoard>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from "vuex";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import mathBoard from "./MathBoard.vue";
import matrixMixin from "../Mixins/matrixMixin";
import activateObjectMixin from "../Mixins/activateObjectMixin";
import notationMixin from "../Mixins/notationMixin";

export default {
  mixins: [matrixMixin, activateObjectMixin, notationMixin],
  components: {
    mathBoard,
  },
  mounted: async function () {
    await this.$loadQuestion();
    this.loaded = true; // signal child
  },

  data: function () {
    return {
      svgId: "questionsSvg",
      loaded: false,
      selectedStudent: { text: "", value: 0 },
    };
  },

  computed: {
    doShowStudentsList: function () {
      return this.isTeacher() && this.students.length > 0;
    },
    ...mapState({
      students: function (state) {
        return state.answerStore.answers?.length === 0
          ? []
          : state.answerStore.answers.map((a) => {
              return {
                text: `${a.User.firstName} ${a.User.lastName}`,
                value: a.User.id,
              };
            });
      },
      questionTitle: (state) => {
        return state.questionStore.currentQuestion.name;
      },
    }),
  },
  watch: {
    $route: "loadQuestion",
  },
  methods: {
    ...mapGetters({
      getCurrentLesson: "getCurrentLesson",
      getCurrentQuestion: "getCurrentQuestion",
      getUser: "getUser",
      getCurrentEditMode: "getCurrentEditMode",
      getNotations: "getNotations",
      isTeacher: "isTeacher",
      getStudent: "getStudent",
    }),
    ...mapActions({
      loadLesson: "loadLesson",
      loadQuestion: "loadQuestion",
      loadQuestionNotations: "loadQuestionNotations",
      addAnswer: "addAnswer",
    }),

    markQuestionAsResolved: async function () {},

    $loadQuestion: async function () {
      await this.loadLesson(this.getCurrentQuestion().LessonUUId);
      // load from db to store
      await this.loadQuestion(
        this.$route.params.questionUUId || this.getCurrentQuestion().uuid
      );
      await this.loadQuestionNotations();
    },
  },
};
</script>
