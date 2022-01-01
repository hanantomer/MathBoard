<template>
  <v-app id="app">
    <div>
      <v-app-bar color="deep-purple accent-4" dense dark>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>

        <v-spacer></v-spacer>

        <v-btn
          v-show="!!user.id"
          icon
          v-bind:to="{ path: '/exercises/' + (!!user ? user.id : '') }"
        >
          <v-icon>mdi-home</v-icon>
        </v-btn>

        <v-tooltip bottom hidden>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-show="!!user.id"
              icon
              v-on="on"
              v-bind="attrs"
              v-on:click="signOut"
            >
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </template>
          <span>Sign Out</span>
        </v-tooltip>

        <v-tooltip bottom hidden>
          <template v-slot:activator="{ on, attrs }">
            <v-avatar
              v-show="user.imageUrl"
              v-bind="attrs"
              v-on="on"
              size="36px"
              ><img v-bind:src="user.imageUrl"
            /></v-avatar>
          </template>
          <span v-show="!!user.firstName">{{ user.firstName }}</span>
        </v-tooltip>
        <v-card-text
          class="text-right"
          v-show="!!user.firstName && !user.imageUrl"
          >Hello {{ user.firstName }}</v-card-text
        >
      </v-app-bar>
      <!-- <v-divider></v-divider> -->
      <v-main>
        <!-- Provides the application the proper gutter -->
        <v-container>
          <!-- If using vue-router -->
          <router-view></router-view>
        </v-container>
      </v-main>
      <v-footer></v-footer>
    </div>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import authMixin from "./Mixins/authMixin";
export default {
  name: "App",
  mixins: [authMixin],
  methods: {
    ...mapGetters({ getUser: "getUser" }),
    signOut: function () {
      this.mixin_signOut();
      this.$router.push("/login");
    },
    // signInViaGoogleAuth: async function () {
    //   let user = await this.authGoogleUser(this.googleUser);
    //   if (!!user) {
    //     return await this.setUser(user);
    //   } else {
    //     return await this.registerUser(...this.googleUser);
    //   }
    // },
  },
  computed: {
    user: function () {
      return this.getUser();
    },
  },
};
</script>
<style>
body {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

text {
  text-anchor: start;
  cursor: pointer;
  text-anchor: middle;
}
</style>
