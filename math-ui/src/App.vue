<template>
  <v-app id="app">
    <div>
      <v-app-bar color="deep-purple accent-4" dense dark>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>

        <v-spacer></v-spacer>

        <v-btn
          v-if="!!user.name"
          icon
          v-bind:to="{ path: '/exercises/' + user.id }"
        >
          <v-icon>mdi-home</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-on="on"
              v-bind="attrs"
              v-on:click="signOutFromGoogleAuth"
            >
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </template>
          <span>Sign Out</span>
        </v-tooltip>

        <v-tooltip bottom hidden>
          <template v-slot:activator="{ on, attrs }">
            <v-avatar
              v-if="!!user.imageUrl"
              v-bind="attrs"
              v-on="on"
              size="36px"
              ><img alt="user.name" v-bind:src="user.imageUrl"
            /></v-avatar>
          </template>
          <span v-if="!!user">{{ user.name }}</span>
        </v-tooltip>
        <v-card-text class="text-right" v-if="!!user.name && !user.imageUrl"
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
    signOutFromGoogleAuth: () => {
      gapi.auth2.getAuthInstance().signOut();
    },
  },
  computed: {
    user() {
      return this.getUser(); // add watcher?
    },
  },
  mounted: async function () {
    let token = this.$cookies.get("token");
    if (!!token) {
      this.authUser({ token: token }).then((res) => {
        if (!!res.data) {
          this.setUser({ ...res.data[0], isAuthenticated: true }); // TODO move this logic to data layer
        } else {
          this.$router.push("/login");
        }
      });
    } else {
      this.$router.push("/login");
    }

    gapi.load("auth2", () => {
      let user = null;

      console.log("get user from google");
      gapi.auth2.init().then((auth2) => {
        let user = {};
        if (auth2.currentUser.get().isSignedIn()) {
          let userProfile = auth2.currentUser.get().getBasicProfile();
          user.name = userProfile.getName();
          user.email = userProfile.getEmail();
          user.imageUrl = userProfile.getImageUrl();
          user.isAuthenticated = true;
          console.log("return user from google:" + user);
        }
        if (!!user) {
          //this.setUser(user);
        }
      });
    });
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
