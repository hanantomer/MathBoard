<template>
  <v-app id="app">
    <div>
      <v-app-bar color="deep-purple accent-4" dense dark>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>

        <v-spacer></v-spacer>

        <v-btn
          v-show="user != null && user.id != null"
          icon
          v-bind:to="{ path: '/exercises/' + user.id }"
        >
          <v-icon>mdi-home</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-tooltip bottom hidden>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-show="user != null && user.id != null"
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
              v-show="user != null && user.imageUrl != null"
              v-bind="attrs"
              v-on="on"
              size="36px"
              ><img v-bind:src="user.imageUrl"
            /></v-avatar>
          </template>
          <span v-show="user != null && user.name != null">{{
            user.name
          }}</span>
        </v-tooltip>
        <v-card-text
          class="text-right"
          v-show="user != null && user.name != null && user.imageUrl == null"
          >Hello {{ user.name }}</v-card-text
        >
      </v-app-bar>
      <!-- <v-divider></v-divider> -->
      <v-main>
        <!-- Provides the application the proper gutter -->
        <v-container fluid>
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
export default {
  name: "App",
  methods: {
    ...mapGetters({ getUser: "getUser" }),
    ...mapActions({
      authUser: "authUser",
      setUser: "setUser",
      registerUser: "registerUser",
    }),

    signedInWithGoogle: function () {
      return gapi.auth2.getAuthInstance().currentUser.get().isSignedIn();
    },
    signOut: async function () {
      if (this.signedInWithGoogle()) {
        gapi.auth2.getAuthInstance().signOut();
      } else {
        this.$cookies.set("token", null);
      }
      await this.setUser(null);
      this.$router.push("/login");
    },
    signInViaLocalCookie: async function () {
      let token = this.$cookies.get("token");
      if (!!token) {
        let user = await this.authUser({ token: token });
        if (!!user) {
          return await this.setUser({ ...user, isAuthenticated: true });
        }
      }
    },
    signInViaGoogleAuth: async function () {
      let auth2 = await gapi.auth2.init();
      let googleUser = {};
      if (auth2.currentUser.get().isSignedIn()) {
        let userProfile = auth2.currentUser.get().getBasicProfile();
        googleUser.name = userProfile.getName();
        googleUser.email = userProfile.getEmail();
        googleUser.imageUrl = userProfile.getImageUrl();
        googleUser.id_token = auth2.currentUser.get().id_token;
        let user = await this.authUser(googleUser);
        if (!!user) {
          return await this.setUser({ ...user, isAuthenticated: true });
        } else {
          return await this.registerUser({
            ...googleUser,
            isAuthenticated: true,
          });
        }
      }
    },
    loadGoogleAuth: async function () {
      await new Promise((resolve) => {
        gapi.load("client:auth2", resolve);
      });
    },
  },
  computed: {
    user() {
      return this.getUser();
    },
  },
  mounted: async function () {
    await this.loadGoogleAuth();
    let user = await this.signInViaGoogleAuth();
    if (!user) {
      user = await this.signInViaLocalCookie();
    }
    if (!user) {
      this.$router.push("/login");
    }
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
