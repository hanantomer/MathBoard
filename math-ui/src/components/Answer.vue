<template>
  <v-row>
    <v-col cols="12">
      <mathBoard :svgId="svgId" :loaded="loaded">
        <template #title
          ><p>{{ answerTitle }}</p></template
        >1
      </mathBoard>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import mathBoard from "./MathBoard.vue";
import matrixMixin from "../Mixins/matrixMixin";
import activateObjectMixin from "../Mixins/activateObjectMixin";
import notationMixin from "../Mixins/notationMixin";

export default {
  components: {
    mathBoard,
  },
  mixins: [matrixMixin, activateObjectMixin, notationMixin],
  mounted: async function () {
    await this.$loadAnswer();
    this.loaded = true; // signal child
  },

  data: function () {
    return {
      matrix: [],
      loaded: false,
      svgId: "answerSvg",
    };
  },

  mixins: [matrixMixin, activateObjectMixin, notationMixin],
  computed: {
    ...mapState({
      answerTitle: (state) => {
        return (
          state.answerStore.currentAnswer?.User?.firstName +
          " " +
          state.answerStore.currentAnswer?.User?.lastName
        );
      },
    }),
  },
  watch: {
    $route: "loadAnswer",
  },
  methods: {
    ...mapActions({
      loadAnswer: "loadAnswer",
      loadAnswerNotations: "loadAnswerNotations",
      loadQuestionNotations: "loadQuestionNotations",
    }),
    ...mapGetters({
      getCurrentAnswer: "getCurrentAnswer",
    }),

    markAnswerAsChecked: async function () {},

    $loadAnswer: async function () {
      this.activateObjectMixin_reset();
      this.matrixMixin_setMatrix();

      // load from db to store
      await this.loadAnswer(
        this.$route.params.answerUUId || this.getCurrentAnswer().uuid
      );
      await this.loadQuestionNotations();
      await this.loadAnswerNotations();
    },
  },
};
</script>
