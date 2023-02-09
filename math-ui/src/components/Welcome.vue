<template>
  <div style="width: 100%">
    <v-row>
      <v-col class="text-center" cols="12">
        <v-card flat>
          <v-card-title primary-title class="justify-center">
            <h3>Teach MATH online with Mathboard</h3>
          </v-card-title>
          <v-card-actions class="justify-center">
            <v-btn color="orange" v-on:click="openLoginDialog"
              >Get Started</v-btn
            >
          </v-card-actions>
        </v-card>
        <v-card flat class="justify-center">
          <v-list class="justify-center">
            <v-list-item-content>
              <v-list-item v-for="b in bullets" :key="b">
                <v-list-item-title>
                  <v-icon>mdi-check</v-icon>
                  {{ b }}
                </v-list-item-title>
              </v-list-item>
            </v-list-item-content>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "Welcome",
  methods: {
    openLoginDialog() {
      this.$router.push({
        path: "/login",
      });
    },
  },
  data: () => ({
    loginDialog: { dialog: false, tab: "Register" },
    bullets: [
      "Editable notations",
      "Board sharing with students",
      "Virtually call a student to the board",
      "Dispatch exercises and submit feedback",
    ],
  }),
};
</script>
<style>
.v-list-item__content {
  justify-content: center !important;
  text-align: left !important;
  display: grid !important;
}
</style>
