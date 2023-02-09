<template>
  <v-app id="app">
    <login :dialog="loginDialog" :type="loginType"></login>
    <v-app-bar
      style="max-height: 60px; padding-right: 10px"
      class="float-end"
      color="primary"
      dark
      dense
      elevation="8"
    >
      <v-img
        class="mx-2"
        :src="require('./assets/beta.png')"
        max-height="35"
        max-width="35"
        contain
      ></v-img>

      <v-img
        class="mx-2"
        :src="require('./assets/logo.png')"
        max-height="65"
        max-width="85"
        contain
      ></v-img>
      <v-toolbar-title>
        ONLINE <strong style="color: darkorange">MATHBOARD</strong>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- lessons -->
      <v-tooltip bottom hidden>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-show="!!user.id"
            icon
            v-on="on"
            v-bind="attrs"
            v-on:click="navToLessons"
          >
            <v-icon>mdi-archive-edit-outline</v-icon>
          </v-btn>
        </template>
        <span>Lessons</span>
      </v-tooltip>

      <!-- questions -->
      <v-tooltip bottom hidden>
        <template v-slot:activator="{ on }">
          <v-btn v-show="!!user.id" icon v-on="on" v-on:click="navToQuestions">
            <v-icon>mdi-message-question-outline</v-icon>
          </v-btn>
        </template>
        <span>Questions</span>
      </v-tooltip>

      <!-- answers -->
      <v-tooltip bottom hidden>
        <template v-slot:activator="{ on }">
          <v-btn v-show="teacher" icon v-on="on" v-on:click="navToAnswers">
            <v-icon>mdi-checkbox-marked-outline</v-icon>
          </v-btn>
        </template>
        <span>Answers</span>
      </v-tooltip>

      <!-- sign in / register -->
      <v-btn v-show="!user.id" icon v-on:click="openLoginDialog('Login')">
        <v-icon>mdi-account</v-icon>
        <span style="font-size: 0.7em">Sign In</span>
      </v-btn>

      <v-divider class="mx-6" vertical></v-divider>

      <v-btn v-show="!user.id" icon v-on:click="openLoginDialog('Register')">
        <v-icon>mdi-account-outline</v-icon>
        <span style="font-size: 0.7em">Register</span>
      </v-btn>

      <!-- user image or name -->
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
    </v-app-bar>
    <v-main>
      <v-container no-gutters fluid class="fill-height">
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-footer color="primary" padless dense>
      <v-col class="text-center" cols="12">
        <p style="color: white">© Copyright 2022 www.mathboard.com</p>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import Login from "./components/Login.vue";
import { mapGetters } from "vuex";
import authMixin from "./Mixins/authMixin";
export default {
  name: "App",
  components: { Login },
  mixins: [authMixin],
  mounted: function () {
    window.removeEventListener("keyup", this.onKeyUp);
    window.addEventListener("keyup", this.onKeyUp);
    window.removeEventListener("paste", this.onKeyUp);
    document.addEventListener("paste", this.onPaste);
  },
  destroyed: function () {
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("paste", this.onKeyUp);
  },

  data: () => ({
    loginDialog: null,
    loginType: null,
  }),
  methods: {
    ...mapGetters({ getUser: "getUser", isTeacher: "isTeacher" }),
    openLoginDialog(tab) {
      this.loginDialog = true;
      this.loginType = "Login";
    },
    onKeyUp: function (key) {
      this.$root.$emit("keyup", key);
    },
    onPaste: function (e) {
      this.$root.$emit("paste", e);
    },
    signOut: function () {
      this.mixin_signOut();
      this.$router.push("/login");
    },
    navToLessons: function () {
      this.$router.push("/lessons");
    },
    navToQuestions: function () {
      this.$router.push("/questions");
    },
    navToAnswers: function () {
      this.$router.push("/answers");
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
    teacher: function () {
      return this.isTeacher();
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
