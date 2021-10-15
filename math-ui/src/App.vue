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
import authMixin from "./Mixins/authMixin";
export default {
  name: "App",
  mixins: [authMixin],
  watch: {
    //$route: function (to, from) {
    //  if (to.path === "/") {
    //    this.signIn();
    //  }
    //},
  },
  methods: {
    ...mapGetters({ getUser: "getUser" }),
    ...mapActions({
      authLocalUserByToken: "authLocalUserByToken",
      authGoogleUser: "authGoogleUser",
      setUser: "setUser",
      registerUser: "registerUser",
    }),
    signIn: async function () {
      try {
        console.debug("load gapi");
        await gapi.load("client:auth2");
        console.debug("set user");
        await this.authMixin_setGoogleUser();

        //this.authMixin_setAuthorizationHeader();

        let user = await this.signInViaGoogleAuth();
        if (!user) {
          user = await this.signInViaLocalCookie();
        }
        if (!user) {
          this.$router.push("/login");
        }
      } catch (e) {
        console.debug(e);
      }
    },
    signOut: function () {
      this.authMixin_signOut();
      this.$router.push("/login");
    },
    signInViaLocalCookie: async function () {
      if (this.authMixin_signedInLocally()) {
        let user = await this.authLocalUserByToken({});
        if (!!user) {
          return await this.setUser({
            user,
          });
        }
      }
    },
    signInViaGoogleAuth: async function () {
      let user = await this.authGoogleUser(this.googleUser);
      if (!!user) {
        return await this.setUser({
          ...user,
          ...this.googleUser,
        });
      } else {
        return await this.registerUser({
          ...this.googleUser,
        });
      }
    },
  },
  computed: {
    user() {
      return this.getUser();
    },
  },
  mounted: async function () {
    let that = this;
    gapi.load("client:auth2", function () {
      that.signIn();
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
