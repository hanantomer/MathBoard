import { mapGetters } from "vuex";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState({
      activeRect: (state) => state.activeRectStore.activeRect,
    }),
  },
  watch: {
    activeRect: {
      handler(activeRect) {
        this.matrixMixin_activateRectByCoordinates(activeRect);
      },
    },
  },
  methods: {
    ...mapGetters({
      getActiveRect: "getActiveRect",
    }),
    activateRectMixin_findRectAtClickedPosition(e) {
      //return
      let r = this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "rect"
      );

      return r;
    },
    activateRectMixin_activateRect(rect) {
      let clickedPosition = {
        col: rect.attributes.col.value,
        row: rect.parentNode.attributes.row.value,
        type: "rect",
      };
      this.$store.dispatch("setActiveRect", clickedPosition).then(() => {
        this.userOperationsMixin_syncOutgoingSelectedPosition(clickedPosition);
      });
    },
  },
};
