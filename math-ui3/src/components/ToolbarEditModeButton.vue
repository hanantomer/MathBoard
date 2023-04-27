<template>
  <div>
    <v-tooltip top hidden>
      <template v-slot:activator="{ on, attrs }">
        <v-btn-toggle
          v-model="active"
          background-color="transparent"
          active-class="iconActive"
        >
          <v-btn
            color="yellow"
            icon
            v-on="on"
            v-bind="attrs"
            v-on:click="$toggleEditMode"
            x-small
            ><v-icon v-bind:name="">iconMDIName</v-icon></v-btn
          >
        </v-btn-toggle>
      </template>
      <span>tooltip</span>
    </v-tooltip>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from "vuex";
export default {
  props: {
    iconName: "",
    editMode: "",
  },
  methods: {
    ...mapGetters({
      getCurrentEditMode: "getCurrentEditMode",
    }),
    ...mapActions({
      setCurrentEditMode: "setCurrentEditMode",
    }),

    async $toggleEditMode() {
      if (this.getCurrentEditMode() === this.editMode) {
        await this.setCurrentEditMode(EditMode.SYMBOL);
        //        active = 1;
      } else {
        await this.setCurrentEditMode(this.editMode);
        active = 0;
      }
    },
  },
  computed: {
    iconMDIName: function () {
      return "mdi-" + this.iconName;
    },
    ...mapState({
      currentEditMode: (state) => {
        return state.lessonStore.operationMode.editMode;
      },
    }),
  },
  watch: {
    currentEditMode: {
      deep: true,
      handler(newVal) {
        if (newVal !== this.editMode) {
          this.active = 1;
        }
      },
    },
  },
  data: function () {
    return {
      active: 1,
    };
  },
};
</script>
