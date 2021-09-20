<template>
  <v-dialog v-model="dialog" persistent max-width="600px" min-width="360px">
    <div>
      <v-tabs
        v-model="tab"
        show-arrows
        background-color="deep-purple accent-4"
        icons-and-text
        dark
        grow
      >
        <v-tabs-slider color="purple darken-4"></v-tabs-slider>
        <v-tab v-for="tab in tabs" :key="tab.name">
          <v-icon large>{{ tab.icon }}</v-icon>
          <div class="caption py-1">{{ tab.name }}</div>
        </v-tab>
        <v-tab-item>
          <v-card class="px-4">
            <v-card-text>
              <v-form ref="loginForm" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="loginEmail"
                      :rules="loginEmailRules"
                      label="E-mail"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="loginPassword"
                      :append-icon="show1 ? 'eye' : 'eye-off'"
                      :rules="[rules.required, rules.min]"
                      :type="show1 ? 'text' : 'password'"
                      name="input-10-1"
                      label="Password"
                      hint="At least 8 characters"
                      counter
                      @click:append="show1 = !show1"
                    ></v-text-field>
                    <v-text-field
                      class="alerttext"
                      prepend-icon="mdi-account-alert"
                      v-if="loginFailed"
                      color="#F44336"
                      readonly
                      outlined
                      value="Invalid email or password"
                      prepend-inner-icon="mdi-error"
                    ></v-text-field>
                  </v-col>
                  <v-col class="d-flex" cols="12" sm="6" xsm="12"> </v-col>
                  <v-spacer></v-spacer>
                  <v-col class="d-flex" cols="12" sm="3" xsm="12" align-end>
                    <v-btn
                      x-large
                      block
                      :disabled="!valid"
                      color="success"
                      @click="validateLogin"
                    >
                      Login
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
              <div class="g-signin2" id="google-signin-btn"></div>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card class="px-4">
            <v-card-text>
              <v-form ref="registerForm" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="firstName"
                      :rules="[rules.required]"
                      label="First Name"
                      maxlength="20"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="lastName"
                      :rules="[rules.required]"
                      label="Last Name"
                      maxlength="20"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="email"
                      :rules="emailRules"
                      label="E-mail"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="password"
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      :rules="[rules.required, rules.min]"
                      :type="show1 ? 'text' : 'password'"
                      name="input-10-1"
                      label="Password"
                      hint="At least 8 characters"
                      counter
                      @click:append="show1 = !show1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      block
                      v-model="verify"
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      :rules="[rules.required, passwordMatch]"
                      :type="show1 ? 'text' : 'password'"
                      name="input-10-1"
                      label="Confirm Password"
                      counter
                      @click:append="show1 = !show1"
                    ></v-text-field>
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col class="d-flex ml-auto" cols="12" sm="3" xsm="12">
                    <v-btn
                      x-large
                      block
                      :disabled="!valid"
                      color="success"
                      @click="validateRegister"
                      >Register</v-btn
                    >
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </div>
  </v-dialog>
</template>

<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import constants from "../Mixins/constants";
export default {
  name: "Login",
  mixins: [constants],
  mounted() {
    gapi.signin2.render("google-signin-btn", {
      scope: "email",
      longtitle: true,
      theme: "dark",
      onsuccess: this.googleOnSuccess,
    });
  },
  methods: {
    ...mapGetters({ getUser: "getUser" }),
    ...mapActions({
      registerUser: "registerUser",
      setUser: "setUser",
      authLocalUserByPassword: "authLocalUserByPassword",
      authGoogleUser: "authGoogleUser",
    }),
    googleOnSuccess: async function (user) {
      this.dialog = false;
      this.$router.push("/");
    },
    validateRegister: async function () {
      if (this.$refs.registerForm.validate()) {
        let user = {};
        user.name = this.firstName;
        user.password = this.password;
        user.familyName = this.familyName;
        user.email = this.email;
        user.authType = this.authType.localToken;
        await this.registerUser(user);
        this.tab = "Login";
      }
    },
    validateLogin: async function () {
      if (this.$refs.loginForm.validate()) {
        let user = {
          email: this.loginEmail,
          password: this.loginPassword,
          authType: this.authType.localPassword,
        };
        let authenticatedUser = await this.authLocalUserByPassword(user);
        if (!!authenticatedUser) {
          authenticatedUser.authType = user.authType;
          await this.setUser(authenticatedUser);
          this.loginFailed = false;
          this.$cookies.set("token", authenticatedUser.token);
          this.$cookies.set("email", authenticatedUser.email);
          this.$router.push("/");
        } else {
          this.loginFailed = true;
        }
      }
    },
    reset: function () {
      this.$refs.form.reset();
    },
    resetValidation: function () {
      this.$refs.form.resetValidation();
    },
  },

  computed: {
    passwordMatch() {
      return () => this.password === this.verify || "Password must match";
    },
  },

  data: () => ({
    loginFailed: false,
    dialog: true,
    tab: 0,
    tabs: [
      { name: "Login", icon: "mdi-account" },
      { name: "Register", icon: "mdi-account-outline" },
    ],
    valid: true,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    verify: "",
    loginPassword: "",
    loginEmail: "",
    loginEmailRules: [
      (v) => !!v || "Required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    emailRules: [
      (v) => !!v || "Required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    show1: false,
    rules: {
      required: (value) => !!value || "Required.",
      min: (v) => (v && v.length >= 8) || "Min 8 characters",
    },
  }),
};
</script>
<style>
.alerttext input {
  color: red !important;
}
</style>
