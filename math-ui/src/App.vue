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
    ...mapActions({ authUser: "authUser", setUser: "setUser" }),
    signedInWithGoogle: function () {
      return gapi.auth2.getAuthInstance().currentUser.get().isSignedIn();
    },
    signOut: async function () {
      if (this.signedInWithGoogle()) {
        gapi.auth2.getAuthInstance().signOut();
      } else {
        this.$cookies.set("token", null);
        await this.setUser(null);
      }
      this.$router.push("/login");
    },
    signInViaLocalCookie: async function () {
      let token = this.$cookies.get("token");
      if (!token || token == "undefined" || token == "null") {
        this.$router.push("/login");
        return;
      }

      this.authUser({ token: token })
        .then(async (res) => {
          if (!!res.data) {
            await this.setUser({ ...res.data[0], isAuthenticated: true }); // TODO move this logic to data layer
            return true;
          }
        })
        .catch(() => {
          this.$router.push("/login");
        });
    },

    signInViaGoogleAuth: async function () {
      await gapi.auth2.init().then(async (auth2) => {
        let googleUser = {};
        if (auth2.currentUser.get().isSignedIn()) {
          let userProfile = auth2.currentUser.get().getBasicProfile();
          googleUser.name = userProfile.getName();
          googleUser.email = userProfile.getEmail();
          googleUser.imageUrl = userProfile.getImageUrl();
          googleUser.isAuthenticated = true;
          if (!!googleUser) {
            await this.setUser(googleUser);
          }
        }
      });
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
    //imageUrl() {
    //  return this.$store.getters.getUser.imageUrl;
    //},
  },
  mounted: async function () {
    await this.loadGoogleAuth();
    await this.signInViaGoogleAuth();

    if (!this.getUser()) {
      this.signInViaLocalCookie();
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
