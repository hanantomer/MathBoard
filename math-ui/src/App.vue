<template>
  <v-app id="app">
    <v-app-bar
      style="align-items: flex-end; max-height: 55px"
      color="primary"
      dark
      dense
      elevation="7"
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title> <h4>Online Mathboard</h4></v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn
        v-show="!!user.id"
        icon
        v-bind:to="{ path: '/lessons/' + (!!user ? user.id : '') }"
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
          <v-avatar v-show="user.imageUrl" v-bind="attrs" v-on="on" size="36px"
            ><img v-bind:src="user.imageUrl"
          /></v-avatar>
        </template>
        <span v-show="!!user.firstName">{{ user.firstName }}</span>
      </v-tooltip>

      <span v-show="!!user.firstName && !user.imageUrl"
        >Hello {{ user.firstName }}</span
      >
    </v-app-bar>
    <v-content>
      <v-main>
        <v-container no-gutters fluid>
          <router-view></router-view>
        </v-container>
      </v-main>
    </v-content>
    <v-footer inset width="auto" class="py-12">
      <v-col class="text-center footer" cols="12">
        Math Teaching Platform © 2022 Copyright:<strong class="copyright">
          www.mathboard.com</strong
        >
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
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

.footer {
  color: aliceblue;
  background-color: gray;
}
.copyright {
  color: rgb(249, 249, 253);
}
</style>
