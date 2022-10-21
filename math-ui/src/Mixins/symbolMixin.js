import { mapGetters } from "vuex";

export default {
  methods: {
    ...mapGetters({
      getActiveRectArr: "getActiveRectArr",
    }),
    symbolMixin_addSymbol(value, type) {
      let activeRect = this.getActiveRectArr()[0];
      let symbol = {
        value: value,
        type: type,
      };
      symbol.col = activeRect.col;
      symbol.row = activeRect.row;

      this.$store
        .dispatch("addNotation", symbol)
        .then((symbol) => {
          this.userOperationsMixin_syncOutgoingSaveNotation(symbol);
        })
        .then(() => {
          this.matrixMixin_setNextRect(1, 0);
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
